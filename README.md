# Silen — Asistente de agenda por Telegram

Bot personal en n8n que gestiona un calendario de Google desde Telegram, por texto o por voz. No es un chatbot genérico: solo responde a un usuario autorizado y solo hace una cosa, gestionar citas, pero la hace bien.

## Qué hace

- Recibe mensajes de Telegram (texto o nota de voz) y los interpreta con un agente LLM conectado a Google Calendar.
- Si el mensaje es un audio, lo descarga, lo transcribe con Whisper (OpenAI) y lo trata igual que un mensaje escrito.
- El agente entiende fechas relativas ("mañana", "el lunes que viene", "en dos semanas") y las convierte a la zona horaria de Madrid.
- Antes de borrar o modificar un evento, primero consulta el calendario para localizar el ID real — nunca improvisa un ID.
- Si falta información clave (título genérico, motivo ambiguo), pregunta antes de crear el evento.
- Filtra por `chat.id`: solo el propietario del bot puede darle órdenes.

## Automatizaciones adicionales

- **Recordatorio diario (8:00)** — resumen de lo que hay agendado para hoy.
- **Recordatorio nocturno (20:00)** — aviso de lo que toca mañana.
- **Resumen semanal (lunes 8:00)** — vista general de los próximos 7 días.

## Arquitectura

```
Telegram (texto/voz)
      │
      ▼
Filtro de usuario autorizado
      │
      ▼
Detección de tipo de mensaje ──► [voz] ──► Descarga + transcripción (Whisper)
      │
      ▼
Agente (GPT-4o + memoria de conversación)
      │
      ├── crear_evento
      ├── ver_agenda
      ├── eliminar_evento
      └── modificar_evento
      │
      ▼
Google Calendar
      │
      ▼
Respuesta por Telegram
```

Construido en [n8n](https://n8n.io/), usando el nodo de agente de LangChain con memoria de ventana (últimos 10 mensajes) y cuatro tools sobre la API de Google Calendar.

## Stack

- **n8n** — orquestación del flujo
- **Telegram Bot API** — entrada y salida de mensajes
- **OpenAI (GPT-4o + Whisper)** — razonamiento del agente y transcripción de voz
- **Google Calendar API** — lectura y escritura de eventos

## Configuración

1. Importar `silen_asistente.json` en n8n.
2. Crear credenciales para Telegram Bot API, OpenAI y Google Calendar OAuth2, y asignarlas a los nodos correspondientes.
3. Sustituir `TU_TELEGRAM_ID` (aparece en los nodos IF y en los de envío de mensajes) por tu ID numérico de Telegram.
4. Rellenar el campo `calendar` en los nodos de Google Calendar con el ID de tu calendario.
5. Activar el workflow.

## Notas de diseño

El prompt del agente fuerza un flujo de dos pasos para borrar o modificar eventos: primero `ver_agenda`, después la acción con el ID devuelto. Esto evita que el modelo alucine IDs de eventos, que era el fallo más habitual en las primeras versiones.

Las reglas de fecha/hora por defecto (09:00 si no se especifica hora, 30 minutos de duración si no se indica) están pensadas para minimizar preguntas de vuelta al usuario sin perder precisión.
