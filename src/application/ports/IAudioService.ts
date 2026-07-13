/**
 * Technical port over sound effects and music (expo-av, Singleton implementation).
 * Not tied to any use case: the store/UI calls it directly on domain events.
 */
export interface IAudioService {
  playEffect(effectId: string): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  isMuted(): Promise<boolean>;
}
