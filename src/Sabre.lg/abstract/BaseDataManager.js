/* global Sabre */
/**
 * Expose to Client to Create a Log view
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    var sEvent = S.event;

    this.BaseDataManager = S.Class({

        init: function(params) {
            this.context = params.context;
            this.logsData = null; // associative array of LogData{}
            this.transformedData = null;
            this.currentLogId = 0;
        },

        fetchEntryInfo: function(args) {
            sEvent.fire(this.context, S.lg.ENTRY_INFO_COMPLETE_EVENT, args);
        },

        fetchUserInfo: function(args) {
            sEvent.fire(this.context, S.lg.USER_INFO_COMPLETE_EVENT, args);
        },

        fetchFormatSettings: function(args) {
            sEvent.fire(this.context, S.lg.FORMAT_SETTINGS_COMPLETE_EVENT, args);
        },

        fetchPatternTable: function(args) {
            sEvent.fire(this.context, S.lg.PATTERN_TABLE_COMPLETE_EVENT, args);
        },

        fetchFormat: function(args) {
            sEvent.fire(this.context, S.lg.FORMAT_COMPLETE_EVENT, args);
        },

        fetchRange: function(args) {
            sEvent.fire(this.context, S.lg.RANGE_COMPLETE_EVENT, args);
        },

        fetchChannelData: function(args) {
            sEvent.fire(this.context, S.lg.CHANNEL_DATA_COMPLETE_EVENT, args);
        },

        fetchTransformedData: function(args) {
            sEvent.fire(this.context, S.lg.TRANSFORMED_DATA_COMPLETE_EVENT, args);
        },

        getlogsDataIds: function() {
            return this.logsData ? Object.keys(this.logsData).sort(function(a, b) {
                return parseInt(a) - parseInt(b);
            }) : [];
        },

        getLogDataForLogId: function(logId, mnemonics, startIndex, EndIndex, extraPoints) {
            var fullLog = this.logsData ? this.logsData[logId] : null;
            return fullLog ? fullLog.filter(mnemonics, startIndex, EndIndex, extraPoints) : fullLog;
        },

        getLogDataForHittedPoints: function(logId, channelNames, index, maxDistance) {
            var fullLog = this.logsData ? this.logsData[logId] : null;
            return fullLog ? fullLog.getHittedPoints(channelNames, index, maxDistance) : null;
        },

        getFirstLogForBinding: function(binding, withDataOnly, containingChannel) {
            var logIds = this.getlogsDataIds();
            withDataOnly = containingChannel ? true : withDataOnly;

            for (var i = 0, logCount = logIds.length; i < logCount; i++) {
                var theLog = this.logsData[logIds[i]];
                if (theLog.matchesBinding(binding)) {
                    if (withDataOnly) {
                        if (theLog.containsData()) {
                            if (theLog.data[containingChannel] && theLog.data[containingChannel].size() > 0) {
                                return theLog;
                            }
                        }

                    } else {
                        return theLog;
                    }
                }
            }
            return undefined; // no match.
        },

        getLogsForBinding: function(binding, withDataOnly, containingChannel) {
            //select all logs matching binding, containing column "containingChannel"
            var logIds = this.getlogsDataIds();
            if (containingChannel) withDataOnly = true;

            var matchingLogs = [];
            for (var i = 0, logCount = logIds.length; i < logCount; i++) {
                var theLog = this.logs[logIds[i]];
                if (withDataOnly) {
                    if (theLog.containsData()) {
                        if (containingChannel) {
                            if (theLog.data[containingChannel]) {
                                matchingLogs.push(theLog);
                            }
                        } else {
                            matchingLogs.push(theLog);
                        }

                    }
                } else {
                    return theLog;
                }
            }
            return matchingLogs;
        },

        getFirstChannelForBinding: function(binding, channelName) {
            var matchedChannel;
            var log = this.getFirstLogForBinding(binding, true, channelName);
            return log ? log.data[channelName] : matchedChannel;
        },

        getFirstChannel: function(channelName) {
            var matchedChannel;
            this.getlogsDataIds().some(function(id) {
                var theLog = this.logs[logIds[i]];
                matchedChannel = theLog.data[channelName];
                return !!(theLog.data[channelName]);
            }, this);

            return matchedChannel;
        },

        addLogData: function(log) {
            this.logsData = this.logsData || {};
            this.logsData[++this.currentLogId] = log;
            return this.currentLogId;
        },

        loadApiData: function(webApiData) {
            var loadedLogs = [];
            var logIds = this.getlogsDataIds();
            webApiData.forEach(function(apiLog) {
                var log = new S.lg.LogData(apiLog);
                var existingLog;
                var newLogId;
                logIds.some(function(logId) {
                    existingLog = this.logsData[logId];
                    newLogId = logId;
                    return log.logType == this.logsData[logId].LogType;
                });

                if (existingLog) {
                    existingLog.mergeDataWith(log)
                }
                else {
                    newLogId = this.addLogData(log);
                }
                loadedLogs.push(newLogId);
            }, this);

            return loadedLogs;
        }
    });
});