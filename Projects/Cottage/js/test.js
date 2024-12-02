import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  
  uniform sampler2D colorMap;
  uniform sampler2D normalMap;

  void main() {
    vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
    vec3 normal = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    vec3 color = texture2D(colorMap, vUv).xyz;

    float lighting = max(dot(normalize(lightDirection), normalize(normal)), 0.0);
    vec3 finalColor = color * lighting;

    gl_FragColor = vec4(finalColor, 1.0);
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

const textureLoader = new THREE.TextureLoader();

const colorMap = textureLoader.load('textures/bt1.jpeg');
const normalMap = textureLoader.load('textures/bt1_n.png');

const material = new THREE.ShaderMaterial({
  uniforms: {
    colorMap: { value: colorMap },
    normalMap: { value: normalMap },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

const building = new THREE.Mesh(
  new THREE.BoxGeometry(5, 10, 5), 
  material
)

const ambient_light = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambient_light)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(8, 10, -8)
scene.add(light)

// Assuming 'scene' is your Three.js scene
scene.add(building);
renderer.render(scene, camera)