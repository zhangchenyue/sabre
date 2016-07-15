/**
 * Rect class for lg
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.unionRects = function(r1, r2) {
        return (!r1 || !r2) ? (r1 || r2) : {
            x: Math.min(r1.x, r2.x),
            y: Math.min(r1.y, r2.y),
            w: Math.max(r1.x + r1.w, r2.x + r2.w) - Math.min(r1.x, r2.x),
            h: Math.max(r1.y + r1.h, r2.y + r2.h) - Math.min(r1.y, r2.y)
        };
    };

    this.rectsIntersect = function(r1, r2) {
        return !(r2.x > (r1.x + r1.w) ||
            (r2.x + r2.w) < r1.x ||
            r2.y > r1.y + r1.h ||
            r2.y + r2.h < r1.y);
    };

    this.rectIntersectsAny = function(rect, rectArray) {
        function rectsIntersect(r1, r2) {
            return !(r2.x > r1.x + r1.w ||
                r2.x + r2.w < r1.x ||
                r2.y > r1.y + r1.h ||
                r2.y + r2.h < r1.y);
        }
        var rs = false;
        rectArray.some(function(rt) {
            return rs = rectsIntersect(rect, rt);
        });
        return rs;
    };

    this.insetRect = function(r1, insetX, insetY) {
        insetY = S.type.isUndefined(insetY) ? insetX : insetY;
        return {
            x: r1.x + insetX,
            y: r1.y + insetY,
            w: r1.w - (2 * insetX),
            h: r1.h - (2 * insetY)
        };
    };
});