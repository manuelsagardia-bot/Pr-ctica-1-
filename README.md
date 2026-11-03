# Práctica 1 — API de reservas de pista

**Programación de Aplicaciones Web (G247) · CUNEF Escuela Politécnica Superior**
Club Deportivo Pádel Moncloa

## Integrantes

Manuel Sagardia

## Recurso

El recurso gestionado son las **reservas de pista** del club. El club dispone de
**18 pistas** —las 1 a 6 interiores y las 7 a 18 exteriores— y **3 franjas
horarias**, lo que da 54 huecos reservables.

```json
{
  "id": 1,
  "socio": "Ana Gómez",
  "pista": 3,
  "duracion": 90,
  "pagada": false,
  "franja": "manana"
}
```

### Campos

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | número | lo genera el servidor. Si el cliente lo envía, se ignora |
| `socio` | texto | obligatorio, no vacío, máximo 80 caracteres |
| `pista` | número | entero, entre 1 y 18 |
| `duracion` | número | entero, entre 60 y 120 minutos |
| `pagada` | booleano | `true` o `false` |
| `franja` | texto | una de: `manana`, `tarde`, `noche` |

El **tipo de pista** (interior o exterior) no se almacena: se deduce del número
de pista. Guardar los dos sería redundante y podrían desincronizarse.

## Instalación y arranque

Requiere **Node.js 18 o superior**.

```bash
npm install
npm start
```

El servidor queda escuchando en `http://localhost:3000`. La variable de entorno
`PORT` permite cambiar el puerto; si no está definida, se usa el 3000.

El cliente web se abre en `http://localhost:3000/`.

## Endpoints

| Método | Ruta | Éxito | Error |
|---|---|---|---|
| `GET` | `/reservas` | `200` + array | — |
| `GET` | `/reservas/stats` | `200` + resumen | — |
| `GET` | `/reservas/:id` | `200` + objeto | `404` |
| `POST` | `/reservas` | `201` + `Location` + objeto | `400`, `409` |
| `PUT` | `/reservas/:id` | `200` + objeto | `400`, `404`, `409` |
| `PATCH` | `/reservas/:id` | `200` + objeto | `400`, `404`, `409` |
| `DELETE` | `/reservas/:id` | `204` sin cuerpo | `404` |

### Parámetros de consulta de `GET /reservas`

Todos son opcionales y combinables entre sí.

| Parámetro | Valores | Qué hace |
|---|---|---|
| `search` | texto | busca en `socio`, parcial y sin distinguir mayúsculas |
| `pagada` | `true` \| `false` | filtra por el campo booleano |
| `tipo` | `interior` \| `exterior` | filtra por tipo de pista |
| `franja` | `manana` \| `tarde` \| `noche` | filtra por franja |
| `sort` | `socio` \| `duracion` \| `pista` | campo de ordenación |
| `order` | `asc` \| `desc` | dirección. Por defecto `asc` |
| `limit` | entero > 0 | cuántos resultados devolver |
| `offset` | entero >= 0 | cuántos saltarse |

Ejemplo:

```
GET /reservas?search=ana&tipo=interior&sort=duracion&order=desc&limit=5
```

### Códigos de estado

| Código | Cuándo |
|---|---|
| `200` | lectura o actualización correctas |
| `201` | recurso creado. Incluye la cabecera `Location` |
| `204` | borrado correcto, sin cuerpo de respuesta |
| `400` | datos de entrada inválidos |
| `404` | el recurso no existe |
| `409` | la pista ya está reservada en esa franja |
| `500` | error interno. No se envían trazas al cliente |

## Ejemplos

**Crear una reserva**

```bash
curl -i -X POST http://localhost:3000/reservas \
  -H "Content-Type: application/json" \
  -d '{"socio":"Carlos Ruiz","pista":5,"duracion":90,"pagada":false,"franja":"manana"}'
```

```
HTTP/1.1 201 Created
Location: /reservas/6

{"id":6,"socio":"Carlos Ruiz","pista":5,"duracion":90,"pagada":false,"franja":"manana"}
```

**Errores de validación: se devuelven todos juntos**

```bash
curl -X POST http://localhost:3000/reservas \
  -H "Content-Type: application/json" \
  -d '{"socio":"","pista":99,"duracion":30,"franja":"madrugada"}'
```

```
HTTP/1.1 400 Bad Request

{
  "errors": [
    { "field": "socio",    "message": "socio no puede estar vacio" },
    { "field": "pista",    "message": "pista debe estar entre 1 y 18" },
    { "field": "duracion", "message": "duracion debe estar entre 60 y 120 minutos" },
    { "field": "pagada",   "message": "pagada debe ser true o false" },
    { "field": "franja",   "message": "franja debe ser una de: manana, tarde, noche" }
  ]
}
```

**Pista ocupada**

```
HTTP/1.1 409 Conflict

{
  "error": "Pista no disponible",
  "message": "La pista 3 ya esta reservada en la franja de manana",
  "pistasDisponibles": [1, 2, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18]
}
```

**Resumen**

```bash
curl http://localhost:3000/reservas/stats
```

```json
{
  "total": 5,
  "pagadas": 2,
  "pendientes": 3,
  "duracionMedia": 84,
  "porTipo": { "interior": 2, "exterior": 3 },
  "porFranja": { "manana": 2, "tarde": 2, "noche": 1 },
  "huecosTotales": 54,
  "huecosLibres": 49
}
```

El resumen **se calcula en cada petición**, nunca se almacena. Si se guardara,
cada escritura tendría que acordarse de actualizarlo y antes o después se
desincronizaría.

## Regla de negocio

Una pista solo puede tener **una reserva por franja horaria**. Al intentar
reservar una combinación ocupada, la API responde `409 Conflict` indicando qué
pistas quedan libres en esa franja.

Se usa `409` y no `400` porque la petición está bien formada: el problema es que
choca con el estado actual del recurso. Y no es `404` porque no falta nada.

La comprobación se aplica en `POST`, `PUT` y `PATCH`. En las dos últimas se
excluye la propia reserva del cálculo, para que al editarla sin cambiar de pista
no choque consigo misma. En `PATCH` se comprueba la **combinación resultante**:
la franja que llega mezclada con la pista que ya tenía.

## Política de parámetros desconocidos

**Se ignoran.** Un parámetro de consulta que no se reconozca, o un valor mal
formado, no detiene el servidor ni devuelve error: simplemente no se aplica.

- `sort` se valida contra una **lista blanca** (`socio`, `duracion`, `pista`).
  Un `sort=admin` se ignora y no se ordena.
- `limit` y `offset` solo se aplican si son enteros válidos; si no, se usan los
  valores por defecto.
- `pagada` solo se aplica con los textos `"true"` o `"false"`.

En el cuerpo de las peticiones la política es la misma pero más estricta: una
**lista blanca** copia únicamente los seis campos conocidos. Los campos
desconocidos no se persisten y un `id` enviado por el cliente se ignora.

## Contenido estático

El cliente web vive en `public/` y lo sirve el propio Express:

```js
app.use(express.static(path.join(__dirname, "..", "public")));
```

Se instala en `src/app.js`, **después** de los middleware y **antes** del router
de la API.

**Por qué ahí:** sirviendo la página desde el mismo Express, la web y la API
comparten origen (`localhost:3000`). El navegador las considera un único sitio y
el `fetch` del cliente no choca con CORS. Si la página se abriera con doble clic
sería `file://` —otro origen— y el navegador bloquearía las peticiones.

Va antes del router porque una petición a `/styles.css` debe resolverse sin
llegar a la API.

## Por qué el filtrado se hace en el servidor

El cliente no filtra: construye la query string con `URLSearchParams` y vuelve a
pedir la lista a la API.

Filtrar en el cliente obligaría a descargar **la colección entera** para mostrar
tres filas. Con 54 huecos da igual, pero el planteamiento no escala: el día que
haya miles de reservas, el navegador tendría que traerlas todas en cada búsqueda.

Además, el servidor es el único sitio donde el filtro es fiable: un filtro de
cliente se puede saltar, y cuando en el bloque II haya autenticación, filtrar en
el servidor será también una cuestión de seguridad.

## PUT frente a PATCH

Los dos actualizan, pero no igual.

| | Qué hace | Lo que no envías |
|---|---|---|
| `PUT` | **sustituye** el recurso completo | desaparece |
| `PATCH` | **modifica** solo los campos recibidos | se conserva |

En el código la diferencia son dos líneas de `src/data/store.js`:

```js
// PUT: construye el objeto de cero, conservando solo el id
const reserva = { id, ...datos };

// PATCH: parte de lo que habia y encima aplica lo que llega
reservas[index] = { ...reservas[index], ...datos };
```

`PUT` es **idempotente**: repetirlo diez veces deja el mismo resultado que una,
porque siempre se envía el estado final completo.

La validación también cambia: `POST` y `PUT` usan validación completa
(`partial: false`); `PATCH` usa validación parcial (`partial: true`), que solo
comprueba los campos presentes.

**El cliente usa `PUT`** al editar, porque su formulario contiene todos los
campos y al guardar envía el recurso entero. `PATCH` tendría sentido para una
acción parcial, como un botón de "marcar como pagada" que enviara solo
`{ "pagada": true }`.

## Estructura del proyecto

```
practica1-padel/
├── package.json
├── README.md
├── src/
│   ├── app.js                      configura Express y exporta la app
│   ├── server.js                   unica llamada a app.listen
│   ├── middleware/logger.js        una linea METHOD URL por peticion
│   ├── routes/reservas.js          URL -> funcion del controlador
│   ├── controllers/                lee la peticion y decide la respuesta
│   │   └── reservasController.js
│   ├── data/store.js               almacenamiento en memoria
│   └── validators/
│       └── reservaValidator.js     reglas de cada campo
├── public/                         cliente web, HTML + CSS + JS vanilla
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── AI/
    ├── agents.md
    └── review-log.md
```

`app.js` **no llama a `listen`**: construye la aplicación y la exporta. Así se
puede importar en pruebas sin abrir un puerto. Abrir el puerto es trabajo
exclusivo de `server.js`.

## Cliente web

HTML, CSS y JavaScript sin frameworks ni librerías.

- Listado, formulario de creación y botones de editar y borrar por fila
- La interfaz se actualiza sin recargar la página
- Indicador visible mientras hay una petición en curso
- Mensajes de error legibles y estado explícito de lista vacía
- Buscador y filtros que construyen la consulta para la API
- Validación inicial en cliente, y los errores del `400` se muestran junto a
  cada campo gracias al `field` de cada incidencia
- Cabecera en Flexbox, zona principal en Grid, foco visible y un breakpoint en
  768 px

Todas las respuestas se comprueban con `response.ok`, porque `fetch` no trata un
`404` o un `500` como error: solo rechaza la promesa si no hay respuesta.