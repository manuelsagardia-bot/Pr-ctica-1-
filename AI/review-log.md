# Registro de revisión del agente

Cada entrada documenta qué se pidió, qué devolvió el agente, qué se aceptó, qué
se corrigió o rechazó, y el motivo.

---

## 1 · Comprobaciones de los límites numéricos

**Se pidió:** generar comprobaciones para el campo `pista`.

**Devolvió:** tres casos — `pista: 0`, `pista: 19` y `pista: "tres"`.

**Se aceptó con una corrección.** Faltaban los **límites válidos**: un validador
escrito con `<` en lugar de `<=` pasaría las tres pruebas del agente y seguiría
rechazando la pista 1 y la 18.

**Se añadieron** los casos `pista: 1` y `pista: 18`, que deben ser aceptados.

**Motivo:** probar solo lo que falla no detecta un rango desplazado en uno. Hay
que probar también el primer valor válido y el último.

---

## 2 · Número de incidencias en un cuerpo vacío

**Se pidió:** una comprobación para `POST /reservas` con el cuerpo `{}`.

**Devolvió:** una comprobación de que responde `400`.

**Se amplió.** Además del código, se comprueba que `errors` contiene **5**
elementos.

**Motivo:** el contrato promete devolver *todas* las incidencias. Un validador
que devolviera solo la primera también respondería `400` y pasaría la prueba del
agente. Contar los errores es lo que verifica la promesa real.

---

## 3 · Limpieza de la colección tras las pruebas

**Se pidió:** probar `POST` y `DELETE`.

**Devolvió:** una secuencia que creaba tres reservas de prueba y no las borraba.

**Se rechazó** y se añadió a la configuración del agente la instrucción de dejar
la colección como la encontró.

**Motivo:** la segunda ejecución partía de un estado distinto a la primera. La
comprobación del `409` empezó a fallar porque las pistas que el agente daba por
libres ya estaban ocupadas por sus propias pruebas anteriores.

---

## 4 · Agente auxiliar de clases CSS

Herramienta de desarrollo (`.claude/agents/clases-css.md`). **No es el agente
evaluado** —ese es el tester de caja negra— pero se documenta por transparencia.

**Problema detectado al revisar su configuración:** apuntaba a `styles.css` y
hablaba de "las seis páginas HTML", que es el sitio de la Tarea 2. Al crearse el
cliente de la práctica en `public/`, el agente habría escrito las clases de la
tabla de reservas en el fichero equivocado.

**Se corrigió:** se documentaron las dos hojas con sus bloques numerados, se le
ordenó preguntar cuando no esté claro a cuál va la clase, y se añadieron a la
paleta los dos colores propios del cliente (`#f4f6f8` y `#c0392b`).

**Motivo:** un agente con contexto desactualizado no falla de forma visible
—devuelve CSS correcto— sino que lo escribe en el sitio equivocado. Es un error
que solo se detecta revisando su configuración, no su salida.