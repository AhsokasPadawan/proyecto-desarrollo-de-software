---
name: chess-tpo-spec
description: Requirements, architecture constraints, and acceptance criteria for the Chess TPO project. Use when planning project structure, implementing domain rules, or preparing deliverables.
---

# Chess TPO — Project Requirements & Technical Specification

Base execution spec for implementing the chess system under strict architectural constraints.

## 1. Domain Scope

### 1.1 Mandatory Scope (Baseline)

* **Board:** Strict $8 \times 8$ grid coordinate system.
* **Pieces (6 types):** Pawn, Rook, Knight, Bishop, Queen, King.
  * Each piece encapsulates or defines its own legal movement rules.
* **Turn alternation:** Strict White $\leftrightarrow$ Black sequential turns.
* **Piece capture:** Destination occupied by opponent removes target piece from board state.
* **Movement validation:** Reject any move violating piece rules, geometry, or obstructed paths.
* **Check detection:** Active check calculation identifying when the current player's King is under direct threat.

### 1.2 Optional Scope (Pattern Demonstrators)

Implement only after mandatory scope is fully green:

* Checkmate detection (End-game condition).
* Special moves: Castling (*enroque*), *En passant* (*captura al paso*), Pawn promotion.
* Draw conditions: Stalemate (*ahogado*), threefold repetition, 50-move rule.
* Move history: Undo / Redo mechanics (Candidate: `Command` pattern).
* Turn & game phases: Setup, Normal play, Check, Finished (Candidate: `State` pattern).
* AI opponent (Candidate: `Strategy` pattern).
* Visual GUI (Web/Desktop/Terminal) acting solely as an input/output adapter.

---

## 2. Architectural Constraints (Non-Negotiable)

```
[ Adapters: CLI / GUI / Web / Test Harness ]
                   │
                   ▼ (Invokes driving interfaces)
┌────────────────────────────────────────────────────────┐
│  CORE / DOMAIN (Pure Chess Logic)                      │
│  - Board, Pieces, Positions, Rules, MoveValidators     │
│  - Zero UI, Zero DB, Zero External Frameworks          │
└────────────────────────────────────────────────────────┘
```

1. **Technology Isolation of Core:**
   * Pure C# / TS logic. No imports of rendering frameworks, graphic engines, or persistence tools in the domain layer.
2. **Inward Dependencies:**
   * Adapters depend on Core. Core never imports or references an Adapter.
3. **Extensibility Invariant (Open/Closed):**
   * The design must allow adding new custom pieces (e.g., Fairy Chess pieces) or alternate board dimensions without modifying existing classes, breaking inheritance, or rewriting core loops.
4. **Composition Over Inheritance:**
   * Piece behaviors and movement traits must be composable (e.g., linear ray movement, leap movement) rather than hardcoded in deep monolithic inheritance trees.

---

## 3. Testing Requirements

* **Zero-Infrastructure Execution:** All domain tests execute purely in-memory in milliseconds.
* **Coverage Mandate:** Unit test suite covering:
  * Legal moves per piece type.
  * Obstacles (friendly piece blocking, opponent piece blocking).
  * Out-of-bounds rejected coordinates.
  * Captures and board updates.
  * Check verification.
  * If Command/Undo is implemented: Verify $\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$.
* **Structure:** Strict **Arrange-Act-Assert (AAA)** on every test fixture.

---

## 4. Required Deliverables

| Deliverable | Target Content | Validation Metric |
| :--- | :--- | :--- |
| **Source Code** | Complete implementation of domain + minimal running interface. | Passes clean build and runtime playability. |
| **UML Class Diagram** | Structural diagram reflecting the actual codebase. | Zero drift between code classes/interfaces and diagram nodes. |
| **Unit Test Suite** | Isolated in-memory tests for Core. | $100\%$ green test run without network or UI dependencies. |
| **Design Justification Document** | Written defense of architectural choices using the **What / Why / When to break** framework. | Every key decision justified; no dogmatic arguments. |
| **Slide Deck (PPTX)** | Group presentation material. | Clear communication of trade-offs, modularity, and patterns. |

---

## 5. Defense & Extension Stress-Test

The architecture will be evaluated via an ad-hoc live code modification during individual defense:

* **Likely live extension:** Injecting an unannounced new piece type with hybrid movement rules, or altering board boundaries.
* **Architectural litmus test:** The extension must be achievable in $< 15$ minutes by registering a new class/composition without editing existing tested pieces.

---

## 6. Project Setup & Implementation Checklist

Execute in sequential order:

- [ ] **Step 1: Core Domain Entities**
  - Define `Position` (immutable coordinate struct/record).
  - Define `Board` (in-memory grid holding pieces).
  - Define `Color` / `Player` enums.
- [ ] **Step 2: Piece Movement Contracts**
  - Declare movement abstraction (e.g., `IMovementRule`, `IPiece`).
  - Implement 6 mandatory pieces using modular/composable movement vectors.
- [ ] **Step 3: Core Game Flow & Turn Loop**
  - Implement turn tracking and move execution.
  - Implement board update on captures.
- [ ] **Step 4: Threat & Check Calculation**
  - Compute opponent attack lines.
  - Implement `IsKingInCheck(Color)` query.
- [ ] **Step 5: In-Memory Unit Test Suite**
  - Write test fixtures validating valid/invalid moves for all 6 pieces.
  - Write check detection test cases.
- [ ] **Step 6: Driving Adapter (Minimal Client)**
  - Implement a simple CLI / Headless runner to interact with the game.
- [ ] **Step 7: UML Sync & Justification Doc**
  - Reverse-check code against UML.
  - Document architectural choices under What / Why / When to break.