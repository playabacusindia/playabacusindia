<?php

$localhost = "localhost";
$username = "arkakids_lb_ugehrgi9hhpja";
$password = "fTSsAQOz8";
$database = "arkakids_lb_dbpk9wawhjrif5";

// Create connection
$conn = new mysqli($localhost, $username, $password, $database);  

// Check connection
if ($conn->connect_error) {
  die("Connection failed: s" . $conn->connect_error);
} //else {
  //echo "Connection Success<br>";
//}

// Select Table
$license_key = $_GET['licensekey'];

$select_ipalearningboxlicensekeys = "SELECT * FROM ipalearningboxlicensekeys WHERE LicenseKey='$license_key'";
$result = $conn->query($select_ipalearningboxlicensekeys);

if ($result->num_rows > 0) {
  // output data of each row
    $emparray = array();
    while($row =mysqli_fetch_assoc($result))
    {
        $emparray[] = $row;
    }
} else {
  echo "not found";
}

echo json_encode($emparray);

header('Content-Type: application/json; charset=UTF-8');
header('Expires: Sun, 01 Jan 2014 00:00:00 GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', FALSE);
header('Pragma: no-cache');

$conn->close();

?>
