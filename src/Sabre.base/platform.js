Sabre.pack('Sabre', function(S) {
    'use strict'

    var ua = navigator.userAgent;
    var platform = {};
    platform.android = ua.match(/Android/i) === null ? false : true;
    platform.iPhone = ua.match(/iPhone/i) === null ? false : true;
    platform.iPad = ua.match(/iPad/i) === null ? false : true;
    platform.iPod = ua.match(/iPod/i) === null ? false : true;
    platform.winPhone = ua.match(/Windows Phone/i) === null ? false : true;
    platform.IOS = platform.iPad || platform.iPhone;
    platform.touchDevice = "ontouchstart" in window;
    S.platform = platform;
});