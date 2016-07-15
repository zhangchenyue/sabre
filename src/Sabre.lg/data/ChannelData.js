/* global Sabre */
/**
 * Expose to Client to Create a Log view
 */
Sabre.pack('Sabre.lg', function (S) {
    'use strict'

    this.ChannelData = S.Class({

        init: function (options) {
            this.name = options.ChannelName;
            this.description = options.ChannelDescription;
            this.indexUnit = options.IndexUnit;
            this.unit = options.Unit;                          // data unit
            this.type = options.Type;                          // data type e.g. double, double[] etc
            this.maxIndex = parseFloat(options.MaxIndex);
            this.minIndex = parseFloat(options.MinIndex);
            this.maxValue = parseFloat(options.MaxValue);
            this.minValue = parseFloat(options.MinValue);
            this.rate = parseFloat(options.Rate);
            this.indexes = options.Indexes || null;  //index array (1D), not deep copy
            this.values = options.Values || null;    //value array,(1D or 2D or XD), not deep copy
        },

        appendValue: function (value, atIndex) {
            this.indexes = this.indexes || [];
            this.values = this.values || [];
            this.indexes.push(atIndex);
            this.values.push(value);
        },

        isIndexIncreasing: function () {
            var increasing = false;
            if ((S.type.isArray(this.indexes)) && (this.indexes.length > 1)) {
                increasing = (this.indexes[0] < this.indexes[this.indexes.length - 1]);
            }
            return increasing;
        },

        // avoid confustion with .length or .count
        size: function () {
            return S.type.isArray(this.indexes) ? this.indexes.length : 0;
        },  
        /**
         * returns the closes indexNumber for the IndexValue.
         * if out of range....  for now return 0 or size-1 depending on the direction.
         */
        getIndexNumForIndexValue: function (theIndex, clipToRange) {
            var returnIndex;
            var size = this.size();
            if (size <= 1) {
                return 0;
            }

            var increasing = this.isIndexIncreasing();
            var low = 0;
            var high = size - 1;
            var middle;
            var found = false;

            var indexes = this.indexes;
            if (increasing) {
                while (low <= high) {
                    middle = Math.floor((high + low) / 2);
                    if (theIndex > indexes[middle]) {
                        low = middle + 1;
                    } else if (theIndex < indexes[middle]) {
                        high = middle - 1;
                    } else {
                        found = true;
                        break;
                    }
                }
            } else {
                while (low <= high) {
                    middle = Math.floor((low + high) / 2);
                    if (theIndex > indexes[middle]) {
                        high = middle - 1;
                    } else if (theIndex < indexes[middle]) {
                        low = middle + 1;
                    } else {
                        found = true;
                        break;
                    }
                }
            }

            if (found) {
                returnIndex = middle ? middle : 0;
            } else {
                if ((high >= 0) && (low >= 0) && (low < size) && (high < size)) {
                    var lowIndex = this.Indexes[low];
                    var hiIndex = this.Indexes[high];
                    var fraction = (theIndex - lowIndex) / (hiIndex - lowIndex);
                    returnIndex = low - fraction;
                } else {
                    //value was out of range.
                    // this is really the worst cas as if we're here we've taken as long as possible.
                    // should be an uncommon occurance thouth, this shouldn't be used often to find bogus values.
                    if (clipToRange) {
                        if ((high < 0) || (low < 0)) {
                            returnIndex = 0;
                        } else {
                            returnIndex = size - 1;
                        }
                    } else {
                        returnIndex = -1;
                    }
                }
            }
            return returnIndex;
        },

        getValueAtIndexNumber: function (indexNum, vectorIndex) {
            return (S.type.isUndefined(vectorIndex)) ? this.values[indexNum] : (this.values[indexNum][vectorIndex] || this.values[indexNum]);
        },

        getValueAtIndexValue: function (indexValue, gapTolerance, vectorIndex) {
            var indexNum = this.getIndexNumForIndexValue(indexValue, true);
            if (indexNum == indexNum.toFixed()) {
                return this.getValueAtIndexNumber(indexNum, vectorIndex);
            } else {
                var hi = Math.ceil(indexNum);
                if (hi >= this.indexes.length) return -999.25;

                var lo = Math.floor(indexNum);
                if (Math.abs(this.indexes[hi] - this.indexes[lo]) > gapTolerance) return -999.25;
                var frac = indexNum - lo;

                //TODO: Optimize once proven.
                var hiValue = this.values[hi];
                var loValue = this.values[hi];
                var value = loValue + frac * (hiValue - loValue);
                if (isNaN(value)) {
                    value = -999.25;
                }

                // must interpolatepoint
                return value;
            }
        },

        subRange: function (minIndex, maxIndex, extraPoints) {
            // acts upon the channelData itself, discading data outside the requested range.
            extraPoints = extraPoints || 0;
            minIndex = (S.type.isUndefined(minIndex)) ? this.minIndex : minIndex;
            maxIndex = (S.type.isUndefined(maxIndex)) ? this.maxIndex : maxIndex;

            var minIndexNum = this.getIndexNumForIndexValue(minIndex, true);
            var maxIndexNum = this.getIndexNumForIndexValue(maxIndex, true);

            var start = Math.max(Math.floor(Math.min(minIndexNum, maxIndexNum)) - extraPoints, 0);
            var end = Math.min(Math.ceil(Math.max(minIndexNum, maxIndexNum)) + extraPoints + 1, this.size() - 1);

            if (end - start < 0) {
                return undefined;
            }
            
            //return a copy data of sub range
            return new S.lg.ChannelData({
                ChannelName: this.name,
                ChannelDescription: this.description,
                IndexUnit: this.indexUnit,
                Unit: this.unit,
                Type: this.type,
                Rate: this.rate,
                MaxIndex: Math.max(this.indexes[start], this.indexes[end]),
                MinIndex: Math.min(this.indexes[start], this.indexes[end]),
                MaxValue: this.maxValue,//TODO: API decision:  SCAN IT LATER, must match range (or always full range)
                MinValue: this.minValue,//TODO: API decision:  SCAN IT LATER, must match range (or always full range)
                Indexes: S.type.isArray(this.indexes) ? this.indexes.slice(start, end + 1) : null,
                Values: S.type.isArray(this.values) ? this.values.slice(start, end + 1) : null
            });
        },

        copy: function () {
            return this.subRange();
        },

        flip: function () {
            var flipped = this.copy();
            if (S.type.isArray(flipped.indexes) && S.type.isArray(flipped.values)) {
                flipped.indexes.reverse();
                flipped.values.reverse();
            }
            return flipped;
        },

        sort: function (increasing) {
            var sortable = [];
            for (var i = 0, len = this.indexes.length; i < len; i++) {
                sortable.push({ Index: this.indexes[i], Value: this.values[i] });
            }

            if (increasing) {
                sortable.sort(function (a, b) {
                    return ((a.Index < b.Index) ? -1 : ((a.Index == b.Index) ? 0 : 1));
                });
            } else {
                sortable.sort(function (a, b) {
                    return ((a.Index < b.Index) ? 1 : ((a.Index == b.Index) ? 0 : -1));
                });
            }

            for (var j = 0, l = sortable.length; j < l; j++) {
                this.indexes[j] = sortable[j].Index;
                this.values[j] = sortable[j].Value;
            }
        },

        getClosestPoint: function (index, maximumDistance) {
            if (S.type.isUndefined(maximumDistance)) {
                maximumDistance = 1;
            }
            var ClosestChannelData = new S.lg.ChannelData({
                ChannelName: this.channelName,
                ChannelDescription: this.description,
                IndexUnit: this.indexUnit,
                Unit: this.unit,
                Type: this.type,
                Rate: this.rate,
                MaxIndex: this.maxIndex,
                MinIndex: this.minIndex,
                MaxValue: this.maxValue,
                MinValue: this.minValue
            });

            var indexIncreasing = this.isIndexIncreasing();
            if (S.type.isArray(this.indexes)) {
                var mid;
                var lo = 0;
                var hi = this.Indexes.length - 1;

                while (hi - lo > 1) {
                    mid = Math.floor((lo + hi) / 2);
                    if ((this.indexes[mid] < index && indexIncreasing) || (this.indexes[mid] > index && !indexIncreasing)) {
                        lo = mid;
                    } else {
                        hi = mid;
                    }
                }
                var disL = Math.abs(index - this.indexes[lo]);
                var disH = Math.abs(this.indexes[hi] - index);
                if (disL <= disH && disL < maximumDistance) {
                    ClosestChannelData.Point = { Index: this.indexes[lo], Value: this.values[lo] }
                }
                else if (disH < maximumDistance) {
                    ClosestChannelData.Point = { Index: this.indexes[hi], Value: this.values[hi] }
                }
            }
            return ClosestChannelData;
        }
    });
});