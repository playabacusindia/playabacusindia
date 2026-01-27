<?php

$localhost = "localhost";
$username = "arkakids_lb_ugehrgi9hhpja";
$password = "fTSsAQOz8";
$database = "arkakids_lb_dbpk9wawhjrif5";

// Create connection
$conn = new mysqli($localhost, $username, $password, $database);  

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
} 


// Update Table
$license_key = $_GET['licensekey'];
$activation_date = $_GET['activationdate'];
$expiry_date = $_GET['expirydate'];
$license_status = $_GET['licensestatus'];
$guid = $_GET['guid'];
$update_license_details = "UPDATE `ipalearningboxlicensekeys` SET `ActivationDate`='$activation_date',`ExpiryDate`='$expiry_date',`LicenseStatus`='$license_status',`GUID`='$guid' WHERE LicenseKey='$license_key'";


if ($conn->query($update_license_details) === TRUE) {
  echo "404 page not found.";
} else {
  echo "Error: " . $update_license_details . "<br>" . $conn->error;

}

header('Content-Type: application/json; charset=UTF-8');
header('Expires: Sun, 01 Jan 2014 00:00:00 GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', FALSE);
header('Pragma: no-cache');

$conn->close();
?>
