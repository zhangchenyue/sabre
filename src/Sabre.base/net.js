/* global Sabre */
Sabre.pack('Sabre', function(S) {
    'use strict'

    S.net = {
        serializeParam: function(param) {
            if (!param) return '';
            var qstr = [];
            for (var key in param) {
                qstr.push(encodeURIComponent(key) + '=' + encodeURIComponent(param[key]));
            }
            return qstr.join('&');
        },
        /**
         * option {
         *     url: "/abc/test?id=1",
         *     method: "POST",
         *     param: {name:"zcy", age: "30"},
         *     withCredentials: false,
         *     error: function(){},
         *     timeout: 3000,
         *     onTimeout: function(){},
         *     onSuccess: function(){},
         *     onError: function(){}
         * }
         */
        ajax: function(option) {
            var o = option,
                m = o.method.toUpperCase(),
                isPost = 'POST' == m,
                isComplete = false,
                timeout = o.timeout,
                withCredentials = o.withCredentials,
                async = ('async' in option) ? option.async : true,
                xhr = window.XMLHttpRequest ? new XMLHttpRequest() : false;
            if (!xhr) {
                o.error && o.error.call(null, {
                    ret: 999,
                    msg: 'Create XHR Error!'
                });
                return false;
            };
            var qstr = S.net.serializeParam(o.param);

            //GET request
            !isPost && (o.url += (o.url.indexOf('?') > -1 ? '&' : '?') + qstr);
            xhr.open(m, o.url, async);

            //POST request
            isPost && xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            //Handle Response
            var timer = 0;
            xhr.onreadystatechange = function() {
                if (4 == xhr.readyState) {
                    var status = xhr.status;
                    if ((status >= 200 && status < 300) || status == 304 || status == 0) {
                        var response = xhr.responseText.replace(/(\r|\n|\t)/gi, '');
                        var json = JSON.parse(response);
                        o.onSuccess && o.onSuccess(json, xhr);
                    } else {
                        o.onError && o.onError(xhr, +new Date - startTime);
                    };
                    isComplete = true;
                    if (timer) {
                        clearTimeout(timer);
                    }
                }
            };

            if (withCredentials) xhr.withCredentials = true;
            var startTime = +new Date;
            xhr.send(isPost ? qstr : void (0));
            if (timeout) {
                timer = setTimeout(function() {
                    if (!isComplete) {
                        xhr.abort();
                        o.onTimeout && o.onTimeout(xhr);
                    }
                }, timeout);
            }
            return xhr;
        }
    };
});