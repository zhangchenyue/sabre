/**
 * Log Object---Curve inhert from _BaseObject
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.Track = S.Class({ extend: this.BaseObject }, {
        parse: function(objFmt) {
            this.visibleInInsert = objFmt.VisibleInInsert;
            this.visible = objFmt.Visible;
            this.width = objFmt.Width;
            this.leftPosition = objFmt.LeftPosition
            this.description = objFmt.DescriptionInInsert;
            this.indexLinesVisible = objFmt.IndexLinesVisible;
            this.indexNumbersVisible = objFmt.IndexNumbersVisible;
            this.totalWidth = this.lg3Format.getWidth();
            this.objList = this.createObjListByFmt(objFmt);
        },

        drawInsert: function(context, tInsertRect, fromBottom, lineHeight, textLineHeight) {
            if (!this.visibleInInsert || this.width <= 0) {
                return;
            }

            context.save();

            //draw description
            if (this.description) {
                var descRect = { x: tInsertRect.x, y: tInsertRect.y, w: tInsertRect.w, h: textLineHeight || S.lg.CT_INSERT_TEXTLINEHEIGHT };
                context.save();
                context.fillStyle = 'black';
                context.textBaseline = 'middle';
                context.textAlign = 'center';
                context.fillText(descText, descRect.x + descRect.w * 0.5, descRect.y + descRect.h * 0.5);
                context.restore();
            }

            //draw log objects insert belong to the track
            var rowPos = tInsertRect.y;
            for (var i = 0, l = this.objList.length; i < l; i++) {
                var lgObj = this.objList[i];
                var objH = lgObj.getInsertHeight();
                if (objH == 0)
                    continue;

                var objRect = { x: tInsertRect.x, y: fromBottom ? rowPos - objH : rowPos, w: tInsertRect.w, h: objH };
                lgObj.drawInsert(context, objRect);
                rowPos = fromBottom ? objRect.y : objRect.y + objRect.h;
            }

            context.restore();
        },

        createObjListByFmt: function(trackFmt) {
            var objs = [];
            S.lg.CT_ORDERED_LG_OBJECTS.forEach(function(objName) {
                if (trackFmt[objName]) {
                    trackFmt[objName].forEach(function(objFmt) {
                        var objClass = S.lg[objName];
                        if (objClass) {
                            objs.push(objClass({
                                objFormat: objFmt,
                                lg3Format: this.lg3Format,
                                unitSystem: this.lg3Format.unitSystem,
                                name: objName
                            }));
                        }
                    }, this);
                }
            }, this);
            return objs;
        },

        computeInsertOccupiedRect: function(fullRect, lineHeight, textLineHeight) {
            var insertOccupiedRect = this.getRect(fullRect);
            insertOccupiedRect.h = 0;
            this.objList.forEach(function(obj) {
                if (obj.visibleInInsert) {
                    insertOccupiedRect.h += obj.getInsertHeight(lineHeight, textLineHeight);
                }
            });
            return insertOccupiedRect;
        },

        getRect: function(fullRect) {
            var leftPos = this.leftPosition * fullRect.w / this.totalWidth;
            var rightPos = (this.leftPosition + this.width) * fullRect.w / this.totalWidth;
            var trackWidth = rightPos - leftPos;
            return { x: leftPos, y: fullRect.y, w: trackWidth, h: fullRect.h };
        }
    });
});