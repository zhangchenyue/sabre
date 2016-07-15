/**
 * @description 
 *    Core features of Sabre
 */
(function(exports) {
    'use strict'

    exports.Sabre = {
		/**
		 *create namespace
		 *param {String} namespace string split by '.'
		 */
        namespace: function(name) {
            if (!name) {
                return exports;
            };
            var nsArr = name.split('.');
            var ns = exports;
            for (var i = 0, l = nsArr.length; i < l; i++) {
                var n = nsArr[i];
                ns[n] = ns[n] || {};
                ns = ns[n];
            }
            return ns;
        },
		/**
		 * create a package
		 *@param {String} namespace split by '.'
		 *@param {Object} definition object
		 */
        pack: function(ns, def) {
            var target = exports;
            if (typeof ns === 'function') {
                def = ns;
                target = exports;
            } else if (typeof ns === 'string') {
                target = this.namespace(ns);
            } else if (typeof ns === 'object') {
                target = ns;
            }
            def.call(target, this);
        },
		/**
		 * extent property form an object
		 * 
		 * @param {Object} need to be extended
		 * @param {Object} extend options
		 */
        extend: function(target, option) {
            for (var prop in option) {
                if (option.hasOwnProperty(prop)) {
                    target[prop] = option[prop];
                };
            }
        },
		/**
		 * bind this for function
		 * 
		 * @param {Function} function to bind
		 * @param {Object} run context
		 */
        bind: function(fun, context) {
            var slice = [].slice;
            var args = slice.call(arguments, 2);
            return function() {
                return fun.apply(context, args.concat(slice.call(arguments)));
            }
        },
		/**
		 * judge an object is empty
		 * 
		 * @param {Object} to judge
		 */
        isEmptyObject: function(obj) {
            for (var it in obj) {
                if (obj.hasOwnProperty(it)) {
                    return false;
                }
            }
            return true;
        },
		/**
		 *generate random integer between given min and max
		 */
        random: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },
		/**
		*binary search for sequence array
		*@return {Integer} found index in array, if not found, return -1
		*/
        binarySearch: function(arr, value) {
            var len = arr.length;
            if (!len) {
                return -1
            };

            var start = 0;
            var end = len - 1;
            while (start <= end) {
                var mid = Math.floor((start + end) / 2);
                var vMid = arr[mid];
                if (vMid === value) {
                    return mid;
                } else if (vMid < value) {
                    start = mid + 1;
                } else {
                    end = mid - 1
                };
            }
            return -1;
        },

		/**
		 * define a Class or subClass
		 * 
		 * @param {option}  for a new Class
		 * @param {extend:{superClass}, option}  for a new subClass
		 */
        Class: function() {
            var argCount = arguments.length;
            var option = arguments[argCount - 1];
            //check argument count
            if (argCount === 2) {
                var superClass = arguments[0].extend;
                var TempClass = function() { };
                TempClass.prototype = superClass.prototype;
                var subClass = function() {
                    return new subClass.prototype._init(arguments);
                }
                subClass.superClass = superClass.prototype;
                subClass.callSuper = function(context, func) {
                    var fn = subClass.superClass[func];
                    if (fn && typeof fn === 'function') {
                        var slice = [].slice;
                        var a = slice.call(arguments, 2);
                        fn.apply(context, a.concat(slice.call(arguments)));
                    }
                }
                subClass.prototype = new TempClass();
                subClass.prototype.constructor = subClass;
                for (var prop in option) {
                    if (option.hasOwnProperty(prop)) {
                        subClass.prototype[prop] = option[prop];
                    }
                }
                subClass.prototype._init = function(args) {
                    this.init.apply(this, args);
                }
                subClass.prototype._init.prototype = subClass.prototype;
                return subClass;
            } else if (argCount === 1) {
                var newClass = function() {
                    return new newClass.prototype._init(arguments);
                }
                newClass.prototype = option;
                newClass.prototype._init = function(args) {
                    this.init.apply(this, args);
                }
                newClass.prototype.constructor = newClass;
                newClass.prototype._init.prototype = newClass.prototype;
                return newClass;
            } else {
                return null;
            }
        }
    };

})(this);