# 26: Formateador de Transcripción Letra-Número y Exportador a Archivo `.txt`

**What to build:** Implementar el servicio formateador de partidas que traduce la colección `moveHistory` y el resultado final a una transcripción estructurada en formato letra-número (`e2 -> e4`), incluyendo cabecera con metadatos de la partida (Modo de Juego, Resultado y Total de Movimientos), agrupamiento por rondas de turnos y detalle de piezas/capturas. Implementar la acción de exportación en el adaptador web activable mediante el botón `[Exportar Partida]` visible al finalizar el juego, generando la descarga en memoria mediante `Blob` con nomenclatura `partida-ajedrez-YYYYMMDD-HHmm.txt`.

**Blocked by:** `25-modelo-dominio-historial-moverecord`

**Branch:** `ticket/26-generador-transcripcion-y-exportacion-txt`

**Status:** done

## Acceptance Criteria

- [x] Se implementa una función pura de formateo que genera el contenido de texto plano estructurado según el Formato B acordado en ADR-013.
- [x] La notación de cada movimiento respeta la nomenclatura letra-número con indicación de pieza y eventos especiales (`PEÓN (e2 -> e4)`, `CABALLO (c6 -> d4) [Captura]`, `[Enroque]`, `[Coronación]`).
- [x] Al alcanzar un estado terminal de fin de juego, se muestra en el panel de control el botón `[Exportar Partida]`.
- [x] El clic en `[Exportar Partida]` genera la descarga del archivo `.txt` utilizando un `Blob` en memoria y nomenclatura basada en timestamp (`partida-ajedrez-YYYYMMDD-HHmm.txt`).
- [x] El Core permanece totalmente desacoplado de las APIs del navegador (`Blob`, `URL.createObjectURL`, `document`).
- [x] Se añaden tests unitarios que validan el formateo del texto y la generación del contenido de exportación.
