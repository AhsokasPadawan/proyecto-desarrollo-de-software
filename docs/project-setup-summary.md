# Resumen Ejecutivo — Cierre de Etapa 1: Project Setup

**Para:** Integrantes del equipo de desarrollo — Proyecto Ingeniería de Software  
**Objetivo:** Revisar, debatir y ratificar los acuerdos de gobernanza, flujo de trabajo y arquitectura base para habilitar el paso a la **Etapa 2 (Design)**.

---

## 1. ¿Qué se definió en esta etapa?

Se estructuraron dos documentos fundamentales en el repositorio:
1. **[`docs/how-we-work.md`](how-we-work.md):** El contrato operativo y metodológico que regirá a humanos y agentes de IA durante todo el proyecto.
2. **[`docs/project-setup.md`](project-setup.md):** El marco de alcance del sistema de ajedrez, restricciones arquitectónicas (*Core-Adapter*, SOLID, Composición) y el índice de avance de etapas.

---

## 2. Puntos Clave a Consensuar y Votar en la Reunión del Equipo

### Decisión 1: Elección del Stack Tecnológico Base y Adaptador Frontend
El Core debe implementarse sin dependencias de frameworks ni UI. Se presentan dos opciones viables para el equipo:
* **Opción A (Propuesta Recomendada): TypeScript + Vitest / Node.js**
  * *Ventajas:* Ejecución de tests en milisegundos en memoria, alta portabilidad, tipado estático moderno y soporte óptimo para automatizaciones y agentes.
* **Opción B (Alternativa): Java (17/21 LTS) + JUnit 5 / Maven o Gradle**
  * *Ventajas:* Tipado nominal estricto, paradigma orientado a objetos tradicional ampliamente alineado con patrones de diseño clásicos (GoF).

#### Propuesta Adicional: Adaptador Visual Frontend (React + TypeScript)
* **Objetivo:** Disponer de una interfaz gráfica interactiva que permita visualizar el tablero, las piezas y las partidas de forma intuitiva.
* **Carácter desacoplado:** Se deja asentado que es un adaptador que consumirá las interfaces del Core. Su desarrollo se abordará una vez que la lógica de dominio esté completada y testeada al 100% en memoria.
* **Sinergia con el stack:** Si el equipo elige la *Opción A (TypeScript)*, React se conecta de manera nativa y directa con los modelos del Core sin necesidad de capas intermedias complejas.

---

### Decisión 2: Aprobación del Contrato de Trabajo (`how-we-work.md`)
Ratificar formalmente las reglas de convivencia técnica del equipo:
* **Backlog versionado como código:** Se descartan herramientas externas como Trello. El backlog vivirá en `docs/backlog.md` y los tickets se organizarán en carpetas por épica en `docs/tickets/<epica>/<NN>-<slug>.md`.
* **Disciplina Git:**
  * Ramas individuales creadas desde `main` con el formato `ticket/<NN>-<slug>`.
  * **Prohibido el commit directo a `main`.**
  * Todo merge a `main` requiere un Pull Request con **al menos 2 aprobaciones** de pares.
  * On-commit: Mantener actualizados los criterios del ticket y el estado del backlog.
* **TDD Estricto:** Exigir a los agentes el uso de la skill `implement` llamando a `tdd` (Red $\rightarrow$ Green sobre *seams* públicos, pruebas AAA en memoria).
* **Definition of Done & Code Review:** Ejecución obligatoria de la skill `code-review` (Standards y Spec) antes de dar aprobación al PR.

---

## 3. Próximo Paso Inmediato

Una vez alcanzado el consenso en la reunión:
1. Marcar la Etapa 1 como **Completada** en el tracker de [`docs/project-setup.md`](project-setup.md).
2. Iniciar la **Etapa 2 (Design) — Sub-etapa 2.1**, ejecutando la skill `grill-with-docs` para construir colaborativamente el documento de arquitectura y decisiones de alto nivel del sistema.
