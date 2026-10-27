import { ModeloTablero } from "./modelo/ModeloTablero.js";
import { VistaTablero } from "./vista/VistaTablero.js";
import { ControladorTablero } from "./controlador/ControladorTablero.js";

const modelo = new ModeloTablero();
const vista = new VistaTablero();

new ControladorTablero(modelo, vista);
