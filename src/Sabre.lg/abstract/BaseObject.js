/* global Sabre */
/**
 * Base Class for Log Object
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.BaseObject = S.Class({
        init: function(options) {
            for (var prop in options) {
                var propName = prop.substring(0, 1).toLowerCase().concat(prop.slice(1));
                this[propName] = options[prop];
            }
            if (options.objFormat) {
                this.visible = options.objFormat.Visible;
                this.visibleInInsert = options.objFormat.VisibleInInsert;
                this.parse(options.objFormat);
            }
            this.unitSystem = this.unitSystem || 'English';
            this.cellPadding = this.cellPadding || 4;
            this.fromBottom = this.fromBottom || false;
            this.domain = this.lg3Format.getDomain();
            this.indexUnit = this.lg3Format.getIndexUnit();
        },

        drawInsert: function(context, objRect) {
            if (!context) return;
            context.save();
            context.lineWidth = 1;
            context.strokeStyle = 'black';
            context.strokeRect(objRect.x, objRect.y, objRect.w, objRect.h);
            context.restore();
        },

        draw: function(context, objRect) {

        },

        parse: function() {
            console.log('this is base log object parse function, need to overrite!');
        },

        getInsertHeight: function() {
            return 0;
        },

        insertTextLinePos: function(objRect) {
            var linePlacements;
            var cellHeight = objRect.h;
            if (cellHeight < 45) {
                //standard 2 line
                linePlacements = [
                    { top: objRect.y, bottom: objRect.y + cellHeight / 2 },
                    { top: objRect.y + cellHeight / 2, bottom: objRect.y + cellHeight },
                    { top: objRect.y + cellHeight / 2, bottom: objRect.y + cellHeight } // line 3=2
                ];
            } else {
                var bottomHeight = objRect.h / 2;
                var topHeight = objRect.h - bottomHeight;
                linePlacements = [
                    { top: objRect.y, bottom: objRect.y + topHeight },
                    { top: objRect.y + topHeight, bottom: objRect.y + topHeight + bottomHeight / 2 },
                    { top: objRect.y + topHeight + bottomHeight / 2, bottom: objRect.y + cellHeight }
                ];
            }

            for (var i = 0; i < linePlacements.length; i++) {
                var linePos = linePlacements[i];
                linePos.middle = (linePos.bottom + linePos.top) / 2;
            }
            return linePlacements;
        },

        drawText: function(context, text, x, y, attr) {
            var rect = { x: 0, y: 0, w: 0, h: 0 };
            if (!text) {
                return rect;
            }
            // ensure it's a string
            text = '' + text;
            if (!attr.lineHeight) {
                var fontAttr = this.fontAttributes(context.font);
                attr.lineHeight = fontAttr.fontSize ? parseFloat(fontAttr.fontSize) : 12;
            }
            if (isNaN(parseFloat(attr.lineHeight))) {
                attr.lineHeight = 10; // this is to *possibly* catch an android browser issue. 
            }

            attr.alignment = attr.alignment || 'center';
            attr.valignBaseline = attr.valignBaseline || 'middle';
            attr.color = attr.color || undefined;
            attr.backgroundColor = attr.backgroundColor || undefined;

            var newlines = text.split('\n');
            var testWidth;
            var lines = [];
            var line;
            for (var n = 0, nl = newlines.length; n < nl; n++) {
                var nlText = newlines[n];
                var words = nlText.split(' ');
                line = '';
                for (var i = 0, len = words.length; i < len; i++) {
                    var test = (line.length > 0) ? line + ' ' + words[i] : words[i];
                    if (context.measureText) {
                        testWidth = context.measureText(test).width;
                    } else {
                        // this is to *possibly* catch an android browser issue.  
                        testWidth = test.length * attr.lineHeight / 1.5; /////////////
                    }
                    if ((testWidth > attr.width) && (i > 0)) {
                        lines.push(line);
                        line = words[i];
                    } else {
                        line = test;
                    }
                }
                lines.push(line);
            }

            if (lines.length > 0) {

                var linePosStart = y;
                var fillOffsetX = 0, fillOffsetY = 0;
                switch (attr.valignBaseline) {
                    default:
                    case 'top':
                        context.textBaseline = 'top';
                        linePosStart = y; // lines begin at y and move down
                        fillOffsetY = 0;
                        break;
                    case 'middle':
                        context.textBaseline = 'middle';
                        linePosStart = y - ((lines.length - 1) / 2.0) * attr.lineHeight;
                        fillOffsetY = -attr.lineHeight / 2;
                        break;
                    case 'bottom':
                        context.textBaseline = 'bottom';
                        linePosStart = y - (lines.length - 1) * attr.lineHeight;
                        fillOffsetY = -attr.lineHeight;
                        break;
                }

                var linePos = linePosStart;
                if (attr.backgroundColor) {
                    context.fillStyle = attr.backgroundColor;
                    for (var j = 0; j < lines.length; j++) {
                        line = lines[j];
                        if (context.measureText) {
                            testWidth = context.measureText(line).width;
                        } else {
                            // this is to *possibly* catch an android browser issue. 
                            testWidth = test.length * attr.lineHeight / 1.5; /////////////
                        }

                        var textWidth = testWidth + 2;
                        switch (attr.alignment) {
                            case 'center':
                                fillOffsetX = -textWidth / 2;
                                break;
                            case 'left':
                                fillOffsetX = 0;
                                break;
                            case 'right':
                                fillOffsetX = -textWidth;
                                break;
                        }
                        context.fillRect(x + fillOffsetX, linePos + fillOffsetY, textWidth, attr.lineHeight);
                        linePos += attr.lineHeight;
                    }
                }

                context.textAlign = attr.alignment;
                linePos = linePosStart;

                if (attr.color) {
                    context.fillStyle = attr.color;
                }
                rect.width = attr.width; //TODO replace with actual
                rect.height = attr.lineHeight * lines.length;
                if (!(x === null) && !(y === null)) {
                    rect.x = x;
                    rect.y = y;
                    for (var k = 0; k < lines.length; k++) {
                        line = lines[k];
                        context.fillText(line, x, linePos);
                        linePos += attr.lineHeight;
                    }
                }
            }
            return rect;
        },

        fontAttributes: function(fontString) {
            //There is no clean way to get or change the current font size so some KLUGE is needed.
            // don't overthink it, lets let the doc do the work.
            var tempSpan = document.createElement('span');
            tempSpan.setAttribute("style", "font:" + fontString);
            var style = tempSpan.style;
            var fontAttributes = {
                "fontSize": style["fontSize"]
                , "lineHeight": style["lineHeight"]
                , "fontFamily": style["fontFamily"]
                , "fontWeight": style["fontWeight"]
                , "fontStyle": style["fontStyle"]
                , "fontVariant": style["fontVariant"]
            };
            return fontAttributes;
        },

        rgbaColorFromStColor: function(stColor) {
            var rgba;
            var r;
            var g;
            var b;
            var a = 255;
            if ((stColor.length === 13) && (stColor.indexOf('rgb') === 0)) {
                //rgb(ff,ff,ff)
                r = parseInt(stColor.substr(4, 2), 16);
                g = parseInt(stColor.substr(7, 2), 16);
                b = parseInt(stColor.substr(10, 2), 16);
                rgba = [r, g, b, a];

            } else if ((stColor.length === 9) && (stColor.indexOf('op(') === 0)) {
                //op(0,3,0)
                r = Math.floor((parseFloat(stColor.substr(3, 1)) / 4.0 * 255));
                g = Math.floor((parseFloat(stColor.substr(5, 1)) / 4.0 * 255));
                b = Math.floor((parseFloat(stColor.substr(7, 1)) / 4.0 * 255));
                rgba = [r, g, b, a];

            } else if (stColor.indexOf('rgb') === 0) {
                var cr = stColor.split(',');
                cr.forEach(function(it) {
                    it = it.replace('rgb', '').replace('(', '').replace(')', '');
                });
                r = parseInt(cr[0], 16);
                g = parseInt(cr[1], 16);
                b = parseInt(cr[2], 16);
                rgba = [r, g, b, a];
            } else {
                rgba = S.lg.CT_ST_COLOR[stColor].slice();
                if (rgba) {
                    rgba.push(a);
                } else {
                    rgba = [0, 0, 0, 255];
                }
            }

            return rgba || [0, 64, 0, 255];
        },

        imageFromBitPattern: function(pattern, width, height, frgba, brgba) {
            frgba = frgba || [0, 0, 0, 255];
            brgba = brgba || [255, 255, 255, 255];

            var pixels = [];
            var bytes = window.atob(pattern);
            var bytesPerRow = bytes.length / height;
            var rowCount = 0;

            for (var h = 0; h < height; h++) {
                rowCount = 0;

                for (var byteNum = 0; byteNum < bytesPerRow; byteNum++) {
                    var ch = bytes.charCodeAt(h * bytesPerRow + byteNum);
                    for (var bitNum = 0; bitNum < 8; bitNum++) {
                        var bit = (ch & 128) / 128;
                        pixels.push(bit);
                        ch = ch << 1;
                        rowCount++;
                        if (rowCount === width) {
                            break;
                        }
                    }
                    if (rowCount === width) {
                        break;
                    }

                }
            }

            var canvas = S.dom.create('canvas');
            var context = canvas.getContext('2d');
            var ratio = S.lg.CT_CANVAS_RATIO;
            canvas.width = Math.max(width * ratio, 1);
            canvas.height = Math.max(height * ratio, 1);
            context.scale(ratio, ratio);
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
            var data = imageData.data;
            var colors = [brgba, frgba];
            for (var y = 0; y < canvasHeight; ++y) {
                for (var x = 0; x < canvasWidth; ++x) {
                    var px = x;
                    var pixelNum = (Math.floor(y / ratio) * Math.floor(canvasWidth / ratio) + Math.floor(px / ratio));
                    var index = (y * canvasWidth + x) * 4;
                    var c = pixels[pixelNum];
                    data[index] = colors[c][0];  // red
                    data[++index] = colors[c][1];  // green
                    data[++index] = colors[c][2];  // blue
                    data[++index] = colors[c][3];  // alpha
                }
            }
            context.putImageData(imageData, 0, 0);

            var image = new Image();
            image.src = canvas.toDataURL('image/png');
            image.height = height;
            image.width = width;
            return image;
        },

        colorLum: function(rgb) {
            return Math.sqrt(Math.pow(rgb[0], 2) * 0.299 + Math.pow(rgb[1], 2) * 0.587 + Math.pow(rgb[2], 2) * 0.114);
        },

        imgLum: function(img) {
            var canvas = S.dom.create('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);

            var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
            var data = imgData.data;
            var lum, lumSum = 0;

            for (var x = 0, len = data.length; x < len; x += 4) {
                lum = Math.sqrt(Math.pow(data[x], 2) * 0.299 + Math.pow(data[x + 1], 2) * 0.587 + Math.pow(data[x + 2], 2) * 0.114);
                lumSum += lum;
            }
            return Math.floor(lumSum / (img.width * img.height));
        },

        fillWithImage: function(patternImage, context) {
            var success = false; //trying to locate the cause of the firefox fill issue...

            try {
                var pattern;
                pattern = context.createPattern(patternImage, 'repeat') || 'white';   // this pattern will be pixel resultion, not size
                context.fillStyle = pattern;
                context.scale(1 / S.lg.CT_CANVAS_RATIO, 1 / S.lg.CT_CANVAS_RATIO); // UNDO the current retina scaling
                context.fill();
                context.scale(S.lg.CT_CANVAS_RATIO, S.lg.CT_CANVAS_RATIO);    // reset the scale back to retina resolution.
                success = true;
            } catch (e) {
                if (e.name == "NS_ERROR_NOT_AVAILABLE") {
                    // this hapens in all browsers, though is likely timing related.
                    // i..e canvas was just added to DOM (and not ready etc)
                    // here it is not valid to fill the context "later",
                    // the context will not be the same, even right after this is called
                    console.log('Pattern: NS_ERROR_NOT_AVAILABLE');
                } else {
                    throw e;
                }
            }
            return success;
        },

        splitRectByLineCount: function(rect, lineCount) {
            var rtTop = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
            var rtBottom = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };

            if (lineCount) {
                if (this.fromBottom) {
                    rect.y -= rect.h * (lineCount - 1);
                    rect.h += rect.h * (lineCount - 1);
                } else {
                    rect.h = rect.h * (lineCount);
                }

                rtTop = S.lg.insetRect(rect, 0);
                rtTop.y = rect.y;
                rtTop.h /= lineCount;
                rtBottom = S.lg.insetRect(rect, 0);
                rtBottom.h /= lineCount;
                rtBottom.y = rect.y + rect.h - rtBottom.h;
            }

            return {
                topRect: rtTop,
                bottomRect: rtBottom
            }
        },

        wrapAndScaleValue: function wrapAndScaleValue(value, scale, wrapInfo) {
            // input: value = floating point
            // input: scale {left,right,transform...}
            // io: wrapInfo { in:wrapCount, int:type, out:actualCount }
            wrapInfo = wrapInfo || { wrapCount: 0 };
            wrapInfo.actualCount = 0; // return value
            var fractionalPosition = 0; // return value, as fraction of track
            if (0 === wrapInfo.wrapCount) {
                wrapInfo.mode = 'NONE';
            }

            switch (scale.transform) {
                case 'LINEAR':
                    // fractional position in the grid - not wrapped
                    fractionalPosition = (value - scale.left) / (scale.right - scale.left);
                    wrapInfo.actualCount = Math.floor(fractionalPosition);
                    break;
                case 'LOGARITHMIC':
                    if (value > 0) {
                        var minScale = Math.min(scale.left, scale.right);
                        var maxScale = Math.max(scale.left, scale.right);
                        fractionalPosition = Math.log(value / minScale) / Math.log(maxScale / minScale);
                    } else {
                        fractionalPosition = 0;
                    }
                    wrapInfo.actualCount = Math.floor(fractionalPosition);
                    break;
                case 'TANGENTIAL':
                    //NOTE: tangential scales are alwayes 0-90 degrees.
                    scale.left = 0;
                    scale.right = 90;
                    value = (scale.right - value) / 360.0 * Math.PI;
                    fractionalPosition = 1 - Math.tan(value);
                    wrapInfo.actualCount = 0;
                    break;
            }

            //at this point, fractionalPosition is scaled, but not wrapped.
            // it now needs to wrap within 0-1 (if permitted)
            //TODO: we still need to add the wrapCount limitation.
            // it would go here.
            //TODO: we still need to add the lef/right limitation.
            // it would go here.
            switch (wrapInfo.mode) {
                case 'NONE':
                    wrapInfo.actualCount = 0;
                    break;
                default:
                    if (wrapInfo.wrapCount > 0 && wrapInfo.wrapCount < wrapInfo.actualCount) {
                        fractionalPosition = fractionalPosition - wrapInfo.wrapCount;
                    } else {
                        fractionalPosition = fractionalPosition - Math.floor(fractionalPosition);
                    }
                    break;
            }

            return fractionalPosition;
        },

        applyFontReference: function(context, fontReference) {
            var tempSpan = S.dom.create('span');
            tempSpan.setAttribute("style", "font:" + context.font);

            var fontSize = fontReference.Size;
            if (fontSize) {
                fontSize = Math.max(10, fontSize);
                tempSpan.style.fontSize = '' + fontSize + 'px';
            }

            var bold = fontReference.Bold;
            if (bold) {
                tempSpan.style.fontWeight = 'bold';
            } else {
                tempSpan.style.fontWeight = 'normal';
            }
            var newFont = tempSpan.style.font;
            context.font = newFont;
        },

        doubleToUTCDate: function(apiEpoch) {
            var sql1899 = Date.parse("Dec 30, 1899 00:00:00 GMT");
            var date = apiEpoch;
            if (typeof apiEpoch == 'number') {
                var epoch = apiEpoch * (24 * 60 * 60) * 1000 + sql1899 + new Date().getTimezoneOffset() * 60 * 1000;
                epoch = Math.floor(epoch);
                date = new Date(epoch);
            }
            return date;
        },

        formatValue: function(value, textFormat, valueOffset) {
            // currently this is a mid frequency call.
            // index numbers, value curves etc.
            // check performance and consider creating/returning the valueParser for future use within index loop
            // TODO: lookup the full lg textFormat specification
            // TODO: create class lg3TextFormatter = function(textFormat)
            // TODO: modify/finish formatDate_work_in_progress to work with lg textFormat string
            var formatted = value;
            if (!textFormat) return formatted;

            if ((textFormat == "%T") || (textFormat.indexOf("%H") >= 0)) {
                // quick and dirty, format wants time.
                if ((textFormat.indexOf("%d") >= 0)) {
                    // quick and dirty, format ALSO wants date
                    formatted = "DD-MMM-YYY HH:MM:SS";
                    textFormat = "%d-%b-%Y %H:%M:%S"; // the dash is used to ensure line wraps correctly.
                    formatted = this.formatDate(value, textFormat, valueOffset) || formatted;
                } else {
                    // no date, just time
                    formatted = "HH:MM:SS";
                    textFormat = "%H:%M:%S";
                    formatted = this.formatDate(value, textFormat, valueOffset) || formatted;
                }

            } else if ((textFormat.indexOf("%d") >= 0)) {
                // perhaps just date...
                formatted = "DD-MMM-YYY";
            } else {
                // assume it's a number or text
                var numericFormat = this.requiredPrecisionForFormat(textFormat);
                if (numericFormat) {
                    formatted = this.formatNumericValue(value, numericFormat);
                }
                // else nothing, leave it alone..
            }

            return formatted;
        },

        formatDate: function(date, textFormat, displayUtcOffsetHours) {
            var ms = date.getMilliseconds();
            if (ms >= 999) {
                date.setMilliseconds(1000);
            }

            var padd0 = function(str, len) {
                str = "0000" + str;
                return str.substr(str.length - len);
            }; // once date formatter is created, this goes there
            lg3.monthNames = lg3.monthNames || ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            lg3.monthShort = lg3.monthShort || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


            var localTimeZone = {
                //"%b+": padd0(   date.getMonth() + 1,    2),
                "%b+": lg3.monthShort[date.getMonth()],
                "%d+": padd0(date.getDate(), 2),
                "%Y+": padd0(date.getFullYear(), 2),
                "%H+": padd0(date.getHours(), 2),
                "%M+": padd0(date.getMinutes(), 2),
                "%S+": padd0(date.getSeconds(), 2)
            };

            var formatted = textFormat;
            for (var k in localTimeZone) {
                if (new RegExp("(" + k + ")").test(formatted))
                    formatted = formatted.replace(RegExp.$1, localTimeZone[k]);
            }

            return formatted;

        },

        requiredPrecisionForFormat: function(textFormat) {

            //The only numeric textFormats I ahve seen are %f, lets plan for all of them
            this.floatRexExp = this.floatRegexp || /(?!%)([0-9])?(\.[0-9])?(?=[fdFDuI])/;

            var matches = this.floatRexExp.exec(textFormat);
            if ((Array.isArray(matches)) && (matches.length > 0)) {
                var intSize = parseInt(matches[1]);
                if (isNaN(intSize)) {
                    intSize = 0;
                }
                var precision = matches[2];
                if (precision) {
                    precision = parseInt(precision.slice(1));
                } else {
                    precision = 0;
                }

                return {
                    intSize: intSize,
                    precision: precision
                };
            }
            return undefined; // caller will do the default javascript thing with the value.
        },

        formatNumericValue: function(value, numericFormat) {

            if (numericFormat) {
                if (numericFormat.precision > 0) {
                    var exp = Math.pow(10, numericFormat.precision);
                    value = Math.round(value * exp) / exp;
                } else {
                    value = value.toFixed();
                }
                //TODO: do the leading padding too
            }
            return value;
        },
        
        
        getIndexPosForIndex: function(forIndex, topIndex, bottomIndex, rect) {
            return rect.y + (forIndex - topIndex) * rect.h / (bottomIndex - topIndex);
        },
    });
});