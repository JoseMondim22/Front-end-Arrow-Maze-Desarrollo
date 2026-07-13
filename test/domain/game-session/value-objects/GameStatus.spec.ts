import { GameStatus } from '@domain/game-session/value-objects/GameStatus';

describe('GameStatus', () => {
  it('should_describe_the_playing_state', () => {
    const status = GameStatus.Playing;

    expect(status.name).toBe('Playing');
    expect(status.isPlaying()).toBe(true);
    expect(status.isPaused()).toBe(false);
    expect(status.isTerminal()).toBe(false);
    expect(status.canAct()).toBe(true);
    expect(status.pause().name).toBe('Paused');
    expect(status.resume()).toBe(status); // resume while playing is a no-op
  });

  it('should_describe_the_paused_state', () => {
    const status = GameStatus.Paused;

    expect(status.name).toBe('Paused');
    expect(status.isPlaying()).toBe(false);
    expect(status.isPaused()).toBe(true);
    expect(status.isTerminal()).toBe(false);
    expect(status.canAct()).toBe(false);
    expect(status.resume().name).toBe('Playing');
    expect(status.pause()).toBe(status); // pause while paused is a no-op
  });

  it('should_describe_the_victory_state_as_terminal', () => {
    const status = GameStatus.Victory;

    expect(status.name).toBe('Victory');
    expect(status.isTerminal()).toBe(true);
    expect(status.isPlaying()).toBe(false);
    expect(status.isPaused()).toBe(false);
    expect(status.canAct()).toBe(false);
    expect(status.pause()).toBe(status);
    expect(status.resume()).toBe(status);
  });

  it('should_describe_the_defeat_state_as_terminal', () => {
    const status = GameStatus.Defeat;

    expect(status.name).toBe('Defeat');
    expect(status.isTerminal()).toBe(true);
    expect(status.isPlaying()).toBe(false);
    expect(status.isPaused()).toBe(false);
    expect(status.canAct()).toBe(false);
    expect(status.pause()).toBe(status);
    expect(status.resume()).toBe(status);
  });
});
