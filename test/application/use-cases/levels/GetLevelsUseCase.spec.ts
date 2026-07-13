import { LevelMother } from '@mothers/LevelMother';
import { GetLevelsTestAPI } from '@testing-apis/levels/GetLevelsTestAPI';

describe('GetLevelsUseCase', () => {
  it('should_return_every_level_when_levels_exist', async () => {
    const testAPI = new GetLevelsTestAPI();
    const levels = [LevelMother.aLevel(), LevelMother.atOrder(2)];
    testAPI.givenLevelsExist(levels);

    await testAPI.whenListingLevels();

    testAPI.thenLevelsWereReturned(levels);
  });

  it('should_return_empty_list_when_no_levels_exist', async () => {
    const testAPI = new GetLevelsTestAPI();
    testAPI.givenNoLevelsExist();

    await testAPI.whenListingLevels();

    testAPI.thenLevelsWereReturned([]);
  });
});
