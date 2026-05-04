import { encrypt } from '../lib/crypto.js';
import { upsertTestmailConfig } from '../repositories/config.repository.js';

export const addTestmailConfig = async (input: {
  userId: string;
  namespace: string;
  apiKey: string;
}) => {
  const encryptedApiKey = encrypt(input.apiKey);
  const config = await upsertTestmailConfig({
    userId: input.userId,
    namespace: input.namespace,
    encryptedApiKey,
  });

  return {
    status: 201,
    body: {
      message: 'Testmail config saved successfully',
      config,
    },
  };
};
