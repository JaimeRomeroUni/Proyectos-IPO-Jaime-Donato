import { ModeloJuego } from "./modelo/ModeloJuego.js";
import { VistaLienzo } from "./vista/VistaLienzo.js";
import { VistaPanel } from "./vista/VistaPanel.js";
import { ControladorJuego } from "./controlador/ControladorJuego.js";

// Punto de entrada: crea las piezas del MVC y arranca el bucle del juego
const modelo = new ModeloJuego();

const vistaLienzo = new VistaLienzo(
  document.querySelector('[data-lienzo="juego"]'),
  document.querySelector('[data-lienzo="siguiente"]')
);
const vistaPanel = new VistaPanel(document);

new ControladorJuego(modelo, vistaLienzo, vistaPanel).iniciar();
