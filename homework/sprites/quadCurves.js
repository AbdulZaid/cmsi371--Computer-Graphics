
/*
 * Drawing random curves to make a semi 3D shape
 */

(function () {
    // Ditto on using jQuery here.
    var canvas = document.getElementById("canvas"),
        renderingContext = canvas.getContext("2d");
 
    curves = {
        startPoint: {x: 100, y:100},
        controlPoint1: {x: 300, y:100},
        controlPoint2: {cp1x:200, cp1y:200, x:300, y:100},
        widthOfLine:2,
        colors: {black:"black", blue:"blue", red:"red"}
    }
    //setting up everything inside of a function.
    var drawCurves = function() {
        renderingContext.beginPath();
        renderingContext.strokeStyle = curves.colors.black;
        renderingContext.moveTo(curves.startPoint.x, curves.startPoint.y);
        renderingContext.lineTo(curves.controlPoint1.x, curves.controlPoint1.y);
        renderingContext.stroke();
        // Draw a quadratic curve by using the same line coordinates.
        renderingContext.beginPath();
        renderingContext.lineWidth = curves.widthOfLine;
        renderingContext.strokeStyle = curves.colors.black;
        renderingContext.moveTo(curves.startPoint.x, curves.startPoint.y);
        renderingContext.quadraticCurveTo(curves.controlPoint2.cp1x, curves.controlPoint2.cp1y,
                                          curves.controlPoint2.x, curves.controlPoint2.y);
        renderingContext.stroke();
    };
    //calling the function
    for(var x =-200; x <= 350; x +=15) {
        renderingContext.translate(6,0.5);
        renderingContext.scale(1.01, 1.01);
        curves.controlPoint2.cp1y = x;
        drawCurves();
    }

    for(var x =-200; x <= 300; x +=15) {
        renderingContext.translate(6,0.5);
        renderingContext.scale(1.01, 1.01);
        curves.controlPoint2.cp1y = x;
        renderingContext.fillStyle = curves.colors.red;
        renderingContext.fill();
        drawCurves();
    }

}());
