import { Score } from '@domain/shared/value-objects/Score';

/** Object Mother for leaderboard seed entries. */
export class LeaderboardMother {
  static entry(username: string, points: number): { username: string; score: Score } {
    return { username, score: Score.of(points) };
  }
}
