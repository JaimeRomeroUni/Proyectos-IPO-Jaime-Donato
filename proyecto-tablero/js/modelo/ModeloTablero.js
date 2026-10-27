const TAMANOS_VALIDOS = new Set(["small", "medium", "large"]);
const FORMAS_VALIDAS = new Set([
  "circle",
  "square",
  "triangle",
  "diamond",
  "hexagon",
]);

const APARIENCIAS_INICIALES = [
  { shape: "circle", color: "#4f46e5" },
  { shape: "square", color: "#e15b64" },
  { shape: "triangle", color: "#24a37a" },
];

export class ModeloTablero {
  #dimension;
  #tamano;
  #apariencias;
  #tablero;
  #movimientos;
  #completada;

  constructor(dimension = 4, tamano = "medium") {
    this.#dimension = this.#normalizarDimension(dimension);
    this.#tamano = TAMANOS_VALIDOS.has(tamano) ? tamano : "medium";
    this.#apariencias = APARIENCIAS_INICIALES.map((apariencia) => ({ ...apariencia }));
    this.#tablero = [];
    this.#movimientos = 0;
    this.#completada = false;

    this.nuevaPartida();
  }

  nuevaPartida() {
    this.#tablero = this.#crearTableroSolucionable();
    this.#movimientos = 0;
    this.#completada = false;
  }

  cambiarDimension(valor) {
    this.#dimension = this.#normalizarDimension(valor);
    this.nuevaPartida();
  }

  cambiarTamano(valor) {
    if (!TAMANOS_VALIDOS.has(valor)) {
      throw new RangeError("El tamaño de las fichas no es válido.");
    }

    this.#tamano = valor;
    this.nuevaPartida();
  }

  actualizarApariencia(tipo, propiedad, valor) {
    if (!Number.isInteger(tipo) || tipo < 0 || tipo >= this.#apariencias.length) {
      throw new RangeError("El tipo de ficha no es válido.");
    }

    if (propiedad === "shape" && !FORMAS_VALIDAS.has(valor)) {
      throw new RangeError("La forma escogida no es válida.");
    }

    if (propiedad === "color" && !/^#[0-9a-f]{6}$/i.test(valor)) {
      throw new RangeError("El color escogido no es válido.");
    }

    if (propiedad !== "shape" && propiedad !== "color") {
      throw new RangeError("La propiedad de apariencia no es válida.");
    }

    const nuevasApariencias = this.#apariencias.map((apariencia) => ({ ...apariencia }));
    nuevasApariencias[tipo][propiedad] = valor.toLowerCase();

    if (!this.#sonAparienciasDistinguibles(nuevasApariencias)) {
      return false;
    }

    this.#apariencias = nuevasApariencias;
    this.nuevaPartida();
    return true;
  }

  intercambiar(origen, destino) {
    if (this.#completada || !this.#esIndiceValido(origen) || !this.#esIndiceValido(destino)) {
      return false;
    }

    if (origen === destino) {
      return false;
    }

    [this.#tablero[origen], this.#tablero[destino]] = [
      this.#tablero[destino],
      this.#tablero[origen],
    ];

    this.#movimientos += 1;
    this.#completada = this.#estaCompleto(this.#tablero);
    return true;
  }

  obtenerEstado() {
    return {
      dimension: this.#dimension,
      size: this.#tamano,
      appearances: this.#apariencias.map((apariencia) => ({ ...apariencia })),
      board: [...this.#tablero],
      moves: this.#movimientos,
      completed: this.#completada,
    };
  }

  #normalizarDimension(valor) {
    const dimension = Number.parseInt(valor, 10);

    if (!Number.isInteger(dimension) || dimension < 3) {
      throw new RangeError("La dimensión debe ser un número entero mayor o igual que 3.");
    }

    return dimension;
  }

  #crearTableroSolucionable() {
    /*
     * Si cada fila final debe contener un solo tipo, la cantidad de fichas de
     * cada tipo tiene que ser múltiplo de N. Se asigna primero una fila a cada
     * tipo y después se reparten aleatoriamente las filas restantes.
     */
    const filasPorTipo = [1, 1, 1];

    for (let fila = 3; fila < this.#dimension; fila += 1) {
      const tipoAleatorio = Math.floor(Math.random() * filasPorTipo.length);
      filasPorTipo[tipoAleatorio] += 1;
    }

    const bolsa = [];

    filasPorTipo.forEach((numeroFilas, tipo) => {
      const cantidad = numeroFilas * this.#dimension;

      for (let posicion = 0; posicion < cantidad; posicion += 1) {
        bolsa.push(tipo);
      }
    });

    let tablero = this.#mezclar(bolsa);
    let intentos = 0;

    while (this.#estaCompleto(tablero) && intentos < 100) {
      tablero = this.#mezclar(bolsa);
      intentos += 1;
    }

    // Salvaguarda determinista para que la partida nunca aparezca ya resuelta.
    if (this.#estaCompleto(tablero)) {
      const indiceDistinto = tablero.findIndex((tipo) => tipo !== tablero[0]);
      [tablero[0], tablero[indiceDistinto]] = [tablero[indiceDistinto], tablero[0]];
    }

    return tablero;
  }

  #mezclar(elementos) {
    const resultado = [...elementos];

    // Algoritmo de Fisher-Yates: todos los órdenes tienen la misma probabilidad.
    for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
      const aleatorio = Math.floor(Math.random() * (indice + 1));
      [resultado[indice], resultado[aleatorio]] = [resultado[aleatorio], resultado[indice]];
    }

    return resultado;
  }

  #estaCompleto(tablero) {
    if (tablero.length !== this.#dimension * this.#dimension) {
      return false;
    }

    for (let fila = 0; fila < this.#dimension; fila += 1) {
      const inicio = fila * this.#dimension;
      const tipoFila = tablero[inicio];

      for (let columna = 1; columna < this.#dimension; columna += 1) {
        if (tablero[inicio + columna] !== tipoFila) {
          return false;
        }
      }
    }

    return true;
  }

  #sonAparienciasDistinguibles(apariencias) {
    const combinaciones = apariencias.map(
      ({ shape, color }) => `${shape}|${color.toLowerCase()}`,
    );

    return new Set(combinaciones).size === apariencias.length;
  }

  #esIndiceValido(indice) {
    return Number.isInteger(indice) && indice >= 0 && indice < this.#tablero.length;
  }
}
