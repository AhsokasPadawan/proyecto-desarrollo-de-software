# Teaching Notes & User Preferences

## Preferencias del Estudiante y Reglas de Aprendizaje

- **Estructura del Aprendizaje**:
  - Seguir el progreso cronológico y modular: épica a épica, ticket a ticket (24 tickets en 6 épicas).
  - Identificar qué archivos fueron creados en cada ticket y con qué propósito.
  - Entender a fondo la justificación técnica de las decisiones (ADRs) bajo el esquema *What / Why / When to Break*.
  - Comprender cómo se conectan las partes entre sí (inward dependencies, puertos, contratos, flujos).
  - Saber qué significa y cómo opera cada sección del código fuente.
  - Explicar exhaustivamente los patrones de diseño GoF exigidos por la cátedra (**State**, **Command**, **Observer**, **Strategy de Movimiento**, **Strategy de IA**, **Factory / Factory Method**) utilizando los ejemplos exactos del código implementado.

## Reglas de Codificación y Estilo Activas

1. **Evitar condicionales `switch` extensos**:
   - Preferir siempre un objeto de mapeo (*Lookup Table*) o polimorfismo en lugar de bloques `switch` / `case`.
2. **Uso de `useEffect` como última opción**:
   - Cero `useEffect` para reaccionar a estados locales o provocar redirecciones. El flujo de eventos nace y se maneja directamente en controladores de eventos (`onClick`, callbacks).
3. **Código auto-documentado**:
   - Cero comentarios explicativos o de sección en el código. Nombres descriptivos y semánticos.

## Registro de Progreso

- **Módulo 0**: [Pendiente] Visión Arquitectónica y Catálogo GoF Requerido por Cátedra
- **Módulo 1**: [Pendiente] Épica 1: Tablero, Coordenadas y Base (Tickets 01 - 04)
- **Módulo 2**: [Pendiente] Épica 2: Piezas y Reglas Geométricas (Tickets 05 - 08)
- **Módulo 3**: [Pendiente] Épica 3: Motor de Turnos, Command y Jaque (Tickets 09 - 12)
- **Módulo 4**: [Pendiente] Épica 4: Fases, State y Condiciones de Fin (Tickets 13 - 16)
- **Módulo 5**: [Pendiente] Épica 5: Movimientos Especiales y Strategy de IA (Tickets 17 - 20)
- **Módulo 6**: [Pendiente] Épica 6: Adaptador Web y Entrega (Tickets 21 - 24)
- **Módulo 7**: [Pendiente] Simulación de Defensa Oral y Prueba de Fuego (< 5 min)
