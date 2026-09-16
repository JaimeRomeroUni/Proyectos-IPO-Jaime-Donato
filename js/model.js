const archivos = [
  "eraseUnHombre.md",
  "escritoEstaEnMiALma.md",
  "mientrasPorCompetir.md",
  "mireLosMuros.md",
  "unSonetoMeManda.md"
];

let sonetos = [];

function extraerValor(linea) {
  return linea
    .slice(linea.indexOf(":") + 1)
    .trim()
    .replace(/^["“]|["”]$/g, "")
    .trim();
}

function interpretarSoneto(texto, archivo) {
  const lineas = texto
    .split(/\r?\n/)
    .map(linea => linea.trim())
    .filter(linea => linea !== "");

  const inicio = lineas.findIndex(linea =>
    /^soneto\s*:?\s*$/i.test(linea)
  );

  const cabecera = lineas.slice(0, inicio);

  const titulo = cabecera.find(linea =>
    /^t[ií]tulo\s*:/i.test(linea)
  );

  const autor = cabecera.find(linea =>
    /^autor\s*:/i.test(linea)
  );

  if (inicio === -1 || !titulo || !autor) {
    throw new Error("Formato incorrecto en " + archivo);
  }

  const versos = lineas.slice(inicio + 1);

  if (versos.length !== 14) {
    throw new Error(archivo + " debe contener 14 versos.");
  }

  return {
    id: archivo,
    titulo: extraerValor(titulo),
    autor: extraerValor(autor),
    estrofas: [
      versos.slice(0, 4),
      versos.slice(4, 8),
      versos.slice(8, 11),
      versos.slice(11, 14)
    ]
  };
}

export async function cargarSonetos() {
  sonetos = await Promise.all(
    archivos.map(async archivo => {
      const ruta = new URL(
        "../sonetos/sonetos/" + archivo,
        import.meta.url
      );

      const respuesta = await fetch(ruta);

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo cargar " + archivo +
          ". Código HTTP: " + respuesta.status
        );
      }

      const texto = await respuesta.text();
      return interpretarSoneto(texto, archivo);
    })
  );

  return sonetos;
}

export function obtenerSonetoPorId(id) {
  return sonetos.find(soneto => soneto.id === id);
}