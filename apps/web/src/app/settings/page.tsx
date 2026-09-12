'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mic, CheckCircle2, Copy, Check, ExternalLink, Unlink, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

interface SlackLinkStatus {
  isLinked: boolean;
  slackUserId: string | null;
  linkCode: string | null;
  linkedAt: string | null;
}

export default function SettingsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [linkStatus, setLinkStatus] = useState<SlackLinkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/slack/link');
      if (res.ok) {
        const data = await res.json();
        setLinkStatus(data);
      }
    } catch (e: any) {
      console.error('Failed to fetch Slack link status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchStatus();
    } else if (!sessionLoading) {
      setLoading(false);
    }
  }, [session, sessionLoading]);

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    setError(null);
    try {
      const res = await fetch('/api/slack/link', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate link code');
      const data = await res.json();
      setLinkStatus((prev) => ({
        isLinked: false,
        slackUserId: null,
        linkCode: data.linkCode,
        linkedAt: null,
      }));
    } catch (err: any) {
      setError(err?.message || 'Error generating link code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Are you sure you want to disconnect your Slack account?')) return;
    setUnlinking(true);
    setError(null);
    try {
      const res = await fetch('/api/slack/link', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to disconnect Slack');
      setLinkStatus({
        isLinked: false,
        slackUserId: null,
        linkCode: null,
        linkedAt: null,
      });
    } catch (err: any) {
      setError(err?.message || 'Error disconnecting Slack');
    } finally {
      setUnlinking(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Sign in to manage Settings</h1>
        <p className="text-sm text-ink/60">
          Please sign in to link your Slack account and manage your Fin-Twin preferences.
        </p>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Settings</h1>
        <p className="text-sm text-ink/60 mt-1">
          Configure connected channels and manage automated dump integrations.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Slack Integration Card */}
      <Card className="bg-paper border border-ink/8 rounded-[12px] p-6 sm:p-8 space-y-6 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink/8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[12px] bg-linen border border-ink/8 flex items-center justify-center text-ink">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ink tracking-tight">Slack Inbound AI Dump</h2>
                {linkStatus?.isLinked ? (
                  <Badge variant="apricot" className="gap-1.5 py-0.5">
                    <CheckCircle2 className="w-3 h-3 text-ink" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="linen" className="text-ink/60 py-0.5">
                    Not Connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-ink/60 mt-0.5">
                Dump expenses & income via Slack direct message or voice notes.
              </p>
            </div>
          </div>

          {linkStatus?.isLinked && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleUnlink}
              disabled={unlinking}
              className="self-start sm:self-auto gap-1.5 text-xs"
            >
              {unlinking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Unlink className="w-3.5 h-3.5" />
              )}
              Disconnect
            </Button>
          )}
        </div>

        {/* Card Body */}
        {linkStatus?.isLinked ? (
          <div className="space-y-5">
            <div className="bg-linen rounded-[12px] p-4 border border-ink/8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-semibold text-ink">Slack Member ID:</span>{' '}
                <code className="font-mono bg-paper px-2 py-0.5 rounded-[6px] border border-ink/8">
                  {linkStatus.slackUserId}
                </code>
              </div>
              {linkStatus.linkedAt && (
                <span className="text-ink/50">
                  Connected on {new Date(linkStatus.linkedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-ink">How to dump transactions:</h3>
              <ul className="space-y-2 text-xs text-ink/70">
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-apricot flex items-center justify-center shrink-0 mt-0.5 text-ink font-bold text-[10px]">
                    1
                  </div>
                  <span>
                    Open a 1:1 Direct Message with the <strong>Fin-Twin</strong> bot in Slack.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-apricot flex items-center justify-center shrink-0 mt-0.5 text-ink font-bold text-[10px]">
                    2
                  </div>
                  <span>
                    Type any expense or money movement (e.g. <em>"Spent 42.50 on groceries at Trader Joes yesterday"</em> or <em>"Lent 20 to Sarah for coffee"</em>).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-apricot flex items-center justify-center shrink-0 mt-0.5 text-ink font-bold text-[10px]">
                    3
                  </div>
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-ink/60" />
                    Or record a quick voice clip — Fin-Twin transcribes and extracts entries automatically.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-apricot flex items-center justify-center shrink-0 mt-0.5 text-ink font-bold text-[10px]">
                    4
                  </div>
                  <span>
                    The bot replies with a confirmation card. Click <strong>Confirm & Save</strong> or reply <strong>yes</strong> to persist directly to your dashboard.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-ink/70 leading-relaxed">
              Connect your personal Slack to dump transactions on the go. Slack is unblocked across all networks, supports 1:1 private messages, and handles both natural text and voice memos seamlessly.
            </p>

            {linkStatus?.linkCode ? (
              <div className="space-y-4 bg-linen rounded-[12px] p-5 border border-ink/8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink/60 uppercase tracking-wider">
                    Your One-Time Link Code
                  </span>
                  <button
                    onClick={fetchStatus}
                    title="Check connection status"
                    className="text-xs text-ink/50 hover:text-ink flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh status
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-paper border border-ink/10 rounded-[12px] px-4 py-3 font-mono font-bold text-xl tracking-wider text-ink text-center select-all">
                    {linkStatus.linkCode}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleCopyCode(linkStatus.linkCode!)}
                    className="gap-1.5 shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-ink" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2 pt-2 border-t border-ink/8 text-xs text-ink/70">
                  <p className="font-semibold text-ink">Instructions to complete linking:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1">
                    <li>Open your Slack workspace.</li>
                    <li>
                      Find the <strong>Fin-Twin</strong> bot in your Direct Messages.
                    </li>
                    <li>
                      Send the code <code className="bg-paper px-1.5 py-0.5 rounded font-bold">{linkStatus.linkCode}</code> as a message.
                    </li>
                    <li>
                      The bot will reply with a confirmation message once linked.
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              <div>
                <Button
                  variant="primary"
                  onClick={handleGenerateCode}
                  disabled={generatingCode}
                  className="gap-2"
                >
                  {generatingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Link Code...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Connect Slack
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
