---
name: token-saver
description: Reduce el consumo de tokens de salida de Claude en sesiones de desarrollo y trabajo técnico. Úsala SIEMPRE que el usuario trabaje con código (Angular, Spring Boot, TypeScript, Java, etc.), pida modificar scripts, revisar logs o analizar fragmentos largos, o mencione ahorrar tokens, respuestas cortas, "sin relleno", "solo el cambio", "menos consumo", /compact o contexto largo. También aplícala por defecto en sesiones de programación extensas aunque el usuario no lo pida explícitamente. Use whenever the user is coding, editing files, or wants terse, low-token answers.
---

# Token Saver

Los tokens de salida son el gasto principal de una sesión de desarrollo. Casi todo el desperdicio viene de tres hábitos: re-escribir código que no cambió, explicar lo obvio y repetir lo que el usuario ya dijo. Esta skill corta esos tres hábitos sin sacrificar corrección ni claridad.

**Principio rector:** cada token de la respuesta debe aportar algo que el usuario no tiene ya. Si el usuario puede deducirlo, verlo en su propio código o ya lo escribió, no lo incluyas.

**Excepción global:** si el usuario pide explícitamente una explicación detallada, un tutorial, una revisión completa o el archivo entero, tiene prioridad sobre estas reglas. Las reglas son el valor por defecto, no un tope contra su voluntad.

---

## 1. Comentarios y explicaciones mínimos

Los comentarios que describen lo que el código ya dice solo gastan tokens y ensucian el archivo.

- No escribas comentarios obvios o redundantes (`// incrementa el contador`, `// retorna el resultado`).
- Permitido: un micro-comentario de una sola línea cuando la lógica es compleja, no evidente, o es un hack de rendimiento / workaround con motivo no obvio.
- Fuera del código: máximo **dos oraciones**, y deben aportar valor arquitectónico (el porqué de una decisión, un trade-off, un riesgo). No narres qué hiciste paso a paso.

## 2. Cero bloques espejo

Re-renderizar código que no cambió es la mayor fuente de gasto de salida, porque el usuario ya lo tiene.

- No repitas funciones, imports, clases ni bloques que no sufrieron cambios.
- Sustituye las secciones intactas por un marcador de elipsis en la sintaxis del lenguaje:
  - TS/Java/JS: `// ... resto del código igual ...`
  - Python/YAML: `# ... resto del código igual ...`
  - HTML: `<!-- ... resto igual ... -->`
- Para que el usuario sepa dónde pegar, deja **una línea de ancla** (la firma del método o la línea inmediatamente anterior) alrededor del cambio. Sin ancla, la elipsis es ambigua.
- Si el cambio toca muchas partes dispersas o el usuario va a copiar el archivo completo, pregunta o entrega solo los fragmentos modificados, cada uno con su ancla.

Ejemplo:

```ts
// ... imports sin cambios ...
export class PermisosService {
  // ... resto del código igual ...
  cargarPermisos(empresaId: string) {
    return this.http.get<Permiso[]>(`${this.api}/permisos/${empresaId}`); // nuevo: filtra por tenant
  }
  // ... resto del código igual ...
}
```

## 3. No inventes archivos que no viste

Suponer la estructura de archivos vecinos genera código que no compila y obliga a regenerarlo, que cuesta el doble.

- Trabaja solo con lo que el usuario entregó en la conversación.
- Si el cambio depende de un archivo, tipo o servicio que no has visto, no lo inventes. Pide ese archivo en una línea (`Necesito ver X para ajustar Y`) o declara el supuesto en una frase.
- No crees archivos "de apoyo" ni refactors que nadie pidió.

## 4. Listas densas → tablas

Las viñetas anidadas con varios atributos por elemento gastan mucho formato y son difíciles de escanear.

- Si cada elemento de una lista tiene **más de dos atributos**, preséntala como tabla Markdown compacta (sin columnas de relleno ni celdas largas).
- Listas simples de un solo atributo siguen siendo viñetas o prosa; no fuerces una tabla para dos columnas triviales.

## 5. Estados monosilábicos

Cuando el resultado es una confirmación sin información nueva, la explicación del éxito es puro ruido.

- Tarea interna completada o configuración confirmada sin nada que reportar: responde solo `[OK]` o `[PROCESADO]`.
- Esto aplica únicamente cuando todo salió bien y no hay nada que el usuario necesite saber. Si hubo un error, una advertencia, un supuesto relevante, o el resultado es un archivo o dato que debe verse, repórtalo en una o dos líneas. Nunca ocultes un fallo detrás de `[OK]`.

## 6. Compresión proactiva de sesión

El historial se reenvía en cada turno; una sesión larga y repetitiva encarece todo lo que sigue.

- Si estimas que la conversación pasó de unos 15 mensajes, o que el historial acumula código redundante o versiones superadas, añade al final de la respuesta, una sola vez, esta línea exacta:
  `[Recomendación: Usa /compact o inicia un nuevo chat para limpiar contexto]`
- No la repitas en cada turno: avisa de nuevo solo si pasan muchos mensajes más.
- No recapitules ni resumas lo que el usuario dijo antes en la misma sesión para "demostrar que entendiste". El contexto ya está cargado; ve directo a la respuesta.

## 7. Aislamiento de la entrada

Devolver el código o los logs del usuario es pagar dos veces por lo mismo.

- Ante fragmentos largos, logs o datos, céntrate solo en la sección afectada.
- No cites ni reinyectes partes que no cambiaron. Si necesitas ubicar algo, refiérete a ello por nombre de función, línea o clase.
- Para logs: indica la línea o causa relevante y la corrección, no transcribas el stack trace.

---

## Antes de enviar, revisa

1. ¿Hay algún bloque de código que el usuario ya tiene? → elipsis con ancla.
2. ¿Algún comentario dice lo que el código ya dice? → bórralo.
3. ¿La explicación pasa de dos oraciones o repite lo que el usuario escribió? → recórtala.
4. ¿Es un `[OK]` legítimo, o hay algo que el usuario debe saber? → si hay algo, dilo.

## Antes / después

**Pedido:** "agrega validación de email al método `guardar`" (le pasaron el componente completo)

Antes (~180 líneas): componente entero reescrito + 3 párrafos explicando qué es un validador.

Después:

```ts
// ... imports sin cambios ...
guardar() {
  if (!this.form.controls.email.valid) return; // evita POST con email inválido
  // ... resto del código igual ...
}
```

El validador de Angular ya está en el `FormGroup`; solo faltaba cortar el flujo antes del POST.
