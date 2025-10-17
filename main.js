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
const VALLA_Z = -35; // Posición Z fija para valla y lámparas

// --- EXHIBICIÓN CUADRO 1: EL GRITO ---
let cuadroGrito = null; 
let luzValla = null; 

// --- EXHIBICIÓN CUADRO 2: INSANITY IN MOTION ---
let cuadroInsanity = null;
let vallaInsanityBoundingBox = null; 
let mixerInsanity = null;
let actionInsanity = null;

// --- EXHIBICIÓN CUADRO 3: TECHNICAL DIFFICULTIES ---
let cuadroMandala = null;
let vallaMandalaBoundingBox = null;
let mixerTechnical = null; 
let actionTechnical = null; 

// --- EXHIBICIÓN CUADRO 4: GARDEN (NUEVAS VARIABLES) ---
let cuadroGarden = null;
let vallaGardenBoundingBox = null;
let mixerGarden = null; // Nuevo mixer para Garden
let actionGarden = null; // Nueva acción para Garden


// --- VARIABLES GLOBALES DE AUDIO ---
let listener;
let audioLoader;
let audioAmbiente = null; 
let audioGrito;
const DISTANCIA_GRITO = 20; // Aumentada a 20 unidades
let gritoReproducido = false; // Controla si el grito ya sonó en esta aproximación


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

// --- INICIALIZACIÓN DE AUDIO ---
listener = new THREE.AudioListener();
camara.add(listener); // Adjuntamos el "oído" a la cámara

audioLoader = new THREE.AudioLoader();

// --- CARGA DE SONIDO AMBIENTAL ---
audioLoader.load('assets/sounds/museum_ambient.mp3', function(buffer) {
    audioAmbiente = new THREE.Audio(listener);
    audioAmbiente.setBuffer(buffer);
    audioAmbiente.setLoop(true); 
    audioAmbiente.setVolume(0.5); 
    console.log('Sonido ambiental del museo cargado. Esperando interacción para reproducir.');
}, undefined, function(error) {
    console.warn('Error al cargar el sonido ambiental. Asegúrate de tener "assets/sounds/museum_ambient.mp3".');
});


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


// --- LÓGICA DE MOUSE Y VISTA (ACTIVACIÓN DE AUDIO) ---
document.body.addEventListener('click', () => {
    if (!isLocked) {
        // Al hacer clic para bloquear el puntero, intentamos reproducir el audio
        if (audioAmbiente && audioAmbiente.buffer && !audioAmbiente.isPlaying) {
            audioAmbiente.context.resume().then(() => {
                 audioAmbiente.play();
                 console.log('Audio Ambiental Iniciado tras clic del usuario.');
            }).catch(e => {
                console.error("Error al reanudar el contexto de audio y reproducir:", e);
            });
        }
        renderizador.domElement.requestPointerLock();
    }
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


// --- CARGA DEL MODELO 3D (Valla de Exhibición - Central) ---
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
        


    },
    undefined,
    function (error) {
        console.error('Error al cargar la Lámpara:', error);
    }
);

// --- CARGA DEL MODELO 3D (Cuadro 1: El Grito) ---
const CUADRO_GRITO_Z = -mitadProfundidad + 0.1; // -39.9 (Justo en frente de la pared del fondo)
const CUADRO_GRITO_Y = mitadAlto; // Altura centrada (10)
const CUADRO_GRITO_X = 1; // Nueva posición X: 2 unidades a la derecha del centro (0)
const CUADRO_GRITO_SCALE = 11; // ESCALA BASE PARA TODOS LOS CUADROS

gltfLoader.load(
    'assets/models/the_scream.glb', // RUTA DEL MODELO
    function (gltf) {
        cuadroGrito = gltf.scene;
        
    
        cuadroGrito.position.set(CUADRO_GRITO_X, CUADRO_GRITO_Y, CUADRO_GRITO_Z); 
        cuadroGrito.scale.set(CUADRO_GRITO_SCALE, CUADRO_GRITO_SCALE, CUADRO_GRITO_SCALE); 
        
        // Configurar sombras y asignar un nombre para Raycasting (futura funcionalidad)
        cuadroGrito.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.name = 'Cuadro_El_Grito'; // Nombre único para la detección de clics
            }
        });
        
        escena.add(cuadroGrito);

        // --- LUZ DEDICADA PARA EL CUADRO 1 (SpotLight) --
        const luzCuadroGrito = new THREE.SpotLight(0xffffff, 30, 10, Math.PI / 7, 0.5, 0.5); 
        
        luzCuadroGrito.position.set(CUADRO_GRITO_X, CUADRO_GRITO_Y + 5, CUADRO_GRITO_Z + 5); 
        luzCuadroGrito.castShadow = false; 
        
        const targetCuadro = new THREE.Object3D();
        targetCuadro.position.set(CUADRO_GRITO_X, CUADRO_GRITO_Y, CUADRO_GRITO_Z);
        escena.add(targetCuadro);
        luzCuadroGrito.target = targetCuadro;

        escena.add(luzCuadroGrito);

        // --- SONIDO POSICIONAL DEL GRITO ---
        audioGrito = new THREE.PositionalAudio(listener);
        audioLoader.load('assets/sounds/terrifying_scream.mp3', function(buffer) {
            audioGrito.setBuffer(buffer);
            audioGrito.setRefDistance(8); 
            audioGrito.setMaxDistance(20); 
            audioGrito.setRolloffFactor(1); 
            audioGrito.setLoop(false); 
            console.log('Buffer de audio del Grito cargado exitosamente.'); 
        }, undefined, function(error) {
            console.warn('Error CRÍTICO al cargar el sonido del grito. Revisa la ruta: "assets/sounds/terrifying_scream.mp3".');
        });
        cuadroGrito.add(audioGrito); 
        
        console.log('Cuadro "El Grito" cargado, escalado y posicionado. Luz puntual agregada.');

    },
    undefined,
    function (error) {
        console.error('Error al cargar el cuadro "El Grito":', error);
    }
);


// --- CARGA DEL MODELO 3D (Cuadro 2: Insanity in Motion - PARED IZQUIERDA) ---
const CUADRO_INSANITY_X = -mitadAncho + 0.1; // -29.9 (Justo en frente de la pared izquierda)
const CUADRO_INSANITY_Y = mitadAlto; // Altura centrada (10)
const CUADRO_INSANITY_Z = 0; // Centrado en Z
const CUADRO_INSANITY_ROTATION = Math.PI / 2; // Rota 90 grados para mirar hacia el centro de la sala

gltfLoader.load(
    'assets/models/psychedelic_spheres/scene.gltf', 
    function (gltf) {
        cuadroInsanity = gltf.scene;
        
        // POSICIONAMIENTO
        cuadroInsanity.position.set(CUADRO_INSANITY_X, CUADRO_INSANITY_Y, CUADRO_INSANITY_Z - 5); 
        cuadroInsanity.rotation.y = CUADRO_INSANITY_ROTATION; 
        cuadroInsanity.scale.set(1.5, 1.5, 1.5); 
        
        // Configurar sombras y asignar un nombre para Raycasting
        cuadroInsanity.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.name = 'Cuadro_Insanity'; 
            }
        });
        
        escena.add(cuadroInsanity);
        
        // --- ANIMACIÓN (CONFIGURADA PARA PROXIMIDAD) ---
        if (gltf.animations && gltf.animations.length > 0) {
            mixerInsanity = new THREE.AnimationMixer(gltf.scene);
            const clip = gltf.animations[0]; // Tomamos la primera animación disponible
            actionInsanity = mixerInsanity.clipAction(clip);
            actionInsanity.setLoop(THREE.LoopRepeat, Infinity);
            console.log('Animación "Insanity in Motion" configurada. Esperando proximidad.');
        }

        // --- LUZ DEDICADA PARA EL CUADRO 2 (SpotLight) --
        const luzCuadroInsanity = new THREE.SpotLight(0xffffff, 10, 5, Math.PI / 10, 1, 1); 
        
        // Posición de la luz: Desplazada en X y Y respecto al cuadro
        luzCuadroInsanity.position.set(CUADRO_INSANITY_X + 5, CUADRO_INSANITY_Y + 5, CUADRO_INSANITY_Z); 
        luzCuadroInsanity.castShadow = false; 
        
        const targetInsanity = new THREE.Object3D();
        targetInsanity.position.set(CUADRO_INSANITY_X, CUADRO_INSANITY_Y, CUADRO_INSANITY_Z);
        escena.add(targetInsanity);
        luzCuadroInsanity.target = targetInsanity;

        escena.add(luzCuadroInsanity);
        
        console.log('Cuadro "Insanity in Motion" cargado, posicionado en la pared izquierda.');

    },
    undefined,
    function (error) {
        console.error('Error al cargar el cuadro "Insanity in Motion":', error);
    }
);


// --- CARGA DEL MODELO 3D (Valla de Exhibición - Izquierda) ---
const VALLA_INSANITY_X = CUADRO_INSANITY_X + 5; // 5 unidades frente al cuadro
const VALLA_INSANITY_Z = CUADRO_INSANITY_Z; 
const VALLA_INSANITY_ROTATION = CUADRO_INSANITY_ROTATION; // Misma rotación que el cuadro

gltfLoader.load(
    'assets/models/valla/scene.gltf', 
    function (gltf) {
        const vallaInsanity = gltf.scene;
        
        // POSICIONAMIENTO y ROTACIÓN (90 grados)
        vallaInsanity.position.set(VALLA_INSANITY_X, 0, VALLA_INSANITY_Z); 
        vallaInsanity.rotation.y = VALLA_INSANITY_ROTATION; 
        vallaInsanity.scale.set(3.0, 3.0, 3.0); 

        vallaInsanity.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        escena.add(vallaInsanity);
        
        // --- CÁLCULO DE LA CAJA DELIMITADORA DE LA NUEVA VALLA ---
        const box = new THREE.Box3().setFromObject(vallaInsanity);
        vallaInsanityBoundingBox = box;
        
        console.log('Valla de exhibición cargada con éxito frente al cuadro izquierdo.');
    },
    undefined,
    function (error) {
        console.error('Error al cargar la Valla de Exhibición Izquierda:', error);
    }
);


// --- CARGA DEL MODELO 3D (Cuadro 3: Televisores - PARED DERECHA) ---
const CUADRO_MANDALA_SCALE = 0.5; // ESCALA SOLICITADA: 1 (antes 10)
const CUADRO_MANDALA_X = mitadAncho - 2.4; // CLAVE: 29.0 (Para sacarlo de la pared)
const CUADRO_MANDALA_Y = 0; 
const CUADRO_MANDALA_Z = 0; // CLAVE: Z=0 (Centrado y sin offset)
const CUADRO_MANDALA_ROTATION = -Math.PI / 1; // Rota -90 grados para mirar hacia el centro

gltfLoader.load(
    'assets/models/technical_difficulties/scene.gltf', 
    function (gltf) {
        cuadroMandala = gltf.scene;
        
        // POSICIONAMIENTO CORREGIDO: Usando las nuevas constantes
        cuadroMandala.position.set(CUADRO_MANDALA_X, CUADRO_MANDALA_Y, CUADRO_MANDALA_Z); 
        cuadroMandala.rotation.y = CUADRO_MANDALA_ROTATION; 
        cuadroMandala.scale.set(CUADRO_MANDALA_SCALE, CUADRO_MANDALA_SCALE, CUADRO_MANDALA_SCALE); // CLAVE: Escala a 1
        
        // Configurar sombras y asignar un nombre
        cuadroMandala.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.name = 'Cuadro_Mandala'; 
            }
        });
        
        escena.add(cuadroMandala);
        
        // --- LUZ DEDICADA PARA EL CUADRO 3 (SpotLight) --
        const luzCuadroMandala = new THREE.SpotLight(0xffffff, 30, 10, Math.PI / 7, 0.5, 0.5); 
        
        // Posición de la luz ajustada a Z=0
        luzCuadroMandala.position.set(CUADRO_MANDALA_X - 5, CUADRO_MANDALA_Y + 5, CUADRO_MANDALA_Z); 
        luzCuadroMandala.castShadow = false; 
        
        const targetMandala = new THREE.Object3D();
        targetMandala.position.set(CUADRO_MANDALA_X, CUADRO_MANDALA_Y, CUADRO_MANDALA_Z);
        escena.add(targetMandala);
        luzCuadroMandala.target = targetMandala;

        escena.add(luzCuadroMandala);
        
        console.log('Cuadro "Mandala" cargado, posicionado en la pared derecha con escala 1.');

    },
    undefined,
    function (error) {
        console.error('Error al cargar el cuadro "Mandala":', error);
    }
);


// --- CARGA DEL MODELO 3D (Valla de Exhibición - Derecha) ---
const VALLA_MANDALA_X = CUADRO_MANDALA_X - 9; // 5 unidades frente al cuadro (X=24.0)
const VALLA_MANDALA_Z = CUADRO_MANDALA_Z; // Z=0
const VALLA_MANDALA_ROTATION =  -Math.PI / 2; // Misma rotación que el cuadro

gltfLoader.load(
    'assets/models/valla/scene.gltf', 
    function (gltf) {
        const vallaMandala = gltf.scene;
        
        // POSICIONAMIENTO y ROTACIÓN (-90 grados)
        vallaMandala.position.set(VALLA_MANDALA_X, 0, VALLA_MANDALA_Z); 
        vallaMandala.rotation.y = VALLA_MANDALA_ROTATION; 
        vallaMandala.scale.set(3.0, 3.0, 3.0); 

        vallaMandala.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        escena.add(vallaMandala);
        
        // --- CÁLCULO DE LA CAJA DELIMITADORA DE LA NUEVA VALLA ---
        const box = new THREE.Box3().setFromObject(vallaMandala);
        vallaMandalaBoundingBox = box;
        
        console.log('Valla de exhibición cargada con éxito frente al cuadro derecho.');
    },
    undefined,
    function (error) {
        console.error('Error al cargar la Valla de Exhibición Derecha:', error);
    }
);


// --- CARGA DEL MODELO 3D (Cuadro 4: Garden - PARED FRONTAL) (NUEVO BLOQUE) ---
const CUADRO_GARDEN_Z = mitadProfundidad - 0.1; // 39.9 (Justo en frente de la pared frontal)
const CUADRO_GARDEN_Y = mitadAlto; 
const CUADRO_GARDEN_X = 0; // Centrado en X
const CUADRO_GARDEN_SCALE = 10; 
const CUADRO_GARDEN_ROTATION = Math.PI; // Rota 180 grados para mirar hacia el centro de la sala

gltfLoader.load(
    'assets/models/cuadro_garden/scene.gltf', 
    function (gltf) {
        cuadroGarden = gltf.scene;
        
        // POSICIONAMIENTO
        cuadroGarden.position.set(CUADRO_GARDEN_X, CUADRO_GARDEN_Y, CUADRO_GARDEN_Z); 
        cuadroGarden.rotation.y = CUADRO_GARDEN_ROTATION; 
        cuadroGarden.scale.set(CUADRO_GARDEN_SCALE, CUADRO_GARDEN_SCALE, CUADRO_GARDEN_SCALE); 
        
        // Configurar sombras y asignar un nombre para Raycasting
        cuadroGarden.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.name = 'Cuadro_Garden'; 
            }
        });
        
        escena.add(cuadroGarden);
        
        // --- ANIMACIÓN (CONFIGURADA PARA PROXIMIDAD) ---
        if (gltf.animations && gltf.animations.length > 0) {
            mixerGarden = new THREE.AnimationMixer(gltf.scene);
            const clip = gltf.animations[0];
            actionGarden = mixerGarden.clipAction(clip);
            actionGarden.setLoop(THREE.LoopRepeat, Infinity);
            console.log('Animación "Cuadro Garden" configurada. Esperando proximidad.');
        }

        // --- LUZ DEDICADA PARA EL CUADRO 4 (SpotLight) --
        const luzCuadroGarden = new THREE.SpotLight(0xffffff, 30, 10, Math.PI / 7, 0.5, 0.5); 
        
        // La luz viene de Z-5, apuntando hacia el cuadro
        luzCuadroGarden.position.set(CUADRO_GARDEN_X, CUADRO_GARDEN_Y + 5, CUADRO_GARDEN_Z - 5); 
        luzCuadroGarden.castShadow = false; 
        
        const targetGarden = new THREE.Object3D();
        targetGarden.position.set(CUADRO_GARDEN_X, CUADRO_GARDEN_Y, CUADRO_GARDEN_Z);
        escena.add(targetGarden);
        luzCuadroGarden.target = targetGarden;

        escena.add(luzCuadroGarden);
        
        console.log('Cuadro "Garden" cargado en pared frontal.');

    },
    undefined,
    function (error) {
        console.error('Error al cargar el cuadro "Garden":', error);
    }
);


// --- CARGA DEL MODELO 3D (Valla de Exhibición - Garden) (NUEVO BLOQUE) ---
const VALLA_GARDEN_X = CUADRO_GARDEN_X - 2; 
const VALLA_GARDEN_Z = CUADRO_GARDEN_Z - 10; // 5 unidades frente al cuadro
const VALLA_GARDEN_ROTATION = 0; // Rotación de la valla que mira al centro

gltfLoader.load(
    'assets/models/valla/scene.gltf', 
    function (gltf) {
        const vallaGarden = gltf.scene;
        
        // POSICIONAMIENTO y ROTACIÓN (0 grados)
        vallaGarden.position.set(VALLA_GARDEN_X, 0, VALLA_GARDEN_Z); 
        vallaGarden.rotation.y = VALLA_GARDEN_ROTATION; 
        vallaGarden.scale.set(3.0, 3.0, 3.0); 

        vallaGarden.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        escena.add(vallaGarden);
        
        // --- CÁLCULO DE LA CAJA DELIMITADORA DE LA NUEVA VALLA ---
        const box = new THREE.Box3().setFromObject(vallaGarden);
        vallaGardenBoundingBox = box;
        
        console.log('Valla de exhibición cargada con éxito frente al cuadro Garden.');
    },
    undefined,
    function (error) {
        console.error('Error al cargar la Valla de Exhibición Garden:', error);
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
      
      // --- LÓGICA DE COLISIÓN (TODAS LAS VALLAS Y OBJETOS) ---
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
      
      // Colisión con la Valla Central 
      if (vallaBoundingBox && vallaBoundingBox.intersectsBox(honguitoBox)) {
          collisionDetected = true;
      }
      
      // Colisión con la Valla Izquierda 
      if (vallaInsanityBoundingBox && vallaInsanityBoundingBox.intersectsBox(honguitoBox)) {
          collisionDetected = true;
      }
      
      // Colisión con la Valla Derecha 
      if (vallaMandalaBoundingBox && vallaMandalaBoundingBox.intersectsBox(honguitoBox)) {
          collisionDetected = true;
      }

      // Colisión con la Valla Garden (NUEVA)
      if (vallaGardenBoundingBox && vallaGardenBoundingBox.intersectsBox(honguitoBox)) {
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
      
      // 5. Control de Animaciones del HONGUITO
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
      
      // 5b. Lógica de Proximidad de ANIMACIÓN (Cuadro Insanity)
      if (cuadroInsanity && actionInsanity) {
          const playerPosXZ = modeloGLTF.position.clone();
          const cuadroInsanityPosXZ = cuadroInsanity.position.clone();
          
          playerPosXZ.y = 0;
          cuadroInsanityPosXZ.y = 0; // Calculamos la distancia horizontal
          
          const distanciaAInsanity = playerPosXZ.distanceTo(cuadroInsanityPosXZ);
          
          const zonaActivacionInsanity = 10.0; // Distancia para empezar a animar
          const zonaReseteoInsanity = 13.0;  // Distancia para detener la animación

          if (distanciaAInsanity < zonaActivacionInsanity) { 
              if (!actionInsanity.isRunning()) {
                  actionInsanity.play();
                  console.log('Animación Cuadro Insanity INICIADA por proximidad.');
              }
          } else if (distanciaAInsanity > zonaReseteoInsanity) {
              if (actionInsanity.isRunning()) {
                  actionInsanity.stop();
                  console.log('Animación Cuadro Insanity DETENIDA por alejamiento.');
              }
          }
      }

      // 5c. Lógica de Proximidad de ANIMACIÓN (Cuadro Technical Difficulties)
      if (cuadroMandala && actionTechnical) {
          const playerPosXZ = modeloGLTF.position.clone();
          const cuadroTechnicalPosXZ = cuadroMandala.position.clone(); 
          
          playerPosXZ.y = 0;
          cuadroTechnicalPosXZ.y = 0; 
          
          const distanciaATechnical = playerPosXZ.distanceTo(cuadroTechnicalPosXZ);
          
          const zonaActivacionTechnical = 8.0; 
          const zonaReseteoTechnical = 11.0;  

          if (distanciaATechnical < zonaActivacionTechnical) { 
              if (!actionTechnical.isRunning()) {
                  actionTechnical.play();
                  console.log('Animación Cuadro Technical Difficulties INICIADA por proximidad.');
              }
          } else if (distanciaATechnical > zonaReseteoTechnical) {
              if (actionTechnical.isRunning()) {
                  actionTechnical.stop();
                  console.log('Animación Cuadro Technical Difficulties DETENIDA por alejamiento.');
              }
          }
      }

      // 5d. Lógica de Proximidad de ANIMACIÓN (Cuadro Garden) (NUEVA LÓGICA)
      if (cuadroGarden && actionGarden) {
          const playerPosXZ = modeloGLTF.position.clone();
          const cuadroGardenPosXZ = cuadroGarden.position.clone();
          
          playerPosXZ.y = 0;
          cuadroGardenPosXZ.y = 0; 
          
          const distanciaAGarden = playerPosXZ.distanceTo(cuadroGardenPosXZ);
          
          const zonaActivacionGarden = 11.0; 
          const zonaReseteoGarden = 13.0;  

          if (distanciaAGarden < zonaActivacionGarden) { 
              if (!actionGarden.isRunning()) {
                  actionGarden.play();
                  console.log('Animación Cuadro Garden INICIADA por proximidad.');
              }
          } else if (distanciaAGarden > zonaReseteoGarden) {
              if (actionGarden.isRunning()) {
                  actionGarden.stop();
                  console.log('Animación Cuadro Garden DETENIDA por alejamiento.');
              }
          }
      }
      
      // 5e. Actualización de Mixers
      if (mixerInsanity) {
          mixerInsanity.update(delta);
      }
      if (mixerTechnical) {
          mixerTechnical.update(delta);
      }
      if (mixerGarden) { // NUEVO MIXER
          mixerGarden.update(delta);
      }


      // 6. Iluminación Local
      luzHonguito.position.copy(modeloGLTF.position);
      luzHonguito.position.y += 2.5; 

      // 7. Lógica de Proximidad de Audio (El Grito - ÚNICA VEZ)
      if (cuadroGrito && audioGrito && audioGrito.buffer) {
          // CLAVE: Creamos vectores temporales y ajustamos Y=0 para calcular la distancia horizontal
          const playerPosXZ = modeloGLTF.position.clone();
          const cuadroPosXZ = cuadroGrito.position.clone();
          
          playerPosXZ.y = 0;
          cuadroPosXZ.y = 0;
          
          const distanciaAlGrito = playerPosXZ.distanceTo(cuadroPosXZ); // DISTANCIA HORIZONTAL
          
          const zonaActivacion = 9.0; 
          const zonaReseteo = 12.0;  

          if (distanciaAlGrito < zonaActivacion) { 
              if (!gritoReproducido) {
                  // Reanuda el contexto de audio justo antes de reproducir, como doble verificación
                  audioGrito.context.resume().then(() => {
                      if (audioGrito.isPlaying) audioGrito.stop(); 
                      audioGrito.play();
                      gritoReproducido = true;
                      
                      console.log('¡ZONA DE GRITO ALCANZADA! Reproduciendo...'); 
                      
                      // Baja el volumen ambiente para destacar el grito (CLAVE: A 0.05)
                      if (audioAmbiente && audioAmbiente.isPlaying) audioAmbiente.setVolume(0.05); 
                  }).catch(e => {
                      console.error("Error al reanudar el contexto de audio para el grito:", e);
                  });
              }
          } else if (distanciaAlGrito > zonaReseteo) {
              // Resetear el estado si se aleja lo suficiente
              gritoReproducido = false; 
              // Volver al volumen ambiente normal
              if (audioAmbiente && audioAmbiente.isPlaying) audioAmbiente.setVolume(0.5); 
          }
      }
  }


  if (mixer) {
    mixer.update(delta);
  }

  renderizador.render(escena, camara);
}
animar();