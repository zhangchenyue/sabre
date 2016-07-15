/**
 * Log Object---AreaFill inhert from _BaseObject
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.AreaFill = S.Class({ extend: this.BaseObject }, {
        parse: function(objFmt) {
            this.patternNumber = objFmt.PatternNumber || 0;
            this.patterns = S.lg.CT_STD_PATTERN;
            this.description = objFmt.Description || '';
            this.foregroundColor = this.rgbaColorFromStColor(objFmt.ForegroundColor);
            this.backgroundColor = this.rgbaColorFromStColor(objFmt.BackgroundColor);
        },

        drawInsert: function(context, objRect) {
            if (!this.visibleInInsert)
                return;
                
            var bgLum = 255; // white if nothing else
            var frgba = 'black';
            var brgba = 'white';
            var patternObj = this.patterns[this.patternNumber];
            if (patternObj) {
                frgba = this.foregroundColor || frgba;
                brgba = this.backgroundColor || brgba;
                var patternImage = this.imageFromBitPattern(
                    patternObj.BitPattern,
                    patternObj.Width,
                    patternObj.Height,
                    this.backgroundColor,
                    this.foregroundColor
                );
                bgLum = this.imgLum(patternImage);
                context.beginPath();
                context.rect(objRect.x, objRect.y, objRect.w, objRect.h);
                this.fillWithImage(patternImage, context);
            }

            var fcLum = this.colorLum(frgba);
            var bcLum = this.colorLum(brgba);

            if (this.description) {
                context.save();
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                var margin = 2;
                var textWidth = objRect.w - (2 * margin);
                var textColor, bgFillColor;

                if (bgLum < 128) {
                    textColor = 'white';
                } else {
                    textColor = 'black';
                }

                if (Math.abs(fcLum - bgLum) < Math.abs(bcLum - bgLum)) {
                    bgFillColor = 'rgb(' + frgba[0] + ',' + frgba[1] + ',' + frgba[2] + ')';
                } else {
                    bgFillColor = 'rgb(' + brgba[0] + ',' + brgba[1] + ',' + brgba[2] + ')';
                }

                this.drawText(context, this.description, objRect.x + (objRect.w / 2.0), objRect.y + objRect.h * 0.5,
                    {
                        alignment: 'center',
                        valignBaseline: 'middle',
                        color: textColor,
                        backgroundColor: bgFillColor,
                        width: textWidth
                    });

                context.restore();
            }
            S.lg.AreaFill.callSuper(this, 'drawInsert', context, objRect); // border, solid, black etc
        },

        draw: function() {

        },

        getInsertHeight: function(lineHeight) {
            if (!this.visibleInInsert)
                return 0;

            return lineHeight || S.lg.CT_INSERT_LINEHEIGHT;
        }
    });
});