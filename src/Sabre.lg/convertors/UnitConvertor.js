/**
 * Using InterACT webapi, not support cross-region
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'
    var ST = S.type;

    this.UnitConvertor = S.Class({
        init: function(options) {
            this.from = options.from;
            this.to = options.to;
            this.unitRegExp = /^([0-9]*)(?:\s*)(.*)/;
            this.unitAPI = null;
            this._cachedConversions = Sabre.lg.CT_CONVERSIONS;

            if ((ST.isUndefined(this.to) && this.from === 'unitless') ||
                (ST.isUndefined(this.from) && this.to === 'unitless') ||
                (ST.isUndefined(this.to) && ST.isUndefined(this.from))) {
                this.Gain = 1;
                this.Offset = 0;
            } else {
                this._computeGainOffset(this.from, this.to);
            }
        },

        isAvailable: function(from, to) {
            var test = this.init({ 'from': from, 'to': to });
            return !(ST.isUndefined(test.Gain));
        },

        convert: function(value, from, to) {
            if (ST.isUndefined(from) && ST.isUndefined(to)) {
                return value * this.Gain + this.Offset;
            }
            this.init(from, to);
            return value * this.Gain + this.Offset;
        },

        setApi: function(unitAPI) {
            this.unitAPI = unitAPI;
        },

        popRequestedUnits: function() {
            if (!this.unitAPI) {
                return;
            }
            this.requests = this.requests || [];

            var keys = Object.keys(this.requests);
            if (keys.length > 0) {
                var key = keys[0],
                    units = this.requests[key],
                    from = units.from,
                    to = units.to,
                    UC = this;
                this.unitAPI.getConversion(from, to,
                    function(result) {
                        var requests = UC.requests;
                        delete requests[from + ',' + to];
                        UC.popRequestedUnits();
                        if (result.success) {
                            UC._cache(from, to, result.data.ResultSet);
                        }
                    });
            }
        },

        getConversions: function(conversions, completion, progress) {
            if (!this.unitAPI) {
                return;
            }
            var UC = this;
            this.unitAPI.getConversions(
                conversions,
                function(result) {
                    if (result.success) {
                        var cachMe = result.data;
                        if (ST.isArray(cachMe)) {
                            for (var i = 0, len = cachMe.length; i < len; i++) {
                                var conv = cachMe[i];
                                UC._cache(conv.from, conv.to, { 'Gain': conv.Gain, 'Offset': conv.Offset });
                            }
                        }
                    }
                    completion(result);
                }
                , progress);
        },

        checkRequiredConversions: function(fromChannels, toChanels, completion) {
            var missingConversions = [];
            var fromChannelNames = Object.keys(fromChannels);
            for (var i = 0, len = fromChannelNames.length; i < len; i++) {
                var fromChannelName = fromChannelNames[i];
                var from = fromChannels[fromChannelName];
                from = this.extractPregainAndUnit(from).unit;
                var toArray = toChanels[fromChannelName];
                for (var j = 0; j < toArray.length; j++) {
                    var to = toArray[j];
                    to = this.extractPregainAndUnit(to).unit;
                    if (ST.isUndefined(to) || ST.isUndefined(from)) {
                        continue;
                    }

                    if ((to === '*') || (from === '*')) {
                        continue;
                    }

                    if (!this.isAvailable(to, from)) {
                        missingConversions.push({ 'from': from, 'to': to });
                    }

                    if (!this.isAvailable(to, from)) {
                        missingConversions.push({ 'from': to, 'to': from });
                    }
                }
            }

            if (missingConversions.length > 0) {
                this.getConversions(missingConversions, completion);
            } else {
                completion();
            }
        },

        _fixUnit: function(unit) {
            if (unit == '' || unit == 'NULL' || unit == '----' || unit == null)
                unit = 'unitless';
            return unit;
        },

        _extractPregainAndUnit: function(pregain_unit) {
            var match = this.unitRegExp.exec(pregain_unit);
            var unit = pregain_unit;
            var pregain = parseFloat(match[1]);

            if (pregain > 0) {
                unit = match[2];
            } else {
                pregain = 1;
            }

            return {
                'unit': unit,
                'pregain': pregain
            };
        },

        _cache: function(from, to, goObj) {
            if (goObj != null &&
                !(ST.isUndefined(goObj.Offset)) &&
                !(ST.isUndefined(goObj.Gain)) &&
                !(ST.isUndefined(from)) &&
                !(ST.isUndefined(to))
            ) {
                var cache = this._cachedConversions[from] || {};
                cache[to] = goObj;
                this._cachedConversions[from] = cache;
            } else {
                if (!(ST.isUndefined(from)) &&
                    !(ST.isUndefined(to))) {
                    cache = this._cachedConversions[from] || {};
                    cache[to] = { Gain: 1, Offset: 0 };
                    this._cachedConversions[from] = cache;
                }
            }
        },

        _getMissingConversion: function(from, to) {
            if (this.unitApi) {
                this.requests = this.requests || [];
                var key = from + ',' + to;
                var pending = this.requests[key];
                if (pending) {

                } else {
                    this.requests[key] = { 'from': from, 'to': to }; // queueu the request
                    this.popRequestedUnits();
                }
            }
        },

        _computeGainOffset: function(from, to) {
            var toSplit = this._extractPregainAndUnit(to);
            var toPregain = toSplit.pregain;
            to = toSplit.unit;

            var fromSplit = this._extractPregainAndUnit(from);
            var fromPregain = fromSplit.pregain;
            from = fromSplit.unit;

            var conv;
            if (from == to) {
                conv = {};
                conv.Gain = 1;
                conv.Offset = 0;

            } else {
                conv = this._cachedConversions[from];
                if (conv) {
                    conv = conv[to];
                }
            }

            if (typeof conv === 'undefined') {
                this.Gain = 1;
                this.Offset = 0;
                this._getMissingConversion(from, to);
            } else {
                this.Gain = conv.Gain;
                this.Offset = conv.Offset;
                if (toPregain > 1) {
                    this.Gain /= toPregain; // lbf   TO 1000 lbf
                }
                if (fromPregain > 1) {
                    this.Gain *= fromPregain; // 1000 lbf   TO lbf
                }
            }

        }

    })
});