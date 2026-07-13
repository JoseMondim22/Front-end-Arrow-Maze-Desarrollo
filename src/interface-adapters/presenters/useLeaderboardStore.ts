import { create, StoreApi, UseBoundStore } from 'zustand';
import { LeaderboardEntryResult } from '../../application/ports/ILeaderboardRepository';
import { GetLeaderboardQuery } from '../../application/use-cases/leaderboard/GetLeaderboardQuery';
import { GetLeaderboardUseCase } from '../../application/use-cases/leaderboard/GetLeaderboardUseCase';

export interface LeaderboardStoreState {
  entries: LeaderboardEntryResult[];
  isLoading: boolean;
  error: string | null;
  loadLeaderboard(query: GetLeaderboardQuery): Promise<void>;
}

export interface LeaderboardStoreDependencies {
  getLeaderboardUseCase: GetLeaderboardUseCase;
}

/** Presenter for the leaderboard screen. Pure delegation to GetLeaderboardUseCase. */
export function createLeaderboardStore(
  deps: LeaderboardStoreDependencies,
): UseBoundStore<StoreApi<LeaderboardStoreState>> {
  return create<LeaderboardStoreState>((set) => ({
    entries: [],
    isLoading: false,
    error: null,

    async loadLeaderboard(query) {
      set({ isLoading: true, error: null });
      try {
        const entries = await deps.getLeaderboardUseCase.execute(query);
        set({ entries, isLoading: false });
      } catch (error) {
        set({ isLoading: false, error: (error as Error).message });
      }
    },
  }));
}
