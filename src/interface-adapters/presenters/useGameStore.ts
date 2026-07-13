import { create, StoreApi, UseBoundStore } from 'zustand';
import { ICommandService } from '../../application/cqs/ICommandService';
import { IQueryService } from '../../application/cqs/IQueryService';
import { GameCommandInvoker } from '../../application/game/GameCommandInvoker';
import { MoveArrowCommand } from '../../application/game/MoveArrowCommand';
import { RotateArrowCommand } from '../../application/game/RotateArrowCommand';
import { CompleteLevelCommand } from '../../application/use-cases/progress/CompleteLevelCommand';
import { StartGameQuery } from '../../application/use-cases/levels/StartGameQuery';
import { IAudioService } from '../../application/ports/IAudioService';
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
  tick(elapsedSeconds: number): void;
}

export interface GameStoreDependencies {
  startGameUseCase: IQueryService<StartGameQuery, GameSession>;
  completeLevelUseCase: ICommandService<CompleteLevelCommand>;
  audioService: IAudioService;
}

/** Effect ids the audio asset map (container.ts) must provide. playEffect() is a
 * safe no-op for any id with no matching source, so wiring these calls never
 * breaks anything while the real files don't exist yet. */
const SFX = {
  chainExit: 'chain-exit',
  blocked: 'blocked',
  rotate: 'rotate',
  victory: 'victory',
  defeat: 'defeat',
} as const;

/**
 * Presenter for the game screen. Holds the current GameSession (the live
 * aggregate root) and exposes actions — zero game logic here.
 *
 * Moving/rotating delegate to GameCommandInvoker (Command pattern, §4): it calls
 * the aggregate directly, no port involved. startGame takes the full Level, not
 * just its id — StartGameUseCase only returns a GameSession, never the level's
 * order, and CompleteLevelCommand needs that order later when the level is won.
 *
 * Audio is triggered here, not from GameScreen: per GameEvent's own doc comment,
 * "the store drains [events] via pullEvents() and republishes to UI and audio" —
 * this is the one place that sees both the domain events and the raw state deltas
 * (failedMoves, status) needed to know which sound fits a transition.
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

  const playTerminalEffect = (previousStatus: string, session: GameSession): void => {
    if (session.status.name === previousStatus) {
      return;
    }
    if (session.status.name === 'Victory') {
      void deps.audioService.playEffect(SFX.victory);
    } else if (session.status.name === 'Defeat') {
      void deps.audioService.playEffect(SFX.defeat);
    }
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
      const previous = invoker.session;
      const session = invoker.execute(new MoveArrowCommand(chainId));
      set({ session });

      if (session !== previous) {
        if (session.pullEvents().some((event) => event.name === 'ArrowChainExited')) {
          void deps.audioService.playEffect(SFX.chainExit);
        } else if (session.failedMoves > previous.failedMoves) {
          void deps.audioService.playEffect(SFX.blocked);
        }
        playTerminalEffect(previous.status.name, session);
      }
      completeIfWon(session);
    },

    rotateArrow(chainId) {
      if (invoker === null) {
        return;
      }
      const previous = invoker.session;
      const session = invoker.execute(new RotateArrowCommand(chainId));
      set({ session });
      if (session !== previous) {
        void deps.audioService.playEffect(SFX.rotate);
      }
    },

    tick(elapsedSeconds) {
      if (invoker === null) {
        return;
      }
      const previous = invoker.session;
      const session = invoker.tick(elapsedSeconds);
      set({ session });
      playTerminalEffect(previous.status.name, session);
    },
  }));
}
