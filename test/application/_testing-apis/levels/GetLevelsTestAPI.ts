import { GetLevelsUseCase } from '@application/use-cases/levels/GetLevelsUseCase';
import { Level } from '@domain/level/Level';
import { InMemoryLevelRepository } from '../in-memory/InMemoryLevelRepository';

/** Testing API for GetLevelsUseCase. ILevelRepository is an in-memory fake. */
export class GetLevelsTestAPI {
  private readonly levelRepository = new InMemoryLevelRepository();
  private result: Level[] = [];

  givenLevelsExist(...levels: Level[]): void {
    this.levelRepository.seed(...levels);
  }

  async whenListingLevels(): Promise<void> {
    const useCase = new GetLevelsUseCase(this.levelRepository);
    this.result = await useCase.execute({});
  }

  thenLevelsWereReturned(expected: Level[]): void {
    expect(this.result).toEqual(expected);
  }
}
