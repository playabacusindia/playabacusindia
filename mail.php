<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// =========================================================================
//  INSTRUCTIONS FOR USER:
//  1. Download PHPMailer from: https://github.com/PHPMailer/PHPMailer
//  2. Extract the 'src' folder and rename it to 'PHPMailer' (or upload the files).
//  3. Ensure the structure is:
//     /public_html/
//       ├── mail.php (this file)
//       └── PHPMailer/
//             ├── Exception.php
//             ├── PHPMailer.php
//             └── SMTP.php
// =========================================================================

// Adjust path if your PHPMailer files are in a different directory
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

header('Content-Type: application/json');

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

// Get POST data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$message = $_POST['message'] ?? '';

// Basic Validation
if (empty($name) || empty($email) || empty($phone) || empty($message)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please fill all fields.']);
    exit;
}

$mail = new PHPMailer(true);

try {
    // =================================================
    //  SERVER SETTINGS (CONFIGURE THESE FOR CPANEL)
    // =================================================
    $mail->isSMTP();                                            // Send using SMTP
    $mail->Host = 'mail.playabacusindia.com';             // Set the SMTP server to send through
    $mail->SMTPAuth = true;                                   // Enable SMTP authentication
    $mail->Username = 'contact@playabacusindia.com';          // SMTP username
    $mail->Password = 'PlayAbacusIndia@IPA.123';             // SMTP password (UPDATE THIS!)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            // Enable implicit TLS encryption
    $mail->Port = 465;                                    // TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    // =================================================
    //  RECIPIENTS
    // =================================================
    $mail->setFrom('contact@playabacusindia.com', 'Play Abacus India Web');
    $mail->addAddress('contact@playabacusindia.com');           // Add a recipient (Where you want to receive emails)
    $mail->addReplyTo($email, $name);                           // Reply to the user

    // =================================================
    //  CONTENT
    // =================================================
    $mail->isHTML(true);                                        // Set email format to HTML
    $mail->Subject = "New Website Inquiry from $name";

    // HTML Body
    $mail->Body = "
        <h3>New Contact Form Inquiry</h3>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Phone:</strong> $phone</p>
        <p><strong>Message:</strong><br>$message</p>
    ";

    // Plain Text Body
    $mail->AltBody = "Name: $name\nEmail: $email\nPhone: $phone\nMessage: $message";

    $mail->send();
    echo json_encode(['status' => 'success', 'message' => 'Message has been sent']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
?>