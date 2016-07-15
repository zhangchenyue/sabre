/**
 * Area
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.Area = S.Class({
        init: function(options) {
            this.topIndex = options.topIndex;
            this.bottomIndex = options.bottomIndex;
            this.absentInterval = options.absentInterval; // without intervention, all dots are connected.
            this.indexInit = options.indexInit;
            this.dataManager = options.dataManager;
            this.dataIncreasing = true;
            this.passIds = [];
            this.tiles = [];
            this.displayTimerId = undefined;
            this.tracks = [];
            this.indexLines = [];
            this.setLogFormat(options.lg3Fmt);
            //DOM struct
            this.div = S.dom.create('div');
            this.div.style.position = 'relative';
            this.div.style['border'] = '1px solid grey';
            S.dom.addClass(this.div, 'sabre-area');
        },

        getDom: function() {
            return this.div;
        },
        
        setDataManager:function(dm){
            this.dataManager = dm;    
        },
        
        setLogFormat: function(fmt) {
            if (!fmt)
                return;

            this.lg3Fmt = fmt;

            //init indexline objects
            this.indexLines = [];
            var fmtIndexGrid = this.lg3Fmt.getObjectStruct('IndexGrid');
            var fmtIndexLine = fmtIndexGrid ? fmtIndexGrid['IndexLine'] : [];
            fmtIndexLine.forEach(function(indexLineFmt) {
                var indexLineObj = S.lg.IndexLine({
                    objFormat: indexLineFmt,
                    lg3Format: this.lg3Fmt,
                    tileTopIndex: this.topIndex,
                    tileBottomIndex: this.bottomIndex,
                    tileIndexUnit: this.indexUnit
                });
                this.indexLines.push(indexLineObj);
            }, this);

            //init track objects
            this.tracks = [];
            this.lg3Fmt.getObjectStruct('Track').forEach(function(trackFmt) {
                var track = S.lg.Track({ objFormat: trackFmt, lg3Format: this.lg3Fmt, unitSystem: this.lg3Fmt.unitSystem });
                this.tracks.push(track);
            }, this);
        },

        draw: function() {
            this.tiles.forEach(function(tile) {
                tile.draw(this.tracks, this.dataManager);
            }, this);
        },

        drawGrid: function() {
            this.prepareTiles();
            this.tiles.forEach(function(tile) {
                tile.drawGrid(this.tracks, this.indexLines);
            }, this);
        },

        isIndexIncreasing: function() {
            return (this.bottomIndex - this.topIndex) > 0;
        },

        getIndexForIndexPos: function(forIndexPos) {
            // yPos is within and relative to Area.div coordinate system (standard 0,0 top left)
            return this.topIndex + (this.bottomIndex - this.topIndex) * forIndexPos / this.div.clientHeight;
        },

        setIndexRange: function(topIndex, bottomIndex, indexUnit, absentInterval) {
            //top and bottom indexes will have the same indexunti as allthe data passed in.
            //this is independant to the unit used for display (logFormat.IndexUnit)
            this.topIndex = topIndex;
            this.bottomIndex = bottomIndex;
            this.indexUnit = indexUnit; // matches the data indexes
            this.absentInterval = absentInterval;
            var scale = this.lg3Fmt.getScaleObj();
            this.setVerticalScale(scale);
        },

        setVerticalScale: function(scaleObj) {
            var fullInterval = Math.abs(this.topIndex - this.bottomIndex);
            if (isNaN(fullInterval)) return;
            if (fullInterval === 0) return;
            var unitConvertor = S.lg.UnitConvertor({ from: '', to: '' });
            var indexFactor = this.lg3Fmt.getObjectTextValue(scaleObj.IndexFactor);
            var indexFactorUnit = scaleObj.IndexFactor["@Unit"] || 'ft';
            var indexFactorIndexUnit = unitConvertor.convert(indexFactor, indexFactorUnit, this.indexUnit);

            var paperFactor = this.lg3Fmt.getObjectTextValue(scaleObj.PaperFactor);
            var paperFactorUnit = scaleObj.PaperFactor["@Unit"] || 'ft';
            var paperFactorInches = unitConvertor.convert(paperFactor, paperFactorUnit, "in");

            var indexPerInch = indexFactorIndexUnit / paperFactorInches;
            // scale is if per inch
            //i.e. 100 ft log per 6 in "paper"
            var logLengthInches = fullInterval / indexPerInch;
            var logLengthPoints = logLengthInches * 120;

            //TODO: Provisoinal safety put in place until rolling Tiles are implimented.
            logLengthPoints = Math.min(S.lg.CT_MAX_AREA_HEIGHT, logLengthPoints);
            this.div.style.height = logLengthPoints + 'px';
        },

        prepareTiles: function() {
            var divHeight = this.div.offsetHeight;
            var divWidth = this.div.offsetWidth;
            var fullRect = { x: 0, y: 0, w: divWidth, h: divHeight };
            var tilesX = Math.ceil(divWidth / S.lg.CT_MAX_TILE_WIDTH);
            var tilesY = Math.ceil(divHeight / S.lg.CT_MAX_TILE_HEIGHT);
            var tileCount = tilesX * tilesY;
            //remove old unused Tiles,reuse old Tiles when posible
            if (this.tiles.length > tileCount) {
                while (this.tiles.length > tileCount) {
                    var lastTile = this.tiles[this.tiles.length - 1];
                    lastTile.cvs.parentNode.removeChild(lastTile.cvs);
                    this.tiles.pop();
                }
            } else { //add new tiles
                var frag = document.createDocumentFragment();
                while (this.tiles.length < tileCount) {
                    this.tiles.push(new S.lg.Tile(frag));
                }
                this.div.appendChild(frag);
            }

            var tileNum = 0;
            var xPos = 0;
            var yPos = 0;
            for (var y = 0; y < tilesY; y++) {
                xPos = 0;
                var tileHeight = S.lg.CT_MAX_TILE_HEIGHT;
                if ((this.isIndexIncreasing() && ((!this.dataIncreasing && y == 0) || (this.dataIncreasing && y == tilesY - 1))) ||
                    (!this.isIndexIncreasing() && ((this.dataIncreasing && y == 0) || (!this.dataIncreasing && y == tilesY - 1)))) {
                    tileHeight = divHeight - (tilesY - 1) * S.lg.CT_MAX_TILE_HEIGHT;
                }
                for (var x = 0; x < tilesX; x++) {
                    var tileWidth = S.lg.CT_MAX_TILE_WIDTH;
                    if ((xPos + tileWidth) > divWidth) {
                        tileWidth = divWidth - xPos;
                    }
                    var tile = this.tiles[tileNum];
                    tile.setRect({ x: xPos, y: yPos, w: tileWidth, h: tileHeight });
                    tile.topIndex = this.getIndexForIndexPos(tile.rect.y);
                    tile.bottomIndex = this.getIndexForIndexPos(tile.rect.y + tile.rect.h);
                    tile.indexUnit = this.indexUnit;
                    tile.fullRect = fullRect;
                    tile.lg3Format = this.lg3Fmt
                    xPos += tileWidth;
                    tileNum++;
                }
                yPos += tileHeight;
            }
        },
    });
});