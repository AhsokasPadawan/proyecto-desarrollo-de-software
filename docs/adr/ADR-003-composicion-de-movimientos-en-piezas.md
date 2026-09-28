# ADR-003: Modelado de Piezas mediante Clases Nominales que Componen Reglas de Movimiento (`IMovementRule`)

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

Cada tipo de pieza del dominio (`Pawn`, `Rook`, `Knight`, `Bishop`, `Queen`, `King`) se representa mediante su propia clase nominal que implementa el contrato común `IPiece` (o extiende una clase base superficial `Piece` de un único nivel), pero **delega el cálculo de sus movimientos válidos a una colección compuesta de reglas de movimiento (`IMovementRule[]`)**.

* Las capacidades geométricas se encapsulan en estrategias reutilizables e independientes (por ejemplo, `SlidingMoveRule` parametrizada por vectores de dirección continua, `LeapMoveRule` parametrizada por saltos discretos, y reglas específicas de peón).
* Una clase como `Queen` no reimplementa lógica de recorrido de casillas, sino que compone las reglas de deslizamiento ortogonal y diagonal.
* Para la prueba de estrés de defensa (incorporar una nueva pieza híbrida de *Fairy Chess*), se registra una nueva clase que implementa `IPiece` componiendo las `IMovementRule` existentes sin modificar ninguna pieza previa.

## 2. Why (Por qué lo elegimos)

1. **Expresividad en el Dominio y en el Diagrama UML:** Contar con clases nominales por pieza (`Rook`, `Queen`, `Knight`, etc.) refleja explícitamente los conceptos del dominio en el código y en el Diagrama de Clases UML entregable, evitando que las piezas sean meras configuraciones anónimas.
2. **Cumplimiento Estricto de Composición sobre Herencia y Open/Closed:** Al prohibir que la lógica de trayectoria viva acoplada en métodos heredados profundos y delegarla en instancias de `IMovementRule`, la jerarquía se mantiene plana ($\le 2$ niveles) y la reutilización de comportamientos (como compartir el deslizamiento lineal entre `Rook`, `Bishop`, `Queen` y piezas híbridas) se logra 100% por composición (*has-a*).
3. **Resolución de la Prueba de Fuego en $<15\text{ min}$:** Agregar una pieza híbrida en la defensa oral requiere únicamente crear una nueva clase de pocas líneas que ensamble las `IMovementRule` requeridas, con cero edición sobre las 6 piezas ya testeadas.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* Las piezas pudieran crearse dinámicamente en tiempo de ejecución por el usuario final a través de archivos de configuración externos (JSON/YAML) sin recompilar código, caso en el cual una única entidad genérica `Piece` instanciada por datos reemplazaría la necesidad de clases nominales por tipo de pieza.
