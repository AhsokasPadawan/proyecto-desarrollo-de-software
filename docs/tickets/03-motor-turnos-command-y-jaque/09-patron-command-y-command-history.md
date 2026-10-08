# 09: Patrón `Command` (`MoveCommand`) y `CommandHistory` (`Undo` / `Redo`)

**What to build:** Implementar el contrato `ICommand`, la clase `MoveCommand` que ejecuta y revierte mutaciones *in-place* sobre `Board` (`execute()` y `undo()`), y el administrador `CommandHistory` con pilas de `undo` y `redo` garantizando la invariante $\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$.

**Blocked by:** `02-board-mutable-y-board-query`, `03-contratos-pieza-y-setup-estandar`

**Branch:** `ticket/09-patron-command-y-command-history`

**Status:** Done

## Acceptance Criteria

- [x] `MoveCommand.execute()` mueve la pieza de `from` a `to` sobre `Board` y guarda la referencia a `capturedPiece` (si existía).
- [x] `MoveCommand.undo()` devuelve la pieza movida a `from` y restaura `capturedPiece` en `to`, dejando el `Board` idéntico al estado previo ($\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$).
- [x] `CommandHistory` gestiona `executeCommand(cmd)`, `undo()`, `redo()`, `canUndo` y `canRedo`, vaciando la pila de `redo` cuando se ejecuta un nuevo comando tras haber deshecho jugadas.
- [x] Suite de tests unitarios **AAA** en memoria verificando secuencias múltiples de `execute` $\rightarrow$ `undo` $\rightarrow$ `redo` con y sin capturas.
