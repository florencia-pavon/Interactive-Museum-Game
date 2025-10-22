// --- CONFIGURACIÓN SALA DIMENSIONES ---
const ANCHO_SALA = 60;
const ALTO_SALA = 20;
const PROFUNDIDAD_SALA = 80;

// --- AJUSTES MOVIMIENTO CÁMARA ---
const VELOCIDAD = 5.0;
const ALTURA_HONGUITO = 0.2;
const RADIO_COLISION = 0.5;
const DISTANCIA_CAMARA = 8;
const ALTURA_CAMARA_SEGUIMIENTO = 4.5;

// --- CONTROL MOUSE BLOQUEO ---
const VELOCIDAD_MOUSE = 0.002;
let isLocked = false;

// --- OBJETOS CÁMARA PIVOTE ---
let cameraPivot = new THREE.Object3D();
let cameraVertical = new THREE.Object3D();

// --- VARIABLES COLISIÓN POSICIÓN ---
let estatuaBoundingBox = null;
let vallaBoundingBox = null;
const VALLA_Z = -35;
const ESTATUA_POS = new THREE.Vector3(0, 0, 0);

// --- EXHIBICIÓN CUADRO GRITO ---
let cuadroGrito = null;
let luzValla = null;

// --- EXHIBICIÓN CUADRO ENGRANAJE ---
let cuadroEngranaje = null;
let vallaEngranajeBoundingBox = null;
let mixerEngranaje = null;
let actionEngranaje = null;

// --- EXHIBICIÓN CUADRO TELEVISORES ---
let cuadroTelevisores = null;
let vallaTelevisoresBoundingBox = null;
let mixerTechnical = null;
let actionTechnical = null;
let cuadroTelevisoresBoundingBox = null; // NUEVO: Bounding box para el cuadro Televisores

// --- EXHIBICIÓN CUADRO GARDEN ---
let cuadroGarden = null;
let vallaGardenBoundingBox = null;
let mixerGarden = null;
let actionGarden = null;
let cuadroGardenBoundingBox = null; // NUEVO: Bounding box para el cuadro Garden

// --- EXHIBICIÓN ARTE USUARIO ---
let userArtMesh = null;
let isPromptVisible = false;
let isDrawingMode = false;
let drawingCanvasContext = null;
let userArtTexture = null;

// --- VARIABLES GESTIÓN AUDIO ---
let listener;
let audioLoader;
let audioAmbiente = null;
let audioGrito;
const DISTANCIA_GRITO = 20;
let gritoReproducido = false;

// --- VECTORES RAYCASTER INTERACCIÓN ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// --- INICIALIZAR ESCENA COLOR ---
const escena = new THREE.Scene();
escena.background = new THREE.Color(0xaaaaaa);

// --- CONFIGURAR RENDERIZADOR SOMBRAS ---
const renderizador = new THREE.WebGLRenderer({
  canvas: document.querySelector("#miCanvas"),
  antialias: true,
});
renderizador.setSize(window.innerWidth, window.innerHeight);
renderizador.setPixelRatio(window.devicePixelRatio);
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap;

// --- CONFIGURAR CÁMARA PIVOTE ---
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

// --- INICIALIZAR ESCUCHA CARGADOR ---
listener = new THREE.AudioListener();
camara.add(listener);

audioLoader = new THREE.AudioLoader();

// --- CARGAR AUDIO AMBIENTAL ---
audioLoader.load(
  "assets/sounds/museum_ambient.mp3",
  function (buffer) {
    audioAmbiente = new THREE.Audio(listener);
    audioAmbiente.setBuffer(buffer);
    audioAmbiente.setLoop(true);
    audioAmbiente.setVolume(0.5);
  },
  undefined,
  function (error) {
    console.warn(
      'Error al cargar el sonido ambiental. Asegúrate de tener "assets/sounds/museum_ambient.mp3".'
    );
  }
);

// --- CONFIGURAR ILUMINACIÓN GLOBAL ---
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

// --- CARGAR TEXTURAS MATERIALES ---
const loader = new THREE.TextureLoader();
const texturaPiso = loader.load("assets/images/piso.jpg");
const texturaTecho = loader.load("assets/images/techo.jpg");
const texturaPared = loader.load("assets/images/pared.jpg");

// --- FUNCIÓN REPETIR TEXTURA ---
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
  side: THREE.DoubleSide,
});

// --- CALCULAR DIMENSIONES GEOMETRÍAS ---
const mitadAncho = ANCHO_SALA / 2;
const mitadProfundidad = PROFUNDIDAD_SALA / 2;
const mitadAlto = ALTO_SALA / 2;

const geometriaPisoTecho = new THREE.PlaneGeometry(
  ANCHO_SALA,
  PROFUNDIDAD_SALA
);
const geometriaParedFondo = new THREE.PlaneGeometry(ANCHO_SALA, ALTO_SALA);
const geometriaParedLateral = new THREE.PlaneGeometry(
  PROFUNDIDAD_SALA,
  ALTO_SALA
);

// --- CONSTRUIR PISO TECHO PAREDES ---
const piso = new THREE.Mesh(geometriaPisoTecho, materialPiso);
piso.rotation.x = -Math.PI / 2;
piso.position.y = 0;
piso.receiveShadow = true;
escena.add(piso);

const techo = new THREE.Mesh(geometriaPisoTecho, materialTecho);
techo.rotation.x = Math.PI / 2;
techo.position.y = ALTO_SALA;
escena.add(techo);

const pared1 = new THREE.Mesh(geometriaParedFondo, materialParedUnico);
pared1.position.set(0, mitadAlto, -mitadProfundidad);
pared1.receiveShadow = true;
escena.add(pared1);
const pared2 = new THREE.Mesh(geometriaParedFondo, materialParedUnico);
pared2.rotation.y = Math.PI;
pared2.position.set(0, mitadAlto, mitadProfundidad);
pared2.receiveShadow = true;
escena.add(pared2);
const pared3 = new THREE.Mesh(geometriaParedLateral, materialParedUnico);
pared3.rotation.y = -Math.PI / 2;
pared3.position.set(-mitadAncho, mitadAlto, 0);
pared3.receiveShadow = true;
escena.add(pared3);
const pared4 = new THREE.Mesh(geometriaParedLateral, materialParedUnico);
pared4.rotation.y = Math.PI / 2;
pared4.position.set(mitadAncho, mitadAlto, 0);
pared4.receiveShadow = true;
escena.add(pared4);

// --- CONFIGURAR SISTEMA DIBUJO ---
function setupDrawingSystem() {
  const canvas = document.getElementById("drawing-canvas");
  const ctx = canvas.getContext("2d");
  const colorPicker = document.getElementById("color-picker");
  const finishButton = document.getElementById("finish-drawing");
  const cancelButton = document.getElementById("cancel-drawing");

  drawingCanvasContext = ctx;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let isPainting = false;
  let lastX = 0;
  let lastY = 0;

  ctx.lineWidth = 8;
  ctx.lineCap = "round";

  const draw = (e) => {
    if (!isPainting) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.strokeStyle = colorPicker.value;
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();

    [lastX, lastY] = [mouseX, mouseY];
  };

  const startPosition = (e) => {
    isPainting = true;
    const rect = canvas.getBoundingClientRect();
    [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
  };

  const endPosition = () => {
    isPainting = false;
  };

  canvas.addEventListener("mousedown", startPosition);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", endPosition);
  canvas.addEventListener("mouseout", endPosition);

  finishButton.addEventListener("click", () => {
    applyDrawingToThreeJS(canvas);
    exitDrawingMode();
  });

  cancelButton.addEventListener("click", () => {
    exitDrawingMode();
  });

  document.getElementById("prompt-yes").addEventListener("click", () => {
    hidePrompt();
    startDrawingMode();
  });

  document.getElementById("prompt-no").addEventListener("click", hidePrompt);
}

// --- INICIAR MODO DIBUJO ---
function startDrawingMode() {
  isDrawingMode = true;
  document.getElementById("drawing-ui").style.display = "block";

  document.exitPointerLock();
  isLocked = false;

  if (actionEngranaje) actionEngranaje.paused = true;
  if (actionTechnical) actionTechnical.paused = true;
  if (actionGarden) actionGarden.paused = true;
}

// --- SALIR MODO DIBUJO ---
function exitDrawingMode() {
  isDrawingMode = false;
  document.getElementById("drawing-ui").style.display = "none";

  hidePrompt();

  if (actionEngranaje) actionEngranaje.paused = false;
  if (actionTechnical) actionTechnical.paused = false;
  if (actionGarden) actionGarden.paused = false;
}

// --- ACTUALIZAR TEXTURA 3D ---
function applyDrawingToThreeJS(canvas) {
  if (userArtMesh) {
    if (!userArtTexture) {
      userArtTexture = new THREE.CanvasTexture(canvas);
      userArtTexture.minFilter = THREE.LinearFilter;
      userArtMesh.material = new THREE.MeshStandardMaterial({
        map: userArtTexture,
        side: THREE.DoubleSide,
      });
    } else {
      userArtTexture.needsUpdate = true;
    }
  }
}

// --- MOSTRAR PROMPT INTERACCIÓN ---
function showPrompt() {
  if (isDrawingMode || isPromptVisible) return;
  isPromptVisible = true;
  document.getElementById("interaction-prompt").style.display = "block";
  document.exitPointerLock();
  isLocked = false;
  console.log("Prompt de interacción visible.");
}

// --- OCULTAR PROMPT RESTAURAR ---
function hidePrompt() {
  isPromptVisible = false;
  document.getElementById("interaction-prompt").style.display = "none";
  document.body.requestPointerLock();
}

// --- VARIABLES MODELO JUGADOR ---
let modeloGLTF = null;
let mixer = null;
let walkAction = null;
let currentAnimation = null;

const clock = new THREE.Clock();
const keys = {
  ArrowUp: false,
  w: false,
  ArrowDown: false,
  s: false,
  ArrowLeft: false,
  a: false,
  ArrowRight: false,
  d: false,
};

// --- GESTIÓN ENTRADA TECLADO ---
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "g" && !isDrawingMode && !isPromptVisible) {
    showPrompt();
    return;
  }

  if (keys.hasOwnProperty(key)) keys[key] = true;
});
window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = false;
});

// --- GESTIÓN MOUSE VISTA ---
document.body.addEventListener("click", () => {
  if (isDrawingMode || isPromptVisible) return;

  if (!isLocked) {
    if (audioAmbiente && audioAmbiente.buffer && !audioAmbiente.isPlaying) {
      audioAmbiente.context
        .resume()
        .then(() => {
          audioAmbiente.play();
        })
        .catch((e) => {
          console.error(
            "Error al reanudar el contexto de audio y reproducir:",
            e
          );
        });
    }
    renderizador.domElement.requestPointerLock();
  }
});

document.addEventListener("pointerlockchange", () => {
  isLocked = document.pointerLockElement === renderizador.domElement;
});

document.addEventListener("mousemove", (event) => {
  if (isLocked) {
    cameraPivot.rotation.y -= event.movementX * VELOCIDAD_MOUSE;

    let deltaY = event.movementY * VELOCIDAD_MOUSE;
    cameraVertical.rotation.x -= deltaY;

    const limit = Math.PI / 2 - 0.1;
    cameraVertical.rotation.x = Math.max(
      -limit,
      Math.min(limit, cameraVertical.rotation.x)
    );
  }
});

// --- CARGAR MODELO JUGADOR ---
const gltfLoader = new THREE.GLTFLoader();

gltfLoader.load(
  "assets/models/mushroom_girl/scene.gltf",
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
          child.material.forEach((m) => (m.needsUpdate = true));
        } else {
          child.material.needsUpdate = true;
        }
      }
    });

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      const walkClip =
        THREE.AnimationClip.findByName(gltf.animations, "Walk") ||
        gltf.animations[0];
      if (walkClip) {
        walkAction = mixer.clipAction(walkClip);
        walkAction.setLoop(THREE.LoopRepeat, Infinity);
      }
    }
  },
  undefined,
  function (error) {
    console.error("Error al cargar el modelo del Honguito:", error);
  }
);

// --- CARGAR MODELO ESTATUA ---
gltfLoader.load(
  "assets/models/estatua_de_la_libertad.glb",
  function (gltf) {
    const estatua = gltf.scene;

    estatua.position.set(0, 0, 0);
    estatua.scale.set(5, 5, 5);

    estatua.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    escena.add(estatua);

    const box = new THREE.Box3().setFromObject(estatua);
    estatuaBoundingBox = box;
  },
  undefined,
  function (error) {
    console.error("Error al cargar la Estatua de la Libertad:", error);
  }
);

// --- CARGAR MODELO VALLA CUADRO EL GRITO ---
gltfLoader.load(
  "assets/models/valla/scene.gltf",
  function (gltf) {
    const valla = gltf.scene;

    valla.position.set(0, 0, VALLA_Z);
    valla.scale.set(3.0, 3.0, 3.0);

    valla.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    escena.add(valla);

    const box = new THREE.Box3().setFromObject(valla);
    vallaBoundingBox = box;

    luzValla = new THREE.PointLight(0xffffff, 5, 7);
    luzValla.position.set(1.5, valla.scale.y * 1.5, valla.position.z + 2);
    escena.add(luzValla);
  },
  undefined,
  function (error) {
    console.error("Error al cargar la Valla de Exhibición:", error);
  }
);

// --- CARGAR MODELO LÁMPARA CUADRO EL GRITO ---
const LAMPARA_GRITO_Y_OFFSET = 5.0;
const LAMPARA_GRITO_Y_POS = ALTO_SALA - LAMPARA_GRITO_Y_OFFSET;
const LAMPARA_SCALE = 4.0;

gltfLoader.load(
  "assets/models/lamparas.glb",
  function (gltf) {
    const lamparaGrito = gltf.scene;
    lamparaGrito.position.set(0, LAMPARA_GRITO_Y_POS, VALLA_Z);
    lamparaGrito.scale.set(LAMPARA_SCALE, LAMPARA_SCALE, LAMPARA_SCALE);

    lamparaGrito.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    escena.add(lamparaGrito);

    const spotLight = new THREE.SpotLight(
      0xffffff,
      0.5,
      18,
      30,
      Math.PI / 16,
      0.1,
      2
    );
    spotLight.position.set(0, LAMPARA_GRITO_Y_POS, VALLA_Z);
    spotLight.target.position.set(0, LAMPARA_GRITO_Y_POS - 1, VALLA_Z);
    spotLight.castShadow = true;
    escena.add(spotLight);
    escena.add(spotLight.target);
  },
  undefined,
  function (error) {
    console.error("Error al cargar la Lámpara:", error);
  }
);

// --- CARGAR CUADRO GRITO ---
const CUADRO_GRITO_Z = -mitadProfundidad + 0.1;
const CUADRO_GRITO_Y = mitadAlto;
const CUADRO_GRITO_X = 1;
const CUADRO_GRITO_SCALE = 11;

gltfLoader.load(
  "assets/models/cuadro_el_grito.glb",
  function (gltf) {
    cuadroGrito = gltf.scene;

    cuadroGrito.position.set(CUADRO_GRITO_X, CUADRO_GRITO_Y, CUADRO_GRITO_Z);
    cuadroGrito.scale.set(
      CUADRO_GRITO_SCALE,
      CUADRO_GRITO_SCALE,
      CUADRO_GRITO_SCALE
    );

    cuadroGrito.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.name = "Cuadro_El_Grito";
      }
    });

    escena.add(cuadroGrito);

    const luzCuadroGrito = new THREE.SpotLight(
      0xffffff,
      30,
      10,
      Math.PI / 7,
      0.5,
      0.5
    );

    luzCuadroGrito.position.set(
      CUADRO_GRITO_X,
      CUADRO_GRITO_Y + 5,
      CUADRO_GRITO_Z + 5
    );
    luzCuadroGrito.castShadow = false;

    const targetCuadro = new THREE.Object3D();
    targetCuadro.position.set(CUADRO_GRITO_X, CUADRO_GRITO_Y, CUADRO_GRITO_Z);
    escena.add(targetCuadro);
    luzCuadroGrito.target = targetCuadro;

    escena.add(luzCuadroGrito);

    audioGrito = new THREE.PositionalAudio(listener);
    audioLoader.load(
      "assets/sounds/terrifying_scream.mp3",
      function (buffer) {
        audioGrito.setBuffer(buffer);
        audioGrito.setRefDistance(8);
        audioGrito.setMaxDistance(20);
        audioGrito.setRolloffFactor(1);
        audioGrito.setLoop(false);
      },
      undefined,
      function (error) {
        console.warn(
          'Error CRÍTICO al cargar el sonido del grito. Revisa la ruta: "assets/sounds/terrifying_scream.mp3".'
        );
      }
    );
    cuadroGrito.add(audioGrito);
  },
  undefined,
  function (error) {
    console.error('Error al cargar el cuadro "El Grito":', error);
  }
);

// --- CARGAR CUADRO ENGRANAJE ---
const CUADRO_ENGRANAJE_X = -mitadAncho + 0.1;
const CUADRO_ENGRANAJE_Y = mitadAlto;
const CUADRO_ENGRANAJE_Z = 0;
const CUADRO_ENGRANAJE_ROTATION = Math.PI / 2;

gltfLoader.load(
  "assets/models/cuadro_engranaje/scene.gltf",
  function (gltf) {
    cuadroEngranaje = gltf.scene;

    cuadroEngranaje.position.set(
      CUADRO_ENGRANAJE_X,
      CUADRO_ENGRANAJE_Y,
      CUADRO_ENGRANAJE_Z - 5
    );
    cuadroEngranaje.rotation.y = CUADRO_ENGRANAJE_ROTATION;
    cuadroEngranaje.scale.set(1.5, 1.5, 1.5);

    cuadroEngranaje.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.name = "Cuadro_Engranaje";
      }
    });

    escena.add(cuadroEngranaje);

    if (gltf.animations && gltf.animations.length > 0) {
      mixerEngranaje = new THREE.AnimationMixer(gltf.scene);
      const clip = gltf.animations[0];
      actionEngranaje = mixerEngranaje.clipAction(clip);
      actionEngranaje.setLoop(THREE.LoopRepeat, Infinity);
    }

    const luzCuadroEngranaje = new THREE.SpotLight(
      0xffffff,
      10,
      5,
      Math.PI / 10,
      1,
      1
    );

    luzCuadroEngranaje.position.set(
      CUADRO_ENGRANAJE_X + 5,
      CUADRO_ENGRANAJE_Y + 5,
      CUADRO_ENGRANAJE_Z
    );
    luzCuadroEngranaje.castShadow = false;

    const targetEngranaje = new THREE.Object3D();
    targetEngranaje.position.set(
      CUADRO_ENGRANAJE_X,
      CUADRO_ENGRANAJE_Y,
      CUADRO_ENGRANAJE_Z
    );
    escena.add(targetEngranaje);
    luzCuadroEngranaje.target = targetEngranaje;

    escena.add(luzCuadroEngranaje);
  },
  undefined,
  function (error) {
    console.error('Error al cargar el cuadro "Engranaje in Motion":', error);
  }
);

// --- CARGAR VALLA CUADRO ENGRANAJE ---
const VALLA_ENGRANAJE_X = CUADRO_ENGRANAJE_X + 5;
const VALLA_ENGRANAJE_Z = CUADRO_ENGRANAJE_Z;
const VALLA_ENGRANAJE_ROTATION = CUADRO_ENGRANAJE_ROTATION;

gltfLoader.load(
  "assets/models/valla/scene.gltf",
  function (gltf) {
    const vallaEngranaje = gltf.scene;

    vallaEngranaje.position.set(VALLA_ENGRANAJE_X, 0, VALLA_ENGRANAJE_Z);
    vallaEngranaje.rotation.y = CUADRO_ENGRANAJE_ROTATION;
    vallaEngranaje.scale.set(3.0, 3.0, 3.0);

    vallaEngranaje.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    escena.add(vallaEngranaje);

    const box = new THREE.Box3().setFromObject(vallaEngranaje);
    vallaEngranajeBoundingBox = box;
  },
  undefined,
  function (error) {
    console.error("Error al cargar la Valla de Exhibición Izquierda:", error);
  }
);

// --- CARGAR MODELO LÁMPARA CUADRO ENGRANAJE ---
const LAMPARA_ENGRANAJE_Y_OFFSET = 5.0;
const LAMPARA_ENGRANAJE_Y_POS = ALTO_SALA - LAMPARA_ENGRANAJE_Y_OFFSET;

gltfLoader.load(
  "assets/models/lamparas.glb",
  function (gltf) {
    const lamparaEngranaje = gltf.scene;
    lamparaEngranaje.position.set(
      VALLA_ENGRANAJE_X,
      LAMPARA_ENGRANAJE_Y_POS,
      VALLA_ENGRANAJE_Z
    );
    lamparaEngranaje.rotation.y = Math.PI / 2;
    lamparaEngranaje.scale.set(
      LAMPARA_SCALE,
      LAMPARA_SCALE,
      LAMPARA_SCALE
    );

    lamparaEngranaje.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    escena.add(lamparaEngranaje);

    const spotLight = new THREE.SpotLight(
      0xffffff,
      0.5,
      18,
      30,
      Math.PI / 16,
      0.1,
      2
    );
    spotLight.position.set(
      VALLA_ENGRANAJE_X,
      LAMPARA_ENGRANAJE_Y_POS,
      VALLA_ENGRANAJE_Z
    );

    const targetEngranaje = new THREE.Object3D();
    targetEngranaje.position.set(VALLA_ENGRANAJE_X, 0, VALLA_ENGRANAJE_Z);

    spotLight.castShadow = true;
    spotLight.target = targetEngranaje;

    escena.add(spotLight);
    escena.add(spotLight.target);
  },
  undefined,
  function (error) {
    console.error("Error al cargar la Lámpara:", error);
  }
);

// --- CARGAR CUADRO TELEVISORES ---
const CUADRO_TELEVISORES_SCALE = 0.5;
const CUADRO_TELEVISORES_X = mitadAncho - 3;
const CUADRO_TELEVISORES_Y = 0;
const CUADRO_TELEVISORES_Z = 0;
const CUADRO_TELEVISORES_ROTATION = -Math.PI / 1;

gltfLoader.load(
  "assets/models/cuadro_televisores/scene.gltf",
  function (gltf) {
    cuadroTelevisores = gltf.scene;

    cuadroTelevisores.position.set(
      CUADRO_TELEVISORES_X,
      CUADRO_TELEVISORES_Y,
      CUADRO_TELEVISORES_Z
    );
    cuadroTelevisores.rotation.y = CUADRO_TELEVISORES_ROTATION;
    cuadroTelevisores.scale.set(
      CUADRO_TELEVISORES_SCALE,
      CUADRO_TELEVISORES_SCALE,
      CUADRO_TELEVISORES_SCALE
    );

    cuadroTelevisores.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.name = "Cuadro_Televisores";
      }
    });

    escena.add(cuadroTelevisores);
    
    // NUEVO: CALCULAR BOUNDING BOX PARA EL CUADRO TELEVISORES
    const boxTelevisores = new THREE.Box3().setFromObject(cuadroTelevisores);
    cuadroTelevisoresBoundingBox = boxTelevisores;

    if (gltf.animations && gltf.animations.length > 0) {
      mixerTechnical = new THREE.AnimationMixer(gltf.scene);
      const clip = gltf.animations[0];
      actionTechnical = mixerTechnical.clipAction(clip);
      actionTechnical.setLoop(THREE.LoopRepeat, Infinity);
    }

    const luzCuadroTelevisores = new THREE.SpotLight(
      0xffffff,
      30,
      10,
      Math.PI / 7,
      0.5,
      0.5
    );

    luzCuadroTelevisores.position.set(
      CUADRO_TELEVISORES_X - 5,
      CUADRO_TELEVISORES_Y + 5,
      CUADRO_TELEVISORES_Z
    );
    luzCuadroTelevisores.castShadow = false;

    const targetTelevisores = new THREE.Object3D();
    targetTelevisores.position.set(
      CUADRO_TELEVISORES_X,
      CUADRO_TELEVISORES_Y,
      CUADRO_TELEVISORES_Z
    );
    escena.add(targetTelevisores);
    luzCuadroTelevisores.target = targetTelevisores;

    escena.add(luzCuadroTelevisores);
  },
  undefined,
  function (error) {
    console.error('Error al cargar el cuadro "Televisores":', error);
  }
);

// --- CARGAR VALLA CUADRO TELEVISORES ---
const VALLA_TELEVISORES_X = CUADRO_TELEVISORES_X - 9;
const VALLA_TELEVISORES_Z = CUADRO_TELEVISORES_Z;
const VALLA_TELEVISORES_ROTATION = -Math.PI / 2;

gltfLoader.load(
  "assets/models/valla/scene.gltf",
  function (gltf) {
    const vallaTelevisores = gltf.scene;

    vallaTelevisores.position.set(VALLA_TELEVISORES_X, 0, VALLA_TELEVISORES_Z);
    vallaTelevisores.rotation.y = VALLA_TELEVISORES_ROTATION;
    vallaTelevisores.scale.set(3.0, 3.0, 3.0);

    vallaTelevisores.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    escena.add(vallaTelevisores);

    const box = new THREE.Box3().setFromObject(vallaTelevisores);
    vallaTelevisoresBoundingBox = box;
  },
  undefined,
  function (error) {
    console.error("Error al cargar la Valla de Exhibición Derecha:", error);
  }
);

// --- CARGAR MODELO LÁMPARA CUADRO TELEVISORES ---
const LAMPARA_TELEVISORES_Y_OFFSET = 5.0;
const LAMPARA_TELEVISORES_Y_POS = ALTO_SALA - LAMPARA_TELEVISORES_Y_OFFSET;
const LAMPARA_TELEVISORES_SCALE = 5.0;

gltfLoader.load(
  "assets/models/lamparas.glb",
  function (gltf) {
    const lamparaTelevisores = gltf.scene;
    lamparaTelevisores.position.set(
      VALLA_TELEVISORES_X,
      LAMPARA_TELEVISORES_Y_POS,
      VALLA_TELEVISORES_Z
    );

    lamparaTelevisores.rotation.y = Math.PI / 2;


    lamparaTelevisores.scale.set(
      LAMPARA_SCALE,
      LAMPARA_SCALE,
      LAMPARA_SCALE
    );

    lamparaTelevisores.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    escena.add(lamparaTelevisores);
    const spotLight = new THREE.SpotLight(
      0xffffff,
      0.5,
      18,
      30,
      Math.PI / 16,
      0.1,
      2
    );
    spotLight.position.set(
      VALLA_TELEVISORES_X,
      LAMPARA_TELEVISORES_Y_POS,
      VALLA_TELEVISORES_Z
    );

    const targetTelevisores = new THREE.Object3D();
    targetTelevisores.position.set(VALLA_TELEVISORES_X, 0, VALLA_TELEVISORES_Z);

    spotLight.castShadow = true;
    spotLight.target = targetTelevisores;

    escena.add(spotLight);
    escena.add(spotLight.target);
  },
  undefined,
  function (error) {
    console.error("Error al cargar la Lámpara:", error);
  }
);

// --- CARGAR CUADRO GARDEN ---
const CUADRO_GARDEN_Z = mitadProfundidad - 0.1;
const CUADRO_GARDEN_Y = mitadAlto;
const CUADRO_GARDEN_X = 0;
const CUADRO_GARDEN_SCALE = 10;
const CUADRO_GARDEN_ROTATION = Math.PI;

gltfLoader.load(
  "assets/models/cuadro_garden/scene.gltf",
  function (gltf) {
    cuadroGarden = gltf.scene;

    cuadroGarden.position.set(
      CUADRO_GARDEN_X,
      CUADRO_GARDEN_Y,
      CUADRO_GARDEN_Z
    );
    cuadroGarden.rotation.y = CUADRO_GARDEN_ROTATION;
    cuadroGarden.scale.set(
      CUADRO_GARDEN_SCALE,
      CUADRO_GARDEN_SCALE,
      CUADRO_GARDEN_SCALE
    );

    cuadroGarden.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.name = "Cuadro_Garden";
      }
    });

    escena.add(cuadroGarden);

    // NUEVO: CALCULAR BOUNDING BOX PARA EL CUADRO GARDEN
    const boxGarden = new THREE.Box3().setFromObject(cuadroGarden);
    cuadroGardenBoundingBox = boxGarden;

    if (gltf.animations && gltf.animations.length > 0) {
      mixerGarden = new THREE.AnimationMixer(gltf.scene);
      const clip = gltf.animations[0];
      actionGarden = mixerGarden.clipAction(clip);
      actionGarden.setLoop(THREE.LoopRepeat, Infinity);
    }

    const luzCuadroGarden = new THREE.SpotLight(
      0xffffff,
      30,
      10,
      Math.PI / 7,
      0.5,
      0.5
    );

    luzCuadroGarden.position.set(
      CUADRO_GARDEN_X,
      CUADRO_GARDEN_Y + 5,
      CUADRO_GARDEN_Z - 5
    );
    luzCuadroGarden.castShadow = false;

    const targetGarden = new THREE.Object3D();
    targetCuadro.position.set(
      CUADRO_GARDEN_X,
      CUADRO_GARDEN_Y,
      CUADRO_GARDEN_Z
    );
    escena.add(targetGarden);
    luzCuadroGarden.target = targetGarden;

    escena.add(luzCuadroGarden);
  },
  undefined,
  function (error) {
    console.error('Error al cargar el cuadro "Garden":', error);
  }
);

// --- CARGAR VALLA CUADRO GARDEN ---
const VALLA_GARDEN_X = CUADRO_GARDEN_X - 2;
const VALLA_GARDEN_Z = CUADRO_GARDEN_Z - 10;
const VALLA_GARDEN_ROTATION = 0;

gltfLoader.load(
  "assets/models/valla/scene.gltf",
  function (gltf) {
    const vallaGarden = gltf.scene;

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

    const box = new THREE.Box3().setFromObject(vallaGarden);
    vallaGardenBoundingBox = box;
  },
  undefined,
  function (error) {
    console.error("Error al cargar la Valla de Exhibición Garden:", error);
  }
);

// --- CARGAR MODELO LÁMPARA CUADRO GARDEN ---
const LAMPARA_GARDEN_Y_OFFSET = 5.0;
const LAMPARA_GARDEN_Y_POS = ALTO_SALA - LAMPARA_GARDEN_Y_OFFSET;
const LAMPARA_GARDEN_SCALE = 5.0;

gltfLoader.load(
  "assets/models/lamparas.glb",
  function (gltf) {
    const lamparaGarden = gltf.scene;
    lamparaGarden.position.set(
      VALLA_GARDEN_X + 2,
      LAMPARA_GARDEN_Y_POS,
      VALLA_GARDEN_Z
    );

    lamparaGarden.scale.set(
      LAMPARA_SCALE,
      LAMPARA_SCALE,
      LAMPARA_SCALE
    );

    lamparaGarden.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    escena.add(lamparaGarden);
    const spotLight = new THREE.SpotLight(
      0xffffff,
      0.5,
      18,
      30,
      Math.PI / 16,
      0.1,
      2
    );
    spotLight.position.set(
      VALLA_GARDEN_X,
      LAMPARA_GARDEN_Y_POS,
      VALLA_GARDEN_Z
    );

    const targetGarden = new THREE.Object3D();
    targetGarden.position.set(VALLA_GARDEN_X, 0, VALLA_GARDEN_Z);

    spotLight.castShadow = true;
    spotLight.target = targetGarden;

    escena.add(spotLight);
    escena.add(spotLight.target);
  },
  undefined,
  function (error) {
    console.error("Error al cargar la Lámpara:", error);
  }
);

// --- CREAR LIENZO DIBUJO USUARIO ---
const CUADRO_LIENZO_X = -15;
const CUADRO_LIENZO_Y = mitadAlto;
const CUADRO_LIENZO_Z = -mitadProfundidad + 0.1;
const CUADRO_LIENZO_ROTATION = 0;
const CUADRO_LIENZO_WIDTH = 10;
const CUADRO_LIENZO_HEIGHT = 8;

const planeGeometry = new THREE.PlaneGeometry(
  CUADRO_LIENZO_WIDTH,
  CUADRO_LIENZO_HEIGHT
);
const initialMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
userArtMesh = new THREE.Mesh(planeGeometry, initialMaterial);

userArtMesh.position.set(CUADRO_LIENZO_X, CUADRO_LIENZO_Y, CUADRO_LIENZO_Z);
userArtMesh.rotation.y = CUADRO_LIENZO_ROTATION;
userArtMesh.name = "User_Art_Canvas";

escena.add(userArtMesh);

setupDrawingSystem();

// --- LOOP PRINCIPAL JUEGO ---
function animar() {
  requestAnimationFrame(animar);

  const delta = clock.getDelta();

  if (modeloGLTF) {
    const step = VELOCIDAD * delta;
    let isMoving = false;

    // --- BLOQUEAR MOVIMIENTO UI ---
    if (!isPromptVisible && !isDrawingMode) {
      const oldPositionX = modeloGLTF.position.x;
      const oldPositionZ = modeloGLTF.position.z;

      // --- CALCULAR DIRECCIÓN CÁMARA ---
      const cameraDirection = new THREE.Vector3();
      cameraPivot.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection);

      let forwardVector = new THREE.Vector3();
      let strafeVector = new THREE.Vector3();

      // --- GESTIONAR ENTRADA TECLADO ---
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

      // --- APLICAR NUEVA POSICIÓN ---
      const nextPositionX = oldPositionX + forwardVector.x + strafeVector.x;
      const nextPositionZ = oldPositionZ + forwardVector.z + strafeVector.z;

      modeloGLTF.position.x = nextPositionX;
      modeloGLTF.position.z = nextPositionZ;

      // --- DETECTAR COLISIÓN OBJETOS ---
      let collisionDetected = false;
      const honguitoBox = new THREE.Box3();
      honguitoBox.setFromCenterAndSize(
        new THREE.Vector3(
          modeloGLTF.position.x,
          ALTURA_HONGUITO,
          modeloGLTF.position.z
        ),
        new THREE.Vector3(
          RADIO_COLISION * 2,
          ALTURA_HONGUITO * 2,
          RADIO_COLISION * 2
        )
      );

      if (estatuaBoundingBox && estatuaBoundingBox.intersectsBox(honguitoBox)) {
        collisionDetected = true;
      }

      if (vallaBoundingBox && vallaBoundingBox.intersectsBox(honguitoBox)) {
        collisionDetected = true;
      }

      if (
        vallaEngranajeBoundingBox &&
        vallaEngranajeBoundingBox.intersectsBox(honguitoBox)
      ) {
        collisionDetected = true;
      }

      if (
        vallaTelevisoresBoundingBox &&
        vallaTelevisoresBoundingBox.intersectsBox(honguitoBox)
      ) {
        collisionDetected = true;
      }

      if (
        vallaGardenBoundingBox &&
        vallaGardenBoundingBox.intersectsBox(honguitoBox)
      ) {
        collisionDetected = true;
      }

      // Colisión con cuadro Televisores
      if (
        cuadroTelevisoresBoundingBox &&
        cuadroTelevisoresBoundingBox.intersectsBox(honguitoBox)
      ) {
        collisionDetected = true;
      }
      
      // Colisión con cuadro Garden
      if (
        cuadroGardenBoundingBox &&
        cuadroGardenBoundingBox.intersectsBox(honguitoBox)
      ) {
        collisionDetected = true;
      }

      // --- REVERTIR COLISIÓN ---
      if (collisionDetected) {
        modeloGLTF.position.x = oldPositionX;
        modeloGLTF.position.z = oldPositionZ;
        isMoving = false;
      }

      // --- ROTAR MODELO MOVIMIENTO ---
      if (isMoving) {
        const movementVector = new THREE.Vector3(
          modeloGLTF.position.x - oldPositionX,
          0,
          modeloGLTF.position.z - oldPositionZ
        ).normalize();

        const targetAngle = Math.atan2(movementVector.x, movementVector.z);

        modeloGLTF.rotation.y = THREE.MathUtils.lerp(
          modeloGLTF.rotation.y,
          targetAngle,
          0.2
        );
      }

      // --- DETECTAR COLISIÓN PAREDES ---
      const maxDistX = mitadAncho - RADIO_COLISION;
      const maxDistZ = mitadProfundidad - RADIO_COLISION;

      let newPositionX = modeloGLTF.position.x;
      let newPositionZ = modeloGLTF.position.z;

      if (newPositionX > maxDistX || newPositionX < -maxDistX) {
        modeloGLTF.position.x = oldPositionX;
      }
      if (newPositionZ > maxDistZ || newPositionZ < -maxDistZ) {
        modeloGLTF.position.z = oldPositionZ;
      }

      // --- SINCRONIZAR CÁMARA PIVOTE ---
      cameraPivot.position.x = modeloGLTF.position.x;
      cameraPivot.position.z = modeloGLTF.position.z;
    }

    // --- CONTROL ANIMACIÓN JUGADOR ---
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

    // --- ANIMACIÓN CUADRO ENGRANAJE ---
    if (
      cuadroEngranaje &&
      actionEngranaje &&
      !isDrawingMode &&
      !isPromptVisible
    ) {
      const playerPosXZ = modeloGLTF.position.clone();
      const cuadroEngranajePosXZ = cuadroEngranaje.position.clone();

      playerPosXZ.y = 0;
      cuadroEngranajePosXZ.y = 0;

      const distanciaAEngranaje = playerPosXZ.distanceTo(cuadroEngranajePosXZ);

      const zonaActivacionEngranaje = 10.0;
      const zonaReseteoEngranaje = 13.0;

      if (distanciaAEngranaje < zonaActivacionEngranaje) {
        if (!actionEngranaje.isRunning()) {
          actionEngranaje.play();
        }
      } else if (distanciaAEngranaje > zonaReseteoEngranaje) {
        if (actionEngranaje.isRunning()) {
          actionEngranaje.stop();
        }
      }
    }

    // --- ANIMACIÓN CUADRO TELEVISORES ---
    if (
      cuadroTelevisores &&
      actionTechnical &&
      !isDrawingMode &&
      !isPromptVisible
    ) {
      const playerPosXZ = modeloGLTF.position.clone();
      const cuadroTechnicalPosXZ = cuadroTelevisores.position.clone();

      playerPosXZ.y = 0;
      cuadroTechnicalPosXZ.y = 0;

      const distanciaATechnical = playerPosXZ.distanceTo(cuadroTechnicalPosXZ);

      const zonaActivacionTechnical = 8.0;
      const zonaReseteoTechnical = 11.0;

      if (distanciaATechnical < zonaActivacionTechnical) {
        if (!actionTechnical.isRunning()) {
          actionTechnical.play();
        }
      } else if (distanciaATechnical > zonaReseteoTechnical) {
        if (actionTechnical.isRunning()) {
          actionTechnical.stop();
        }
      }
    }

    // --- ANIMACIÓN CUADRO GARDEN ---
    if (cuadroGarden && actionGarden && !isDrawingMode && !isPromptVisible) {
      const playerPosXZ = modeloGLTF.position.clone();
      const cuadroGardenPosXZ = cuadroGarden.position.clone();

      playerPosXZ.y = 0;
      cuadroGardenPosXZ.y = 0;

      const distanciaAGarden = playerPosXZ.distanceTo(cuadroGardenPosXZ);

      const zonaActivacionGarden = 12;
      const zonaReseteoGarden = 15.0;

      if (distanciaAGarden < zonaActivacionGarden) {
        if (!actionGarden.isRunning()) {
          actionGarden.play();
        }
      } else if (distanciaAGarden > zonaReseteoGarden) {
        if (actionGarden.isRunning()) {
          actionGarden.stop();
        }
      }
    }

    // --- ACTUALIZAR MIXERS ANIMACIONES ---
    if (mixerEngranaje) {
      mixerEngranaje.update(delta);
    }
    if (mixerTechnical) {
      mixerTechnical.update(delta);
    }
    if (mixerGarden) {
      mixerGarden.update(delta);
    }

    // --- POSICIONAR LUZ JUGADOR ---
    luzHonguito.position.copy(modeloGLTF.position);
    luzHonguito.position.y += 2.5;

    // --- GESTIÓN AUDIO GRITO ---
    if (
      cuadroGrito &&
      audioGrito &&
      audioGrito.buffer &&
      !isDrawingMode &&
      !isPromptVisible
    ) {
      const playerPosXZ = modeloGLTF.position.clone();
      const cuadroPosXZ = cuadroGrito.position.clone();

      playerPosXZ.y = 0;
      cuadroPosXZ.y = 0;

      const distanciaAlGrito = playerPosXZ.distanceTo(cuadroPosXZ);

      const zonaActivacion = 9.0;
      const zonaReseteo = 12.0;

      if (distanciaAlGrito < zonaActivacion) {
        if (!gritoReproducido) {
          audioGrito.context
            .resume()
            .then(() => {
              if (audioGrito.isPlaying) audioGrito.stop();
              audioGrito.play();
              gritoReproducido = true;

              if (audioAmbiente && audioAmbiente.isPlaying)
                audioAmbiente.setVolume(0.05);
            })
            .catch((e) => {
              console.error(
                "Error al reanudar el contexto de audio para el grito:",
                e
              );
            });
        }
      } else if (distanciaAlGrito > zonaReseteo) {
        gritoReproducido = false;
        if (audioAmbiente && audioAmbiente.isPlaying)
          audioAmbiente.setVolume(0.5);
      }
    }
  }

  // --- ACTUALIZAR MIXER GENERAL ---
  if (mixer) {
    mixer.update(delta);
  }

  // --- RENDERIZAR ESCENA CÁMARA ---
  renderizador.render(escena, camara);
}
animar();