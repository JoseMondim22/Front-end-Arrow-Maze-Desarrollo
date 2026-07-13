import { ClearLocalProgressUseCase } from '@application/use-cases/progress/ClearLocalProgressUseCase';
import { PlayerProgress } from '@domain/player-progress/PlayerProgress';
import { InMemoryPlayerProgressRepository } from '../in-memory/InMemoryPlayerProgressRepository';

/** Testing API for ClearLocalProgressUseCase. IPlayerProgressRepository is an
 * in-memory fake, same one used for LoadPlayerProgressUseCase. */
export class ClearLocalProgressTestAPI {
  private readonly playerProgressRepository = new InMemoryPlayerProgressRepository();

  givenExistingProgress(progress: PlayerProgress): void {
    this.playerProgressRepository.seed(progress);
  }

  async whenClearing(): Promise<void> {
    const useCase = new ClearLocalProgressUseCase(this.playerProgressRepository);
    await useCase.execute();
  }

  async thenStoredProgressIsEmpty(): Promise<void> {
    expect(await this.playerProgressRepository.load()).toEqual(PlayerProgress.empty());
  }
}
