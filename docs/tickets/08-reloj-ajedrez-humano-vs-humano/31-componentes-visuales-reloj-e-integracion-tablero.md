# 31: Componentes Visuales del Reloj e Integración con el Tablero

**What to build:** Construir e integrar los componentes visuales de la experiencia de reloj en la interfaz:
1. `PlayerClockBar`: Franja horizontal con exactamente el ancho del tablero (474px), presentando el identificador del bando, tiempo digital en formato `mm:ss`, resaltado activo cuando es el turno del jugador y estilo de alerta roja parpadeante para tiempo bajo (< 30s).
2. Ubicación en el centro: Reloj de Negras inmediatamente arriba del marco del tablero, y reloj de Blancas inmediatamente debajo del tablero.
3. `ClockConfigSection`: Selector para activar el reloj en modo HvsH antes de iniciar, con presets rápidos (3m, 5m, 10m, 15m) y botones `+` / `-`.
4. Botón "Iniciar Partida" para arrancar el conteo de Blancas y botón "Pausar / Reanudar Tiempo".
5. Ocultar los botones de "Deshacer" y "Rehacer" en `GameActionBar` cuando la modalidad de reloj esté activa.

**Blocked by:** `30-controlador-temporizador-reloj-ajedrez`

**Branch:** `ticket/31-componentes-visuales-reloj-e-integracion-tablero`

**Status:** todo

## Acceptance Criteria

- [ ] `PlayerClockBar` renderiza el tiempo en formato digital `mm:ss` con ancho coincidente al tablero (474px) y estado visual activo.
- [ ] La franja del reloj de Negras se posiciona arriba del tablero y la de Blancas debajo del tablero.
- [ ] Cuando restan menos de 30 segundos, el reloj activo muestra estilos de advertencia (texto/borde rojo y animación sutil de pulso).
- [ ] En `ControlPanelView` se ofrece la opción de activar el reloj antes de iniciar, con controles independientes para Blancas y Negras (presets 3m, 5m, 10m, 15m y `+`/`-`).
- [ ] Al seleccionar jugar con reloj, los botones Deshacer y Rehacer desaparecen de `GameActionBar`.
- [ ] Durante la partida con reloj, se provee el botón "Pausar Tiempo" / "Reanudar Tiempo"; al estar pausado, el tablero no permite realizar movimientos.
- [ ] Se añaden pruebas de componentes en React Testing Library en `tests/adapters/PlayerClockBar.test.tsx` y `tests/adapters/ClockConfigSection.test.tsx`.
