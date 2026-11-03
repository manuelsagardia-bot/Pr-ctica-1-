const store = require("../data/store");
const { validateReserva, sanitizeReserva, FRANJAS } = require("../validators/reservaValidator");

// Respuesta 409 compartida por POST, PUT y PATCH
function responderConflicto(res, pista, franja, excluirId) {
    return res.status(409).json({
        error: "Pista no disponible",
        message: `La pista ${pista} ya esta reservada en la franja de ${franja}`,
        pistasDisponibles: store.pistasLibres(franja, excluirId)
    });
}

// GET /reservas  — filtros, orden y paginacion combinables
function listReservas(req, res) {
    const { search, pagada, tipo, franja, sort, order, limit, offset } = req.query;

    let resultado = store.findAll();

    // Busqueda parcial, sin distinguir mayusculas, sobre el campo de texto
    if (typeof search === "string" && search.trim() !== "") {
        const termino = search.trim().toLowerCase();
        resultado = resultado.filter((r) => r.socio.toLowerCase().includes(termino));
    }

    // Filtro del campo booleano
    if (pagada === "true" || pagada === "false") {
        const valor = pagada === "true";
        resultado = resultado.filter((r) => r.pagada === valor);
    }

    // Filtro por tipo de pista: interior (1-6) o exterior (7-18)
    if (tipo === "interior" || tipo === "exterior") {
        resultado = resultado.filter((r) => store.tipoDePista(r.pista) === tipo);
    }

    // Filtro del campo cerrado
    if (FRANJAS.includes(franja)) {
        resultado = resultado.filter((r) => r.franja === franja);
    }

    // Ordenacion. Lista blanca: un sort desconocido se ignora
    const camposOrdenables = ["socio", "duracion", "pista"];
    if (camposOrdenables.includes(sort)) {
        const direccion = order === "desc" ? -1 : 1;
        resultado = [...resultado].sort((a, b) => {
            if (a[sort] < b[sort]) return -1 * direccion;
            if (a[sort] > b[sort]) return 1 * direccion;
            return 0;
        });
    }

    // Paginacion. Valores mal formados se ignoran
    const total = resultado.length;
    const desde = Number.isInteger(Number(offset)) && Number(offset) >= 0 ? Number(offset) : 0;
    const cuantos = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : total;

    resultado = resultado.slice(desde, desde + cuantos);

    res.status(200).json(resultado);
}

// GET /reservas/stats  — se calcula en cada peticion, nunca se almacena
function getStats(req, res) {
    const reservas = store.findAll();
    const total = reservas.length;
    const pagadas = reservas.filter((r) => r.pagada).length;

    const sumaDuracion = reservas.reduce((suma, r) => suma + r.duracion, 0);
    const duracionMedia = total === 0 ? 0 : Math.round(sumaDuracion / total);

    const porTipo = {
        interior: reservas.filter((r) => store.tipoDePista(r.pista) === "interior").length,
        exterior: reservas.filter((r) => store.tipoDePista(r.pista) === "exterior").length
    };

    const porFranja = {};
    for (const f of FRANJAS) {
        porFranja[f] = reservas.filter((r) => r.franja === f).length;
    }

    const huecosTotales = store.TOTAL_PISTAS * FRANJAS.length;

    res.status(200).json({
        total,
        pagadas,
        pendientes: total - pagadas,
        duracionMedia,
        porTipo,
        porFranja,
        huecosTotales,
        huecosLibres: huecosTotales - total
    });
}

// GET /reservas/:id
function getReserva(req, res) {
    const id = Number(req.params.id);
    const reserva = store.findById(id);

    if (!reserva) {
        return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.status(200).json(reserva);
}

// POST /reservas
function createReserva(req, res) {
    const { valid, errors } = validateReserva(req.body, { partial: false });

    if (!valid) {
        return res.status(400).json({ errors });
    }

    const datos = sanitizeReserva(req.body);

    if (store.findConflicto(datos.pista, datos.franja)) {
        return responderConflicto(res, datos.pista, datos.franja, null);
    }

    const reserva = store.insert(datos);

    res.status(201).location(`/reservas/${reserva.id}`).json(reserva);
}

// PUT /reservas/:id  — sustituye el recurso completo
function replaceReserva(req, res) {
    const id = Number(req.params.id);

    if (!store.findById(id)) {
        return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const { valid, errors } = validateReserva(req.body, { partial: false });
    if (!valid) {
        return res.status(400).json({ errors });
    }

    const datos = sanitizeReserva(req.body);

    if (store.findConflicto(datos.pista, datos.franja, id)) {
        return responderConflicto(res, datos.pista, datos.franja, id);
    }

    res.status(200).json(store.replace(id, datos));
}

// PATCH /reservas/:id  — actualiza solo los campos recibidos
function patchReserva(req, res) {
    const id = Number(req.params.id);
    const actual = store.findById(id);

    if (!actual) {
        return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const { valid, errors } = validateReserva(req.body, { partial: true });
    if (!valid) {
        return res.status(400).json({ errors });
    }

    const datos = sanitizeReserva(req.body);

    // Se comprueba la combinacion RESULTANTE: lo que llega mezclado con lo que habia
    const pistaFinal = datos.pista ?? actual.pista;
    const franjaFinal = datos.franja ?? actual.franja;

    if (store.findConflicto(pistaFinal, franjaFinal, id)) {
        return responderConflicto(res, pistaFinal, franjaFinal, id);
    }

    res.status(200).json(store.patch(id, datos));
}

// DELETE /reservas/:id
function deleteReserva(req, res) {
    const id = Number(req.params.id);

    if (!store.remove(id)) {
        return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.status(204).end();
}

module.exports = {
    listReservas, getStats, getReserva,
    createReserva, replaceReserva, patchReserva, deleteReserva
}; 