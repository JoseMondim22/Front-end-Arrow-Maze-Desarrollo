import { IProgressSyncPort } from '@application/ports/IProgressSyncPort';
import { CompleteLevelCommand } from '@application/use-cases/progress/CompleteLevelCommand';
import { CompleteLevelUseCase } from '@application/use-cases/progress/CompleteLevelUseCase';
import { PlayerProgress } from '@domain/player-progress/PlayerProgress';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { mock, MockProxy } from 'jest-mock-extended';
import { InMemoryPlayerProgressRepository } from '../in-memory/InMemoryPlayerProgressRepository';

/**
 * Testing API for CompleteLevelUseCase. IPlayerProgressRepository is an in-memory
 * fake (persistence-like); IProgressSyncPort is a jest-mock-extended mock (a simple
 * technical port with no meaningful state to fake).
 */
export class CompleteLevelTestAPI {
  private readonly playerProgressRepository = new InMemoryPlayerProgressRepository();
  private readonly progressSyncPort: MockProxy<IProgressSyncPort> = mock<IProgressSyncPort>();
  private thrownError: unknown;

  givenExistingProgress(progress: PlayerProgress): void {
    this.playerProgressRepository.seed(progress);
  }

  givenSyncSucceeds(): void {
    this.progressSyncPort.sync.mockResolvedValue(undefined);
  }

  givenSyncFailsWith(error: Error): void {
    this.progressSyncPort.sync.mockRejectedValue(error);
  }

  async whenCompletingLevel(command: CompleteLevelCommand): Promise<void> {
    const useCase = new CompleteLevelUseCase(
      this.playerProgressRepository,
      this.progressSyncPort,
    );
    try {
      await useCase.execute(command);
    } catch (error) {
      this.thrownError = error;
    }
  }

  async thenLevelIsCompletedWithBestScore(
    levelId: LevelId,
    points: number,
  ): Promise<void> {
    const saved = await this.playerProgressRepository.load();
    expect(saved.isCompleted(levelId)).toBe(true);
    expect(saved.bestScoreOf(levelId).points).toBe(points);
  }

  thenSyncWasCalledWith(command: CompleteLevelCommand): void {
    expect(this.progressSyncPort.sync).toHaveBeenCalledWith({
      levelId: command.levelId,
      score: command.score,
    });
  }

  thenNoErrorWasThrown(): void {
    expect(this.thrownError).toBeUndefined();
  }

  thenErrorWasThrown(message: string): void {
    expect(this.thrownError).toBeInstanceOf(Error);
    expect((this.thrownError as Error).message).toBe(message);
  }
}
