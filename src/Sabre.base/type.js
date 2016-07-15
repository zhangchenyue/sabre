/**
 * @description Object type judgement
 *    Object Type
 */

Sabre.pack('Sabre', function(S) {
    'use strict'

    var ots = Object.prototype.toString;
    S.type = {
        /**
         * Array type judgement
         * 
         * @name isArray
         * @function
         * @memberOf Sabre.type
         * @param {Object} o object to be judged
         * @return {boolean} if it is array
         */
        isArray: function(o) {
            return o && (o.constructor === Array || ots.call(o) === '[object Array]');
        },

        isObject: function(o) {
            return o && (o.constructor === Object || ots.call(o) === '[object Object]');
        },

        isBoolean: function(o) {
            return (o === false || o) && (o.constructor === Boolean);
        },

        isNumber: function(o) {
            return (o === 0 || o) && o.constructor === Number;
        },

        isUndefined: function(o) {
            return typeof (o) === 'undefined';
        },

        isNull: function(o) {
            return o === null;
        },

        isFunction: function(o) {
            return o && (o.constructor === Function);
        },

        isString: function(o) {
            return (o === "" || o) && (o.constructor === String);
        },

        isDomElement: function(o) {
            return o && o instanceof HTMLElement;
        }
    };
});