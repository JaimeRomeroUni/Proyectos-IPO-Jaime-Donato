export class ControladorTablero {
  #modelo;
  #vista;
  #indiceSeleccionado;
  #indiceArrastrado;
  #seHaArrastrado;

  constructor(modelo, vista) {
    this.#modelo = modelo;
    this.#vista = vista;
    this.#indiceSeleccionado = null;
    this.#indiceArrastrado = null;
    this.#seHaArrastrado = false;

    this.#vista.vincularEventos({
      nuevaPartida: () => this.#crearNuevaPartida(),
      cambiarDimension: (valor) => this.#cambiarDimension(valor),
      cambiarTamano: (valor) => this.#cambiarTamano(valor),
      cambiarApariencia: (tipo, propiedad, valor) => {
        this.#cambiarApariencia(tipo, propiedad, valor);
      },
      iniciarArrastre: (evento) => this.#iniciarArrastre(evento),
      sobrevolarDestino: (evento) => this.#sobrevolarDestino(evento),
      soltarFicha: (evento) => this.#soltarFicha(evento),
      finalizarArrastre: () => this.#finalizarArrastre(),
      seleccionarFicha: (evento) => this.#seleccionarFicha(evento),
      alternarAyuda: () => this.#alternarAyuda(),
      cerrarAyuda: () => this.#cerrarAyuda(),
    });

    this.#representar();
  }

  #crearNuevaPartida() {
    this.#modelo.nuevaPartida();
    this.#reiniciarSeleccion();
    this.#representar();
    this.#vista.mostrarNotificacion("Se ha creado una partida nueva.");
  }

  #cambiarDimension(valor) {
    try {
      this.#modelo.cambiarDimension(valor);
      this.#reiniciarSeleccion();
      this.#representar();
      this.#vista.mostrarNotificacion("Dimensión actualizada: partida nueva.");
    } catch (error) {
      this.#representar();
      this.#vista.mostrarNotificacion(error.message, "error");
    }
  }

  #cambiarTamano(valor) {
    try {
      this.#modelo.cambiarTamano(valor);
      this.#reiniciarSeleccion();
      this.#representar();
      this.#vista.mostrarNotificacion("Tamaño actualizado: partida nueva.");
    } catch (error) {
      this.#representar();
      this.#vista.mostrarNotificacion(error.message, "error");
    }
  }

  #cambiarApariencia(tipo, propiedad, valor) {
    try {
      const cambioValido = this.#modelo.actualizarApariencia(tipo, propiedad, valor);

      if (!cambioValido) {
        this.#representar();
        this.#vista.mostrarNotificacion(
          "Los tres tipos deben distinguirse por su forma o su color.",
          "error",
        );
        return;
      }

      this.#reiniciarSeleccion();
      this.#representar();
      this.#vista.mostrarNotificacion("Apariencia actualizada: partida nueva.");
    } catch (error) {
      this.#representar();
      this.#vista.mostrarNotificacion(error.message, "error");
    }
  }

  #iniciarArrastre(evento) {
    const indice = this.#vista.obtenerIndiceDesdeElemento(evento.target);
    const estado = this.#modelo.obtenerEstado();

    if (indice === null || estado.completed || !evento.dataTransfer) {
      evento.preventDefault();
      return;
    }

    this.#indiceArrastrado = indice;
    this.#seHaArrastrado = true;
    evento.dataTransfer.effectAllowed = "move";

    const datos = JSON.stringify({ index: indice });
    evento.dataTransfer.setData("application/json", datos);
    evento.dataTransfer.setData("text/plain", String(indice));

    this.#vista.marcarArrastre(indice);
  }

  #sobrevolarDestino(evento) {
    const indice = this.#vista.obtenerIndiceDesdeElemento(evento.target);

    if (indice === null || this.#indiceArrastrado === null) {
      return;
    }

    evento.preventDefault();

    if (evento.dataTransfer) {
      evento.dataTransfer.dropEffect = "move";
    }

    if (indice !== this.#indiceArrastrado) {
      this.#vista.marcarDestino(indice);
    }
  }

  #soltarFicha(evento) {
    const destino = this.#vista.obtenerIndiceDesdeElemento(evento.target);

    if (destino === null || !evento.dataTransfer) {
      return;
    }

    evento.preventDefault();
    const origen = this.#leerIndiceTransferido(evento.dataTransfer);
    this.#finalizarArrastre();

    if (origen !== null) {
      this.#realizarIntercambio(origen, destino);
    }
  }

  #finalizarArrastre() {
    this.#indiceArrastrado = null;
    this.#vista.limpiarIndicadoresArrastre();

    // Evita que el clic que algunos navegadores lanzan tras arrastrar seleccione la ficha.
    window.setTimeout(() => {
      this.#seHaArrastrado = false;
    }, 0);
  }

  #seleccionarFicha(evento) {
    if (this.#seHaArrastrado) {
      return;
    }

    const indice = this.#vista.obtenerIndiceDesdeElemento(evento.target);
    const estado = this.#modelo.obtenerEstado();

    if (indice === null) {
      return;
    }

    if (estado.completed) {
      this.#vista.mostrarNotificacion(
        "La partida ya ha terminado. Pulsa «Nueva partida» para continuar.",
      );
      return;
    }

    if (this.#indiceSeleccionado === null) {
      this.#indiceSeleccionado = indice;
      this.#vista.marcarSeleccion(indice);
      return;
    }

    if (this.#indiceSeleccionado === indice) {
      this.#reiniciarSeleccion();
      return;
    }

    this.#realizarIntercambio(this.#indiceSeleccionado, indice);
  }

  #realizarIntercambio(origen, destino) {
    const intercambiada = this.#modelo.intercambiar(origen, destino);
    this.#reiniciarSeleccion();

    if (!intercambiada) {
      return;
    }

    const estado = this.#modelo.obtenerEstado();
    this.#vista.representar(estado);
    this.#vista.enfocarFicha(destino);

    if (estado.completed) {
      const palabra = estado.moves === 1 ? "movimiento" : "movimientos";
      this.#vista.mostrarNotificacion(
        `¡Enhorabuena! Has completado el tablero en ${estado.moves} ${palabra}.`,
        "success",
      );
    }
  }

  #leerIndiceTransferido(dataTransfer) {
    const datosJson = dataTransfer.getData("application/json");

    if (datosJson) {
      try {
        const datos = JSON.parse(datosJson);

        if (Number.isInteger(datos.index)) {
          return datos.index;
        }
      } catch {
        // Se usa text/plain como alternativa si los datos JSON no son válidos.
      }
    }

    const texto = dataTransfer.getData("text/plain");
    const indice = Number.parseInt(texto, 10);
    return Number.isInteger(indice) ? indice : null;
  }

  #alternarAyuda() {
    this.#vista.establecerAyuda(!this.#vista.estaAyudaAbierta());
  }

  #cerrarAyuda() {
    if (this.#vista.estaAyudaAbierta()) {
      this.#vista.establecerAyuda(false);
    }
  }

  #reiniciarSeleccion() {
    this.#indiceSeleccionado = null;
    this.#vista.marcarSeleccion(null);
  }

  #representar() {
    this.#vista.representar(this.#modelo.obtenerEstado());
  }
}
