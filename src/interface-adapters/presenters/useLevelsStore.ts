import { create, StoreApi, UseBoundStore } from 'zustand';
import { IQueryService } from '../../application/cqs/IQueryService';
import { GetLevelsQuery } from '../../application/use-cases/levels/GetLevelsQuery';
import { LoadPlayerProgressQuery } from '../../application/use-cases/progress/LoadPlayerProgressQuery';
import { Level } from '../../domain/level/Level';
import { PlayerProgress } from '../../domain/player-progress/PlayerProgress';
import { LevelOrder } from '../../domain/shared/value-objects/LevelOrder';

export interface LevelsStoreState {
  levels: Level[];
  progress: PlayerProgress | null;
  isLoading: boolean;
  error: string | null;
  loadLevels(): Promise<void>;
  isUnlocked(order: LevelOrder): boolean;
}

export interface LevelsStoreDependencies {
  getLevelsUseCase: IQueryService<GetLevelsQuery, Level[]>;
  loadPlayerProgressUseCase: IQueryService<LoadPlayerProgressQuery, PlayerProgress>;
}

/**
 * Presenter for the level-select screen (§16: progress + locked levels). Zero game
 * logic — the unlock decision is entirely PlayerProgress.isUnlocked's invariant.
 */
export function createLevelsStore(
  deps: LevelsStoreDependencies,
): UseBoundStore<StoreApi<LevelsStoreState>> {
  return create<LevelsStoreState>((set, get) => ({
    levels: [],
    progress: null,
    isLoading: false,
    error: null,

    async loadLevels() {
      set({ isLoading: true, error: null });
      try {
        const [levels, progress] = await Promise.all([
          deps.getLevelsUseCase.execute({}),
          deps.loadPlayerProgressUseCase.execute({}),
        ]);
        set({ levels, progress, isLoading: false });
      } catch (error) {
        set({ isLoading: false, error: (error as Error).message });
      }
    },

    isUnlocked(order) {
      return get().progress?.isUnlocked(order) ?? order.isFirst();
    },
  }));
}
