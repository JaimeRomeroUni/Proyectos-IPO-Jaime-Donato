import { Pieza } from "./Pieza.js";

export class Tablero {
  constructor(columnas, filas) {
    this.columnas = columnas;
    this.filas = filas;
    this.celdas = Array.from({ length: filas }, () => this.#filaVacia());
  }

  #filaVacia() {
    return Array(this.columnas).fill(null);
  }

  colisiona(forma, columna, fila) {
    for (const bloque of Pieza.bloques(forma)) {
      const x = columna + bloque.columna;
      const y = fila + bloque.fila;

      if (x < 0 || x >= this.columnas || y >= this.filas) return true;
      if (y >= 0 && this.celdas[y][x] !== null) return true;
    }
    return false;
  }

  posicionValida(forma, columna, y) {
    const base = Math.floor(y);
    if (this.colisiona(forma, columna, base)) return false;
    return y === base || !this.colisiona(forma, columna, base + 1);
  }

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
