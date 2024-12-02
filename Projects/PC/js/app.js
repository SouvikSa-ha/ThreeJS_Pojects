import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

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
uniform sampler2D u_texture;
varying vec2 v_UV;
void main() {
  gl_FragColor = texture2D(u_texture, v_UV);
}
`;

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

camera.position.set(0, 3, 3)

const target = new THREE.Object3D()
target.position.y = 2
scene.add(target)
camera.lookAt(target.position)

const loader = new GLTFLoader()
loader.load( 'models/setup.glb', function ( gltf ) {
  gltf.scene.rotation.y = -130 * Math.PI/180
  gltf.scene.scale.setScalar(.4)
  gltf.scene.traverse(function(node) {
    if (node.isMesh) node.castShadow = true
  })
	scene.add( gltf.scene )
}, undefined, function ( error ) {
	console.error( error )
} )

loader.load( 'models/computer_monitor_.glb', function ( gltf ) {
  gltf.scene.rotation.y = -40 * Math.PI/180
  gltf.scene.scale.setScalar(.4)
  gltf.scene.position.x = .7  
  gltf.scene.position.y = 1.64
  gltf.scene.position.z = -1.2 
	scene.add( gltf.scene )
}, undefined, function ( error ) {
	console.error( error )
} )


const textures = [
    new THREE.TextureLoader().load('textures/s1.jpg'),
    new THREE.TextureLoader().load('textures/s2.jpg'),
    new THREE.TextureLoader().load('textures/s3.jpg'),
    new THREE.TextureLoader().load('textures/s4.jpg'),
    new THREE.TextureLoader().load('textures/s5.jpg'),
    new THREE.TextureLoader().load('textures/s6.jpg')
  ]

let index = 0

const geometry = new THREE.PlaneGeometry(1.3, 0.72)
const material = new THREE.ShaderMaterial( {
  uniforms:{
    u_texture: {
      value: textures[0]
    }
  },
  vertexShader: vertexShaderSource,
  fragmentShader: fragmentShaderSource
} )
const screen = new THREE.Mesh(geometry, material)
screen.position.x = .7 
screen.position.y = 2.06
screen.position.z = -1.203
screen.rotation.y = -40 * Math.PI/180
scene.add(screen)


const environtment = new THREE.Mesh( 
  new THREE.BoxGeometry(10, 6, 15), 
  new THREE.MeshStandardMaterial( {
    map: new THREE.TextureLoader().load('textures/floor-texture.avif'), 
    side: THREE.BackSide
  } )
);
scene.add(environtment)
environtment.position.y = 3
environtment.position.z = 2
environtment.rotation.y = 50 * Math.PI/180
environtment.receiveShadow = true

const ambient_light = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambient_light)

const light = new THREE.PointLight(0xffffff, 100, 20)
light.position.set(-5, 4, -5)
scene.add(light)

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
light.castShadow = true

let lorbit = {
  radius: Math.sqrt(light.position.x ** 2 + light.position.z ** 2),
  angle: Math.atan2(light.position.z, light.position.x),
  speed: 0.003,
}

function animate() {
	requestAnimationFrame(animate)
  lorbit.angle += lorbit.speed
  light.position.x = lorbit.radius * Math.cos(lorbit.angle)
  light.position.z =lorbit.radius * Math.sin(lorbit.angle)
	renderer.render(scene, camera)
}
animate()

window.addEventListener('click', () => {
  index++;
  if(index == textures.length) index = 0
  screen.material.uniforms.u_texture.value = textures[index];  
});

let camorbit = {
  radius: camera.position.z,
  angle: Math.PI/2,
  speed: 0.04,
  target: target.position
}

window.addEventListener("keydown", (event) => {
  if (event.key == 'ArrowLeft') camorbit.angle += camorbit.speed
  if (event.key == 'ArrowRight') camorbit.angle -= camorbit.speed

  camera.position.x = camorbit.radius * Math.cos(camorbit.angle)
  camera.position.z = camorbit.radius * Math.sin(camorbit.angle)
  camera.lookAt(camorbit.target)
})
