const FRANJAS = ["manana", "tarde", "noche"];

const TOTAL_PISTAS = 18;
const DURACION_MIN = 60;
const DURACION_MAX = 120;

function validateReserva(body, { partial = false } = {}) {
    const errors = [];

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        return {
            valid: false,
            errors: [{ field: "body", message: "El cuerpo debe ser un objeto JSON" }]
        };
    }

    if (!partial || "socio" in body) {
        if (typeof body.socio !== "string") {
            errors.push({ field: "socio", message: "socio es obligatorio y debe ser texto" });
        } else if (body.socio.trim() === "") {
            errors.push({ field: "socio", message: "socio no puede estar vacio" });
        } else if (body.socio.trim().length > 80) {
            errors.push({ field: "socio", message: "socio no puede superar los 80 caracteres" });
        }
    }

    if (!partial || "pista" in body) {
        if (typeof body.pista !== "number" || !Number.isInteger(body.pista)) {
            errors.push({ field: "pista", message: "pista debe ser un numero entero" });
        } else if (body.pista < 1 || body.pista > TOTAL_PISTAS) {
            errors.push({ field: "pista", message: `pista debe estar entre 1 y ${TOTAL_PISTAS}` });
        }
    }

    if (!partial || "duracion" in body) {
        if (typeof body.duracion !== "number" || !Number.isInteger(body.duracion)) {
            errors.push({ field: "duracion", message: "duracion debe ser un numero entero" });
        } else if (body.duracion < DURACION_MIN || body.duracion > DURACION_MAX) {
            errors.push({
                field: "duracion",
                message: `duracion debe estar entre ${DURACION_MIN} y ${DURACION_MAX} minutos`
            });
        }
    }

    if (!partial || "pagada" in body) {
        if (typeof body.pagada !== "boolean") {
            errors.push({ field: "pagada", message: "pagada debe ser true o false" });
        }
    }

    if (!partial || "franja" in body) {
        if (typeof body.franja !== "string" || !FRANJAS.includes(body.franja)) {
            errors.push({ field: "franja", message: `franja debe ser una de: ${FRANJAS.join(", ")}` });
        }
    }

    return { valid: errors.length === 0, errors };
}

function sanitizeReserva(body) {
    const limpio = {};

    if (typeof body.socio === "string") {
        limpio.socio = body.socio.trim();
    }
    if (typeof body.pista === "number") {
        limpio.pista = body.pista;
    }
    if (typeof body.duracion === "number") {
        limpio.duracion = body.duracion;
    }
    if (typeof body.pagada === "boolean") {
        limpio.pagada = body.pagada;
    }
    if (typeof body.franja === "string") {
        limpio.franja = body.franja;
    }

    return limpio;
}

module.exports = {
    validateReserva,
    sanitizeReserva,
    FRANJAS,
    TOTAL_PISTAS,
    DURACION_MIN,
    DURACION_MAX
};