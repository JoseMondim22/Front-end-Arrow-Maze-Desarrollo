import { createAudioPlayer, AudioPlayer, AudioSource } from 'expo-audio';
import { IAudioService } from '../../application/ports/IAudioService';

/**
 * Concrete IAudioService (Singleton, §11) backed by expo-audio. Sound sources are
 * injected by id -> asset map at construction time, since no bundled sound files
 * exist yet; wire the real assets here once they're added under assets/sounds/.
 *
 * One AudioPlayer per effect is created ONCE, up front, and reused (seekTo(0) +
 * play()) on every trigger instead of calling createAudioPlayer() per tap.
 * Spamming the native AudioPlayer constructor (one per rotate/move) is what was
 * crashing Android with a NullPointerException inside its MediaSession setup —
 * the native side isn't built to have many players constructed back-to-back.
 */
export class ExpoAudioService implements IAudioService {
  private static instance: ExpoAudioService | null = null;

  private muted = false;
  private readonly players: Partial<Record<string, AudioPlayer>>;

  private constructor(sources: Record<string, AudioSource>) {
    this.players = ExpoAudioService.preload(sources);
  }

  static getInstance(sources: Record<string, AudioSource>): ExpoAudioService {
    if (ExpoAudioService.instance === null) {
      ExpoAudioService.instance = new ExpoAudioService(sources);
    }
    return ExpoAudioService.instance;
  }

  private static preload(
    sources: Record<string, AudioSource>,
  ): Partial<Record<string, AudioPlayer>> {
    const players: Partial<Record<string, AudioPlayer>> = {};
    for (const [effectId, source] of Object.entries(sources)) {
      try {
        players[effectId] = createAudioPlayer(source);
      } catch (error) {
        console.warn(`[ExpoAudioService] failed to preload "${effectId}"`, error);
      }
    }
    return players;
  }

  async playEffect(effectId: string): Promise<void> {
    if (this.muted) {
      return;
    }
    const player = this.players[effectId];
    if (player === undefined) {
      return;
    }
    try {
      // Not awaited on purpose: seekTo() resolves only once the native side
      // confirms the seek, a full bridge round-trip. Awaiting it here delayed
      // every single SFX trigger by that round-trip before play() even ran —
      // audible as lag on fast-repeated triggers (e.g. rotate double-taps).
      // Fire it and start playback immediately; the native player still
      // processes both calls in the order issued.
      void player.seekTo(0).catch(() => {});
      player.play();
    } catch (error) {
      console.warn(`[ExpoAudioService] failed to play "${effectId}"`, error);
    }
  }

  async setMuted(muted: boolean): Promise<void> {
    this.muted = muted;
  }

  async isMuted(): Promise<boolean> {
    return this.muted;
  }
}
