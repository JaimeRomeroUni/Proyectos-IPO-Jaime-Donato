import { Tablero } from "./Tablero.js";
import { Pieza } from "./Pieza.js";
import { GeneradorPiezas } from "./GeneradorPiezas.js";
import { Particula } from "./Particula.js";

/**
 * Modelo del juego: estado de la partida, reglas, puntuación y física.
 * No sabe nada del DOM ni del canvas.
 */

export const ESTADOS = Object.freeze({
  INICIO: "inicio",
  JUGANDO: "jugando",
  PAUSA: "pausa",
  FIN: "fin",
});

const FILAS = 20;
const LINEAS_POR_NIVEL = 10;
const PUNTOS_POR_LINEAS = [0, 100, 300, 500, 800];
const PUNTOS_POR_FILA_CAIDA = 2;

const RETARDO_BLOQUEO = 0.5;      // s que la pieza puede deslizarse apoyada antes de fijarse
const MAX_REINICIOS_BLOQUEO = 15; // evita alargar el apoyo indefinidamente
const PASO_MAXIMO = 0.45;         // celdas por subpaso: impide "atravesar" bloques a gran velocidad
const ROTACION_DESPLAZAMIENTOS = [0, -1, 1, -2, 2]; // intentos al girar junto a una pared

// Parámetros físicos (celdas/s y celdas/s²)
const FISICA = Object.freeze({
  bajadaSuave: { gravedad: 80, velocidadMaxima: 22 },
  caidaLibre: { gravedad: 500, velocidadMaxima: 90 },
  particulas: { gravedad: 28 },
});

const CLAVE_RECORD = "caida-libre.record";

export class ModeloJuego {
  constructor() {
    this.ajustes = { nivelInicial: 1, columnas: 10, sombra: true, particulas: true };
    this.estado = ESTADOS.INICIO;
    this.record = cargarRecord();
    this.nuevoRecord = false;
    this.bajadaSuave = false;
    this.#prepararTablero();
  }

  /* ---------- Consultas ---------- */

  get columnas() {
    return this.tablero.columnas;
  }

  get filas() {
    return this.tablero.filas;
  }

  get lineasParaSubir() {
    return LINEAS_POR_NIVEL - (this.lineas % LINEAS_POR_NIVEL);
  }

  get lineasPorNivel() {
    return LINEAS_POR_NIVEL;
  }

  /** Velocidad terminal de caída: crece con el nivel. */
  get velocidadMaxima() {
    return 1 + (this.nivel - 1) * 0.9;
  }

  /** Aceleración de la gravedad: alcanza la velocidad terminal en 0,4 s. */
  get gravedad() {
    return this.velocidadMaxima * 2.5;
  }

  /** Fila entera donde quedaría la pieza si cayese ahora (sombra de caída). */
  posicionSombra() {
    const p = this.pieza;
    if (!p) return null;

    let fila = Math.ceil(p.y);
    while (this.tablero.posicionValida(p.forma, p.columna, fila + 1)) fila++;
    return fila;
  }

  /* ---------- Ciclo de vida de la partida ---------- */

  iniciar() {
    this.#prepararTablero();
    this.generador = new GeneradorPiezas();
    this.siguiente = new Pieza(this.generador.siguiente());
    this.nuevoRecord = false;
    this.bajadaSuave = false;
    this.estado = ESTADOS.JUGANDO;
    this.#sacarPieza();
  }

  pausar() {
    if (this.estado === ESTADOS.JUGANDO) this.estado = ESTADOS.PAUSA;
  }

  reanudar() {
    if (this.estado === ESTADOS.PAUSA) this.estado = ESTADOS.JUGANDO;
  }

  finalizar() {
    if (this.estado === ESTADOS.JUGANDO || this.estado === ESTADOS.PAUSA) this.#terminar();
  }

  get enPartida() {
    return this.estado === ESTADOS.JUGANDO || this.estado === ESTADOS.PAUSA;
  }

  /**
   * Aplica los ajustes. El nivel inicial y el ancho solo cambian fuera de
   * partida (implican un tablero nuevo); sombra y partículas, en cualquier momento.
   */
  cambiarAjustes({ nivelInicial, columnas, sombra, particulas }) {
    this.ajustes.sombra = sombra;
    this.ajustes.particulas = particulas;
    if (!particulas) this.particulas = [];

    if (this.enPartida) return;

    const cambiaTablero =
      nivelInicial !== this.ajustes.nivelInicial || columnas !== this.ajustes.columnas;
    this.ajustes.nivelInicial = nivelInicial;
    this.ajustes.columnas = columnas;
    if (cambiaTablero) this.#prepararTablero();
  }

  /* ---------- Acciones del jugador ---------- */

  mover(desplazamiento) {
    const p = this.pieza;
    if (!this.#puedeActuar()) return false;

    const columna = p.columna + desplazamiento;
    if (!this.tablero.posicionValida(p.forma, columna, p.y)) return false;

    p.columna = columna;
    this.#trasAjuste();
    return true;
  }

  rotar(sentido) {
    const p = this.pieza;
    if (!this.#puedeActuar()) return false;

    const forma = p.formaRotada(sentido);
    // Si está entre dos filas, también se prueba encajada en la superior
    const alturas = [p.y, Math.floor(p.y)];

    for (const y of alturas) {
      for (const desplazamiento of ROTACION_DESPLAZAMIENTOS) {
        const columna = p.columna + desplazamiento;
        if (this.tablero.posicionValida(forma, columna, y)) {
          p.forma = forma;
          p.columna = columna;
          p.y = y;
          this.#trasAjuste();
          return true;
        }
      }
    }
    return false;
  }

  activarBajadaSuave(activa) {
    this.bajadaSuave = activa;
  }

  dejarCaer() {
    if (!this.#puedeActuar()) return;
    this.caidaLibre = true;
    this.filaInicioCaida = this.pieza.y;
  }

  /* ---------- Bucle: actualización del estado ---------- */

  actualizar(dt) {
    if (this.estado === ESTADOS.PAUSA) return;
    if (this.estado === ESTADOS.JUGANDO) this.#actualizarPieza(dt);
    this.#actualizarParticulas(dt);
  }

  #actualizarPieza(dt) {
    const p = this.pieza;
    if (!p) return;

    if (this.enSuelo) {
      // ¿Sigue apoyada? (puede haberse deslizado fuera de un saliente)
      if (this.tablero.posicionValida(p.forma, p.columna, p.y + 0.01)) {
        this.enSuelo = false;
      } else {
        this.tiempoBloqueo += dt;
        if (this.caidaLibre || this.tiempoBloqueo >= RETARDO_BLOQUEO) this.#bloquear();
        return;
      }
    }

    // Física: la gravedad acelera la pieza hasta su velocidad terminal
    const { gravedad, velocidadMaxima } = this.#fisicaActual();
    p.vy = Math.min(p.vy + gravedad * dt, velocidadMaxima);

    // Integración por subpasos con detección de colisiones
    let recorrido = p.vy * dt;
    while (recorrido > 0) {
      const paso = Math.min(recorrido, PASO_MAXIMO);
      const nuevaY = p.y + paso;

      if (this.tablero.posicionValida(p.forma, p.columna, nuevaY)) {
        p.y = nuevaY;
        recorrido -= paso;
      } else {
        // Colisión: se encaja en la última fila libre y pierde la velocidad
        p.y = Math.floor(nuevaY);
        p.vy = 0;
        this.enSuelo = true;
        this.tiempoBloqueo = 0;
        if (this.caidaLibre) this.#bloquear();
        return;
      }
    }
  }

  #actualizarParticulas(dt) {
    if (this.particulas.length === 0) return;
    const suelo = this.filas - 0.1;
    for (const particula of this.particulas) {
      particula.actualizar(dt, FISICA.particulas.gravedad, suelo);
    }
    this.particulas = this.particulas.filter((particula) => particula.viva);
  }

  #fisicaActual() {
    if (this.caidaLibre) return FISICA.caidaLibre;
    if (this.bajadaSuave) {
      return {
        gravedad: Math.max(FISICA.bajadaSuave.gravedad, this.gravedad),
        velocidadMaxima: Math.max(FISICA.bajadaSuave.velocidadMaxima, this.velocidadMaxima),
      };
    }
    return { gravedad: this.gravedad, velocidadMaxima: this.velocidadMaxima };
  }

  /* ---------- Reglas internas ---------- */

  #prepararTablero() {
    this.tablero = new Tablero(this.ajustes.columnas, FILAS);
    this.pieza = null;
    this.siguiente = null;
    this.particulas = [];
    this.puntos = 0;
    this.lineas = 0;
    this.nivel = this.ajustes.nivelInicial;
  }

  #puedeActuar() {
    return this.estado === ESTADOS.JUGANDO && this.pieza !== null && !this.caidaLibre;
  }

  #sacarPieza() {
    const pieza = this.siguiente;
    this.siguiente = new Pieza(this.generador.siguiente());

    pieza.columna = Math.floor((this.columnas - pieza.tamano) / 2);
    pieza.y = -pieza.primeraFilaOcupada;
    pieza.vy = 0;

    this.pieza = pieza;
    this.enSuelo = false;
    this.caidaLibre = false;
    this.tiempoBloqueo = 0;
    this.reiniciosBloqueo = 0;

    if (!this.tablero.posicionValida(pieza.forma, pieza.columna, pieza.y)) this.#terminar();
  }

  /** Tras mover o girar una pieza apoyada: se reinicia el tiempo de apoyo o vuelve a caer. */
  #trasAjuste() {
    if (!this.enSuelo) return;
    const p = this.pieza;

    if (this.tablero.posicionValida(p.forma, p.columna, p.y + 0.01)) {
      this.enSuelo = false;
      return;
    }
    if (this.reiniciosBloqueo < MAX_REINICIOS_BLOQUEO) {
      this.tiempoBloqueo = 0;
      this.reiniciosBloqueo++;
    }
  }

  #bloquear() {
    const p = this.pieza;

    if (this.caidaLibre) {
      const filasRecorridas = Math.max(0, Math.round(p.y - this.filaInicioCaida));
      this.puntos += filasRecorridas * PUNTOS_POR_FILA_CAIDA;
    }

    p.y = Math.round(p.y);
    const cabe = this.tablero.fijar(p);
    this.pieza = null;

    const eliminadas = this.tablero.eliminarLineasCompletas();
    if (eliminadas.length > 0) {
      this.#puntuar(eliminadas.length);
      if (this.ajustes.particulas) this.#crearParticulas(eliminadas);
    }

    if (cabe) this.#sacarPieza();
    else this.#terminar();
  }

  #puntuar(numeroLineas) {
    this.puntos += PUNTOS_POR_LINEAS[numeroLineas] * this.nivel;
    this.lineas += numeroLineas;
    this.nivel = this.ajustes.nivelInicial + Math.floor(this.lineas / LINEAS_POR_NIVEL);
  }

  #crearParticulas(eliminadas) {
    for (const { fila, tipos } of eliminadas) {
      tipos.forEach((tipo, columna) => {
        for (let i = 0; i < 5; i++) {
          this.particulas.push(
            new Particula({
              x: columna + 0.5 + (Math.random() - 0.5) * 0.6,
              y: fila + 0.5 + (Math.random() - 0.5) * 0.6,
              vx: (Math.random() - 0.5) * 10,
              vy: -(4 + Math.random() * 9),
              tipo,
              vida: 1 + Math.random() * 0.8,
            })
          );
        }
      });
    }
  }

  #terminar() {
    this.estado = ESTADOS.FIN;
    this.pieza = null;
    this.bajadaSuave = false;
    if (this.puntos > this.record) {
      this.record = this.puntos;
      this.nuevoRecord = true;
      guardarRecord(this.record);
    }
  }
}

/* ---------- Persistencia del récord ---------- */

function cargarRecord() {
  try {
    return Number(localStorage.getItem(CLAVE_RECORD)) || 0;
  } catch {
    return 0;
  }
}

function guardarRecord(valor) {
  try {
    localStorage.setItem(CLAVE_RECORD, String(valor));
  } catch {
    /* sin almacenamiento disponible: el récord solo dura la sesión */
  }
}
