# ADR-005: Fachada `IGameEngine` (`ChessGame`) como Driving Port Único e Inyección de `Board` para Testing

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

1. Se define la interfaz **`IGameEngine`** (implementada por la clase **`ChessGame`**) como el único **Driving Port** que consumen los adaptadores externos (CLI y UI Web en React). `IGameEngine` expone las operaciones de alto nivel de la partida: consultar estado del tablero, obtener movimientos legales de una casilla, ejecutar un movimiento, deshacer/rehacer jugadas (`undo`/`redo`) y consultar el turno y estado de la partida (en curso, jaque, jaque mate, ahogado).
2. **`ChessGame` recibe su instancia de `Board` por inyección de dependencias en el constructor** (proveyendo un método de fábrica estático `ChessGame.createStandardGame()` para inicializar la partida clásica de $8 \times 8$).
3. Para la suite de pruebas unitarias (patrón AAA), tanto `ChessGame` como `Board` y las clases de piezas constituyen *seams* públicos legítimos: los tests pueden inyectar un `Board` configurado ad-hoc con piezas específicas en el bloque *Arrange* sin necesidad de reproducir secuencias de turnos desde la apertura ni parsear cadenas FEN.

## 2. Why (Por qué lo elegimos)

1. **Aislamiento de Adaptadores (Inward Dependency & Narrow Port):** Los adaptadores gráficos o de consola no manipulan casillas ni ejecutan reglas de piezas directamente; toda interacción pasa por `IGameEngine`, impidiendo que reglas de negocio se filtren hacia la UI.
2. **Simplicidad y Velocidad en el Bloque *Arrange* (AAA Testing):** Inyectar un `Board` con 2 o 3 piezas puntuales permite probar casos borde (bloqueos, capturas, piezas clavadas, jaque y jaque mate, o tableros de dimensiones no estándar) en pocas líneas de código expresivas y auto-documentadas.
3. **Ahorro de Complejidad Accidental (YAGNI):** Evita construir y mantener un parser/serializador de notación FEN que no forma parte de los requerimientos obligatorios del dominio.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* Se incorporara persistencia de partidas guardadas en disco/base de datos o importación/exportación estándar con motores externos de ajedrez, escenario en el cual un módulo traductor de formato FEN/PGN pasaría a ser necesario como puerto/adaptador de serialización.
