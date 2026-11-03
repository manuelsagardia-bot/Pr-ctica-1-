# Práctica 1 — API de reservas

**Programación de Aplicaciones Web (G247) · CUNEF**
Club Deportivo Pádel Moncloa

## Integrantes

Manuel Sagardia

## Recurso

El recurso gestionado son las **reservas de pista** del club.

```json
{
  "id": 1,
  "socio": "Ana Gómez",
  "duracion": 90,
  "pagada": false,
  "pista": "interior",
  "franja": "manana"
}
```

## Campos

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | número | lo genera el servidor. Si el cliente lo envía, se ignora |
| `socio` | texto | obligatorio, no vacío, máximo 80 caracteres |
| `duracion` | número | entero, entre 60 y 120 minutos |
| `pagada` | booleano | `true` o `false`. Por defecto `false` |
| `pista` | texto | uno de: `interior`, `exterior`, `central` |