<?php
/**
 * Backend Submission Handler for Enquiry Forms (Modal, Contact Page, Franchise Page)
 * Using PHPMailer with Automatic Fallback to Native PHP Mail
 * Ideal Play Abacus India (IPA)
 */

// Disable error display in response, enable internal error logging
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Handle preflight / invalid methods
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method. Only POST is allowed.']);
    exit;
}

// 1. Sanitize and Validate Input Data
function sanitizeInput($data) {
    if ($data === null) return '';
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

$name     = sanitizeInput($_POST['name'] ?? '');
$location = sanitizeInput($_POST['location'] ?? '');
$phone    = sanitizeInput($_POST['phone'] ?? '');
$email    = sanitizeInput($_POST['email'] ?? '');
$type     = sanitizeInput($_POST['enquiry_type'] ?? ($_POST['type'] ?? 'General Enquiry'));
$message  = sanitizeInput($_POST['message'] ?? '');
$page_url = sanitizeInput($_POST['page_url'] ?? ($_SERVER['HTTP_REFERER'] ?? 'Website Form'));

// Basic Validation - Name, Location, and Phone are mandatory
if (empty($name) || empty($location) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields (Name, Location, and Phone).']);
    exit;
}

// Validate email format if provided
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// Prepare HTML Email Body
$emailSubject = "New Enquiry Received: " . ($type ? $type : 'General Enquiry') . " - " . $name;

$emailHtmlBody = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; font-family: Arial, sans-serif; }
        .header { background-color: #0b3954; color: #ffffff; padding: 15px 20px; border-radius: 6px 6px 0 0; text-align: center; }
        .header h2 { margin: 0; font-size: 20px; color: #ffffff; }
        .content { padding: 20px; background-color: #ffffff; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #eeeeee; }
        .table th { background-color: #f8f9fa; width: 32%; color: #555; font-weight: 600; }
        .footer { padding: 15px 20px; background-color: #f8f9fa; border-radius: 0 0 6px 6px; font-size: 12px; color: #777; text-align: center; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>IPA Website - New Enquiry Received</h2>
        </div>
        <div class='content'>
            <p>You have received a new enquiry from the Ideal Play Abacus website.</p>
            <table class='table'>
                <tr>
                    <th>Name</th>
                    <td><strong>" . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "</strong></td>
                </tr>
                <tr>
                    <th>Location</th>
                    <td>" . htmlspecialchars($location, ENT_QUOTES, 'UTF-8') . "</td>
                </tr>
                <tr>
                    <th>Phone</th>
                    <td><a href='tel:" . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</a></td>
                </tr>
                <tr>
                    <th>Email</th>
                    <td>" . (!empty($email) ? "<a href='mailto:" . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</a>" : "<em>Not provided</em>") . "</td>
                </tr>
                <tr>
                    <th>Enquiry Type</th>
                    <td>" . htmlspecialchars($type, ENT_QUOTES, 'UTF-8') . "</td>
                </tr>
                <tr>
                    <th>Submitted From</th>
                    <td><a href='" . htmlspecialchars($page_url, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($page_url, ENT_QUOTES, 'UTF-8') . "</a></td>
                </tr>
                <tr>
                    <th>Message</th>
                    <td>" . (!empty($message) ? nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) : "<em>No message provided</em>") . "</td>
                </tr>
            </table>
        </div>
        <div class='footer'>
            This is an automated enquiry notification from playabacusindia.com
        </div>
    </div>
</body>
</html>
";

$emailAltBody = "New Enquiry Received\n" .
                "----------------------------------------\n" .
                "Name: $name\n" .
                "Location: $location\n" .
                "Phone: $phone\n" .
                "Email: " . (!empty($email) ? $email : 'Not provided') . "\n" .
                "Enquiry Type: $type\n" .
                "Page Submitted From: $page_url\n" .
                "Message:\n" . (!empty($message) ? $message : 'No message') . "\n";

$mailSent = false;
$mailerError = '';

// 2. Try Sending via PHPMailer
$phpMailerLoaded = false;
$pathsToTry = [
    __DIR__ . '/PHPMailer/src/',
    __DIR__ . '/PHPMailer/',
    __DIR__ . '/../PHPMailer/src/',
    __DIR__ . '/../PHPMailer/'
];

foreach ($pathsToTry as $path) {
    if (file_exists($path . 'PHPMailer.php') && file_exists($path . 'Exception.php') && file_exists($path . 'SMTP.php')) {
        require_once $path . 'Exception.php';
        require_once $path . 'PHPMailer.php';
        require_once $path . 'SMTP.php';
        $phpMailerLoaded = true;
        break;
    }
}

if ($phpMailerLoaded) {
    try {
        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

        // SMTP Server Configuration
        $mail->isSMTP();
        $mail->Host       = 'mail.playabacusindia.com;localhost;mocha3039.mochahost.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'contact@playabacusindia.com';
        $mail->Password   = 'PlayAbacusIndia@IPA.123'; // Working credentials
        
        // Use STARTTLS with Port 587
        $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        
        // Timeout in seconds (prevent endless loading spinner)
        $mail->Timeout    = 8;
        $mail->SMTPKeepAlive = false;

        // SSL options to prevent certificate handshake hangs on shared hostings
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];

        // Email Headers & Recipients
        $mail->CharSet = 'UTF-8';
        $mail->setFrom('contact@playabacusindia.com', 'IPA Website Form');
        $mail->addAddress('contact@playabacusindia.com', 'Play Abacus India');
        $mail->addAddress('idealplayabacus20@gmail.com', 'IPA Info');
        
        if (!empty($email)) {
            $mail->addReplyTo($email, $name);
        } else {
            $mail->addReplyTo('contact@playabacusindia.com', 'IPA Info');
        }

        $mail->isHTML(true);
        $mail->Subject = $emailSubject;
        $mail->Body    = $emailHtmlBody;
        $mail->AltBody = $emailAltBody;

        $mail->send();
        $mailSent = true;
    } catch (\Exception $e) {
        $mailerError = isset($mail) ? $mail->ErrorInfo : $e->getMessage();
        error_log("PHPMailer Error: " . $mailerError);
    }
}

// 3. Fallback: If PHPMailer failed or is not available, use native PHP mail()
if (!$mailSent) {
    $to = 'contact@playabacusindia.com, idealplayabacus20@gmail.com';
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: IPA Website Form <contact@playabacusindia.com>\r\n";
    if (!empty($email)) {
        $headers .= "Reply-To: " . $name . " <" . $email . ">\r\n";
    } else {
        $headers .= "Reply-To: IPA Info <contact@playabacusindia.com>\r\n";
    }
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

    $nativeSent = @mail($to, $emailSubject, $emailHtmlBody, $headers);
    if ($nativeSent) {
        $mailSent = true;
    } else {
        // Log failure to a debug log file for host diagnostics
        $logEntry = "[" . date('Y-m-d H:i:s') . "] Submission from $name ($phone) failed. Mailer Error: $mailerError\n";
        @file_put_contents(__DIR__ . '/mail_error.log', $logEntry, FILE_APPEND);
    }
}

// 4. Return JSON response
if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for reaching out! Our IPA team will contact you shortly.'
    ]);
} else {
    // Return clean JSON even if both mail channels fail
    echo json_encode([
        'success' => false,
        'message' => 'Your enquiry could not be sent right now. Please call or WhatsApp us directly at our contact numbers.'
    ]);
}
?>
