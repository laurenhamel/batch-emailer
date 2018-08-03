<?php

// Set content type.
header("Content-type: application/json");

// Load configurations.
include "config.php";

// Get the incoming request action.
$action = $_GET['action'];

// Ignore invalid requests.
if( !isset($action) ) {

  // The request was bad.
  http_response_code( 400 );

  // Kill the emailer.
  die( "Your request could not be processed. An `action` parameter is missing." );

}

// Start batch emailer.
$batchailer = new Batchailer( $_POST['template'], $_POST['data'] );

// Verify the action.
if( method_exists($batchailer, $action) ) {

  // Process the request.
  $result = $batchailer->$action();

  // Return the result.
  echo json_encode($result);

}

// The request could not be processed.
else {

  http_response_code( 400 );

  die( "Your request could not be processed." );

}

?>