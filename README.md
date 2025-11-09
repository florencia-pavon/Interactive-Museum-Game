# 🖼️ Museo Inmersivo 3D

Proyecto interactivo desarrollado con **Three.js**, que invita al usuario a recorrer un museo virtual lleno de obras animadas, efectos de sonido y un entorno artístico inmersivo.  
El objetivo es ofrecer una experiencia sensorial donde la exploración y la creatividad sean protagonistas.

---

## 🎮 Experiencia del usuario

El jugador controla a **Amanita Muscaria**, una *honguita humanizada* que explora libremente las salas del museo.  
A medida que se desplaza, activa diferentes obras que reaccionan mediante **movimiento, luz o sonido**, generando una experiencia envolvente.

---

## 🕹️ Controles

| Acción | Tecla / Comando |
|--------|------------------|
| Mover hacia adelante | W |
| Mover hacia atrás | S |
| Girar a la izquierda | A |
| Girar a la derecha | D |
| Activar / desactivar modo dibujo | G |
| Mover cámara / mirar alrededor | Mouse |

---

## 🧱 Tipos de obras en el museo

El museo cuenta con dos tipos principales de obras interactivas:

### 🗿 Obras fijas con colisión
Son piezas estáticas que forman parte de la estructura principal del museo y **tienen colisión**, es decir, el jugador no puede atravesarlas.  
Entre ellas se encuentran:
- **Televisores:** dispuestos en la sala técnica, representan la saturación de imágenes y tecnología.  
- **Estatua de la Libertad:** figura central que simboliza la libertad creativa y la observación.

### ✨ Obras con efectos dinámicos
Estas obras se activan cuando el jugador se aproxima y reaccionan con animaciones o sonidos envolventes:
- **Cuadro del Engranaje:** muestra un movimiento mecánico continuo al acercarse.  
- **Cuadro Garden:** despliega animaciones orgánicas y efectos visuales naturales.  
- **Cuadro del Grito:** reproduce un potente efecto sonoro y modifica el ambiente auditivo temporalmente.  

Cada obra fue diseñada con su propia identidad visual y sensorial, utilizando **AnimationMixer** y **Web Audio API** para coordinar movimiento y sonido en tiempo real.

---

## 📁 Estructura del proyecto
📦 museo-inmersivo  
├── 📁 assets  
│   ├── 📁 models  
│   │   ├── cuadro_televisores/scene.gltf  
│   │   ├── cuadro_garden/scene.gltf  
│   │   ├── cuadro_grito/scene.gltf  
│   │   ├── engranaje/scene.gltf  
│   │   ├── estatua_libertad/scene.gltf  
│   │   ├── lamparas.glb  
│   │   └── valla/scene.gltf  
│   ├── 📁 audio  
│   │   ├── ambiente.mp3  
│   │   └── grito.mp3  
│   └── 📁 textures  
│       └── ...  
│
├── 📁 js  
│   ├── main.js                  # Script principal del museo  
│   ├── controles.js             # Lógica de movimiento y cámara  
│   ├── lienzo.js                # Modo dibujo (tecla G)  
│   ├── animaciones.js           # Control de animaciones de obras  
│   └── colisiones.js            # Manejo de colisiones con obras fijas  
│
├── index.html                   # Punto de entrada del proyecto  
├── style.css                    # Estilos visuales  
└── README.md                    # Documentación del proyecto  



---

## 🚀 Ejecución del proyecto

1. Clonar o descargar este repositorio.  
2. Abrir la carpeta del proyecto en **Visual Studio Code**.  
3. Instalar la extensión **Live Server** (si no está instalada).  
4. Abrir el archivo principal `index.html`.  
5. Hacer clic en **"Go Live"** para ejecutar el proyecto localmente.  
6. Navegar por el museo utilizando los controles del teclado y mouse.

---

## 🧠 Tecnologías utilizadas

- **Three.js** → renderizado 3D en tiempo real.  
- **GLTFLoader** → carga de modelos y animaciones 3D.  
- **Web Audio API** → efectos de sonido y ambiente sonoro.  
- **JavaScript (ES6)** → lógica interactiva y control de animaciones.  
- **HTML5 / CSS3** → estructura y estilos de la interfaz.  

---

## 📸 Galería del proyecto

<img width="1366" height="635" alt="image" src="https://github.com/user-attachments/assets/f8d04fdf-47c8-4a4e-88d1-33ee8cf5aa89" />


---

## 📄 Documento de sistematización del proceso creativo

> *https://docs.google.com/document/d/194Zq6EpGe_HITr-96vr5aNOPSg0yNPlx8tWhhr18GMs/edit?usp=sharing*

---

## 👩‍💻 Autores

- **Accietto Bertinatti, Daiana Micaela**  
- **Escudero Garay, Candela**  
- **Cocimano, Federico José**  
- **Pavón, Florencia**

