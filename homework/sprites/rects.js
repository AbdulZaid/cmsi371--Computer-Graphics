/*
*   Function to draw rectangles.
*/

(function () {
    //building up the canvas.
    var canvas = document.getElementById("canvas"),
        renderingContext = canvas.getContext("2d");
 
    //seeting up the properties of the rectangles as objects.
    rectsProperties = {
        widthOfLine: 3,
        color: {green:"green", red:"red", blue:"blue", yellow:"yellow"},
        Cords: {x:300, y:400},
        recWidth: 150,
        recHeight: 100,
        lineJoin: {round: "round", bevel:"bevel", miter: "miter"}
    };

    //wrapping up the drawing methods and properties into one function.
    var drawRects = function() {
        renderingContext.beginPath();
        renderingContext.lineWidth = rectsProperties.widthOfLine;
        renderingContext.strokeStyle = rectsProperties.color.blue;
        renderingContext.rect(rectsProperties.Cords.x, rectsProperties.Cords.y, rectsProperties.recWidth,rectsProperties.recHeight);
        renderingContext.stroke();
    };

    //calling the function and chaning its scale and translate.
    for(var x =100; x <= 300; x += 10) {
        renderingContext.lineJoin = rectsProperties.lineJoin.round;
        rectsProperties.Cords.x = x;
        renderingContext.scale(1, 0.9);
        renderingContext.translate(10,10);
        drawRects();
    };

    //calling the function above with chaning its properties.
    for(var y=50; y <= 300; y +=10) {
        rectsProperties.Cords.y = y;
        rectsProperties.recHeight += 10;
        renderingContext.scale(1, 1.1);
        renderingContext.lineJoin = rectsProperties.lineJoin.miter;
        rectsProperties.color.blue= "brown";
        renderingContext.translate(12,5);
        drawRects();
    };

}());