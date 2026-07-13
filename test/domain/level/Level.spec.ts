import { FailedMovesScoringStrategy } from '@domain/shared/services/FailedMovesScoringStrategy';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { Score } from '@domain/shared/value-objects/Score';
import { LevelMother } from '@mothers/LevelMother';

describe('Level', () => {
  it('should_create_level_with_given_identity_and_order', () => {
    const level = LevelMother.atOrder(3);

    expect(level.id.equals(LevelId.of('lvl-1'))).toBe(true);
    expect(level.order.sequence).toBe(3);
  });

  it('should_reconstitute_equivalently_to_create', () => {
    const created = LevelMother.aLevel();
    const reconstituted = LevelMother.reconstituted();

    expect(reconstituted.id.equals(created.id)).toBe(true);
    expect(reconstituted.rules.maxPossibleScore).toBe(created.rules.maxPossibleScore);
    expect(reconstituted.order.sequence).toBe(created.order.sequence);
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
