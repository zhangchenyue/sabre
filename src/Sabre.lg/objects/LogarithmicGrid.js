/**
 * Log Object---Curve inhert from _BaseObject
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.LogarithmicGrid = S.Class({ extend: this.BaseObject }, {
        parse: function(objFmt) {
            this.visible = objFmt.Visible;
            this.thickness = this.lg3Format.toCssThickness(objFmt.Thickness);
            this.lineStyle = this.lg3Format.toContextLineDash(objFmt.LineStyle);
            this.color = this.lg3Format.toContextColor(objFmt.Color);
            this.logScale = objFmt.LogScale;
            this.decadeCount = objFmt.DecadeCount;
            this.reverse = objFmt.reverse;

        },

        draw: function(context, trackRect) {
            if (!this.visible || !this.thickness) {
                return;
            }

            var top = trackRect.y;
            var bottom = trackRect.y + trackRect.h;
            var trackWidth = trackRect.w;

            var gridPos;
            context.beginPath();
            context.setLineDash(this.lineStyle);
            context.strokeStyle = this.color;

            var maxLogScale = this.logScale * Math.pow(10, this.decadeCount);
            var wrapInfo = {
                wrapCount: 10,
                mode: 'NONE',
                actualCount: 0
            };
            var scale = {
                left: (this.reverse) ? maxLogScale : this.logScale,
                right: (this.reverse) ? this.logScale : maxLogScale,
                transform: 'LOGARITHMIC'
            };

            var value = this.logScale;
            var unitLine = this.logScale;
            var decPow = 1;

            context.lineWidth = this.thickness;

            while (value < maxLogScale) {
                if (unitLine > 9) {
                    unitLine = 1;
                    decPow *= 10;
                }
                value = unitLine * decPow;
                gridPos = this.wrapAndScaleValue(value, scale, wrapInfo);
                gridPos = gridPos * trackWidth + trackRect.x;
                if (gridPos <= trackRect.x || gridPos >= trackRect.x + trackRect.w) {
                    unitLine++;
                    continue;
                }
                context.moveTo(gridPos, top);
                context.lineTo(gridPos, bottom);
                unitLine++;
            }
            context.stroke();
        }

    });
});