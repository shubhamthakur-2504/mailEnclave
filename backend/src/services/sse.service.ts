import { Response } from 'express';

type ClientsMap = Map<string, Set<Response>>;

const clients: ClientsMap = new Map();

export const subscribeToNamespace = (configId: string, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Some frameworks support flushHeaders
  // @ts-ignore
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  res.write(': connected\n\n');

  let set = clients.get(configId);
  if (!set) {
    set = new Set();
    clients.set(configId, set);
  }

  set.add(res);

  const cleanup = () => {
    set!.delete(res);
    if (set!.size === 0) clients.delete(configId);
  };

  res.on('close', cleanup);
  res.on('finish', cleanup);
};

export const publishToNamespace = (configId: string, event: string, payload: unknown) => {
  const set = clients.get(configId);
  if (!set || set.size === 0) return;

  const data = JSON.stringify(payload);
  for (const res of Array.from(set)) {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${data}\n\n`);
    } catch (err) {
      // ignore write errors; cleanup will happen on close
    }
  }
};

export default {
  subscribeToNamespace,
  publishToNamespace,
};
