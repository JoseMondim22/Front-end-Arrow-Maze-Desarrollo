import { LevelProgress } from '../../domain/player-progress/LevelProgress';
import { PlayerProgress } from '../../domain/player-progress/PlayerProgress';
import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { LevelOrder } from '../../domain/shared/value-objects/LevelOrder';
import { Score } from '../../domain/shared/value-objects/Score';
import { PlayerProgressRow } from '../ports/IPlayerProgressStore';

/** Row <-> domain for the player's local progress. Round-trips both ways since the
 * repository needs to both load (toDomain) and save (toRows). */
export class PlayerProgressMapper {
  static toDomain(rows: readonly PlayerProgressRow[]): PlayerProgress {
    const levelProgresses = rows.map((row) =>
      LevelProgress.reconstitute(
        LevelId.of(row.levelId),
        LevelOrder.of(row.order),
        row.completed,
        Score.of(row.bestScore),
      ),
    );
    return PlayerProgress.reconstitute(levelProgresses);
  }

  static toRows(progress: PlayerProgress): PlayerProgressRow[] {
    return progress.levelProgresses.map((levelProgress) => ({
      levelId: levelProgress.id.toString(),
      order: levelProgress.order.sequence,
      completed: levelProgress.isCompleted(),
      bestScore: levelProgress.bestScore.points,
    }));
  }
}
