/**
 * Log Object---Curve inhert from _BaseObject
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.LinearGrid = S.Class({ extend: this.BaseObject }, {
        parse: function(objFmt) {
            this.visible = objFmt.Visible;
            this.thickness = this.lg3Format.toCssThickness(objFmt.Thickness);
            this.lineStyle = this.lg3Format.toContextLineDash(objFmt.LineStyle);
            this.color = this.lg3Format.toContextColor(objFmt.Color);
            this.lineCount = objFmt.LineCount;
        },

        draw: function(context, trackRect) {
            if (!this.visible || !this.thickness || this.lineCount <= 2) {
                return;
            }

            var top = trackRect.y;
            var bottom = trackRect.y + trackRect.h;
            var gridSep = (trackRect.w) / (this.lineCount - 1);
            context.beginPath();
            context.setLineDash(this.lineStyle);
            context.strokeStyle = this.color;
            context.lineWidth = this.thickness;

            var gridPos = trackRect.x + gridSep;
            var count = this.lineCount - 1;
            if (this.thickness > 1) {
                gridPos = trackRect.x + gridSep;
                count = this.lineCount;
            }

            for (var lineNum = 1; lineNum < count; lineNum++) {
                if (gridPos >= trackRect.x + trackRect.w){
                    gridPos += gridSep;
                    continue;
                }
                context.moveTo(gridPos, top);
                context.lineTo(gridPos, bottom);
                gridPos += gridSep;
            }
            context.stroke();
        }

    });
});