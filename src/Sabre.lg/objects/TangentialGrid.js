/**
 * Log Object---Curve inhert from _BaseObject
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.TangentialGrid = S.Class({ extend: this.BaseObject }, {
        parse: function(objFmt) {
            this.visible = objFmt.Visible;
            this.majorGridThickness = this.lg3Format.toCssThickness(objFmt.MajorGridThickness);
            this.minorGridThickness = this.lg3Format.toCssThickness(objFmt.MinorGridThickness);
            this.majorLineStyle = this.lg3Format.toContextLineDash(objFmt.MajorGridLineStyle);
            this.minorGridStyle = this.lg3Format.toContextLineDash(objFmt.MinorGridLineStyle);
            this.color = this.lg3Format.toContextColor(objFmt.Color);
            this.logScale = objFmt.LogScale;
            this.decadeCount = objFmt.DecadeCount;
            this.reverse = objFmt.reverse;

        },

        draw: function(context, trackRect) {
            if (!this.visible) {
                return;
            }

            var top = trackRect.y;
            var bottom = trackRect.y + trackRect.h;
            var trackWidth = trackRect.w;
            var wrapInfo = {
                wrapCount: 0,
                mode: 'NONE',
                actualCount: 0
            };
            var scale = {
                left: 0,
                right: 90,
                transform: 'TANGENTIAL'
            };

            context.beginPath();
            context.setLineDash(this.minorGridStyle);
            context.strokeStyle = this.color;
            context.lineWidth = this.minorGridThickness;

            var major;
            var gridPos;
            for (major = 0; major < 90; major = major + 10) {
                var step = (major >= 60) ? 5 : 2;
                for (var minor = 0; minor <= 10; minor = minor + step) {
                    gridPos = this.wrapAndScaleValue(major + minor, scale, wrapInfo);
                    gridPos = gridPos * trackWidth + args.trackLeft;
                    context.moveTo(gridPos, top);
                    context.lineTo(gridPos, bottom);
                }
            }
            context.stroke();
            context.beginPath();
            context.setLineDash(this.majorGridStyle);
            context.lineWidth = this.majorGridThickness;
            for (major = 0; major <= 90; major = major + 10) {
                gridPos = lg3.wrapAndScaleValue(major, scale, wrapInfo);
                gridPos = gridPos * trackWidth + args.trackLeft;
                if (gridPos <= trackRect.x || gridPos >= trackRect.x + trackRect.w) {
                    unitLine++;
                    continue;
                }
                context.moveTo(gridPos, top);
                context.lineTo(gridPos, bottom);
            }
            context.stroke();
        }
    });
});