import { ITimeProvider } from '../../application/ports/ITimeProvider';

/** Concrete ITimeProvider backed by the platform clock. The only place in the
 * whole codebase allowed to read Date.now() — everything else receives time
 * through this port (domain/application never call Date.now() directly). */
export class SystemTimeProvider implements ITimeProvider {
  now(): number {
    return Date.now();
  }
}
