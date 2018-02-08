<?php

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

// Process the request.
try {

  // Capture the result.
  $result = $emailer->$action();

}

// The request could not be processed.
catch (Exception $exception) {

  // Send a "Bad Request" response code.
  http_response_code( 400 );

  // Kill the emailer.
  die( "Your request could not be processed. Error: $exception" );

}

// Output a response.
echo $result;

?>