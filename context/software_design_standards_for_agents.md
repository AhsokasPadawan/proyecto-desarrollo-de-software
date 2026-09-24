---
name: software-design-standards
description: Enforce core-adapter architecture, SOLID principles, composition patterns, and isolated unit testing when writing or refactoring code.
---

# Software Design Standards

Executable reference for agents producing or refactoring application code.

## 1. Architectural Boundary: Core vs. Adapter

Partition all systems strictly into **Core** and **Adapters**.

```
[ Driving Adapter (UI / Web API / CLI) ]
                   │
                   ▼ (invokes driving port)
┌──────────────────────────────────────────────┐
│  CORE (Domain Logic & Pure Computations)     │
│  - Entities, Value Objects, Domain Services  │
│  - Ports: In-memory interfaces               │
└──────────────────────────────────────────────┘
                   ▲
                   │ (implements driven port)
[ Driven Adapter (SQL / Cache / Payment SDK) ]
```

### 1.1 The Core (Domain)
- **Role:** Business logic, computations, and contract declarations (ports).
- **Technology Isolation:** Zero imports or references to framework packages, UI runtimes (React, Vue, WPF), database drivers (SQL, ORMs), HTTP engines, or external SDKs.
- **Ports:** Interfaces declared inside the core defining required inputs (driving) and outputs (driven).

### 1.2 The Adapters (Infrastructure & Delivery)
- **Role:** Technical transport, UI rendering, network calls, and persistence engines.
- **Dependency Invariant:** Dependencies point inward exclusively: $\text{Adapter} \longrightarrow \text{Core}$. Adapters depend on Core types; Core never imports Adapters.

### 1.3 Boundary Bypass Gate
- Omit boundary layering solely for throwaway prototypes (life span $< 1$ week). Retain full separation for all production code.

---

## 2. Structural Principles (SOLID & Composition)

### 2.1 SOLID Guardrails

| Principle | Active Directive | Violation Marker | Exception Trigger |
| :--- | :--- | :--- | :--- |
| **S** (Single Responsibility) | Restrict each class/module to one operational actor and one reason to mutate. | Mixed domain calculations alongside serialization, SQL, or DOM manipulation. | Trivial, static structures where separation creates unnecessary indirection. |
| **O** (Open/Closed) | Extend behavior via polymorphism and new implementations without altering tested routines. | Editing existing, tested classes to support a new business variation. | Known finite cases where future divergence probability is zero. |
| **L** (Liskov Substitution) | Ensure subclasses preserve base class invariants, pre-conditions, and post-conditions. | Overrides that throw `NotSupportedException`, alter preconditions, or introduce unexpected side effects. | None. Violation marks an invalid inheritance model; refactor to composition immediately. |
| **I** (Interface Segregation) | Declare narrow, client-tailored interfaces rather than monolithic contracts. | Implementations writing no-op/stub methods solely to satisfy an oversized interface. | Cohesive domain services whose consumer requires every member. |
| **D** (Dependency Inversion) | Bind service logic to interfaces, passing them via constructors. | Hidden local instantiations (`new ConcreteDependency()`) inside service bodies. | Stable, standard primitive types (`string`, `number`, native arrays). |

### 2.2 Composition Over Inheritance
- **Rule:** Model capabilities by assembling modular behaviors ("has-a") rather than constructing deep hierarchical trees ("is-a").
- **Implementation:** Inject capability interfaces or aggregate modular structs.
- **Inheritance Ceiling:** Reserve inheritance strictly for shallow ($\le 3$ levels), permanently stable, pure-behavior taxonomies.

---

## 3. Core Behavioral Design Patterns

Select patterns on demand; reject pattern introduction for speculative futures.

### 3.1 Strategy
- **Trigger:** Interchangeable algorithms or calculations selectable at runtime.
- **Structure:** Host class accepts an interface instance representing the execution strategy.

### 3.2 State
- **Trigger:** Complex state transitions where permissible operations branch conditionally across $> 3$ phases.
- **Structure:** Each phase is a discrete class implementing an explicit transition contract (`Handle(event) -> NextState`).
- **Bypass:** Use native `enum` + local `switch` when total states $\le 3$ and state transitions remain fixed.

### 3.3 Command
- **Trigger:** Reversible operations, command queues, deferred jobs, or transaction audit histories.
- **Structure:** Encapsulate inputs and target mutators in an object exposing `Execute()` and `Undo()`.
- **Reversibility Invariant:** $\text{State}_{\text{initial}} \equiv \text{State}_{\text{Act(Undo)}}$.

### 3.4 Observer
- **Trigger:** Event distribution across loosely coupled subscribers.
- **Mandate:** Provide explicit teardown/unsubscribe routines to eliminate memory leaks and dangling references.

### 3.5 Factory
- **Trigger:** Instantiation requires runtime decisions across diverse implementations.
- **Bypass:** Construct directly via constructor when target concrete class is singular and fixed.

---

## 4. Testability and Verification Standards

### 4.1 In-Memory Core Tests
- Test Core routines strictly in memory without initiating:
  - Real database connections or migrations.
  - HTTP servers or active sockets.
  - Browser environments, DOM components, or virtual view trees.

### 4.2 AAA Pattern (Arrange-Act-Assert)
Structure every automated test method into three marked sections:
1. **Arrange:** Instantiate unit-under-test and configure test doubles (fakes, stubs, mocks).
2. **Act:** Trigger the singular behavior under validation.
3. **Assert:** Validate invariants and output state.

### 4.3 Test Doubles Taxonomy
- **Stub:** Returns hardcoded canned responses; carries zero verification logic.
- **Mock:** Verifies call counts, invocations, and passed parameters during assertion.
- **Fake:** Simplified in-memory functional implementation (e.g., dictionary/list-based repository).

---

## 5. Agent Operational Checklist

Run this checklist prior to finalizing any generated or refactored code:

- [ ] **Boundary Check:** Are all business formulas, entities, and state transitions isolated from framework packages?
- [ ] **Dependency Inversion:** Are all infrastructure dependencies supplied to classes via constructor arguments using interfaces?
- [ ] **Anti-Bloat Filter (YAGNI):** Does every added interface, factory, or layer address a present requirement rather than a hypothetical future?
- [ ] **Test Feasibility:** Can the generated domain logic be verified in a headless test suite executing in under 5 milliseconds?
- [ ] **Positive Guidance:** If writing UI components (e.g., React), is UI strictly limited to receiving and rendering state, delegating state machines and commands to plain domain models?