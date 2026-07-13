import { GameSession } from '@domain/game-session/GameSession';
import { ILevelRepository } from '@domain/level/ILevelRepository';
import { Level } from '@domain/level/Level';
import { FailedMovesScoringStrategy } from '@domain/shared/services/FailedMovesScoringStrategy';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { StartGameQuery } from '@application/use-cases/levels/StartGameQuery';
import { StartGameUseCase } from '@application/use-cases/levels/StartGameUseCase';
import { mock, MockProxy } from 'jest-mock-extended';

/**
 * Testing API for StartGameUseCase. The scoring policy is a pure domain service,
 * not an infrastructure port, so a real strategy is used instead of a mock.
 */
export class StartGameTestAPI {
  private readonly levelRepository: MockProxy<ILevelRepository> = mock<ILevelRepository>();
  private session: GameSession | undefined;
  private thrownError: unknown;

  givenLevelExists(level: Level): void {
    this.levelRepository.findById.mockResolvedValue(level);
  }

  givenNoLevelExists(): void {
    this.levelRepository.findById.mockResolvedValue(null);
  }

  async whenStartingGame(query: StartGameQuery): Promise<void> {
    const useCase = new StartGameUseCase(
      this.levelRepository,
      new FailedMovesScoringStrategy(),
    );
    try {
      this.session = await useCase.execute(query);
    } catch (error) {
      this.thrownError = error;
    }
  }

  thenLevelWasQueriedWith(levelId: LevelId): void {
    expect(this.levelRepository.findById).toHaveBeenCalledWith(levelId);
  }

  thenSessionIsPlaying(): void {
    expect(this.session?.status.name).toBe('Playing');
  }

  thenErrorWasThrown(message: string): void {
    expect(this.thrownError).toBeInstanceOf(Error);
    expect((this.thrownError as Error).message).toBe(message);
  }
}
