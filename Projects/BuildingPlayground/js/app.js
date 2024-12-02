import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

camera.position.z = 11
//const controls = new OrbitControls( camera, renderer.domElement );

const textures = {
  building: [
    new THREE.TextureLoader().load('textures/bt1.jpeg'),
    new THREE.TextureLoader().load('textures/bt2.jpeg'),
    new THREE.TextureLoader().load('textures/bt3.jpg'),
    new THREE.TextureLoader().load('textures/bt4.jpg')
  ],
  grass: new THREE.TextureLoader().load('textures/grass.jpg'),
  sky: new THREE.TextureLoader().load('textures/sky_360.jpg'),
  index: 0 
}

const building = new THREE.Mesh(
  new THREE.BoxGeometry(5, 10, 5), 
  new THREE.ShaderMaterial({
    uniforms:{
      u_texture: {
        value: textures.building[0]
      }
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource
  })
)

scene.add(building)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40), 
  new THREE.MeshStandardMaterial({
    map: textures.grass
  })
)
ground.rotation.x = -90*Math.PI/180
ground.position.y -= 5
scene.add(ground)

const environtment = new THREE.Mesh( 
  new THREE.SphereGeometry(20, 32, 16), 
  new THREE.ShaderMaterial( {
    uniforms:{
      u_texture: {
        value: textures.sky
      }
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    side: THREE.BackSide
  } )
);
scene.add(environtment)

const loader = new GLTFLoader()

loader.load( 'models/double_bench.glb', function ( gltf ) {
  const double_bench = []
  for(let i=0; i<8; i++){
    double_bench.push(gltf.scene.clone())
    double_bench[i].scale.setScalar(.2)
    double_bench[i].traverse(function(node) {
      if (node.isMesh) node.castShadow = true
    })
  }
  double_bench[0].position.set(-2, -5, 4)
  double_bench[1].position.set(2, -5, 4)
  double_bench[2].position.set(4, -5, 2)
  double_bench[3].position.set(4, -5, -2)
  double_bench[4].position.set(2, -5, -4)
  double_bench[5].position.set(-2, -5, -4)
  double_bench[6].position.set(-4, -5, -2)
  double_bench[7].position.set(-4, -5, 2)

  double_bench[2].rotation.y = Math.PI/2
  double_bench[3].rotation.y = Math.PI/2
  double_bench[6].rotation.y = Math.PI/2
  double_bench[7].rotation.y = Math.PI/2
  scene.add(...double_bench)
}, undefined, function ( error ) {
	console.error( error )
} )


loader.load( 'models/playground.glb', function ( gltf ) {
  gltf.scene.position.set(6, -4.35, -2)
  gltf.scene.traverse(function(node) {
    if (node.isMesh) node.castShadow = true
  })
  scene.add(gltf.scene)
}, undefined, function ( error ) {
	console.error( error )
} )

const ambient_light = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambient_light)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(8, 10, -8)
scene.add(light)


renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
light.castShadow = true; 

building.castShadow = true; 
ground.receiveShadow = true;

const orbitprops = {
  lorbit: {
    radius: Math.sqrt(light.position.x ** 2 + light.position.z ** 2),
    angle: Math.atan2(light.position.z, light.position.x),
    speed: 0.004,
  },
  camorbit: {
    radius: camera.position.z,
    angle: Math.PI/2,
    speed: 0.04,
    target: new THREE.Vector3(0, camera.position.y, 0),
    shift: 0.1
  }
}

function animate() {
	requestAnimationFrame(animate)
  orbitprops.lorbit.angle += orbitprops.lorbit.speed
  light.position.x = orbitprops.lorbit.radius * Math.cos(orbitprops.lorbit.angle)
  light.position.z = orbitprops.lorbit.radius * Math.sin(orbitprops.lorbit.angle)
  //controls.update();
	renderer.render(scene, camera)
}

animate()

window.addEventListener('click', () => {
  textures.index++
  if(textures.index == textures.building.length) textures.index = 0;
  building.material.uniforms.u_texture.value = textures.building[textures.index]
})

window.addEventListener("keydown", (event) => {
  if (event.key == 'ArrowLeft') orbitprops.camorbit.angle += orbitprops.camorbit.speed
  if (event.key == 'ArrowRight') orbitprops.camorbit.angle -= orbitprops.camorbit.speed
  if (event.key == 'ArrowUp') camera.position.y += orbitprops.camorbit.shift
  if (event.key == 'ArrowDown') camera.position.y -= orbitprops.camorbit.shift

  if(camera.position.y < -4) camera.position.y = -4
  else if (camera.position.y > 4) camera.position.y = 4;

  orbitprops.camorbit.target = new THREE.Vector3(0, camera.position.y, 0)

  camera.position.x = orbitprops.camorbit.radius * Math.cos(orbitprops.camorbit.angle)
  camera.position.z = orbitprops.camorbit.radius * Math.sin(orbitprops.camorbit.angle)
  camera.lookAt(orbitprops.camorbit.target)
})

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.render(scene, camera)
})