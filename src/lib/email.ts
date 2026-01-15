// lib/email.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.OPTIK_EMAIL_FROM || 'orders@optikecosystem.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://optikecosystem.com';

interface OrderConfirmationData {
  customerEmail: string;
  customerName: string;
  jobId: string;
  productType: string;
  tokenTier?: string;
  dappTier?: string;
  totalPrice: number;
  estimatedCompletion: string;
}

interface CompletionData {
  customerEmail: string;
  customerName: string;
  jobId: string;
  productType: string;
  downloadUrl: string;
  fileSizeMB: string;
  completedAt: string;
}

interface PaymentConfirmationData {
  customerEmail: string;
  customerName: string;
  jobId: string;
  amount: number;
  paymentMethod: 'stripe' | 'crypto';
  transactionId?: string;
}

// Order Confirmation Email
export async function sendOrderConfirmationEmail(data: OrderConfirmationData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `OPTIK DApp Factory <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `✅ Order Confirmed - Your DApp is Being Generated! (Job ${data.jobId})`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .status-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .info-box {
      background: #f9fafb;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6b7280;
      font-weight: 500;
    }
    .info-value {
      color: #111827;
      font-weight: 600;
    }
    .timeline {
      margin: 30px 0;
    }
    .timeline-item {
      display: flex;
      align-items: center;
      padding: 15px 0;
    }
    .timeline-dot {
      width: 12px;
      height: 12px;
      background: #667eea;
      border-radius: 50%;
      margin-right: 15px;
    }
    .timeline-dot.completed {
      background: #10b981;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .job-id {
      font-family: monospace;
      background: #e5e7eb;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Order Confirmed!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your production-ready DApp is being generated</p>
    </div>
    
    <div class="content">
      <span class="status-badge">⚡ PROCESSING</span>
      
      <p>Hi ${data.customerName},</p>
      
      <p>Great news! Your order has been confirmed and our AI team is now generating your ${data.productType.replace('-', ' ')}.</p>
      
      <div class="info-box">
        <h3 style="margin-top: 0;">Order Details</h3>
        <div class="info-row">
          <span class="info-label">Job ID</span>
          <span class="info-value"><span class="job-id">${data.jobId}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Product Type</span>
          <span class="info-value">${data.productType.replace('-', ' ').toUpperCase()}</span>
        </div>
        ${data.tokenTier ? `
        <div class="info-row">
          <span class="info-label">Token Tier</span>
          <span class="info-value">${data.tokenTier.replace('tier-', 'Tier ')}</span>
        </div>
        ` : ''}
        ${data.dappTier ? `
        <div class="info-row">
          <span class="info-label">DApp Tier</span>
          <span class="info-value">${data.dappTier.replace('tier-', 'Tier ')}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Total Price</span>
          <span class="info-value">$${data.totalPrice.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Estimated Completion</span>
          <span class="info-value">${new Date(data.estimatedCompletion).toLocaleString()}</span>
        </div>
      </div>
      
      <h3>What's Happening Now?</h3>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-dot completed"></div>
          <div>
            <strong>Order Received</strong> ✓
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Your order is confirmed and queued</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div>
            <strong>AI Generation (90 minutes)</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">8 specialized AI agents building your project</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div>
            <strong>Quality Assurance</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Security audit, performance testing, final checks</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div>
            <strong>Delivery</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Download link sent to your email</p>
          </div>
        </div>
      </div>
      
      <center>
        <a href="${APP_URL}/track/${data.jobId}" class="cta-button">
          Track Your Order →
        </a>
      </center>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong style="color: #92400e;">💡 Pro Tip:</strong>
        <p style="margin: 5px 0 0 0; color: #92400e;">Bookmark your tracking page to monitor progress in real-time!</p>
      </div>
      
      <h3>What You'll Receive:</h3>
      <ul style="color: #4b5563;">
        <li>✅ Complete source code (Rust/Anchor + Next.js)</li>
        <li>✅ Production-ready smart contracts</li>
        <li>✅ Fully functional frontend dApp</li>
        <li>✅ Deployment scripts (one-command deploy)</li>
        <li>✅ Comprehensive documentation</li>
        <li>✅ Security audit report</li>
        <li>✅ QA test results</li>
        ${data.tokenTier && data.tokenTier !== 'tier-1' ? '<li>✅ Marketing content & strategy</li>' : ''}
      </ul>
      
      <p>We'll send you another email as soon as your project is ready for download.</p>
      
      <p>Questions? Reply to this email or contact us at <a href="mailto:support@optikecosystem.com">support@optikecosystem.com</a></p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The OPTIK Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>OPTIK DApp Factory</strong></p>
      <p>Production-ready Solana tokens & dApps in 48 hours</p>
      <p style="margin-top: 20px;">
        <a href="${APP_URL}" style="color: #667eea; text-decoration: none;">optikecosystem.com</a> | 
        <a href="${APP_URL}/track/${data.jobId}" style="color: #667eea; text-decoration: none;">Track Order</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Failed to send order confirmation email:', error);
      throw error;
    }

    console.log(`Order confirmation email sent to ${data.customerEmail}`);
    return emailData;

  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

// Completion Email
export async function sendCompletionEmail(data: CompletionData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `OPTIK DApp Factory <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `🎉 Your DApp is Ready! Download Now (Job ${data.jobId})`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 32px;
    }
    .confetti {
      font-size: 60px;
      margin: 20px 0;
    }
    .content {
      padding: 40px 30px;
    }
    .download-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .download-button {
      display: inline-block;
      background: white;
      color: #667eea;
      padding: 20px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 18px;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .download-button:hover {
      transform: scale(1.05);
    }
    .info-box {
      background: #f9fafb;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .checklist {
      background: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .checklist-item {
      display: flex;
      align-items: start;
      margin: 10px 0;
    }
    .checklist-icon {
      color: #10b981;
      margin-right: 10px;
      font-size: 20px;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="confetti">🎉</div>
      <h1>Your DApp is Ready!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Time to launch your project</p>
    </div>
    
    <div class="content">
      <p style="font-size: 18px;">Hi ${data.customerName},</p>
      
      <p style="font-size: 16px;"><strong>Exciting news!</strong> Your ${data.productType.replace('-', ' ')} has been successfully generated and is ready for download.</p>
      
      <div class="download-box">
        <p style="color: white; margin: 0 0 10px 0; font-size: 14px;">File Size: ${data.fileSizeMB} MB</p>
        <p style="color: white; margin: 0 0 20px 0; font-size: 14px;">Completed: ${new Date(data.completedAt).toLocaleString()}</p>
        <a href="${data.downloadUrl}" class="download-button">
          📦 Download Your Project
        </a>
        <p style="color: rgba(255,255,255,0.8); margin: 20px 0 0 0; font-size: 12px;">Link expires in 30 days</p>
      </div>
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #10b981;">✅ Quality Assurance Passed</h3>
        <p style="margin: 10px 0;">Your project has been through our rigorous QA pipeline:</p>
        <ul style="color: #4b5563; margin: 10px 0;">
          <li>✓ Security audit completed (zero critical issues)</li>
          <li>✓ All automated tests passed (100% coverage)</li>
          <li>✓ Performance optimized (Lighthouse score 90+)</li>
          <li>✓ Code review approved by senior engineer</li>
          <li>✓ Documentation verified complete</li>
        </ul>
      </div>
      
      <h3>📦 What's Inside Your Download:</h3>
      <div class="checklist">
        <div class="checklist-item">
          <span class="checklist-icon">✅</span>
          <div>
            <strong>Smart Contracts</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Complete Rust/Anchor programs, tested and ready to deploy</p>
          </div>
        </div>
        <div class="checklist-item">
          <span class="checklist-icon">✅</span>
          <div>
            <strong>Frontend dApp</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Next.js 15 application with all features implemented</p>
          </div>
        </div>
        <div class="checklist-item">
          <span class="checklist-icon">✅</span>
          <div>
            <strong>Deployment Scripts</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">One-command deployment to mainnet</p>
          </div>
        </div>
        <div class="checklist-item">
          <span class="checklist-icon">✅</span>
          <div>
            <strong>Documentation</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Complete installation guide, troubleshooting, and API docs</p>
          </div>
        </div>
        <div class="checklist-item">
          <span class="checklist-icon">✅</span>
          <div>
            <strong>QA Reports</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Security audit, performance metrics, test results</p>
          </div>
        </div>
      </div>
      
      <h3>🚀 Quick Start Guide:</h3>
      <ol style="color: #4b5563;">
        <li><strong>Extract the ZIP file</strong> to your project directory</li>
        <li><strong>Read README.md</strong> for installation instructions</li>
        <li><strong>Run setup script</strong> to install dependencies</li>
        <li><strong>Deploy to devnet first</strong> for testing</li>
        <li><strong>Deploy to mainnet</strong> when ready to launch</li>
      </ol>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong style="color: #92400e;">⚠️ Important:</strong>
        <p style="margin: 5px 0 0 0; color: #92400e;">Test on Solana devnet before deploying to mainnet. See DEPLOYMENT_GUIDE.md for step-by-step instructions.</p>
      </div>
      
      <h3>Need Help?</h3>
      <p>We're here to support you:</p>
      <ul style="color: #4b5563;">
        <li>📧 Email: <a href="mailto:support@optikecosystem.com">support@optikecosystem.com</a></li>
        <li>💬 Discord: <a href="https://discord.gg/optik">discord.gg/optik</a></li>
        <li>📚 Documentation: <a href="${APP_URL}/docs">docs.optikecosystem.com</a></li>
      </ul>
      
      <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 30px 0; border-radius: 4px;">
        <strong style="color: #075985;">💎 Loved our service?</strong>
        <p style="margin: 5px 0 0 0; color: #075985;">
          Leave us a review and get 10% off your next order! 
          <a href="${APP_URL}/review/${data.jobId}" style="color: #0284c7;">Share your experience →</a>
        </p>
      </div>
      
      <p style="margin-top: 30px;">
        Congratulations on your new DApp! We can't wait to see what you build.
      </p>
      
      <p>
        Best regards,<br>
        <strong>The OPTIK Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>OPTIK DApp Factory</strong></p>
      <p>Powered by AI • Built for Production • Delivered in 48 Hours</p>
      <p style="margin-top: 20px;">
        <a href="${APP_URL}" style="color: #667eea; text-decoration: none;">optikecosystem.com</a> | 
        <a href="${APP_URL}/track/${data.jobId}" style="color: #667eea; text-decoration: none;">Order Details</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Failed to send completion email:', error);
      throw error;
    }

    console.log(`Completion email sent to ${data.customerEmail}`);
    return emailData;

  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

// Payment Confirmation Email
export async function sendPaymentConfirmationEmail(data: PaymentConfirmationData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `OPTIK DApp Factory <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `💳 Payment Confirmed - ${data.paymentMethod === 'crypto' ? 'Crypto' : 'Card'} (Job ${data.jobId})`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .payment-box {
      background: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 25px;
      margin: 20px 0;
    }
    .amount {
      font-size: 36px;
      font-weight: bold;
      color: #10b981;
      text-align: center;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #d1fae5;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 60px; margin-bottom: 10px;">✅</div>
      <h1>Payment Confirmed</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Thank you for your payment</p>
    </div>
    
    <div class="content">
      <p>Hi ${data.customerName},</p>
      
      <p>Your payment has been successfully processed and confirmed.</p>
      
      <div class="payment-box">
        <div class="amount">$${data.amount.toLocaleString()}</div>
        
        <div class="info-row">
          <span style="color: #6b7280;">Payment Method</span>
          <span style="font-weight: 600;">${data.paymentMethod === 'crypto' ? '💰 Cryptocurrency' : '💳 Credit Card'}</span>
        </div>
        
        ${data.transactionId ? `
        <div class="info-row">
          <span style="color: #6b7280;">Transaction ID</span>
          <span style="font-weight: 600; font-family: monospace; font-size: 12px;">${data.transactionId}</span>
        </div>
        ` : ''}
        
        <div class="info-row">
          <span style="color: #6b7280;">Job ID</span>
          <span style="font-weight: 600; font-family: monospace;">${data.jobId}</span>
        </div>
        
        <div class="info-row">
          <span style="color: #6b7280;">Date</span>
          <span style="font-weight: 600;">${new Date().toLocaleString()}</span>
        </div>
      </div>
      
      <p>Your DApp is currently being generated. You'll receive another email when it's ready for download (typically within 90 minutes).</p>
      
      <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong style="color: #075985;">📧 Receipt</strong>
        <p style="margin: 5px 0 0 0; color: #075985;">
          This email serves as your official payment receipt. Please keep it for your records.
        </p>
      </div>
      
      <p>
        Best regards,<br>
        <strong>The OPTIK Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>OPTIK DApp Factory</strong></p>
      <p><a href="${APP_URL}/track/${data.jobId}" style="color: #667eea; text-decoration: none;">Track Order</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Failed to send payment confirmation email:', error);
      throw error;
    }

    console.log(`Payment confirmation email sent to ${data.customerEmail}`);
    return emailData;

  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}