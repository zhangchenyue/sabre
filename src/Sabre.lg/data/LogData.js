/* global Sabre */
/**
 * Expose to Client to Create a Log view
 */
Sabre.pack('Sabre.lg', function (S) {
    'use strict'

    var ChannelData = this.ChannelData;
    /**
     * manage mutiple Channels data (store kinds of channel data)
     */
    this.LogData = S.Class({

        init: function (options) {
            this.wellId = options.WellId;		     // int
            this.id = options.Id;			         // int (section or subsectionId)
            this.witsmlIds = options.WitsmlIds;	     // array[3] of string
            this.logName = options.LogName;
            this.logType = options.LogType;
            this.increasing = options.Increasing;
            this.indexUnit = options.IndexUnit;	     // string
            this.minIndex = options.MinIndex;		 // double
            this.maxIndex = options.MaxIndex; 	     // double
            this.data = options.Data; 		         // associative array of ChannelData
            //convert to ChannelData
            if (options.Data) {
                for (var key in options.Data) {
                    options.Data[key].ChannelName = key;
                    options.Data[key].IndexUnit = options.IndexUnit;
                    this.data[key] = new ChannelData(options.Data[key]);
                }
            }
        },

        containsData: function () {
            return !!(this.data);
        },

        unitsForChannels: function (channelNames) {
            var existingChannelsUnit
            if (!this.data || !S.type.isArray(channelNames))
                return existingChannelsUnit;

            this.mapChannelNames(channelNames, function (cName, cData) {
                existingChannelsUnit[cName] = cData.Unit;
            });

            return existingChannelsUnit;
        },

        getHittedPoints: function (channelNames, index, maxDistance) {
            var hittedPoints;
            if (!this.data)
                return hittedPoints;

            this.mapChannelNames(channelNames, function (cName, cData) {
                hittedPoints[cName] = cData.getClosestPoint(index, maxDistance);
            });

            return hittedPoints;
        },

        matchesBinding: function (requiredBinding) {
            if (!requiredBinding) 
                return true;
            
            var matches = true;
            matches = matches && ((!requiredBinding.PassName) ? true : requiredBinding.PassName == this.LogName);
            matches = matches && ((!requiredBinding.LogType) ? true : requiredBinding.LogType == this.LogType);
            matches = matches && ((!requiredBinding.LogId) ? true : requiredBinding.LogId == this.Id);
            return matches;
        },
        
        filter: function (channelNames, minIndex, maxIndex, extraPoints) {
            var filteredLog = new S.lg.LogData({
                WellId: this.wellId,
                Id: this.id,
                WitsmlIds: this.witsmlIds,
                LogName: this.logName,
                LogType: this.logType,
                Increasing: this.increasing,
                IndexUnit: this.indexUnit,
                MinIndex: this.minIndex,
                MaxIndex: this.maxIndex,
                Data:{}
            });

            if (!this.data)
                return filteredLog;

            var channelIndex = 0;
            this.mapChannelNames(channelNames, function (cName, cData) {
                var filteredChannelData = cData.subRange(minIndex, maxIndex, extraPoints);
                if (filteredChannelData) {
                    filteredLog.data[cName] = filteredChannelData;
                    if (channelIndex === 0) {
                        filteredLog.minIndex = filteredChannelData.minIndex;
                        filteredLog.maxIndex = filteredChannelData.maxIndex;
                    } else {
                        filteredLog.minIndex = Math.min(filteredLog.minIndex, filteredChannelData.minIndex);
                        filteredLog.maxIndex = Math.max(filteredLog.maxIndex, filteredChannelData.maxIndex);
                    }
                    channelIndex++;
                }
            });
            return filteredLog;
        },
        /**
         *  this is the classical form of merge whereby channels(from multiple passes) are brought together, overwriting when duplicates are available.
         *  NOTE: Individual values not merged.
         *  the resulting log contains channels from log 1 and channels from log2.
         *  if log 1 and log 2 contain the same channelname, log1's channel is completely overwritten by channel 
         *  NOTE: This is NOT a deep copy of channel datas (keep ram consumption low)
         */
        mergedWith: function (log2) {
            var mergedLog = new S.lg.LogData({
                WellId: this.wellId,
                Id: this.id,
                WitsmlIds: this.witsmlIds,
                LogName: this.logName,
                LogType: this.logType,
                Increasing: this.increasing,
                IndexUnit: this.indexUnit,
                MinIndex: this.minIndex,
                MaxIndex: this.maxIndex,
                Data:{}
            });

            var channelNames;
            this.mapChannelNames(channelNames, function (cName, cData) {
                mergedLog.data[cName] = cData;
            });

            this.mapChannelNames.call(log2, channelNames, function (cName, cData) {
                mergedLog.data[cName] = cData;
            });

            return mergedLog;
        },

        mergeDataWith: function (log2) {
            if (!log2.data)
                return;

            var channelNames = Object.keys(log2.data);
            this.data = this.data || {};
            for (var i = 0, len = channelNames.length; i < len; i++) {
                var cName = channelNames[i];
                var targetChannel = log2.Data[cName];
                var sourceChannel = this.Data[cName];

                if (!targetChannel || targetChannel.size() <= 0) {
                    continue;
                }
                if (!sourceChannel) {
                    this.data[cName] = targetChannel;
                }
                else {
                    this.mergeChannelData(sourceChannel, targetChannel, log2.Increasing);
                }
            }

        },

        mergeChannelData: function (sourceChannel, targetChannel, increasing) {
            if (targetChannel.maxIndex > sourceChannel.maxIndex) {
                var startIndex = Math.max(sourceChannel.maxIndex, targetChannel.minIndex);
                var pos = targetChannel.indexes.indexOf(startIndex);
                if (increasing) {
                    sourceChannel.indexes = sourceChannel.indexes.concat(targetChannel.indexes.slice(pos));
                    sourceChannel.values = sourceChannel.values.concat(targetChannel.values.slice(pos));
                }
                else {
                    sourceChannel.indexes = targetChannel.indexes.slice(0, pos).concat(sourceChannel.indexes);
                    sourceChannel.values = targetChannel.values.slice(0, pos).concat(sourceChannel.values);
                }
                sourceChannel.maxIndex = targetChannel.maxIndex;
            }
            if (targetChannel.minIndex < sourceChannel.minIndex) {
                startIndex = Math.min(sourceChannel.minIndex, targetChannel.maxIndex);
                pos = targetChannel.indexes.indexOf(startIndex);
                if (increasing) {
                    sourceChannel.indexes = targetChannel.indexes.slice(0, pos).concat(sourceChannel.indexes);
                    sourceChannel.values = targetChannel.values.slice(0, pos).concat(sourceChannel.values);
                }
                else {
                    sourceChannel.indexes = sourceChannel.indexes.concat(targetChannel.indexes.slice(pos));
                    sourceChannel.values = sourceChannel.values.concat(targetChannel.values.slice(pos));
                }
                sourceChannel.minIndex = targetChannel.minIndex;
            }
            sourceChannel.minValue = Math.min(sourceChannel.minValue, targetChannel.minValue);
            sourceChannel.maxValue = Math.max(sourceChannel.maxValue, targetChannel.maxValue);

        },

        mapChannelNames: function (channelNames, handler) {
            channelNames = channelNames || Object.keys(this.data);
            for (var i = 0, len = channelNames.length; i < len; i++) {
                var cName = channelNames[i];
                var cData = this.data[cName];
                if (cData && cData.size() > 0) {
                    handler.call(this, cName, cData);
                }
            }
        }
    });
});