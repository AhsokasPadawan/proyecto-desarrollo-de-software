# Backlog Maestro Centralizado — Chess TPO

Índice maestro de las **6 Épicas** y **24 Tickets** (4 tickets por cada uno de los 6 desarrolladores del equipo).

> [!IMPORTANT]
> **Disciplina On-Commit (`how-we-work.md`):** Al trabajar en una rama `ticket/<NN>-<slug>`, el autor debe mantener sincronizados los checkboxes del archivo del ticket y el estado en esta tabla (`ready-for-agent` $\rightarrow$ `In Progress` $\rightarrow$ `In Review` $\rightarrow$ `Done`).

---

## Épica 1: `01-tablero-coordenadas-y-base`

| ID | Ticket | Blocked By | Rama Git | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **01** | [`01-scaffolding-y-position`](tickets/01-tablero-coordenadas-y-base/01-scaffolding-y-position.md) | None | `ticket/01-scaffolding-y-position` | `ready-for-agent` |
| **02** | [`02-board-mutable-y-board-query`](tickets/01-tablero-coordenadas-y-base/02-board-mutable-y-board-query.md) | `01` | `ticket/02-board-mutable-y-board-query` | `ready-for-agent` |
| **03** | [`03-contratos-pieza-y-setup-estandar`](tickets/01-tablero-coordenadas-y-base/03-contratos-pieza-y-setup-estandar.md) | `02` | `ticket/03-contratos-pieza-y-setup-estandar` | `ready-for-agent` |
| **04** | [`04-detector-de-amenazas-check-detector`](tickets/01-tablero-coordenadas-y-base/04-detector-de-amenazas-check-detector.md) | `03` | `ticket/04-detector-de-amenazas-check-detector` | `ready-for-agent` |

---

## Épica 2: `02-piezas-y-reglas-geometricas`

| ID | Ticket | Blocked By | Rama Git | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **05** | [`05-regla-deslizante-torre-alfil-reina`](tickets/02-piezas-y-reglas-geometricas/05-regla-deslizante-torre-alfil-reina.md) | `03` | `ticket/05-regla-deslizante-torre-alfil-reina` | `ready-for-agent` |
| **06** | [`06-regla-salto-caballo-y-rey`](tickets/02-piezas-y-reglas-geometricas/06-regla-salto-caballo-y-rey.md) | `03` | `ticket/06-regla-salto-caballo-y-rey` | `ready-for-agent` |
| **07** | [`07-reglas-peon-avance-y-captura`](tickets/02-piezas-y-reglas-geometricas/07-reglas-peon-avance-y-captura.md) | `03` | `ticket/07-reglas-peon-avance-y-captura` | `ready-for-agent` |
| **08** | [`08-extensibilidad-fairy-chess-y-dimensiones`](tickets/02-piezas-y-reglas-geometricas/08-extensibilidad-fairy-chess-y-dimensiones.md) | `05`, `06`, `07` | `ticket/08-extensibilidad-fairy-chess-y-dimensiones` | `ready-for-agent` |

---

## Épica 3: `03-motor-turnos-command-y-jaque`

| ID | Ticket | Blocked By | Rama Git | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **09** | [`09-patron-command-y-command-history`](tickets/03-motor-turnos-command-y-jaque/09-patron-command-y-command-history.md) | `02`, `03` | `ticket/09-patron-command-y-command-history` | `ready-for-agent` |
| **10** | [`10-ejecucion-turnos-capturas-y-moveresult`](tickets/03-motor-turnos-command-y-jaque/10-ejecucion-turnos-capturas-y-moveresult.md) | `05`, `06`, `07`, `09` | `ticket/10-ejecucion-turnos-capturas-y-moveresult` | `ready-for-agent` |
| **11** | [`11-filtrado-movimientos-legales-y-clavadas`](tickets/03-motor-turnos-command-y-jaque/11-filtrado-movimientos-legales-y-clavadas.md) | `04`, `10` | `ticket/11-filtrado-movimientos-legales-y-clavadas` | `ready-for-agent` |
| **12** | [`12-patron-observer-y-game-snapshot`](tickets/03-motor-turnos-command-y-jaque/12-patron-observer-y-game-snapshot.md) | `10` | `ticket/12-patron-observer-y-game-snapshot` | `ready-for-agent` |

---

## Épica 4: `04-fases-state-y-condiciones-fin`

| ID | Ticket | Blocked By | Rama Git | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **13** | [`13-patron-state-fases-activas`](tickets/04-fases-state-y-condiciones-fin/13-patron-state-fases-activas.md) | `11` | `ticket/13-patron-state-fases-activas` | `ready-for-agent` |
| **14** | [`14-state-jaque-mate-y-ahogado`](tickets/04-fases-state-y-condiciones-fin/14-state-jaque-mate-y-ahogado.md) | `13` | `ticket/14-state-jaque-mate-y-ahogado` | `ready-for-agent` |
| **15** | [`15-tablas-50-movimientos-y-material-insuficiente`](tickets/04-fases-state-y-condiciones-fin/15-tablas-50-movimientos-y-material-insuficiente.md) | `14` | `ticket/15-tablas-50-movimientos-y-material-insuficiente` | `ready-for-agent` |
| **16** | [`16-tablas-triple-repeticion`](tickets/04-fases-state-y-condiciones-fin/16-tablas-triple-repeticion.md) | `14` | `ticket/16-tablas-triple-repeticion` | `ready-for-agent` |

---

## Épica 5: `05-movimientos-especiales-y-strategy-ia`

| ID | Ticket | Blocked By | Rama Git | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **17** | [`17-coronacion-de-peon-reversible`](tickets/05-movimientos-especiales-y-strategy-ia/17-coronacion-de-peon-reversible.md) | `11` | `ticket/17-coronacion-de-peon-reversible` | `ready-for-agent` |
| **18** | [`18-enroque-y-captura-al-paso`](tickets/05-movimientos-especiales-y-strategy-ia/18-enroque-y-captura-al-paso.md) | `11` | `ticket/18-enroque-y-captura-al-paso` | `ready-for-agent` |
| **19** | [`19-patron-strategy-ia-aleatoria`](tickets/05-movimientos-especiales-y-strategy-ia/19-patron-strategy-ia-aleatoria.md) | `11` | `ticket/19-patron-strategy-ia-aleatoria` | `ready-for-agent` |
| **20** | [`20-strategy-ia-heuristica-material`](tickets/05-movimientos-especiales-y-strategy-ia/20-strategy-ia-heuristica-material.md) | `19` | `ticket/20-strategy-ia-heuristica-material` | `ready-for-agent` |

---

## Épica 6: `06-adaptador-web-y-entrega`

| ID | Ticket | Blocked By | Rama Git | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **21** | [`21-tablero-web-dinamico-y-piezas`](tickets/06-adaptador-web-y-entrega/21-tablero-web-dinamico-y-piezas.md) | `12` | `ticket/21-tablero-web-dinamico-y-piezas` | `ready-for-agent` |
| **22** | [`22-interaccion-dos-clics-y-feedback`](tickets/06-adaptador-web-y-entrega/22-interaccion-dos-clics-y-feedback.md) | `21` | `ticket/22-interaccion-dos-clics-y-feedback` | `ready-for-agent` |
| **23** | [`23-panel-control-historial-y-selector-ia`](tickets/06-adaptador-web-y-entrega/23-panel-control-historial-y-selector-ia.md) | `14`, `20`, `22` | `ticket/23-panel-control-historial-y-selector-ia` | `ready-for-agent` |
| **24** | [`24-sincronizacion-uml-y-justificacion-defensa`](tickets/06-adaptador-web-y-entrega/24-sincronizacion-uml-y-justificacion-defensa.md) | `16`, `18`, `23` | `ticket/24-sincronizacion-uml-y-justificacion-defensa` | `ready-for-agent` |
