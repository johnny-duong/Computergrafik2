/*
 * Fragment Shader: planet
 *
 * expects position and normal vectors in eye coordinates per vertex;
 * expects uniforms for ambient light, directional light, and phong material.
 * 
 *
 */

precision mediump float;

// position and normal in eye coordinates
varying vec4  ecPosition;
varying vec3  ecNormal;

// transformation matrices
uniform mat4  modelViewMatrix;
uniform mat4  projectionMatrix;

// Ambient Light
uniform vec3 ambientLight;

// Draw Options
uniform bool nightLights;
uniform bool clouds;

// Material
struct PhongMaterial {
    vec3  ambient;
    vec3  diffuse;
    vec3  specular;
    float shininess;
};
uniform PhongMaterial material;

// texture
uniform sampler2D daylightTexture;
uniform sampler2D nightlightTexture;
uniform sampler2D bathymetryTexture;
uniform sampler2D cloudsTexture;
varying vec2 texCoords;

// Light Source Data for a directional light
struct LightSource {

    int  type;
    vec3 direction;
    vec3 color;
    bool on;
    
} ;
uniform LightSource light;

/*

 Calculate surface color based on Phong illumination model.
 - pos:  position of point on surface, in eye coordinates
 - n:    surface normal at pos
 - v:    direction pointing towards the viewer, in eye coordinates
 + assuming directional light
 
 */
vec3 phong(vec3 pos, vec3 n, vec3 v, LightSource light, PhongMaterial material) {
    
    // textures
    vec3 colorDay = texture2D(daylightTexture, texCoords).rgb;
    vec3 colorNight = texture2D(nightlightTexture, texCoords).rgb;
    vec3 colorClouds = texture2D(cloudsTexture, texCoords).rgb;

	// ambient part
    vec3 ambient = material.ambient * ambientLight;
    
    // back face towards viewer?
    float ndotv = dot(n,v);
    if(ndotv<0.0)
        return vec3(0,0,0);
    
    // vector from light to current point
    vec3 l = normalize(light.direction);
    
    // cos of angle between light and surface. 0 = light behind surface
    float ndotl = dot(n,-l);

	// adds clouds
    
    if(clouds){
        colorDay = colorDay + colorClouds;
        colorNight = colorNight - colorClouds;
    }
	
	
	float ndotlNorm = (ndotl + 1.0) / 2.0;
    vec3 color = (1.0 - ndotlNorm) * colorNight + ndotlNorm * colorDay;	
	
	// diffuse contribution
    vec3 diffuse = colorDay * light.color * ndotl;
    
     // reflected light direction = perfect reflection direction
    vec3 r = reflect(l,n);
    
    // angle between reflection dir and viewing dir
    float rdotv = max( dot(r,v), 0.0);
    
    // specular contribution
    float reflectionColor;
    if(clouds){
        reflectionColor = (texture2D(bathymetryTexture, texCoords).r + texture2D(cloudsTexture, texCoords).r) / 2.0;
    }else{
        reflectionColor = texture2D(bathymetryTexture, texCoords).r;
    }
    //return vec3(reflectionColor,reflectionColor,reflectionColor);
    float reflectionFactor = reflectionColor;
    float shininess = material.shininess + (100.0 * (1.0 - reflectionFactor)) ;
    vec3 specularReflexion = material.specular * reflectionFactor;
    vec3 specular = ( specularReflexion * light.color * pow(rdotv, shininess) );
	
	// return sum of all contributions
    if(nightLights)
        return ambient + color + specular; 

    if(ndotl<=0.0){
            return ambient;
    }else {
        return ambient + diffuse + specular;
    }    
}




void main() {
    
    // normalize normal after projection
    vec3 normalEC = normalize(ecNormal);
    
    // do we use a perspective or an orthogonal projection matrix?
    bool usePerspective = projectionMatrix[2][3] != 0.0;
    
    // for perspective mode, the viewing direction (in eye coords) points
    // from the vertex to the origin (0,0,0) --> use -ecPosition as direction.
    // for orthogonal mode, the viewing direction is simply (0,0,1)
    vec3 viewdirEC = usePerspective? normalize(-ecPosition.xyz) : vec3(0,0,1);
    
    // calculate color using phong illumination
    vec3 color = phong( ecPosition.xyz, normalEC, viewdirEC,
                        light, material );
    
    // set fragment color
    gl_FragColor = vec4(color, 1.0);
    
}
