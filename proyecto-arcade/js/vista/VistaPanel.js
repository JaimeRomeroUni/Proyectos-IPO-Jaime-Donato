import { ESTADOS } from "../modelo/ModeloJuego.js";

/**
 * Vista de los elementos HTML: marcador, botones, aviso sobre el tablero,
 * formulario de ajustes y diálogo de ayuda. Los elementos se seleccionan
 * mediante atributos data-*.
 */

const TEXTO_BOTON_JUGAR = {
  [ESTADOS.INICIO]: "Jugar",
  [ESTADOS.JUGANDO]: "Jugar",
  [ESTADOS.PAUSA]: "Reanudar",
  [ESTADOS.FIN]: "Jugar de nuevo",
};

export class VistaPanel {
  #valores = new Map(); // último valor pintado de cada indicador

  constructor(raiz = document) {
    const $ = (selector) => raiz.querySelector(selector);

    this.marcador = {
      puntos: $('[data-marcador="puntos"]'),
      lineas: $('[data-marcador="lineas"]'),
      nivel: $('[data-marcador="nivel"]'),
      record: $('[data-marcador="record"]'),
      restantes: $('[data-marcador="restantes"]'),
      progreso: $('[data-marcador="progreso"]'),
    };

    this.botones = {
      jugar: $('[data-accion="jugar"]'),
      pausar: $('[data-accion="pausar"]'),
      finalizar: $('[data-accion="finalizar"]'),
    };

    this.escenario = $("[data-escenario]");
    this.aviso = $("[data-aviso]");
    this.avisoTitulo = $("[data-aviso-titulo]");
    this.avisoTexto = $("[data-aviso-texto]");

    this.formulario = $("[data-ajustes]");
    this.grupoAjustesInicio = $("[data-ajustes-inicio]");
    this.dialogoAyuda = $('[data-dialogo="ayuda"]');
  }

  /* ---------- Vinculación de eventos (los manejadores los aporta el controlador) ---------- */

  alPulsarAccion(manejador) {
    document.addEventListener("click", (evento) => {
      const boton = evento.target.closest("[data-accion]");
      if (boton && !boton.disabled) manejador(boton.dataset.accion);
    });
  }

  alCambiarAjustes(manejador) {
    this.formulario.addEventListener("change", manejador);
    this.formulario.addEventListener("submit", (evento) => evento.preventDefault());
  }

  /* ---------- Lectura ---------- */

  leerAjustes() {
    const campos = this.formulario.elements;
    return {
      nivelInicial: Number(campos.nivelInicial.value),
      columnas: Number(campos.columnas.value),
      sombra: campos.sombra.checked,
      particulas: campos.particulas.checked,
    };
  }

  get ayudaAbierta() {
    return this.dialogoAyuda.open;
  }

  /* ---------- Pintado ---------- */

  actualizarMarcador(modelo) {
    const formato = (n) => n.toLocaleString("es-ES");
    this.#pintar("puntos", formato(modelo.puntos));
    this.#pintar("lineas", formato(modelo.lineas));
    this.#pintar("nivel", String(modelo.nivel));
    this.#pintar("record", formato(modelo.record));
    this.#pintar("restantes", String(modelo.lineasParaSubir));

    const avance = modelo.lineasPorNivel - modelo.lineasParaSubir;
    if (this.#valores.get("progreso") !== avance) {
      this.#valores.set("progreso", avance);
      this.marcador.progreso.max = modelo.lineasPorNivel;
      this.marcador.progreso.value = avance;
    }
  }

  actualizarEstado(modelo) {
    const { estado } = modelo;

    this.escenario.dataset.estado = estado;
    this.botones.jugar.textContent = TEXTO_BOTON_JUGAR[estado];
    this.botones.jugar.disabled = estado === ESTADOS.JUGANDO;
    this.botones.pausar.disabled = estado !== ESTADOS.JUGANDO;
    this.botones.finalizar.disabled = !modelo.enPartida;
    this.grupoAjustesInicio.disabled = modelo.enPartida;

    this.#mostrarAviso(modelo);
  }

  abrirAyuda() {
    if (!this.dialogoAyuda.open) this.dialogoAyuda.showModal();
  }

  cerrarAyuda() {
    this.dialogoAyuda.close();
  }

  /** Quita el foco de los botones para que Espacio/Enter no los pulsen durante el juego. */
  liberarFoco() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }

  #mostrarAviso(modelo) {
    const mensajes = {
      [ESTADOS.INICIO]: ["Caída Libre", "Pulsa <kbd>Enter</kbd> o «Jugar» para empezar"],
      [ESTADOS.PAUSA]: ["Pausa", "Pulsa <kbd>P</kbd> o «Reanudar» para continuar"],
      [ESTADOS.FIN]: [
        modelo.nuevoRecord ? "¡Nuevo récord!" : "Fin de la partida",
        `${modelo.puntos.toLocaleString("es-ES")} puntos · ${modelo.lineas} líneas<br>` +
          "Pulsa <kbd>Enter</kbd> para jugar de nuevo",
      ],
    };

    const mensaje = mensajes[modelo.estado];
    this.aviso.hidden = !mensaje;
    if (!mensaje) return;

    this.avisoTitulo.textContent = mensaje[0];
    this.avisoTexto.innerHTML = mensaje[1]; // texto propio, sin datos del usuario
  }

  #pintar(clave, valor) {
    if (this.#valores.get(clave) === valor) return;
    this.#valores.set(clave, valor);
    this.marcador[clave].textContent = valor;
  }
}
