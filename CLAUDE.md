# CLAUDE.md — Arrow Maze (Cliente React Native)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Guía de contexto y arquitectura del **cliente móvil** del juego **Arrow Maze — Escape Puzzle**.
Es la fuente de verdad para cualquier asistente de IA o desarrollador que trabaje en este repositorio.
**Léelo completo antes de escribir código.**

> Repositorio hermano: **Arrow Maze — Backend** (NestJS + PostgreSQL). Este documento está
> deliberadamente **alineado** con el `CLAUDE.md` del backend: mismas capas, mismos puertos CQS,
> misma estrategia de AOP, misma arquitectura de tests, mismo lenguaje ubicuo. Las divergencias
> son **pocas, intencionales y están documentadas** en §15.

---

## 1. Project Overview

Cliente React Native + Expo que implementa **toda** la mecánica del juego y consume el backend
NestJS (auth, niveles, progreso, leaderboard).

**El backend no contiene lógica de juego: solo crea, valida estructuralmente y sirve niveles.**
Movimiento, rotación, colisión, victoria/derrota y puntuación son responsabilidad **exclusiva**
de este cliente.

Clean Architecture (4 capas) + SOLID + patrones GoF + AOP vía Decorator + DDD táctico con agregados.
Toda decisión debe poder defenderse individualmente.

## 2. Tech Stack

| Área | Decisión |
| --- | --- |
| Framework | React Native con **Expo (managed workflow)** |
| Lenguaje | TypeScript (`strict: true`, **sin `any`**) |
| Estado / Presenters | **Zustand** (confinado a la capa de adaptadores) |
| Navegación | React Navigation (native-stack) |
| Persistencia local | `expo-sqlite` (progreso) + `expo-secure-store` (token JWT) |
| Audio | `expo-av` |
| i18n | `i18next` + `react-i18next` + `expo-localization` (ES / EN) |
| HTTP | `fetch` envuelto en un `HttpClient` propio |
| Testing | Jest + React Native Testing Library + Pact (contrato) |
| CI/CD | GitHub Actions |

---

## Reglas de Documentación Obligatoria (AI_USAGE.md)

Cada vez que termines de ayudar con una tarea de generación, refactorización o corrección de
código, DEBES abrir automáticamente el archivo `AI_USAGE.md` y añadir una nueva entrada al final
del documento siguiendo exactamente este formato:

### [Nombre corto de la tarea]
- **Herramienta de IA utilizada:** 
- **Prompt o instrucción proporcionada:** [Escribe aquí de forma literal o parafraseada lo que el usuario te pidió hacer]
- **Resultado obtenido:** [Explica brevemente qué archivos creaste o modificaste y qué lógica implementaste]
- **Modificaciones realizadas por el equipo:** (Pendiente de revisión humana)
- **Lecciones aprendidas o limitaciones identificadas:** [Menciona si hubo algún error, corrección necesaria, o si sugeriste una mejor forma de implementar el código]

Sin caracteres especiales.

---

## 3. Reglas de oro (para el asistente)

1. **La regla de dependencia manda.** `ui / infrastructure → interface-adapters → application → domain`.
   El `domain` **no importa nada** del proyecto. `application` solo importa `domain`.
2. **La lógica de juego vive en el dominio, dentro de los agregados.** Movimiento, rotación,
   legalidad, victoria y derrota son **invariantes** y viven en la raíz `GameSession`.
   Solo las **políticas intercambiables** (fórmula de puntuación) van en *domain services* / *strategies*.
3. **Agregados: todo acceso pasa por la raíz.** Nada externo muta un `Board`, `CellType` o
   `ArrowChain` directamente. Los agregados se referencian **por id**, nunca por contención.
   Los repositorios devuelven **raíces de agregado**.
4. **La unidad que se mueve es la cadena (`ArrowChain`), no una celda suelta.** Una flecha es
   **cabeza + cuerpo**: varios nodos que se desplazan juntos como un tren.
5. **El tablero es un grafo, no una grilla.** `row`/`column` existen **solo para pintar en pantalla**.
   Ninguna regla de movimiento se calcula con `row`/`column` durante la partida — se resuelve contra
   la **adyacencia direccional precomputada** (§6.1), derivada **una sola vez** en `BoardBuilder`.
6. **Terreno y cadenas son cosas distintas** (§6.2). El `Board` guarda **terreno estático**
   (`EmptyCell` / `WallCell` / `ExitCell`) y, **por separado**, las `ArrowChain` que lo ocupan.
   Una cadena no "es" celdas: **ocupa nodos**.
7. **Puertos de repositorio en el dominio** (igual que el backend), puertos técnicos en `application/ports/`.
8. **CQS**: un caso de uso es `ICommandService<TCommand>` (muta, no devuelve nada) o
   `IQueryService<TQuery, TResult>` (lee, no muta). Nunca las dos cosas.
9. **Nada de frameworks en dominio/aplicación.** Ni `expo`, ni `zustand`, ni `react`, ni `fetch`.
10. **El único lugar que conoce clases concretas es el composition root** (`infrastructure/di/container.ts`).
11. **Todo código nuevo va acompañado de pruebas** (arquitectura de 3 niveles, §12).
12. **Conventional Commits en inglés** (§13).

---

## 4. Architecture — Clean Architecture (4 Layers)

### Layer 1 — Domain (innermost, no external dependencies)

**Aggregates:**

- **`GameSession` (root)** · la partida en curso
  - `Board` (**entidad interna, mutable**) → terreno + adyacencia precomputada + cadenas activas
  - `ArrowChain` (entidad interna) → secuencia ordenada `cola → cabeza` + dirección de la cabeza
  - `CellNode` (VO) → `NodeId`, `Position`, `CellType`
  - `Edge` (VO) → `from: NodeId`, `to: NodeId`
  - `GameStatus` (VO — patrón State) → `Playing | Paused | Victory | Defeat`
  - `Score` (VO)
  - *No tiene repositorio*: se crea desde `Level.startSession()` y vive en memoria.

- **`Level` (root)** · definición estática del nivel
  - `LevelId` (VO), `LevelRules` (VO: `timeLimit`, `maxMoves`, `maxPossibleScore`), `LevelOrder` (VO)
  - `BoardDefinition` (VO inmutable) → `CellNode[]`, `Edge[]`, `ChainDefinition[]`
  - `ILevelRepository` (**port, junto al agregado**) → `findAll`, `findById`
  - Factory Method: `startSession(scoring: ScoringStrategy): GameSession`

- **`PlayerProgress` (root)** · progreso local del jugador
  - `LevelProgress` (entidad interna, una por nivel: `completed`, `bestScore`)
  - `IPlayerProgressRepository` (**port, junto al agregado**) → `load`, `save`

**Shared Value Objects** (`domain/shared/value-objects/` — ver §5.1):
`NodeId`, `ChainId`, `Position` (interfaz) → `GridPosition(row, column)`,
`Direction` (interfaz) → `GridDirection(Up|Right|Down|Left)`, `Score`.

**Cells** (`domain/shared/board/cells/` — polimorfismo, alineado con el backend):
```
CellType   (interfaz)  → id, isPassable()
  ├─ ArrowCell (interfaz) → extiende CellType + direction: Direction
  │    └─ GridArrowCell   → implements ArrowCell   (solo definición de nivel — ver §6.2)
  ├─ WallCell    → isPassable() = false
  ├─ EmptyCell   → isPassable() = true
  └─ ExitCell    → isPassable() = true

IRotatable (interfaz APARTE — ISP) → rotate(): void|self
  └─ la implementa ArrowChain (la rotación es del tren, no del terreno)
```

**Domain Factories (no aggregate):**
- `CellFactory.create(data: CellRawData): CellType` — **Factory Method**. `CellRawData`
  (`{ type, direction? }`) es un tipo **local al dominio**, distinto del DTO de interface-adapters
  (`NodeRawData`) — igual que en el backend, para que el dominio nunca importe un DTO externo.
  Decide la subclase concreta según `type`. Valida que `grid_arrow` traiga `direction`.
- `BoardBuilder` — **Builder**. Ensambla el `Board` **runtime** paso a paso a partir de un
  `BoardDefinition` ya validado: precomputa adyacencia direccional (§6.1), proyecta terreno y
  reconstruye las `ArrowChain` desde el `ChainDefinition` (§6.3). Se invoca **una sola vez, al
  jugar** — dentro de `Level.startSession()` — nunca al mapear un DTO.

> Igual que en el backend, **`CellFactory` y `BoardBuilder` viven en el DOMINIO**, no en interface-adapters:
> construyen entidades de dominio y hacen cumplir invariantes de dominio.
> `LevelMapper` (Capa 3) invoca **solo `CellFactory`** para construir el `BoardDefinition` estático;
> `BoardBuilder` lo invoca `Level.startSession()`, no el mapper.

**Key invariants:**
- `GameSession.moveArrow()` — la cadena se desliza como **unidad**: nunca parcialmente.
- `movesUsed` se incrementa en **todo** intento de `moveArrow` (válido o revertido); **nunca** al rotar.
- `movesUsed ≤ maxMoves`; las acciones solo se aceptan si `status === Playing`.
- Victoria ⇔ no queda ninguna `ArrowChain` en el tablero.
- `PlayerProgress.recordAttempt(levelId, score)` — `bestScore` es **monótono** (nunca decrece).
- `PlayerProgress.isUnlocked(order)` — un nivel se desbloquea solo si el anterior está completado.
- `Board` (constructor) valida: nodos no vacíos, **≥1 `ExitCell`**, edges referencian NodeIds válidos,
  cada `chain.nodeIds` referencia nodos existentes y forma un camino en la adyacencia.

---

### Layer 2 — Use Cases / Application

**CQS (Command-Query Separation)** — idéntico al backend:

```typescript
interface ICommandService<TCommand> {
  execute(command: TCommand): Promise<void>
}

interface IQueryService<TQuery, TResult> {
  execute(query: TQuery): Promise<TResult>
}
```

**Commands / Queries (Parameter Objects):**
- `RegisterUserCommand` → email, password, username
- `LoginQuery` → email, password → `LoginResult` (accessToken, userId)
- `GetLevelsQuery` → (vacío) → `Level[]`
- `StartGameQuery` → levelId → `GameSession`
- `CompleteLevelCommand` → levelId, score
- `SyncProgressCommand` → levelId, score
- `LoadPlayerProgressQuery` → (vacío) → `PlayerProgress`
- `GetLeaderboardQuery` → levelId, limit → `LeaderboardEntryResult[]`

**Use Cases:**

| Caso de uso | Puerto CQS | Puertos que consume |
| --- | --- | --- |
| `RegisterUserUseCase` | `ICommandService<RegisterUserCommand>` | `IAuthRepository` |
| `LoginUseCase` | `IQueryService<LoginQuery, LoginResult>` | `IAuthRepository`, `ITokenStore` |
| `GetLevelsUseCase` | `IQueryService<GetLevelsQuery, Level[]>` | `ILevelRepository` |
| `StartGameUseCase` | `IQueryService<StartGameQuery, GameSession>` | `ILevelRepository` |
| `CompleteLevelUseCase` | `ICommandService<CompleteLevelCommand>` | `IPlayerProgressRepository`, `IProgressSyncPort` |
| `SyncProgressUseCase` | `ICommandService<SyncProgressCommand>` | `IProgressSyncPort` |
| `LoadPlayerProgressUseCase` | `IQueryService<LoadPlayerProgressQuery, PlayerProgress>` | `IPlayerProgressRepository` |
| `GetLeaderboardUseCase` | `IQueryService<GetLeaderboardQuery, LeaderboardEntryResult[]>` | `ILeaderboardRepository` |

> **Las acciones de juego (mover / rotar) NO son casos de uso.** No tocan ningún puerto:
> son lógica de dominio pura. Un "caso de uso" sin puertos no es un caso de uso.
> Se orquestan con el **patrón Command** (§11) a través de `GameCommandInvoker` (`application/game/`),
> que sostiene la sesión activa. El store llama al invoker; el invoker llama a la raíz.
> No hay undo: revertir un movimiento inválido es automático dentro de `moveArrow` (§6.4),
> no una acción separada que el jugador pida.

**Ports:**
- **De dominio** (junto al agregado): `ILevelRepository`, `IPlayerProgressRepository`.
- **Técnicos** (`application/ports/`): `IProgressSyncPort`, `ILeaderboardRepository`, `IAuthRepository`,
  `ITokenStore`, `IAudioService`, `ILocalizationService`, `ILogger`, `ITimeProvider`.

---

### Layer 3 — Interface Adapters

**Presenters (Zustand):** `useGameStore`, `useLevelsStore`, `useAuthStore`, `useLeaderboardStore`.
Reciben casos de uso por inyección desde el container, guardan la **raíz de agregado** vigente
(p. ej. la `GameSession` actual) y exponen acciones. **Cero lógica de juego.**

**Repositories (implementan los puertos):**
- `HttpLevelRepository implements ILevelRepository`
- `SqlitePlayerProgressRepository implements IPlayerProgressRepository`
- `HttpProgressSyncAdapter implements IProgressSyncPort`
- `HttpLeaderboardRepository implements ILeaderboardRepository`
- `HttpAuthRepository implements IAuthRepository`

**Mappers (DTO ↔ Dominio — nunca dejar entrar un DTO al dominio):**
- `LevelMapper.toDomain(LevelDTO): Level` — invoca `CellFactory` (dominio) para construir el
  `BoardDefinition`; **no** invoca `BoardBuilder` (eso lo hace `Level.startSession()`, al jugar)
- `PlayerProgressMapper`, `LeaderboardMapper`

**AOP Decorators (un par por puerto CQS):**
```typescript
LoggingCommandDecorator<TCommand>          implements ICommandService<TCommand>
LoggingQueryDecorator<TQuery, TResult>     implements IQueryService<TQuery, TResult>
AuthGuardCommandDecorator<TCommand>        implements ICommandService<TCommand>
AuthGuardQueryDecorator<TQuery, TResult>   implements IQueryService<TQuery, TResult>
PerformanceQueryDecorator<TQuery, TResult> implements IQueryService<TQuery, TResult>
CachingQueryDecorator<TQuery, TResult>     implements IQueryService<TQuery, TResult>
  - decoratee: el mismo puerto  ← composición
```

**DTOs — espejo exacto del backend** (`interface-adapters/dtos/`, un archivo por DTO,
separados en `input/` y `output/` según la dirección del viaje respecto al backend):

```
interface-adapters/dtos/
├─ input/    # lo que el cliente MANDA al backend
│  ├─ RegisterDTO.ts       → email, password, username
│  ├─ LoginDTO.ts          → email, password
│  └─ SyncDTO.ts           → levelId, score
└─ output/   # lo que el backend DEVUELVE al cliente
   ├─ TokenDTO.ts              → accessToken, userId
   ├─ NodeRawData.ts           → **`id`**, `type` (`grid_arrow|wall|empty|exit`), `row`, `column`, `direction?`
   │                             (+ `CellTypeIdRaw`, co-ubicado)
   ├─ EdgeRawData.ts           → from, to
   ├─ ChainRawData.ts          → `id`, `nodeIds: string[]` (⚠️ NUEVO — cola → cabeza, ver §6.3)
   ├─ BoardDTO.ts              → nodes, edges, **chains**
   ├─ LevelDTO.ts              → id, board, timeLimit, maxMoves, **`maxPossibleScore`** (⚠️ falta hoy), difficulty, order
   └─ LeaderboardEntryDTO.ts   → position, username, score
```

> **No existe `CreateLevelDTO`.** El cliente **no tiene editor de niveles**: nunca crea ni
> envía un `BoardDTO` al backend, solo lo recibe (`GET /levels`). Por eso `NodeRawData`,
> `EdgeRawData`, `ChainRawData` y `BoardDTO` son puramente `output` — no hace falta resolver
> una clasificación compartida input/output para ellos.

> ⚠️ `ChainRawData` y `maxPossibleScore` en `LevelDTO` **requieren cambio en el backend**.
> Ver `BACKEND_CHANGES.md`.

---

### Layer 4 — Frameworks & Infrastructure

- `infrastructure/http/HttpClient.ts` — **Adapter** sobre `fetch` (inyecta `Authorization: Bearer`
  leyendo `ITokenStore`, normaliza errores HTTP).
- `infrastructure/http/BackendFacade.ts` — **Facade** del subsistema de red.
- `infrastructure/persistence/sqlite.ts` (`expo-sqlite`) + `SecureTokenStore.ts` (`expo-secure-store`).
- `infrastructure/audio/ExpoAudioService.ts` (`expo-av`, **Singleton**).
- `infrastructure/i18n/` (`i18next` + `locales/{es,en}.json`).
- `infrastructure/time/SystemTimeProvider.ts` (`ITimeProvider`).
- **`infrastructure/di/container.ts` — Composition Root.** El único archivo que instancia clases
  concretas y arma la cadena de decoradores: `AuthGuard → Logging → Performance/Caching → Use Case`.
- `ui/` — screens (**Login, Register**, Home, LevelSelect, Game, Victory, Defeat, Settings),
  components (`BoardView`, `CellView`, `ChainView`, `HUD`), `navigation/RootNavigator.tsx`.
  Login/Register no estaban en el checklist original pese a que `RegisterUserUseCase`/
  `LoginUseCase`/`useAuthStore` ya existían; `RootNavigator` decide Auth stack vs `Home`
  según `useAuthStore().session` (patrón estándar de React Navigation), sin navegación
  imperativa manual tras loguearse o registrarse.

---

## 5. Estructura de carpetas

```
src/
├─ domain/                        # CAPA 1 — puro, sin dependencias externas
│  │
│  │  # Regla de ubicación de VOs (§5.1):
│  │  #   · lo usa UN solo agregado   → <agregado>/value-objects/
│  │  #   · lo comparten DOS o más    → shared/
│  │
│  ├─ shared/                     # VOs y piezas usadas por 2+ agregados
│  │  ├─ value-objects/           # NodeId, ChainId, Position, GridPosition, Direction,
│  │  │                           #   GridDirection, Score, LevelId, LevelOrder, LevelRules
│  │  ├─ board/
│  │  │  ├─ CellNode.ts           # VO (NodeId, Position, CellType)
│  │  │  ├─ Edge.ts               # VO (from, to)
│  │  │  ├─ cells/                # CellType, ArrowCell, GridArrowCell, WallCell, EmptyCell, ExitCell
│  │  │  └─ factories/            # (pendiente)
│  │  │     ├─ CellFactory.ts     # Factory Method (DOMINIO — igual que el backend)
│  │  │     └─ BoardBuilder.ts    # Builder (DOMINIO): adyacencia + terreno + cadenas
│  │  ├─ services/ScoringStrategy.ts  # Strategy (POLÍTICA, no invariante) — (pendiente)
│  │  ├─ events/GameEvent.ts      # eventos de dominio emitidos por las raíces — (pendiente)
│  │  └─ errors/DomainError.ts
│  │
│  ├─ game-session/               # AGREGADO — la partida en curso
│  │  ├─ GameSession.ts           # ← RAÍZ (moveArrow, rotateArrow, tick, pause/resume)
│  │  ├─ Board.ts                 # entidad interna: terreno + adyacencia + cadenas activas
│  │  ├─ ArrowChain.ts            # entidad interna: [cola…cabeza] + direction (implements IRotatable)
│  │  ├─ IRotatable.ts            # interfaz aparte (ISP) — único implementador: ArrowChain
│  │  └─ value-objects/
│  │     └─ GameStatus.ts         # VO (patrón State)
│  │
│  ├─ level/                      # AGREGADO — definición estática del nivel
│  │  ├─ Level.ts                 # ← RAÍZ (create / reconstitute; startSession pendiente)
│  │  ├─ ILevelRepository.ts      # ← PUERTO junto al agregado (como el backend)
│  │  └─ value-objects/
│  │     ├─ BoardDefinition.ts    # VO inmutable (nodes, edges, chains)
│  │     └─ ChainDefinition.ts    # VO inmutable (id, nodeIds cola→cabeza)
│  │
│  └─ player-progress/            # AGREGADO — progreso local (pendiente)
│     ├─ PlayerProgress.ts        # ← RAÍZ (recordAttempt, isUnlocked, bestScore)
│     ├─ LevelProgress.ts         # entidad interna
│     └─ IPlayerProgressRepository.ts   # ← PUERTO junto al agregado
│
├─ application/                   # CAPA 2
│  ├─ cqs/                        # ICommandService, IQueryService
│  ├─ use-cases/
│  │  ├─ auth/        RegisterUserUseCase, LoginUseCase
│  │  ├─ levels/      GetLevelsUseCase, StartGameUseCase
│  │  ├─ progress/    CompleteLevelUseCase, SyncProgressUseCase, LoadPlayerProgressUseCase
│  │  └─ leaderboard/ GetLeaderboardUseCase
│  ├─ game/                       # Patrón Command (NO son casos de uso — no tocan puertos)
│  │  ├─ GameCommand.ts
│  │  ├─ MoveArrowCommand.ts
│  │  ├─ RotateArrowCommand.ts
│  │  └─ GameCommandInvoker.ts    # sostiene la sesión activa (sin undo)
│  └─ ports/                      # puertos TÉCNICOS (los de repositorio están en domain/)
│     ├─ IProgressSyncPort.ts  ILeaderboardRepository.ts  IAuthRepository.ts
│     ├─ ITokenStore.ts  IAudioService.ts  ILocalizationService.ts
│     ├─ ILogger.ts  ITimeProvider.ts
│
├─ interface-adapters/            # CAPA 3
│  ├─ presenters/                 # useGameStore, useLevelsStore, useAuthStore, useLeaderboardStore
│  ├─ repositories/               # Http*, SqlitePlayerProgressRepository
│  ├─ mappers/                    # LevelMapper, PlayerProgressMapper, LeaderboardMapper
│  ├─ decorators/                 # AOP: Logging/AuthGuard/Performance/Caching (Command + Query)
│  └─ dtos/                       # espejo exacto del backend — un archivo por DTO
│     ├─ input/                   # lo que el cliente MANDA (RegisterDTO, LoginDTO, SyncDTO)
│     └─ output/                  # lo que el backend DEVUELVE (TokenDTO, NodeRawData,
│                                  #   EdgeRawData, ChainRawData, BoardDTO, LevelDTO,
│                                  #   LeaderboardEntryDTO) — sin CreateLevelDTO, no hay editor
│
├─ infrastructure/                # CAPA 4
│  ├─ http/  persistence/  audio/  i18n/  time/
│  └─ di/container.ts             # Composition Root
│
└─ ui/                            # CAPA 4
   ├─ screens/  components/  navigation/
```

**Regla de imports:** `domain/` no importa nada · `application/` importa `domain/` ·
`interface-adapters/` importa `application/` + `domain/` · `infrastructure/` y `ui/` importan todo,
pero **solo `di/container.ts` instancia clases concretas**.

### 5.1 Ubicación de los Value Objects (shared vs. por-agregado)

Cada VO vive según **cuántos agregados lo usan** (se cuentan los tres agregados finales:
`Level`, `GameSession`, `PlayerProgress`):

- **Lo usa un solo agregado** → `domain/<agregado>/value-objects/`.
  Ej.: `BoardDefinition` y `ChainDefinition` (solo `Level`), `GameStatus` (solo `GameSession`).
- **Lo comparten dos o más** → `domain/shared/`.
  Ej.: `LevelId`, `LevelOrder`, `Score` (los usan `Level` y `PlayerProgress`), `LevelRules`
  (`Level` copia sus reglas en `GameSession`), `NodeId`/`Direction`/`CellNode`/cells
  (`Level` los define, `GameSession` los usa en runtime).

`IRotatable` vive en `game-session/` (no en `shared/board/`) porque su **único implementador**
es `ArrowChain`: una interfaz la ubica el agregado que la usa, no dónde "suena" temáticamente.

---

## 6. Reglas del juego (invariantes de `GameSession`)

> El backend **no valida** nada de esto. Simular el juego es 100% responsabilidad del cliente.

### 6.1 El tablero es un grafo — adyacencia direccional

El `Board` llega como `nodes` + `edges` (`{from, to}`). Un `Edge` **no dice** a qué dirección
compass corresponde. `BoardBuilder` compara el `GridPosition` de `from`/`to` **una sola vez** y arma:

```ts
type DirectionalAdjacency = Record<'up' | 'right' | 'down' | 'left', NodeId | null>;
// Board.adjacency: Map<NodeId, DirectionalAdjacency>
```

**Supuesto (confirmado):** dos nodos conectados por una arista son siempre adyacentes en grilla
(nunca diagonal ni salto). A partir de aquí, el juego **nunca vuelve a tocar `row`/`column`**.

### 6.2 Terreno vs. cadenas — separación explícita

Esta es la corrección conceptual más importante frente a la versión anterior del documento.

- El **`Board` guarda terreno estático**: cada `NodeId` tiene una `CellType` que es
  `EmptyCell`, `WallCell` o `ExitCell`. El terreno **no se mueve nunca**.
- Las **`ArrowChain` son una capa encima**: ocupan nodos, y esa ocupación cambia al moverse.
- Un nodo de tipo `grid_arrow` en el DTO es **definición de nivel**, no terreno de partida:
  `BoardBuilder` lo proyecta como **terreno `EmptyCell`** + **semilla de la cabeza de una cadena**
  (de ahí sale la `direction` inicial).
- Por eso **`IRotatable` lo implementa `ArrowChain`**, no una celda: rotar es cambiar hacia dónde
  apunta el tren, no modificar el suelo.

**Consecuencia:** hay dos preguntas distintas y no se deben mezclar.
- *¿Este tipo de celda bloquea estructuralmente?* → `cell.isPassable()` (`WallCell` → `false`).
- *¿Hay otra cadena parada ahí ahora?* → `Board.isOccupied(nodeId)` (consulta las cadenas activas).

### 6.3 La flecha es cabeza + cuerpo — orden explícito desde el backend

Una flecha es una `ArrowChain`: una secuencia ordenada de nodos, **cola → cabeza**.

**Por qué NO se puede derivar el orden de las `edges`:** las `edges` son adyacencia **general** de
grilla. Una serpiente en U tiene su cola y su cabeza adyacentes en pantalla, así que existe una
arista entre ellas → el subgrafo de la cadena tiene un **ciclo**, no un camino simple, y el orden
se vuelve ambiguo. Agrupar por un `chainId` **no resuelve esto**.

**Solución adoptada (cambio de contrato):** el `BoardDTO` trae un array `chains` con el **orden explícito**:

```jsonc
{
  "nodes": [
    { "id": "1", "type": "grid_arrow", "direction": "up", "row": 2, "column": 0 },
    { "id": "2", "type": "empty", "row": 2, "column": 1 },
    { "id": "3", "type": "empty", "row": 2, "column": 2 },
    { "id": "9", "type": "wall",  "row": 0, "column": 1 },
    { "id": "7", "type": "exit",  "row": 0, "column": 0 }
  ],
  "edges":  [ { "from": "1", "to": "2" }, { "from": "2", "to": "3" } ],
  "chains": [ { "id": "c1", "nodeIds": ["3", "2", "1"] } ]   // ← cola … cabeza
}
```

Contrato de `chains` (lo valida `BoardBuilder`, lanza `DomainError` si falla):
- `nodeIds` está ordenado **cola → cabeza**. El **último** elemento es la cabeza.
- El nodo cabeza es el único de la cadena con `type = grid_arrow`, y **debe** traer `direction`.
- Los nodos del cuerpo son `type = empty`.
- Nodos consecutivos en `nodeIds` deben ser adyacentes según la adyacencia precomputada.
- Un `chains` vacío significa nivel sin flechas → dato inválido.

### 6.4 Movimiento

**`GameSession.moveArrow(chainId)`** — la cadena completa se desliza, paso a paso, en la dirección
de la cabeza, mientras el nodo al que avanza la cabeza sea transitable:

- **Siguiente nodo `EmptyCell` y libre** → toda la cadena avanza un nodo (cada segmento del cuerpo
  ocupa la posición que dejó el de adelante; la cola libera su nodo). El deslizamiento **continúa**
  en la misma dirección dentro de la misma acción.
- **Siguiente nodo `ExitCell`** → **toda la cadena sale del mapa**. Movimiento válido, termina ahí.
  Emite `ArrowChainExited`.
- **Siguiente nodo `WallCell`, fuera del grafo (`null`), u ocupado por otra cadena** →
  **movimiento inválido**: la cadena **vuelve completa a su posición original** (la que tenía antes
  de empezar este `moveArrow`)… **pero igual cuenta como movimiento usado**.

**`rotateArrow(chainId)`** (doble toque) — rota la dirección de la cabeza 90° cíclicamente
(`Up → Right → Down → Left → Up`). El cuerpo no se mueve ni cambia de forma.
**Nunca incrementa `movesUsed`.**

- **`movesUsed`** se incrementa en **todo** `moveArrow` (válido o revertido). Nunca al rotar.
- **Victoria:** ninguna `ArrowChain` queda en el tablero → `status = Victory`.
- **Derrota:** se agota `maxMoves`, se agota `timeLimit`, o **ninguna cadena restante tiene un
  movimiento legal** (deadlock, §7) → `status = Defeat`.
- Múltiples cadenas por nivel. **Cualquier `ExitCell` sirve para cualquier cadena.**

### 6.5 API del agregado (contratos)

```ts
// GameSession (RAÍZ) — inmutable: cada método devuelve una GameSession nueva y válida.
// Copia por valor las reglas del Level (maxMoves, timeLimit, maxPossibleScore).
moveArrow(chainId: ChainId): GameSession    // desliza la cadena; revierte si es inválido; movesUsed += 1 SIEMPRE
rotateArrow(chainId: ChainId): GameSession  // rota la cabeza 90°; NO incrementa movesUsed
tick(elapsedSec: number): GameSession       // avanza el tiempo; puede pasar a Defeat
get status(): GameStatus
get view(): BoardView                       // proyección de solo lectura para renderizar
pullEvents(): GameEvent[]                   // drena los eventos de dominio emitidos

// Board (entidad interna — solo alcanzable a través de GameSession)
private terrain:   Map<NodeId, CellType>                          // Empty | Wall | Exit
private adjacency: Map<NodeId, DirectionalAdjacency>              // precomputado UNA vez
private chains:    ArrowChain[]                                   // cadenas aún en el tablero
isOccupied(nodeId: NodeId): boolean
slideChain(chainId: ChainId): { board: Board; outcome: 'Exited' | 'Reverted' | 'Stopped' }
hasLegalMove(chainId: ChainId): boolean

// ArrowChain (entidad interna) — implements IRotatable
get nodeIds(): NodeId[]        // [cola, …, cabeza]
get head(): NodeId
get direction(): Direction
rotate(): ArrowChain

// Level (RAÍZ) — Factory Method
startSession(scoring: ScoringStrategy): GameSession

// ScoringStrategy (domain service — POLÍTICA, no invariante)
score(p: { maxPossibleScore: number; movesUsed: number; maxMoves: number;
           timeUsedSec: number; timeLimitSec: number }): Score
```

> **Determinismo:** el tiempo entra como parámetro (`tick(elapsedSec)`), **nunca** se lee dentro del
> dominio (`Date.now()` está prohibido en `domain/` y `application/` — usa `ITimeProvider`).
> Los agregados son deterministas y testeables en aislamiento total.

---

## 7. Key Design Decisions

1. **El tablero es un grafo (nodos + aristas), NO una matriz 2D.**
   `row`/`column` solo posicionan en pantalla. Toda la lógica corre sobre adyacencia precomputada.

2. **El orden de la cadena viene explícito del backend (`chains[].nodeIds`), no se infiere.**
   Inferirlo desde las `edges` es imposible en serpientes que se pliegan (ciclos en el subgrafo).
   Ver §6.3 y `BACKEND_CHANGES.md`.

3. **Terreno ≠ cadenas.** El `Board` guarda suelo estático; las cadenas son una capa que lo ocupa.
   `IRotatable` lo implementa `ArrowChain`, no una celda.

4. **`Board` es entidad mutable aquí, VO inmutable en el backend.** Divergencia **intencional**:
   el backend solo almacena; aquí es el estado de una partida en curso. Documentada en §15.

5. **Las acciones de juego no son casos de uso.** No tocan puertos → son dominio puro orquestado
   por el patrón Command (`GameCommandInvoker`). Un caso de uso sin puertos no es un caso de uso.

6. **Puertos de repositorio en el dominio** (repository-as-contract, DDD), igual que el backend.
   Los puertos técnicos viven en `application/ports/`.

7. **AOP vía Decorator sobre CQS, no vía librería de AOP.** Igual que el backend
   (Seemann & van Deursen, cap. 10).

8. **Al menos una `ExitCell`, no exactamente una.** El backend hoy exige exactamente una; hay que
   relajarlo (ver `BACKEND_CHANGES.md`), porque la mecánica permite varias salidas y cualquier
   cadena puede usar cualquiera.

9. **Detección de deadlock:** se evalúa **solo después de cada `moveArrow`/`rotateArrow`**
   (no en cada `tick`). Si `board.chains.every(c => !board.hasLegalMove(c.id))` → `Defeat`.
   Un movimiento es legal si el primer paso de la cabeza no da contra `Wall`/`null`/otra cadena;
   la rotación no se cuenta como escape (si con rotar hubiera salida, no es deadlock — se evalúan
   las 4 direcciones posibles de la cabeza).

10. **Persistencia local con `expo-sqlite`.** Alineado con el backend (relacional) y suficiente
    para el progreso. `AsyncStorage`/`MMKV` quedan descartados.

---

## 8. Dependency Rule (NEVER violate)

```
Frameworks / UI → Adapters → Use Cases → Domain
```
- Domain **no importa NADA** de las capas externas.
- Use Cases importan **solo** clases de dominio e interfaces de puerto.
- Adapters implementan puertos y traducen entre capas.
- Frameworks cablean todo en el Composition Root.

---

## 9. AOP Strategy (SOLID-based, no external AOP libraries)

AOP se implementa con el **patrón Decorator** sobre `ICommandService<TCommand>` /
`IQueryService<TQuery, TResult>` — la misma estrategia que el backend
(Seemann & van Deursen, "Dependency Injection Principles, Practices, and Patterns", cap. 10).

**Cómo funciona:**
- Cada caso de uso implementa un puerto CQS de método único: `execute`.
- Cada decorador implementa **el mismo puerto** que su *decoratee* y lo envuelve por composición.
- El Composition Root arma la cadena: `AuthGuard → Logging → Performance/Caching → Use Case real`.
- La lógica de negocio **nunca** llama al logger ni comprueba autenticación.

**Aspectos implementados:**
1. `LoggingCommandDecorator` / `LoggingQueryDecorator` — entrada, salida y duración de cada `execute()`.
2. `AuthGuardCommandDecorator` / `AuthGuardQueryDecorator` — verifica sesión activa (`ITokenStore`)
   antes de ejecutar casos protegidos (sync, leaderboard, niveles).
3. `PerformanceQueryDecorator` — mide operaciones costosas (carga y construcción de nivel).
4. `CachingQueryDecorator` — memoiza `GetLeaderboardUseCase` con TTL.

**Evidencia SOLID en el AOP:**
- **SRP** — el caso de uso tiene una responsabilidad; cada decorador, un único *cross-cutting concern*.
- **OCP** — añadir un aspecto = crear un decorador nuevo, sin tocar nada más.
- **LSP** — los decoradores sustituyen sin fricción a cualquier `ICommandService`/`IQueryService`.
- **DIP** — los decoradores dependen de la abstracción CQS, nunca de un caso de uso concreto.

---

## 10. SOLID Principles — Key Examples

- **S** — `GameSession` guarda los invariantes del juego; `ScoringStrategy` la política de puntaje;
  `SqlitePlayerProgressRepository` la persistencia. Tres razones de cambio, tres clases.
- **O** — un tipo de celda o power-up nuevo = una clase que implementa `CellType` + un caso en
  `CellFactory`. `WallCell`/`EmptyCell`/`ExitCell` no se tocan. Igual con nuevas fórmulas de puntaje
  vía `ScoringStrategy`.
- **L** — `WallCell` y `ExitCell` son intercambiables donde se espera `CellType`
  (`Board.terrainAt(nodeId)`, `isPassable()`) sin que el cliente conozca la subclase.
- **I** — `CellType` (mínimo: `id`, `isPassable()`) está separado de `IRotatable` (`rotate()`):
  el terreno no se ve forzado a implementar rotación. Además, puertos pequeños y específicos
  (`ITokenStore`, `IAudioService`, `ILogger`) en vez de una interfaz gigante.
- **D** — los casos de uso dependen de `ILevelRepository`, nunca de `HttpLevelRepository`.

---

## 11. GoF Patterns

| Patrón | Categoría | Clase | Justificación |
|---|---|---|---|
| **Factory Method** | Creacional | `CellFactory.create()` · `Level.startSession()` | Crea el `CellType` correcto / la `GameSession` sin que el cliente conozca clases concretas |
| **Builder** | Creacional | `BoardBuilder` | Ensambla el `Board` paso a paso: adyacencia direccional, terreno y cadenas |
| **Singleton** | Creacional | `ExpoAudioService`, `i18n` | Una sola instancia durante el ciclo de vida de la app |
| **Adapter** | Estructural | `HttpClient` (sobre `fetch`), `Sqlite*Repository` | Adapta librerías externas a los puertos internos |
| **Facade** | Estructural | `BackendFacade` | Interfaz simple del subsistema de red |
| **Decorator** | Estructural | `Logging*`, `AuthGuard*`, `Performance*`, `Caching*` | AOP sin modificar los casos de uso |
| **Composite** | Estructural | `BoardView` / `ChainView` en la proyección de render | Trata grupos de nodos y nodos sueltos de forma uniforme |
| **Command** | Comportamiento | `MoveArrowCommand`, `RotateArrowCommand`, `GameCommandInvoker` | Encapsula mover/rotar como objetos aplicados a la sesión activa |
| **State** | Comportamiento | `GameStatus` (`Playing`/`Paused`/`Victory`/`Defeat`) | Ciclo de vida explícito de la partida |
| **Observer** | Comportamiento | `GameEvent` (`ArrowChainExited`, `LevelCompleted`, `ScoreUpdated`) | La raíz acumula eventos; `pullEvents()` los drena; el store los publica a UI y audio |
| **Strategy** | Comportamiento | `ScoringStrategy` | Política de puntuación intercambiable |

---

## 12. Testing Architecture — 3 Levels (Professor's Approach)

All tests in this project follow a strict 3-level architecture defined by the course.
Each level has exactly one responsibility and must never be mixed with the others.
The goal is that tests read like behavior specifications in business language, and that
they are completely immune to internal refactorings of the domain or infrastructure.

### Level 3 — Object Mother (the bottom layer)

The Object Mother is a static factory class whose only job is to create valid, ready-to-use
domain objects for tests. It knows how to build every aggregate and value object in the
domain, always in a valid and consistent state.

There is one Object Mother per aggregate — in this repository:
`LevelMother`, `GameSessionMother`, `PlayerProgressMother`, plus the internal-entity mothers
`BoardMother` and `ArrowChainMother`.

Each Mother has multiple static methods that represent meaningful domain states — for example,
`LevelMother.withMaxScore(1000)` creates a Level whose maximum possible score is 1000,
`PlayerProgressMother.withScore(levelId, 500)` creates a PlayerProgress with a best score of 500,
and `BoardMother.uShapedChainFacingWall()` creates a Board with a folded chain whose head is
blocked — the exact scenario that breaks naive edge-walking.

If the constructor of `GameSession` or `PlayerProgress` changes (for example, adding a new required
field), the fix is made in one place — the Mother — and no test file needs to change.
This is the key value of the Object Mother: it is the single source of truth for how
domain objects are constructed in tests.

### Level 2 — Testing API / Builder (the middle layer)

The Testing API is a class created specifically for tests. It is NOT a test itself — it
is a helper class that encapsulates all the "dirty" technical work that tests should not
see: creating mocks, configuring mock return values, instantiating use cases, and
making assertions on mock interactions.

There is one Testing API per use case: `SyncProgressTestAPI`, `RegisterUserTestAPI`,
`LoginTestAPI`, `StartGameTestAPI`, etc. Each Testing API has three types of methods:

`given...()` methods configure the scenario before the action. For example,
`givenLevelWithMaxScore(1000)` tells the mock repository to return a Level with
that max score when asked. `givenNoExistingProgress()` tells the mock repository
to return null when asked for a PlayerProgress. These methods use the Object Mother
internally to create the domain objects they need.

`when...()` methods execute the actual use case under test. This is where the
structural coupling lives — the Testing API is the only place in the entire test suite
that calls `new SyncProgressUseCase(...)` and injects the mocks. If the use case
gains a new dependency, only this method needs to update. The `when` method also
captures any error that the use case throws, so the test can assert on it later.

`then...()` methods make the assertions. They verify the expected outcome — that
the repository was called, that the saved object has the correct values, that an error
was thrown with the correct message, that a mock was never called. The `expect()`
calls from Jest live exclusively inside `then` methods in the Testing API. The test
file itself never calls `expect()` directly.

### Level 1 — The Test / it block (the top layer)

The test is the `it()` block in the spec file. It speaks only business language. It never
instantiates domain objects, never configures mocks, and never imports jest or
jest-mock-extended. It only orchestrates the three phases: Arrange, Act, Assert —
which map directly to given, when, and then.

The test reads like a behavior specification that a domain expert (a product manager,
a business analyst) could almost understand. For example: "given a level with max
score 1000 and no existing progress, when progress is synced with score 800, then
the progress should be saved with best score 800." That sentence IS the test.

The naming convention for every test is: `should_[expected_result]_when_[condition]`.
For example: `should_update_best_score_when_new_score_is_higher`, or
`should_fail_when_level_does_not_exist`.

### Special case — Domain tests (VOs and Aggregates)

Value Objects and Aggregate Roots are pure classes with no external dependencies.
They do not need a Testing API or mocks. For these, the test uses the Object Mother
directly in the Arrange phase and calls `expect()` directly in the Assert phase.
No Testing API is needed because there are no mocks to configure and no constructors
to hide. The test is already clean enough without the extra layer.

### The AAA pattern and how it maps to this architecture

AAA (Arrange, Act, Assert) is the internal structure of every test. In this architecture
it maps directly to the given/when/then vocabulary of the Testing API:

Arrange corresponds to the `given...()` calls — setting up the scenario.
Act corresponds to the `when...()` call — executing the use case.
Assert corresponds to the `then...()` calls — verifying the outcome.

Every test must have exactly these three phases, clearly separated and in this order.

### Key rules — never break these

- The `it` block never instantiates domain objects directly — always through the Mother.
- The `it` block never configures mocks — always through the Testing API.
- The `it` block never calls `expect()` — always through `then...()` methods in the Testing API.
  **Exception:** domain tests (VOs and Aggregates) may call `expect()` directly.
- Structural coupling (`new UseCase(...)` with its dependencies) lives **only** in the Testing API.
- If a domain constructor changes, update **only** the Mother.
- If a use case constructor changes, update **only** the Testing API.
- The `it` block should never need to change due to internal refactoring.

### Test suites

- **Unit (domain)** — `GameSession`, `Board`, `ArrowChain`, `Level`, `PlayerProgress`, `ScoringStrategy`
  y `BoardBuilder`. Deterministas, sin mocks. Casos obligatorios:
  - `should_move_entire_chain_when_path_is_clear`
  - `should_exit_chain_when_head_reaches_exit_cell`
  - `should_revert_entire_chain_when_head_hits_wall`
  - `should_revert_entire_chain_when_head_hits_another_chain`
  - `should_increment_moves_used_when_move_is_reverted`
  - `should_not_increment_moves_used_when_rotating`
  - `should_reach_victory_when_no_chains_remain_on_board`
  - `should_reach_defeat_when_no_chain_has_a_legal_move`
  - `should_preserve_chain_order_when_chain_folds_back_on_itself`  ← el caso del ciclo (§6.3)
  - `should_fail_when_chain_node_ids_are_not_adjacent`
  - `should_fail_when_chain_head_has_no_direction`
- **Unit (use cases)** — con Object Mother + Testing API + mocks de puertos.
- **Integration** — repositorios contra MSW (HTTP simulado) y `expo-sqlite` en memoria;
  guardar/recuperar progreso de extremo a extremo.
- **UI / Widget** — React Native Testing Library: render del tablero, respuesta a toques,
  navegación (Home → Game → Victory/Defeat).
- **Contract** — Pact (consumidor) contra el backend NestJS. **Debe cubrir `chains[]` y `maxPossibleScore`.**
- **CI/CD** — GitHub Actions ejecuta `lint`, `typecheck` y `test` en cada PR.

Cobertura obligatoria: **dominio (agregados) y casos de uso.**

---

## 13. Conventional Commits

Mensajes **en inglés**, validados con `commitlint` + `husky`.

```
feat(game-session): add chain sliding movement
feat(board): precompute directional adjacency in BoardBuilder
feat(aop): add logging decorator over CQS ports
fix(board): read chain order from chains[] instead of walking edges
test(game-session): add moveArrow chain tests
docs(readme): add clean architecture diagram
refactor(domain): move CellFactory and BoardBuilder to domain layer
```

Ramas protegidas + pull requests. Historial limpio y semántico.
Archivos: `PascalCase` para clases, `camelCase` para stores (`useGameStore`).

**Scripts (`package.json`):**
```bash
npx expo start          # desarrollo
npm test                # jest (unit + integración + UI)
npm run test:contract   # pruebas Pact
npm run lint            # eslint
npm run typecheck       # tsc --noEmit
eas build -p android    # release APK (entregable)
```

---

## 14. API del backend

Base URL en `app.config.ts` (`extra.apiBaseUrl`). `HttpClient` adjunta
`Authorization: Bearer <token>` leyendo `ITokenStore`.

| Método | Path | Auth | Puerto → Caso de uso |
|---|---|---|---|
| POST | `/auth/register` | ❌ | `IAuthRepository` → `RegisterUserUseCase` |
| POST | `/auth/login` | ❌ | `IAuthRepository` → `LoginUseCase` |
| GET | `/levels` | ✅ | `ILevelRepository` → `GetLevelsUseCase` |
| POST | `/progress/sync` | ✅ | `IProgressSyncPort` → `SyncProgressUseCase` |
| GET | `/leaderboard/:levelId` | ✅ | `ILeaderboardRepository` → `GetLeaderboardUseCase` |

---

## 15. Divergencias intencionales respecto al backend

Todas están justificadas; si el código se aleja de esto sin razón, es un error.

| Tema | Backend | Front | Por qué |
|---|---|---|---|
| `Board` | VO **inmutable** (solo almacena) | **Entidad mutable** dentro de `GameSession` | Aquí el tablero es el estado de una partida en curso |
| `CellType` | interfaz **sin métodos** (VO de almacenamiento) | interfaz con **`isPassable()`** | El front sí tiene lógica de juego |
| `IRotatable` | no existe | existe, la implementa `ArrowChain` | Solo el front rota |
| Agregado de progreso | `Progress` (uno por `user × level`) | `PlayerProgress` (colección de `LevelProgress`) | El front necesita el invariante **cross-level** de desbloqueo; un `PlayerProgress` local mapea a N `Progress` remotos |
| Agregado `User` | existe | **no existe** | El cliente solo guarda `accessToken` + `userId` (sin invariantes) → vive en `useAuthStore` + `ITokenStore` |
| `GameSession` | no existe | existe | El backend no simula partidas |
| Acciones de juego | — | patrón **Command**, no casos de uso | No tocan puertos |

**Alineado a propósito (no cambiar):** capas, regla de dependencia, CQS
(`ICommandService`/`IQueryService`), AOP vía Decorator, puertos de repositorio en el dominio,
`CellFactory` en el dominio, arquitectura de tests de 3 niveles, `should_[X]_when_[Y]`,
Conventional Commits, nombres del lenguaje ubicuo (`CellType`, `GridArrowCell`, `GridPosition`,
`GridDirection`, `Score`, `NodeId`, `Edge`).

---

## 16. Funcionalidades mínimas (checklist)

Pantallas: **Login · Register** · Home (jugar + ajustes) · Selección de niveles (progreso + bloqueados) ·
Juego (tablero, flechas, movimientos) · Victoria (puntaje + siguiente) · Derrota (reintentar) · Ajustes.
Además: **≥15 niveles** con dificultad progresiva y formas de tablero distintas, sistema de
puntuación, **persistencia local del progreso**, efectos de sonido + música con opción de silenciar,
e **i18n ES/EN**.

---

## 17. Pendientes

1. **Pesos de la fórmula de puntuación** en `ScoringStrategy`
   (propuesta base: `maxPossibleScore` − penalización por movimientos extra − penalización por tiempo).
2. **Migración de niveles existentes:** los niveles ya creados en el backend no tienen `chains[]`.
   Definir si se migran con un script o se re-crean desde el editor.
3. **Cambios de contrato del backend pendientes de aplicar** → ver `BACKEND_CHANGES.md`.
   Mientras no estén, el front no puede: (a) reconstruir cadenas plegadas, (b) calcular el puntaje,
   (c) usar niveles con más de una salida.
