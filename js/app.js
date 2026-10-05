// js/app.js

const selector = document.getElementById('selector-sonetos');
const tituloDOM = document.getElementById('titulo-soneto');
const autorDOM = document.getElementById('autor-soneto');
const contenidoDOM = document.getElementById('contenido-soneto');

// 1. Llenamos el menú desplegable con los datos del Modelo
almacenSonetos.forEach(soneto => {
    const option = document.createElement('option');
    option.value = soneto.id;
    option.textContent = soneto.titulo;
    selector.appendChild(option);
});

// 2. Escuchamos cuando el usuario elige un poema
selector.addEventListener('change', async (event) => {
    const idSeleccionado = event.target.value;
    const sonetoElegido = almacenSonetos.find(s => s.id === idSeleccionado);
    
    if (sonetoElegido) {
        // Actualizamos los metadatos en la vista
        tituloDOM.textContent = sonetoElegido.titulo;
        autorDOM.textContent = sonetoElegido.autor;
        contenidoDOM.innerHTML = '<p class="verso">Cargando poema...</p>';

        try {
            // Descargamos el archivo .md
            const respuesta = await fetch(sonetoElegido.archivo);
            if (!respuesta.ok) throw new Error("Fallo HTTP al cargar el archivo");
            
            const texto = await respuesta.text();
            procesarYRenderizarPoema(texto, contenidoDOM);
        } catch (error) {
            contenidoDOM.innerHTML = '<p class="verso">Error: No se pudo cargar el archivo .md</p>';
        }
    }
});

// 3. Función para procesar matemáticamente las estrofas y coordinar el DOM
function procesarYRenderizarPoema(texto, contenedor) {
    contenedor.innerHTML = ''; 
    
    // Extraemos limpiamente los últimos 14 versos ignorando la cabecera del .md
    const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const versos = lineas.slice(-14);

    if (versos.length !== 14) {
        contenedor.innerHTML = '<p class="verso">Error de formato: No hay 14 versos.</p>';
        return;
    }

    // Estructura fija de un soneto
    const estructuraSoneto = [4, 4, 3, 3];
    let indiceVerso = 0;

    estructuraSoneto.forEach(numVersos => {
        const section = document.createElement('section');
        const tipoEstrofa = (numVersos === 4) ? 'cuarteto' : 'terceto';
        section.className = `estrofa ${tipoEstrofa}`;

        for (let i = 0; i < numVersos; i++) {
            const p = document.createElement('p');
            p.className = 'verso';
            p.textContent = versos[indiceVerso];
            section.appendChild(p);
            indiceVerso++; 
        }
        
        contenedor.appendChild(section);
    });
}