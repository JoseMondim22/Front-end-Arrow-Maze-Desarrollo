import { StartGameQuery } from '@application/use-cases/levels/StartGameQuery';
import { StartGameUseCase } from '@application/use-cases/levels/StartGameUseCase';
import { GameSession } from '@domain/game-session/GameSession';
import { Level } from '@domain/level/Level';
import { FailedMovesScoringStrategy } from '@domain/shared/services/FailedMovesScoringStrategy';
import { InMemoryLevelRepository } from '../in-memory/InMemoryLevelRepository';

/**
 * Testing API for StartGameUseCase. ILevelRepository is an in-memory fake; the
 * scoring policy is a real ScoringStrategy (a pure domain service, not a port).
 */
export class StartGameTestAPI {
  private readonly levelRepository = new InMemoryLevelRepository();
  private session: GameSession | undefined;
  private thrownError: unknown;

  givenLevelExists(level: Level): void {
    this.levelRepository.seed(level);
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

  thenSessionIsPlaying(): void {
    expect(this.session?.status.name).toBe('Playing');
  }

  thenErrorWasThrown(message: string): void {
    expect(this.thrownError).toBeInstanceOf(Error);
    expect((this.thrownError as Error).message).toBe(message);
  }
}
