Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    var sEvent = S.event;
    var sStorage = S.storage;

    this.LocalDataManager = S.Class({ extend: this.BaseDataManager }, {
        init: function(options) {
            S.lg.LocalDataManager.callSuper(this, 'init', options);
            this.configId = options.configId || '868';
            this.currentEntry = null;
            this.currentUser = null;
            this.logFormat = null;
            this.timeLogUp = false;
            this.localDatabase = window.fakeDB;
            this.iwwPatternName = "IWWPatterns.xml";
            this.minIndex = null;
            this.maxIndex = null;
            this.absentInterval = 0;
        },

        fetchEntryInfo: function() {
            var db = this.localDatabase;
            if (!db || !db.entry) {
                return;
            }

            this.currentEntry = db.entry.data.ResultSet[0];
            if (this.currentEntry) {
                this.timeLogsUp = (this.currentEntry.activity.toLowerCase() === 'wireline');
            }
            S.lg.LocalDataManager.callSuper(this, 'fetchEntryInfo');
        },

        fetchUserInfo: function() {
            var db = this.localDatabase;
            if (!db || !db.info) {
                return;
            }

            sStorage.setItem('lastUser', db.info.data.ResultSet.UserName);
            this.currentUser = db.info.data.ResultSet;

            var unitSystem = db.info.data.ResultSet.UnitSystem = 'English';
            sStorage.setItem('unitSystem', unitSystem);
            if (!sStorage.getItem('timeLogGapInterval_s')) {
                sStorage.setItem('timeLogGapInterval_s', '300');
                sStorage.setItem('depthLogGapInterval_ft', '5');
            }

            S.lg.LocalDataManager.callSuper(this, 'fetchUserInfo');
        },

        fetchFormatSettings: function() {
            var db = this.localDatabase;
            if (!db || !db.settings) {
                return;
            }
            this.settings = db.settings.data.ResultSet[this.configId];

            S.lg.LocalDataManager.callSuper(this, 'fetchFormatSettings');
        },

        fetchPatternTable: function() {
            var db = this.localDatabase;
            if (!db || !db.patterntable) {
                return;
            }
            this.patternTables = db.patterntable.data;
            var patternTableNames = Object.keys(this.patternTables);
            if (patternTableNames.length >= 1) {
                this.iwwPatternName = patternTableNames[0];
            }

            S.lg.LocalDataManager.callSuper(this, 'fetchPatternTable');
        },

        fetchFormat: function(qUnitSystem) {
            var db = this.localDatabase;
            if (!db || !db.template) {
                return;
            }

            var ids = Object.keys(db.template.data);
            if (ids.length > 0) {
                var formatObj = db.template.data[ids[0]];
                qUnitSystem = qUnitSystem || sStorage.getItem('unitSystem');
                var unitSystem = qUnitSystem || 'English';
                if (unitSystem.toLowerCase() === 'statoil') {
                    unitSystem = 'Metric';
                }
                this.logFormat = S.lg.Lg3Format({ id: ids[0], jFormat: formatObj, unitSystem: unitSystem });
                //this.logFormat.setPatternTables(this.patternTables, this.iwwPatternName);
            }

            S.lg.LocalDataManager.callSuper(this, 'fetchFormat');
        },

        fetchRange: function() {
            var db = this.localDatabase;
            if (!db || !db.range) {
                return;
            }
            var logs = db.range.data.ResultSet;

            if (S.type.isArray(logs)) {
                if (logs.length > 0) {
                    var log = logs[0];
                    if (logs[0].MaxIndex === null || logs[0].MinIndex === null) {
                        log = logs[1] || logs[0];
                    }
                    this.minIndex = log.MinIndex;
                    this.maxIndex = log.MaxIndex;
                    if (this.minIndex === null || this.maxIndex === null) {
                        sEvent.fire(this.context, 'EMPTY_RANGE');
                        return;
                    }

                    this.increasing = log.Increasing;
                    this.absentInterval = log.logType === 0 ? parseFloat(sStorage.getItem('timeLogGapInterval_s')) : parseFloat(sStorage.getItem('depthLogGapInterval_ft'));
                }
            }
            S.lg.LocalDataManager.callSuper(this, 'fetchRange', { minIndex: this.minIndex, maxIndex: this.maxIndex, indexUnit: log.IndexUnit });
        },

        fetchChannelData: function() {
            var db = this.localDatabase;
            if (!db || !db.data) {
                return;
            }

            var hasData = false;
            for (var i = 0; i < db.data.data.ResultSet.length; i++) {
                var log = db.data.data.ResultSet[i];
                if (log.Data && Object.keys(log.Data)) {
                    hasData = true;
                    break;
                }
            }
            if (!hasData) {
                return;
            }

            var loadedMinIndex = Number.NaN;
            var loadedMaxIndex = Number.NaN;

            db.data.data.ResultSet.forEach(function(log) {
                if (log.Data) {
                    Object.keys(log.Data).forEach(function(c) {
                        if (log.Data[c].Indexes) {
                            loadedMinIndex = isNaN(loadedMinIndex) ? log.Data[c].MinIndex : Math.min(loadedMinIndex, log.Data[c].MinIndex);
                            loadedMaxIndex = isNaN(loadedMaxIndex) ? log.Data[c].MaxIndex : Math.max(loadedMaxIndex, log.Data[c].MaxIndex);
                        }
                    });
                }
            });
            var loadedLogIds = this.loadApiData(db.data.data.ResultSet);

            loadedLogIds.forEach(function(logId) {
                var dataLog = this.getLogDataForLogId(logId);
                this.minIndex = Math.min(this.minIndex, dataLog.minIndex);
                this.maxIndex = Math.max(this.maxIndex, dataLog.maxIndex);
            }, this);


            if (loadedLogIds.length > 0) {

                var firstLogId, secondLogId;
                var firstLog, secondLog;

                firstLogId = loadedLogIds[0];
                firstLog = this.getLogDataForLogId(firstLogId);

                if (loadedLogIds.length == 2) {

                    firstLogId = loadedLogIds[0];
                    secondLogId = loadedLogIds[1];
                    firstLog = this.getLogDataForLogId(firstLogId);
                    secondLog = this.getLogDataForLogId(secondLogId);

                    if (((firstLog.LogType == 1) && (secondLog.LogType == 6))
                        || ((firstLog.LogType == 6) && (secondLog.LogType == 1))
                    ) {
                        if (firstLog.LogType == 6) {
                            var temp = firstLog;
                            firstLog = secondLog;
                            secondLog = temp;
                        }
                        var mergedLog = firstLog.mergedWith(secondLog);
                        var mergedId = this.addLogData(mergedLog);

                        firstLogId = mergedId;
                        firstLog = mergedLog;
                    }
                }
            }

            S.lg.LocalDataManager.callSuper(this, 'fetchChannelData');
        },

        getTransformedData: function() {
            S.lg.LocalDataManager.callSuper(this, 'fetchTransformedData');
        },
    });
});