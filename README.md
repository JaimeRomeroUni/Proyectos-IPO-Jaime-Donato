# Proyectos de laboratorio · Interacción Persona-Ordenador

Repositorio con los proyectos de laboratorio de la asignatura **Interacción Persona-Ordenador (IPO)**, 4.º curso del Grado en Ingeniería Informática – Tecnologías Informáticas, Universidad de Sevilla.

## Autores

- Jaime Romero
- Donato Julian Trigueros

## Proyectos

| Proyecto | Aplicación | Contenido principal |
| --- | --- | --- |
| [`proyecto-sonetos`](./proyecto-sonetos) | Lector de Sonetos | Diseño cromático y tipográfico |
| [`proyecto-tablero`](./proyecto-tablero) | Tríada · juego de fichas | Flexbox, Grid y API Drag & Drop |
| [`proyecto-arcade`](./proyecto-arcade) | Caída Libre · Tetris | Canvas API, animación y física |

Cada carpeta tiene su propio `README.md` con el enunciado completo.

### Lector de Sonetos (`proyecto-sonetos`)

Aplicación web para leer sonetos del Siglo de Oro. El usuario elige un soneto en un selector y la aplicación muestra su título, su autor y sus versos organizados en dos cuartetos y dos tercetos.

- **Sonetos incluidos:** Garcilaso de la Vega, Lope de Vega, Góngora y Quevedo (dos), guardados en la carpeta `poemas/`.
- **Diseño cromático:** monocromático, parametrizado en HSL con variables CSS.
- **Diseño tipográfico:** dos fuentes contrastadas: sans-serif para la interfaz, título y autor, y serif para los versos.
- **Organización:** `index.html`, `css/` (cromático, tipográfico y espacial) y `js/`.

### Tríada · juego de fichas (`proyecto-tablero`)

Juego de tablero NxN (N ≥ 3) con tres tipos de fichas distinguibles por forma y color. El jugador intercambia fichas arrastrándolas hasta que cada fila contiene fichas de un solo tipo.

- **Interacción:** API Drag & Drop y `dataTransfer` para mover las fichas.
- **Opciones:** nueva partida, tamaño del tablero, tamaño de las fichas (pequeña, mediana, grande), aspecto de las fichas y ayuda.
- **Composición:** Flexbox y Grid; selección de elementos desde JS con atributos `data-*`; posicionamiento para la asistencia al usuario.
- **Diseño cromático:** complementario, parametrizado en HSL con `calc()`.
- **Arquitectura:** MVC (`js/modelo`, `js/vista`, `js/controlador`).

### Caída Libre · Tetris (`proyecto-arcade`)

Tetris dibujado íntegramente con la Canvas API y con física: las piezas caen aceleradas por la gravedad hasta una velocidad máxima que aumenta con el nivel, y los bloques de las líneas completadas estallan en partículas que rebotan.

- **Bucle principal:** `requestAnimationFrame` con actualización por tiempo transcurrido.
- **Componentes del juego:** detección de colisiones, giro junto a la pared, sombra de caída y generador de piezas con «bolsa de 7».
- **Controles:** comenzar, pausar y finalizar la partida; ayuda en un `<dialog>`; ajustes de nivel inicial, ancho del tablero, sombra y partículas.
- **Indicador de progreso:** puntos, líneas, nivel, récord (guardado en `localStorage`) y siguiente pieza.
- **Diseño:** cromático complementario (índigo y ámbar), tipográfico con dos fuentes contrastadas (monoespaciada y sans-serif) y espacial con Grid y Flexbox.
- **Arquitectura:** MVC (`js/modelo`, `js/vista`, `js/controlador`).

## Tecnologías

HTML, CSS y JavaScript nativos, sin bibliotecas ni frameworks. Los estilos de cada proyecto están separados por aspecto (`cromatico.css`, `tipografico.css`, `espacial.css` y, cuando procede, `interaccion.css`).

## Cómo ejecutarlos

Los proyectos `proyecto-tablero` y `proyecto-arcade` usan módulos de JavaScript (`type="module"`), que el navegador bloquea si se abre el HTML directamente desde el disco. Hay que servirlos con un servidor local, por ejemplo:

- La extensión **Live Server** de VS Code: clic derecho sobre `index.html` → *Open with Live Server*.
- O desde la carpeta del proyecto: `python -m http.server` y abrir `http://localhost:8000`.
