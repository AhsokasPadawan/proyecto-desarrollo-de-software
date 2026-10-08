# Mission: Dominio, Arquitectura y Código del Chess TPO

## Why
Dominar la arquitectura de software, los patrones de diseño GoF, las decisiones técnicas y el código fuente del proyecto Chess TPO para poder defender el proyecto ante la cátedra universitaria con solidez conceptual, capacidad de realizar modificaciones en vivo (< 5 minutos) y comprensión profunda de cómo se construyó cada épica y ticket.

## Success looks like
- Explicar la razón técnica de cada una de las 12 decisiones de diseño (ADRs) bajo el esquema *What / Why / When to Break*.
- Identificar y explicar el rol y código de los 6 patrones de diseño GoF aplicados (State, Command, Observer, Strategy de Movimiento, Strategy de IA, Factory/Factory Method).
- Rastrear el flujo de datos completo: desde una interacción de usuario en el adaptador web React hasta las reglas atómicas en el Core y el retorno mediante el snapshot del Observer.
- Describir con exactitud qué hace cada archivo en `proyect/src/core` y `proyect/src/adapters/web`.
- Aprobar la "prueba de fuego" de la cátedra: inyectar en vivo una pieza de Fairy Chess o redimensionar el tablero sin tocar código existente en menos de 5 minutos.
- Completar y marcar como superado cada uno de los 7 módulos del temario de aprendizaje.

## Constraints
- Estricto apego a las buenas prácticas del proyecto: código auto-documentado, nada de comentarios explicativos redundantes, cero `useEffect` para sincronizaciones de estado, y tablas de mapeo (*Lookup Tables*) en lugar de condicionales `switch` extensos.
- Pedagogía interactiva con retroalimentación inmediata, evaluación de comprensión profunda (*storage strength*) y ejemplos basados estrictamente en el código existente.

## Out of scope
- Infraestructura de backend persistente (bases de datos relacionales, WebSockets, autenticación de usuarios).
- Optimización extrema a nivel de micro-ensamblador o bitboards de 64 bits para motores de competencia profesional.
