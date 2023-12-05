<?php

$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);
$json = json_encode($_POST);
echo $json;
$url = '%GAPPS_URL%';
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 100);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
# Get the response
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>
