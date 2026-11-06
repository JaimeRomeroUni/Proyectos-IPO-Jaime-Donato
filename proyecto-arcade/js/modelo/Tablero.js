import { Pieza } from "./Pieza.js";

/**
 * Tablero: matriz de filas × columnas. Cada celda guarda el tipo de pieza que
 * la ocupa o `null` si está libre. Se encarga de la detección de colisiones.
 */
export class Tablero {
  constructor(columnas, filas) {
    this.columnas = columnas;
    this.filas = filas;
    this.celdas = Array.from({ length: filas }, () => this.#filaVacia());
  }

  #filaVacia() {
    return Array(this.columnas).fill(null);
  }

  /**
   * ¿Choca una forma colocada en una fila entera?
   * Las filas por encima del tablero (negativas) se consideran libres.
   */
  colisiona(forma, columna, fila) {
    for (const bloque of Pieza.bloques(forma)) {
      const x = columna + bloque.columna;
      const y = fila + bloque.fila;

      if (x < 0 || x >= this.columnas || y >= this.filas) return true;
      if (y >= 0 && this.celdas[y][x] !== null) return true;
    }
    return false;
  }

  /**
   * Comprobación para una posición vertical continua: si `y` no es entera,
   * la pieza ocupa a la vez parte de dos filas y ambas deben estar libres.
   */
  posicionValida(forma, columna, y) {
    const base = Math.floor(y);
    if (this.colisiona(forma, columna, base)) return false;
    return y === base || !this.colisiona(forma, columna, base + 1);
  }

  /**
   * Fija la pieza en el tablero.
   * @returns {boolean} false si algún bloque queda por encima del tablero
   */
  fijar(pieza) {
    const filaBase = Math.round(pieza.y);
    let cabe = true;

    for (const bloque of Pieza.bloques(pieza.forma)) {
      const fila = filaBase + bloque.fila;
      if (fila < 0) {
        cabe = false;
      } else {
        this.celdas[fila][pieza.columna + bloque.columna] = pieza.tipo;
      }
    }
    return cabe;
  }

  /**
   * Elimina las filas completas y desplaza hacia abajo las superiores.
   * @returns {{fila:number, tipos:string[]}[]} filas eliminadas (para las partículas)
   */
  eliminarLineasCompletas() {
    const eliminadas = [];
    const restantes = [];

    this.celdas.forEach((fila, indice) => {
      if (fila.every((celda) => celda !== null)) {
        eliminadas.push({ fila: indice, tipos: [...fila] });
      } else {
        restantes.push(fila);
      }
    });

    while (restantes.length < this.filas) restantes.unshift(this.#filaVacia());
    this.celdas = restantes;
    return eliminadas;
  }
}
