# 24: Sincronización Final de Diagrama UML, Documento de Justificación y Ensayo de Defensa

**What to build:** Auditar el código fuente final de las 6 épicas contra el Diagrama de Clases UML en [`docs/architecture.md`](../../architecture.md) para garantizar cero *drift*, consolidar el **Design Justification Document** bajo el marco *What / Why / When to Break* y documentar el paso a paso cronometrado ($< 15\text{ min}$) de la prueba de estrés para la defensa individual.

**Blocked by:** `16-tablas-triple-repeticion`, `18-enroque-y-captura-al-paso`, `23-panel-control-historial-y-selector-ia`

**Branch:** `ticket/24-sincronizacion-uml-y-justificacion-defensa`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] Cada clase, interfaz, método público y relación en el Diagrama de Clases UML de `docs/architecture.md` coincide exactamente con el código en `proyect/src/core/` (cero *drift*).
- [ ] Se consolida `docs/design-justification.md` integrando los 12 ADRs bajo la estructura **What / Why / When to Break** exigida por la cátedra.
- [ ] Toda la suite de tests unitarios en Vitest y el build de producción (`npm run build`) ejecutan al $100\%$ en verde sin advertencias de tipos.
- [ ] Incluye guía práctica verificada para inyectar una pieza híbrida o alterar las dimensiones del tablero en menos de 5 minutos durante el coloquio individual.
