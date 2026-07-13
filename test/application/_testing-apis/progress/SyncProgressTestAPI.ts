import { IProgressSyncPort } from '@application/ports/IProgressSyncPort';
import { SyncProgressCommand } from '@application/use-cases/progress/SyncProgressCommand';
import { SyncProgressUseCase } from '@application/use-cases/progress/SyncProgressUseCase';
import { mock, MockProxy } from 'jest-mock-extended';

/** Testing API for SyncProgressUseCase. IProgressSyncPort is a simple technical
 * port with no meaningful state to fake, so it stays a jest-mock-extended mock. */
export class SyncProgressTestAPI {
  private readonly progressSyncPort: MockProxy<IProgressSyncPort> = mock<IProgressSyncPort>();
  private thrownError: unknown;

  givenSyncSucceeds(): void {
    this.progressSyncPort.sync.mockResolvedValue(undefined);
  }

  givenSyncFailsWith(error: Error): void {
    this.progressSyncPort.sync.mockRejectedValue(error);
  }

  async whenSyncing(command: SyncProgressCommand): Promise<void> {
    const useCase = new SyncProgressUseCase(this.progressSyncPort);
    try {
      await useCase.execute(command);
    } catch (error) {
      this.thrownError = error;
    }
  }

  thenSyncWasCalledWith(command: SyncProgressCommand): void {
    expect(this.progressSyncPort.sync).toHaveBeenCalledWith(command);
  }

  thenNoErrorWasThrown(): void {
    expect(this.thrownError).toBeUndefined();
  }

  thenErrorWasThrown(message: string): void {
    expect(this.thrownError).toBeInstanceOf(Error);
    expect((this.thrownError as Error).message).toBe(message);
  }
}
