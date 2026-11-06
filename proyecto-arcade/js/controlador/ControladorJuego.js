import { ESTADOS } from "../modelo/ModeloJuego.js";

/**
 * Controlador: contiene el bucle principal del juego y traduce las acciones
 * del usuario (teclado, botones, ajustes) en operaciones sobre el modelo.
 */

const DT_MAXIMO = 1 / 20; // limita el salto de tiempo si la pestaña se congela

export class ControladorJuego {
  #ultimoInstante = null;
  #estadoPintado = null;

  constructor(modelo, vistaLienzo, vistaPanel) {
    this.modelo = modelo;
    this.vistaLienzo = vistaLienzo;
    this.vistaPanel = vistaPanel;

    // Teclas de juego → acción sobre el modelo. `repetible`: admite la autorrepetición del teclado
    this.teclasJuego = {
      ArrowLeft: { accion: () => this.modelo.mover(-1), repetible: true },
      ArrowRight: { accion: () => this.modelo.mover(1), repetible: true },
      ArrowUp: { accion: () => this.modelo.rotar(1) },
      KeyX: { accion: () => this.modelo.rotar(1) },
      KeyZ: { accion: () => this.modelo.rotar(-1) },
      ArrowDown: { accion: () => this.modelo.activarBajadaSuave(true), repetible: true },
      Space: { accion: () => this.modelo.dejarCaer() },
    };
  }

  iniciar() {
    this.vistaPanel.alPulsarAccion((accion) => this.#ejecutarAccion(accion));
    this.vistaPanel.alCambiarAjustes(() => this.#aplicarAjustes());

    window.addEventListener("keydown", (evento) => this.#teclaPulsada(evento));
    window.addEventListener("keyup", (evento) => this.#teclaSoltada(evento));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.modelo.pausar();
    });

    this.#aplicarAjustes();
    requestAnimationFrame((instante) => this.#bucle(instante));
  }

  /* ---------- Bucle principal: actualizar → limpiar y pintar ---------- */

  #bucle(instante) {
    requestAnimationFrame((siguiente) => this.#bucle(siguiente));

    const dt =
      this.#ultimoInstante === null
        ? 0
        : Math.min((instante - this.#ultimoInstante) / 1000, DT_MAXIMO);
    this.#ultimoInstante = instante;

    this.modelo.actualizar(dt);
    this.vistaLienzo.dibujar(this.modelo);
    this.vistaPanel.actualizarMarcador(this.modelo);

    if (this.modelo.estado !== this.#estadoPintado) {
      this.#estadoPintado = this.modelo.estado;
      this.vistaPanel.actualizarEstado(this.modelo);
    }
  }

  /* ---------- Acciones de los botones ---------- */

  #ejecutarAccion(accion) {
    switch (accion) {
      case "jugar":
        this.#jugarOReanudar();
        break;
      case "pausar":
        this.modelo.pausar();
        break;
      case "finalizar":
        this.modelo.finalizar();
        break;
      case "ayuda":
        this.modelo.pausar();
        this.vistaPanel.abrirAyuda();
        break;
      case "cerrar-ayuda":
        this.vistaPanel.cerrarAyuda();
        break;
    }
  }

  #jugarOReanudar() {
    if (this.modelo.estado === ESTADOS.PAUSA) {
      this.modelo.reanudar();
    } else if (!this.modelo.enPartida) {
      this.#aplicarAjustes();
      this.modelo.iniciar();
    }
    this.vistaPanel.liberarFoco();
  }

  #aplicarAjustes() {
    this.modelo.cambiarAjustes(this.vistaPanel.leerAjustes());
  }

  /* ---------- Teclado ---------- */

  #teclaPulsada(evento) {
    if (this.vistaPanel.ayudaAbierta) return; // el diálogo gestiona sus propias teclas

    const { estado } = this.modelo;
    const enControl = evento.target.closest?.("button, select, input");

    if (estado === ESTADOS.JUGANDO && evento.code in this.teclasJuego) {
      evento.preventDefault();
      const tecla = this.teclasJuego[evento.code];
      if (evento.repeat && !tecla.repetible) return;
      tecla.accion();
      return;
    }

    switch (evento.code) {
      case "KeyP":
      case "Escape":
        if (estado === ESTADOS.JUGANDO) this.modelo.pausar();
        else if (estado === ESTADOS.PAUSA) this.modelo.reanudar();
        break;
      case "Enter":
      case "NumpadEnter":
        if (enControl) return; // Enter sobre un botón ya lo pulsa
        if (estado !== ESTADOS.JUGANDO) {
          evento.preventDefault();
          this.#jugarOReanudar();
        }
        break;
      case "KeyH":
        this.#ejecutarAccion("ayuda");
        break;
    }
  }

  #teclaSoltada(evento) {
    if (evento.code === "ArrowDown") this.modelo.activarBajadaSuave(false);
  }
}
