/* global Sabre */
/**
 * Expose to Client to Create a Log view
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    var sDom = S.dom,
        sEvent = S.event;
    var isTouchDevice = S.platform.touchDevice;

    var startEvt = isTouchDevice ? 'touchstart' : 'mousedown';
    var moveEvt = isTouchDevice ? 'touchmove' : 'mousemove';
    var endEvt = isTouchDevice ? 'touchend' : 'mouseup';


    this.View = S.Class({
        /**
         * initialize params
         * options {object} --param object
         *      options.id -- [required]container dom container id
         *      options.dataManager --[option]use customized data manager, by default use local data manager and static sample data
         *      options.autoRefresh -- [default]true
         *      options.editor -- [default]true
         *      option.startNow -- [default]true
         */
        init: function(options) {
            this.container = options ? sDom.query(options.id) : [];
            this.container = this.container.length ? this.container[0] : document.body;
            this.dataManager = options.dataManager || S.lg.LocalDataManager({ context: this }) || S.lg.InterACTDataManager({ context: this });
            this.autoRefresh = options.autoRefresh ? true : false;
            this.editor = options.editor || false;
            this.topInsert = S.lg.Insert({ lg3Fmt: null, fromBottom: true });
            this.area = S.lg.Area({ lg3Fmt: null });
            this.bottomInsert = S.lg.Insert({ lg3Fmt: null, fromBottom: false });
            this.div = sDom.create('div');
            this.div.appendChild(this.topInsert.getDom());
            this.div.appendChild(this.area.getDom());
            this.div.appendChild(this.bottomInsert.getDom());
            this.container.appendChild(this.div);
            this.prepareDataCompletionFlag = {};
            this._bindHandler();

            if (options.startNow) {
                this.run();
            }
        },

        run: function() {
            this.prepareDataCompletionFlag = {
                entryInfo: 'EntryInfo',
                userInfo: 'UserInfo',
                formatSettings: 'FormatSettings',
                patternTable: 'PatternTable'
            };
            this._getPrepareData();
        },

        destory: function() {
            var b = this.container;
            sEvent.off(b, [startEvt, moveEvt, endEvt].join(' '), this._handleEvent);
            sDom.remove(b);
        },

        draw: function() {
            //for test
            this.topInsert.draw();
            this.bottomInsert.draw();
            this.area.draw();
        },

        /** private functions 
         * 
        */
        _bindHandler: function() {
            //data notification event
            sEvent.on(this, S.lg.ENTRY_INFO_COMPLETE_EVENT, S.bind(this._onEntryInfoComplete, this));
            sEvent.on(this, S.lg.USER_INFO_COMPLETE_EVENT, S.bind(this._onUserInfoComplete, this));
            sEvent.on(this, S.lg.FORMAT_SETTINGS_COMPLETE_EVENT, S.bind(this._onFormatSettingsComplete, this));
            sEvent.on(this, S.lg.PATTERN_TABLE_COMPLETE_EVENT, S.bind(this._onPatternTableComplete, this));
            sEvent.on(this, S.lg.FORMAT_COMPLETE_EVENT, S.bind(this._onFormatComplete, this));
            sEvent.on(this, S.lg.RANGE_COMPLETE_EVENT, S.bind(this._onRangeComplete, this));
            sEvent.on(this, S.lg.CHANNEL_DATA_COMPLETE_EVENT, S.bind(this._onChannelDataComplete, this));
            sEvent.on(this, S.lg.TRANSFORMED_DATA_COMPLETE_EVENT, S.bind(this._onTransformedDataComplete, this));
            //ui event
            sEvent.on(this, moveEvt, S.bind(this._onMoveEvt, this));
            sEvent.on(this, endEvt, S.bind(this._onEndEvt, this));
        },

        _getPrepareData: function() {
            this.dataManager.fetchEntryInfo();
            this.dataManager.fetchUserInfo();
            this.dataManager.fetchFormatSettings();
            this.dataManager.fetchPatternTable();
        },

        //callback functions
        _onEntryInfoComplete: function(eData) {
            console.log('_onEntryInfoComplete');
            delete this.prepareDataCompletionFlag.entryInfo;
            this._onPrepareDataCompleted();
        },

        _onUserInfoComplete: function(eData) {
            console.log('_onUserInfoComplete');
            delete this.prepareDataCompletionFlag.userInfo;
            this._onPrepareDataCompleted();
        },

        _onFormatSettingsComplete: function(eData) {
            console.log('_onFormatSettingsComplete');
            delete this.prepareDataCompletionFlag.formatSettings;
            this._onPrepareDataCompleted();
        },

        _onPatternTableComplete: function(eData) {
            console.log('_onPatternTableComplete');
            delete this.prepareDataCompletionFlag.patternTable;
            this._onPrepareDataCompleted();
        },

        _onPrepareDataCompleted: function() {
            if (!S.isEmptyObject(this.prepareDataCompletionFlag))
                return;
            //Todo: init lg dom structure and added to the container

            //fetch log format according to the prepared data
            this.dataManager.fetchFormat();
        },

        _onFormatComplete: function(eData) {
            //Todo: handle format info
            this.topInsert.setLogFormat(this.dataManager.logFormat);

            this.bottomInsert.setLogFormat(this.dataManager.logFormat);

            this.area.setLogFormat(this.dataManager.logFormat);
            //fetch data range
            this.dataManager.fetchRange();
        },

        _onRangeComplete: function(eData) {
            //Todo: handle range data
            this.area.setIndexRange(eData.maxIndex, eData.minIndex, eData.indexUnit, eData.absentInterval);
            this.area.drawGrid();
            //fetch channel data
            this.dataManager.fetchChannelData();
        },

        _onChannelDataComplete: function(eData) {
            //Todo: handle channel data
            this.area.setDataManager(this.dataManager);
            //rendering
            this.draw();
        },

        _onStartEvt: function(e) {
            if (this._disable) return;
            var b = this.container;
            var activeClassName = this.activeClassName;
            if (!sDom.hasClass(b, activeClassName)) {
                sDom.addClass(b, activeClassName);
            }
        },

        _onMoveEvt: function(e) {
            if (this._disable) return;
            e.preventDefault();
        },

        _onEndEvt: function(e) {
            if (this._disable) return;
            var b = this.container;
            var activeClassName = this.activeClassName;
            if (sDom.hasClass(b, activeClassName)) {
                sDom.removeClass(b, activeClassName);
            }
        }
    });
});