import { createAudioPlayer, AudioSource, AudioStatus } from 'expo-audio';
import { IAudioService } from '../../application/ports/IAudioService';

/**
 * Concrete IAudioService (Singleton, §11) backed by expo-audio. Sound sources are
 * injected by id -> asset map at construction time, since no bundled sound files
 * exist yet; wire the real assets here once they're added under assets/sounds/.
 */
export class ExpoAudioService implements IAudioService {
  private static instance: ExpoAudioService | null = null;

  private muted = false;

  private constructor(private readonly sources: Record<string, AudioSource>) {}

  static getInstance(sources: Record<string, AudioSource>): ExpoAudioService {
    if (ExpoAudioService.instance === null) {
      ExpoAudioService.instance = new ExpoAudioService(sources);
    }
    return ExpoAudioService.instance;
  }

  async playEffect(effectId: string): Promise<void> {
    if (this.muted) {
      return;
    }
    const source = this.sources[effectId];
    if (source === undefined) {
      return;
    }
    const player = createAudioPlayer(source);
    player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (status.didJustFinish) {
        player.remove();
      }
    });
    player.play();
  }

  async setMuted(muted: boolean): Promise<void> {
    this.muted = muted;
  }

  async isMuted(): Promise<boolean> {
    return this.muted;
  }
}
