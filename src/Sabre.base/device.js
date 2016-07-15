/**
 * @description 
 * device related judgement
 */
Sabre.pack('Sabre', function (S) {
    'use strict'

    var ua = navigator.userAgent;
    // return the IE version or -1
    function getIeVersion() {
        var retVal = -1,
            ua, re;
        if (navigator.appName === 'Microsoft Internet Explorer') {
            ua = navigator.userAgent;
            re = new RegExp('MSIE ([0-9]{1,})');
            if (re.exec(ua) !== null) {
                retVal = parseInt(RegExp.$1);
            }
        }
        return retVal;
    };

    S.device = {
        ieVersion: getIeVersion(),
        //ie : platform.ieVersion !== -1,
        android: ua.match(/Android/i) === null ? false : true,
        iPhone: ua.match(/iPhone/i) === null ? false : true,
        iPad: ua.match(/iPad/i) === null ? false : true,
        iPod: ua.match(/iPod/i) === null ? false : true,
        winPhone: ua.match(/Windows Phone/i) === null ? false : true,
        touchDevice: 'ontouchstart' in window
    };
});