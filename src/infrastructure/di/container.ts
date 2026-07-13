import { AuthGuardCommandDecorator } from '../../interface-adapters/decorators/AuthGuardCommandDecorator';
import { AuthGuardQueryDecorator } from '../../interface-adapters/decorators/AuthGuardQueryDecorator';
import { CachingQueryDecorator } from '../../interface-adapters/decorators/CachingQueryDecorator';
import { LoggingCommandDecorator } from '../../interface-adapters/decorators/LoggingCommandDecorator';
import { LoggingQueryDecorator } from '../../interface-adapters/decorators/LoggingQueryDecorator';
import { PerformanceQueryDecorator } from '../../interface-adapters/decorators/PerformanceQueryDecorator';
import { createAuthStore } from '../../interface-adapters/presenters/useAuthStore';
import { createGameStore } from '../../interface-adapters/presenters/useGameStore';
import { createLeaderboardStore } from '../../interface-adapters/presenters/useLeaderboardStore';
import { createLevelsStore } from '../../interface-adapters/presenters/useLevelsStore';
import { HttpAuthRepository } from '../../interface-adapters/repositories/HttpAuthRepository';
import { HttpLeaderboardRepository } from '../../interface-adapters/repositories/HttpLeaderboardRepository';
import { HttpLevelRepository } from '../../interface-adapters/repositories/HttpLevelRepository';
import { HttpProgressSyncAdapter } from '../../interface-adapters/repositories/HttpProgressSyncAdapter';
import { SqlitePlayerProgressRepository } from '../../interface-adapters/repositories/SqlitePlayerProgressRepository';

import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { GetLevelsUseCase } from '../../application/use-cases/levels/GetLevelsUseCase';
import { StartGameUseCase } from '../../application/use-cases/levels/StartGameUseCase';
import { CompleteLevelUseCase } from '../../application/use-cases/progress/CompleteLevelUseCase';
import { SyncProgressUseCase } from '../../application/use-cases/progress/SyncProgressUseCase';
import { LoadPlayerProgressUseCase } from '../../application/use-cases/progress/LoadPlayerProgressUseCase';
import { GetLeaderboardUseCase } from '../../application/use-cases/leaderboard/GetLeaderboardUseCase';

import { FailedMovesScoringStrategy } from '../../domain/shared/services/FailedMovesScoringStrategy';

import { ExpoAudioService } from '../audio/ExpoAudioService';
import { HttpClient } from '../http/HttpClient';
import { I18nLocalizationService } from '../i18n/I18nLocalizationService';
import { SecureTokenStore } from '../persistence/SecureTokenStore';
import { SqlitePlayerProgressStore } from '../persistence/sqlite';
import { SystemTimeProvider } from '../time/SystemTimeProvider';
import { ConsoleLogger } from '../logging/ConsoleLogger';

/**
 * Composition Root (§4, §9): the ONLY file in the whole app that instantiates
 * concrete classes and wires the decorator chain AuthGuard -> Logging ->
 * Performance/Caching -> real use case. Everything else depends on interfaces.
 *
 * AuthGuard is applied per §14's Auth column: register/login are public (you
 * cannot have a session yet while authenticating), everything else is protected.
 */

// --- Capa 4: concrete infrastructure -------------------------------------

const tokenStore = new SecureTokenStore();
const httpClient = new HttpClient(tokenStore);
const playerProgressStore = new SqlitePlayerProgressStore();
const timeProvider = new SystemTimeProvider();
const logger = new ConsoleLogger();

// --- Capa 3: concrete repositories -----------------------------------------

const levelRepository = new HttpLevelRepository(httpClient);
const authRepository = new HttpAuthRepository(httpClient);
const progressSyncPort = new HttpProgressSyncAdapter(httpClient);
const leaderboardRepository = new HttpLeaderboardRepository(httpClient);
const playerProgressRepository = new SqlitePlayerProgressRepository(playerProgressStore);

// --- Capa 1: scoring policy, chosen once for the whole app ------------------

const scoring = new FailedMovesScoringStrategy();

// --- Capa 2: raw use cases ---------------------------------------------

const registerUserUseCase = new RegisterUserUseCase(authRepository);
const loginUseCase = new LoginUseCase(authRepository, tokenStore);
const getLevelsUseCase = new GetLevelsUseCase(levelRepository);
const startGameUseCase = new StartGameUseCase(levelRepository, scoring);
const completeLevelUseCase = new CompleteLevelUseCase(
  playerProgressRepository,
  progressSyncPort,
);
const syncProgressUseCase = new SyncProgressUseCase(progressSyncPort);
const loadPlayerProgressUseCase = new LoadPlayerProgressUseCase(
  playerProgressRepository,
);
const getLeaderboardUseCase = new GetLeaderboardUseCase(leaderboardRepository);

// --- AOP: decorate per §9 ----------------------------------------------

// Public (§14: Auth ❌) — no AuthGuard.
const decoratedRegisterUserUseCase = new LoggingCommandDecorator(
  registerUserUseCase,
  logger,
  timeProvider,
  'RegisterUserUseCase',
);
const decoratedLoginUseCase = new LoggingQueryDecorator(
  loginUseCase,
  logger,
  timeProvider,
  'LoginUseCase',
);

// Protected (§14: Auth ✅) — AuthGuard outermost, Logging next, Performance/
// Caching innermost, right next to the real use case.
const decoratedGetLevelsUseCase = new AuthGuardQueryDecorator(
  new LoggingQueryDecorator(getLevelsUseCase, logger, timeProvider, 'GetLevelsUseCase'),
  tokenStore,
);

const decoratedStartGameUseCase = new AuthGuardQueryDecorator(
  new LoggingQueryDecorator(
    new PerformanceQueryDecorator(
      startGameUseCase,
      logger,
      timeProvider,
      'StartGameUseCase',
    ),
    logger,
    timeProvider,
    'StartGameUseCase',
  ),
  tokenStore,
);

const decoratedCompleteLevelUseCase = new AuthGuardCommandDecorator(
  new LoggingCommandDecorator(
    completeLevelUseCase,
    logger,
    timeProvider,
    'CompleteLevelUseCase',
  ),
  tokenStore,
);

const decoratedSyncProgressUseCase = new AuthGuardCommandDecorator(
  new LoggingCommandDecorator(
    syncProgressUseCase,
    logger,
    timeProvider,
    'SyncProgressUseCase',
  ),
  tokenStore,
);

const decoratedLoadPlayerProgressUseCase = new AuthGuardQueryDecorator(
  new LoggingQueryDecorator(
    loadPlayerProgressUseCase,
    logger,
    timeProvider,
    'LoadPlayerProgressUseCase',
  ),
  tokenStore,
);

const decoratedGetLeaderboardUseCase = new AuthGuardQueryDecorator(
  new LoggingQueryDecorator(
    new CachingQueryDecorator(
      getLeaderboardUseCase,
      timeProvider,
      60_000,
      (query) => `${query.levelId.toString()}:${query.limit}`,
    ),
    logger,
    timeProvider,
    'GetLeaderboardUseCase',
  ),
  tokenStore,
);

// Consumed directly by UI/audio code, not through any use case (§4). Instantiated
// here (before the presenters) because useGameStore now also depends on it to
// play sound effects on game events (§4: "the store... republishes to UI and audio").
// The effect id -> asset map mirrors the SFX ids useGameStore plays (see SFX
// there): chain-exit, blocked, rotate, victory, defeat.
export const audioService = ExpoAudioService.getInstance({
  'chain-exit': require('../../../assets/sounds/chain-exit.mp3'),
  blocked: require('../../../assets/sounds/blocked.mp3'),
  rotate: require('../../../assets/sounds/rotate.mp3'),
  victory: require('../../../assets/sounds/victory.mp3'),
  defeat: require('../../../assets/sounds/defeat.mp3'),
});
export const localizationService = new I18nLocalizationService();

// --- Capa 3: presenters (Zustand), wired with the decorated use cases -------

export const useGameStore = createGameStore({
  startGameUseCase: decoratedStartGameUseCase,
  completeLevelUseCase: decoratedCompleteLevelUseCase,
  audioService,
});

export const useLevelsStore = createLevelsStore({
  getLevelsUseCase: decoratedGetLevelsUseCase,
  loadPlayerProgressUseCase: decoratedLoadPlayerProgressUseCase,
});

export const useAuthStore = createAuthStore({
  registerUserUseCase: decoratedRegisterUserUseCase,
  loginUseCase: decoratedLoginUseCase,
  tokenStore,
});

export const useLeaderboardStore = createLeaderboardStore({
  getLeaderboardUseCase: decoratedGetLeaderboardUseCase,
});

// Exposed for a future "retry sync" action (e.g. on app resume) — not wired to
// a presenter yet, since none of the 4 stores call it today.
export { decoratedSyncProgressUseCase as syncProgressUseCase };
