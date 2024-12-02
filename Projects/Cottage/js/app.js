import * as THREE from 'three'

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

camera.position.z = 15

const textures = {
  building: new THREE.TextureLoader().load('textures/bt.jpg'),
  cottage: {
    wall: [
      new THREE.TextureLoader().load('textures/ct1.jpg'),
      new THREE.TextureLoader().load('textures/ct2.jpg'),
      new THREE.TextureLoader().load('textures/ct3.jpg')
    ],
    roof: new THREE.TextureLoader().load('textures/straw.jpg')
  },
  ground: new THREE.TextureLoader().load('textures/ground.jpg'),
  sky: new THREE.TextureLoader().load('textures/sky.jpg'),
  index: 0
}

const building = new THREE.Mesh(
  new THREE.BoxGeometry(8, 16, 8), 
  new THREE.ShaderMaterial({
    uniforms:{
      u_texture: {
        value: textures.building
      }
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource
  })
)
building.position.x = 4
building.position.y = 3
scene.add(building)

const cottage = new THREE.Group()

const wall = new THREE.Mesh(
  new THREE.CylinderGeometry(3, 3, 6, 8),
  new THREE.ShaderMaterial({
    uniforms:{
      u_texture: {
        value: textures.cottage.wall[0]
      }
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource
  })
)

const roof = new THREE.Mesh(
  new THREE.SphereGeometry(3.2, 8, 14, 0, 6.28, 2.4, 2.45),
  new THREE.ShaderMaterial({
    uniforms:{
      u_texture: {
        value: textures.cottage.roof
      }
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    side: THREE.DoubleSide
  }),
)
roof.rotation.z = Math.PI
roof.position.y = 2.6

const tip = new THREE.Mesh(
  new THREE.ConeGeometry(2, 1.5, 8, 1),
  new THREE.ShaderMaterial({
    uniforms:{
      u_texture: {
        value: textures.cottage.roof
      }
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    side: THREE.DoubleSide
  }),
)
tip.position.y = 5.8
cottage.add(wall, roof, tip)

cottage.position.set(-4, -2, -5)
scene.add(cottage);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40), 
  new THREE.MeshStandardMaterial({
    map: textures.ground
  })
)
ground.rotation.x = -90 * Math.PI/180
ground.position.y -= 5
scene.add(ground)

const environtment = new THREE.Mesh( 
  new THREE.SphereGeometry(20, 32, 16), 
  new THREE.ShaderMaterial({
    uniforms:{
      u_texture: {
        value: textures.sky
      }
    },
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    side: THREE.BackSide
  })
);
scene.add(environtment)

const ambient_light = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambient_light)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(8, 6, -8)
scene.add(light)


renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
light.castShadow = true

building.castShadow = true
wall.castShadow = true
ground.receiveShadow = true

const orbitprops = {
  lorbit: {
    radius: Math.sqrt((light.position.x - building.position.x) ** 2 + (light.position.z - building.position.z)** 2),
    angle: Math.atan2(light.position.z, light.position.x),
    speed: 0.004,
  },
  camorbit: {
    radius: camera.position.z,
    angle: Math.PI/2,
    speed: 0.004,
    target: new THREE.Vector3(0, camera.position.y, 0),
    shift: 0.04
  }
}

const input = {
  left: false,
  right: false,
  up: false,
  down: false
}


const cameramovement = () =>{
  let any = true
  if (input.left) orbitprops.camorbit.angle += orbitprops.camorbit.speed
  else if (input.right) orbitprops.camorbit.angle -= orbitprops.camorbit.speed
  else if (input.up) camera.position.y += orbitprops.camorbit.shift
  else if (input.down) camera.position.y -= orbitprops.camorbit.shift
  else any = false

  if(!any) return

  if(camera.position.y < -4) camera.position.y = -4
  else if (camera.position.y > 4) camera.position.y = 4;

  orbitprops.camorbit.target = new THREE.Vector3(0, camera.position.y, 0)

  camera.position.x = orbitprops.camorbit.radius * Math.cos(orbitprops.camorbit.angle)
  camera.position.z = orbitprops.camorbit.radius * Math.sin(orbitprops.camorbit.angle)
  camera.lookAt(orbitprops.camorbit.target)

  orbitprops.camorbit.target = new THREE.Vector3(0, camera.position.y, 0)

  camera.position.x = orbitprops.camorbit.radius * Math.cos(orbitprops.camorbit.angle)
  camera.position.z = orbitprops.camorbit.radius * Math.sin(orbitprops.camorbit.angle)
  camera.lookAt(orbitprops.camorbit.target)
}

function animate() {
	requestAnimationFrame(animate)
  orbitprops.lorbit.angle += orbitprops.lorbit.speed
  light.position.x = orbitprops.lorbit.radius * Math.cos(orbitprops.lorbit.angle)
  light.position.z = orbitprops.lorbit.radius * Math.sin(orbitprops.lorbit.angle)
  cameramovement()
  renderer.render(scene, camera)
}

animate()

window.addEventListener('click', () => {
  textures.index++
  if(textures.index == textures.cottage.wall.length) textures.index = 0;
  wall.material.uniforms.u_texture.value = textures.cottage.wall[textures.index]
})

window.addEventListener("keydown", (event) => {
  if (event.key == 'ArrowLeft') input.left = true
  if (event.key == 'ArrowRight') input.right = true
  if (event.key == 'ArrowUp') input.up = true
  if (event.key == 'ArrowDown') input.down = true
})

window.addEventListener("keyup", (event) => {
  if (event.key == 'ArrowLeft') input.left = false
  if (event.key == 'ArrowRight') input.right = false
  if (event.key == 'ArrowUp') input.up = false
  if (event.key == 'ArrowDown') input.down = false
})

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.render(scene, camera)
})