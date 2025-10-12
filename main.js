// main.js - CÓDIGO COMPLETO CON HONGUITO, COLISIÓN, VALLA, LUZ DE EXHIBICIÓN Y UNA SOLA LÁMPARA CENTRADA

// --- IMPORTANTE: CONFIGURACIÓN DE LA SALA ---
const ANCHO_SALA = 60;   
const ALTO_SALA = 20;    
const PROFUNDIDAD_SALA = 80; 

// --- AJUSTES DE JUEGO Y MOVIMIENTO ---
const VELOCIDAD = 5.0; 
const ALTURA_HONGUITO = 0.2; // Altura sobre el piso
const RADIO_COLISION = 0.5; // El radio de la esfera del honguito
const DISTANCIA_CAMARA = 8; 
const ALTURA_CAMARA_SEGUIMIENTO = 4.5; 

// Control de Mouse
const VELOCIDAD_MOUSE = 0.002; 
let isLocked = false; 

// Variables de Cámaras
let cameraPivot = new THREE.Object3D(); 
let cameraVertical = new THREE.Object3D(); 

// --- VARIABLES GLOBALES PARA COLISIÓN Y MODELOS ---
let estatuaBoundingBox = null;
let vallaBoundingBox = null; 
let luzValla = null; 
const VALLA_Z = -35; // Posición Z fija para valla y lámparas


// --- ESCENA Y RENDERIZADOR ---
const escena = new THREE.Scene();
escena.background = new THREE.Color(0xaaaaaa);

const renderizador = new THREE.WebGLRenderer({
  canvas: document.querySelector("#miCanvas"),
  antialias: true
});
renderizador.setSize(window.innerWidth, window.innerHeight);
renderizador.setPixelRatio(window.devicePixelRatio);
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap; 


// --- CÁMARA (TERCERA PERSONA con PIVOT) ---
const camara = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camara.position.set(0, 0, DISTANCIA_CAMARA); 
camara.lookAt(0, 0, 0);

cameraVertical.position.y = ALTURA_CAMARA_SEGUIMIENTO; 
cameraVertical.add(camara);

cameraPivot.add(cameraVertical);
escena.add(cameraPivot);


// --- ILUMINACIÓN GLOBAL Y HONGUITO ---
const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.4);
escena.add(luzAmbiental);

const luzDireccional = new THREE.DirectionalLight(0xffffff, 1.5); 
luzDireccional.position.set(20, 30, 20); 
luzDireccional.castShadow = true; 
luzDireccional.shadow.camera.near = 0.1;
luzDireccional.shadow.camera.far = 100;
luzDireccional.shadow.mapSize.width = 1024;
luzDireccional.shadow.mapSize.height = 1024;
escena.add(luzDireccional);

const luzHonguito = new THREE.PointLight(0xffffff, 1, 2); 
escena.add(luzHonguito);


// --- CARGA DE TEXTURAS Y MATERIALES ---
const loader = new THREE.TextureLoader();
const texturaPiso = loader.load('assets/images/piso.jpg');
const texturaTecho = loader.load('assets/images/techo.jpg');
const texturaPared = loader.load('assets/images/pared.jpg');

const setRepeat = (texture, scaleX, scaleY) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(scaleX, scaleY);
};

setRepeat(texturaPiso, ANCHO_SALA / 2, PROFUNDIDAD_SALA / 2);
setRepeat(texturaTecho, ANCHO_SALA / 2, PROFUNDIDAD_SALA / 2);
setRepeat(texturaPared, ANCHO_SALA / 2, ALTO_SALA / 2);

const materialPiso = new THREE.MeshStandardMaterial({ map: texturaPiso });
const materialTecho = new THREE.MeshStandardMaterial({ map: texturaTecho });

const materialParedUnico = new THREE.MeshStandardMaterial({ 
    map: texturaPared,
    side: THREE.DoubleSide 
}); 


// --- CONSTRUCCIÓN DE LA SALA ---
const mitadAncho = ANCHO_SALA / 2;
const mitadProfundidad = PROFUNDIDAD_SALA / 2;
const mitadAlto = ALTO_SALA / 2;

const geometriaPisoTecho = new THREE.PlaneGeometry(ANCHO_SALA, PROFUNDIDAD_SALA);
const geometriaParedFondo = new THREE.PlaneGeometry(ANCHO_SALA, ALTO_SALA); 
const geometriaParedLateral = new THREE.PlaneGeometry(PROFUNDIDAD_SALA, ALTO_SALA); 

// Piso
const piso = new THREE.Mesh(geometriaPisoTecho, materialPiso);
piso.rotation.x = -Math.PI / 2;
piso.position.y = 0;
piso.receiveShadow = true; 
escena.add(piso);

// Techo
const techo = new THREE.Mesh(geometriaPisoTecho, materialTecho);
techo.rotation.x = Math.PI / 2;
techo.position.y = ALTO_SALA;
escena.add(techo);

// Paredes (código abreviado para concisión, mantén la versión completa)
const pared1 = new THREE.Mesh(geometriaParedFondo, materialParedUnico);
pared1.position.set(0, mitadAlto, -mitadProfundidad); pared1.receiveShadow = true; escena.add(pared1);
const pared2 = new THREE.Mesh(geometriaParedFondo, materialParedUnico);
pared2.rotation.y = Math.PI; pared2.position.set(0, mitadAlto, mitadProfundidad); pared2.receiveShadow = true; escena.add(pared2);
const pared3 = new THREE.Mesh(geometriaParedLateral, materialParedUnico);
pared3.rotation.y = -Math.PI / 2; pared3.position.set(-mitadAncho, mitadAlto, 0); pared3.receiveShadow = true; escena.add(pared3);
const pared4 = new THREE.Mesh(geometriaParedLateral, materialParedUnico);
pared4.rotation.y = Math.PI / 2; pared4.position.set(mitadAncho, mitadAlto, 0); pared4.receiveShadow = true; escena.add(pared4);


// --- LÓGICA DE MOVIMIENTO Y TECLADO ---
let modeloGLTF = null;
let mixer = null;
let walkAction = null; 
let currentAnimation = null; 

const clock = new THREE.Clock(); 
const keys = {
    ArrowUp: false, 'w': false,
    ArrowDown: false, 's': false,
    ArrowLeft: false, 'a': false,
    ArrowRight: false, 'd': false
};

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = true;
});
window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = false;
});


// --- LÓGICA DE MOUSE Y VISTA ---
document.body.addEventListener('click', () => {
    if (!isLocked) renderizador.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isLocked = document.pointerLockElement === renderizador.domElement;
});

document.addEventListener('mousemove', (event) => {
    if (isLocked) {
        cameraPivot.rotation.y -= event.movementX * VELOCIDAD_MOUSE;

        let deltaY = event.movementY * VELOCIDAD_MOUSE;
        cameraVertical.rotation.x -= deltaY;

        const limit = Math.PI / 2 - 0.1; 
        cameraVertical.rotation.x = Math.max(-limit, Math.min(limit, cameraVertical.rotation.x));
    }
});


// --- CARGA DEL MODELO 3D (Honguito) ---
const gltfLoader = new THREE.GLTFLoader();

gltfLoader.load(
  'assets/models/mushroom_girl/scene.gltf', 
  function (gltf) {
      
    modeloGLTF = gltf.scene;

    modeloGLTF.position.set(0, ALTURA_HONGUITO, 20); 
    modeloGLTF.scale.set(1.2, 1.2, 1.2); 
    escena.add(modeloGLTF);
    
    cameraPivot.position.set(modeloGLTF.position.x, 0, modeloGLTF.position.z);
    
    modeloGLTF.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (Array.isArray(child.material)) {
                child.material.forEach(m => m.needsUpdate = true);
            } else {
                child.material.needsUpdate = true;
            }
        }
    });

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      const walkClip = THREE.AnimationClip.findByName(gltf.animations, 'Walk') || gltf.animations[0];
      if (walkClip) {
          walkAction = mixer.clipAction(walkClip); 
          walkAction.setLoop(THREE.LoopRepeat, Infinity); 
      }
    }
  },
  undefined,
  function (error) {
    console.error('Error al cargar el modelo del Honguito:', error);
  }
);


// --- CARGA DEL MODELO 3D (Estatua de la Libertad) ---
gltfLoader.load(
  'assets/models/estatua_de_la_libertad.glb', 
  function (gltf) {
      const estatua = gltf.scene;
      
      estatua.position.set(0, 0, 0); 
      estatua.scale.set(5, 5, 5); 

      // Configurar sombras y calcular Bounding Box
      estatua.traverse((child) => {
          if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
          }
      });
      
      escena.add(estatua);

      // --- CÁLCULO DE LA CAJA DELIMITADORA ---
      const box = new THREE.Box3().setFromObject(estatua);
      estatuaBoundingBox = box;
      // ----------------------------------------
      
      console.log('Estatua de la Libertad cargada con éxito en el centro de la sala.');

  },
  undefined,
  function (error) {
    console.error('Error al cargar la Estatua de la Libertad:', error);
  }
);


// --- CARGA DEL MODELO 3D (Valla de Exhibición) ---
gltfLoader.load(
    'assets/models/valla/scene.gltf', // RUTA ASUMIDA: carpeta/scene.gltf
    function (gltf) {
        const valla = gltf.scene;
        
        // POSICIONAMIENTO
        valla.position.set(0, 0, VALLA_Z); 
        valla.scale.set(3.0, 3.0, 3.0); 

        // Configurar sombras y calcular Bounding Box
        valla.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        escena.add(valla);
        
        // --- CÁLCULO DE LA CAJA DELIMITADORA DE LA VALLA ---
        const box = new THREE.Box3().setFromObject(valla);
        vallaBoundingBox = box;
        
        // --- AGREGAR LUZ AL CARTEL DE LA VALLA ---
        luzValla = new THREE.PointLight(0xffffff, 5, 7); 
        luzValla.position.set(1.5, valla.scale.y * 1.5, valla.position.z + 2); 
        escena.add(luzValla);
        
        console.log('Valla de exhibición cargada con éxito frente a la pared trasera.');
    },
    undefined,
    function (error) {
        console.error('Error al cargar la Valla de Exhibición:', error);
    }
);


// --- CARGA DEL MODELO 3D (Lámpara Única Centrada) ---
const LAMPARA_Y_OFFSET = 5.0; // Distancia para que cuelgue del techo (1 metro debajo)
const LAMPARA_Y_POS = ALTO_SALA - LAMPARA_Y_OFFSET; // Posición Y final
const LAMPARA_SCALE = 5.0; // ESCALA CORREGIDA: Ajustar si no se ve (probar 2.0 o 3.0)

gltfLoader.load(
    'assets/models/lamparas.glb', 
    function (gltf) {
        
        const lampara = gltf.scene;
        // Posición X=0, centrado sobre la valla
        lampara.position.set(0, LAMPARA_Y_POS, VALLA_Z); 
        lampara.scale.set(LAMPARA_SCALE, LAMPARA_SCALE, LAMPARA_SCALE); 
        
        lampara.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        escena.add(lampara);
        
        // LUZ DE LA LÁMPARA (SpotLight centrado)
        const spotLight = new THREE.SpotLight(0xffffff, 0.5, 18, 30,  Math.PI / 16, 0.1, 2 );
        spotLight.position.set(0, LAMPARA_Y_POS, VALLA_Z); 
        spotLight.target.position.set(0, LAMPARA_Y_POS - 1, VALLA_Z); // Apunta al suelo justo debajo de la lámpara (donde está la valla)
        spotLight.castShadow = true;
        escena.add(spotLight);
        escena.add(spotLight.target);


        console.log('Lámpara de techo única cargada y centrada sobre la valla.');

    },
    undefined,
    function (error) {
        console.error('Error al cargar la Lámpara:', error);
    }
);

// --- FUNCIÓN DE ANIMACIÓN (LOOP PRINCIPAL DEL JUEGO) ---
function animar() {
  requestAnimationFrame(animar);
  
  const delta = clock.getDelta();

  if (modeloGLTF) {
      
      const step = VELOCIDAD * delta; 
      let isMoving = false; 

      // Guardamos la posición anterior para colisiones
      const oldPositionX = modeloGLTF.position.x;
      const oldPositionZ = modeloGLTF.position.z;

      // 1. Determinar la dirección de movimiento a partir de la cámara
      const cameraDirection = new THREE.Vector3();
      cameraPivot.getWorldDirection(cameraDirection); 
      cameraDirection.y = 0; 
      cameraDirection.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection); 

      // 2. Aplicar el movimiento al modelo GLTF
      let forwardVector = new THREE.Vector3();
      let strafeVector = new THREE.Vector3();

      if (keys.ArrowUp || keys.w) {
          forwardVector.copy(cameraDirection).multiplyScalar(step);
          isMoving = true;
      }
      if (keys.ArrowDown || keys.s) {
          forwardVector.copy(cameraDirection).multiplyScalar(-step); 
          isMoving = true;
      }
      if (keys.ArrowLeft || keys.a) {
          strafeVector.copy(right).multiplyScalar(-step);
          isMoving = true;
      }
      if (keys.ArrowRight || keys.d) {
          strafeVector.copy(right).multiplyScalar(step);
          isMoving = true;
      }
      
      // Aplicar el movimiento a una posición temporal (para usar en colisión)
      const nextPositionX = oldPositionX + forwardVector.x + strafeVector.x;
      const nextPositionZ = oldPositionZ + forwardVector.z + strafeVector.z;
      
      // Aplicar la posición
      modeloGLTF.position.x = nextPositionX;
      modeloGLTF.position.z = nextPositionZ;
      
      // --- LÓGICA DE COLISIÓN (Estatua y Valla) ---
      let collisionDetected = false;
      const honguitoBox = new THREE.Box3();
      honguitoBox.setFromCenterAndSize(
        new THREE.Vector3(modeloGLTF.position.x, ALTURA_HONGUITO, modeloGLTF.position.z),
        new THREE.Vector3(RADIO_COLISION * 2, ALTURA_HONGUITO * 2, RADIO_COLISION * 2)
      );

      // Colisión con la Estatua
      if (estatuaBoundingBox && estatuaBoundingBox.intersectsBox(honguitoBox)) {
          collisionDetected = true;
      }
      
      // Colisión con la Valla 
      if (vallaBoundingBox && vallaBoundingBox.intersectsBox(honguitoBox)) {
          collisionDetected = true;
      }
      
      if (collisionDetected) {
          // Revertir la posición si hay colisión
          modeloGLTF.position.x = oldPositionX;
          modeloGLTF.position.z = oldPositionZ;
          isMoving = false; // Detener animación si choca
      }
      // ----------------------------------------------------


      // 3. Rotar el modelo (Honguito) para que mire hacia donde se mueve
      if (isMoving) {
          const movementVector = new THREE.Vector3(
              modeloGLTF.position.x - oldPositionX,
              0,
              modeloGLTF.position.z - oldPositionZ
          ).normalize();
          
          const targetAngle = Math.atan2(movementVector.x, movementVector.z);
          
          modeloGLTF.rotation.y = THREE.MathUtils.lerp(modeloGLTF.rotation.y, targetAngle, 0.2); 
      }


      // --- COLISIÓN DE PAREDES (Aplicada al modelo) ---
      const maxDistX = mitadAncho - RADIO_COLISION; 
      const maxDistZ = mitadProfundidad - RADIO_COLISION; 

      let newPositionX = modeloGLTF.position.x;
      let newPositionZ = modeloGLTF.position.z;

      // Colisión X
      if (newPositionX > maxDistX || newPositionX < -maxDistX) {
          modeloGLTF.position.x = oldPositionX; 
      }
      // Colisión Z
      if (newPositionZ > maxDistZ || newPositionZ < -maxDistZ) {
          modeloGLTF.position.z = oldPositionZ; 
      }

      // 4. Sincronizar Cámara/Pivote con el Modelo
      cameraPivot.position.x = modeloGLTF.position.x;
      cameraPivot.position.z = modeloGLTF.position.z; 
      
      // 5. Control de Animaciones
      if (mixer && walkAction) {
          if (isMoving && currentAnimation !== walkAction) {
              if (currentAnimation) currentAnimation.fadeOut(0.2).stop(); 
              walkAction.reset().fadeIn(0.2).play(); 
              currentAnimation = walkAction;
          } else if (!isMoving && currentAnimation === walkAction) {
              walkAction.fadeOut(0.2).stop(); 
              currentAnimation = null;
          }
      }

      // 6. Iluminación Local
      luzHonguito.position.copy(modeloGLTF.position);
      luzHonguito.position.y += 2.5; 
  }


  if (mixer) {
    mixer.update(delta);
  }

  renderizador.render(escena, camara);
}
animar();