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

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const canvas = document.querySelector('#webgl')

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
)

camera.position.z = 5

const target = new THREE.Object3D()

const loader = new GLTFLoader()
loader.load( 'models/mobile.gltf', function ( gltf ) {
  gltf.scene.rotation.x = -.29
  gltf.scene.position.y = 1.49
  gltf.scene.position.z = -.53

  
  // let bbox = new THREE.Box3().setFromObject(gltf.scene)
  // let helper = new THREE.Box3Helper(bbox, new THREE.Color(0, 255, 0))
  // let size = bbox.getSize(new THREE.Vector3())
  // scene.add(helper)
  // console.log(size)
  

	target.add( gltf.scene )
}, undefined, function ( error ) {
	console.error( error )
} )

const standloader = new GLTFLoader()
standloader.load( 'models/stand.gltf', function ( gltf ) {
	target.add( gltf.scene )
}, undefined, function ( error ) {
	console.error( error )
} )

scene.add(target)

const textures = [
    new THREE.TextureLoader().load('textures/t1.jpg'),
    new THREE.TextureLoader().load('textures/t2.jpg'),
    new THREE.TextureLoader().load('textures/t3.jpg'),
    new THREE.TextureLoader().load('textures/t4.jpg'),
    new THREE.TextureLoader().load('textures/t5.jpg')
  ]

let index = 0

const geometry = new THREE.PlaneGeometry(1.51, 3.4)
const material = new THREE.ShaderMaterial( {
  uniforms:{
    u_texture: {
      value: textures[4]
    }
  },
  vertexShader: vertexShaderSource,
  fragmentShader: fragmentShaderSource
} )
const screen = new THREE.Mesh(geometry, material)
scene.add(screen)

screen.rotation.x = -.29
screen.position.y = 1.49
screen.position.z = -.438


const environtment = new THREE.Mesh( 
  new THREE.SphereGeometry(6, 32, 16), 
  new THREE.ShaderMaterial( {
    uniforms:{
      u_texture: {
        value: new THREE.TextureLoader().load('textures/environment.jpg')
      }
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    side: THREE.BackSide
  } )
);
scene.add(environtment)
environtment.rotation.y = 1.4

const ambient_light = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambient_light)

const light = new THREE.DirectionalLight(0xffffff, 100)
light.position.set(-2, 2, -2)
scene.add(light)

let timer = 0, interval = 30

function animate() {
	requestAnimationFrame(animate)
  timer++
  if(timer == interval){
    index++
    if(index == textures.length) index = 0
    screen.material.uniforms.u_texture.value = textures[index]
    screen.material.needsUpdate = true
    timer = 0
  }
	renderer.render(scene, camera)
}

animate()

document.oncontextmenu = document.body.oncontextmenu = function() {return false}

let lorbit = {
  radius: Math.sqrt(light.position.x ** 2 + light.position.z ** 2),
  angle: Math.atan2(light.position.z, light.position.x),
  speed: 0.2,
}

window.addEventListener('mousedown', function(event) {
  switch (event.button) {
    case 0:
      lorbit.angle += lorbit.speed
      break
    case 2:
      lorbit.angle -= lorbit.speed
  }
  const x = lorbit.radius * Math.cos(lorbit.angle)
  const z = lorbit.radius * Math.sin(lorbit.angle)
  const y = light.position.y

  light.position.set(x, y, z)
});

let camorbit = {
  radius: camera.position.z,
  angle: 0,
  speed: 0.04,
  target: target.position
}

window.addEventListener("keydown", (event) => {
  if (event.key == 'ArrowLeft') camorbit.angle += camorbit.speed
  if (event.key == 'ArrowRight') camorbit.angle -= camorbit.speed

  camera.position.x = camorbit.radius * Math.sin(camorbit.angle)
  camera.position.z = camorbit.radius * Math.cos(camorbit.angle)
  camera.lookAt(camorbit.target)
})

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.render(scene, camera)
})