import { LevelProgress } from '@domain/player-progress/LevelProgress';
import { PlayerProgress } from '@domain/player-progress/PlayerProgress';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { LevelOrder } from '@domain/shared/value-objects/LevelOrder';
import { Score } from '@domain/shared/value-objects/Score';

/** Object Mother for the PlayerProgress aggregate root. */
export class PlayerProgressMother {
  static empty(): PlayerProgress {
    return PlayerProgress.empty();
  }

  static withCompletedLevel(levelId: LevelId, order: LevelOrder): PlayerProgress {
    return PlayerProgress.reconstitute([
      LevelProgress.reconstitute(levelId, order, true, Score.zero()),
    ]);
  }

  static withScore(
    levelId: LevelId,
    order: LevelOrder,
    points: number,
  ): PlayerProgress {
    return PlayerProgress.reconstitute([
      LevelProgress.reconstitute(levelId, order, true, Score.of(points)),
    ]);
  }

  static withFreshLevel(levelId: LevelId, order: LevelOrder): PlayerProgress {
    return PlayerProgress.reconstitute([LevelProgress.fresh(levelId, order)]);
  }

  /** Two levels; the first is optionally completed (drives the unlock invariant). */
  static firstAndSecond(completedFirst: boolean): PlayerProgress {
    const first = completedFirst
      ? LevelProgress.reconstitute(
          LevelId.of('lvl-1'),
          LevelOrder.of(1),
          true,
          Score.zero(),
        )
      : LevelProgress.fresh(LevelId.of('lvl-1'), LevelOrder.of(1));
    const second = LevelProgress.fresh(LevelId.of('lvl-2'), LevelOrder.of(2));
    return PlayerProgress.reconstitute([first, second]);
  }
}
