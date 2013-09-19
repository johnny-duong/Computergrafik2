/*
  *
 * Module main: CG2 Aufgabe 2 Teil 2, Winter 2012/2013
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 */


/* 
 *  RequireJS alias/path configuration (http://requirejs.org/)
 */

requirejs.config({
    paths: {
    
        // jquery library
        "jquery": [
            // try content delivery network location first
            'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
            //If the load via CDN fails, load locally
            '../lib/jquery-1.7.2.min'],
            
        // gl-matrix library
        "gl-matrix": "../lib/gl-matrix-1.3.7"

    }
});


/*
 * The function defined below is the "main" module,
 * it will be called once all prerequisites listed in the
 * define() statement are loaded.
 *
 */

/* requireJS module definition */
define(["jquery", "gl-matrix", "util", "webgl-debug", 
        "program", "shaders", "animation", "html_controller", "scene_node", 
        "models/triangle", "models/cube", "models/band"], 
       (function($, glmatrix, util, WebGLDebugUtils, 
                    Program, shaders, Animation, HtmlController, SceneNode,
                    Triangle, Cube, Band ) {

    "use strict";
    
    /*
     *  This function asks the HTML Canvas element to create
     *  a context object for WebGL rendering.
     *
     *  It also creates a wrapper around it for debugging 
     *  purposes, using webgl-debug.js
     *
     */
    
    var makeWebGLContext = function(canvas_name) {
    
        // get the canvas element to be used for drawing
        var canvas=$("#"+canvas_name).get(0);
        if(!canvas) { 
            throw "HTML element with id '"+canvas_name + "' not found"; 
            return null;
        };

        // get WebGL rendering context for canvas element
        var options = {alpha: true, depth: true, antialias:true};
        var gl = canvas.getContext("webgl", options) || 
                 canvas.getContext("experimental-webgl", options);
        if(!gl) {
            throw "could not create WebGL rendering context";
        };
        
        // create a debugging wrapper of the context object
        var throwOnGLError = function(err, funcName, args) {
            throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
        };
        var gl=WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);
        
        return gl;
    };
    
    /*
     * main program, to be called once the document has loaded 
     * and the DOM has been constructed
     * 
     */

    $(document).ready( (function() {
    
        // catch errors for debugging purposes 
        try {

            console.log("document ready - starting!");
            
            // create WebGL context object for the named canvas object
            var gl = makeWebGLContext("drawing_area");
                                        
            // a simple scene is an object with a few objects and a draw() method
            var MyRobotScene = function(gl, transformation) {

                // store the WebGL rendering context 
                this.gl = gl;  
                
                // create WebGL program using constant red color
                var prog_red = new Program(gl, shaders.vs_NoColor(), 
                                            shaders.fs_ConstantColor([0.7,0.3,0.2,1]) );
                var prog_blue = new Program(gl, shaders.vs_NoColor(), 
                                             shaders.fs_ConstantColor([0.5,0.3,0.5,1]) );
                                       
                // create WebGL program using per-vertex-color
                var prog_vertexColor = new Program(gl, shaders.vs_PerVertexColor(), 
                                                    shaders.fs_PerVertexColor() );
                                                    
                // please register all programs in this list
                this.programs = [prog_red, prog_blue, prog_vertexColor];
                                                    
                // create some objects to be drawn
                var cube   = new Cube(gl);
                var band   = new Band(gl, { radius: 0.5, height: 1.0, segments: 50, filled: true } );
                var triangle = new Triangle(gl);
                 
				 /**
				 * Dimension
				 **/ 
				{
					// head
					var faceSize = [ 0.3, 0.3, 0.3 ];
					var neckSize = [ 0.2, 0.05, 0.15 ];
					
					// torso
					var torsoSize = [ 0.5, 0.7, 0.275 ];	                
					
					// leftArm
					var leftArmSize = [ [ 0.025, 0.1, 0.1 ], // LShoulderJointSize(0)
										[ 0.15, 0.325, 0.15 ], // LUpperarmSize(1)
										[ 0.1, 0.1, 0.1 ], // LEllbowSize(2)
										[ 0.1, 0.3, 0.1 ], // LForearmSize(3)
										[ 0.1, 0.1, 0.1 ], // LWristSize(4)
										[ 0.2, 0.2, 0.2 ] // LHandSize(5)			
									  ];
										
					
					// leftArm
					var rightArmSize = [ [ 0.025, 0.1, 0.1 ], // RShoulderJointSize(0)
										 [ 0.15, 0.325, 0.15 ], // RUpperarmSize(1)
										 [ 0.1, 0.1, 0.1 ], // REllbowSize(2)
										 [ 0.1, 0.3, 0.1 ], // RForearmSize(3)
										 [ 0.1, 0.1, 0.1 ], // RWristSize(4)
										 [ 0.2, 0.2, 0.2 ] // RHandSize(5)	
												
									   ];				
				};
				
				/**
				* translation
				**/
				{
					// head
					var headSkeletonTrans = [ 0.0, 1.0, 0.0 ];
					var faceTranslate = [ 0.0, 0.175, 0.0 ];
					var neckTranslate = [ 0.0, 0.0, 0.0 ];
					
					// torso
					var torsoTranslate = [ 0.0, 0.65, 0.0 ];
					
					// leftArm
					var leftArmSkeletonTrans = [ -0.27, 0.925, 0.0, ];
					var leftArmTranslate = [	[ 0.0, 0.0, 0.0 ], // LShoulderJointTranslate(0)
												[ -0.09, -0.125, 0.0 ], // LUpperarmTranslate(1)
												[ -0.09, -0.325, 0.0 ], // LEllbowTranslate(2)
												[ 0.0, -0.2, 0.0 ], // LForearmTranslate(3)
												[ 0.0, 0.0, 0.0 ], // LWristTranslate(4)
												[ 0.0, -0.1, 0.0 ] // LHandTranslate(5)
										   ];
					var leftHandTranslate = [ 0.0, -0.35, 0.0 ];	
						
					// rightArm
					var rightArmSkeletonTrans = [ 0.27, 0.925, 0.0, ];
					var rightArmTranslate = [	[ 0.0, 0.0, 0.0 ], // RShoulderJointTranslate(0)
												[ 0.09, -0.125, 0.0 ], // RUpperarmTranslate(1)
												[ 0.09, -0.325, 0.0 ], // REllbowTranslate(2)
												[ 0.0, -0.2, 0.0 ], // RForearmTranslate(3)
												[ 0.0, 0.0, 0.0 ], // RWristTranslate(4)
												[ 0.0, -0.1, 0.0 ] // RHandTranslate(5)
											];
					var rightHandTranslate = [ 0.0, -0.35, 0.0 ];		

					
				};
					
				/**
				* rotation
				**/
				{
					// head
					var faceRotation = {degree: Math.PI/2, axis: "[ 0, 1, 0 ]"} ;
					var neckRotation = {degree: Math.PI/2, axis: "[ 0, 0, 1 ]"} ;
					
					// torso
					var torsoRotation = {degree: Math.PI/2, axis: "[ 1, 0, 0 ]"};
					
					// leftArm
					var leftArmRotate = [ 	{degree: Math.PI/2, axis: "[ 0, 0, 1 ]"}, // LShoulderJointRotate(0)
											{degree: Math.PI/2, axis: "[ 0, 1, 0 ]"}, // LUpperarmRotate(1)
											{degree: Math.PI/2, axis: "[ 0, 0, 1 ]"}, // LEllbowRotate(2)
											{degree: Math.PI/2, axis: "[ 0, 1, 0 ]"}, // LForearmRotate(3)
											{degree: Math.PI/2, axis: "[ 0, 0, 1 ]"}, // LWristRotate(4)
											{degree: Math.PI/2, axis: "[ 0, 0, 1 ]"}, // LHandRotate(5)
										];
					
					// rightArm
					var rightArmRotate = [  {degree: Math.PI/2, axis: "[ 0, 0, 1 ]"}, // RShoulderJointRotate(0)
											{degree: Math.PI/2, axis: "[ 0, 1, 0 ]"}, // RUpperarmRotate(1)
											{degree: Math.PI/2, axis: "[ 0, 0, 1 ]"}, // REllbowRotate(2)
											{degree: Math.PI/2, axis: "[ 0, 1, 0 ]"}, // RForearmRotate(3)
											{degree: Math.PI/2, axis: "[ 0, 0, 1 ]"}, // RWristRotate(4)
											{degree: Math.PI/2, axis: "[ 0, 0, 1 ]"}, // RHandRotate(5)
										 ];
				};
								              
                // skeleton for the torso - TODO connect shoulders and neck HERE
                var torso = new SceneNode("torso");
                
                // skin for the torso: a cube...
                {
					var torsoSkin = new SceneNode("torso skin", [cube], prog_vertexColor);
					mat4.translate ( torsoSkin.transformation, torsoTranslate );
					mat4.scale( torsoSkin.transformation, torsoSize );
					mat4.rotate( torsoSkin.transformation, eval(torsoRotation.degree), eval(torsoRotation.axis) );
				
					// connect skeleton + skin
					torso.addObjects([torsoSkin]);
				};                
		              
                // Head skeleton
				{
					var headNeck = new SceneNode("Head skeleton");
					mat4.translate( headNeck.transformation, headSkeletonTrans );
				
					{
						var faceSkin = new SceneNode("Face skin", [cube], prog_vertexColor);
						mat4.translate( faceSkin.transformation, faceTranslate );
						mat4.scale( faceSkin.transformation, faceSize );
						mat4.rotate( faceSkin.transformation, eval(faceRotation.degree), eval(faceRotation.axis) );
						
						var LEyeSkin = new SceneNode("left eye skin", [triangle], prog_vertexColor);
						mat4.translate(LEyeSkin.transformation, [ -0.06, 0.22, 0.16 ]);
						mat4.scale(LEyeSkin.transformation, [ 0.05, 0.05, 0.05]);
					
						var REyeSkin = new SceneNode("left eye skin", [triangle], prog_vertexColor);
						mat4.translate(REyeSkin.transformation, [ 0.06, 0.22, 0.16 ]);
						mat4.scale(REyeSkin.transformation, [ 0.05, 0.05, 0.05]);
						
						var mouthSkin = new SceneNode("mouth skin", [band], prog_blue);
						mat4.translate(mouthSkin.transformation, [ 0.0, 0.1, 0.15 ]);
						mat4.scale(mouthSkin.transformation, [ 0.1, 0.05, 0.1 ]); 
						
						var neckSkin = new SceneNode("Neck skin", [band], prog_red);
						mat4.scale( neckSkin.transformation, neckSize );
						
						headNeck.addObjects([REyeSkin]);
						headNeck.addObjects([LEyeSkin]);
						headNeck.addObjects([mouthSkin]);
						headNeck.addObjects([faceSkin]);
						headNeck.addObjects([neckSkin]);
					};
				
					torso.addObjects([headNeck]);
				};
                
                /**
				 * -- left arm 
                 */
				{
					var leftArm = new SceneNode("Left arm");
					mat4.translate(leftArm.transformation, leftArmSkeletonTrans);

					// left upperarm skeleton
					{	
						
						var leftUpperarm = new SceneNode ("left upperarm skeleton");
						//mat4.translate(leftUpperarm.transformation, [0,0,0]);
						
						{
							var LShoulderJointSkin = new SceneNode ("left shoulder joint skin", [band], prog_blue);
							mat4.scale( LShoulderJointSkin.transformation, leftArmSize[0] );
							mat4.rotate( LShoulderJointSkin.transformation, eval(leftArmRotate[0].degree), eval(leftArmRotate[0].axis) );
							
							var LUpperarmSkin = new SceneNode("left upperarm skin", [cube], prog_vertexColor);
							mat4.translate( LUpperarmSkin.transformation, leftArmTranslate[1] );
							mat4.scale( LUpperarmSkin.transformation, leftArmSize[1] );
							mat4.rotate( LUpperarmSkin.transformation, eval(leftArmRotate[1].degree), eval(leftArmRotate[1].axis) );
							
							leftUpperarm.addObjects([LShoulderJointSkin]);
							leftUpperarm.addObjects([LUpperarmSkin]);
						};
						leftArm.addObjects([leftUpperarm]);
					};
						
					// --left forearm skeleton 
					{
						var leftForearm = new SceneNode ("left ellbow skeleton");
						mat4.translate( leftForearm.transformation, leftArmTranslate[2] );					
						{
							var LEllbowSkin = new SceneNode ("left ellbow joint skin", [band], prog_blue);
							mat4.scale( LEllbowSkin.transformation, leftArmSize[2] );
							mat4.rotate( LEllbowSkin.transformation, eval(leftArmRotate[2].degree), eval(leftArmRotate[2].axis) );
							
							var LForearmSkin = new SceneNode("left forearm skin", [cube], prog_vertexColor);
							mat4.translate( LForearmSkin.transformation, leftArmTranslate[3] );
							mat4.scale( LForearmSkin.transformation, leftArmSize[3] );
							mat4.rotate( LForearmSkin.transformation, eval(leftArmRotate[3].degree), eval(leftArmRotate[3].axis) );
							
							leftForearm.addObjects([LEllbowSkin]);
							leftForearm.addObjects([LForearmSkin]);
						};
						
						// left hand Skeleton
						{
							var leftHand = new SceneNode ("Left hand skeleton");
							mat4.translate( leftHand.transformation, leftHandTranslate );
							{
								var LWristSkin = new SceneNode ("Left wrist skin", [band], prog_red);
								mat4.scale(LWristSkin.transformation, leftArmSize[4] );
								mat4.rotate( LWristSkin.transformation, eval(leftArmRotate[4].degree), eval(leftArmRotate[4].axis) );
									
								var LHandSkin = new SceneNode("Left hand skin", [triangle], prog_vertexColor);
								mat4.translate( LHandSkin.transformation, leftArmTranslate[5] );
								mat4.scale( LHandSkin.transformation, leftArmSize[5] );
									
								leftHand.addObjects([LWristSkin]);
								leftHand.addObjects([LHandSkin]);
							};
							leftForearm.addObjects([leftHand]);		                	
						};
						leftArm.addObjects([leftForearm]);	                			
	                };
					torso.addObjects([leftArm]);
				};
                
                /**
				 * -- right arm
				 */
				{
					var rightArm = new SceneNode("right arm");
					mat4.translate(rightArm.transformation, rightArmSkeletonTrans);
					// right upperarm skeleton
					{
						var rightUpperarm = new SceneNode ("right upperarm skeleton");
						{
							var RShoulderJointSkin = new SceneNode ("right shoulder joint skin", [band], prog_blue);
							mat4.scale( RShoulderJointSkin.transformation, rightArmSize[0] );
							mat4.rotate( RShoulderJointSkin.transformation, eval(rightArmRotate[0].degree), eval(rightArmRotate[0].axis) );
							
							var RUpperarmSkin = new SceneNode("right upperarm skin", [cube], prog_vertexColor);
							mat4.translate( RUpperarmSkin.transformation, rightArmTranslate[1] );
							mat4.scale( RUpperarmSkin.transformation, rightArmSize[1] );
							mat4.rotate( RUpperarmSkin.transformation, eval(rightArmRotate[1].degree), eval(rightArmRotate[1].axis) );
							
							rightUpperarm.addObjects([RShoulderJointSkin]);
							rightUpperarm.addObjects([RUpperarmSkin]);
						};
						rightArm.addObjects([rightUpperarm]);
					};
							
					// right forearm skeleton
					{
						var rightForearm = new SceneNode ("right ellbow skeleton");
						mat4.translate( rightForearm.transformation, rightArmTranslate[2] );
						{
							var REllbowSkin = new SceneNode ("right ellbow joint skin", [band], prog_blue);
							mat4.scale(REllbowSkin.transformation, rightArmSize[2] );
							mat4.rotate( REllbowSkin.transformation, eval(rightArmRotate[2].degree), eval(rightArmRotate[2].axis) );
								
							var RForearmSkin = new SceneNode("right forearm skin", [cube], prog_vertexColor);
							mat4.translate( RForearmSkin.transformation, rightArmTranslate[3] );
							mat4.scale( RForearmSkin.transformation, rightArmSize[3] );
							mat4.rotate( RForearmSkin.transformation, eval(rightArmRotate[3].degree), eval(rightArmRotate[3].axis) );
								
							rightForearm.addObjects([REllbowSkin]);
							rightForearm.addObjects([RForearmSkin]);
						};
						
						// right hand Skeleton
						{
							var rightHand = new SceneNode ("right hand skeleton");
							mat4.translate( rightHand.transformation, rightHandTranslate );
							{
								var RWristSkin = new SceneNode ("right wrist skin", [band], prog_red);
								mat4.scale(RWristSkin.transformation, rightArmSize[4] );
								mat4.rotate( RWristSkin.transformation, eval(rightArmRotate[4].degree), eval(rightArmRotate[4].axis) );
									
								var RHandSkin = new SceneNode("right hand skin", [triangle], prog_vertexColor);
								mat4.translate( RHandSkin.transformation, rightArmTranslate[5] );
								mat4.scale( RHandSkin.transformation, rightArmSize[5] );
									
								rightHand.addObjects([RWristSkin]);
								rightHand.addObjects([RHandSkin]);
							};
							rightForearm.addObjects([rightHand]);
						};
						rightArm.addObjects([rightForearm]);
					};
					torso.addObjects([rightArm]);
				};
                             
                         
                // an entire robot
                var robot1  = new SceneNode("robot1", [torso]);
                mat4.translate(robot1.transformation, [0,-0.5,0]);
				//mat4.rotate(robot1.transformation, Math.PI/3, [0, 1, 0]);

                // the world - this node is needed in the draw() method below!
                this.world  = new SceneNode("world", [robot1], prog_red); 
                
                // for the UI - this will be accessed directly by HtmlController
                this.drawOptions = {"Perspective": true};


                /*
                 *
                 * Method to rotate within a specified joint - called from HtmlController
                 *
                 */
                this.rotateJoint = function(joint, angle) {
                
                    window.console.log("rotating " + joint + " by " + angle + " degrees." );
                    
                    // degrees to radians
                    angle = angle*Math.PI/180;
                    
                    // manipulate the right matrix, depending on the name of the joint
                    switch(joint) {
                        case "worldY": 
                            mat4.rotate(this.world.transformation, angle, [0,1,0]); // Y-axis
                            break;
                        case "worldX": 
                            mat4.rotate(this.world.transformation, angle, [1,0,0]); // X-axis
                            break;                        
                        case "headY": 
                            mat4.rotate(headNeck.transformation, angle, [0,1,0]); // h-key headNeck-rotation
                            break;
						case "leftArm": 
                            mat4.rotate(leftArm.transformation, -angle, [1,0,0]); // q-key leftArm-rotation
                            break;
						case "rightArm": 
                            mat4.rotate(rightArm.transformation, -angle, [1,0,0]); // w-key rightArm-rotation
                            break;
						case "leftForearm": 
                            mat4.rotate(leftForearm.transformation, -angle, [1,0,0]); // e-key leftForearm-rotation
                            break;
						case "rightForearm": 
                            mat4.rotate(rightForearm.transformation, -angle, [1,0,0]); // r-key rightForearm-rotation
                            break;
						//case "leftWristX": 
                        //    mat4.rotate(leftHand.transformation, angle, [0,1,0]); // s-key leftHand-rotation
                        //    break;
						//case "rightWristX": 
                        //    mat4.rotate(rightHand.transformation, -angle, [0,1,0]); // d-key rightHand-rotation
                        //    break;
						case "leftHand":
							mat4.rotate(leftForearm.transformation, angle, [0,0,1]);
							break;
						case "rightHand":
							mat4.rotate(rightForearm.transformation, -angle, [0,0,1]);
							break;
						case "leftHandX": 
                            mat4.rotate(LHandSkin.transformation, angle, [0,1,0]); // v-key LHandSkin-rotation
                            break;
						case "rightHandX": 
                            mat4.rotate(RHandSkin.transformation, -angle, [0,1,0]); // b-key RHandSkin-rotation
                            break;	
                        default:
                            window.console.log("joint " + joint + " not implemented:");
                            break;
                    };
                    this.draw();
                }; // rotateJoint()
                
            }; // MyRobotScene constructor
            
            // the scene's draw method draws whatever the scene wants to draw
            MyRobotScene.prototype.draw = function() {
            
                // get aspect ratio of canvas
                var c = $("#drawing_area").get(0);
                var aspectRatio = c.width / c.height;
                
                // set camera's projection matrix in all programs
                var projection = this.drawOptions["Perspective"] ?
                                    mat4.perspective(45, aspectRatio, 0.01, 100) : 
                                    mat4.ortho(-aspectRatio, aspectRatio, -1,1, 0.01, 100);
                
                for(var i=0; i<this.programs.length; i++) {
                    var p = this.programs[i];
                    p.use();
                    p.setUniform("projectionMatrix", "mat4", projection);
                };
                                    
                // initial camera / initial model-view matrix
                var modelView = mat4.lookAt([0,0.5,3], [0,0,0], [0,1,0]);
                
                // shortcut
                var gl = this.gl;
                
                // clear color and depth buffers
                gl.clearColor(0.7, 0.7, 0.7, 1.0); 
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
                
                // enable depth testing, keep fragments with smaller depth values
                gl.enable(gl.DEPTH_TEST); 
                gl.depthFunc(gl.LESS);  
                
                // start drawing at the world's root node
                this.world.draw(gl,this.prog_vertexColor, modelView);

            }; // MyRobotScene draw()
            
            // create scene and start drawing
            var scene = new MyRobotScene(gl);
            scene.draw();
			
			// head animation
			var headRight = true;
			var headLeft = false;
			var headCounter = 0;
			
			// arm animation
			var armCounter = 0;
			var forearmCounterX = 0;
			var forearmCounterZ = 0;
			var armUp = true;
			var armDown = false;
			var armUpDown = 0;
            // create an animation: rotate some joints
            var animation = new Animation( (function(t,deltaT) {
            	
                this.customSpeed = this.customSpeed || 1;
                
                // speed  times deltaT
                var speed = deltaT/1000*this.customSpeed;
                
                // rotate around Y with relative speed 3
                //scene.rotateJoint("worldY", 3*speed);
            	
				// head animation
				if(headRight == true && headLeft == false){
					scene.rotateJoint("headY", 2);
					headCounter++;
					if (headCounter == 20){
						headRight = false;
						headLeft = true;
					} 
				};
				if(headRight == false && headLeft == true){
					scene.rotateJoint("headY", -2);
					headCounter--;
					if (headCounter == -20){
						headRight = true;
						headLeft = false;
					} 
				};
				
				// arm animation
				if (armCounter < 25){
					scene.rotateJoint("leftArm", 2);
					scene.rotateJoint("rightArm", 2)
					armCounter++;
				};
				if (forearmCounterX < 20){
					scene.rotateJoint("leftForearm", 2);
					scene.rotateJoint("rightForearm", 2);
					forearmCounterX++;
				} else {
					scene.rotateJoint("leftHandX", 2);
					if ( forearmCounterZ < 15 ){
						scene.rotateJoint("leftHand", 2);
						scene.rotateJoint("rightHand", 2);
						forearmCounterZ++;
					} else {
						if (armUp == true && armDown == false){
							scene.rotateJoint("leftArm", 3/2*speed);
							scene.rotateJoint("rightArm", 3/2*speed);
							armUpDown++;
							if (armUpDown == 5){
								armUp = false;
								armDown = true;
							}
						} if (armUp == false && armDown == true){
							scene.rotateJoint("leftArm", -3/2*speed);
							scene.rotateJoint("rightArm", -3/2*speed);
							armUpDown--;
							if (armUpDown == -2){
								armUp = true;
								armDown = false;
							}
						}
					}
				};
				
			
                // redraw
                scene.draw();
                
            }));
            
            // create HTML controller that handles all the interaction of
            // HTML elements with the scene and the animation
            var controller = new HtmlController(scene,animation); 
        
        // end of try block
        } catch(err) {
            if($("#error")) {
                $('#error').text(err.message || err);
                $('#error').css('display', 'block');
            };
            window.console.log("exception: " + (err.message || err));;
            throw err;
        };
        
        
    })); // $(document).ready()
    
    
})); // define module
        

