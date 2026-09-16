const selector = document.querySelector('[data-js="selector"]');
const articulo = document.querySelector('[data-js="soneto"]');
const titulo = document.querySelector('[data-js="titulo"]');
const autor = document.querySelector('[data-js="autor"]');
const numero = document.querySelector('[data-js="numero"]');
const estrofas = document.querySelector('[data-js="estrofas"]');
const estado = document.querySelector('[data-js="estado"]');
const error = document.querySelector('[data-js="error"]');

export function mostrarOpciones(sonetos) {
  const opciones = document.createDocumentFragment();

  for (const soneto of sonetos) {
    const opcion = document.createElement("option");

    opcion.value = soneto.id;
    opcion.textContent = soneto.titulo;

    opciones.append(opcion);
  }

  selector.replaceChildren(opciones);
  selector.disabled = false;
}

export function mostrarSoneto(soneto) {
  titulo.textContent = soneto.titulo;
  autor.textContent = soneto.autor;
  selector.value = soneto.id;

  numero.textContent =
    "Soneto " + (selector.selectedIndex + 1) +
    " de " + selector.options.length;

  const contenido = document.createDocumentFragment();

  for (const versos of soneto.estrofas) {
    const parrafo = document.createElement("p");
    parrafo.classList.add("soneto__estrofa");

    versos.forEach((verso, indice) => {
      if (indice > 0) {
        parrafo.append(document.createElement("br"));
      }

      parrafo.append(document.createTextNode(verso));
    });

    contenido.append(parrafo);
  }

  estrofas.replaceChildren(contenido);
  articulo.hidden = false;
  error.hidden = true;

  estado.textContent =
    "Leyendo: " + soneto.titulo + ", de " + soneto.autor + ".";
}

export function alSeleccionarSoneto(manejador) {
  selector.addEventListener("change", () => {
    manejador(selector.value);
  });
}

export function mostrarError(mensaje) {
  estado.textContent = "";
  error.textContent = mensaje;
  error.hidden = false;
  articulo.hidden = true;
  selector.disabled = true;

  const opcion = document.createElement("option");
  opcion.textContent = "Colección no disponible";
  selector.replaceChildren(opcion);
}