/** One row of a level's leaderboard, as the backend sends it. */
export interface LeaderboardEntryDTO {
  position: number;
  username: string;
  score: number;
}
