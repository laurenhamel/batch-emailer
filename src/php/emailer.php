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

// Get the incoming request parameters.
$template = $_POST['template'];
$data = $_POST['data'];

// Start batch emailer.
$emailer = new BatchEmailer( $template, $data );

// Verify the action.
if( method_exists($emailer, $action) ) {

  // Process the request.
  $result = $emailer->$action();

  // Return the result.
  echo json_encode($result);

}

// The request could not be processed.
else {

  http_response_code( 400 );

  die( "Your request could not be processed." );

}

?>