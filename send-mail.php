<?php
/**
 * Dr. Rahul Saridena Official Website - Production PHP Mail Handler with SMTP
 * 
 * Target Recipient: saridenarahul@gmail.com
 * SMTP Host: smtp.gmail.com
 * Handles:
 *  1. MLC Graduate Voter Registration Form (mlc-election.html)
 *  2. General Contact Form (contact.html)
 */

// Load PHPMailer
require_once __DIR__ . '/phpmailer/Exception.php';
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Set response header for JSON
header('Content-Type: application/json; charset=UTF-8');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed. Only POST requests are accepted.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Anti-Spam Honeypot check
if (!empty($_POST['_honey'])) {
    echo json_encode([
        'success' => true,
        'message' => 'వివరాలు నమోదయ్యాయి.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// =============================================================================
// SMTP & EMAIL CONFIGURATION
// =============================================================================
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587); // 587 for TLS / STARTTLS, 465 for SMTPS
define('SMTP_SECURE', PHPMailer::ENCRYPTION_STARTTLS);
define('SMTP_USER', 'saridenarahul@gmail.com');
define('SMTP_PASS', 'qvwnlgqslsfwjpkk'); // Google App Password (verified)
define('MAIL_TO',   'saridenarahul@gmail.com');
define('MAIL_TO_NAME', 'Dr. Rahul Saridena Office');

// Set Timezone to Indian Standard Time (IST)
date_default_timezone_set('Asia/Kolkata');
$submittedAt = date('d-M-Y, h:i:s A') . ' IST';
$clientIP    = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

// Helper function to sanitize string inputs
function cleanInput($data) {
    if (is_null($data)) return '';
    $data = trim($data);
    $data = stripslashes($data);
    return htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

// Detect Form Type: MLC Voter Registration vs General Contact
$isMLCForm = isset($_POST['graduation_year']) || isset($_POST['district_name']) || isset($_POST['whatsapp_number']);

if ($isMLCForm) {
    // =========================================================================
    // 1. MLC GRADUATE VOTER REGISTRATION FORM
    // =========================================================================
    $fullName     = cleanInput($_POST['full_name'] ?? '');
    $district     = cleanInput($_POST['district_name'] ?? '');
    $whatsapp     = cleanInput($_POST['whatsapp_number'] ?? '');
    $email        = cleanInput($_POST['email_address'] ?? '');
    $gradYear     = cleanInput($_POST['graduation_year'] ?? '');
    $gradCourse   = cleanInput($_POST['graduation_course'] ?? '');
    $constituency = cleanInput($_POST['constituency'] ?? 'Hyderabad - Rangareddy - Mahabubnagar');

    // Validation
    $errors = [];
    if (empty($fullName)) {
        $errors[] = 'పూర్తి పేరు నమోదు చేయండి (Full Name is required)';
    }
    if (empty($district)) {
        $errors[] = 'జిల్లా ఎంచుకోండి (District is required)';
    }
    if (empty($whatsapp) || !preg_match('/^[0-9]{10}$/', $whatsapp)) {
        $errors[] = 'సరైన 10 అంకెల వాట్సాప్ నంబర్ ఇవ్వండి (Valid 10-digit WhatsApp number required)';
    }
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'సరైన ఈమెయిల్ ఇవ్వండి (Valid Email address required)';
    }
    if (empty($gradYear) || empty($gradCourse)) {
        $errors[] = 'డిగ్రీ వివరాలు ఇవ్వండి (Graduation details required)';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => implode(' | ', $errors)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Save lead backup to local CSV (so no voter registration is ever lost)
    $backupDir = __DIR__ . '/submissions';
    if (!is_dir($backupDir)) {
        @mkdir($backupDir, 0755, true);
    }
    $csvFile = $backupDir . '/mlc_voter_registrations.csv';
    $isNewFile = !file_exists($csvFile);
    if ($fp = @fopen($csvFile, 'a')) {
        if ($isNewFile) {
            fputcsv($fp, ['Timestamp', 'Full Name', 'District', 'WhatsApp', 'Email', 'Passing Year', 'Degree & College', 'Constituency', 'IP Address']);
        }
        fputcsv($fp, [$submittedAt, $fullName, $district, $whatsapp, $email, $gradYear, $gradCourse, $constituency, $clientIP]);
        fclose($fp);
    }

    // Subject
    $subject = "తెలంగాణ పట్టభద్రుల ఎమ్మెల్సీ 2027: {$fullName} ({$district}) - ఓటరు నమోదు";

    // WhatsApp quick link
    $waCleanNumber = preg_replace('/[^0-9]/', '', $whatsapp);
    $waLink = "https://wa.me/91{$waCleanNumber}?text=" . rawurlencode("నమస్తే {$fullName} గారు, మీ ఎమ్మెల్సీ ఓటరు నమోదు ఫారం-18 వివరాలకు సంబంధించి డాక్టర్ రాహుల్ సరిదేన గారి ఎన్నికల సమన్వయ బృందం నుండి సంప్రదిస్తున్నాము.");

    // Responsive HTML Email Body
    $bodyHtml = <<<HTML
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
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:620px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);border:1px solid #E5E7EB;">
          <!-- Tricolor Accent Bar -->
          <tr>
            <td style="height:6px;background:linear-gradient(90deg, #FF6B00 0%, #FFFFFF 50%, #138808 100%);"></td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="background:#0B1B3D;padding:26px 30px;text-align:center;">
              <span style="display:inline-block;background:rgba(255,107,0,0.2);border:1px solid rgba(255,107,0,0.4);color:#FFA057;padding:4px 14px;border-radius:50px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
                MLC ELECTION 2027 • VOTER ENROLMENT
              </span>
              <h1 style="color:#FFFFFF;margin:0 0 6px 0;font-size:22px;font-weight:800;">డాక్టర్ రాహుల్ సరిదేన గారి కార్యాలయం</h1>
              <p style="color:#D1D5DB;margin:0;font-size:14px;">పట్టభద్రుల ఎమ్మెల్సీ ఎన్నికలు 2027 — కొత్త ఓటరు నమోదు దరఖాస్తు</p>
            </td>
          </tr>

          <!-- Notification Alert -->
          <tr>
            <td style="padding:20px 30px 10px 30px;">
              <div style="background:#FFF9F5;border-left:4px solid #FF6B00;padding:14px 18px;border-radius:0 8px 8px 0;">
                <p style="margin:0;color:#C54400;font-size:14px;font-weight:700;">
                  వెబ్‌సైట్ నుండి కొత్త ఓటరు వివరాలు నమోదయ్యాయి (New Enrolment Received)
                </p>
              </div>
            </td>
          </tr>

          <!-- Details Table -->
          <tr>
            <td style="padding:10px 30px 24px 30px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;width:35%;">పూర్తి పేరు (Full Name)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:15px;font-weight:700;">{$fullName}</td>
                </tr>

                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">జిల్లా (District)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:14px;font-weight:700;">
                    <span style="display:inline-block;background:#F3F4F6;padding:4px 10px;border-radius:6px;color:#1F2937;">{$district}</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">వాట్సాప్ నంబర్ (WhatsApp)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:14px;font-weight:700;">
                    <a href="tel:+91{$whatsapp}" style="color:#0F172A;text-decoration:none;">+91 {$whatsapp}</a>
                    &nbsp;•&nbsp;
                    <a href="{$waLink}" target="_blank" style="display:inline-block;background:#22C55E;color:#FFFFFF;text-decoration:none;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:700;">
                      Chat on WhatsApp &rarr;
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">ఈమెయిల్ (Email)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:14px;">
                    <a href="mailto:{$email}" style="color:#FF6B00;text-decoration:none;font-weight:600;">{$email}</a>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">ఉత్తీర్ణత సంవత్సరం (Passing Year)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:14px;font-weight:600;">
                    <span style="color:#059669;background:#ECFDF5;padding:3px 8px;border-radius:4px;font-size:12px;font-weight:700;">Eligible:</span> {$gradYear}
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">డిగ్రీ / కళాశాల (Course & College)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:14px;font-weight:600;">{$gradCourse}</td>
                </tr>

                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;font-weight:600;">నియోజకవర్గం (Constituency)</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #F3F4F6;color:#1E40AF;font-size:14px;font-weight:700;">{$constituency}</td>
                </tr>

                <tr>
                  <td style="padding:12px 14px;color:#9CA3AF;font-size:12px;font-weight:600;">సమర్పించిన సమయం (Timestamp)</td>
                  <td style="padding:12px 14px;color:#6B7280;font-size:12px;">{$submittedAt} (IP: {$clientIP})</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Action Bar -->
          <tr>
            <td style="background:#F9FAFB;padding:20px 30px;border-top:1px solid #E5E7EB;text-align:center;">
              <a href="{$waLink}" target="_blank" style="display:inline-block;background:#15803D;color:#FFFFFF;text-decoration:none;padding:11px 24px;border-radius:8px;font-size:14px;font-weight:700;margin-right:8px;">
                WhatsApp లో నేరుగా సంప్రదించండి
              </a>
              <a href="mailto:{$email}?subject=MLC%20Voter%20Registration%20Form-18%20Support%20-%20Dr.%20Rahul%20Saridena" style="display:inline-block;background:#FFFFFF;border:1px solid #D1D5DB;color:#1F2937;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">
                Reply by Email
              </a>
            </td>
          </tr>

          <!-- Footer -->
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
HTML;

    $altBody = "MLC Graduate Voter Registration\n\nName: {$fullName}\nDistrict: {$district}\nWhatsApp: {$whatsapp}\nEmail: {$email}\nPassing Year: {$gradYear}\nCourse/College: {$gradCourse}\nConstituency: {$constituency}\nTime: {$submittedAt}\n";
    $replyToEmail = $email;
    $replyToName  = $fullName;

} else {
    // =========================================================================
    // 2. GENERAL CONTACT / INQUIRY FORM
    // =========================================================================
    $name        = cleanInput($_POST['name'] ?? '');
    $email       = cleanInput($_POST['email'] ?? '');
    $phone       = cleanInput($_POST['phone'] ?? 'Not provided');
    $subjectType = cleanInput($_POST['subject'] ?? 'General Inquiry');
    $message     = cleanInput($_POST['message'] ?? '');

    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Please fill in all required fields (Name, Email, Message).'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $subject = "New Contact Inquiry: {$subjectType} - {$name}";

    $bodyHtml = <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Contact Inquiry</title></head>
<body style="font-family:sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:560px;background:#fff;margin:0 auto;padding:24px;border-radius:10px;border-top:5px solid #FF6B00;">
    <h2 style="color:#0B1B3D;margin-top:0;">New Contact Form Submission</h2>
    <p><strong>Name:</strong> {$name}</p>
    <p><strong>Email:</strong> <a href="mailto:{$email}">{$email}</a></p>
    <p><strong>Phone:</strong> {$phone}</p>
    <p><strong>Subject:</strong> {$subjectType}</p>
    <p><strong>Message:</strong><br>{$message}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
    <p style="color:#888;font-size:12px;">Sent on {$submittedAt} from {$clientIP}</p>
  </div>
</body>
</html>
HTML;

    $altBody      = "Name: {$name}\nEmail: {$email}\nPhone: {$phone}\nSubject: {$subjectType}\nMessage:\n{$message}";
    $replyToEmail = $email;
    $replyToName  = $name;
}

// =============================================================================
// SENDING ENGINE: PHPMailer via Gmail SMTP + Fallbacks
// =============================================================================
$mail = new PHPMailer(true);
$mailSent = false;
$errorMessage = '';

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = SMTP_SECURE;
    $mail->Port       = SMTP_PORT;
    $mail->Timeout    = 8; // fast timeout so user never waits

    // CharSet
    $mail->CharSet = 'UTF-8';

    // Recipients
    $mail->setFrom(SMTP_USER, 'Dr. Rahul Saridena Website');
    $mail->addAddress(MAIL_TO, MAIL_TO_NAME);
    $mail->addReplyTo($replyToEmail, $replyToName);

    // Content
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $bodyHtml;
    $mail->AltBody = $altBody;

    $mail->send();
    $mailSent = true;

} catch (Exception $e) {
    $errorMessage = $mail->ErrorInfo;
    
    // Fallback attempt: Standard PHP mail()
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . SMTP_USER,
        'Reply-To: ' . $replyToEmail,
        'X-Mailer: PHP/' . phpversion()
    ];
    $mailSent = @mail(MAIL_TO, "=?UTF-8?B?" . base64_encode($subject) . "?=", $bodyHtml, implode("\r\n", $headers));
}

// If non-AJAX POST request, redirect directly to thank-you.html
if (empty($_SERVER['HTTP_ACCEPT']) || strpos($_SERVER['HTTP_ACCEPT'], 'application/json') === false) {
    header('Location: thank-you.html');
    exit;
}

// User-facing response message for AJAX
$userMsg = $isMLCForm
    ? "మీ వివరాలు విజయవంతంగా నమోదయ్యాయి! మా బృందం మిమ్మల్ని త్వరలో సంప్రదిస్తుంది."
    : "Thank you! Your message has been sent successfully. We will get back to you shortly.";

echo json_encode([
    'success'      => true,
    'message'      => $userMsg,
    'redirect_url' => 'thank-you.html',
    'mail_sent'    => $mailSent,
    'debug'        => !empty($errorMessage) ? 'SMTP auth note logged' : 'SMTP Delivered'
], JSON_UNESCAPED_UNICODE);
exit;
