import nodemailer from "nodemailer";

// Helper to create mail transporter
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = process.env.EMAIL_PORT || process.env.SMTP_PORT || 587;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
};

/**
 * Send email invitation notification to collaborator
 */
export const sendCollaboratorInviteEmail = async ({
  recipientEmail,
  inviterName,
  workspaceName,
  role = "editor",
  workspaceId,
}) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const workspaceLink = `${clientUrl}/projects/${workspaceId}`;
  const senderEmail = process.env.EMAIL_FROM || "notifications@researchnest.app";

  const subject = ` You've been added to "${workspaceName}" on ResearchNest!`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 32px 24px; }
        .card { background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #7c3aed; }
        .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px; margin-top: 20px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
        .footer { padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-t: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ResearchNest</h1>
          <p style="margin-top: 6px; opacity: 0.9; font-size: 14px;">Collaborative AI Research Workspace</p>
        </div>
        <div class="content">
          <h2 style="margin-top: 0; color: #0f172a;">Collaboration Invitation</h2>
          <p>Hello,</p>
          <p><strong>${inviterName}</strong> has invited you to join and collaborate on the research workspace <strong>"${workspaceName}"</strong> as an <strong>${role}</strong>.</p>
          
          <div class="card">
            <h3 style="margin: 0 0 8px 0; color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Workspace Details</h3>
            <p style="margin: 4px 0; font-weight: 600; font-size: 16px;">📌 Workspace: ${workspaceName}</p>
            <p style="margin: 4px 0; font-size: 14px;"> Access Role: <span style="text-transform: capitalize; font-weight: 600; color: #7c3aed;">${role}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"> Inviter: ${inviterName}</p>
          </div>

          <p>Collaborate on paper notes, AI-assisted summaries, discussions, and literature organization with your team.</p>

          <div style="text-align: center;">
            <a href="${workspaceLink}" class="btn">Open Workspace in ResearchNest</a>
          </div>
        </div>
        <div class="footer">
          <p>Sent by ResearchNest Platform • Empowering Deep Scientific Discovery</p>
          <p>If you did not expect this email, you can safely ignore it.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = createTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"ResearchNest" <${senderEmail}>`,
        to: recipientEmail,
        subject,
        html: htmlContent,
      });
      console.log(` Invitation email sent successfully to ${recipientEmail}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(` [EMAIL SIMULATION] SMTP credentials not set in .env. Invitation email logged for ${recipientEmail}:`);
      console.log(`Subject: ${subject}`);
      console.log(`Link: ${workspaceLink}`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(" Error sending email invitation:", error);
    // Don't throw error to avoid failing the invitation API flow
    return { success: false, error: error.message };
  }
};
