/**
 * Log Object---Curve inhert from _BaseObject
 */
Sabre.pack('Sabre.lg', function (S) {
    'use strict'

    this.Curve = S.Class({ extend: this.BaseObject }, {
        parse: function (objFmt) {
            this.channelName = objFmt.ChannelName || '---';
            this.limitUnit = this.lg3Format.getObjPropertyByUnitSystem('@Unit', objFmt, 'Limit');
            this.leftLimit = parseFloat(this.lg3Format.getObjPropertyByUnitSystem('LeftLimit', objFmt, 'Limit'));
            this.rightLimit = parseFloat(this.lg3Format.getObjPropertyByUnitSystem('RightLimit', objFmt, 'Limit'));
            this.thickness = this.lg3Format.toCssThickness(objFmt.Thickness);
            this.lineStyle = this.lg3Format.toContextLineDash(objFmt.LineStyle);
            this.color = this.lg3Format.toContextColor(objFmt.Color);
            this.objectBinding = this.lg3Format.getChannelDataBinding(objFmt);
            this.absentInterval = this.lg3Format.getObjPropertyByUnitSystem('AbsentInterval', objFmt, this.indexUnit)
            this.transform = objFmt.Transform;
            this.wrapMode = objFmt.WrapMode;
            this.wrapCount = objFmt.WrapCount;
        },

        drawInsert: function (context, objRect) {
            if (!this.visibleInInsert)
                return;

            var linePos = this.insertTextLinePos(objRect);
            var linePreviewY = linePos[0].bottom;
            var channelLineY = linePos[0].middle;
            var leftScaleLineY = linePos[1].middle;
            var rightScaleLineY = linePos[1].middle;
            var unitLineY = linePos[2].middle;

            context.save();
            context.lineWidth = this.thickness;
            context.setLineDash(this.lineStyle);
            context.strokeStyle = this.color;
            //draw channel name
            this.drawText(context,
                this.channelName,
                objRect.x + (objRect.w / 2.0),
                channelLineY,
                {
                    alignment: 'center',
                    valignBaseline: 'middle',
                    color: 'black',
                    backgroundColor: undefined,
                    width: objRect.w
                }
            );

            //draw preview line    
            context.beginPath();
            context.moveTo(objRect.x + this.cellPadding, linePreviewY);
            context.lineTo(objRect.x + objRect.w - this.cellPadding, linePreviewY);
            context.stroke();

            //draw unit
            context.beginPath();
            context.fillStyle = 'black';
            context.textBaseline = 'middle';
            context.fillText(this.limitUnit, objRect.x + (0.5 * objRect.w), unitLineY);

            //draw limit text
            context.textAlign = 'left';
            context.fillText(this.leftLimit, objRect.x + this.cellPadding, leftScaleLineY);
            context.textAlign = 'right';
            context.fillText(this.rightLimit, objRect.x + (objRect.w - this.cellPadding), rightScaleLineY);

            context.restore();

            //draw border rect
            S.lg.Curve.callSuper(this, 'drawInsert', context, objRect); // border, solid, black etc
        },

        draw: function (tile, trackRect, dataManager) {
            if ((!this.visible) || (this.thickness <= 0) || !tile || !dataManager) {
                return;
            }

            var channelData = dataManager.getFirstChannelForBinding(this.objectBinding, this.channelName);
            if ((!channelData) || (channelData.size() <= 0)) {
                return;
            }

            var context = tile.ctx;
            var tileRect = tile.rect;
            var tileTopIndex = tile.topIndex;
            var tileBottomIndex = tile.bottomIndex;
            var trackWidth = trackRect.w;
            var wrapInfo = { wrapCount: this.wrapCount, mode: this.wrapMode, actualCount: 0 };
            var scale = { left: this.leftLimit, right: this.rightLimit, transform: this.transform };
            var lastWrapCount = -999, lastyPos, lastxPos, lastIndex, lastValue;
            var gap, wasGap = false;
            this.absentInterval = this.absentInterval || dataManager.absentInterval
            //start to render
            context.save();
            context.lineWidth = this.thickness;
            context.setLineDash(this.lineStyle);
            context.strokeStyle = this.color
            context.beginPath();

            channelData.indexes.forEach(function (index, indexNum) {
                var yPos = this.getIndexPosForIndex(index, tileTopIndex, tileBottomIndex, tileRect) || 0;
                var dataVal = channelData.getValueAtIndexNumber(indexNum, 0);
                if (dataVal === -999.25) return;

                var xFrac = this.wrapAndScaleValue(dataVal, scale, wrapInfo);
                if (wrapInfo.wrapCount > 0 && wrapInfo.actualCount > wrapInfo.wrapCount) {
                    wrapInfo.actualCount = wrapInfo.wrapCount;
                }

                var xPos = xFrac * trackWidth + trackRect.x;
                if (indexNum > 0) {
                    // NOTE: the channel data is set so that if it is a continuation, the first point is out of range
                    // as such, the first point never needs to be drawn.
                    gap = this.isGap(Math.abs(yPos - lastyPos), Math.abs(index - lastIndex), tileTopIndex, tileBottomIndex, tileRect)
                    if (gap) {
                        context.stroke();
                        context.beginPath();
                        context.moveTo(xPos, yPos);
                    } else {
                        var wrapDelta = wrapInfo.actualCount - lastWrapCount;
                        if (wrapDelta !== 0) {
                            context.lineTo(xPos + (wrapDelta) * trackWidth, yPos);
                            var step = wrapDelta / Math.abs(wrapDelta);
                            // no point in spazing more than there are pixels.
                            var spazCount = Math.min(Math.ceil(Math.abs(lastyPos - yPos)), Math.abs(wrapDelta));
                            for (var fillWraps = 1; fillWraps < spazCount; fillWraps++) {
                                context.moveTo(lastxPos + (step * fillWraps - (wrapInfo.actualCount - lastWrapCount)) * trackWidth, lastyPos);
                                context.lineTo(xPos + step * fillWraps * trackWidth, yPos);
                            }
                            context.moveTo(lastxPos - wrapDelta * trackWidth, lastyPos);
                            // continue previous line to this line.
                            context.lineTo(xPos, yPos);
                        } else {
                            context.lineTo(xPos, yPos);
                        }
                    }
                } else {

                }
                lastWrapCount = wrapInfo.actualCount;
                lastyPos = yPos;
                lastxPos = xPos;
                lastValue = dataVal;
                lastIndex = index;
            }, this);

            context.stroke();
            context.restore();
        },

        isGap: function (gapPixelSize, gapIndexLength, tileTopIndex, tileBottomIndex, tileRect) {
            var absentPixelsLimit = Math.abs(this.getIndexPosForIndex(this.absentInterval, tileTopIndex, tileBottomIndex, tileRect) - this.getIndexPosForIndex(0, tileTopIndex, tileBottomIndex, tileRect));
            var gap = (gapPixelSize >= absentPixelsLimit);
            gap = (gapIndexLength > this.absentInterval);
            gap &= (absentPixelsLimit > 0);
            gap &= (gapPixelSize > 2);

            return gap;
        },

        getInsertHeight: function (lineHeight) {
            if (!this.visibleInInsert)
                return 0;

            return lineHeight || S.lg.CT_INSERT_LINEHEIGHT;
        }
    });
});