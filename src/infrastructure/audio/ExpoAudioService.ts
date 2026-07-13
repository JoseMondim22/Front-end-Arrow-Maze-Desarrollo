import { Audio, AVPlaybackSource } from 'expo-av';
import { IAudioService } from '../../application/ports/IAudioService';

/**
 * Concrete IAudioService (Singleton, §11) backed by expo-av. Sound sources are
 * injected by id -> asset map at construction time, since no bundled sound files
 * exist yet; wire the real assets here once they're added under assets/sounds/.
 */
export class ExpoAudioService implements IAudioService {
  private static instance: ExpoAudioService | null = null;

  private muted = false;

  private constructor(private readonly sources: Record<string, AVPlaybackSource>) {}

  static getInstance(sources: Record<string, AVPlaybackSource>): ExpoAudioService {
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
    const { sound } = await Audio.Sound.createAsync(source);
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        void sound.unloadAsync();
      }
    });
    await sound.playAsync();
  }

  async setMuted(muted: boolean): Promise<void> {
    this.muted = muted;
  }

  async isMuted(): Promise<boolean> {
    return this.muted;
  }
}
