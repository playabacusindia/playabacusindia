<?php

// Get the origin from the request headers

$origin = $_SERVER['HTTP_ORIGIN'];

// List of allowed domains (comma-separated)

$allowedDomains = "http://localhost, https://arkakids.com";

// Check if the requesting domain is in the list of allowed domains

if (in_array($origin, explode(", ", $allowedDomains))) {

    header("Access-Control-Allow-Origin: $origin");

    header("Access-Control-Allow-Methods: GET, OPTIONS");

    // Get the user's IP address
    $userIpAddress = $_SERVER['REMOTE_ADDR'];


    // Construct the API URL for a free IP geolocation service

    $apiUrl = "https://ipinfo.io/{$userIpAddress}/json";



    // Make a request to the service

    $response = file_get_contents($apiUrl);



    // Check if the request was successful

    if ($response !== false) {

        // Decode the JSON response

        $locationData = json_decode($response, true);



        // Check if decoding was successful

        if ($locationData !== null) {

            // Access city and region information

            $city = isset($locationData['city']) ? $locationData['city'] : 'Unknown';

            $region = isset($locationData['region']) ? $locationData['region'] : 'Unknown';



            // Create an associative array with the location information

            $locationInfo = [

                'ip' => $userIpAddress,

                'city' => $city,

                'region' => $region

            ];



            // Convert the array to JSON and echo the result

            header('Content-Type: application/json');

            echo json_encode($locationInfo);
        } else {

            // Handle decoding error

            echo json_encode(['error' => 'Failed to decode the API response']);
        }
    } else {

        // Handle error in making the request

        echo json_encode(['error' => 'Failed to make a request to the geolocation service']);
    }
} else {

    // Redirect to a different page if the origin is not allowed
    header("Location: https://www.playabacusindia.com/");
    exit;
}
