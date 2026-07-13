import { IProgressSyncPort } from '../../application/ports/IProgressSyncPort';
import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { Score } from '../../domain/shared/value-objects/Score';
import { SyncDTO } from '../dtos/input/SyncDTO';
import { ProgressEntryDTO } from '../dtos/output/ProgressEntryDTO';
import { IHttpClient } from '../ports/IHttpClient';

/** Implements IProgressSyncPort against POST /progress/sync and GET /progress (§14). */
export class HttpProgressSyncAdapter implements IProgressSyncPort {
  constructor(private readonly httpClient: IHttpClient) {}

  async sync(params: { levelId: LevelId; score: Score }): Promise<void> {
    const body: SyncDTO = {
      levelId: params.levelId.toString(),
      score: params.score.points,
    };
    await this.httpClient.post<void>('/progress/sync', body);
  }

  async fetchAll(): Promise<Array<{ levelId: LevelId; bestScore: Score }>> {
    const rows = await this.httpClient.get<ProgressEntryDTO[]>('/progress');
    return rows.map((row) => ({
      levelId: LevelId.of(row.levelId),
      bestScore: Score.of(row.bestScore),
    }));
  }
}
