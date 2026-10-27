const NOMBRES_TIPO = ["A", "B", "C"];

export class VistaTablero {
  #tablero;
  #controlDimension;
  #controlTamano;
  #controlesForma;
  #controlesColor;
  #muestras;
  #movimientos;
  #tamanoTablero;
  #estado;
  #panelAyuda;
  #capaModal;
  #botonAyuda;
  #notificacion;
  #temporizadorNotificacion;

  constructor() {
    this.#tablero = this.#buscarObligatorio("[data-board]");
    this.#controlDimension = this.#buscarObligatorio('[data-control="dimension"]');
    this.#controlTamano = this.#buscarObligatorio('[data-control="size"]');
    this.#controlesForma = [...document.querySelectorAll("[data-shape-control]")];
    this.#controlesColor = [...document.querySelectorAll("[data-color-control]")];
    this.#muestras = [...document.querySelectorAll("[data-piece-sample]")];
    this.#movimientos = this.#buscarObligatorio("[data-moves]");
    this.#tamanoTablero = this.#buscarObligatorio("[data-board-size]");
    this.#estado = this.#buscarObligatorio("[data-status]");
    this.#panelAyuda = this.#buscarObligatorio("[data-help-panel]");
    this.#capaModal = this.#buscarObligatorio("[data-overlay]");
    this.#botonAyuda = this.#buscarObligatorio('[data-action="toggle-help"]');
    this.#notificacion = this.#buscarObligatorio("[data-toast]");
    this.#temporizadorNotificacion = null;
  }

  vincularEventos(controlador) {
    this.#buscarObligatorio("[data-controls]").addEventListener("submit", (evento) => {
      evento.preventDefault();
      controlador.cambiarDimension(this.#controlDimension.value);
    });

    this.#buscarObligatorio('[data-action="new-game"]').addEventListener(
      "click",
      controlador.nuevaPartida,
    );

    this.#controlDimension.addEventListener("change", (evento) => {
      controlador.cambiarDimension(evento.target.value);
    });

    this.#controlTamano.addEventListener("change", (evento) => {
      controlador.cambiarTamano(evento.target.value);
    });

    this.#controlesForma.forEach((control) => {
      control.addEventListener("change", (evento) => {
        controlador.cambiarApariencia(
          Number.parseInt(evento.target.dataset.shapeControl, 10),
          "shape",
          evento.target.value,
        );
      });
    });

    this.#controlesColor.forEach((control) => {
      control.addEventListener("change", (evento) => {
        controlador.cambiarApariencia(
          Number.parseInt(evento.target.dataset.colorControl, 10),
          "color",
          evento.target.value,
        );
      });
    });

    this.#tablero.addEventListener("dragstart", controlador.iniciarArrastre);
    this.#tablero.addEventListener("dragover", controlador.sobrevolarDestino);
    this.#tablero.addEventListener("drop", controlador.soltarFicha);
    this.#tablero.addEventListener("dragend", controlador.finalizarArrastre);
    this.#tablero.addEventListener("click", controlador.seleccionarFicha);

    this.#botonAyuda.addEventListener("click", controlador.alternarAyuda);
    this.#buscarObligatorio('[data-action="close-help"]').addEventListener(
      "click",
      controlador.cerrarAyuda,
    );
    this.#capaModal.addEventListener("click", controlador.cerrarAyuda);

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") {
        controlador.cerrarAyuda();
      }
    });
  }

  representar(estado) {
    this.#sincronizarControles(estado);
    this.#actualizarInformacion(estado);
    this.#dibujarTablero(estado);
  }

  obtenerIndiceDesdeElemento(elemento) {
    if (!(elemento instanceof Element)) {
      return null;
    }

    const elementoConIndice = elemento.closest("[data-index]");

    if (!elementoConIndice || !this.#tablero.contains(elementoConIndice)) {
      return null;
    }

    const indice = Number.parseInt(elementoConIndice.dataset.index, 10);
    return Number.isInteger(indice) ? indice : null;
  }

  marcarArrastre(indice) {
    this.limpiarIndicadoresArrastre();
    const ficha = this.#tablero.querySelector(`[data-piece][data-index="${indice}"]`);

    if (ficha) {
      ficha.dataset.dragging = "true";
    }
  }

  marcarDestino(indice) {
    this.#tablero.querySelectorAll('[data-drop-target="true"]').forEach((celda) => {
      delete celda.dataset.dropTarget;
    });

    const celda = this.#tablero.querySelector(`[data-cell][data-index="${indice}"]`);

    if (celda) {
      celda.dataset.dropTarget = "true";
    }
  }

  limpiarIndicadoresArrastre() {
    this.#tablero.querySelectorAll('[data-dragging="true"]').forEach((ficha) => {
      delete ficha.dataset.dragging;
    });

    this.#tablero.querySelectorAll('[data-drop-target="true"]').forEach((celda) => {
      delete celda.dataset.dropTarget;
    });
  }

  marcarSeleccion(indice) {
    this.#tablero.querySelectorAll('[data-selected="true"]').forEach((ficha) => {
      delete ficha.dataset.selected;
      ficha.setAttribute("aria-pressed", "false");
    });

    if (indice === null) {
      return;
    }

    const ficha = this.#tablero.querySelector(`[data-piece][data-index="${indice}"]`);

    if (ficha) {
      ficha.dataset.selected = "true";
      ficha.setAttribute("aria-pressed", "true");
    }
  }

  enfocarFicha(indice) {
    const ficha = this.#tablero.querySelector(`[data-piece][data-index="${indice}"]`);
    ficha?.focus();
  }

  establecerAyuda(abierta) {
    this.#panelAyuda.hidden = !abierta;
    this.#capaModal.hidden = !abierta;
    this.#botonAyuda.setAttribute("aria-expanded", String(abierta));
    document.body.style.overflow = abierta ? "hidden" : "";

    if (abierta) {
      this.#panelAyuda.querySelector("button")?.focus();
    } else {
      this.#botonAyuda.focus();
    }
  }

  estaAyudaAbierta() {
    return !this.#panelAyuda.hidden;
  }

  mostrarNotificacion(mensaje, tipo = "info") {
    window.clearTimeout(this.#temporizadorNotificacion);
    this.#notificacion.textContent = mensaje;
    this.#notificacion.dataset.type = tipo;
    this.#notificacion.hidden = false;

    this.#temporizadorNotificacion = window.setTimeout(() => {
      this.#notificacion.hidden = true;
    }, 2600);
  }

  #dibujarTablero(estado) {
    const fragmento = document.createDocumentFragment();
    this.#tablero.replaceChildren();
    this.#tablero.style.setProperty("--dimension", estado.dimension);
    this.#tablero.dataset.size = estado.size;
    this.#tablero.dataset.completed = String(estado.completed);
    this.#tablero.setAttribute("aria-rowcount", String(estado.dimension));
    this.#tablero.setAttribute("aria-colcount", String(estado.dimension));

    estado.board.forEach((tipo, indice) => {
      const fila = Math.floor(indice / estado.dimension) + 1;
      const columna = (indice % estado.dimension) + 1;
      const apariencia = estado.appearances[tipo];

      const celda = document.createElement("div");
      celda.className = "celda";
      celda.dataset.cell = "";
      celda.dataset.index = String(indice);
      celda.setAttribute("role", "gridcell");
      celda.setAttribute("aria-rowindex", String(fila));
      celda.setAttribute("aria-colindex", String(columna));

      const ficha = document.createElement("button");
      ficha.className = "ficha";
      ficha.type = "button";
      ficha.draggable = !estado.completed;
      ficha.dataset.piece = "";
      ficha.dataset.index = String(indice);
      ficha.dataset.type = String(tipo);
      ficha.dataset.shape = apariencia.shape;
      ficha.style.setProperty("--color-ficha", apariencia.color);
      ficha.setAttribute("aria-pressed", "false");
      ficha.setAttribute(
        "aria-label",
        `Ficha tipo ${NOMBRES_TIPO[tipo]}, fila ${fila}, columna ${columna}`,
      );

      celda.append(ficha);
      fragmento.append(celda);
    });

    this.#tablero.append(fragmento);
  }

  #sincronizarControles(estado) {
    this.#controlDimension.value = String(estado.dimension);
    this.#controlTamano.value = estado.size;

    estado.appearances.forEach((apariencia, tipo) => {
      const forma = this.#controlesForma.find(
        (control) => Number.parseInt(control.dataset.shapeControl, 10) === tipo,
      );
      const color = this.#controlesColor.find(
        (control) => Number.parseInt(control.dataset.colorControl, 10) === tipo,
      );
      const muestra = this.#muestras.find(
        (elemento) => Number.parseInt(elemento.dataset.pieceSample, 10) === tipo,
      );

      if (forma) {
        forma.value = apariencia.shape;
      }

      if (color) {
        color.value = apariencia.color;
      }

      if (muestra) {
        muestra.dataset.shape = apariencia.shape;
        muestra.style.setProperty("--color-ficha", apariencia.color);
      }
    });
  }

  #actualizarInformacion(estado) {
    this.#movimientos.textContent = String(estado.moves);
    this.#tamanoTablero.textContent = `${estado.dimension} × ${estado.dimension}`;
    this.#estado.textContent = estado.completed ? "¡Tablero completado!" : "Partida en curso";
    this.#estado.dataset.completed = String(estado.completed);
  }

  #buscarObligatorio(selector) {
    const elemento = document.querySelector(selector);

    if (!elemento) {
      throw new Error(`No se ha encontrado el elemento obligatorio: ${selector}`);
    }

    return elemento;
  }
}
