import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface AssessmentInviteEmail {
  to: string;
  candidateName: string;
  companyName: string;
  jobTitle?: string;
  assessmentUrl: string;
  expiresAt: Date;
}

export async function sendAssessmentInvite({
  to,
  candidateName,
  companyName,
  jobTitle,
  assessmentUrl,
  expiresAt,
}: AssessmentInviteEmail) {
  const firstName = candidateName.split(' ')[0] || 'there';
  const expiresIn = Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Telescopic <assessments@telescopic.ca>',
    to,
    subject: `Complete your AI Literacy Assessment${jobTitle ? ` for ${jobTitle}` : ''}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6366f1; margin: 0;">🎯 Telescopic</h1>
    <p style="color: #666; margin: 5px 0;">AI Literacy Assessment</p>
  </div>

  <p>Hi ${firstName},</p>

  <p>${companyName} has invited you to complete an AI Literacy Assessment${jobTitle ? ` as part of your application for <strong>${jobTitle}</strong>` : ''}.</p>

  <p>This assessment evaluates your ability to effectively collaborate with AI tools — a skill that's becoming essential across all roles.</p>

  <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
    <p style="margin: 0 0 10px;"><strong>What to expect:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>~15-20 minutes to complete</li>
      <li>Real-world AI collaboration scenarios</li>
      <li>No right or wrong answers — we're measuring how you work with AI</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${assessmentUrl}" style="background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Start Assessment</a>
  </div>

  <p style="color: #666; font-size: 14px;">⏰ This link expires in ${expiresIn} hours.</p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px;">
    You're receiving this because ${companyName} invited you to complete an assessment via Telescopic.
    If you didn't apply for a position, you can ignore this email.
  </p>
</body>
</html>
    `,
    text: `
Hi ${firstName},

${companyName} has invited you to complete an AI Literacy Assessment${jobTitle ? ` for ${jobTitle}` : ''}.

This assessment evaluates your ability to effectively collaborate with AI tools.

What to expect:
- ~15-20 minutes to complete
- Real-world AI collaboration scenarios
- No right or wrong answers

Start your assessment: ${assessmentUrl}

This link expires in ${expiresIn} hours.

---
You're receiving this because ${companyName} invited you via Telescopic.
    `.trim(),
  });

  if (error) {
    console.error('Failed to send assessment invite email:', error);
    throw error;
  }

  console.log('Assessment invite sent to', to, 'email id:', data?.id);
  return data;
}
