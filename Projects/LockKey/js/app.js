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

const loader = new GLTFLoader();


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}


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
camera.aspect = sizes.width / sizes.height;
camera.updateProjectionMatrix();

camera.position.z = 2;


// Create room
const roomGeometry = new THREE.BoxGeometry(10, 5, 10);
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

let lock_body, lock_head, key, camorbit

loader.load( 'models/lock.gltf', function ( gltf ) {
  lock_body = gltf.scene
  scene.add( lock_body );
  camera.lookAt(lock_body.position);

  camorbit = {
    radius: camera.position.z,
    angle: 0,
    speed: 0.08,
    target: lock_body.position
  }
}, undefined, function ( error ) {
	console.error( error );
} );

loader.load( 'models/lock_head.gltf', function ( gltf ) {
  lock_head = gltf.scene
  lock_head.position.y = -.43
  scene.add( lock_head );
}, undefined, function ( error ) {
	console.error( error );
} );

loader.load( 'models/key.gltf', function ( gltf ) {
  gltf.scene.scale.setScalar(.1)
  gltf.scene.rotation.x = Math.PI
  gltf.scene.position.y = -.4
  key = gltf.scene
	scene.add(key)
  animate();
}, undefined, function ( error ) {
	console.error( error );
} );

const ambient_light = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient_light);   

const light = new THREE.PointLight(0xffffff, 65, 50);
light.position.set(2, 2, 2);
scene.add(light);


let key_props = {
  inside: false,
  offset_y:{
    key: 0.45,
    unlocked: -0.34,
    locked: -0.45
  },
  speed: 0.001
}

window.addEventListener('click', function(event) {
  if(!key_props.inside){
    key_props.inside = true;
    key.position.y += key_props.offset_y.key
  }
  else{
    key_props.inside = false;
    key.position.y -= key_props.offset_y.key
  }
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


function animate() {
	requestAnimationFrame(animate);
  if(key_props.inside && (lock_head.position.y <= key_props.offset_y.unlocked)) {
    lock_head.position.y += key_props.speed;
  }
  else if(!key_props.inside && lock_head.position.y >= key_props.offset_y.locked) {
    lock_head.position.y -= key_props.speed;
  }
	renderer.render(scene, camera);
}