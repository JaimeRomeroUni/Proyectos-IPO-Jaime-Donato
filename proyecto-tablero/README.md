# Proyecto Tablero - Tríada

Aplicación web desarrollada únicamente con HTML, CSS y JavaScript nativos. El
objetivo consiste en intercambiar fichas hasta conseguir que cada fila del
tablero contenga fichas de un mismo tipo.

## Ejecución

Al utilizar módulos JavaScript, la aplicación debe abrirse mediante un servidor
local. Las dos opciones más sencillas son:

1. Abrir la carpeta en Visual Studio Code y ejecutar `index.html` con Live Server.
2. Abrir una terminal dentro de la carpeta y ejecutar:

   ```bash
   python -m http.server 8000
   ```

   Después, visitar `http://localhost:8000`.

## Funcionalidades

- Partidas con tableros cuadrados de dimensión N × N, con N mayor o igual que 3.
- Tres tipos de fichas distinguibles por su forma y/o color.
- Intercambio de fichas mediante Drag & Drop y `dataTransfer`.
- Alternativa accesible de intercambio seleccionando dos fichas.
- Tres tamaños de ficha: pequeño, mediano y grande.
- Personalización de la forma y del color de cada tipo.
- Nueva partida automática al modificar cualquier configuración.
- Detección automática del final de la partida.
- Panel de ayuda y mensajes de estado.
- Diseño adaptable a distintos tamaños de pantalla.

## Garantía de que existe solución

Para que todas las filas puedan terminar siendo homogéneas, el número de fichas
de cada tipo debe ser múltiplo de N. El modelo asigna al menos una fila completa
a cada uno de los tres tipos, reparte las filas restantes y, finalmente, mezcla
las fichas con el algoritmo de Fisher-Yates.

Por ejemplo, para N = 4 se puede generar esta distribución:

- Tipo A: 4 fichas.
- Tipo B: 4 fichas.
- Tipo C: 8 fichas.

Por tanto, siempre podrán construirse una fila A, una fila B y dos filas C.

## Arquitectura MVC

### Modelo

`js/modelo/ModeloTablero.js`

Mantiene el estado y contiene todas las reglas del juego: generación del tablero,
barajado, intercambio, validaciones y comprobación de victoria. No accede al DOM.

### Vista

`js/vista/VistaTablero.js`

Genera los elementos del tablero, actualiza la interfaz, sincroniza los controles
y muestra la ayuda y las notificaciones. No decide las reglas del juego.

### Controlador

`js/controlador/ControladorTablero.js`

Recibe los eventos del usuario, obtiene la información transferida mediante
`dataTransfer`, solicita cambios al modelo y ordena a la vista actualizarse.

### Punto de entrada

`js/principal.js`

Crea una instancia de cada componente y conecta la arquitectura.

## Organización de CSS

- `cromatico.css`: paleta HSL, variables, colores y sombras.
- `tipografico.css`: familias, tamaños, jerarquía y legibilidad.
- `espacial.css`: modelo de cajas, Flexbox, Grid, tamaños y posicionamiento.
- `interaccion.css`: pseudoclases, Drag & Drop, tooltip y animaciones.

## Pruebas manuales recomendadas

1. Crear varias partidas nuevas y comprobar que no empiezan resueltas.
2. Cambiar la dimensión a 3, 4, 5 y 6.
3. Cambiar entre los tres tamaños de ficha.
4. Modificar formas y colores y comprobar que aparece un tablero nuevo.
5. Intentar crear dos fichas idénticas en forma y color.
6. Arrastrar una ficha sobre otra y comprobar que se intercambian.
7. Intercambiar dos fichas mediante clic y mediante teclado.
8. Abrir y cerrar la ayuda con el botón, el fondo y la tecla Escape.
9. Reducir el ancho del navegador y comprobar el diseño adaptable.
10. Confirmar que no aparecen errores en la consola del navegador.
