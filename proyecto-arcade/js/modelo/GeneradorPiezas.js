import { TIPOS } from "./Pieza.js";

export class GeneradorPiezas {
  #bolsa = [];

  siguiente() {
    if (this.#bolsa.length === 0) this.#bolsa = barajar([...TIPOS]);
    return this.#bolsa.pop();
  }
}

/** Barajado de Fisher-Yates. */
function barajar(lista) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}
