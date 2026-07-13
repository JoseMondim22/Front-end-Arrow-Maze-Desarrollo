import { AuthMother } from '@app-mothers/AuthMother';
import { RegisterUserTestAPI } from '@testing-apis/auth/RegisterUserTestAPI';

describe('RegisterUserUseCase', () => {
  it('should_register_user_when_email_is_not_taken', async () => {
    const testAPI = new RegisterUserTestAPI();
    const command = AuthMother.registerCommand();

    await testAPI.whenRegistering(command);

    testAPI.thenUserWasRegistered(command.email);
    testAPI.thenNoErrorWasThrown();
  });

  it('should_fail_when_email_is_already_registered', async () => {
    const testAPI = new RegisterUserTestAPI();
    const command = AuthMother.registerCommand();
    testAPI.givenEmailAlreadyRegistered(command.email);

    await testAPI.whenRegistering(command);

    testAPI.thenErrorWasThrown(`Email already registered: ${command.email}`);
  });
});
