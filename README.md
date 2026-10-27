# 🖥️ Proyectos de Interacción Persona-Ordenador (IPO)

¡Bienvenido/a a mi repositorio de IPO! Este espacio funciona como un **monorepo** que alberga diferentes proyectos enfocados en el diseño centrado en el usuario (DCU), la usabilidad, la accesibilidad, la arquitectura de software y el desarrollo estructurado de interfaces.

---

## 📂 Estructura del Repositorio

El repositorio está organizado en carpetas independientes para cada proyecto:

*   **[`/proyecto-1`](./proyecto-1):** **Lector de Sonetos** — Aplicación web interactiva para la lectura de composiciones poéticas optimizada a nivel de diseño cromático, tipográfico y espacial.
*   **[`/proyecto-2`](./proyecto-2):** **Tablero Tríada** — Aplicación web de lógica y puzle con soporte Drag & Drop, diseño adaptable, personalización avanzada y alternativas accesibles de interacción.

---

## 🚀 Proyectos Incluidos

### 1. Lector de Sonetos
Aplicación web diseñada para que un usuario pueda explorar y leer cómodamente un almacén de sonetos (composiciones de 14 versos en dos cuartetos y dos tercetos), identificados por su título y autor. El enfoque principal radica en crear una experiencia de lectura digital fluida, usable y estéticamente justificada.

*   **🎯 Objetivo:** Crear una interfaz de lectura óptima controlando minuciosamente la carga visual mediante una sólida estrategia espacial, cromática y tipográfica.
*   **🛠️ Tecnologías:** HTML5 semántico, CSS3 moderno, JavaScript (Vanilla JS), Patrón de arquitectura **MVC** (*Model-View-Controller*).
*   **📊 Metodología y Fundamentos IPO Aplicados:**
    *   **Diseño Espacial y Principios Gestalt:** Organización del contenido, contenedores y unidades de medida seleccionadas para favorecer la proximidad, continuidad y simetría de las estrofas.
    *   **Estrategia Cromática:** Aplicación de una paleta armónica (monocromática, triádica o complementaria) pensada para evitar la fatiga visual durante la lectura.
    *   **Estrategia Tipográfica:** Jerarquía clara mediante fuentes contrastadas o niveles de realce que diferencien con éxito el título, el autor y el cuerpo del soneto.
    *   **Interacción y Usabilidad:** Mecanismo intuitivo de selección de poemas orientado a minimizar las acciones del usuario y guiar su navegación.
    *   **Buenas Prácticas:** Coordinación estricta de JavaScript con el **DOM** y el **CSSOM**, etiquetado semántico y selectores CSS mantenibles.

---

### 2. Tablero Tríada 
Aplicación web interactiva de puzle donde el usuario debe intercambiar fichas estratégicamente hasta conseguir que cada fila del tablero contenga fichas de un mismo tipo. El proyecto destaca por ofrecer múltiples opciones de control, adaptabilidad y una separación de estilos muy estricta.

*   **🎯 Objetivo:** Desarrollar un tablero de juego interactivo N × N altamente configurable, garantizando la usabilidad mediante mecánicas de interacción dobles (ratón y teclado) y diseño responsivo.
*   **🛠️ Tecnologías:** HTML5, CSS3 estructurado por capas, JavaScript nativo (Módulos ES6), Patrón de arquitectura **MVC**.
*   **📊 Metodología y Fundamentos IPO Aplicados:**
    *   **Interacción Avanzada y Accesibilidad:** Implementación de arrastrar y soltar mediante `dataTransfer` (Drag & Drop) junto a una alternativa accesible basada en selección por clics o teclado para usuarios con diversidad funcional.
    *   **Personalización y Control del Usuario:** Permitir configurar dinámicamente la dimensión del tablero, tres tamaños de ficha, así como las formas y los colores de los tipos de fichas con regeneración automática.
    *   **Arquitectura de Estilos Limpia:** Organización modular del CSS segregado en responsabilidades IPO claras: `cromatico.css` (paletas HSL y variables), `tipografico.css` (jerarquía y legibilidad), `espacial.css` (Flexbox/Grid y cajas) e `interaccion.css` (animaciones y pseudoclases).
    *   **Affordance y Feedback:** Inclusión de paneles de ayuda, tooltips y mensajes de estado que guían las acciones y notifican automáticamente el final de la partida.

---

## ✒️ Autor
* **Jaime Romero**
* **Donato Julián Trigueros**
