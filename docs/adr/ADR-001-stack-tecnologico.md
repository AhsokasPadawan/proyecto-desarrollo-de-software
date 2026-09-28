# ADR-001: Elección de TypeScript, Vitest y React como Stack Tecnológico

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

Se adopta **TypeScript (sobre Node.js)** como lenguaje único para el **Core (Dominio)** y los **Adaptadores**, utilizando:
* **Vitest** como motor de pruebas unitarias en memoria.
* **React + TypeScript (Vite) + Tailwind CSS** para el adaptador visual de entrada (*Driving Adapter* Web).
* Estructura física de directorios particionada bajo `proyect/src/core/` (cero dependencias externas) y `proyect/src/adapters/web/`.

## 2. Why (Por qué lo elegimos)

1. **Aislamiento Tecnológico y Frontera Core-Adapter sin fricción:** Al compartir TypeScript entre el Core y el adaptador React, la interfaz gráfica consume directamente los contratos y tipos inmutables del dominio sin requerir serialización HTTP/JSON intermedia ni duplicación de DTOs.
2. **Ejecución de Tests en Memoria en Milisegundos:** Vitest ejecuta la batería de pruebas unitarias de dominio en memoria de forma instantánea, cumpliendo el mandato de *Zero-Infrastructure Execution*.
3. **Expresividad para Composición y Lookup Tables:** El sistema de tipos estructurales de TypeScript facilita modelar reglas de movimiento componibles (`IMovementRule`) y reemplazar condicionales `switch` extensos por tablas de mapeo (*lookup tables*) fuertemente tipadas.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse o descartarse si:
* El motor requiriera cálculo intensivo de búsqueda de árboles (por ejemplo, un motor de IA minimax con poda alfa-beta de alta profundidad y evaluación de millones de nodos por segundo en multithreading nativo), escenario donde un lenguaje compilado a código nativo o con control de memoria contigua (Rust, C++, C# con `Span<T>`) superaría las limitaciones single-thread del Event Loop de JavaScript.
* La cátedra impusiera como restricción administrativa excluyente el uso de un lenguaje de tipado nominal clásico (Java o C#).
