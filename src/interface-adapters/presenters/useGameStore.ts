import { create, StoreApi, UseBoundStore } from 'zustand';
import { ICommandService } from '../../application/cqs/ICommandService';
import { IQueryService } from '../../application/cqs/IQueryService';
import { GameCommandInvoker } from '../../application/game/GameCommandInvoker';
import { MoveArrowCommand } from '../../application/game/MoveArrowCommand';
import { RotateArrowCommand } from '../../application/game/RotateArrowCommand';
import { CompleteLevelCommand } from '../../application/use-cases/progress/CompleteLevelCommand';
import { StartGameQuery } from '../../application/use-cases/levels/StartGameQuery';
import { GameSession } from '../../domain/game-session/GameSession';
import { Level } from '../../domain/level/Level';
import { ChainId } from '../../domain/shared/value-objects/ChainId';
import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { LevelOrder } from '../../domain/shared/value-objects/LevelOrder';

export interface GameStoreState {
  session: GameSession | null;
  isLoading: boolean;
  error: string | null;
  startGame(level: Level): Promise<void>;
  moveArrow(chainId: ChainId): void;
  rotateArrow(chainId: ChainId): void;
  undo(): void;
  tick(elapsedSeconds: number): void;
}

export interface GameStoreDependencies {
  startGameUseCase: IQueryService<StartGameQuery, GameSession>;
  completeLevelUseCase: ICommandService<CompleteLevelCommand>;
}

/**
 * Presenter for the game screen. Holds the current GameSession (the live
 * aggregate root) and exposes actions — zero game logic here.
 *
 * Moving/rotating delegate to GameCommandInvoker (Command pattern, §4): it calls
 * the aggregate directly, no port involved. startGame takes the full Level, not
 * just its id — StartGameUseCase only returns a GameSession, never the level's
 * order, and CompleteLevelCommand needs that order later when the level is won.
 */
export function createGameStore(
  deps: GameStoreDependencies,
): UseBoundStore<StoreApi<GameStoreState>> {
  let invoker: GameCommandInvoker | null = null;
  let currentLevelId: LevelId | null = null;
  let currentLevelOrder: LevelOrder | null = null;

  const completeIfWon = (session: GameSession): void => {
    if (session.status.name !== 'Victory' || session.finalScore === null) {
      return;
    }
    if (currentLevelId === null || currentLevelOrder === null) {
      return;
    }
    deps.completeLevelUseCase
      .execute({
        levelId: currentLevelId,
        order: currentLevelOrder,
        score: session.finalScore,
      })
      .catch(() => {
        // Local progress was already saved inside CompleteLevelUseCase before the
        // remote sync ran; a sync failure here is non-fatal (§ decision).
      });
  };

  return create<GameStoreState>((set) => ({
    session: null,
    isLoading: false,
    error: null,

    async startGame(level) {
      set({ isLoading: true, error: null });
      try {
        const session = await deps.startGameUseCase.execute({ levelId: level.id });
        invoker = new GameCommandInvoker(session);
        currentLevelId = level.id;
        currentLevelOrder = level.order;
        set({ session, isLoading: false });
      } catch (error) {
        set({ isLoading: false, error: (error as Error).message });
      }
    },

    moveArrow(chainId) {
      if (invoker === null) {
        return;
      }
      const session = invoker.execute(new MoveArrowCommand(chainId));
      set({ session });
      completeIfWon(session);
    },

    rotateArrow(chainId) {
      if (invoker === null) {
        return;
      }
      set({ session: invoker.execute(new RotateArrowCommand(chainId)) });
    },

    undo() {
      if (invoker === null) {
        return;
      }
      set({ session: invoker.undo() });
    },

    tick(elapsedSeconds) {
      if (invoker === null) {
        return;
      }
      set({ session: invoker.tick(elapsedSeconds) });
    },
  }));
}
