/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: html_controller
 *
 * Defines callback functions for communicating with various 
 * HTML elements on the page, e.g. buttons and parameter fields.
 *
 */

 
/* requireJS module definition */
define(["jquery", "straight_line", "circle", "parametric_curves"], 
       (function($, StraightLine, Circle, ParaCurve) {

    "use strict"; 
                
    /*
     * define callback functions to react to changes in the HTML page
     * and provide them with a closure defining context and scene
     */
    var HtmlController = function(context,scene,sceneController) {
    	
		
		// canvas width
		var canvasW = context.canvas.width;
		// canvas height
		var canvasH = context.canvas.height;
		
		/* generate random circle values
		 *
		 * returns an Array with 3 values for a random circle
		 * randomCircleVal [0] = x-position of the midpoint
		 * randomCircleVal [1] = y-position of the midpoint
		 * randomCircleVal [2] = radius of the circle
		 */
		var randomCircleVal = function () {
			var randomCX = Math.floor(Math.random()*(canvasW-30))+20; 
      		var randomCY = Math.floor(Math.random()*(canvasH-30))+20;
			//var rMaxVal = Math.floor( getRMax(randomCX, randomCY));
			var randomR = Math.floor(Math.random()*getRMax(randomCX, randomCY))+10;//rMaxVal)+10;
			
			return [randomCX, randomCY, randomR];
		}
		
		// return max value of radius
		var getRMax = function (randomCX, randomCY){
			var rValMin = Math.min(randomCX, randomCY);
			var rValMax = Math.min((canvasW - randomCX), (canvasH - randomCY));
			return Math.min(rValMin, rValMax) - 10;
		}
		
		// random min_t and max_t
		var randomMinMax_t = function (){
			var mini = Math.floor(Math.random()*50);
			var maxi = Math.floor(Math.random()*50);
			var t_min = Math.min(mini, maxi);
			var t_max = Math.max(mini, maxi);
		
			return [t_min, t_max];
		};
				
		// random amount of segments 
        var randomIntValue = function(min, max) {
			var delta = max - min;
            return (Math.floor(Math.random() * delta ))+min;
        };
		
		// generate random X coordinate within the canvas
		var randomX = function() { 
            return Math.floor(Math.random()*(canvasW-10))+5; 
        };
		    
        // generate random Y coordinate within the canvas
        var randomY = function() { 
            return Math.floor(Math.random()*(canvasH-10))+5; 
        };
            
        // generate random color in hex notation
        var randomColor = function() {

            // convert a byte (0...255) to a 2-digit hex string
            var toHex2 = function(byte) {
                var s = byte.toString(16); // convert to hex string
                if(s.length == 1) s = "0"+s; // pad with leading 0
                return s;
            };
                
            var r = Math.floor(Math.random()*25.9)*10;
            var g = Math.floor(Math.random()*25.9)*10;
            var b = Math.floor(Math.random()*25.9)*10;
                
            // convert to hex notation
            return "#"+toHex2(r)+toHex2(g)+toHex2(b);
	  };
		
        /*
         * event handler for "new line button".
         */
        $("#btnNewLine").click( (function() {
        
            // create the actual line and add it to the scene
            var style = { 
                width: Math.floor(Math.random()*3)+1,
                color: randomColor()
            };
                          
            var line = new StraightLine( [randomX(),randomY()], 
                                         [randomX(),randomY()], 
                                         style );
            scene.addObjects([line]);

            // deselect all objects, then select the newly created object
            sceneController.deselect();
            sceneController.select(line); // this will also redraw
                        
        }));
        
		/*
         * event handler for "new circle button".
         */
        $("#btnNewCircle").click( (function() {
        
            // create the actual line and add it to the scene
            var style = { 
                width: Math.floor(Math.random()*3)+1,
                color: randomColor()
            };
		    
			var rCircle = randomCircleVal();                      
            var circle = new Circle( [rCircle[0],rCircle[1]], 
                                      rCircle[2], 
                                      style );
            scene.addObjects([circle]);

            // deselect all objects, then select the newly created object
            sceneController.deselect();
            sceneController.select(circle); // this will also redraw
                        
        }));
    	
	  	/*
         * event handler for "new parametric curve button".
         */
        $("#btnNewParaCurve").click( (function() {
        	
			// create the actual line and add it to the scene
            var style = { 
                width: Math.floor(Math.random()*3)+1,
                color: randomColor()
            };
			
			var x = randomX();
			var y = randomY();
			
			var minMax_t = randomMinMax_t();
			var f_t = x + "+100*Math.sin(t);";
			var g_t = y + "+100*Math.cos(t);";
			
			var	paraC = new ParaCurve (0, 6.28, f_t, g_t, randomIntValue(5,30), style);
			console.log ( paraC );
			scene.addObjects([paraC]);
			 	
            // deselect all objects, then select the newly created object
            sceneController.deselect();
            sceneController.select(paraC); // this will also redraw
                        
        }));
		
	
			/*
			 *show properties of selected Object		
			 */
			var showSelectedProps = function () {
			
			var obj = sceneController.getSelectedObject();
			
			var xMax = canvasW-5;
			var yMax = canvasH-5;
			var minXY = 5;
			$(".xMax").attr("max", xMax);
			$(".yMax").attr("max", yMax);
			$(".xMax").attr("min", minXY);
			$(".yMax").attr("min", minXY);
			
			$(".disProps").hide();
			
			if (obj instanceof StraightLine) {
				$("#lineProps").show();
			};
			
			if (obj instanceof Circle) {
				$("#circleProps").show();
			};
			if (obj instanceof ParaCurve){
				$("#paraCurveProps").show()
			};
//			if (obj instanceof StraightLine) $("#lineProps").show();
//			if (obj instanceof StraightLine) $("#lineProps").show();
			$(".inputFunc").change(getInputField);
			$(".inputCoord").change(getInputField);
			$(".input").change(getInputField);
			setInputField();
			
		};
		
		/*
		 * get Value of the input field and update the object
		 */
		var getInputField = function(){
		
			var obj = sceneController.getSelectedObject();
			
			obj.lineStyle.color = ($("#ipColor").attr("value"));
			if ( parseFloat ($("#ipThickness").attr("value")) > 
				 parseFloat ($("#ipThickness").attr("max"))){
				obj.lineStyle.width = parseFloat ($("#ipThickness").attr("max"));
			} else {
				obj.lineStyle.width = parseFloat ($("#ipThickness").attr("value"));
			}
			
			if (obj instanceof StraightLine) {
			
				obj.p0[0] = parseFloat($("#ipLineP0x").attr("value"));
				obj.p0[1] = parseFloat($("#ipLineP0y").attr("value"));
				obj.p1[0] = parseFloat($("#ipLineP1x").attr("value"));
				obj.p1[1] = parseFloat($("#ipLineP1y").attr("value"));
			
			};
						
			if(obj instanceof Circle){

                obj.mP[0] = parseFloat($("#ipCircMPx").attr("value"));
                obj.mP[1] = parseFloat($("#ipCircMPy").attr("value"));
                obj.radius = parseFloat($("#circRadius").attr("value"));

		  	};
			// console.log("max value: " + parseFloat($("#ipThickness").attr("max")));
			
			if (obj instanceof ParaCurve){
			
				obj.min_t = parseFloat($("#ipParaCurveMinT").attr("value"));
				obj.max_t = parseFloat($("#ipParaCurveMaxT").attr("value"));
				obj.segment = parseFloat($("#ipParaCurveSeg").attr("value"));
				obj.f_t = $("#ipParaCurveX_t").attr("value");
				obj.g_t = $("#ipParaCurveY_t").attr("value");
				obj.tickMarks = $("#cbParaCurve").is(':checked');

				console.log ( obj.f_t + " \n" + obj.g_t);
				
			};
			
			sceneController.scene.draw(context);
			
		};
		
		
		/*
		 * passing the value of the object to the input field
		 */ 
		var setInputField = function(){
			
			var obj = sceneController.getSelectedObject();
			
			$("#ipThickness").attr("value", parseFloat(obj.lineStyle.width));
			$("#ipColor").attr("value", obj.lineStyle.color);
			
			if (obj instanceof StraightLine){
			
				$("#ipLineP0x").attr("value", parseFloat(obj.p0[0]));
				$("#ipLineP0y").attr("value", parseFloat(obj.p0[1]));
				$("#ipLineP1x").attr("value", parseFloat(obj.p1[0]));
				$("#ipLineP1y").attr("value", parseFloat(obj.p1[1]));
			
			};
			
			if (obj instanceof Circle){
			
				$("#ipCircMPx").attr("value", parseFloat(obj.mP[0]));
				$("#ipCircMPy").attr("value", parseFloat(obj.mP[1]));
				$("#circRadius").attr("value", parseFloat(obj.radius));
				
			};
			
			if (obj instanceof ParaCurve){
			
				$("#ipParaCurveMinT").attr("value", parseFloat(obj.min_t));
				$("#ipParaCurveMaxT").attr("value", parseFloat(obj.max_t));
				$("#ipParaCurveSeg").attr("value", parseFloat(obj.segment));
				$("#ipParaCurveX_T").attr("value", obj.f);
				$("#ipParaCurveY_T").attr("value", obj.g);
		
			};
			
			
		};
			
		sceneController.onSelection(showSelectedProps);
		sceneController.onObjChange(setInputField);
    };
	
	
	(function init() {
		$(".disProps").hide();
	})();
	
    // return the constructor function 
    return HtmlController;


})); // require 
