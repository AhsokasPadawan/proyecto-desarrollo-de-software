---
name: developer-support-skills
description: Guía de skills utilitarias de soporte al desarrollo y directiva de proactividad para agentes de IA al detectar dudas, relevos, conflictos o necesidades de aprendizaje.
---

# Skills Utilitarias de Soporte al Desarrollador y Guía de Proactividad para Agentes

En este proyecto grupal, además de las skills principales del ciclo de vida (`grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`), existen **skills utilitarias** diseñadas para asistir a los integrantes del equipo en momentos clave del desarrollo cotidiano.

> [!IMPORTANT]
> **Directiva para el Agente de IA:** Las personas suelen olvidar los nombres de estas skills o cuándo dispararlas. **El agente DEBE sugerir activamente la skill pertinente** cuando identifique en la conversación los disparadores (*triggers*) descritos a continuación.

---

## Catálogo de Skills Utilitarias

### 1. `to-questionnaire`
* **Propósito:** Transformar una duda o decisión que no se puede responder en solitario en un cuestionario estructurado en Markdown (`to-questionnaire-<slug>.md`) para enviarlo a otra persona o debatirlo en la reunión grupal.
* **Cuándo debe usarla el desarrollador:**
  * Cuando no conoce un requerimiento de negocio o regla del juego y necesita consultarlo con el docente o un compañero.
  * Cuando se enfrenta a una decisión arquitectónica o de diseño que prefiere consensuar con el equipo en lugar de tomarla por su cuenta.
* **Disparadores para que el agente la sugiera:**
  * El usuario dice frases como *"no sé cómo debería comportarse esto"*, *"tendría que preguntarle a los chicos"* o *"no estoy seguro de qué pide la cátedra"*.
  * El agente detecta que resolver un punto requiere información externa que el usuario actual no posee.
  * *Sugerencia modelo del agente:* *"Como esta decisión afecta la arquitectura grupal, te sugiero usar la skill `/to-questionnaire` para armar una lista de preguntas claras y discutirla con tu equipo antes de implementar."*

---

### 2. `wait-what`
* **Propósito:** Frenar al agente cuando una explicación técnica previa resultó densa, confusa o fuera de foco, forzándolo a replantear la idea con contexto claro, lenguaje técnico simplificado y utilizando el vocabulario ubicuo del dominio.
* **Cuándo debe usarla el desarrollador:**
  * Cuando el agente produce una respuesta larga o compleja y el desarrollador no terminó de entender hacia dónde va o qué propone.
* **Disparadores para que el agente la sugiera:**
  * El usuario responde con confusión: *"no entiendo nada"*, *"¿cómo?"*, *"¿a qué te refieres con eso?"*, *"me perdí"*.
  * El usuario solicita reformular de forma más simple.
  * *Sugerencia modelo del agente:* *"Parece que mi explicación anterior fue demasiado compleja o confusa. Recuerda que puedes usar `/wait-what` para que repita la propuesta desde cero con un enfoque más directo y claro."*

---

### 3. `handoff`
* **Propósito:** Compactar el estado actual de la conversación, el trabajo realizado, los archivos modificados, las decisiones tomadas y los próximos pasos en un documento de relevo (`handoff`) para que otro integrante del equipo o una nueva sesión limpia de IA pueda continuar la tarea sin pérdida de contexto.
* **Cuándo debe usarla el desarrollador:**
  * Cuando necesita que otro compañero tome la posta de la tarea que está desarrollando.
  * Al finalizar una jornada de trabajo para retomar al día siguiente.
  * Cuando la sesión de chat acumula demasiados mensajes y conviene abrir una sesión fresca para evitar saturar el contexto del agente.
* **Disparadores para que el agente la sugiera:**
  * La conversación se extiende considerablemente o se completa un hito intermedio de un ticket grande.
  * El usuario menciona *"por hoy corto acá"*, *"esto lo va a seguir mi compañero"* o *"mañana sigo con esto"*.
  * *Sugerencia modelo del agente:* *"Has avanzado bastante en este ticket. Para que tu compañero pueda continuarlo fácilmente (o para que retomes en una sesión limpia sin perder contexto), ¿quieres que usemos la skill `/handoff` para generar el resumen de relevo?"*

---

### 4. `resolving-merge-conflicts`
* **Propósito:** Guiar al desarrollador paso a paso para resolver conflictos de Git al hacer `merge` o `rebase` contra `main`. Identifica el origen y la intención de ambos cambios en disputa, resuelve cada bloque preservando ambas lógicas sin inventar comportamiento y valida la suite de tests antes de finalizar el merge.
* **Cuándo debe usarla el desarrollador:**
  * Cuando Git reporta conflictos al intentar actualizar su rama con los cambios más recientes de `main` o al preparar un PR.
* **Disparadores para que el agente la sugiera:**
  * Salidas de comandos en la terminal que indican `CONFLICT (content): Merge conflict in...` o `Automatic merge failed`.
  * El usuario expresa frustración o dudas sobre cómo resolver colisiones entre su código y el de sus compañeros.
  * *Sugerencia modelo del agente:* *"Detecto conflictos de merge en tu rama. Te sugiero que utilicemos la skill `/resolving-merge-conflicts` para analizar la intención de cada cambio y resolver los conflictos de forma metódica y segura."*

---

### 5. `teach`
* **Propósito:** Actuar como tutor pedagógico interactivo para explicar cómo funciona una porción de código, qué patrones de diseño se aplicaron y cómo justificar técnicamente las decisiones tomadas.
* **Cuándo debe usarla el desarrollador:**
  * Para comprender a fondo el código que generó con ayuda del agente antes de defenderlo o darlo por cerrado.
  * Para revisar y entender el código que un compañero de equipo escribió con su respectivo agente durante la etapa de Code Review.
  * Para prepararse de cara a la defensa oral individual frente a los docentes.
* **Disparadores para que el agente la sugiera:**
  * Al finalizar la implementación de una lógica o patrón no trivial (ej. cálculo de jaque, Command para Undo, State).
  * Cuando el usuario debe revisar un PR de un compañero y necesita entender la lógica subyacente antes de otorgar su aprobación.
  * El usuario pregunta *"¿cómo funciona exactamente esto que acabamos de hacer?"*.
  * *Sugerencia modelo del agente:* *"Hemos completado esta lógica utilizando patrones de diseño. Para que estés $100\%$ seguro de cómo defenderla y responder preguntas en la materia, ¿quieres que usemos la skill `/teach` para repasar los conceptos clave?"*
