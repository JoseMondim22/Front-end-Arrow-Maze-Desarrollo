import { PlayerProgress } from '@domain/player-progress/PlayerProgress';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { LevelOrder } from '@domain/shared/value-objects/LevelOrder';
import { Score } from '@domain/shared/value-objects/Score';
import { PlayerProgressMother } from '@mothers/PlayerProgressMother';

const lvl1 = LevelId.of('lvl-1');
const order1 = LevelOrder.of(1);
const order2 = LevelOrder.of(2);

describe('PlayerProgress', () => {
  it('should_unlock_first_level_for_empty_progress', () => {
    expect(PlayerProgressMother.empty().isUnlocked(order1)).toBe(true);
  });

  it('should_keep_later_level_locked_when_previous_not_completed', () => {
    expect(PlayerProgressMother.empty().isUnlocked(order2)).toBe(false);
  });

  it('should_unlock_level_when_previous_is_completed', () => {
    const progress = PlayerProgressMother.withCompletedLevel(lvl1, order1);

    expect(progress.isUnlocked(order2)).toBe(true);
  });

  it('should_update_best_score_when_new_score_is_higher', () => {
    const progress = PlayerProgressMother.withScore(lvl1, order1, 500).recordAttempt({
      levelId: lvl1,
      order: order1,
      score: Score.of(800),
    });

    expect(progress.bestScoreOf(lvl1).points).toBe(800);
  });

  it('should_keep_best_score_when_new_score_is_lower', () => {
    const progress = PlayerProgressMother.withScore(lvl1, order1, 500).recordAttempt({
      levelId: lvl1,
      order: order1,
      score: Score.of(300),
    });

    expect(progress.bestScoreOf(lvl1).points).toBe(500);
  });

  it('should_report_completed_when_level_recorded', () => {
    const progress = PlayerProgressMother.withCompletedLevel(lvl1, order1);

    expect(progress.isCompleted(lvl1)).toBe(true);
  });

  it('should_round_trip_through_reconstitute', () => {
    const source = PlayerProgressMother.withScore(lvl1, order1, 700);

    const rehydrated = PlayerProgress.reconstitute(source.levelProgresses);

    expect(rehydrated.bestScoreOf(lvl1).points).toBe(700);
    expect(rehydrated.isUnlocked(order2)).toBe(true);
  });
});
