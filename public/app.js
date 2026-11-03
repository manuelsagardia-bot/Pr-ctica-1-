// Cliente de la API de reservas.
// La pagina se sirve desde el mismo Express (express.static), asi que
// pagina y API comparten origen y las rutas pueden ser relativas.

const API = "/reservas";

// --- Elementos del DOM ---
const form = document.getElementById("form-reserva");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");

const inputBuscar = document.getElementById("buscar");
const filtroTipo = document.getElementById("filtro-tipo");
const filtroPagada = document.getElementById("filtro-pagada");
const selectOrden = document.getElementById("orden");

const cuerpoTabla = document.getElementById("cuerpo-tabla");
const avisoCargando = document.getElementById("cargando");
const avisoMensaje = document.getElementById("mensaje");
const avisoVacio = document.getElementById("vacio");
const tabla = document.getElementById("tabla");

const CAMPOS = ["socio", "pista", "duracion", "franja"];

// Id de la reserva que se esta editando. null = modo creacion.
let editandoId = null;


// ===== Utilidades de interfaz =====

function mostrarCargando(activo) {
    avisoCargando.hidden = !activo;
}

function mostrarMensaje(texto, esFallo = false) {
    avisoMensaje.textContent = texto;
    avisoMensaje.classList.toggle("fallo", esFallo);
    avisoMensaje.hidden = texto === "";
}

function limpiarErrores() {
    for (const campo of CAMPOS) {
        document.getElementById(`error-${campo}`).textContent = "";
        document.getElementById(campo).classList.remove("invalido");
    }
    mostrarMensaje("");
}

// Pinta los errores { field, message } junto a su campo
function pintarErrores(errores) {
    for (const err of errores) {
        const hueco = document.getElementById(`error-${err.field}`);
        const campo = document.getElementById(err.field);

        if (hueco) {
            hueco.textContent = err.message;
        }
        if (campo) {
            campo.classList.add("invalido");
        }
        if (!hueco) {
            // Error de un campo que no esta en el formulario
            mostrarMensaje(err.message, true);
        }
    }
}


// ===== Listado =====

// Construye la query string a partir de los filtros.
// El filtrado lo hace el SERVIDOR: aqui solo se arma la URL.
function construirUrl() {
    const params = new URLSearchParams();

    if (inputBuscar.value.trim() !== "") {
        params.set("search", inputBuscar.value.trim());
    }
    if (filtroTipo.value !== "") {
        params.set("tipo", filtroTipo.value);
    }
    if (filtroPagada.value !== "") {
        params.set("pagada", filtroPagada.value);
    }
    if (selectOrden.value !== "") {
        const [campo, direccion] = selectOrden.value.split("-");
        params.set("sort", campo);
        params.set("order", direccion);
    }

    const query = params.toString();
    return query === "" ? API : `${API}?${query}`;
}

async function cargarReservas() {
    mostrarCargando(true);
    mostrarMensaje("");

    try {
        const respuesta = await fetch(construirUrl());

        // fetch NO lanza error con un 404 o un 500: hay que comprobarlo
        if (!respuesta.ok) {
            throw new Error(`El servidor respondio ${respuesta.status}`);
        }

        const reservas = await respuesta.json();
        pintarTabla(reservas);
    } catch (error) {
        mostrarMensaje(`No se han podido cargar las reservas: ${error.message}`, true);
        cuerpoTabla.innerHTML = "";
        tabla.hidden = true;
        avisoVacio.hidden = true;
    } finally {
        mostrarCargando(false);
    }
}

function pintarTabla(reservas) {
    cuerpoTabla.innerHTML = "";

    // Estado explicito de lista vacia
    const vacia = reservas.length === 0;
    avisoVacio.hidden = !vacia;
    tabla.hidden = vacia;

    for (const r of reservas) {
        const fila = document.createElement("tr");

        const tipo = r.pista <= 6 ? "interior" : "exterior";
        const pagada = r.pagada
            ? '<span class="etiqueta si">Si</span>'
            : '<span class="etiqueta no">No</span>';

        fila.innerHTML = `
            <td>${escapar(r.socio)}</td>
            <td>${r.pista}</td>
            <td>${tipo}</td>
            <td>${r.franja}</td>
            <td>${r.duracion} min</td>
            <td>${pagada}</td>
            <td class="acciones">
                <button type="button" class="secundario" data-editar="${r.id}">Editar</button>
                <button type="button" class="peligro" data-borrar="${r.id}">Borrar</button>
            </td>
        `;

        cuerpoTabla.appendChild(fila);
    }
}

// Evita que un nombre con < o > rompa el HTML
function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}


// ===== Crear y editar =====

// Validacion inicial en el cliente, antes de enviar
function validarEnCliente(datos) {
    const errores = [];

    if (datos.socio === "") {
        errores.push({ field: "socio", message: "El nombre del socio es obligatorio" });
    }
    if (!Number.isInteger(datos.pista) || datos.pista < 1 || datos.pista > 18) {
        errores.push({ field: "pista", message: "La pista debe estar entre 1 y 18" });
    }
    if (!Number.isInteger(datos.duracion) || datos.duracion < 60 || datos.duracion > 120) {
        errores.push({ field: "duracion", message: "La duracion debe estar entre 60 y 120 minutos" });
    }
    if (datos.franja === "") {
        errores.push({ field: "franja", message: "Elige una franja horaria" });
    }

    return errores;
}

function leerFormulario() {
    return {
        socio: document.getElementById("socio").value.trim(),
        pista: Number(document.getElementById("pista").value),
        duracion: Number(document.getElementById("duracion").value),
        franja: document.getElementById("franja").value,
        pagada: document.getElementById("pagada").checked
    };
}

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limpiarErrores();

    const datos = leerFormulario();

    const erroresCliente = validarEnCliente(datos);
    if (erroresCliente.length > 0) {
        pintarErrores(erroresCliente);
        return;
    }

    const esEdicion = editandoId !== null;
    const url = esEdicion ? `${API}/${editandoId}` : API;
    const metodo = esEdicion ? "PUT" : "POST";

    mostrarCargando(true);

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const cuerpo = await respuesta.json();

        if (respuesta.status === 400) {
            pintarErrores(cuerpo.errors);
            return;
        }

        if (respuesta.status === 409) {
            mostrarMensaje(
                `${cuerpo.message}. Pistas libres: ${cuerpo.pistasDisponibles.join(", ")}`,
                true
            );
            document.getElementById("pista").classList.add("invalido");
            return;
        }

        if (!respuesta.ok) {
            throw new Error(`El servidor respondio ${respuesta.status}`);
        }

        form.reset();
        salirDeEdicion();
        mostrarMensaje(esEdicion ? "Reserva actualizada" : "Reserva creada");
        await cargarReservas();
    } catch (error) {
        mostrarMensaje(`No se ha podido guardar: ${error.message}`, true);
    } finally {
        mostrarCargando(false);
    }
});


// ===== Acciones de cada fila =====

cuerpoTabla.addEventListener("click", async (evento) => {
    const idEditar = evento.target.dataset.editar;
    const idBorrar = evento.target.dataset.borrar;

    if (idEditar) {
        await entrarEnEdicion(Number(idEditar));
    }
    if (idBorrar) {
        await borrarReserva(Number(idBorrar));
    }
});

async function entrarEnEdicion(id) {
    limpiarErrores();
    mostrarCargando(true);

    try {
        const respuesta = await fetch(`${API}/${id}`);
        if (!respuesta.ok) {
            throw new Error(`El servidor respondio ${respuesta.status}`);
        }

        const r = await respuesta.json();

        document.getElementById("socio").value = r.socio;
        document.getElementById("pista").value = r.pista;
        document.getElementById("duracion").value = r.duracion;
        document.getElementById("franja").value = r.franja;
        document.getElementById("pagada").checked = r.pagada;

        editandoId = id;
        btnGuardar.textContent = "Guardar cambios";
        btnCancelar.hidden = false;

        document.getElementById("socio").focus();
    } catch (error) {
        mostrarMensaje(`No se ha podido cargar la reserva: ${error.message}`, true);
    } finally {
        mostrarCargando(false);
    }
}

function salirDeEdicion() {
    editandoId = null;
    btnGuardar.textContent = "Crear reserva";
    btnCancelar.hidden = true;
}

btnCancelar.addEventListener("click", () => {
    form.reset();
    limpiarErrores();
    salirDeEdicion();
});

async function borrarReserva(id) {
    if (!confirm("¿Seguro que quieres borrar esta reserva?")) {
        return;
    }

    mostrarCargando(true);

    try {
        const respuesta = await fetch(`${API}/${id}`, { method: "DELETE" });

        if (respuesta.status === 404) {
            mostrarMensaje("Esa reserva ya no existe", true);
        } else if (!respuesta.ok) {
            throw new Error(`El servidor respondio ${respuesta.status}`);
        } else {
            mostrarMensaje("Reserva borrada");
        }

        if (editandoId === id) {
            form.reset();
            salirDeEdicion();
        }

        await cargarReservas();
    } catch (error) {
        mostrarMensaje(`No se ha podido borrar: ${error.message}`, true);
    } finally {
        mostrarCargando(false);
    }
}


// ===== Filtros: cada cambio recarga desde el servidor =====

inputBuscar.addEventListener("input", cargarReservas);
filtroTipo.addEventListener("change", cargarReservas);
filtroPagada.addEventListener("change", cargarReservas);
selectOrden.addEventListener("change", cargarReservas);


// ===== Arranque =====

cargarReservas();