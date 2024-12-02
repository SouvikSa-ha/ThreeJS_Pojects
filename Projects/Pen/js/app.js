import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var vertexShaderSource =
`
varying vec2 v_UV;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  v_UV = uv;
}
`;

var fragmentShaderSource =
`
precision mediump float;
uniform sampler2D u_wallTexture;
varying vec2 v_UV;
void main() {
  gl_FragColor = texture2D(u_wallTexture, v_UV);
}
`;

const scene = new THREE.Scene();

const roomGeometry = new THREE.BoxGeometry(20, 20, 20);
const wallTexture = new THREE.TextureLoader().load('texture/wall-texture.jpg');
const floorTexture = new THREE.TextureLoader().load('texture/floor-texture.avif');

const roomMaterials = [
    new THREE.ShaderMaterial({
      uniforms:{
        u_wallTexture: {
          value: wallTexture
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      side: THREE.BackSide
    }), 
    new THREE.ShaderMaterial({
      uniforms:{
        u_wallTexture: {
          value: wallTexture
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      side: THREE.BackSide
    }),
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }), 
    new THREE.ShaderMaterial({
      uniforms:{
        u_wallTexture: {
          value: floorTexture
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      side: THREE.BackSide
    }), 
    new THREE.ShaderMaterial({
      uniforms:{
        u_wallTexture: {
          value: wallTexture
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      side: THREE.BackSide
    }), 
    new THREE.ShaderMaterial({
      uniforms:{
        u_wallTexture: {
          value: wallTexture
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      side: THREE.BackSide
    }), 
];
const room = new THREE.Mesh(roomGeometry, roomMaterials);
room.position.set(0, 1, 0);
scene.add(room);

const loader = new GLTFLoader();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

camera.position.z = 10;

let loadedModel, pencap, camorbit;

loader.load( 'models/pen_holder.glb', function ( gltf ) {
  gltf.scene.scale.setScalar(2);
  loadedModel = gltf.scene;
  scene.add( gltf.scene );
  camorbit = {
    radius: camera.position.z,
    angle: 0,
    speed: 0.04,
    target: loadedModel.position
  };
  camera.lookAt(camorbit.target);
}, undefined, function ( error ) {
	console.error( error );
} );

loader.load( 'models/pen_body.gltf', function ( gltf ) {
  gltf.scene.scale.setScalar(4);
  gltf.scene.position.x = 1;
  gltf.scene.position.y = -.85;
  gltf.scene.rotation.z = -20 * Math.PI/180;
	scene.add( gltf.scene );
}, undefined, function ( error ) {
	console.error( error );
} );


loader.load( 'models/pen_head.gltf', function ( gltf ) {
  gltf.scene.scale.setScalar(4)
  
  gltf.scene.position.x = 1;
  gltf.scene.position.y = -.85;
  gltf.scene.rotation.z = -20 * Math.PI/180;
	scene.add( gltf.scene );
  pencap = gltf.scene;
  animate();
}, undefined, function ( error ) {
	console.error( error );
} );

const ambient_light = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient_light);   

const light = new THREE.PointLight(0xffffff, 100, 50);
light.position.set(-2, 2, -2);
scene.add(light);

let penvars = {
  height: {
    max: 2,
    min: -.85
  },
  isOpening: true
};

function animate() {
	requestAnimationFrame(animate);
  let dx = 0.001;
  let dy = -Math.tan(-20 * Math.PI/180) * dx + .0024;
  if(penvars.isOpening && pencap.position.y <= penvars.height.max){
    pencap.position.y += dy;
    pencap.position.x += dx;
  }
  else {
    penvars.isOpening = false;
  }

  if(!penvars.isOpening && pencap.position.y >= penvars.height.min){
    pencap.position.y -= dy;
    pencap.position.x -= dx;
  }
  else {
    penvars.isOpening = true;
  }
  
	renderer.render(scene, camera);
}

document.oncontextmenu = document.body.oncontextmenu = function() {return false;};

let lorbit = {
  radius: Math.sqrt(light.position.x ** 2 + light.position.z ** 2),
  angle: Math.atan2(light.position.z, light.position.x),
  speed: 1
};

window.addEventListener('mousedown', function(event) {
  switch (event.button) {
    case 0:
      lorbit.angle += lorbit.speed;
      break;
    case 2:
      lorbit.angle -= lorbit.speed;
  }
  
  const x = lorbit.radius * Math.cos(lorbit.angle);
  const z = lorbit.radius * Math.sin(lorbit.angle);
  const y = light.position.y;

  light.position.set(x, y, z);
});



window.addEventListener("keydown", (event) => {
  if (event.key == 'ArrowLeft') camorbit.angle += camorbit.speed;
  if (event.key == 'ArrowRight') camorbit.angle -= camorbit.speed;

  const x = camorbit.radius * Math.sin(camorbit.angle)
  const z = camorbit.radius * Math.cos(camorbit.angle)
  const y = camera.position.y;

  camera.position.set(x, y, z);
  camera.lookAt(camorbit.target);
  renderer.render(scene, camera);
})
