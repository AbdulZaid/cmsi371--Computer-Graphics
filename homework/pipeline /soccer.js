/*
 * For maximum modularity, we place everything within a single function that
 * takes the canvas that it will need.
 */
(function (canvas) {

    // Because many of these variables are best initialized then immediately
    // used in context, we merely name them here.  Read on to see how they
    // are used.
    var gl, // The WebGL context.

        // This variable stores 3D model information.
        objectsToDraw,

        // The shader program to use.
        shaderProgram,
 
		// A function that passes all of the object's vertices to WebGL.
        VerticiesPasser,
 
        // Utility variable indicating whether some fatal has occurred.
        abort = false,

        // Important state variables.
        currentRotation = 0.0,
        currentInterval,
        projectionMatrix,
        rotationMatrix,
        cameraMatrix,
        scaleMatrix,
        translateMatrix,
        vertexPosition,
        vertexColor,
        //drown objects
        sphere = Shapes.sphere(),
        cube = Shapes.cube(),
        field = Shapes.field(),

        // Normal Vector.
        normalVector,

        // An individual "draw object" function.
        drawObject,

        // The big "draw scene" function.
        drawScene,

        // Reusable loop variables.
        i,
        maxi,
        j,
        maxj,
    
    // Grab the WebGL rendering context.
    gl = GLSLUtilities.getGL(canvas);
    if (!gl) {
        alert("No WebGL context found...sorry.");

        // No WebGL, no use going on...
        return;
    }

    // Set up settings that will not change.  This is not "canned" into a
    // utility function because these settings really can vary from program
    // to program.
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Build the objects to display.
    objectsToDraw = [
                     
        {
            color: { r: 1.0, g: 0.0, b: 0.3 },
            vertices: Shapes.toRawLineArray(sphere),
            mode: gl.LINES,
            normals: Shapes.toNormalArray(sphere),

        },
                     
        {
            color: { r: 0.0, g: 0.0, b: 0.3 },
            vertices: Shapes.toRawTriangleArray(cube),
            mode: gl.TRIANGLES,
            normals: Shapes.toNormalArray(cube),

            //put it in here to test out the function.
            leafs: [
                {
                    color: { r: 0.0, g: 1.0, b: 0.0 },
                    vertices: Shapes.toRawTriangleArray(field),
                    mode: gl.TRIANGLES,
                    normals: Shapes.toNormalArray(field),

                }
            ]

        }
    ];

    // Pass the vertices to WebGL.
    VerticiesPasser = function (objectsToDraw) {
        for (i = 0, maxi = objectsToDraw.length; i < maxi; i += 1) {
            objectsToDraw[i].buffer = GLSLUtilities.initVertexBuffer(gl,
                    objectsToDraw[i].vertices);

            if (!objectsToDraw[i].colors) {
                // If we have a single color, we expand that into an array
                // of the same color over and over.
                objectsToDraw[i].colors = [];
                for (j = 0, maxj = objectsToDraw[i].vertices.length / 3;
                        j < maxj; j += 1) {
                    objectsToDraw[i].colors = objectsToDraw[i].colors.concat(
                        objectsToDraw[i].color.r,
                        objectsToDraw[i].color.g,
                        objectsToDraw[i].color.b
                    );
                }
            }


            // Normal buffer.
            objectsToDraw[i].normalBuffer = GLSLUtilities.initVertexBuffer(gl,
                    objectsToDraw[i].normals);

            //color buffer
            objectsToDraw[i].colorBuffer = GLSLUtilities.initVertexBuffer(gl,
                    objectsToDraw[i].colors);
 
            if (objectsToDraw[i].leafs && (objectsToDraw[i].leafs.length !== 0)) {
            	VerticiesPasser(objectsToDraw[i].leafs);
            }
        }
 	},
 
    // Initialize the shaders.
    shaderProgram = GLSLUtilities.initSimpleShaderProgram(
        gl,
        $("#vertex-shader").text(),
        $("#fragment-shader").text(),

        // Very cursory error-checking here...
        function (shader) {
            abort = true;
            alert("Shader problem: " + gl.getShaderInfoLog(shader));
        },

        // Another simplistic error check: we don't even access the faulty
        // shader program.
        function (shaderProgram) {
            abort = true;
            alert("Could not link shaders...sorry.");
        }
    );

    // If the abort variable is true here, we can't continue.
    if (abort) {
        alert("Fatal errors encountered; we cannot continue.");
        return;
    }

    // All done --- tell WebGL to use the shader program from now on.
    gl.useProgram(shaderProgram);

    // Hold on to the important variables within the shaders.
    vertexPosition = gl.getAttribLocation(shaderProgram, "vertexPosition");
    gl.enableVertexAttribArray(vertexPosition);
    vertexColor = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(vertexColor);
    projectionMatrix = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    rotationMatrix = gl.getUniformLocation(shaderProgram, "rotationMatrix");
    scaleMatrix = gl.getUniformLocation(shaderProgram, "scaleMatrix");
    translateMatrix = gl.getUniformLocation(shaderProgram, "translateMatrix");
    cameraMatrix = gl.getUniformLocation(shaderProgram, "cameraMatrix");

    normalVector = gl.getAttribLocation(shaderProgram, "normalVector");
    gl.enableVertexAttribArray(normalVector);

    /*
     * Displays an individual object.
     */
    drawObject = function (object) {
 
    	for (i = 0; i < objectsToDraw.length; i += 1) {
            // Set the varying colors.
            gl.bindBuffer(gl.ARRAY_BUFFER, object.colorBuffer);
            gl.vertexAttribPointer(vertexColor, 3, gl.FLOAT, false, 0, 0);

            // Set the varying vertex coordinates.
            gl.bindBuffer(gl.ARRAY_BUFFER, object.buffer);
            gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(object.mode, 0, object.vertices.length / 3);

            // Set the varying normal vectors.
            gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBuffer);
            gl.vertexAttribPointer(normalVector, 3, gl.FLOAT, false, 0, 0);

            if (object[i].leafs) {
                drawObject(object[i].leafs);
            }
		}
    };

    //Initialize the projection matrix.
    gl.uniformMatrix4fv(projectionMatrix, gl.FALSE, new Float32Array(
        Matrix4x4.getOrthoMatrix(-2, 2, 2, -2, -2, 2).conversion()
        )
    );
    //Initialize the scale matrix.
    gl.uniformMatrix4fv(scaleMatrix, gl.FALSE, new Float32Array(
        Matrix4x4.getScaleMatrix(2, 0.6, 2).conversion()
        )
    );
    //Initialize the scale matrix.
    gl.uniformMatrix4fv(translateMatrix, gl.FALSE, new Float32Array(
        Matrix4x4.getTranslationMatrix(0.2, 0.2, 0.5).conversion()
        )
    );
    //Initialize the scale matrix.
    gl.uniformMatrix4fv(cameraMatrix, gl.FALSE, new Float32Array(
        Matrix4x4.lookAt(0, 1, 1, 0, 0, 0, 0, 1, 0).conversion()
        )
    );
    



    /*
     * Displays the scene.
     */
    drawScene = function () {
        // Clear the display.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set up the rotation matrix.
        gl.uniformMatrix4fv(rotationMatrix, gl.FALSE, new Float32Array(Matrix4x4.getRotationMatrix(currentRotation, 11, 1, 1).conversion()));

        // Display the objects.
        drawObject(objectsToDraw);

        // All done.
        gl.flush();
    };



    // Send the vertices to WebGL.
    VerticiesPasser(objectsToDraw);

    // Draw the initial scene.
    drawScene();
 
    // Set up the rotation toggle: clicking on the canvas does it.
    $(canvas).click(function () {
        if (currentInterval) {
            clearInterval(currentInterval);
            currentInterval = null;
        } else {
            currentInterval = setInterval(function () {
                currentRotation += 1.0;
                drawScene();
                if (currentRotation >= 360.0) {
                    currentRotation -= 360.0;
                }
            }, 30);
        }
    });

}(document.getElementById("soccer")));
