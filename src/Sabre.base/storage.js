/* global Sabre */
/**
 * @description unify storage usage
 *    cookie sessionStorage localStorage
 */

Sabre.pack('Sabre', function(S) {
    'use strict'
    var prefixStorage = 'sabre-storage-';
    var status = {
        localStorage: ('localStorage' in window && window.localStorage !== null) ? 'localStorage' : 'cookie',
        sessionStorage: ('sessionStorage' in window && window.sessionStorage !== null) ? 'sessionStorage' : 'cookie',
        cookie: 'cookie'
    };

    var handleCookie = function(key, value, expires, options) {
        if (!navigator.cookieEnabled)
            return null;

        options = options || {};
        if (typeof (arguments[0]) !== 'string' && arguments.length === 1) {
            options = arguments[0];
            key = options.name;
            value = options.value;
            expires = options.expires;
        }
        key = encodeURI(key);
        if (value && (typeof (value) !== 'number' && typeof (value) !== 'string' && value !== null)) {
            return null;
        }

        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        var expire = '';

        if (value || (value === null && arguments.length == 2)) {

            expires = (expires === null || (value === null && arguments.length == 2)) ? -1 : expires;

            if (typeof (expires) === 'number'
                && expires != 'session'
                && expires !== undefined) {
                var date = new Date();
                date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
                expire = ['; expires=', date.toGMTString()].join('');
            }
            document.cookie = [key, '=', encodeURI(value), expire, domain, path, secure].join('');

            return;
        }

        if (!value
            && typeof (arguments[0]) === 'string'
            && arguments.length == 1
            && document.cookie && document.cookie.length) {
            var cookies = document.cookie.split(';');
            var len = cookies.length;
            while (len--) {
                var current = cookies[len].split('=');
                if (current[0].trim() === key) {
                    return decodeURI(current[1]);
                }
            }
            return null;
        }

        if (!document.cookie || !document.cookie.length) {
            return null;
        }

        return null;
    };

    var normalizeOptions = function(options) {

        var type = typeof (options) == 'string' ? options : options.type;

        if (type.indexOf('Storage') !== -1 && window[type]) {
            try {
                window[type].setItem('test', 'testval');
                window[type].removeItem('test', 'testval');
                if (status[type] == 'cookie') {
                    options.expires = (type == 'sessionStorage') ? 'session' : 365;
                }

            } catch (e) {
                status[type] = 'cookie';
            }

        }

        return {
            type: status[type],
            expires: options.expires || 'session',
            secure: options.secure ? true : false,
            path: options.path || false,
            domain: options.domain || false
        };
    };

    S.storage = {
        getItem: function(key, type) {
            type = type || 'sessionStorage';
            if (!window[type]) type = 'cookie';
            var opts = normalizeOptions(type);
            switch (opts.type) {
                case 'cookie':
                    key = [prefixStorage, key].join('');
                    var value = handleCookie(key);
                    if (value) {
                        return JSON.parse(value);
                    } else {
                        return value;
                    }
                case 'sessionStorage':
                case 'localStorage':
                    return window[opts.type].getItem(key);

            }
            return undefined;
        },
        setItem: function(key, value, options) {
            options = options || 'sessionStorage';
            if (!window[options]) options = 'cookie';
            var bWrite = (value === null) ? false : true;
            var nOpts = normalizeOptions(options || { type: 'cookie' }, bWrite);
            var type = nOpts.type || 'sessionStorage';

            switch (type) {
                case 'cookie':
                    key = [prefixStorage, key].join('');
                    if (value === null) {
                        handleCookie(key, null);
                        return true;
                    }
                    handleCookie(key, JSON.stringify(value), nOpts.expires, nOpts);
                    return true;

                case 'sessionStorage':
                case 'localStorage':
                    if (value === null) {
                        window[type].removeItem(key);
                        return true;
                    }
                    window[type].setItem(key, value);
                    return true;

            }
            return false;
        },

        removeItem: function(key, options) {
            S.storage.setItem(key, null, options);
        },

        length: function(options) {
            var opts = normalizeOptions(options || { type: 'cookie' }, false);
            var type = opts.type;
            if (!window[type]) type = 'cookie';
            var iLength = 0;
            var data;

            switch (type) {
                case 'cookie':
                    data = document.cookie.split(';') || {};
                    var n = data.length;
                    while (n--) { if (data[n].indexOf(prefixStorage) !== -1) { iLength++; } }
                    break;

                case 'sessionStorage':
                case 'localStorage':
                    iLength = window[type].length;
                    break;
            }
            return iLength;
        },

        clear: function() {
            window.localStorage ? window.localStorage.clear() : '';
            window.sessionStorage ? window.sessionStorage.clear() : '';
        }
    };
});