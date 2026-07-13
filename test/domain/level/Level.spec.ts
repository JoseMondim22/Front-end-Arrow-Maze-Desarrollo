import { FailedMovesScoringStrategy } from '@domain/shared/services/FailedMovesScoringStrategy';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { Score } from '@domain/shared/value-objects/Score';
import { LevelMother } from '@mothers/LevelMother';

describe('Level', () => {
  it('should_reconstitute_level_with_given_identity_and_order', () => {
    const level = LevelMother.atOrder(3);

    expect(level.id.equals(LevelId.of('lvl-1'))).toBe(true);
    expect(level.order.sequence).toBe(3);
  });

  it('should_consider_score_plausible_when_at_ceiling', () => {
    const level = LevelMother.withMaxScore(1000);

    expect(level.isScorePlausible(Score.of(1000))).toBe(true);
  });

  it('should_reject_score_when_over_ceiling', () => {
    const level = LevelMother.withMaxScore(1000);

    expect(level.isScorePlausible(Score.of(1001))).toBe(false);
  });

  it('should_start_a_playing_session_when_session_begins', () => {
    const session = LevelMother.aLevel().startSession(new FailedMovesScoringStrategy());

    expect(session.status.name).toBe('Playing');
  });
});
