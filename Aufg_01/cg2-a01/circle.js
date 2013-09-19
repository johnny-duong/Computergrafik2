/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Circle
 *
 * A Circle knows how to draw itself into a specified 2D context,
 * can tell whether a certain mouse position "hits" the object,
 * and implements the function createDraggers() to create a set of
 * draggers to manipulate itself.
 *
 */


/* requireJS module definition */
define(["util", "vec2", "scene", "point_dragger"], 
       (function(Util, vec2, Scene, PointDragger) {
       
    "use strict";

    /**
     *  A simple circle that can be moved  
     *  
     *  Parameters:
     *  - point0: array objects representing [x,y] coordinates of the mid point of a circle
	 *  - r: number representing the radius of a circle
     *  - lineStyle: object defining width and color attributes for line drawing, 
     *       begin of the form { width: 2, color: "#00FF00" }
     */ 
	
    var Circle = function(point0, radius, lineStyle) {

        console.log("creating circle from P[" + 
                    point0[0] + "," + point0[1] + "] with a Radius of " + radius + ".");
        
        // draw style for drawing the line
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };

        // convert to Vec2 just in case the points were given as arrays
        this.mP = point0 || [0,0];
		this.radius = radius || (0);     
    };

    // draw this line into the provided 2D rendering context
    Circle.prototype.draw = function(context) {
        
        // set shape to draw
		context.beginPath();
        context.arc(this.mP[0], this.mP[1], 	// position of midpoint
					this.radius, 				// radius
					0.0, Math.PI*2,			// start and end angle
					true);					// clockwise
        context.closePath();
		
        // set drawing style
        context.lineWidth = this.lineStyle.width;
        context.strokeStyle = this.lineStyle.color;
        
        // actually start drawing
        context.stroke(); 
    };

    // test whether the mouse position is on the edge of the circle
    Circle.prototype.isHit = function(context,pos) {
		
		var diff = vec2.sub(this.mP, pos);
		var dist = vec2.length(diff);
		var accuracy = (this.lineStyle.width/2)+2;
		var delta = Math.max(this.radius, dist) - Math.min(this.radius, dist);
		
		return delta <= accuracy;
		
	};
    
    // return list of draggers to manipulate this line
    Circle.prototype.createDraggers = function() {
    	
		var _circle = this;
		
        var draggerStyle1 = { radius:4, color: _circle.lineStyle.color, width:0, fill:false }
		var draggerStyle2 = { radius:3, color: _circle.lineStyle.color, width:0, fill:true }
        var draggers = [];
			
		// dragger for midpoint
		var getMP = function() { return _circle.mP; };
        var setMP = function(dragEvent) { _circle.mP = dragEvent.position; };
		
		// dragger for manipulating the radius
		var getP = function() { return vec2.add(_circle.mP, [_circle.radius, 0]); };
		var setP = function(dragEvent) { 
			// prevents the radius to drop under 10
			if (_circle.radius + dragEvent.delta[0] >= 10 ){
				_circle.radius += dragEvent.delta[0];
			}
		};
		
        draggers.push( new PointDragger(getMP, setMP, draggerStyle1) );
		draggers.push( new PointDragger(getP, setP, draggerStyle2) );   
		     
        return draggers;
		        
    };
    
    // this module only exports the constructor for Circle objects
    return Circle;

})); // define

    
