/**
 * Log Object---VDL inhert from _BaseObject
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.VDL = S.Class({ extend: this.BaseObject }, {
        parse: function(objFmt) {
            this.channelName = objFmt.ChannelName || '---';
            this.thickness = this.lg3Format.toCssThickness(objFmt.LineThickness);
            this.durationLength = parseFloat(this.lg3Format.getObjPropertyByUnitSystem('DurationLength', objFmt, 'Duration'));
            this.durationStart = parseFloat(this.lg3Format.getObjPropertyByUnitSystem('StartDuration', objFmt, 'Duration'));
            this.durationUnit = this.lg3Format.getObjPropertyByUnitSystem('@Unit', objFmt, 'Duration') || '';
            var crScaleObj = this.lg3Format.parseColorScale(this.objFormat)
            if (crScaleObj) {
                this.amplitudeMax = crScaleObj.thresholds[crScaleObj.thresholds.length - 1];
                this.amplitudeMin = crScaleObj.thresholds[0];;
                this.amplitudeUnit = this.objFormat.StaticThreshold.ThresholdUnit ? this.objFormat.StaticThreshold.ThresholdUnit : '';
                this.colors = crScaleObj.colors;
            } else {
                this.amplitudeMax = parseFloat(this.lg3Format.getObjPropertyByUnitSystem('MaxAmplitude', objFmt, 'Amplitude'));
                this.amplitudeMin = parseFloat(this.lg3Format.getObjPropertyByUnitSystem('MinAmplitude', objFmt, 'Amplitude'));
                this.amplitudeUnit = this.lg3Format.getObjPropertyByUnitSystem('@Unit', objFmt, 'Amplitude') || '';
            }
            this.lineColor = this.lg3Format.toContextColor(objFmt.LineColor);
            this.fillColor = this.lg3Format.toContextColor(objFmt.FillColor);
            this.fillMode = objFmt.FillMode;
        },

        drawInsert: function(context, objRect) {
            if (!this.visibleInInsert)
                return;

            var topRect = { x: objRect.x, y: objRect.y, w: objRect.w, h: objRect.h * 0.5, };
            var bottomRect = { x: objRect.x, y: objRect.y + objRect.h * 0.5, w: objRect.w, h: objRect.h * 0.5, };
            var linePosTop = this.insertTextLinePos(topRect);
            var linePosBottom = this.insertTextLinePos(bottomRect);
            var ampWidth = this.getAmplitudeCtxWidth(context);

            //draw channel name text
            this.drawText(context,
                this.channelName,
                objRect.x + (objRect.w / 2.0),
                linePosTop[0].middle,
                {
                    alignment: 'center',
                    valignBaseline: 'middle',
                    color: 'black',
                    backgroundColor: undefined,
                    width: objRect.w
                }
            );

            //draw preview image
            var gridLeft = 0;
            var gridRight = 3;
            var imgRect = {
                x: objRect.x + this.cellPadding,
                y: objRect.y + objRect.h / 2 - objRect.h / 4,
                w: objRect.w - 2 * this.cellPadding - ampWidth,
                h: objRect.h / 2
            };
            var img = this.createPreviewImg(imgRect.w, imgRect.h, gridLeft, gridRight);

            context.drawImage(img, imgRect.x, imgRect.y, imgRect.w, imgRect.h);

            //draw duration text
            context.textAlign = 'left';
            context.fillText(this.durationStart, imgRect.x + gridLeft, linePosBottom[1].middle);
            context.textAlign = 'middle';
            context.fillText(this.durationUnit, imgRect.x + imgRect.w / 2, linePosBottom[1].middle);
            context.textAlign = 'right';
            context.fillText(this.durationStart + this.durationLength, imgRect.x + imgRect.w - gridRight, linePosBottom[1].middle);
            //draw amplitude text
            context.fillText(this.amplitudeMax, objRect.x + objRect.w - this.cellPadding, imgRect.y);
            context.fillText(this.amplitudeUnit, objRect.x + objRect.w - this.cellPadding, imgRect.y + imgRect.h / 2);
            context.fillText(this.amplitudeMin, objRect.x + objRect.w - this.cellPadding, imgRect.y + imgRect.h);

            S.lg.VDL.callSuper(this, 'drawInsert', context, objRect); // border, solid, black etc
        },

        draw: function() {

        },

        getInsertHeight: function(lineHeight) {
            if (!this.visibleInInsert)
                return 0;

            lineHeight = lineHeight || S.lg.CT_INSERT_LINEHEIGHT;
            return 2 * lineHeight;
        },

        getAmplitudeCtxWidth: function(context) {
            return Math.max.apply(Math, [context.measureText(this.amplitudeUnit).width,
                context.measureText(this.amplitudeMin).width,
                context.measureText(this.amplitudeMax).width]) || 0;
        },

        createPreviewImg: function(width, height) {
            return this.lg3Format.colorMapPreviewImg(this.colors, width, height, true)
        }
    });
});