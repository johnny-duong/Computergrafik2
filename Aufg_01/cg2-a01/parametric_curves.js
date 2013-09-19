/* requireJS module definition */
define(["util", "vec2", "scene", "point_dragger"], 
       (function(Util, vec2, Scene, PointDragger) {
  
	// "use strict"
	/*		
	 * @param f_t function f(t)
	 * @param g_t function g(t)
	 */
	
    var ParaCurve = function(min_t, max_t, f_t, g_t, segment, marks, lineStyle) {
		this.min_t = min_t || 0;
		this.max_t = max_t || 5;
		this.f = f_t ||  ("350+100*Math.sin(t);");		
		this.g = g_t ||  ("150+100*Math.cos(t);"); 
		this.segment = segment || 20;
		this.array = []
		this.evalFunc = function (source, t){
			return eval(source);
		}
		this.marks = marks;
		

        console.log("creating parametric curve: " +
					"\nt_min " + this.min_t + 
					"\nt_max " + this.max_t + 
					"\nsegments " + this.segment );
        		
        // draw style for drawing the line
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };

    };

    // draw this line into the provided 2D rendering context
    ParaCurve.prototype.draw = function(context) {
	
		try{
			var err = [this.evalFunc(this.f, this.min_t), this.evalFunc(this.g, this.min_t)];
		} catch (e){
			alert("Please check the formula.");
			return;
		};
		
   		context.beginPath();
		
		var deltaT = (this.max_t - this.min_t)/this.segment;
		
		for(var i = 0; i <= this.segment; i++){
			var t = (i * deltaT + this.min_t);	
			this.array[i] = [this.evalFunc(this.f, t), this.evalFunc(this.g, t)];
//			if(i == 0){
//				context.moveTo(this.array[0][0], this.array[0][1]);
//			} else {
//				context.lineTo(this.array[i][0], this.array[i][1]);
//			};			
		};
		context.moveTo(this.array[0][0], this.array[0][1]);
		//console.log (t);
		for (var i = 1; i <= this.segment; i++){
			context.lineTo(this.array[i][0], this.array[i][1]);
		};

		// set drawing style
        context.lineWidth = this.lineStyle.width;
        context.strokeStyle = this.lineStyle.color; 

		// actually start drawing
        context.stroke(); 
		
		if(this.marks){
        	
        	context.beginPath();

			for(var i = 1; i < this.segments; i++){

				var appr =  vec2.sub(this.array[(i+1)], this.array[(i-1)]) ;
				var norm = [appr[1] * (-1), appr[0]];

				var normalizedVecN = vec2.mult(norm, (1 / vec2.length(norm)));
				var tick0 =  vec2.add(this.array[i], vec2.mult(normalizedVecN, 10));
				var tick1 =  vec2.sub(this.array[i], vec2.mult(normalizedVecN, 10));

				context.moveTo(tick0[0],tick0[1]);
				context.lineTo(tick1[0],tick1[1]);
		};
		
		// draw style
	    context.lineWidth = 1;
	    context.strokeStyle = "#123456";
	    
	    // start drawing
	    context.stroke();	
	
		}
	};


	ParaCurve.prototype.isHit = function(context,pos) {
		
		var b = false;
		var p0 = this.array[0];

		for(var i = 1; i < this.array.length; i++){		
			
			var p1 = this.array[i];
			
			 // project point on line, get parameter of that projection point
	        var t = vec2.projectPointOnLine(pos, p0, p1);
	                
	        // outside the line segment?
	        if(t<0.0 || t>1) {
	        	p0 = p1;
	            continue; 
	        }
	        
	        // coordinates of the projected point 
	        var p = vec2.add(p0, vec2.mult( vec2.sub(p1,p0), t ));

	        // distance of the point from the line
	        var d = vec2.length(vec2.sub(p,pos));
	        
	        // allow 2 pixels extra "sensitivity"
	        if( d<=(this.lineStyle.width/2)+2 ){
	        	b = true;
	        }
	        p0 = p1;
	    }
		
		return b;
	};	
    
    // return list of draggers to manipulate this line
    ParaCurve.prototype.createDraggers = function() {
    	return [];
    };
    
    // this module only exports the constructor for Circle objects
    return ParaCurve;

})); // define

    
