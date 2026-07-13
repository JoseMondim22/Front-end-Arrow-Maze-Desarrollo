import { ICommandService } from '../../cqs/ICommandService';
import { IProgressSyncPort } from '../../ports/IProgressSyncPort';
import { SyncProgressCommand } from './SyncProgressCommand';

/**
 * Re-sends a level's score to the backend, independently of CompleteLevelUseCase —
 * e.g. to retry progress that failed to sync earlier (on app resume, pull-to-retry).
 */
export class SyncProgressUseCase implements ICommandService<SyncProgressCommand> {
  constructor(private readonly progressSyncPort: IProgressSyncPort) {}

  async execute(command: SyncProgressCommand): Promise<void> {
    await this.progressSyncPort.sync(command);
  }
}
