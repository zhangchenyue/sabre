/**
 * Log Object---Waveform inhert from _BaseObject
 */
Sabre.pack('Sabre.lg', function(S) {
    'use strict'

    this.Waveform = S.Class({ extend: this.VDL }, {
        draw: function() {

        },

        createPreviewImg: function(width, height, leftGrid, rightGrid) {
            var canvas = S.dom.create("canvas");
            var context = canvas.getContext("2d");
            var ratio = S.lg.CT_CANVAS_RATIO;
            canvas.width = Math.max(width * ratio, 1);
            canvas.height = Math.max(height * ratio, 1);
            context.scale(ratio, ratio);

            var amp = height - 2 * this.thickness;
            var path = []; //avoid using true path cobjects for compatabiltiy
            var yy;
            var zeroY = height / 2;

            var plotWidth = width;
            var plotLeft = 0;
            if (leftGrid > 0) {
                plotLeft += leftGrid;
                plotWidth -= leftGrid;
                context.strokeStyle = 'black';
                context.lineWidth = 0.5;
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(leftGrid, 0);
                context.lineTo(leftGrid, height);
                context.lineTo(0, height);
                context.stroke();
            }

            if (rightGrid > 0) {
                plotWidth -= rightGrid;
                context.strokeStyle = 'black';
                context.lineWidth = 0.5;
                context.beginPath();
                context.moveTo(plotLeft + plotWidth + rightGrid, 0);
                context.lineTo(plotLeft + plotWidth, 0);
                context.lineTo(plotLeft + plotWidth, height);
                context.lineTo(plotLeft + plotWidth + rightGrid, height);
                context.stroke();
            }

            for (var xx = plotLeft; xx < plotWidth; xx++) {
                yy = Math.sin(Math.PI * xx / width) * Math.cos(8 * Math.PI * xx / width) / 2;
                yy = (amp * yy) + zeroY;
                path.push({ x: xx, y: yy });
            }
            context.save();

            var fill = true;
            switch (this.fillMode) {
                case "BOTH":
                    break;
                case "NEGATIVE":
                    context.rect(0, height / 2, width, height / 2);
                    context.clip();
                    break;
                case "POSITIVE":
                    context.rect(0, 0, width, height / 2);
                    context.clip();
                    break;
                case "NONE":
                    fill = false;
                    break;
            }

            if (fill && (path.length > 1)) {
                context.fillStyle = this.fillColor;
                context.beginPath();

                var n;
                for (n = 0; n < path.length; n++) {
                    if (n === 0) {
                        context.moveTo(path[n].x, zeroY);
                    }
                    context.lineTo(path[n].x, path[n].y);
                }
                context.lineTo(path[n - 1].x, zeroY);
                context.fill();
            }

            context.restore();

            context.strokeStyle = this.lineColor;
            context.lineWidth = this.thickness;
            context.beginPath();
            for (n = 0; n < path.length; n++) {
                if (n === 0) {
                    context.moveTo(path[n].x, path[n].y);
                } else {
                    context.lineTo(path[n].x, path[n].y);
                }
            }
            context.stroke();

            var image = new Image();
            image.src = canvas.toDataURL("image/png");
            image.height = height;
            image.width = width;
            return image;
        },
    });
});