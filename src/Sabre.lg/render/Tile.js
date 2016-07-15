/**
 * Tile
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.Tile = S.Class({
        init: function(container, topIndex, bottomIndex, lg3Format) {
            this.cvs = S.dom.create('canvas');
            this.ctx = this.cvs.getContext('2d');
            this.rect = { x: 0, y: 0, w: 1, h: 1 };//placeholder: rect occupied by this tile
            this.fullRect = { x: 0, y: 0, w: 10, h: 10 };//placeholder: full rect (occupied by all Tiles)
            this.topIndex = topIndex;
            this.bottomIndex = bottomIndex;
            this.isRendered = false;
            this.lg3Format = lg3Format;
            this.initStyle();
            if (container && S.type.isFunction(container.appendChild)) {
                container.appendChild(this.cvs);
            }
        },

        draw: function(oTracks, dataManager) {
            if (!S.type.isArray(oTracks))
                return;

            oTracks.forEach(function(oTrack) {
                var tRect = oTrack.getRect(this.fullRect);
                this.ctx.save();
                this.ctx.rect(tRect.x, tRect.y, tRect.w, tRect.h);
                this.ctx.clip();
                //draw log object exclude grid
                oTrack.objList.forEach(function(obj) {
                    var objName = obj.name;
                    if (objName.indexOf('Grid') < 0) {
                        obj.draw(this, tRect, dataManager);
                    }
                }, this);

                this.ctx.restore();
            }, this);
        },

        drawGrid: function(oTracks, oIndexLines) {
            if (!S.type.isArray(oTracks) || !S.type.isArray(oIndexLines))
                return;

            oTracks.forEach(function(oTrack) {
                var tRect = oTrack.getRect(this.fullRect);
                this.ctx.save();
                //draw track border
                this.ctx.lineWidth = 0;
                this.ctx.beginPath();
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = 'black';
                var trackRight = tRect.x + tRect.w - 1;
                if (trackRight !== this.fullRect.w - 1) {
                    this.ctx.moveTo(trackRight, 0)
                    this.ctx.lineTo(trackRight, this.fullRect.h)
                }
                this.ctx.stroke();

                //draw indexline
                if (oTrack.indexLinesVisible || oTrack.indexNumbersVisible) {
                    oIndexLines.forEach(function(oIndexLine) {
                        oIndexLine.indexLinesVisible = oTrack.indexLinesVisible;
                        oIndexLine.indexNumbersVisible = oTrack.indexNumbersVisible;
                        oIndexLine.tileTopIndex = this.topIndex;
                        oIndexLine.tileBottomIndex = this.bottomIndex;
                        oIndexLine.draw(this.ctx, tRect, this.rect);
                    }, this);
                }

                //draw grid
                ['LinearGrid', 'LogarithmicGrid', 'TangentialGrid'].forEach(function(gridName) {
                    oTrack.objList.forEach(function(obj) {
                        if (obj.name == gridName) {
                            obj.draw(this.ctx, tRect);
                        }
                    }, this);
                }, this);
            }, this);
        },

        setRect: function(rt) {
            this.rect.x = rt.x;
            this.rect.y = rt.y;
            this.rect.w = rt.w;
            this.rect.h = rt.h;
            this.cvs.style.left = this.rect.x + 'px';
            this.cvs.style.top = this.rect.y + 'px';
            this.cvs.style.width = this.rect.w + 'px';
            this.cvs.style.height = this.rect.h + 'px';
            this.cvs.width = this.rect.w * S.lg.CT_CANVAS_RATIO;
            this.cvs.height = this.rect.h * S.lg.CT_CANVAS_RATIO;
            this.ctx.scale(S.lg.CT_CANVAS_RATIO, S.lg.CT_CANVAS_RATIO);
            this.ctx.translate(-this.rect.x, -this.rect.y);
        },

        initStyle: function() {
            this.cvs.style.position = 'absolute';
            S.dom.addClass(this.cvs, 'sabre-tile');
            this.setRect(this.rect);
        }

    });
});