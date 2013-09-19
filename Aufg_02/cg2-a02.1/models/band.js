/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Band
 *
 * The Band is made of two circles using the specified radius.
 * One circle is at y = height/2 and the other is at y = -height/2.
 *
 */


/* requireJS module definition */
define(["util", "vbo"], 
       (function(Util, vbo) {
       
    "use strict";
    
    /*
     */
    var Band = function(gl, config) {
    
        // read the configuration parameters
        config = config || {};
        var radius   = config.radius   || 1.0;
        var height   = config.height   || 0.1;
        var segments = config.segments || 20;
        this.asWireframe = config.asWireframe || false;
				this.filled = config.filled || false;
				
        window.console.log("Creating a " + (this.asWireframe? "Wireframe " : "") + 
                            "Band with radius="+radius+", height="+height+", segments="+segments ); 
    
        // generate vertex coordinates and store in an array
        var coords = [];
        for(var i=0; i<=segments; i++) {
        
            // X and Z coordinates are on a circle around the origin
            var t = (i/segments)*Math.PI*2;
            var x = Math.sin(t) * radius;
            var z = Math.cos(t) * radius;
            // Y coordinates are simply -height/2 and +height/2 
            var y0 = height/2;
            var y1 = -height/2;
            
            // add two points for each position on the circle
            // IMPORTANT: push each float value separately!
            coords.push(x,y0,z);
            coords.push(x,y1,z);
            
        };  
        
        // indices for filled band
        var bIndex = [];
        for ( var i = 0; i<segments*2; i+=2 ) {
        		bIndex.push(i, i+1, i+2, i+2, i+1, i+3); //CCW
				// CW bIndex.push(i, i+2, i+3, i, i+3, i+1);
        		//window.console.log(bIndex + "\n");
        };       
        
        // indices for wireframe
        var separator = [];
        for ( var i = 0; i<segments*2; i+=2 ) {   	
						separator.push( i  , i+1 );
						separator.push( i  , i+2 );
						separator.push( i+1, i+3 );
						separator.push( i+2, i+3 );
        };
        
        // create vertex buffer object (VBO) for the coordinates
        this.coordsBuffer = new vbo.Attribute(gl, { "numComponents": 3,
                                                    "dataType": gl.FLOAT,
                                                    "data": coords 
                                                  } );
				// create vertex buffer object (VBO) for the indices
				this.bIndexBuffer = new vbo.Indices( gl, { "indices": bIndex } );
				
				// create vertex buffer object (VBO) for the indices
			  this.separatorBuffer = new vbo.Indices( gl, { "indices": separator } );
			  
    };

    // draw method clears color buffer and optionall depth buffer
    Band.prototype.draw = function(gl,program) {
 
 				if (this.asWireframe) {
		        // bind the attribute buffers
		        this.coordsBuffer.bind(gl, program, "vertexPosition");
		 				this.separatorBuffer.bind(gl);
					
		        // draw the vertices as points
		        gl.drawElements(gl.LINES, this.separatorBuffer.numIndices(), gl.UNSIGNED_SHORT, 0); 
        };
        
			  if (this.filled) {
        	
//						gl.enable(gl.POLYGON_OFFSET_FILL);
//            gl.polygonOffset(1.0, 1.0);
                        	
        		// bind the attribute buffers
        		this.coordsBuffer.bind(gl, program, "vertexPosition");
        		this.bIndexBuffer.bind(gl);

        		// draw the vertices as points
        		gl.drawElements(gl.TRIANGLES, this.bIndexBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
        }; 
    };
        
    // this module only returns the Band constructor function    
    return Band;

})); // define

    
