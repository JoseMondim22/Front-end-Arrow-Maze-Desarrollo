import { LevelId } from '@domain/shared/value-objects/LevelId';
import { LevelMother } from '@mothers/LevelMother';
import { StartGameTestAPI } from '@testing-apis/levels/StartGameTestAPI';

describe('StartGameUseCase', () => {
  it('should_start_a_playing_session_when_level_exists', async () => {
    const testAPI = new StartGameTestAPI();
    const level = LevelMother.aLevel();
    testAPI.givenLevelExists(level);

    await testAPI.whenStartingGame({ levelId: level.id });

    testAPI.thenLevelWasQueriedWith(level.id);
    testAPI.thenSessionIsPlaying();
  });

  it('should_fail_when_level_does_not_exist', async () => {
    const testAPI = new StartGameTestAPI();
    testAPI.givenNoLevelExists();

    await testAPI.whenStartingGame({ levelId: LevelId.of('ghost') });

    testAPI.thenErrorWasThrown('Level not found: ghost');
  });
});
