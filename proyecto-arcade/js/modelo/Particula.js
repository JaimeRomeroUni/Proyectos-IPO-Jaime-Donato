/**
 * Partícula: fragmento de un bloque que sale despedido al completar una línea.
 * Física básica: velocidad, gravedad, rebote con pérdida de energía y rozamiento.
 * Todas las magnitudes están en celdas y segundos.
 */

const RESTITUCION = 0.45; // fracción de velocidad que conserva al rebotar
const ROZAMIENTO = 0.8;   // fracción de velocidad horizontal tras tocar el suelo

export class Particula {
  constructor({ x, y, vx, vy, tipo, vida }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.tipo = tipo;
    this.vida = vida;
    this.vidaInicial = vida;
    this.tamano = 0.18 + Math.random() * 0.22;
  }

  actualizar(dt, gravedad, suelo) {
    this.vy += gravedad * dt;   // la gravedad cambia la velocidad
    this.x += this.vx * dt;     // la velocidad cambia la posición
    this.y += this.vy * dt;

    // Colisión con el fondo del tablero: rebote amortiguado
    if (this.y > suelo) {
      this.y = suelo;
      this.vy *= -RESTITUCION;
      this.vx *= ROZAMIENTO;
    }

    this.vida -= dt;
  }

  get viva() {
    return this.vida > 0;
  }

  /** 1 al nacer y 0 al morir: la vista la usa como transparencia. */
  get opacidad() {
    return Math.max(0, this.vida / this.vidaInicial);
  }
}
