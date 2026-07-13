/** Parameter object for ClearLocalProgressUseCase. Empty on purpose — there is
 * nothing to parametrize, it just wipes the device's local progress. */
export type ClearLocalProgressCommand = Record<string, never>;
