# Project Setup — Lineamientos Generales y Estado del Proyecto

Documento fundacional del proyecto grupal para la materia **Ingeniería de Software**. Establece los objetivos del sistema, las restricciones arquitectónicas no negociables y el índice de progreso entre etapas.

---

## 1. Contexto y Objetivos del Proyecto

El objetivo es desarrollar un motor de **Ajedrez (Chess TPO)** robusto, modular y altamente extensible, diseñado bajo estrictos principios de diseño de software orientado a objetos y patrones arquitectónicos.

### 1.1 Alcance Obligatorio (Línea Base)
* **Tablero:** Sistema de coordenadas estricto de cuadrícula de $8 \times 8$.
* **Piezas (6 tipos):** Peón, Torre, Caballo, Alfil, Reina y Rey. Cada pieza encapsula o compone sus reglas de movimiento legal.
* **Alternancia de turnos:** Secuencia estricta Blancas $\leftrightarrow$ Negras.
* **Captura de piezas:** Si la casilla de destino contiene una pieza oponente, esta es retirada del estado del tablero.
* **Validación de movimientos:** Rechazo de cualquier movimiento que viole las reglas geométricas de la pieza o que esté obstruido por otras piezas en su trayectoria.
* **Detección de jaque:** Cálculo activo que identifica si el Rey del jugador de turno se encuentra amenazado de forma directa.

### 1.2 Alcance Opcional (Demostradores de Patrones)
A implementarse únicamente tras consolidar en verde la línea base obligatoria:
* Detección de Jaque Mate (condición de fin de juego).
* Movimientos especiales: Enroque (*castling*), Captura al paso (*en passant*), Coronación de peón (*promotion*).
* Condiciones de tablas: Ahogado (*stalemate*), triple repetición, regla de los 50 movimientos.
* Historial de jugadas: Deshacer / Rehacer (*Undo / Redo*) aplicando el patrón **Command**.
* Fases y estados de juego: Configuración, Juego activo, Jaque, Finalizado, aplicando el patrón **State**.
* Jugador oponente automatizado aplicando el patrón **Strategy**.
* **Adaptador visual (Frontend interactivo):** Interfaz Web desacoplada construida con **React + TypeScript** para visualizar el tablero, turnos y movimientos, consumiendo las interfaces del Core sin acoplar dependencias de renderizado al dominio.

### 1.3 Prueba de Fuego Arquitectónica (Defensa del Proyecto)
El sistema será evaluado en una prueba en vivo durante la defensa individual:
* **Prueba de estrés:** Incorporar una nueva pieza no estándar (*Fairy Chess*, ej. pieza con movimiento combinado) o modificar las dimensiones del tablero.
* **Criterio de éxito:** La extensión debe completarse en **menos de 15 minutos**, registrando una nueva clase/composición sin necesidad de modificar el código ni los tests de las piezas preexistentes (respeto estricto a *Open/Closed*).

---

## 2. Restricciones Arquitectónicas Innegociables

El sistema adopta una arquitectura de estilo **Puertos y Adaptadores (Hexagonal / Core-Adapter)**:

```
[ Adaptadores: CLI / UI / Test Harness ]
                   │
                   ▼ (Invoca interfaces de entrada)
┌────────────────────────────────────────────────────────┐
│  CORE / DOMAIN (Lógica Pura de Ajedrez)                │
│  - Tablero, Piezas, Posiciones, Reglas de Movimiento   │
│  - Cero UI, Cero Base de Datos, Cero Frameworks        │
└────────────────────────────────────────────────────────┘
```

1. **Aislamiento Tecnológico del Core:**
   * La lógica de dominio debe ser independiente de frameworks externos, librerías de persistencia o motores gráficos.
2. **Dependencias Hacia Adentro:**
   * Los adaptadores dependen del Core. El Core jamás importa ni referencia tipos de los adaptadores.
3. **Invariante de Extensibilidad (Open/Closed):**
   * El diseño debe permitir incorporar nuevas piezas y reglas componiendo comportamientos sin modificar el bucle principal ni clases existentes.
4. **Composición sobre Herencia:**
   * Las trayectorias y capacidades de movimiento se modelan como rasgos y estrategias componibles (ej. vectores lineales continuos, saltos discretos), evitando jerarquías de herencia profundas (máximo 2 a 3 niveles).
5. **Testing en Memoria con Patrón AAA:**
   * La suite de tests unitarios de dominio debe ejecutarse de forma aislada en memoria en milisegundos, estructurando cada caso bajo **Arrange-Act-Assert**.

---

## 3. Propuestas de Stack Tecnológico

De acuerdo a los lineamientos del equipo y las restricciones del Core, se presentan dos alternativas principales a ratificar en la reunión de cierre de la Etapa 1:

| Criterio | Propuesta 1 (Recomendada): TypeScript | Propuesta 2 (Alternativa): Java |
| :--- | :--- | :--- |
| **Entorno / Runtime** | Node.js (LTS) | Java 17 o 21 LTS |
| **Framework de Tests** | Vitest / Jest (In-memory, ejecución instantánea) | JUnit 5 + AssertJ |
| **Gestor de Proyecto** | npm / pnpm | Maven / Gradle |
| **Puntos Fuertes** | Rápida portabilidad, tipado estático flexible, excelente ergonomía con agentes de IA y testing ultrarrápido. | Tipado nominal estricto, amplio soporte académico para patrones GoF clásicos y robustez OOP. |
| **Ubicación de Código** | `src/core` y `src/adapters` | `src/main/java` y `src/test/java` |
| **Adaptador Visual Frontend** | **React + TypeScript (Vite):** Integración nativa directa con los modelos de dominio del Core. | **React + TypeScript:** Requiere exponer puertos HTTP/WebSocket o un CLI runner intermedio. |

> [!TIP]
> **Propuesta de Frontend (React + TypeScript):** Se sugiere como adaptador visual para dotar al proyecto de una interfaz gráfica moderna e interactiva donde visualizar el estado del juego. Al tratarse de un adaptador de entrada (*driving adapter*), su desarrollo se planifica para una fase posterior, una vez que el Core y sus tests unitarios de dominio estén consolidados y en verde.

---

## 4. Índice de Estado del Proyecto (Tracker de Etapas)

Este índice refleja en qué fase se encuentra el equipo y qué hitos restan por completar:

| Etapa | Sub-etapa / Hito | Responsable / Herramienta | Entregable Clave | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Project Setup** | Equipo completo | `how-we-work.md`, `project-setup.md`, `project-setup-summary.md` | ✅ Completada |
| 1 | Ratificación de Setup | Reunión grupal | Aprobación de stack y proceso en reunión | ✅ Completada |
| **2** | **Design — Arquitectura** | Skill `grill-with-docs` | [`docs/architecture.md`](architecture.md), [`docs/glossary.md`](glossary.md) y `docs/adr/ADR-001..012` | ✅ Completada |
| 2 | **Design — Especificaciones** | Skill `to-spec` | [`docs/spec.md`](spec.md) con Historias de Usuario y *seams* | ✅ Completada |
| 2 | **Design — Tickets & Backlog** | Skill `to-tickets` | 6 Épicas en `docs/tickets/` y [`docs/backlog.md`](backlog.md) (24 tickets) | ✅ Completada |
| 2 | Ratificación de Diseño | Reunión grupal | [`docs/design-summary.md`](design-summary.md) aprobado por el equipo | ✅ Completada |
| **3** | **Implementation** | Ramas `ticket/<NN>-<slug>` | 24 tickets desarrollados vía TDD estricto (166 tests de dominio) | ✅ Completada |
| **4** | **Review & Integración** | PRs + Code Reviews | 24 tickets auditados, 43 tests de UI con RTL, 209 tests en verde | ✅ Completada |

> [!NOTE]
> Todas las etapas del ciclo de vida (Setup, Design, Implementation y Review) han sido completadas y verificadas al 100%. El proyecto está listo para su evaluación y defensa oral individual.
