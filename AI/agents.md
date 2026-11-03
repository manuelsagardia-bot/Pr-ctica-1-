# Tester agent — Práctica 1

Agente de pruebas de caja negra para la API de reservas.

Recibe **únicamente el contrato** —la tabla de endpoints del README y la API en
ejecución— y genera comprobaciones HTTP. **No tiene acceso a la implementación**:
no ve `src/`, no sabe que el almacenamiento es un array ni cómo está escrito el
validador. Solo conoce lo que la API promete públicamente.

## Configuración del agente

Fichero `.claude/agents/tester-api.md` del repositorio:

```markdown
---
name: tester-api
description: Genera y ejecuta comprobaciones HTTP de caja negra contra la API de reservas en ejecucion. Usalo despues de cambiar un endpoint o antes de entregar.
tools: Bash, Read, Write
model: sonnet
---

Eres un tester de caja negra de una API REST que corre en http://localhost:3000.

## Lo unico que conoces

El contrato publicado en el README: la tabla de endpoints, los campos del
recurso y los codigos de estado. **No leas nada de src/.** Si necesitas saber
como se comporta la API, averiguralo haciendo peticiones, no leyendo codigo.
## Que tocas

Solo `AI/tester-log.md`. **No modificas ningun fichero de src/ ni de public/**:
tu trabajo es informar, no arreglar.

## Que compruebas

Por cada endpoint del contrato:
1. El camino correcto: codigo de estado y forma del cuerpo.
2. Cada error documentado: 400, 404, 409.
3. Los limites de cada campo: el valor minimo valido, el maximo valido,
   uno por debajo y uno por encima.
4. Que los parametros desconocidos o mal formados no tumban el servidor.
5. Que una peticion rechazada no modifica la coleccion.

## Como trabajas

- Usa `curl` y comprueba el codigo de estado con `-o /dev/null -w "%{http_code}"`.
- Deja la coleccion como la encontraste: lo que crees para probar, borralo.
- Si algo no coincide con el contrato, **no decidas quien tiene razon**:
  informa de lo que promete el contrato y de lo que responde la API.

## Que entregas

Una tabla: comprobacion, codigo esperado, codigo obtenido, resultado.
Y debajo, una lista de las discrepancias encontradas.
```

## Contrato recibido

El agente recibió la tabla de endpoints del README, la tabla de campos con sus
reglas, la tabla de códigos de estado y la regla de negocio del `409`. Nada más.

## Comprobaciones generadas

| # | Petición | Esperado |
|---|---|---|
| 1 | `GET /reservas` | 200 y array |
| 2 | `GET /reservas/1` | 200 y objeto con `id: 1` |
| 3 | `GET /reservas/9999` | 404 |
| 4 | `GET /reservas/stats` | 200, y `huecosTotales` = 54 |
| 5 | `POST` con cuerpo válido en pista libre | 201 y cabecera `Location` |
| 6 | `POST` con `socio: ""` | 400 |
| 7 | `POST` con `pista: 0` y con `pista: 19` | 400 en ambos |
| 8 | `POST` con `pista: 1` y con `pista: 18` | válidos, no deben dar 400 |
| 9 | `POST` con `duracion: 59` y `duracion: 121` | 400 en ambos |
| 10 | `POST` con `duracion: 60` y `duracion: 120` | válidos |
| 11 | `POST` con `franja: "madrugada"` | 400 |
| 12 | `POST` con cuerpo vacío `{}` | 400 con **5** incidencias |
| 13 | `POST` repitiendo pista y franja | 409 con `pistasDisponibles` |
| 14 | Longitud de la colección antes y después de un 400 | no cambia |
| 15 | `POST` con `{"id": 999, ...}` | el `id` del cuerpo se ignora |
| 16 | `POST` con un campo inventado | no aparece en la respuesta |
| 17 | `PUT` sin un campo obligatorio | 400 |
| 18 | `PUT /reservas/9999` | 404 |
| 19 | `PUT` dejando la misma pista y franja | 200, no 409 |
| 20 | `PATCH` con solo `{"pagada": true}` | 200, el resto se conserva |
| 21 | `PATCH /reservas/9999` | 404 |
| 22 | `DELETE` de una reserva existente | 204 y cuerpo vacío |
| 23 | `DELETE` dos veces del mismo id | 204 y luego 404 |
| 24 | `GET /reservas?sort=admin` | 200, se ignora, no 500 |
| 25 | `GET /reservas?limit=abc` | 200, se ignora, no 500 |
| 26 | `GET /reservas?search=ANA` | 200, encuentra "Ana Gómez" |
| 27 | `GET /reservas?limit=2&offset=1` | distinto de `offset=0` |
| 28 | `GET /ruta-inexistente` | 404 en JSON, no HTML |

## Por qué el agente no ve el código

Un tester que lee la implementación acaba escribiendo pruebas que confirman lo
que el código hace, no lo que el contrato promete. Si el validador tuviera un
fallo, un tester con acceso al código lo daría por bueno.

Dándole solo el contrato, cualquier diferencia entre lo prometido y lo que
responde la API sale a la luz.
## Registro de la ejecucion

Ademas del informe en el chat, **anade una entrada al final de
`AI/tester-log.md`**.

Si el fichero no existe, crealo con esta cabecera:

    # Registro de ejecuciones del tester agent

    Cada entrada la genera el agente tester-api tras una ejecucion completa.

Formato de cada entrada, siempre al final del fichero:

    ## AAAA-MM-DD HH:MM

    - **Comprobaciones ejecutadas:** N
    - **Pasan:** N  ·  **Fallan:** N
    - **Endpoints cubiertos:** GET /reservas, POST /reservas, ...

    ### Discrepancias

    | Comprobacion | Esperado | Obtenido |
    |---|---|---|
    | ... | 400 | 200 |

    Si no hay ninguna, escribe "Ninguna".

    ### Comprobaciones nuevas anadidas en esta ejecucion

    Las que no existian en ejecuciones anteriores, o "ninguna".

Usa la fecha y hora reales del sistema.

**Nunca borres ni reescribas entradas anteriores**: el registro solo crece.
Si la API no responde y no has podido ejecutar nada, no escribas en el registro.