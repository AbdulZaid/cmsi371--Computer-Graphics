/*
 * This is the companion script to primitives-demo.html, with different
 * calls to the functions in the Primitives module.
 */
(function () {
    var renderingContext = document.getElementById("scratch").getContext("2d");

    // Start with rectangles.
    renderingContext.fillStyle = "gray"; // For demonstrating the no-color case.
    Primitives.fillRect(renderingContext, 5, 5, 200, 100);
    Primitives.fillRect(renderingContext, 210, 5, 200, 100, [0, 100, 255]);
    Primitives.fillRect(renderingContext, 415, 5, 200, 100,
            [120, 0, 0], [0, 80, 0]);
    Primitives.fillRect(renderingContext, 620, 5, 200, 100,
            [0, 0, 200], [0, 255, 0], [190, 140, 0]);
    Primitives.fillRect(renderingContext, 825, 5, 200, 100,
            [255, 0, 0], [255, 255, 0], [0, 200, 0], [0, 0, 100]);

    // Some line segments, with making all the lines dashed.
    Primitives.lineBresenham(renderingContext, 5, 210, 204, 110, 1);
    Primitives.lineBresenham(renderingContext, 210, 210, 409, 110, 5);
    Primitives.lineBresenham(renderingContext, 415, 210, 614, 110, 10);
    Primitives.lineBresenham(renderingContext, 620, 210, 819, 110, 15);
    Primitives.lineBresenham(renderingContext, 825, 210, 1024, 110, 30);
  
    // A few circles.
    Primitives.circleTrig(renderingContext, 105, 315, 100, [0, 255, 0], [128, 0, 128]);
    Primitives.circleDDA(renderingContext, 310, 315, 100, [80, 0, 80], [0, 200, 150]);
    Primitives.circleBres1(renderingContext, 515, 315, 100, [255, 30, 150], [200, 255, 0]);
    Primitives.circleBres2(renderingContext, 720, 315, 100, [50, 0, 50], [155, 0, 0]);
    Primitives.circleBres3(renderingContext, 925, 315, 100, [10, 10, 10], [200, 200, 200]);

    // And finally...polygon fills!
    renderingContext.save();
    renderingContext.translate(5, 420);
    Primitives.fillPolygon(renderingContext, [
        { x: 50, y: 50 },
        { x: 50, y: 80 },
        { x: 80, y: 100 },
        { x: 140, y: 50 },
        { x: 140, y: 80 },
        { x: 110, y: 50 }
    ]);
    renderingContext.restore();

    renderingContext.save();
    renderingContext.translate(210, 420);
    Primitives.fillPolygon(renderingContext, [
        { x: 50, y: 5 },
        { x: 100, y: 80 },
        { x: 120, y: 40 }
    ]);
    renderingContext.restore();

    renderingContext.save();
    renderingContext.translate(415, 420);
    Primitives.fillPolygon(renderingContext, [
        { x: 30, y: 40 },
        { x: 100, y: 40 },
        { x: 100, y: 100 },
        { x: 30, y: 100 }
    ]);
    renderingContext.restore();

    renderingContext.save();
    renderingContext.translate(620, 420);
    Primitives.fillPolygon(renderingContext, [
        { x: 20, y: 20 },
        { x: 50, y: 25 },
        { x: 100, y: 90 },
        { x: 50, y: 100 },
        { x: 15, y: 80 },
        { x: 10, y: 50 }
    ]);
    renderingContext.restore();

    renderingContext.save();
    renderingContext.translate(825, 420);
    Primitives.fillPolygon(renderingContext, [
        { x: 100, y: 10 },
        { x: 150, y: 100 },
        { x: 20, y: 40 },
        { x: 180, y: 40 },
        { x: 50, y: 100 }
    ]);
    renderingContext.restore();

}());
