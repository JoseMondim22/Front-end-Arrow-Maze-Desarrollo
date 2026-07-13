import { AuthMother } from '@app-mothers/AuthMother';
import { LoginTestAPI } from '@testing-apis/auth/LoginTestAPI';

describe('LoginUseCase', () => {
  it('should_return_and_save_session_when_credentials_are_valid', async () => {
    const testAPI = new LoginTestAPI();
    const query = AuthMother.loginQuery();
    const session = AuthMother.session();
    testAPI.givenCredentialsYield(session);

    await testAPI.whenLoggingIn(query);

    testAPI.thenSessionWasReturned(session);
    testAPI.thenSessionWasSaved(session);
  });

  it('should_propagate_error_and_not_save_session_when_credentials_are_invalid', async () => {
    const testAPI = new LoginTestAPI();
    const query = AuthMother.loginQuery();
    testAPI.givenLoginFailsWith(new Error('invalid credentials'));

    await testAPI.whenLoggingIn(query);

    testAPI.thenErrorWasThrown('invalid credentials');
    testAPI.thenSessionWasNotSaved();
  });
});
