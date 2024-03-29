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
        VerticesPasser,
 
        // Utility variable indicating whether some fatal has occurred.
        abort = false,

        // Important state variables.
        currentRotation = 290.0,
        currentInterval,
        goalInterval,
        goalInterval2,
        rotationMatrix,
        cameraMatrix,
        scaleMatrix,
        translateMatrix,
        projectionMatrix,
        instanceMatrix,
        vertexPosition,
        vertexColor,

        //drawn objects
        sphere = Shapes.sphere(0.7, 30, 30),
        cube = Shapes.cube(),
        field = Shapes.field(),

        // For emphasis, we separate the variables that involve lighting.
        normalVector,
        lightPosition,
        lightPosition2,
        lightDiffuse,

        // An individual "draw object" function.
        drawObject,

        // The big "draw scene" function.
        drawScene,

        // Reusable loop variables.
        i,
        maxi,
        j,
        maxj;
    
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
            color: { r: 1.0, g: 1.0, b: 1.0 },
            dx: 0.0,
            dy: 0.0,
            dz: 0.0,
            sx: 0.9,
            sy: 0.9,
            sz: 0.9,
            vertices: Shapes.toRawTriangleArray(sphere),
            normals: Shapes.toRawLineArray(sphere),
            mode: gl.TRIANGLES

        },

        // JD: Nice that you figured out the background image, but that shouldn't
        //     have made you minimize your 3D scenery.  Actually, in its current
        //     form, the scene barely looks like you are using any 3D functionality
        //     at all.  The interaction is nice, but not at the price of 3D!

        // {

        //     color: { r: 1.0, g: 0.0, b: 0.3 },
        //     vertices: Shapes.toRawTriangleArray(cube),
        //     dx: -0.75,
        //     theta: 225,
        //     normals: Shapes.toNormalArray(cube),
        //     mode: gl.TRIANGLES,

        //     leafs: [

        //         {
        //             color: { r: 1.0, g: 1.0, b: 1.0 },
        //             vertices: Shapes.toRawTriangleArray(sphere),
        //             dy: -0.5,
        //             normals: Shapes.toRawLineArray(sphere),
        //             mode: gl.TRIANGLES,

        //             leafs: [
        //                 {
        //                     color: { r: 1.0, g: 0.0, b: 0.0 },
        //                     vertices: Shapes.toRawTriangleArray(field),
        //                     theta: 180,
        //                     normals: Shapes.toNormalArray(field),
        //                     mode: gl.TRIANGLES,
        //                 }
        //             ],
        //         },

        //         {
        //             color: { r: 1.0, g: 1.0, b: 1.0 },
        //             vertices: Shapes.toRawTriangleArray(cube),
        //             theta: 10,
        //             dy: 1.5,
        //             normals: Shapes.toNormalArray(cube),
        //             mode: gl.TRIANGLES,
        //         }

        //     ]

        // }
    ]

    // Pass the vertices to WebGL.
    VerticesPasser = function (objectsToDraw) {
        var i,
            maxi;
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

            //color buffer
            objectsToDraw[i].colorBuffer = GLSLUtilities.initVertexBuffer(gl,
                    objectsToDraw[i].colors);
 
             // Normal buffer.
            objectsToDraw[i].normalBuffer = GLSLUtilities.initVertexBuffer(gl,
                     objectsToDraw[i].normals);

            if (objectsToDraw[i].leafs && (objectsToDraw[i].leafs.length !== 0)) {
            	VerticesPasser(objectsToDraw[i].leafs);
            }
        }
    };
 
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
    instanceMatrix = gl.getUniformLocation(shaderProgram, "instanceMatrix");

    normalVector = gl.getAttribLocation(shaderProgram, "normalVector");
    gl.enableVertexAttribArray(normalVector);

    // Note the additional variables.
    lightPosition = gl.getUniformLocation(shaderProgram, "lightPosition");
    lightPosition2 = gl.getUniformLocation(shaderProgram, "lightPosition2");
    lightDiffuse = gl.getUniformLocation(shaderProgram, "lightDiffuse");

    /*
     * Displays an individual object.
     */
    drawObject = function (object, parentTransform) {
        var i,
            instanceTransform;
    	for (i = 0; i < object.length; i += 1) {
            // Build the instance matrix.
            instanceTransform = parentTransform || new Matrix4x4(),
                translation = Matrix4x4.getTranslationMatrix(
                    object[i].dx || 0,
                    object[i].dy || 0,
                    object[i].dz || 0
                ),
                rotation = Matrix4x4.getRotationMatrix(object[i].theta || 0, 0, 0, 1),
                scale = Matrix4x4.getScaleMatrix(
                    object[i].sx || 0.9,
                    object[i].sy || 0.9,
                    object[i].sz || 0.9
                ),

            // JD: Missing rotation.
            instanceTransform = instanceTransform.multiply(translation).multiply(scale);

            gl.uniformMatrix4fv(instanceMatrix, gl.FALSE, new Float32Array(instanceTransform.conversion()));

            // Set the varying normal vectors.
            gl.bindBuffer(gl.ARRAY_BUFFER, object[i].normalBuffer);
            gl.vertexAttribPointer(normalVector, 3, gl.FLOAT, false, 0, 0);

            // Set the varying colors.
            gl.bindBuffer(gl.ARRAY_BUFFER, object[i].colorBuffer);
            gl.vertexAttribPointer(vertexColor, 3, gl.FLOAT, false, 0, 0);

            // Set the varying vertex coordinates.
            gl.bindBuffer(gl.ARRAY_BUFFER, object[i].buffer);
            gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(object[i].mode, 0, object[i].vertices.length / 3);
            
            if (object[i].leafs && (object[i].leafs.length !== 0)) {
                drawObject(object[i].leafs, instanceTransform);
            }  
        }
    };

    //Initialize the projection matrix.
    // JD: Ortho matrix is technically OK, but come on, with the football kicking action,
    //     going with frustum is clearly way better!  (and at least makes use of a little
    //     more 3D)
    //
    //     Furthermore, your canvas now is 640x419.  This does not match your viewing volume.
    gl.uniformMatrix4fv(projectionMatrix, gl.FALSE, new Float32Array(
        Matrix4x4.getOrthoMatrix(-3, 3, 3, -3, -3, 3).conversion()
        )
    );
    //Initialize the scale matrix.
    gl.uniformMatrix4fv(scaleMatrix, gl.FALSE, new Float32Array(
        Matrix4x4.getScaleMatrix(0.9, 0.9, 0.9).conversion()
        )
    );
    //Initialize the translate matrix.
    gl.uniformMatrix4fv(translateMatrix, gl.FALSE, new Float32Array(
        Matrix4x4.getTranslationMatrix(0.0, -1.5, 0.0).conversion()
        )
    );
    //Initialize the camera matrix.
    // JD: Use this in concert with a frustum projection to produce just the right
    //     kicker's view of the soccer field!
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
        // JD: Based on the theme of your scene, you really don't need this matrix
        //     anymore.  It should go away.
        gl.uniformMatrix4fv(rotationMatrix, gl.FALSE, new Float32Array(Matrix4x4.getRotationMatrix(currentRotation, 1, 1, 1).conversion()));

        // Display the objects.
        drawObject(objectsToDraw);

        // All done.
        gl.flush();
    };



    // Send the vertices to WebGL.
    VerticesPasser(objectsToDraw);

    // Set up our one light source and color.  Note the uniform3fv function.
    gl.uniform3fv(lightPosition, [0.0, 0.0, 0.0]);
    gl.uniform3fv(lightDiffuse, [1.0, 1.0, 1.0]);

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
                if(currentRotation === 328) {
                    window.clearInterval(currentInterval)
                } 
            }, 3);
        }

        if (goalInterval) {
            clearInterval(goalInterval);
            goalInterval = null;
        } else {
            // JD: The interaction itself is a nice idea, but the implementation shows a lack
            //     of understanding of how vectors can help here.  You are showing three nested
            //     setInterval calls whose only difference is the way that the ball is supposed
            //     to move.  That's precisely what vectors do for you!  If you model the ball's
            //     velocity as a vector, then you would need only one setInterval function, which
            //     at certain checkpoints (the conditions you have) would then change the vector
            //     of velocity.  The code wouldn't have to change, and you wouldn't need all
            //     these setIntervals!
            goalInterval = setInterval(function () {
                objectsToDraw[0].dx += -0.180;
                objectsToDraw[0].dy += 0.12;
                objectsToDraw[0].dz += 0.09;
                objectsToDraw[0].sx /= 1.09; // JD: Fake perspective here---if you use a frustum
                objectsToDraw[0].sy /= 1.09; //     viewing volume, you wouldn't need this.
                objectsToDraw[0].sz /= 1.09;
                drawScene();  
                if(objectsToDraw[0].sx === 0.1907943661352803) {
                    window.clearInterval(goalInterval)
                }
                if(objectsToDraw[0].dy === 2.160000000000001) {
                    goalInterval = setInterval(function () {
                        objectsToDraw[0].dx += 0.1;
                        drawScene();
                        if(objectsToDraw[0].dx === 2.260000000000002) {
                            goalInterval2 = setInterval(function () {
                                objectsToDraw[0].dy += -0.01;
                                drawScene();
                                if(objectsToDraw[0].dy === 1.9200000000000044) {
                                    window.clearInterval(goalInterval2);
                                    alert("WOW You just hit the left bar and the right bar then scored a goal!!!!" + 
                                        " JUST WOW, you should go and play for Real Madrid");
                                    location.reload(); // JD: Wha???  Cheap.  You should reset the ball directly.
                                }
                            }, 10);
                            window.clearInterval(goalInterval);
                        }
                    }, 30);
                }
            }, 80);
        }
    });


}(document.getElementById("soccer")));
