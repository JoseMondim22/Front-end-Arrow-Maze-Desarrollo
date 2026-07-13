import { ILevelRepository } from '@domain/level/ILevelRepository';
import { Level } from '@domain/level/Level';
import { GetLevelsUseCase } from '@application/use-cases/levels/GetLevelsUseCase';
import { mock, MockProxy } from 'jest-mock-extended';

/** Testing API for GetLevelsUseCase. */
export class GetLevelsTestAPI {
  private readonly levelRepository: MockProxy<ILevelRepository> = mock<ILevelRepository>();
  private result: Level[] = [];

  givenLevelsExist(levels: Level[]): void {
    this.levelRepository.findAll.mockResolvedValue(levels);
  }

  givenNoLevelsExist(): void {
    this.levelRepository.findAll.mockResolvedValue([]);
  }

  async whenListingLevels(): Promise<void> {
    const useCase = new GetLevelsUseCase(this.levelRepository);
    this.result = await useCase.execute({});
  }

  thenLevelsWereReturned(expected: Level[]): void {
    expect(this.result).toEqual(expected);
  }
}
