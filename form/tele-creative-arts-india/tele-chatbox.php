<?php

// Get the origin from the request headers

$origin = $_SERVER['HTTP_ORIGIN'];



// List of allowed domains (comma-separated)

$allowedDomains = "http://localhost, https://creativeartsindia.in";



// Check if the requesting domain is in the list of allowed domains

if (in_array($origin, explode(", ", $allowedDomains))) {

    header("Access-Control-Allow-Origin: $origin");

    header("Access-Control-Allow-Methods: GET, OPTIONS");



    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $botToken = "7898240655:AAFlQ7eAgw2VgRpq9k7jet9smp3EKY005Ok"; // Replace with your actual bot token

        $chatId = "-1002512725113"; // Replace with your actual group chat ID



        // Get text message from POST request

        $message = $_POST['message'] ?? '';

        if (!empty($message)) {

            // Telegram API URL

            $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";



            // Data to send

            $data = [

                'chat_id' => $chatId,

                'text' => $message,

            ];



            // Use file_get_contents to send the request

            $options = [

                'http' => [

                    'method'  => 'POST',

                    'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",

                    'content' => http_build_query($data),

                ],

            ];

            $context  = stream_context_create($options);

            $response = file_get_contents($apiUrl, false, $context);



            // Output the response

            echo $response;
        } else {

            echo json_encode(['error' => 'Message cannot be empty']);
        }
    } else {

        echo json_encode(['error' => 'Invalid request method']);
    }
} else {

    // Redirect to a different page if the origin is not allowed
    header("Location: https://www.playabacusindia.com/");
    exit;
}
