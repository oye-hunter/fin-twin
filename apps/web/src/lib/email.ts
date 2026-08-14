export interface SendReminderParams {
  toEmail: string;
  recipientName: string;
  amount: string | number;
  note?: string | null;
  senderName: string;
}

export async function sendReminderEmail(params: SendReminderParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { toEmail, recipientName, amount, note, senderName } = params;
  const apiKey = process.env.RESEND_API_KEY;

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f6f3ef; border-radius: 12px; color: #121718;">
      <h2 style="margin-top: 0; color: #121718;">Friendly Payment Reminder from ${senderName}</h2>
      <p>Hi ${recipientName},</p>
      <p>This is a gentle reminder regarding the <strong>$${amount}</strong> lent for ${note ? `<em>"${note}"</em>` : 'an earlier expense'}.</p>
      <p>Please let ${senderName} know once settled.</p>
      <hr style="border: none; border-top: 1px solid rgba(18,23,24,0.1); margin: 24px 0;" />
      <p style="font-size: 12px; color: rgba(18,23,24,0.5);">Sent via Fin-Twin — Financial Twin Assistant</p>
    </div>
  `;

  if (!apiKey) {
    console.log(`[DEV/MOCK EMAIL] To: ${toEmail} | Amount: $${amount} | Note: ${note}`);
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Fin-Twin <onboarding@resend.dev>',
        to: [toEmail],
        subject: `Payment reminder: $${amount} from ${senderName}`,
        html: emailHtml,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Resend error' };
    }

    return { success: true, messageId: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send email' };
  }
}
