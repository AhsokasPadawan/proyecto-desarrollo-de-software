# 30: Controlador y Temporizador del Reloj de Ajedrez

**What to build:** Desarrollar el controlador del temporizador de ajedrez para el adaptador web, responsable de gestionar la cuenta regresiva independiente para Blancas y Negras en segundos, el estado de marcha/pausa, y la detección de caída de bandera. Debe soportar la configuración inicial de tiempos con presets (3m, 5m, 10m [default], 15m) y ajuste libre en minutos (+ / -), la alternancia de turnos al registrar jugadas, el inicio formal al pulsar "Iniciar Partida", y la pausa/reanudación controlada. Debe seguir la regla de cero abuso de `useEffect` encapsulando los intervalos de tiempo en controladores limpios.

**Blocked by:** `29-estado-dominio-timeout-y-transicion-core`

**Branch:** `ticket/30-controlador-temporizador-reloj-ajedrez`

**Status:** done

## Acceptance Criteria

- [x] Se implementa el módulo/hook `useChessClock` (o controlador equivalente) con tipado inmutable y funciones de acción directas (`start`, `pause`, `resume`, `switchTurn`, `reset`, `setTimeConfig`).
- [x] La configuración inicial por defecto fija 10 minutos (600 segundos) para cada jugador, permitiendo ajustes independientes entre 1 y 60 minutos.
- [x] El temporizador descuenta un segundo por ciclo únicamente para el jugador cuyo turno esté activo y cuando el reloj esté en estado de marcha (`RUNNING`).
- [x] Al llegar a cero segundos (`00:00`), se invoca inmediatamente el callback `onTimeout(timedOutColor)` y el reloj se detiene.
- [x] Provee indicadores de estado: tiempo formateado `mm:ss`, estado activo por jugador, y bandera `isLowTime` cuando el tiempo restante es menor a 30 segundos.
- [x] Se añaden pruebas unitarias aisladas en `tests/adapters/ChessClock.test.ts` empleando fake timers (`vi.useFakeTimers()`) verificando cuenta regresiva, alternancia y timeout.
