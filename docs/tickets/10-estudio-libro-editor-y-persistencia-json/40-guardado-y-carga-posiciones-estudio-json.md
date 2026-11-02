# 40: Guardado y Carga de Posiciones de Estudio de Libro desde el Adaptador JSON

**What to build:** Conectar la vista **"Estudio / Editor de Libro"** con el puerto `IChessLibraryRepository` inyectado en `ChessApp` para mostrar el catálogo de posiciones de estudio precargadas en `chess-library.json`, permitir cargar cualquiera de ellas con un clic para practicarla o editarla, y permitir guardar nuevas disposiciones creadas en el editor (con título y nota pedagógica) directamente en la base JSON.

**Blocked by:** `37-puerto-biblioteca-y-adaptador-json`, `39-editor-visual-tablero-y-paleta-piezas`

**Branch:** `ticket/40-guardado-y-carga-posiciones-estudio-json`

**Status:** Done

## Acceptance Criteria

- [x] `ChessApp` recibe `libraryRepositoryFactory?: () => IChessLibraryRepository` (con `JsonFileLibraryAdapter` por defecto) y carga las posiciones de estudio al ingresar a la sección.
- [x] El usuario visualiza la lista de posiciones de libro (`StudyPositionRecord`) con su título, turno inicial y descripción pedagógica, pudiendo cargarlas en el tablero o iniciar la partida de estudio con un clic.
- [x] El editor visual incluye un formulario compacto para ingresar título y descripción y guardar la disposición actual mediante `saveStudyPosition`, actualizando inmediatamente el catálogo.
- [x] Se añaden pruebas de integración con React Testing Library inyectando una implementación en memoria de `IChessLibraryRepository` que verifican la carga de posiciones precargadas y la creación y persistencia de una nueva posición de estudio.
