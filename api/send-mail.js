const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER || 'saridenarahul@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'qvwnlgqslsfwjpkk';
const MAIL_TO = process.env.MAIL_TO || 'saridenarahul@gmail.com';
const MAIL_TO_NAME = 'Dr. Rahul Saridena Office';

// Configure Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function getRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch (_) {
        const querystring = require('querystring');
        return querystring.parse(req.body);
      }
    }
  }

  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (_) {
        const querystring = require('querystring');
        resolve(querystring.parse(data));
      }
    });
  });
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Only POST requests are accepted.'
    });
  }

  try {
    const body = await getRequestBody(req);

    // Anti-spam honeypot
    if (body._honey) {
      return res.status(200).json({
        success: true,
        message: 'వివరాలు నమోదయ్యాయి.'
      });
    }

    // Timezone: IST (Indian Standard Time)
    const now = new Date();
    const submittedAt = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' IST';

    const clientIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';

    // Detect Form Type
    const isMLC = !!(body.graduation_year || body.district_name || body.whatsapp_number);
    const isNewsletter = !!(body.email && !body.message && !body.full_name && !body.name);

    if (isMLC) {
      // 1. MLC Graduate Voter Registration Form
      const fullName     = sanitize(body.full_name || '');
      const district     = sanitize(body.district_name || '');
      const whatsapp     = sanitize(body.whatsapp_number || '');
      const email        = sanitize(body.email_address || '');
      const gradYear     = sanitize(body.graduation_year || '');
      const gradCourse   = sanitize(body.graduation_course || '');
      const constituency = sanitize(body.constituency || 'Hyderabad - Rangareddy - Mahabubnagar');

      // Validation
      const errors = [];
      if (!fullName) errors.push('పూర్తి పేరు నమోదు చేయండి (Full Name is required)');
      if (!district) errors.push('జిల్లా ఎంచుకోండి (District is required)');
      if (!whatsapp || !/^[0-9]{10}$/.test(whatsapp.replace(/[^0-9]/g, '').slice(-10))) {
        errors.push('సరైన 10 అంకెల వాట్సాప్ నంబర్ ఇవ్వండి (Valid 10-digit WhatsApp number required)');
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('సరైన ఈమెయిల్ ఇవ్వండి (Valid Email address required)');
      }
      if (!gradYear || !gradCourse) {
        errors.push('డిగ్రీ వివరాలు ఇవ్వండి (Graduation details required)');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors.join(' | ')
        });
      }

      const waCleanNumber = whatsapp.replace(/[^0-9]/g, '').slice(-10);
      const waLink = `https://wa.me/91${waCleanNumber}?text=` + encodeURIComponent(
        `నమస్తే ${fullName} గారు, మీ ఎమ్మెల్సీ ఓటరు నమోదు ఫారం-18 వివరాలకు సంబంధించి డాక్టర్ రాహుల్ సరిదేన గారి ఎన్నికల సమన్వయ బృందం నుండి సంప్రదిస్తున్నాము.`
      );

      const subject = `తెలంగాణ పట్టభద్రుల ఎమ్మెల్సీ 2027: ${fullName} (${district}) - ఓటరు నమోదు`;

      const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MLC Voter Registration</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F1EA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F4F1EA;padding:30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:620px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);border:1px solid #E5E7EB;">
          <tr>
            <td style="height:6px;background:linear-gradient(90deg, #FF6B00 0%, #FFFFFF 50%, #138808 100%);"></td>
          </tr>
          <tr>
            <td style="background:#0B1B3D;padding:26px 30px;text-align:center;">
              <span style="display:inline-block;background:rgba(255,107,0,0.2);border:1px solid rgba(255,107,0,0.4);color:#FFA057;padding:4px 14px;border-radius:50px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
                MLC ELECTION 2027 • VOTER ENROLMENT
              </span>
              <h1 style="color:#FFFFFF;margin:0 0 6px 0;font-size:22px;font-weight:800;">డాక్టర్ రాహుల్ సరిదేన గారి కార్యాలయం</h1>
              <p style="color:#D1D5DB;margin:0;font-size:14px;">పట్టభద్రుల ఎమ్మెల్సీ ఎన్నికలు 2027 — కొత్త ఓటరు నమోదు దరఖాస్తు</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px 10px 30px;">
              <div style="background:#FFF9F5;border-left:4px solid #FF6B00;padding:14px 18px;border-radius:0 8px 8px 0;">
                <p style="margin:0;color:#C54400;font-size:14px;font-weight:700;">
                  వెబ్‌సైట్ నుండి కొత్త ఓటరు వివరాలు నమోదయ్యాయి (New Enrolment Received)
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 30px 24px 30px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;width:35%;">పూర్తి పేరు (Full Name)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:15px;font-weight:700;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">జిల్లా (District)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:14px;font-weight:700;">
                    <span style="display:inline-block;background:#F3F4F6;padding:4px 10px;border-radius:6px;color:#1F2937;">${district}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">వాట్సాప్ నంబర్ (WhatsApp)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:14px;font-weight:700;">
                    <a href="tel:+91${waCleanNumber}" style="color:#0F172A;text-decoration:none;">+91 ${waCleanNumber}</a>
                    &nbsp;•&nbsp;
                    <a href="${waLink}" target="_blank" style="display:inline-block;background:#22C55E;color:#FFFFFF;text-decoration:none;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:700;">
                      Chat on WhatsApp &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">ఈమెయిల్ (Email)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:14px;">
                    <a href="mailto:${email}" style="color:#FF6B00;text-decoration:none;font-weight:600;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">ఉత్తీర్ణత సంవత్సరం (Passing Year)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:14px;font-weight:600;">
                    <span style="color:#059669;background:#ECFDF5;padding:3px 8px;border-radius:4px;font-size:12px;font-weight:700;">Eligible:</span> ${gradYear}
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">డిగ్రీ / కళాశాల (Course & College)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:14px;font-weight:600;">${gradCourse}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">నియోజకవర్గం (Constituency)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#1E40AF;font-size:14px;font-weight:700;">${constituency}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;color:#9CA3AF;font-size:12px;font-weight:600;">సమర్పించిన సమయం (Timestamp)</td>
                  <td style="padding:12px 14px;color:#6B7280;font-size:12px;">${submittedAt} (IP: ${clientIP})</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#F9FAFB;padding:20px 30px;border-top:1px solid #E5E7EB;text-align:center;">
              <a href="${waLink}" target="_blank" style="display:inline-block;background:#15803D;color:#FFFFFF;text-decoration:none;padding:11px 24px;border-radius:8px;font-size:14px;font-weight:700;margin-right:8px;">
                WhatsApp లో నేరుగా సంప్రదించండి
              </a>
              <a href="mailto:${email}?subject=MLC%20Voter%20Registration%20Form-18%20Support%20-%20Dr.%20Rahul%20Saridena" style="display:inline-block;background:#FFFFFF;border:1px solid #D1D5DB;color:#1F2937;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">
                Reply by Email
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#0B1B3D;color:#9CA3AF;padding:18px 30px;text-align:center;font-size:12px;line-height:1.5;">
              <p style="margin:0 0 4px 0;color:#FFFFFF;font-weight:700;">డాక్టర్ రాహుల్ సరిదేన — బిజెపి తెలంగాణ రాష్ట్ర అధికార ప్రతినిధి</p>
              <p style="margin:0;">ఈ ఈమెయిల్ drrahulsaridena.in వెబ్‌సైట్ ఫారం ద్వారా ఆటోమేటిక్‌గా పంపబడింది.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const altBody = `MLC Graduate Voter Registration\n\nName: ${fullName}\nDistrict: ${district}\nWhatsApp: ${whatsapp}\nEmail: ${email}\nPassing Year: ${gradYear}\nCourse/College: ${gradCourse}\nConstituency: ${constituency}\nTime: ${submittedAt}\n`;

      await transporter.sendMail({
        from: `"${MAIL_TO_NAME}" <${SMTP_USER}>`,
        to: MAIL_TO,
        replyTo: `"${fullName}" <${email}>`,
        subject: subject,
        text: altBody,
        html: bodyHtml
      });

      return res.status(200).json({
        success: true,
        message: 'మీ వివరాలు విజయవంతంగా నమోదయ్యాయి! మా బృందం మిమ్మల్ని త్వరలో సంప్రదిస్తుంది.',
        redirect_url: 'thank-you.html'
      });

    } else if (isNewsletter) {
      // Newsletter
      const email = sanitize(body.email);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address.'
        });
      }

      await transporter.sendMail({
        from: `"${MAIL_TO_NAME}" <${SMTP_USER}>`,
        to: MAIL_TO,
        replyTo: email,
        subject: `New Newsletter Subscription: ${email}`,
        text: `New subscriber: ${email}\nTime: ${submittedAt}\nIP: ${clientIP}`,
        html: `
          <div style="font-family:sans-serif;padding:20px;max-width:500px;background:#f9f9f9;border-top:4px solid #FF6B00;border-radius:8px;">
            <h3>New Newsletter Subscription</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Time:</strong> ${submittedAt}</p>
            <p><strong>IP:</strong> ${clientIP}</p>
          </div>
        `
      });

      return res.status(200).json({
        success: true,
        message: 'Subscribed successfully to our newsletter!'
      });

    } else {
      // 2. General Contact / Inquiry Form
      const name        = sanitize(body.name || '');
      const email       = sanitize(body.email || '');
      const phone       = sanitize(body.phone || 'Not provided');
      const subjectType = sanitize(body.subject || 'General Inquiry');
      const message     = sanitize(body.message || '');

      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Please fill in all required fields (Name, Email, Message).'
        });
      }

      const subject = `New Contact Inquiry: ${subjectType} - ${name}`;

      const bodyHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Contact Inquiry</title></head>
<body style="font-family:sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:560px;background:#fff;margin:0 auto;padding:24px;border-radius:10px;border-top:5px solid #FF6B00;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
    <h2 style="color:#0B1B3D;margin-top:0;">New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Subject:</strong> ${subjectType}</p>
    <div style="background:#F9FAFB;padding:16px;border-radius:6px;border:1px solid #E5E7EB;margin:16px 0;">
      <strong>Message:</strong><br><p style="margin:8px 0 0;white-space:pre-wrap;">${message}</p>
    </div>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
    <p style="color:#888;font-size:12px;">Sent on ${submittedAt} from ${clientIP}</p>
  </div>
</body>
</html>
      `;

      const altBody = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subjectType}\nMessage:\n${message}\nTime: ${submittedAt}`;

      await transporter.sendMail({
        from: `"${MAIL_TO_NAME}" <${SMTP_USER}>`,
        to: MAIL_TO,
        replyTo: `"${name}" <${email}>`,
        subject: subject,
        text: altBody,
        html: bodyHtml
      });

      return res.status(200).json({
        success: true,
        message: 'Thank you! Your message has been sent successfully. We will get back to you shortly.',
        redirect_url: 'thank-you.html'
      });
    }

  } catch (error) {
    console.error('Mail handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message: ' + (error.message || 'Unknown server error')
    });
  }
};

