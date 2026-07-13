import { LevelMother } from '@mothers/LevelMother';
import { GetLevelsTestAPI } from '@testing-apis/levels/GetLevelsTestAPI';

describe('GetLevelsUseCase', () => {
  it('should_return_every_level_when_levels_exist', async () => {
    const testAPI = new GetLevelsTestAPI();
    const levels = [LevelMother.aLevel(), LevelMother.atOrder(2)];
    testAPI.givenLevelsExist(...levels);

    await testAPI.whenListingLevels();

    testAPI.thenLevelsWereReturned(levels);
  });

  it('should_return_empty_list_when_no_levels_exist', async () => {
    const testAPI = new GetLevelsTestAPI();

    await testAPI.whenListingLevels();

    testAPI.thenLevelsWereReturned([]);
  });

  it('should_sort_levels_by_order_when_repository_returns_them_out_of_order', async () => {
    const testAPI = new GetLevelsTestAPI();
    const third = LevelMother.atOrder(3);
    const first = LevelMother.atOrder(1);
    const second = LevelMother.atOrder(2);
    testAPI.givenLevelsExist(third, first, second);

    await testAPI.whenListingLevels();

    testAPI.thenLevelsWereReturned([first, second, third]);
  });
});
