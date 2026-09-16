import {
  cargarSonetos,
  obtenerSonetoPorId
} from "./model.js";

import {
  mostrarOpciones,
  mostrarSoneto,
  alSeleccionarSoneto,
  mostrarError
} from "./view.js";

export async function iniciarAplicacion() {
  try {
    const sonetos = await cargarSonetos();

    mostrarOpciones(sonetos);
    mostrarSoneto(sonetos[0]);

    alSeleccionarSoneto(id => {
      const soneto = obtenerSonetoPorId(id);

      if (soneto) {
        mostrarSoneto(soneto);
      }
    });
  } catch (error) {
    console.error(error);

    mostrarError(
      "No se han podido cargar los sonetos. Recarga la página."
    );
  }
}