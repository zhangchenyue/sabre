/* global Sabre */
Sabre.pack('Sabre.lg', function (S) {
    'use strict'

    this.CT_CANVAS_RATIO = (function (w) {
        var ctx = S.dom.create('canvas').getContext('2d');
        var devicePixelRatio = w.devicePixelRatio || 1;
        var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                                ctx.mozBackingStorePixelRatio ||
                                ctx.msBackingStorePixelRatio ||
                                ctx.oBackingStorePixelRatio ||
                                ctx.backingStorePixelRatio ||
                                1;

        return devicePixelRatio / backingStoreRatio;
    })(window);
    
    this.CT_POINTS_PERINCH = 120;
    this.CT_INSERT_LINEHEIGHT = 34;
    this.CT_INSERT_TEXTLINEHEIGHT = 17;
    this.CT_INSERT_FONT = 'normal normal normal normal 10px/normal "Helvetica Neue", Arial, Helvetica, sans-serif';
    
    this.CT_MAX_TILE_WIDTH = 128;
    this.CT_MAX_TILE_HEIGHT = 102;
    this.CT_MAX_AREA_HEIGHT = 10000;
    
});