import { AuthMother } from '@app-mothers/AuthMother';
import { RegisterUserTestAPI } from '@testing-apis/auth/RegisterUserTestAPI';

describe('RegisterUserUseCase', () => {
  it('should_register_user_when_valid_command_is_given', async () => {
    const testAPI = new RegisterUserTestAPI();
    const command = AuthMother.registerCommand();
    testAPI.givenRegistrationSucceeds();

    await testAPI.whenRegistering(command);

    testAPI.thenUserWasRegisteredWith(command);
    testAPI.thenNoErrorWasThrown();
  });

  it('should_propagate_error_when_registration_fails', async () => {
    const testAPI = new RegisterUserTestAPI();
    const command = AuthMother.registerCommand();
    testAPI.givenRegistrationFailsWith(new Error('email already registered'));

    await testAPI.whenRegistering(command);

    testAPI.thenErrorWasThrown('email already registered');
  });
});
