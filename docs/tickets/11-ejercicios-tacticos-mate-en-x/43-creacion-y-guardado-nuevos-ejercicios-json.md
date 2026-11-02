# 43: Creación y Guardado de Nuevos Ejercicios "Mate en $X$" desde el Editor hacia el JSON

**What to build:** Extender el Editor Visual de Tablero para permitir que el usuario guarde cualquier disposición personalizada no solo como posición de estudio libre, sino también como un nuevo ejercicio táctico de **"Mate en $X$ movimientos"** (especificando el título, la consigna y el número $X$ de movimientos para el mate), persistiendo el registro mediante `IChessLibraryRepository.saveMatePuzzle` en `chess-library.json`.

**Blocked by:** `40-guardado-y-carga-posiciones-estudio-json`, `42-catalogo-ui-ejercicios-y-feedback-resolucion`

**Branch:** `ticket/43-creacion-y-guardado-nuevos-ejercicios-json`

**Status:** Done

## Acceptance Criteria

- [x] En el Editor Visual de Tablero, el usuario puede optar por guardar la posición configurada como **"Nuevo Ejercicio Mate en $X$"**, definiendo el título y la cantidad de movimientos objetivo ($X \ge 1$).
- [x] Al confirmar el guardado, se invoca `IChessLibraryRepository.saveMatePuzzle` y el nuevo problema queda inmediatamente disponible en el catálogo de **"Ejercicios: Mate en $X$"**.
- [x] Se añaden pruebas de integración con React Testing Library verificando que un ejercicio creado desde el editor se persiste en el repositorio inyectado y puede abrirse y resolverse desde la vista de ejercicios.
