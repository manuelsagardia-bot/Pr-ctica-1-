// Almacenamiento en memoria.
// Es la unica pieza que habria que cambiar para pasar a una base de datos.

// El club tiene 18 pistas: las 1-6 son interiores y las 7-18 exteriores.
const TOTAL_PISTAS = 18;
const ULTIMA_INTERIOR = 6;

function tipoDePista(numero) {
    return numero <= ULTIMA_INTERIOR ? "interior" : "exterior";
}

let reservas = [
    { id: 1, socio: "Ana Gomez",    pista: 3,  duracion: 90,  pagada: true,  franja: "manana" },
    { id: 2, socio: "Luis Marin",   pista: 9,  duracion: 60,  pagada: false, franja: "manana" },
    { id: 3, socio: "Marta Ruiz",   pista: 1,  duracion: 120, pagada: true,  franja: "tarde"  },
    { id: 4, socio: "Pablo Sanz",   pista: 14, duracion: 90,  pagada: false, franja: "noche"  },
    { id: 5, socio: "Elena Vargas", pista: 7,  duracion: 60,  pagada: false, franja: "tarde"  }
];

let nextId = 6;

function findAll() {
    return reservas;
}

function findById(id) {
    return reservas.find((r) => r.id === id) ?? null;
}

// Devuelve la reserva que ocupa esa pista y franja, o null.
// excluirId evita que una reserva choque consigo misma al editarla.
function findConflicto(pista, franja, excluirId = null) {
    const choque = reservas.find(
        (r) => r.pista === pista && r.franja === franja && r.id !== excluirId
    );
    return choque ?? null;
}

// Numeros de pista libres en esa franja.
function pistasLibres(franja, excluirId = null) {
    const ocupadas = reservas
        .filter((r) => r.franja === franja && r.id !== excluirId)
        .map((r) => r.pista);

    const libres = [];
    for (let n = 1; n <= TOTAL_PISTAS; n++) {
        if (!ocupadas.includes(n)) {
            libres.push(n);
        }
    }
    return libres;
}

function insert(datos) {
    const reserva = { id: nextId, ...datos };
    nextId = nextId + 1;
    reservas.push(reserva);
    return reserva;
}

function replace(id, datos) {
    const index = reservas.findIndex((r) => r.id === id);
    if (index === -1) {
        return null;
    }
    const reserva = { id, ...datos };
    reservas[index] = reserva;
    return reserva;
}

function patch(id, datos) {
    const index = reservas.findIndex((r) => r.id === id);
    if (index === -1) {
        return null;
    }
    reservas[index] = { ...reservas[index], ...datos };
    return reservas[index];
}

function remove(id) {
    const index = reservas.findIndex((r) => r.id === id);
    if (index === -1) {
        return false;
    }
    reservas.splice(index, 1);
    return true;
}

module.exports = {
    findAll, findById, findConflicto, pistasLibres,
    insert, replace, patch, remove,
    tipoDePista, TOTAL_PISTAS, ULTIMA_INTERIOR
};