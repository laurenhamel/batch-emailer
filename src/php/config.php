<?php

// Load libraries.
include "libraries/array.library.php";

// Load dependencies.
include "dependencies/autoload.php";
include "classes/autoload.php";

// Define constants.
define('ROOT', dirname(__DIR__));
define('INCLUDES', ROOT.'/includes/');

// Initialize environment variables.
$dotenv = new Dotenv\Dotenv(ROOT);

// Load environment variables.
$dotenv->load();

?>