import { BoardDTO } from './BoardDTO';

/**
 * Response body for GET /levels. §4 does not specify difficulty's type; kept as a
 * string label ('easy' | 'medium' | 'hard' or similar) until the real backend
 * contract is confirmed — adjust here once BACKEND_CHANGES.md settles it.
 */
export interface LevelDTO {
  id: string;
  board: BoardDTO;
  timeLimit: number;
  maxMoves: number;
  maxPossibleScore: number;
  difficulty: string;
  order: number;
}
