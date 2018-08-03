<?php

class Batchailer {

  public $template;
  public $data;

  protected $bound = [];
  protected $renderer;
  
  public $batch = 25;
  public $limit = false;

  /**
   * Constructor function
   */
  function __construct( $template, $data ) {

    // Save inputs.
    $this->template = $template;
    $this->data = is_array($data) ? $data : json_decode($data, true);
    $this->renderer = new Mustache_Engine();

    // Bind data to templates.
    $this->bind();

  }

  /**
   * Bind the data to the template.
   */
  private function bind() { 

    // Initialize bindings.
    $bound = [];

    // Loop through the data.
    foreach( $this->data as $data ) { 

      // Render the template with the parameters.
      $bound[] = [
        "template"  => $this->renderer->render($this->template, $data),
        "data"      => $data
      ];

    }

    // Return the rendered templates.
    $this->bound = $bound;

  }
  
  /**
   * Enable batch previewing.
   */
  public function preview() {

    // Return previews.
    return array_map(function($bound) { 
      
      return $bound['template']; 
    
    }, $this->bound);

  }
  
  /**
   * Enable batch merging.
   */
  public function merge() {
    
    // Return merged data.
    return array_map(function($bound) {
      
      return $bound['template'];
      
    }, $this->bound);
    
  }
  
  /**
   * Enable batch testing.
   */
  public function test() { 
    
    // Initialize result.
    $result = [
      'error' => false, 
      'errors' => [], 
      'results' => [],
      'passed' => 0,
      'failed' => 0
    ];

    // Prepare emails.
    $emails = $this->bound;
    
    // Capture email order in case of errors.
    foreach($emails as $index => $template) { $emails[$index]['index'] = $index; }

    // Randomize email order.
    shuffle( $emails );

    // Get the limit on how many tests to send.
    $limit = isset($_POST['limit']) ? $_POST['limit'] : $this->limit;

    // Handle limits.
    if( $limit !== false and is_numeric($limit) ) $emails = array_slice($emails, $limit);
    
    // Determine batch size.
    $size = isset($_POST['batch']) ? $_POST['batch'] : $this->batch;
    
    // Configure batches.
    if( in_array($size, [true, 'true']) ) $size = $this->batch;
    else if( in_array($size, [false, 'false']) ) $size = false;
    else if( is_numeric($size) ) $size = (int) $size;
    
    // Split emails into batches to reduce collisions with rate limits.
    $batches = array_chunk($emails, $size);

    // Handle batches one at a time.
    foreach( $batches as $batch => $emails ) {
    
      // Prepare tests for sending.
      foreach( $emails as $index => $email ) {
      
        // Try building the test email.
        try { 

          // Generate an email.
          $batches[$batch][$index] = new Email($email['template'], array_merge($email['data'], [
            'from' => [
              'email'   => $_ENV['FROM_EMAIL'],
              'name'    => $_ENV['FROM_NAME']
            ],
            'to' => [
              'email'   => $_ENV['TO_EMAIL'],
              'name'    => $_ENV['TO_NAME']
            ]
          ]));

        }

        // Catch errors.
        catch( Exception $error ) {

          // Capture all errors.
          $result['error'] = true;
          $result['errors'][] = [
            'message' => $error->getMessage(),
            'data' => $email['data'],
            'template' => $email['template'],
            'index' => $email['index']
          ];

        }

      }
      
    }
    
    // Check for errors before sending.
    if( $result['error'] ) return $result;
    
    // Send emails in batches.
    foreach( $batches as $batch => $emails ) {
      
      // Otherwise, send the tests.
      foreach( $emails as $email ) { $result['results'][] = $email->send(); }
      
      // Wait 2 second before moving on to the next batch.
      sleep(2);
      
    }

    // Tally the number of emails that passed and failed.
    $result['passed'] = array_filter($result['results'], function($result){
      return $result['success'] === true;
    });
    $result['failed'] = array_filter($result['results'], function($result){
      return $result['success'] === false;
    });

    // Return the result.
    return $result;

  }
  
  /**
   * Enable batch emailing.
   */
  public function email() {
    
    // Initialize result.
    $result = [
      'error' => false, 
      'errors' => [], 
      'results' => [],
      'passed' => 0,
      'failed' => 0
    ];

    // Prepare emails.
    $emails = $this->bound;
    
    // Capture email order in case of errors.
    foreach($emails as $index => $template) { $emails[$index]['index'] = $index; }

    // Randomize email order.
    shuffle($emails);
    
    // Determine batch size.
    $size = isset($_POST['batch']) ? $_POST['batch'] : $this->batch;
    
    // Configure batches.
    if( in_array($size, [true, 'true']) ) $size = $this->batch;
    else if( in_array($size, [false, 'false']) ) $size = false;
    else if( is_numeric($size) ) $size = (int) $size;
    
    // Split emails into batches to reduce collisions with rate limits.
    $batches = array_chunk($emails, $size);
    
    // Handle batches one at a time.
    foreach( $batches as $batch => $emails ) {
      
      // Prepare emails for sending.
      foreach( $emails as $index => $email ) {
      
        // Try building the test email.
        try {

          // Generate an email.
          $batches[$batch][$index] = new Email($email['template'], $email['data']);

        }

        // Catch errors.
        catch( Exception $error ) {

          // Capture all errors.
          $result['error'] = true;
          $result['errors'][] = [
            'message' => $error->getMessage(),
            'data' => $email['data'],
            'template' => $email['template'],
            'index' => $email['index']
          ];

        }

      }
      
    }
    
    // Check for errors before sending.
    if( $result['error'] ) return $result;
    
    // Send emails in batches.
    foreach( $batches as $batch => $emails ) {
      
      // Otherwise, send the emails.
      foreach( $emails as $email ) { $result['results'][] = $email->send(); }
      
      // Wait 2 second before moving on to the next batch.
      sleep(2);
      
    }

    // Tally the number of emails that passed and failed.
    $result['passed'] = array_filter($result['results'], function($result){
      return $result['success'] === true;
    });
    $result['failed'] = array_filter($result['results'], function($result){
      return $result['success'] === false;
    });

    // Return the result.
    return $result;

  }

}

?>