import { IPlayerProgressRepository } from '../../../domain/player-progress/IPlayerProgressRepository';
import { PlayerProgress } from '../../../domain/player-progress/PlayerProgress';
import { ICommandService } from '../../cqs/ICommandService';
import { ClearLocalProgressCommand } from './ClearLocalProgressCommand';

/**
 * Wipes the device's local progress by saving an empty PlayerProgress. Called
 * on logout so the next account to log in on this device never sees a
 * previous user's progress — local progress has no user scoping (§15:
 * PlayerProgress models one device, not one account), so resetting it on
 * session boundaries is what keeps it from leaking between accounts.
 */
export class ClearLocalProgressUseCase implements ICommandService<ClearLocalProgressCommand> {
  constructor(private readonly playerProgressRepository: IPlayerProgressRepository) {}

  async execute(): Promise<void> {
    await this.playerProgressRepository.save(PlayerProgress.empty());
  }
}
