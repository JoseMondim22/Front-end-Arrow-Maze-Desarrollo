import { LoadPlayerProgressUseCase } from '@application/use-cases/progress/LoadPlayerProgressUseCase';
import { PlayerProgress } from '@domain/player-progress/PlayerProgress';
import { InMemoryPlayerProgressRepository } from '../in-memory/InMemoryPlayerProgressRepository';

/** Testing API for LoadPlayerProgressUseCase. IPlayerProgressRepository is an
 * in-memory fake. */
export class LoadPlayerProgressTestAPI {
  private readonly playerProgressRepository = new InMemoryPlayerProgressRepository();
  private result: PlayerProgress | undefined;

  givenExistingProgress(progress: PlayerProgress): void {
    this.playerProgressRepository.seed(progress);
  }

  async whenLoadingProgress(): Promise<void> {
    const useCase = new LoadPlayerProgressUseCase(this.playerProgressRepository);
    this.result = await useCase.execute({});
  }

  thenProgressReturnedIs(expected: PlayerProgress): void {
    expect(this.result).toEqual(expected);
  }
}
