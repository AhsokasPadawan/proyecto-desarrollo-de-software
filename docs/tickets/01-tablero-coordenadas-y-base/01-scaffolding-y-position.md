# 01: Scaffolding del Proyecto y Objeto de Valor `Position`

**What to build:** Inicializar el entorno en `proyect/` con TypeScript, Vite, React, Tailwind CSS y Vitest ejecutando tests en memoria en milisegundos, junto con el Value Object inmutable `Position` (coordenadas enteras 0-indexed `(row, col)`, aritmética de desplazamiento vectorial `offset`, igualdad por valor `equals` y conversión hacia/desde notación algebraica como `'e2'`).

**Blocked by:** None (can start immediately)

**Branch:** `ticket/01-scaffolding-y-position`

**Status:** Done

## Acceptance Criteria

- [x] `proyect/` cuenta con configuración funcional de TypeScript estricto, Vite, React, Tailwind CSS y script `npm test` con Vitest corriendo en memoria sin dependencias externas en `src/core/`.
- [x] `Position` es inmutable (`readonly row: number`, `readonly col: number`), valida que las coordenadas sean números enteros y no acopla un límite fijo de `8`.
- [x] `position.offset(deltaRow, deltaCol)` retorna una nueva instancia de `Position` desplazada y `position.equals(other)` compara igualdad por valor.
- [x] Provee conversión bidireccional con notación algebraica (`Position.fromAlgebraic('e2')` $\leftrightarrow$ `toAlgebraic()`) donde `'a1'` corresponde a `(row: 0, col: 0)`.
- [x] Suite de tests unitarios bajo el patrón **AAA** en memoria cubriendo creación, desplazamientos, igualdad y conversión algebraica.
