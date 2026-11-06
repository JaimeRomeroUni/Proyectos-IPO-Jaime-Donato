/**
 * Pieza (tetrominó).
 *
 * La posición vertical `y` es un número real expresado en celdas: la pieza no
 * salta de fila en fila, sino que se desplaza de forma continua según su
 * velocidad `vy` (celdas/segundo), que a su vez aumenta por la gravedad.
 */

const FORMAS = Object.freeze({
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
});

export const TIPOS = Object.freeze(Object.keys(FORMAS));

export class Pieza {
  constructor(tipo) {
    this.tipo = tipo;
    this.forma = FORMAS[tipo].map((fila) => [...fila]);
    this.columna = 0;
    this.y = 0;   // posición vertical continua (celdas)
    this.vy = 0;  // velocidad vertical (celdas/s)
  }

  get tamano() {
    return this.forma.length;
  }

  /** Índice de la primera fila de la matriz que contiene algún bloque. */
  get primeraFilaOcupada() {
    return this.forma.findIndex((fila) => fila.some(Boolean));
  }

  /**
   * Devuelve la forma girada sin modificar la pieza.
   * @param {1|-1} sentido 1 = horario, -1 = antihorario
   */
  formaRotada(sentido) {
    const n = this.forma.length;
    return this.forma.map((fila, f) =>
      fila.map((_, c) => (sentido === 1 ? this.forma[n - 1 - c][f] : this.forma[c][n - 1 - f]))
    );
  }

  /** Recorre las celdas ocupadas de una forma: { fila, columna } relativas. */
  static *bloques(forma) {
    for (let f = 0; f < forma.length; f++) {
      for (let c = 0; c < forma[f].length; c++) {
        if (forma[f][c]) yield { fila: f, columna: c };
      }
    }
  }
}
