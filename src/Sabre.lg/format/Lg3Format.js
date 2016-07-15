/* global Sabre */
/**
 * Log format Class based on LgSchemma3
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.Lg3Format = S.Class({
        init: function(options) {
            this.id = options.id || options.configId;
            this.struct = this.parse(options.jFormat);
            this.unitSystem = options.unitSystem || 'English';
        },

        parse: function(jsonFormat) {
            jsonFormat = jsonFormat || this.struct;
            if (!jsonFormat)
                return null;
            this.struct = jsonFormat ? this.getJsonFormatWithoutLgNameSpace(jsonFormat) : null;
            this._addDefaultsToObject('Format', this.struct, 0);
            this._preFlightCheck();
            return this.struct;
        },

        createDefaultObject: function(objType) {
            return this._createObject(S.lg.CT_DEFAULT[objType]);
        },

        createEmptyTemplateByDomain: function(domain) {
            if (domain === 'MEASURED_DEPTH' || domain === 'TRUE_VERTICAL_DEPTH') {
                return this._createObject(S.lg.CT_EMPTY_DEPTH_TEMPLATE);
            }
            return this._createObject(S.lg.CT_EMPTY_TIME_TEMPLATE).Domain = domain;
        },

        getJsonFormatWithLgNameSpace: function(jFormat) {
            jFormat = jFormat || this.struct;
            var jStruct = JSON.parse(JSON.stringify(jFormat))
            jStruct = jStruct['Format'] || { 'Format': jStruct };
            return this.addLgNamespace(jStruct);
        },

        getJsonFormatWithoutLgNameSpace: function(jFormat) {
            var jsonStr = JSON.stringify(jFormat).replace(/lg:/g, '');
            var pattern = new RegExp('{"@xmlns":"urn:horizon:loggraphics","#text":("[^"]*")}', 'g');
            var rs;
            var rsArr = [];
            while ((rs = pattern.exec(jsonStr)) !== null) { rsArr.push(rs); }

            rsArr.forEach(function(item) {
                jsonStr = jsonStr.replace(item[0], item[1]);
            });

            var result = JSON.parse(jsonStr);
            return result['Format'] ? result['Format'] : result;
        },

        getJsonFormatStruct: function() {
            return this.struct;
        },

        getObjectStruct: function(objName) {
            if (!this.struct || !this.struct[objName])
                return null;
            return this.struct[objName];
        },

        getObjectByUnitSystem: function(obj, unitSystem, parentObj) {
            var attrs = parentObj[obj + 's'];
            if (!attrs) {
                return parentObj[obj] || {};
            }
            var allObjs = attrs[obj];
            if (!S.type.isArray(allObjs)) {
                allObjs = [allObjs];
            }
            for (var i = 0, l = allObjs.length; i < l; i++) {
                if ('@UnitSystem' in allObjs[i]) {
                    if (allObjs[i]['@UnitSystem'].toUpperCase() === unitSystem.toUpperCase()) {
                        return allObjs[i]; // when the right one is found, bail out.
                    }
                }
            }
        },

        getObjectTextValue: function(object) {
            return S.type.isUndefined(object) || S.type.isString(object) ? object : object['#text'];
        },

        getObjectValueByUnitSystem: function(objectName, unitSystem, lgObj, convertTo) {
            var obj = this.getObjectByUnitSystem(objectName, unitSystem, lgObj);
            var unit = obj["@Unit"];
            var value = parseFloat(this.getObjectTextValue(obj));

            if (!isNaN(value)) {
                if (convertTo) {
                    var conv = S.lg.UnitConvertor({ from: unit, to: convertTo });
                    value = conv.convert(value);
                    if (isNaN(value)) value = undefined;
                }
            } else {
                value = undefined;
            }

            return value;
        },

        getDomain: function() {//ACQUISITION, MEASURED_DEPTH, TIME, TRUE_VERTICAL_DEPTH
            return this.struct.Domain;
        },

        getLabeledObjects: function() {
            if (!this.struct)
                return [];

            var objs = [];
            this.struct.Track.forEach(function(theTrack) {
                if (theTrack.Curve) {
                    theTrack.Curve.forEach(function(theCurve) {
                        if (theCurve.Visible && (this.getCssThicknessFromStThickness(theCurve.Thickness) > 0)) {
                            objs.push({ curve: theCurve, track: theTrack });
                        }
                    }, this);
                }
            });
            return objs;
        },

        getObjPropertyByUnitSystem: function(objPropertyName, objFmt, objParentName, unitsystem) {
            var propertyObj = this.getObjectByUnitSystem(objParentName || objPropertyName, unitsystem || this.unitSystem, objFmt);
            if (objPropertyName === '@Unit') {
                var unit = propertyObj[objPropertyName];
                if (unit === '*' || unit === 'NULL' || !unit) {
                    unit = '';
                }
                return unit;
            } else {
                return objParentName ? propertyObj[objPropertyName] : propertyObj;
            }
        },

        toCssThickness: function(stThickness) {
            var thickness;
            switch (stThickness) {
                case 'HEAVY':
                    thickness = 3.75;
                    break;
                case 'MEDIUM':
                    thickness = 2.25;
                    break;
                case 'LIGHT':
                    thickness = 0.75;
                    break;
                case 'NONE':
                    thickness = 0;
                    break;
                default:
                    thickness = parseFloat(stThickness) || 1;
                    break;
            }
            return thickness;
        },

        toContextLineDash: function(fmtLineStyle) {
            var lineDash = [];
            switch (fmtLineStyle) {
                case 'SOLID':
                    lineDash = [];
                    break;
                case 'LONG_DASH':
                    lineDash = [10, 4];
                    break;
                case 'DASH':
                    lineDash = [4, 4];
                    break;
                case 'DOT':
                    lineDash = [2, 2];
                    break;
                case 'DASH_DOT':
                    lineDash = [4, 3, 2, 3];
                    break;
                case 'DASH_DOT_DOT':
                    lineDash = [4, 3, 2, 3, 2, 3];
                    break;
                default:
                    break;
            }

            return lineDash;
        },

        toContextColor: function(fmtColor) {
            if (!fmtColor) {
                fmtColor = 'black';
            }
            var color = fmtColor;

            if ((fmtColor.length === 13) && (fmtColor.indexOf('rgb') === 0)) {
                //rgb(ff,ff,ff)
                color = '#' + fmtColor.substr(4, 2) + fmtColor.substr(7, 2) + fmtColor.substr(10, 2);
            } else if ((fmtColor.length === 9) && (fmtColor.indexOf('op(') === 0)) {
                //op(0,3,0)
                var r = Math.floor((parseFloat(fmtColor.substr(3, 1)) / 4.0 * 15));
                var g = Math.floor((parseFloat(fmtColor.substr(5, 1)) / 4.0 * 15));
                var b = Math.floor((parseFloat(fmtColor.substr(7, 1)) / 4.0 * 15));
                color = '#' + r.toString(16) + g.toString(16) + b.toString(16);
            } else if (fmtColor.indexOf('rgb') === 0) {
                var cr = fmtColor.split(',');
                for (var i = 0; i < cr.length; i++) {
                    cr[i] = cr[i].replace('rgb', '').replace('(', '').replace(')', '');
                }
                r = parseInt(cr[0]);
                g = parseInt(cr[1]);
                b = parseInt(cr[2]);
                if (isNaN(cr[0]) || isNaN(cr[1]) || isNaN(cr[2])) {
                    r = parseInt(cr[0], 16);
                    g = parseInt(cr[1], 16);
                    b = parseInt(cr[2], 16);
                }
                color = 'rgb(' + r + ',' + g + ',' + b + ')';
            }
            return color;
        },

        getChannelBindingFilterValue: function(filternName, parentObj) {//"ChannelBinding":{"Filter":{"@Key":"VectorIndex","@Value":"0"}}
            var value;
            if (parentObj.ChannelBinding) {
                var filters = parentObj.ChannelBinding.Filter;
                if (!filters) return value;

                if (!S.type.isArray(filters)) {
                    filters = [filters];
                }

                for (var f = 0, l = filters.length; f < l; f++) {
                    var filter = filters[f];
                    if (filternName === filter["@Key"]) {
                        value = filter["@Value"];
                        break;
                    }
                }
            }
            return value;
        },

        getChannelDataBinding: function(lgObj) {
            // returns all known/supported data binding parameters (undefined if absent)
            // all paremeters here are used to select valid logs from the datasource. (during pull from API and pul from local DB)
            var objPassName = this.getChannelBindingFilterValue("PassName", lgObj);
            var objLogType = this.getChannelBindingFilterValue("LogType", lgObj); // This is InterACT Specific (DAL Log Type)
            var objLogId = this.getChannelBindingFilterValue("LogId", lgObj); // This is InterACT Specific (sectionId)
            //more binding to be added here if ever supported

            return {
                "PassName": objPassName,
                "LogType": objLogType,
                "LogId": objLogId
            }
        },

        getCustomPropertyObject: function(propertyName, parentObj) {
            var obj = undefined;
            if (parentObj.CustomProperties) {
                var customProperties = parentObj.CustomProperties.CustomProperty;
                if (customProperties) {
                    if (!S.type.isArray(customProperties)) customProperties = [customProperties];
                    for (var i = 0; i < customProperties.length; i++) {
                        var property = customProperties[i];
                        if (propertyName === property['@Name']) {
                            obj = property;
                            break;
                        }
                    }
                }
            }
            return obj;
        },

        getRequiredChannels: function() {
            var channelBinding = this._getRequiredChannelBinding(null);
            var returnChannels = {};
            // loop through all logs and mash the channels together
            for (var i = 0; i < channelBinding.length; i++) {
                var channels = channelBinding[i].Channels;
                var channelNames = Object.keys(channels);

                for (var c = 0; c < channelNames.length; c++) {
                    var channelName = channelNames[c];
                    var existingUnits = returnChannels[channelName] || [];
                    var newUnits = channels[channelName] || [];
                    newUnits = newUnits.filter(function(unit) {
                        return existingUnits.indexOf(unit) < 0;
                    });
                    returnChannels[channelName] = existingUnits.concat(newUnits);
                }

            }

            return returnChannels;
        },

        getIndexUnit: function() {
            // this is the display unit only, this should only be used in the markers and scale
            var indexUnitObj = this.getObjectByUnitSystem('IndexUnit', this.unitSystem, this.struct);
            var indexUnit = this.getObjectTextValue(indexUnitObj);

            var indexNumberUnits = this.getIndexNumberUnits();
            var lineUnit0 = (indexNumberUnits.length > 0) ? indexNumberUnits[0] : undefined;

            //Further investivation needed.   I think I was already careful to limit unit system to this func.
            //overriding it in this single place should be ok, but may have a regression...
            if (lineUnit0 && lineUnit0.length > 0) indexUnit = indexUnit || lineUnit0;
            // this essentially will obsolete the format.IndexUnit[unitsystem] in lgSchema3
            // I don't think this is better, but it will be consistant with ia-lg
            // ERROR CONDITION: User error in format.
            return indexUnit;
        },

        getIndexNumberUnits: function() {
            var indexUnits = [];
            var indexGrid = this.struct.IndexGrid;
            if (indexGrid) {
                var indexLine = indexGrid.IndexLine;
                if (indexLine) {
                    for (var i = 0; i < indexLine.length; i++) {
                        var line = indexLine[i];
                        var indexNumber = line.IndexNumber;

                        if (indexNumber) {
                            var spacingObj = this.getObjectByUnitSystem('Spacing', this.unitSystem, line);
                            indexUnits.push(spacingObj['@Unit']);
                        }
                    }
                }
            }
            return indexUnits;
        },

        getScaleObj: function() {
            // either Scale or Ratio must exist
            // Scale must exist for time logs.
            var indexScaleObj = this.struct.IndexScale;
            var scaleObj = this.getObjectByUnitSystem('Scale', this.unitSystem, indexScaleObj);

            //FIXME: objectForUnitSystem returns {} if not found
            //objectForUnitSystem should be fixed to return undefined
            if (typeof scaleObj === "undefined" || Object.getOwnPropertyNames(scaleObj).length === 0) {
                var ratioText = indexScaleObj.Ratio;
                var ratio = ratioText.split(':');
                if (S.type.isUndefined(ratio)) {
                    ratio = ["1", "240"];
                }
                var indexUnit = this.getIndexUnit();

                if (this.isTimeDomain()) {
                    throw new Error("Time log format missing index scale");
                }

                scaleObj = {
                    PaperFactor: { "#text": ratio[0], "@Unit": indexUnit },
                    IndexFactor: { "#text": ratio[1], "@Unit": indexUnit }
                };

            }
            return scaleObj;
        },

        getFontReference: function(fontId) {
            var fontReference = undefined;
            if (this.struct.FontTable) {
                var fonts = this.struct.FontTable.Font || [];
                if (!S.type.isArray(fonts)) fonts = [fonts];

                for (var i = 0, len = fonts.length; i < len; i++) {
                    var font = fonts[i];
                    if (font.FontId == fontId) {
                        fontReference = font;
                        break;
                    }
                }

            }
            return fontReference;
        },

        getColorForChannel: function(mnemonic) {
            // returns a default color to use when presenting a channel (make a best guess from inside the format)
            var returnColor = 'black';
            for (var trackNum = 0; trackNum < this.struct.Track.length; trackNum++) {
                var theTrack = this.struct.Track[trackNum];
                if (theTrack.Curve) {
                    for (var i = 0; i < theTrack.Curve.length; i++) {
                        if (theTrack.Curve[i].ChannelName === mnemonic) {
                            returnColor = theTrack.Curve[i].Color;
                            return returnColor;
                        }
                    }
                }
            }
            return returnColor;
        },

        getWidth: function() {
            var fullWidth = 0;
            this.struct.Track.forEach(function(theTrack) {
                fullWidth = Math.max(fullWidth, theTrack.Width + theTrack.LeftPosition);
            });
            return fullWidth;
        },

        getCurveWithUniqueId: function(uid, track) {
            if ('Curve' in track) {
                for (var i = 0; i < track.Curve.length; i++) {
                    if (track.Curve[i]['@UniqueId'] === uid) {
                        return track.Curve[i];
                    }
                }
            }
            return {};
        },

        parseColorScale: function(lgObj) {
            if (!lgObj.ColorMap)
                return null;

            var thresholdEntries = (lgObj.StaticThreshold) ? lgObj.StaticThreshold.ThresholdEntry : undefined;
            var thresholdUnit = (lgObj.StaticThreshold) ? lgObj.StaticThreshold.ThresholdUnit : undefined;

            var norm = lgObj.NormalizationSettings;

            if (norm) {
                thresholdEntries = (norm.ExplicitNormalization) ? norm.ExplicitNormalization.ThresholdEntry : undefined;
                var normObj = norm.ExplicitNormalization ||
                    norm.StaticLinear ||
                    norm.StaticLogarithmic ||
                    norm.StaticHistogram ||
                    norm.StaticGaussian ||
                    norm.DynamicHistogram ||
                    norm.DynamicGaussian;

                thresholdUnit = thresholdUnit || normObj.ThresholdUnit || '';
            }
            thresholdEntries = thresholdEntries || [];
            var colorMapEntries = (lgObj.ColorMap) ? lgObj.ColorMap.ColorEntry : undefined;
            var colorCount = lgObj.ColorMap.ColorCount;
            if (!colorCount) {
                if (Array.isArray(colorMapEntries)) colorCount = colorMapEntries.length;
            }
            colorCount = parseInt(colorCount);

            if (!colorMapEntries) {
                if (lgObj.ColorMap.StandardColorMap) {
                    //colorMapEntries = lg3.getStdColorMap(lgObj.ColorMap.StandardColorMap).getColorList(colorCount);
                }
            }

            var miss = [];
            if (thresholdEntries.length < colorCount) {
                var fPrev = 0.0;
                var fIncr = 10.0;
                if (thresholdEntries.length > 0) {
                    fPrev = parseFloat(thresholdEntries[thresholdEntries.length - 1]);
                    if (colorCount > 1)
                        fIncr = fPrev - parseFloat(thresholdEntries[thresholdEntries.length - 2]);
                    else
                        fIncr = fPrev;
                }

                for (var i = thresholdEntries.length + 1; i < colorCount; ++i) {
                    thresholdEntries.push(fIncr + fPrev + '');
                    fPrev = fIncr + fPrev;
                }


            } else {
                for (var j = 0; j < thresholdEntries.length + 1 - colorCount; j++) {
                    miss.push(colorMapEntries[colorMapEntries.length - 1]);
                }
                colorMapEntries = colorMapEntries.concat(miss);
            }


            if (lgObj.ColorMap.IsReversed && lgObj.ColorMap.IsReversed.toString().toLowerCase() === 'true') {
                colorMapEntries = colorMapEntries.reverse();
            }

            colorMapEntries = colorMapEntries || [];

            // objective : create a sanitized, optimized color scale.
            var colorScaleObj = {
                thresholds: [],
                colors: [],
                unit: thresholdUnit,
                absentColor: ''
            };

            for (var c = 0; c < colorMapEntries.length; c++) {
                colorScaleObj.colors.push(S.lg.BaseObject.prototype.rgbaColorFromStColor(colorMapEntries[c]));
            }

            for (var t = 0; t < thresholdEntries.length; t++) {
                colorScaleObj.thresholds.push(parseFloat(thresholdEntries[t]));
            }

            if (colorScaleObj.colors.length === 0)
                colorScaleObj.colors.push('black');

            while (colorScaleObj.colors.length <= colorScaleObj.thresholds.length) {
                colorScaleObj.colors.push(colorScaleObj.colors[colorScaleObj.colors.length - 1]);
            }
            colorScaleObj.absentColor = lgObj.ColorMap.ColorForAbsent ? S.lg.BaseObject.rgbaColorFromStColor(lgObj.ColorMap.ColorForAbsent) : S.lg.BaseObject.prototype.rgbaColorFromStColor('white');
            return colorScaleObj;
        },

        colorMapPreviewImg: function(colors, width, height, clip) {

            var canvas = S.dom.create("canvas");
            var context = canvas.getContext("2d");
            context.save();

            var paddingRight = clip ? 8 : 0;
            var ratio = S.lg.CT_CANVAS_RATIO;
            canvas.width = Math.max(width * ratio, 1);
            canvas.height = Math.max(height * ratio, 1);
            context.scale(ratio, ratio);

            context.lineWidth = 1;
            context.strokeStyle = 'black';

            context.beginPath();

            var colorRect = { x: 0, y: 0, width: (width - paddingRight) / colors.length, height: height };
            var color;
            for (var c = 0, len = colors.length; c < len; c++) {
                color = 'rgba(' + colors[c][0] + ',' + colors[c][1] + ',' + colors[c][2] + ',1)';
                context.fillStyle = color;
                context.fillRect(colorRect.x, colorRect.y, colorRect.width, colorRect.height);

                colorRect.x += colorRect.width;
            }

            if (clip) {
                context.beginPath();
                context.translate(0.5, 0.5);
                var xtop = width - paddingRight / 2;
                context.moveTo(xtop, 0);
                context.lineTo(xtop, height - 1);
                context.moveTo(xtop, 0);
                context.lineTo(xtop + paddingRight / 4, 0);
                context.moveTo(xtop, height - 1);
                context.lineTo(xtop + paddingRight / 4, height - 1);
                context.stroke();
            }

            context.restore();

            var image = new Image();
            image.src = canvas.toDataURL("image/png");
            image.height = height;
            image.width = width;

            if (clip) {
                var scratchCanvas = S.dom.create("canvas");
                var scratchCtx = scratchCanvas.getContext("2d");
                var scratchRatio = S.lg.CT_CANVAS_RATIO;
                scratchCanvas.width = Math.max(width * scratchRatio, 1);
                scratchCanvas.height = Math.max(height * scratchRatio, 1);
                scratchCtx.scale(scratchRatio, scratchRatio);
                scratchCtx.globalCompositeOperation = 'source-over';
                scratchCtx.drawImage(canvas, 0, 0, width, height);
                scratchCtx.fillStyle = '#fff'; //color doesn't matter, but we want full opacity
                scratchCtx.globalCompositeOperation = 'destination-in';
                scratchCtx.beginPath();
                scratchCtx.moveTo(0, 2 * height / 3);
                scratchCtx.lineTo(width - paddingRight, 0);
                scratchCtx.lineTo(width, 0);
                scratchCtx.lineTo(width, height);
                scratchCtx.lineTo(0, height);
                scratchCtx.closePath();
                scratchCtx.fill();
                image.src = scratchCanvas.toDataURL("image/png");
                image.height = height;
                image.width = width;
            }
            return image;
        },

        isTimeDomain: function() {
            return this.getDomain() === 'TIME' || this.getDomain() === 'ACQUISITION';
        },

        isTVD: function() {
            return this.getDomain() === 'TRUE_VERTICAL_DEPTH';
        },

        _createObject: function(obj) {
            obj = obj || {};
            return JSON.parse(JSON.stringify(obj));
        },

        _addLgNamespace: function(objFmt) {
            if (typeof objFmt !== 'object')
                return objFmt;
            for (var key in objFmt) {
                if (key !== '@xsi:schemaLocation' && key != '@xmlns:lg' && key != '@xmlns:xsi' && key[0] != '#') {
                    var newkey = key[0] == '@' ? key.replace('@', '@lg:') : 'lg:' + key;
                    objFmt[newkey] = objFmt[key];
                    delete objFmt[key];
                    if (S.type.isArray(objFmt[newkey])) {
                        for (var i = 0, len = objFmt[newkey].length; i < len; i++) {
                            this.addLgNamespace((objFmt[newkey])[i]);
                        }
                    } else {
                        if (S.type.isObject(objFmt[newkey])) {
                            this.addLgNamespace(objFmt[newkey]);
                        }
                    }
                }
            }
            return objFmt;
        },

        _addDefaultsToObject: function(objName, obj, recurDepth) {
            if (!obj) {
                return;
            }

            if (S.type.isArray(obj)) {
                // just recurse for each item in array
                obj.forEach(function(o) {
                    this._addDefaultsToObject(objName, o, recurDepth + 1);
                }, this);
            } else {
                var ctName = 'ct' + objName;
                var objDefaults = S.lg.CT_DEFAULTS[ctName];
                if (!objDefaults) return;

                for (var defaultKey in objDefaults) {
                    if (!(defaultKey in obj)) {
                        obj[defaultKey] = objDefaults[defaultKey];
                    }
                }

                for (var key in obj) {
                    var childObj = obj[key];
                    if (S.type.isObject(childObj) || S.type.isArray(childObj)) {
                        this._addDefaultsToObject(key, childObj, recurDepth + 1);
                    }
                }

                this._applyDataTypesToObject(objName, obj, S.lg.CT_PROPERTY_TYPES);
            }
        },

        _applyDataTypesToObject: function(objName, obj) {
            if (!S.type.isObject(obj)) {
                return;
            }

            var objTypeName = 'ct' + objName;
            if (objTypeName in S.lg.CT_PROPERTY_TYPES) {
                var objTypes = S.lg.CT_PROPERTY_TYPES[objTypeName];
                var objElems = Object.keys(obj) || [];
                objElems.forEach(function(elemName) {
                    if (elemName in objTypes) {
                        var type = objTypes[elemName];
                        var oldValue = obj[elemName];
                        var newValue;
                        switch (type) {
                            case 'xs:boolean':
                                if (!S.type.isArray(oldValue)) {
                                    var oldType = typeof (oldValue);
                                    if (oldType != 'boolean') {
                                        newValue = (oldValue == 'true');
                                        obj[elemName] = newValue;
                                    }
                                }
                                break;
                            case 'xs:nonNegativeInteger':
                            case 'xs:integer':
                                if (S.type.isArray(oldValue)) {
                                    for (var i = 0; i < oldValue.length; i++) {
                                        newValue = parseInt(oldValue[i]);
                                        oldValue[i] = newValue;
                                    }
                                } else {
                                    newValue = parseInt(oldValue);
                                    obj[elemName] = newValue;
                                }
                                break;
                            case 'stNonNegativeDouble':
                            case 'stPositiveDouble':
                            case 'xs:double':
                                if (S.type.isArray(oldValue)) {
                                    for (var j = 0; j < oldValue.length; j++) {
                                        newValue = parseFloat(oldValue[j]);
                                        oldValue[j] = newValue;
                                    }
                                } else {
                                    newValue = parseFloat(oldValue);
                                    obj[elemName] = newValue;
                                }
                                break;
                        }
                    }
                });
            }
        },

        _preFlightCheck: function() {
            //check objects are needed array
            this.struct.IndexGrid = this.struct.IndexGrid || {};
            this.struct.IndexGrid.IndexLine = this.struct.IndexGrid.IndexLine || [];
            this.struct.Track = this.struct.Track || [];

            if (!S.type.isArray(this.struct.Track)) {
                this.struct.Track = [this.struct.Track];
            }
            var requiredArrayObjects = S.lg.CT_ORDERED_LG_OBJECTS;
            this.struct.Track.forEach(function(track) {
                requiredArrayObjects.forEach(function(objKey) {
                    var item = track[objKey];
                    if (!S.type.isArray(item) && !S.type.isUndefined(item)) {
                        track[objKey] = [item];   // ensure since instance objects are in arrays too.
                    }
                })
            });
            //check index unit 
            var unitSystems = ['English', 'Metric', 'Canadian'];
            var indexUnits = [];
            for (var i = 0; i < unitSystems.length; i++) {
                var indexUnitObj = this.getObjectByUnitSystem('IndexUnit', unitSystems[i], this.struct);
                var indexUnit = this.getObjectTextValue(indexUnitObj);
                if (this.isTimeDomain()) {
                    if ((indexUnit === 'ft') || (indexUnit === 'm')) {
                        indexUnit = 's';
                        indexUnitObj['#text'] = indexUnit;
                    }
                }
                indexUnits.push(indexUnit);
            }

            //Issue #2, force volumeAnalysis channelBinding = mud log
            //'ChannelBinding':{'Filter':{'@Key':'VectorIndex','@Value':'0'}}
            // while operational in prod code, this i not used by implimentation 0
            // FIXME: This should likely happen serverside for anything to be pulled from an alternate source (such as mud log)
            this.struct.Track.forEach(function(theTrack) {
                if (theTrack.VolumeAnalysis) {
                    theTrack.VolumeAnalysis.forEach(function(obj) {
                        obj.ChannelBinding = obj.ChannelBinding || {};
                        obj.ChannelBinding.Filter = obj.ChannelBinding.Filter || [];
                        if (!S.type.isArray(obj.ChannelBinding.Filter)) obj.ChannelBinding.Filter = [obj.ChannelBinding.Filter];
                        obj.ChannelBinding.Filter.push({ '@Key': 'LogType', '@Value': '6' });
                    });
                }
            });
        },

        // returns an array of log binding and channels for each
        _getRequiredChannelBinding: function(matchingBinding) {
            var returnBindings = [];
            this.struct.Track.forEach(function(theTrack) {
                for (var obj in theTrack) {
                    var addFunc = this['_add' + obj + 'Channel'];
                    if (addFunc) {
                        addFunc.call(this, theTrack[obj], matchingBinding, returnBindings)
                    }
                }
            }, this);
            return returnBindings;
        },

        _matchesBinding: function(lgObj, requiredBinding) {
            if (!requiredBinding)
                return true;

            if (!requiredBinding.passName)
                return true; // essentially "*"

            var objPassName = this.getChannelBindingFilterValue("PassName", lgObj);
            if (!objPassName)
                return true; // no restriction

            return (objPassName == requiredBinding.passName);
        },

        _addChannel: function(matchThisBinding, toReturnBindings, channelName, chUnit, lgObj) {
            if (!this._matchesBinding(lgObj, matchThisBinding) || !channelName)
                return;
            // this is now a two step addition
            // 1: Find matching binding (or add it)
            // 2: add channel to that bindings Channels:{}
            var objBinding = this.getChannelDataBinding(lgObj);
            var params = Object.keys(objBinding);
            var addToBinding, match;
            for (var i = 0; i < toReturnBindings.length; i++) {
                match = true;
                for (var p = 0; p < params.length; p++) {
                    match = toReturnBindings[i][params[p]] == objBinding[params[p]];
                }
                if (match) {
                    addToBinding = toReturnBindings[i];
                    break;
                }
            }

            if (!addToBinding) {
                addToBinding = {};
                for (var p = 0; p < params.length; p++) {
                    addToBinding[params[p]] = objBinding[params[p]];
                }
                addToBinding.Channels = {};
                toReturnBindings.push(addToBinding);
            }

            var bindingChannels = addToBinding.Channels;
            var units = bindingChannels[channelName] || [];
            if (units.indexOf(chUnit) < 0) {
                units.push(chUnit);
            }
            bindingChannels[channelName] = units;
        },

        _addCurveChannel: function(fmtObjs, matchingBinding, returnBindings, unitKey) {
            fmtObjs.forEach(function(fmtObj) {
                var unit = this.getObjectByUnitSystem(unitKey || 'Limit', this.unitSystem, fmtObj)['@Unit'];
                this._addChannel(matchingBinding, returnBindings, fmtObj.ChannelName, unit, fmtObj);
            }, this);
        },

        _addMultiPassCurveChannel: function(fmtObjs, matchingBinding, returnBindings) {
            this._addCurveChannel(fmtObjs, matchingBinding, returnBindings);
        },

        _addRepeatAnalysisCurveChannel: function(fmtObjs, matchingBinding, returnBindings) {
            this._addCurveChannel(fmtObjs, matchingBinding, returnBindings);
        },

        _addSymbolCurveChannel: function(fmtObjs, matchingBinding, returnBindings) {
            this._addCurveChannel(fmtObjs, matchingBinding, returnBindings);
        },

        _addPipChannel: function(fmtObjs, matchingBinding, returnBindings) {
            this._addCurveChannel(fmtObjs, matchingBinding, returnBindings, 'Trigger');
        },

        _addValueCurveChannel: function(fmtObjs, matchingBinding, returnBindings) {
            this._addCurveChannel(fmtObjs, matchingBinding, returnBindings, 'TextFormatting');
        },

        _addLithologyChannel: function(fmtObjs, matchingBinding, returnBindings) {
            fmtObjs.forEach(function(fmtObj) {
                this._addChannel(matchingBinding, returnBindings, fmtObj.BkColorChannelName, '', fmtObj);
                this._addChannel(matchingBinding, returnBindings, fmtObj.PatternChannelName, '', fmtObj);
            }, this);
        },

        _addDipAngleChannel: function(fmtObjs, matchingBinding, returnBindings) {
            fmtObjs.forEach(function(fmtObj) {
                var unit = this.getObjectByUnitSystem('Limit', this.unitSystem, fmtObj)['@Unit'];
                this._addChannel(matchingBinding, returnBindings, fmtObj.DipPositionChannelName, unit, fmtObj);
                this._addChannel(matchingBinding, returnBindings, fmtObj.DipAzimuthChannelName, 'deg', fmtObj);
                this._addChannel(matchingBinding, returnBindings, fmtObj.PlanarityChannelName, '', fmtObj);
                this._addChannel(matchingBinding, returnBindings, fmtObj.QualityChannelName, '', fmtObj);
            }, this);
        },

        _addBoreholeDriftChannel: function(fmtObjs, matchingBinding, returnBindings) {
            fmtObjs.forEach(function(fmtObj) {
                var unit = this.getObjectByUnitSystem('Limit', this.unitSystem, fmtObj)['@Unit'];
                this._addChannel(matchingBinding, returnBindings, fmtObj.ChannelName, unit, fmtObj);
                this._addChannel(matchingBinding, returnBindings, fmtObj.HoleAzimuthChannelName, 'deg', fmtObj);
                this._addChannel(matchingBinding, returnBindings, fmtObj.PadOneAzimuthChannelName, 'deg', fmtObj);
            }, this);
        },

        _addWaveformChannel: function(fmtObjs, matchingBinding, returnBindings) {
            this._addCurveChannel(fmtObjs, matchingBinding, returnBindings, 'Amplitude');
        },

        _addVolumeAnalysisChannel: function(fmtObjs, matchingBinding, returnBindings) {
            this._addCurveChannel(fmtObjs, matchingBinding, returnBindings, '');
        },

        _addCumulativeCurvesChannel: function(fmtObjs, matchingBinding, returnBindings) {
            fmtObjs.forEach(function(fmtObj) {
                var unit = this.getObjectByUnitSystem('Limit', this.unitSystem, fmtObj)['@Unit'];
                var areas = fmtObj.CumulativeCurveAreas;
                if (!areas) {
                    var area = fmtObj.CumulativeCurveArea;
                    if (area) {
                        areas = [area];
                    }
                } else {
                    areas = areas.CumulativeCurveArea;
                }
                if (areas) {
                    areas.forEach(function(area) {
                        this._addChannel(matchingBinding, returnBindings, area.ChannelName, unit, fmtObj);
                    }
                    );
                }
            }, this);
        },

        _addVDLChannel: function(fmtObjs, matchingBinding, returnBindings) {
            fmtObjs.forEach(function(fmtObj) {
                this._addChannel(matchingBinding, returnBindings, fmtObj.ChannelName, '', fmtObj);
            }, this);
        },

        _addImageChannel: function(fmtObjs, matchingBinding, returnBindings) {
            this._addVDLChannel(fmtObjs, matchingBinding, returnBindings);
        },

        _addBoreholeImageChannel: function(fmtObjs, matchingBinding, returnBindings) {
            fmtObjs.forEach(function(fmtObj) {
                this._addChannel(matchingBinding, returnBindings, fmtObj.ChannelName, '', fmtObj);
                this._addChannel(matchingBinding, returnBindings, this.getCustomPropertyObject('ChannelName', fmtObj), '', fmtObj);
                this._addChannel(matchingBinding, returnBindings, this.getCustomPropertyObject('TOHChannelName', fmtObj), 'dega', fmtObj);
                this._addChannel(matchingBinding, returnBindings, this.getCustomPropertyObject('AZIChannelName', fmtObj), 'dega', fmtObj);
            }, this);
        },
    });
});