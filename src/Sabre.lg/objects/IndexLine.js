/**
 * Log Object---Curve inhert from _BaseObject
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.IndexLine = S.Class({ extend: this.BaseObject }, {
        parse: function(objFmt) {
            this.spacing = this.lg3Format.getObjectValueByUnitSystem('Spacing', this.lg3Format.unitSystem, objFmt, this.tileIndexUnit);
            this.spacingDisplay = this.lg3Format.getObjectValueByUnitSystem('Spacing', this.lg3Format.unitSystem, objFmt, this.indexUnit);
            this.indexNumber = objFmt.IndexNumber;
            this.color = this.lg3Format.toContextColor(objFmt.Color);
            this.thickness = this.lg3Format.toCssThickness(objFmt.Thickness);
            this.lineStyle = this.lg3Format.toContextLineDash(objFmt.LineStyle);
            this.fontReference = this.indexNumber ? this.lg3Format.getFontReference(this.indexNumber.FontReference) : null;
            this.textFormat = this.lg3Format.getObjectTextValue(this.lg3Format.getObjectValueByUnitSystem("TextFormatting", this.lg3Format.unitSystem, objFmt, this.indexUnit));
        },

        draw: function(context, trackRect, tileRect) {
            if (this.spacing <= 0) {
                return;
            }
            //showLines & show numbers are passed as parameters to allow the caller to verride them
            var displayIndexUnit = this.indexUnit;
            var displayIndexConverter = S.lg.UnitConvertor({ from: this.tileIndexUnit, to: displayIndexUnit });

            var tileTopIndex = this.tileTopIndex;
            var tileBottomIndex = this.tileBottomIndex;
            context.beginPath();
            var minIndex = Math.min(tileTopIndex, tileBottomIndex);
            var maxIndex = Math.ceil(Math.max(tileTopIndex, tileBottomIndex) / this.spacing) * this.spacing;
            var minIndexDisplay = displayIndexConverter.convert(minIndex);
            var firstIndexDisplay = (Math.floor(minIndexDisplay / this.spacingDisplay) * this.spacingDisplay) - this.spacingDisplay;
            var firstIndex = displayIndexConverter.convert(firstIndexDisplay, displayIndexUnit, this.tileIndexUnit);;
            // while the work will be done in data index units, we need to stat at a display index border
            while (firstIndex < minIndex) {
                firstIndex += this.spacing;
            }

            var indexOfLine = firstIndex;
            var yPosOfLine = 0;
            context.strokeStyle = this.color;
            context.lineWidth = this.thickness;
            context.setLineDash(this.lineStyle);
            var left = trackRect.x;
            var right = trackRect.x + trackRect.w;
            var tWidth = trackRect.w;
            var margin = 0.1 * tWidth;
            var textPos = left;
            if (this.indexLinesVisible || (this.indexNumbersVisible && this.indexNumber)) {
                while (indexOfLine <= maxIndex) {
                    yPosOfLine = tileRect.y + (indexOfLine - tileTopIndex) * tileRect.h / (this.tileBottomIndex - tileTopIndex);
                    yPosOfLine = Math.floor(yPosOfLine);
                    if (this.indexLinesVisible) {
                        if (yPosOfLine > trackRect.y && yPosOfLine < trackRect.y + trackRect.h) {
                            context.moveTo(trackRect.x, yPosOfLine);
                            context.lineTo(trackRect.x + trackRect.w, yPosOfLine);
                        }
                    }

                    if (this.indexNumbersVisible && this.indexNumber) {
                        var indexText = indexOfLine;
                        switch (this.domain) {
                            case 'TIME':
                                indexText = this.doubleToUTCDate(indexOfLine);
                                indexText = this.formatValue(indexText, this.textFormat);
                                break;
                            case 'TRUE_VERTICAL_DEPTH':
                                indexText = this.formatValue(indexText, this.textFormat);
                                indexText += this.indexUnit;
                                indexText += '\nTVD';
                                break;
                            default:
                                indexText = this.formatValue(indexText, this.textFormat);
                                indexText += this.indexUnit;
                                break;
                        }

                        indexText = this.formatValue(indexText, this.textFormat);
                        context.textAlign = this.indexNumber.Alignment.toLowerCase();
                        this.applyFontReference(context, this.fontReference);
                        switch (context.textAlign) {
                            case 'left':
                                textPos = left + margin;
                                break;
                            case 'right':
                                textPos = right - margin;
                                break;
                            case 'center':
                                textPos = left + (right - left) / 2;
                                break;
                            default:
                                textPos = left + (right - left) / 2;
                                break;
                        }

                        context.clearRect(textPos, yPosOfLine - 10, tWidth - margin - 5, 20);
                        this.drawText(context, indexText, textPos, yPosOfLine,
                            {
                                alignment: context.textAlign,
                                textWidth: tWidth - margin
                            }
                        )
                    }

                    indexOfLine += this.spacing;
                }
                context.stroke();
            }
        }
    });
});