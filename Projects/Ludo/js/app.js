import * as THREE from 'three';

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

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 5;

const textures = {
  board: [
    new THREE.TextureLoader().load('textures/t1.jpg'),
    new THREE.TextureLoader().load('textures/t2.jpg'),
    new THREE.TextureLoader().load('textures/t3.jpg'),
    new THREE.TextureLoader().load('textures/t4.jpg')
  ],
  die: {
    right: new THREE.TextureLoader().load('textures/d1.png'),
    left: new THREE.TextureLoader().load('textures/d2.png'),
    top: new THREE.TextureLoader().load('textures/d3.png'),
    bottom: new THREE.TextureLoader().load('textures/d4.png'),
    front: new THREE.TextureLoader().load('textures/d5.png'),
    back: new THREE.TextureLoader().load('textures/d6.png') 
  },
  side_color : '#5C4033',
  index: 0
};

let board = new THREE.Mesh(
  new THREE.BoxGeometry(3, .1, 3),
  [
    new THREE.MeshBasicMaterial({ color: textures.side_color }), // Right face
    new THREE.MeshBasicMaterial({ color: textures.side_color }), // Left face
    new THREE.ShaderMaterial({                                   // Top face
      uniforms:{
        u_wallTexture: {
          value: textures.board[0]
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource
    }),
    new THREE.MeshBasicMaterial({ color: textures.side_color }), // Bottom face
    new THREE.MeshBasicMaterial({ color: textures.side_color }), // Front face
    new THREE.MeshBasicMaterial({ color: textures.side_color })  // Back face
  ]
);

board.position.y = -1.5;
board.rotation.x = .3;
scene.add(board);

const die = new THREE.Mesh(
  new THREE.BoxGeometry(.2, .2, .2),
  [
    new THREE.ShaderMaterial({                                
      uniforms:{
        u_wallTexture: {
          value: textures.die.right
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource
    }), 
    new THREE.ShaderMaterial({                                
      uniforms:{
        u_wallTexture: {
          value: textures.die.left
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource
    }), 
    new THREE.ShaderMaterial({                                
      uniforms:{
        u_wallTexture: {
          value: textures.die.top
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource
    }), 
    new THREE.ShaderMaterial({                                
      uniforms:{
        u_wallTexture: {
          value: textures.die.down
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource
    }), 
    new THREE.ShaderMaterial({                                
      uniforms:{
        u_wallTexture: {
          value: textures.die.front
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource
    }), 
    new THREE.ShaderMaterial({                                
      uniforms:{
        u_wallTexture: {
          value: textures.die.back
        }
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource
    }), 
  ]
);

die.position.y = -1.35;
die.rotation.x = .3;
scene.add(die);

const empty = new THREE.Object3D();

const camorbit = {
  radius: camera.position.z,
  angle: 0,
  speed: 0.08,
  target: empty.position
}

const ambient_light = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient_light);   

const light = new THREE.PointLight(0xffffff, 60, 50);
light.position.set(-2, 2, -2);
scene.add(light);

const roomGeometry = new THREE.BoxGeometry(10, 10, 10);
const wallTexture = new THREE.TextureLoader().load('textures/wall-texture.jpg');
const floorTexture = new THREE.TextureLoader().load('textures/floor-texture.avif');

const roomMaterials = [
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), 
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }), 
    new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), 
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide })
];
const room = new THREE.Mesh(roomGeometry, roomMaterials);
room.position.set(0, 1, 0);
scene.add(room);



function animate() {
	requestAnimationFrame(animate);
  die.rotateY(0.02);
	renderer.render(scene, camera);
}

animate();

window.addEventListener('click', function(event) {
  textures.index++;
  if(textures.index == textures.board.length) textures.index = 0;
  board.material[2].uniforms.u_wallTexture.value = textures.board[textures.index];
  board.material[2].needsUpdate = true;
});


window.addEventListener("keydown", (event) => {
  if (event.key == 'ArrowLeft') camorbit.angle += camorbit.speed;
  if (event.key == 'ArrowRight') camorbit.angle -= camorbit.speed;

  const x = camorbit.radius * Math.sin(camorbit.angle);
  const z = camorbit.radius * Math.cos(camorbit.angle);
  const y = camera.position.y;

  camera.position.set(x, y, z);
  camera.lookAt(camorbit.target);
  renderer.render(scene, camera);
});