# How We Work — Contrato Operativo del Equipo

Este documento define el proceso de trabajo, estándares de calidad y flujo de colaboración para el desarrollo del proyecto grupal de **Ingeniería de Software**. Es de cumplimiento obligatorio tanto para los integrantes del equipo humano como para los agentes de Inteligencia Artificial que participen en el ciclo de vida.

---

## 1. Ciclo de Vida del Desarrollo (4 Etapas)

El desarrollo del proyecto se estructura en 4 etapas secuenciales. Las dos primeras etapas culminan con un archivo de resumen (*summary*) en formato Markdown para someter a debate, discusión y consenso del equipo antes de avanzar a la siguiente.

```
┌─────────────────┐       ┌─────────────┐       ┌────────────────────┐       ┌──────────────┐
│ 1. Project      │  ───► │ 2. Design   │  ───► │ 3. Implementation   │  ───► │ 4. Review    │
│    Setup        │       │    (Skills) │       │    (TDD en ramas)  │       │   (2 aprs/PR)│
└─────────────────┘       └─────────────┘       └────────────────────┘       └──────────────┘
         │                       │
         ▼                       ▼
   Setup Summary          Design Summary
  (Debate equipo)         (Debate equipo)
```

---

### Etapa 1: Project Setup (Configuración y Alineación)
* **Objetivo:** Definir las reglas de juego, los lineamientos arquitectónicos, las restricciones no negociables y el marco de colaboración.
* **Entregables:**
  * `docs/how-we-work.md`: Contrato de trabajo y gobernanza del equipo.
  * `docs/project-setup.md`: Objetivos generales, restricciones de diseño y tracker de etapas.
  * `docs/project-setup-summary.md`: Resumen ejecutivo para votación y ratificación del equipo.
* **Cierre de etapa:** Reunión del equipo para ratificar el stack técnico y el contrato operativo.

---

### Etapa 2: Design (Diseño y Desglose con Skills)
La etapa de diseño se divide en 3 sub-etapas asistidas por skills de IA:

```
┌────────────────────────────────┐
│ 2.1 grill-with-docs            │ ──► Documento general de arquitectura y decisiones de alto nivel
└────────────────────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ 2.2 to-spec                    │ ──► Especificaciones funcionales e Historias de Usuario
└────────────────────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ 2.3 to-tickets                 │ ──► Épicas (carpetas) y tickets Markdown sincronizados con backlog.md
└────────────────────────────────┘
```

1. **Sub-etapa 2.1 (`grill-with-docs`)**:
   * Entrevista y análisis riguroso para definir la arquitectura del sistema, delimitación de responsabilidades, contratos entre módulos y decisiones de alto nivel sobre qué vamos a construir y cómo.
   * Genera el documento base de arquitectura y decisiones de diseño (ADRs).
2. **Sub-etapa 2.2 (`to-spec`)**:
   * Transforma el documento general de arquitectura en especificaciones granulares e Historias de Usuario estructuradas (*"Como [rol], quiero [funcionalidad] para [beneficio]"*).
   * Define los límites de prueba (*seams*) y decisiones de implementación y testeo.
3. **Sub-etapa 2.3 (`to-tickets`)**:
   * Desglosa las especificaciones en unidades mínimas de trabajo verificado (*tracer bullets* verticales).
   * **Agrupación por Épicas:** Los tickets relacionados a una misma funcionalidad se agrupan en carpetas representativas de la épica:
     ```
     docs/tickets/
       ├── <nombre-epica-1>/
       │     ├── 01-<slug-ticket>.md
       │     └── 02-<slug-ticket>.md
       └── <nombre-epica-2>/
             └── 03-<slug-ticket>.md
     ```
   * **Backlog Maestro Centralizado:** Cada ticket se indexa en `docs/backlog.md` indicando su identificador, título, épica y estado actual.
* **Cierre de etapa:** Generación de `docs/design-summary.md` que se presenta y aprueba en reunión grupal antes de iniciar la implementación.

---

### Etapa 3: Implementation (Desarrollo Guiado por TDD)
* **Objetivo:** Implementar los tickets generados en paralelo, asegurando la máxima calidad mediante TDD estricto y control de versiones homogéneo.
* **Gestión de Ramas (Git Flow):**
  * Todo trabajo parte desde la rama `main` actualizada.
  * Por cada ticket a desarrollar, se crea una rama específica siguiendo la nomenclatura:
    $$\text{ticket/}\langle\text{NN}\rangle\text{-}\langle\text{slug-corto}\rangle$$
    *(Ejemplo: `ticket/01-movimiento-peon`, `ticket/04-deteccion-jaque`).*
  * **Regla estricta:** Queda terminantemente prohibido comitear o pushear directamente a `main`. Todo cambio entra exclusivamente vía Pull Request.
* **Disciplina on-commit:**
  * En cada commit o avance, el autor debe mantener sincronizados:
    1. El archivo del ticket (`docs/tickets/<epica>/<NN>-<slug>.md`), marcando los criterios de aceptación completados.
    2. El archivo `docs/backlog.md`, actualizando el estado de la tarea (`In Progress`, `In Review`).
* **Uso obligatorio de TDD:**
  * Todos los integrantes del equipo deben exigir a los agentes que utilicen la skill `implement` invocando activamente la skill `tdd`.
  * **Ciclo Red $\rightarrow$ Green:** Escribir primero el test unitario que falla sobre la interfaz pública (*seam*), y luego escribir exclusivamente el código necesario para ponerlo en verde.
  * **Estructura AAA:** Todo test debe seguir de forma estricta el patrón Arrange-Act-Assert.
  * **Aislamiento en Memoria:** Los tests de dominio deben ejecutarse $100\%$ en memoria en milisegundos, sin dependencias de I/O, base de datos ni interfaces gráficas.

---

### Etapa 4: Review (Revisión de Código y Aprobaciones)
* **Objetivo:** Verificar que cada incremento cumpla con los estándares arquitectónicos y con la especificación original antes de incorporarse a `main`.
* **Apertura de Pull Request (PR):**
  * Al completar un ticket, se abre un PR desde la rama `ticket/<NN>-<slug>` hacia `main`.
* **Uso de la skill `code-review`:**
  * El autor o los revisores deben ejecutar la skill `code-review` sobre el PR, analizando los dos ejes en paralelo:
    1. **Eje Standards:** Cumplimiento de principios SOLID, arquitectura Core-Adapter, ausencia de code smells (Mysterious Names, Duplicated Code, Primitive Obsession, Repeated Switches, etc.).
    2. **Eje Spec:** Verificación de que el código cubre todos los criterios de aceptación del ticket, sin omisiones ni desviaciones no solicitadas (*scope creep*).
* **Regla de Aprobación Mínima:**
  * Un PR requiere obligatoriamente **al menos 2 aprobaciones de integrantes del equipo** antes de ser mergeado a `main`.
  * Una vez aprobado y mergeado, el ticket se marca como `Done` en `docs/backlog.md`.

---

## 2. Definition of Done (DoD) para Pull Requests

Para que un PR sea considerado apto para revisión y merge, debe cumplir y certificar el siguiente checklist en su descripción:

- [ ] **TDD y Seams:** Tests unitarios creados antes de la implementación sobre *seams* públicos acordados, siguiendo el patrón AAA y ejecutables $100\%$ en memoria.
- [ ] **Suite en Verde:** Toda la batería de pruebas y validaciones de tipos pasan localmente sin advertencias.
- [ ] **Reporte de `code-review`:** Skill ejecutada; sin observaciones críticas de estándares arquitectónicos ni desalineaciones de especificación.
- [ ] **Sincronización de Documentación:** Criterios de aceptación tildados en `docs/tickets/<epica>/<NN>-<slug>.md` y estado actualizado en `docs/backlog.md`.
- [ ] **Aprobaciones de Pares:** Al menos dos (2) aprobaciones formales registradas en el PR.

---

## 3. Estándares Generales de Código

1. **Evitar condicionales `switch` extensos:**
   * Utilizar tablas de mapeo (*lookup tables*) o polimorfismo/patrones de comportamiento en lugar de bloques `switch`/`case` dispersos para enrutamientos o lógica condicional.
2. **Uso de `useEffect` como última opción:**
   * En caso de interactuar con componentes React en adaptadores gráficos, los efectos colaterales, redirecciones o sincronizaciones de estado deben originarse directamente en los controladores de eventos (`onClick`, `onChange`), reservando `useEffect` exclusivamente como último recurso.
3. **Código auto-documentado:**
   * El código debe expresarse por sí mismo a través de nombres descriptivos y semánticos para variables, funciones, interfaces y módulos. Evitar comentarios redundantes, explicativos u organizativos.

---

## 4. Skills Utilitarias de Soporte (Proactividad del Agente)

Para facilitar el trabajo en el día a día y evitar bloqueos, se definen **5 skills utilitarias** de soporte. Los agentes de IA tienen la **directiva obligatoria de sugerir activamente su uso** cuando detecten que el desarrollador las necesita:

* **`to-questionnaire`**: Cuando el desarrollador no sabe un requerimiento o prefiere consultar una decisión con el grupo/docente antes de decidir en soledad. Genera un cuestionario Markdown listo para enviar.
* **`wait-what`**: Cuando el desarrollador no entendió la explicación técnica del agente o se sintió abrumado, permitiendo resetear la explicación con lenguaje técnico simple y directo.
* **`handoff`**: Cuando se termina una jornada de trabajo, se debe pasar la tarea a otro compañero o se quiere iniciar una nueva sesión limpia sin perder el contexto.
* **`resolving-merge-conflicts`**: Cuando surgen conflictos de Git merge/rebase con `main`, guiando la resolución conservando la intención de ambos cambios.
* **`teach`**: Para comprender a fondo el código generado por uno mismo o revisar el de un compañero durante la etapa de Review, reforzando los conceptos para la defensa individual de la materia.

*(Para el detalle exhaustivo de disparadores y sugerencias modelo, consultar [`context/skills_utilitarias_de_soporte.md`](../context/skills_utilitarias_de_soporte.md)).*
