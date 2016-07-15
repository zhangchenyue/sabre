/**
 * Log Insert
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'
    var sDom = S.dom,
        sEvent = S.event;

    this.Insert = S.Class({
        init: function(options) {
            this.fromBottom = options.fromBottom || false;
            this.lineHeight = options.lineHeight || S.lg.CT_INSERT_LINEHEIGHT;
            this.textLineHeight = options.textLineHeight || S.lg.CT_INSERT_TEXTLINEHEIGHT;
            this.tracks = [];
            this.setLogFormat(options.lg3Fmt)
            //dom structure
            this.div = sDom.create('div');
            this.div.style.width = options.width || '100%';
            sDom.addClass(this.div, 'sabre-lg-insert');
            this.cvs = sDom.create('canvas');
            this.ctx = this.cvs.getContext('2d');
            this.ctx.scale(S.lg.CT_CANVAS_RATIO, S.lg.CT_CANVAS_RATIO);
            this.cvs.style.width = options.width || '100%';
            this.div.appendChild(this.cvs);
        },

        setLogFormat: function(fmt) {
            if (!fmt)
                return;

            this.lg3Fmt = fmt;
            this.tracks = [];
            this.lg3Fmt.getObjectStruct('Track').forEach(function(trackFmt) {
                var track = S.lg.Track({ objFormat: trackFmt, lg3Format: this.lg3Fmt, unitSystem: this.lg3Fmt.unitSystem });
                this.tracks.push(track);
            }, this);
        },

        draw: function(w, h, font) {
            w = w || this.getWidth();
            h = h || this._computeHeight({ x: 0, y: 0, w: this.getWidth(), h: this.getHeight() });
            if (!w || !h)
                return;

            this.div.style.height = h + 'px';
            this.cvs.style.height = this.div.style.height;
            this.cvs.width = w * S.lg.CT_CANVAS_RATIO;
            this.cvs.height = h * S.lg.CT_CANVAS_RATIO;
            //for canvas if width or height changed, the context scale need to reassigned
            this.ctx.scale(S.lg.CT_CANVAS_RATIO, S.lg.CT_CANVAS_RATIO);

            this.ctx.font = font || S.lg.CT_INSERT_FONT;
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'black';

            var rect = { x: 0, y: 0, w: w, h: h };
            //draw log object insert
            this.tracks.forEach(function(oTrack) {
                var tRect = oTrack.computeInsertOccupiedRect(rect);
                tRect.y = (this.fromBottom) ? rect.y + rect.h : 0;
                oTrack.drawInsert(this.ctx, tRect, this.fromBottom, this.lineHeight, this.textLineHeight);
            }, this);

            this.drawDescription(rect);
        },

        drawDescription: function(rect) {
            var infoRect = {
                x: rect.x,
                y: this.fromBottom ? rect.y : rect.y + rect.h - this.textLineHeight,
                w: rect.w,
                h: this.textLineHeight
            };
            infoRect = S.lg.insetRect(infoRect, 4, 0);
            this.ctx.save();
            this.ctx.lineWidth = 1;
            this.ctx.fillStyle = 'black';
            this.ctx.textBaseline = 'middle';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(this.lg3Fmt.struct.Description || "", infoRect.x, infoRect.y + infoRect.h / 2);
            this.ctx.restore();
        },

        getDom: function() {
            return this.div;
        },

        getWidth: function() {
            return this.div.offsetWidth;
        },

        getHeight: function() {
            return this.div.offsetHeight;
        },

        exportBase64Image: function(width, height) {
            this.draw(width, height);
            var image = new Image();
            image.src = this.cvs.toDataURL("image/png");
            image.width = width || this.getWidth();
            image.height = height || this.getHeight();
            return image;
        },

        _onResize: function() {
            this.draw();
        },

        _bindHandler: function() {
            sEvent.on(this, S.lg.WINDOW_RESIZE_EVENT, S.bind(this._onResize, this));
        },

        _computeHeight: function(rect, lineHeight, textLineHeight) {
            rect = rect || { x: 0, y: 0, w: this.cvs.offsetWidth, h: this.cvs.offsetHeight }
            lineHeight = lineHeight || S.lg.CT_INSERT_LINEHEIGHT;
            textLineHeight = textLineHeight || S.lg.CT_INSERT_TEXTLINEHEIGHT;
            var unionRect = { x: 0, y: 0, w: rect.w, h: 0 };

            this.tracks.forEach(function(oTrack) {
                var rt = oTrack.computeInsertOccupiedRect(rect, lineHeight, textLineHeight);
                unionRect = S.lg.unionRects(unionRect, rt);
            }, this);

            //for log description
            unionRect.h += textLineHeight

            return unionRect.h;
        }
    });
});