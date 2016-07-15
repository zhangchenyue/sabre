/**
*@description 
*	LogRangeSelection class 
*/
Sabre.pack('Sabre.lg.ui', function(S) {
    'use strict'

    var dom = S.dom;
    this.LogRangeSelection = S.Class({
        init: function(options) {
            this.elem = dom.query(options.id);
        },
        selfTest: function() {
            console.log('this is LogRangeSelection Class');
        }
    });
});