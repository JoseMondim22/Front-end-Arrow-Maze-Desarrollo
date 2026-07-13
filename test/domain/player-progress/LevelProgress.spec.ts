import { LevelProgress } from '@domain/player-progress/LevelProgress';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { LevelOrder } from '@domain/shared/value-objects/LevelOrder';
import { Score } from '@domain/shared/value-objects/Score';

const lvl1 = LevelId.of('lvl-1');
const order1 = LevelOrder.of(1);

describe('LevelProgress', () => {
  it('should_be_incomplete_and_zero_when_fresh', () => {
    const progress = LevelProgress.fresh(lvl1, order1);

    expect(progress.isCompleted()).toBe(false);
    expect(progress.bestScore.points).toBe(0);
  });

  it('should_become_completed_when_completion_recorded', () => {
    const progress = LevelProgress.fresh(lvl1, order1).recordCompletion(Score.of(100));

    expect(progress.isCompleted()).toBe(true);
  });

  it('should_keep_bestScore_monotonic_when_recording_lower_then_higher', () => {
    const progress = LevelProgress.fresh(lvl1, order1)
      .recordCompletion(Score.of(500))
      .recordCompletion(Score.of(300));

    expect(progress.bestScore.points).toBe(500);
  });
});
