/* global Sabre */

Sabre.pack('Sabre', function(S) {
    'use strict'

    S.event = {
        /**
         * bind event
         */
        on: function(obj, eType, handler) {
            //obj is an array
            if (S.type.isArray(obj)) {
                for (var i = obj.length; i--;) {
                    S.event.on(obj[i], eType, handler);
                }
                return;
            }
            //eType is a string splited by space
            if (S.type.isString(eType) && eType.indexOf(' ') > 0) {
                eType = eType.split(' ');
                for (var i = eType.length; i--;) {
                    S.event.on(obj, eType[i], handler);
                }
                return;
            }
            //handler is an array
            if (S.type.isArray(handler)) {
                for (var i = handler.length; i--;) {
                    S.event.on(obj, eType, handler[i]);
                }
                return;
            }
            //eType is an object
            if (S.type.isObject(eType)) {
                for (var eName in eType) {
                    S.event.on(obj, eName, eType[eName]);
                }
                return;
            }

            //handle dom event
            if (_isDomEvent(obj, eType)) {
                _bindDomEvent(obj, eType, handler);
                return;
            }

            //dom event in obj elem property
            if (obj.elem && _isDomEvent(obj.elem, eType)) {
                _bindDomEvent(obj.elem, eType, handler);
                return;
            }

            //handle touch event
            if (_touchEvent[eType]) {
                _touchEvent[eType](obj, handler);
                return;
            }

            //handle custom event
            obj.events = obj.events || {};
            obj.events[eType] = obj.events[eType] || [];
            obj.events[eType].push(handler);
        },
        /**
         * bind event once
         */
        once: function(obj, eType, handler) {
            S.event.on(obj, eType, function() {
                handler.apply(window, arguments);
                S.event.off(obj, eType, arguments.callee);
            });
        },
        /**
         * unbind event
         */
        off: function(obj, eType, handler) {
            //event type is a string splited by space
            if (S.type.isString(eType) && eType.indexOf(' ') > 0) {
                eType = eType.split(' ');
                for (var i = eType.length; i--;) {
                    S.event.off(obj, eType[i], handler);
                }
                return;
            }
            //handler is an array
            if (S.type.isArray(handler)) {
                for (var i = handler.length; i--;) {
                    S.event.off(obj, eType, handler[i]);
                }
                return;
            }
            //eType is an object
            if (S.type.isObject(eType)) {
                for (var eName in eType) {
                    S.event.off(obj, eName, eType[eName]);
                }
                return;
            }

            //unbind dom event
            if (_isDomEvent(obj, eType)) {
                _unbindDomEvent(obj, eType, handler);
                return;
            }

            //unbind dom event in  elem property
            if (obj.elem && _isDomEvent(obj.elem, eType)) {
                _unbindDomEvent(obj.elem, eType, handler);
                return;
            }

            //unbind touch event
            if (_touchEvent[eType]) {
                _touchEvent._off(obj, eType, handler);
                return;
            }

            //unbind custom event
            if (obj.events) {
                if (!handler) {
                    obj.events[eType] = [];
                    return;
                }
                if (obj.events[eType]) {
                    var eArr = obj.events[eType];
                    for (var i = eArr.length; i--;) {
                        if (eArr[i] === handler) {
                            eArr.splice(i, 1);
                            return;
                        }
                    }
                }
            }
        },
        /**
         * trigger event
         */
        fire: function(obj, eType) {
            var args = [].slice.call(arguments, 2);
            //trigger dom event
            if (_isDomEvent(obj, eType)) {
                var domEvt = document.createEvent('HTMLEvents');
                domEvt.initEvent(eType, true, true);
                obj.dispatchEvent(domEvt);
            }
            //trigger dom event in elem property
            if (obj.elem && _isDomEvent(obj.elem, eType)) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent(eType, true, true);
                obj.elem.dispatchEvent(evt);
                return;
            }
            //trigger custom event
            if (obj.events && obj.events[eType]) {
                var handler = obj.events[eType];
                for (var i = 0, l = handler.length; i < l; i++) {
                    handler[i].apply(window, args);
                }
            }
        }
    };

    /**
     * private functions 
     */
    //if dom event return event name, else return false
    var _isDomEvent = function(obj, eType) {
        if (('on' + eType).toLowerCase() in obj) {
            return eType;
        }
        return false;
    };

    //ecapulated dom event binding 
    var _bindDomEvent = function(obj, eType, handler) {
        if (obj.addEventListener) {
            obj.addEventListener(eType, handler, false); //bubble phase
        }
        else {
            eType = eType.toLowerCase();
            if (obj.attachEvent) {
                obj.attachEvent('on' + eType, handler);
            }
            else {
                var oldHandler = obj['on' + eType];
                obj['on' + eType] = function() {
                    if (oldHandler) {
                        oldHandler.apply(this, arguments);
                    }
                    return handler.apply(this, arguments);
                }
            }
        }
    };

    //ecapulated dom event unbinding
    var _unbindDomEvent = function(obj, eType, handler) {
        if (obj.removeEventListener) {
            obj.removeEventListener(eType, handler, false);
        } else {
            eType = eType.toLowerCase();
            if (obj.detachEvent) {
                obj.detachEvent('on' + eType, handler);
            } else {
                obj['on' + eType] = null;
            }
        }
    };

    //ecapulated touch event (use tap simulated click)
    var _touchEventHandlers = [];
    var _isTouchEvtMatch = function(tEvtObj, ele, eType, handler) {
        return tEvtObj.ele == ele && tEvtObj.eType == eType && tEvtObj.handler == handler;
    };
    var startEvt, moveEvt, endEvt;
    if ('ontouchstart' in window) {
        startEvt = 'touchstart';
        moveEvt = 'touchmove';
        endEvt = 'touchend';
    } else {
        startEvt = 'mousedown';
        moveEvt = 'mousemove';
        endEvt = 'mouseup';
    };

    var _getTouchPos = function(e) {
        var t = e.touches;
        if (t && t[0]) {
            return { x: t[0].clientX, y: t[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    var _getDist = function(p1, p2) {
        if (!p1 || !p2) return 0;
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    }

    var _touchEvent = {

        tap: function(ele, handler) {
            //the distance of press and release less than 20, then it is a tap event
            var TAP_DISTANCE = 20;
            // double click max delay
            var DOUBLE_TAP_TIME = 300;
            var pt_pos,
                ct_pos,
                pt_up_pos,
                pt_up_time,
                eType;

            var startEvtHandler = function(e) {
                var touches = e.touches;
                if (!touches || touches.length == 1) {
                    ct_pos = pt_pos = _getTouchPos(e);
                }
            };

            var moveEvtHandler = function(e) {
                e.preventDefault();
                ct_pos = _getTouchPos(e);
            };

            var endEvtHandler = function(e) {
                var now = Date.now();
                var dist = _getDist(ct_pos, pt_pos);
                var up_dist = _getDist(ct_pos, pt_up_pos);

                if (dist < TAP_DISTANCE) {
                    if (pt_up_time && now - pt_up_time < DOUBLE_TAP_TIME && up_dist < TAP_DISTANCE) {
                        eType = 'doubletap';
                    } else {
                        eType = 'tap';
                    }
                    handler.call(ele, {
                        target: e.target,
                        oriEvt: e,
                        type: eType
                    });
                }
                pt_up_pos = ct_pos;
                pt_up_time = now;
            };

            S.event.on(ele, startEvt, startEvtHandler);
            S.event.on(ele, moveEvt, moveEvtHandler);
            S.event.on(ele, endEvt, endEvtHandler);
            var evtOpt = {
                ele: ele,
                eType: 'tap',
                handler: handler
            };
            evtOpt.actions = {};
            evtOpt.actions[startEvt] = startEvtHandler;
            evtOpt.actions[moveEvt] = moveEvtHandler;
            evtOpt.actions[endEvt] = endEvtHandler;
            _touchEventHandlers.push(evtOpt);
        },

        _fire: function(ele, eType, handler) {
            for (var i = 0, l = _touchEventHandlers.length; i < l; i++) {
                if (_isTouchEvtMatch(_touchEventHandlers[i], ele, eType, handler)) {
                    handler.call(ele, { type: eType });
                }
            }
        },
        _off: function(ele, eType, handler) {
            for (var i = 0, l = _touchEventHandlers.length; i < l; i++) {
                var at = _touchEventHandlers[i].actions;
                if (_isTouchEvtMatch(_touchEventHandlers[i], ele, eType, handler)) {
                    for (var n in at) {
                        S.event.off(ele, n, at[n]);
                    }
                }
                _touchEventHandlers.splice(i, 1);
                return;
            }
        }
    };
});