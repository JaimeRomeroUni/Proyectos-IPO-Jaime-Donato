import { Pieza } from "../modelo/Pieza.js";

/**
 * Vista del lienzo: dibuja el tablero, la pieza, su sombra, las partículas y
 * la siguiente pieza con la Canvas API. Solo lee el modelo, nunca lo modifica.
 *
 * Los colores se leen de las variables CSS (css/cromatico.css) para que todo
 * el diseño cromático quede definido en un único sitio.
 */

const CELDA = 32;           // px lógicos por celda en el tablero
const CELDA_SIGUIENTE = 24; // px lógicos por celda en la vista previa
const CELDAS_SIGUIENTE = 5; // la vista previa es un cuadrado de 5 × 5 celdas

export class VistaLienzo {
  #ctx;
  #ctxSiguiente;
  #colores;
  #columnas = 0;
  #filas = 0;

  constructor(lienzo, lienzoSiguiente) {
    this.lienzo = lienzo;
    this.lienzoSiguiente = lienzoSiguiente;
    this.#ctx = lienzo.getContext("2d");
    this.#ctxSiguiente = lienzoSiguiente.getContext("2d");
    this.#colores = leerColores();

    const ladoSiguiente = CELDAS_SIGUIENTE * CELDA_SIGUIENTE;
    prepararLienzo(this.lienzoSiguiente, this.#ctxSiguiente, ladoSiguiente, ladoSiguiente);
  }

  /** Ciclo limpiar-pintar: se llama una vez por fotograma desde el bucle. */
  dibujar(modelo) {
    if (modelo.columnas !== this.#columnas || modelo.filas !== this.#filas) {
      this.#columnas = modelo.columnas;
      this.#filas = modelo.filas;
      prepararLienzo(this.lienzo, this.#ctx, this.#columnas * CELDA, this.#filas * CELDA);
    }

    this.#dibujarFondo();
    this.#dibujarCeldas(modelo.tablero);

    if (modelo.pieza) {
      if (modelo.ajustes.sombra) this.#dibujarSombra(modelo.pieza, modelo.posicionSombra());
      this.#dibujarPieza(modelo.pieza);
    }

    this.#dibujarParticulas(modelo.particulas);
    this.#dibujarSiguiente(modelo.siguiente);
  }

  #dibujarFondo() {
    const ctx = this.#ctx;
    const ancho = this.#columnas * CELDA;
    const alto = this.#filas * CELDA;

    ctx.fillStyle = this.#colores.fondo;
    ctx.fillRect(0, 0, ancho, alto);

    // Rejilla mediante un único camino
    ctx.beginPath();
    for (let c = 1; c < this.#columnas; c++) {
      ctx.moveTo(c * CELDA + 0.5, 0);
      ctx.lineTo(c * CELDA + 0.5, alto);
    }
    for (let f = 1; f < this.#filas; f++) {
      ctx.moveTo(0, f * CELDA + 0.5);
      ctx.lineTo(ancho, f * CELDA + 0.5);
    }
    ctx.strokeStyle = this.#colores.rejilla;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  #dibujarCeldas(tablero) {
    tablero.celdas.forEach((fila, f) => {
      fila.forEach((tipo, c) => {
        if (tipo) this.#dibujarBloque(this.#ctx, c * CELDA, f * CELDA, CELDA, tipo);
      });
    });
  }

  #dibujarPieza(pieza) {
    for (const bloque of Pieza.bloques(pieza.forma)) {
      const x = (pieza.columna + bloque.columna) * CELDA;
      const y = (pieza.y + bloque.fila) * CELDA; // posición continua: caída suave
      this.#dibujarBloque(this.#ctx, x, y, CELDA, pieza.tipo);
    }
  }

  #dibujarSombra(pieza, filaSombra) {
    const ctx = this.#ctx;
    ctx.strokeStyle = this.#colores.piezas[pieza.tipo];
    ctx.fillStyle = this.#colores.sombra;
    ctx.lineWidth = 2;

    for (const bloque of Pieza.bloques(pieza.forma)) {
      const x = (pieza.columna + bloque.columna) * CELDA;
      const y = (filaSombra + bloque.fila) * CELDA;
      ctx.fillRect(x + 2, y + 2, CELDA - 4, CELDA - 4);
      ctx.strokeRect(x + 3, y + 3, CELDA - 6, CELDA - 6);
    }
  }

  #dibujarParticulas(particulas) {
    const ctx = this.#ctx;
    for (const particula of particulas) {
      const lado = particula.tamano * CELDA;
      ctx.globalAlpha = particula.opacidad;
      ctx.fillStyle = this.#colores.piezas[particula.tipo];
      ctx.fillRect(particula.x * CELDA - lado / 2, particula.y * CELDA - lado / 2, lado, lado);
    }
    ctx.globalAlpha = 1;
  }

  #dibujarSiguiente(pieza) {
    const ctx = this.#ctxSiguiente;
    const lado = CELDAS_SIGUIENTE * CELDA_SIGUIENTE;
    ctx.clearRect(0, 0, lado, lado);
    if (!pieza) return;

    // Centrado según las celdas realmente ocupadas
    const bloques = [...Pieza.bloques(pieza.forma)];
    const columnas = bloques.map((b) => b.columna);
    const filas = bloques.map((b) => b.fila);
    const minC = Math.min(...columnas);
    const minF = Math.min(...filas);
    const ancho = (Math.max(...columnas) - minC + 1) * CELDA_SIGUIENTE;
    const alto = (Math.max(...filas) - minF + 1) * CELDA_SIGUIENTE;
    const origenX = (lado - ancho) / 2;
    const origenY = (lado - alto) / 2;

    for (const b of bloques) {
      const x = origenX + (b.columna - minC) * CELDA_SIGUIENTE;
      const y = origenY + (b.fila - minF) * CELDA_SIGUIENTE;
      this.#dibujarBloque(ctx, x, y, CELDA_SIGUIENTE, pieza.tipo);
    }
  }

  /** Bloque con relieve: cuerpo, brillo superior y sombra inferior. */
  #dibujarBloque(ctx, x, y, lado, tipo) {
    const relieve = Math.max(2, lado * 0.14);

    ctx.fillStyle = this.#colores.piezas[tipo];
    ctx.fillRect(x + 1, y + 1, lado - 2, lado - 2);

    ctx.fillStyle = this.#colores.brillo;
    ctx.fillRect(x + 1, y + 1, lado - 2, relieve);

    ctx.fillStyle = this.#colores.oscuro;
    ctx.fillRect(x + 1, y + lado - 1 - relieve, lado - 2, relieve);
  }
}

/** Ajusta la resolución interna a la densidad de píxeles de la pantalla. */
function prepararLienzo(lienzo, ctx, ancho, alto) {
  const densidad = window.devicePixelRatio || 1;
  lienzo.width = Math.round(ancho * densidad);
  lienzo.height = Math.round(alto * densidad);
  ctx.setTransform(densidad, 0, 0, densidad, 0, 0);
}

function leerColores() {
  const estilos = getComputedStyle(document.documentElement);
  const leer = (nombre) => estilos.getPropertyValue(nombre).trim();

  return {
    fondo: leer("--lienzo-fondo"),
    rejilla: leer("--lienzo-rejilla"),
    sombra: leer("--lienzo-sombra"),
    brillo: leer("--bloque-brillo"),
    oscuro: leer("--bloque-oscuro"),
    piezas: {
      I: leer("--pieza-i"),
      O: leer("--pieza-o"),
      T: leer("--pieza-t"),
      S: leer("--pieza-s"),
      Z: leer("--pieza-z"),
      J: leer("--pieza-j"),
      L: leer("--pieza-l"),
    },
  };
}
