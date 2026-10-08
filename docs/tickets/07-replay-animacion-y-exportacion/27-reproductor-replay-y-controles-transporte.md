# 27: Reproductor de Replay In-Place, Controles de Transporte y Animación con Temporizadores Nativos

**What to build:** Implementar el modo de revisión in-place en el adaptador web. Al finalizar la partida, se muestra el botón `[Revisar Partida]` en el panel de control. Al activarlo, el tablero entra en modo solo lectura (`readOnly`, inhabilitando selección y clics de movimiento) y el motor rebobina las jugadas hasta el inicio. La sección de acciones se transforma en la barra de controles de transporte: `|<<` (Inicio), `<` (Anterior), `Play / Pausa` (animación automática), `>` (Siguiente), `>>|` (Final), selector de velocidad (`0.5s`, `1s`, `2s`), contador `"Jugada X de Y"` y botón `[Salir de Revisión]`. La animación se orquesta exclusivamente mediante temporizadores nativos de JavaScript desde los manejadores `onClick`, sin emplear `useEffect` reactivo para transiciones secundarias.

**Blocked by:** `25-modelo-dominio-historial-moverecord`

**Branch:** `ticket/27-reproductor-replay-y-controles-transporte`

**Status:** done

## Acceptance Criteria

- [x] Al finalizar la partida se habilita el botón `[Revisar Partida]` junto a `[Exportar Partida]`.
- [x] Al hacer clic en `[Revisar Partida]`, el tablero se bloquea a modo solo lectura y se rebobina la partida al inicio.
- [x] La barra de transporte implementa navegación manual paso a paso invocando `engine.undo()` y `engine.redo()` con actualización inmediata del tablero vía Observer.
- [x] El botón `Play` inicia la animación automática con avance periódico continuo respetando la velocidad seleccionada (`0.5s`, `1s`, `2s`) y cambiando el botón a `Pausa`.
- [x] La reproducción automática se detiene al llegar a la última jugada o al presionar `Pausa`, limpiando el temporizador nativo.
- [x] Cero dependencias de `useEffect` para encadenar avances automáticos o mutaciones secundarias.
- [x] El botón `[Salir de Revisión]` restaura la posición del tablero al estado final alcanzado en la partida y rehabilita el panel estándar.
- [x] Pruebas unitarias de integración en React Testing Library verificando la activación del modo replay, el avance manual y la detención de la animación.
