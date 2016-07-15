//Dom operations
Sabre.pack('Sabre', function(S) {
    'use strict'

    var tagNameExpr = /^[\w-]+$/,
        idExpr = /^(#[\w-]*)$/,
        classExpr = /^\.([\w-]+)$/;

    var hasClassListProperty = 'classList' in document.documentElement;

    S.dom = {
		/*
		 *@descripion: unify dom query like jQuery $
		 *@param {String} id, className or tagName
		 */
        query: function(selector) {
            var result;
            if (idExpr.test(selector)) {
                result = document.getElementById(selector.replace('#', ''));
                result = result ? [result] : [];
            } else if (tagNameExpr.test(selector)) {
                result = document.getElementsByTagName(selector);
            } else if (classExpr.test(selector)) {
                result = document.getElementsByClassName(selector.replace('.', ''));
            } else {
                result = document.querySelectorAll(selector);
            };
            return result;
        },
		/**
		 *@description: create a new dom element
		 */
        create: function(name) {
            return document.createElement(name);
        },
		/**
		 *@description: remove a dom element
		 */
        remove: function(elem) {
            var paNode = elem.parentNode;
            if (paNode) paNode.removeChild(elem);
        },
		/**
		 *@description: add a new class to a dom element, if exist, no action
		 */
        addClass: (function() {
            if (hasClassListProperty) {
                return function(elem, className) {
                    if (!elem || !className || S.dom.hasClass(elem, className)) {
                        return;
                    }
                    elem.classList.add(className);
                };
            } else {
                return function(elem, className) {
                    if (!elem || !className || S.dom.hasClass(elem, className)) {
                        return;
                    }
                    elem.className += " " + className;
                }
            }
        })(),
		/**
		 *@description: judge a dom element contains a class
		 */
        hasClass: (function() {
            if (hasClassListProperty) {
                return function(elem, className) {
                    if (!elem || !className) {
                        return false;
                    }
                    return elem.classList.contains(className);
                };
            } else {
                return function(elem, className) {
                    if (!elem || !className) {
                        return false;
                    }
                    return -1 < (' ' + elem.className + ' ').indexOf(' ' + className + ' ');
                };
            }
        })(),
		/**
		 *@description: remove a class from a dom element
		 */
        removeClass: (function() {
            if (hasClassListProperty) {
                return function(elem, className) {
                    if (!elem || !className || !S.dom.hasClass(elem, className)) {
                        return;
                    }
                    elem.classList.remove(className);
                };
            } else {
                return function(elem, className) {
                    if (!elem || !className || !S.dom.hasClass(elem, className)) {
                        return;
                    }
                    elem.className = elem.className.replace(new RegExp('(?:^|\\s)' + className + '(?:\\s|$)'), ' ');
                };
            }
        })(),
		/**
		 *@description: switch class within a dom element
		 */
        toggleClass: function(elem, className) {
            if (S.dom.hasClass(elem, className)) {
                S.dom.removeClass(elem, className);
            } else {
                S.dom.addClass(elem, className);
            }
        }

    };
});