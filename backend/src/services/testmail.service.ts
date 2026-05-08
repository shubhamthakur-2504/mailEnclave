import axios from 'axios';
import { API_TIMEOUT_MS, TESTMAIL_BASE_URL, TESTMAIL_LIVEQUERY_TIMEOUT_MS } from '../constants/index.js';
import { decrypt } from '../lib/crypto.js';
import { getConfigByIdWithApiKey } from '../repositories/config.repository.js';
import type { TestmailEmailsQueryInput } from '../validators/config.validator.js';

type FetchNamespaceEmailsInput = {
  userId: string;
  configId: string;
  query: TestmailEmailsQueryInput;
};

export type TestmailJsonEmail = {
  id?: string;
  message_id?: string;
  tag?: string;
  subject?: string;
  html?: string;
  text?: string;
  from?: string;
  timestamp?: number;
  [key: string]: unknown;
};

export type TestmailJsonResponse = {
  result: string;
  message: string | null;
  count: number;
  limit: number;
  offset: number;
  emails: TestmailJsonEmail[];
};

const LIVEQUERY_TIMEOUT_MS = TESTMAIL_LIVEQUERY_TIMEOUT_MS;

const buildParams = (apiKey: string, namespace: string, query: TestmailEmailsQueryInput) => {
  const params: Record<string, string | number | boolean> = {
    apikey: apiKey,
    namespace,
  };

  if (query.tag) params.tag = query.tag;
  if (query.tag_prefix) params.tag_prefix = query.tag_prefix;
  if (query.timestamp_from !== undefined) params.timestamp_from = query.timestamp_from;
  if (query.timestamp_to !== undefined) params.timestamp_to = query.timestamp_to;
  if (query.limit !== undefined) params.limit = query.limit;
  if (query.offset !== undefined) params.offset = query.offset;
  if (query.livequery !== undefined) params.livequery = query.livequery;
  if (query.headers !== undefined) params.headers = query.headers;
  if (query.spam_report !== undefined) params.spam_report = query.spam_report;

  return params;
};

export const fetchTestmailInbox = async (input: {
  apiKey: string;
  namespace: string;
  query: TestmailEmailsQueryInput;
}) => {
  const { apiKey, namespace, query } = input;
  const livequery = query.livequery === true;

  const { data, status } = await axios.get<TestmailJsonResponse>(`${TESTMAIL_BASE_URL}/api/json`, {
    params: buildParams(apiKey, namespace, query),
    timeout: livequery ? LIVEQUERY_TIMEOUT_MS : API_TIMEOUT_MS,
    maxRedirects: 0,
    validateStatus: () => true,
  });

  return {
    status,
    data,
  };
};

export const fetchNamespaceEmails = async ({ userId, configId, query }: FetchNamespaceEmailsInput) => {
  const config = await getConfigByIdWithApiKey(configId, userId);
  if (!config) {
    return {
      status: 404,
      body: {
        error: 'Config not found',
      },
    };
  }

  const apiKey = decrypt(config.encryptedApiKey);
  const { data, status } = await fetchTestmailInbox({ apiKey, namespace: config.namespace, query });

  return {
    status,
    body: {
      config: {
        id: config.id,
        namespace: config.namespace,
      },
      ...data,
    },
  };
};