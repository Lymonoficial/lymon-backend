import {
  RecoverGuestPasswordHandler,
  RecoverGuestPasswordResult,
} from '@/application/guest-auth/commands/recover-guest-password/recover-guest-password.handler';
import { RecoverGuestPasswordCommand } from '@/application/guest-auth/commands/recover-guest-password/recover-guest-password.command';
import { GuestAccountRepository } from '@/domain/guest-account/repositories/guest-account.repository';
import { IEmailService } from '@/application/shared/services/email.service';
import { GuestAccountStatusEnum } from '@/domain/guest-account/value-objects/guest-account-status.vo';
import { createGuestAccountRepositoryMock } from '@test/shared/mocks/repositories/guest-account-repository.mock';
import { createEmailServiceMock } from '@test/shared/mocks/services/email-service.mock';
import {
  makeGuestAccount,
  GUEST_ACCOUNT_FIXTURE_DEFAULTS,
} from '@test/shared/fixtures/guest-account.fixture';

const GENERIC_MESSAGE = 'If the email exists, a recovery link has been sent';

describe('RecoverGuestPasswordHandler', () => {
  let handler: RecoverGuestPasswordHandler;
  let guestAccountRepository: jest.Mocked<GuestAccountRepository>;
  let emailService: jest.Mocked<IEmailService>;

  beforeEach(() => {
    guestAccountRepository = createGuestAccountRepositoryMock();
    emailService = createEmailServiceMock();

    handler = new RecoverGuestPasswordHandler(
      guestAccountRepository,
      emailService,
    );
  });

  describe('when the email is not registered', () => {
    it('returns the generic success message without sending email', async () => {
      guestAccountRepository.findByEmail.mockResolvedValue(null);

      const result = await handler.execute(
        new RecoverGuestPasswordCommand('unknown@example.com'),
      );

      expect(result).toBeInstanceOf(RecoverGuestPasswordResult);
      expect(result.message).toBe(GENERIC_MESSAGE);
      expect(guestAccountRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendRecoveryEmail).not.toHaveBeenCalled();
    });
  });

  describe('when the email is valid and registered', () => {
    beforeEach(() => {
      guestAccountRepository.findByEmail.mockResolvedValue(
        makeGuestAccount({ status: GuestAccountStatusEnum.ACTIVE }),
      );
    });

    it('returns the generic success message', async () => {
      const result = await handler.execute(
        new RecoverGuestPasswordCommand(GUEST_ACCOUNT_FIXTURE_DEFAULTS.email),
      );

      expect(result).toBeInstanceOf(RecoverGuestPasswordResult);
      expect(result.message).toBe(GENERIC_MESSAGE);
    });

    it('saves the account with a reset token', async () => {
      await handler.execute(
        new RecoverGuestPasswordCommand(GUEST_ACCOUNT_FIXTURE_DEFAULTS.email),
      );

      expect(guestAccountRepository.save).toHaveBeenCalledTimes(1);
    });

    it('sends a recovery email with the plain token', async () => {
      await handler.execute(
        new RecoverGuestPasswordCommand(GUEST_ACCOUNT_FIXTURE_DEFAULTS.email),
      );

      expect(emailService.sendRecoveryEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendRecoveryEmail).toHaveBeenCalledWith(
        GUEST_ACCOUNT_FIXTURE_DEFAULTS.email,
        expect.any(String),
      );
    });
  });
});
