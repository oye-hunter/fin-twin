import crypto from 'crypto';

export interface SlackBlock {
  type: string;
  [key: string]: any;
}

export interface SendSlackMessageOptions {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  threadTs?: string;
  botToken?: string;
}

export interface UpdateSlackMessageOptions {
  channel: string;
  ts: string;
  text: string;
  blocks?: SlackBlock[];
  botToken?: string;
}

/**
 * Verifies that an incoming HTTP request originated from Slack using the signing secret.
 */
export function verifySlackSignature(options: {
  signingSecret?: string;
  signature: string | null;
  timestamp: string | null;
  rawBody: string;
}): boolean {
  const signingSecret = options.signingSecret || process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) {
    // If no signing secret is configured in development, bypass with a warning
    console.warn('SLACK_SIGNING_SECRET is not configured; skipping signature verification.');
    return true;
  }

  const { signature, timestamp, rawBody } = options;
  if (!signature || !timestamp) {
    return false;
  }

  // Prevent replay attacks (allow clock skew of up to 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const reqTime = parseInt(timestamp, 10);
  if (isNaN(reqTime) || Math.abs(now - reqTime) > 60 * 5) {
    return false;
  }

  const sigBasestring = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto.createHmac('sha256', signingSecret);
  const mySignature = `v0=${hmac.update(sigBasestring).digest('hex')}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(mySignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch {
    return false;
  }
}

/**
 * Posts a message to a Slack channel or DM via chat.postMessage.
 */
export async function sendSlackMessage(options: SendSlackMessageOptions) {
  const token = options.botToken || process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.warn('SLACK_BOT_TOKEN is not configured; message not delivered to Slack.');
    return { ok: false, error: 'SLACK_BOT_TOKEN_NOT_CONFIGURED' };
  }

  const payload: any = {
    channel: options.channel,
    text: options.text,
  };
  if (options.blocks) {
    payload.blocks = options.blocks;
  }
  if (options.threadTs) {
    payload.thread_ts = options.threadTs;
  }

  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return await res.json();
}

/**
 * Updates an existing message in a Slack channel or DM via chat.update.
 */
export async function updateSlackMessage(options: UpdateSlackMessageOptions) {
  const token = options.botToken || process.env.SLACK_BOT_TOKEN;
  if (!token) {
    return { ok: false, error: 'SLACK_BOT_TOKEN_NOT_CONFIGURED' };
  }

  const payload: any = {
    channel: options.channel,
    ts: options.ts,
    text: options.text,
  };
  if (options.blocks) {
    payload.blocks = options.blocks;
  }

  const res = await fetch('https://slack.com/api/chat.update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return await res.json();
}

/**
 * Downloads a private Slack file attachment (e.g. voice or audio recording) as a Buffer.
 */
export async function downloadSlackFile(url: string, botToken?: string): Promise<Buffer> {
  const token = botToken || process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error('SLACK_BOT_TOKEN is required to download Slack attachments');
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download Slack file: ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
