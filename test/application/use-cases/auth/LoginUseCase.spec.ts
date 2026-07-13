import { AuthMother } from '@app-mothers/AuthMother';
import { LoginTestAPI } from '@testing-apis/auth/LoginTestAPI';

describe('LoginUseCase', () => {
  it('should_return_and_save_session_when_credentials_are_valid', async () => {
    const testAPI = new LoginTestAPI();
    const query = AuthMother.loginQuery();
    testAPI.givenRegisteredUser({
      email: query.email,
      password: query.password,
      username: 'player_one',
      userId: 'user-1',
    });

    await testAPI.whenLoggingIn(query);

    testAPI.thenSessionUserIdIs('user-1');
    await testAPI.thenSessionWasSaved();
  });

  it('should_fail_and_not_save_session_when_credentials_are_invalid', async () => {
    const testAPI = new LoginTestAPI();
    const query = AuthMother.loginQuery();
    // No user registered for this email: login must fail.

    await testAPI.whenLoggingIn(query);

    testAPI.thenErrorWasThrown('Invalid credentials');
    await testAPI.thenSessionWasNotSaved();
  });
});
