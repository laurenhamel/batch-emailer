<?php

trait Preview {
  
  public function preview() {
    
    // Return previews.
    return json_encode(array_map(function($bound){
      return $bound['template'];
    }, $this->bound));
    
  }
  
} 

trait Test {
  
  public function test() {
    
    // Prepare emails.
    $emails = $this->bound;
    
    // Randomize email order.
    shuffle( $emails );
    
    // Get the limit on how many tests to send.
    $limit = $_POST['limit'] ?: false;
    
    // Handle limits.
    if( $limit !== false and is_numeric($limit) ) $emails = array_slice($emails, $limit);
    
    // Initialize results.
    $results = [];
    
    // Send tests.
    foreach( $emails as $email ) { 
      
      // Generate an email.
      $emailer = new Emailer();
      
      // Set default test parameters.
      $emailer->from($_ENV['FROM_EMAIL'], $_ENV['FROM_NAME']);
      $emailer->to($_ENV['TO_EMAIL'], $_ENV['TO_NAME']);
      
      // Set email parameters.
      $emailer->subject( $email['data']['subject'] );
      $emailer->message( $email['template'] );
      
      // Send the email.
      $results[] = $emailer->send();
      
    }
    
    // Tally the number of emails that passed and failed.
    $sent = count(array_filter($results, function($result){
      return $result['success'] === true;
    }));
    $failed = count(array_filter($results, function($result){
      return $result['success'] === false;
    }));
    
    // Return the results.
    return json_encode(['sent' => $sent, 'failed' => $failed, 'results' => $results]);
    
  }
  
}

trait Email {
  
  public function email() {
    
    // Prepare emails.
    $emails = $this->bound;
    
    // Randomize email order.
    shuffle( $emails );
    
    // Get the limit on how many tests to send.
    $limit = $_POST['limit'] ?: false;
    
    // Handle limits.
    if( $limit !== false and is_numeric($limit) ) $emails = array_slice($emails, $limit);
    
    // Initialize results.
    $results = [];
    
    // Send tests.
    foreach( $emails as $email ) { 
      
      // Generate an email.
      $emailer = new Emailer();
      
      // Set sender.
      if( gettype($email['data']['from']) == 'string' ) {
        
        $emailer->from( $email['data']['from'] );
        
      }
      else {
        
        $emailer->from( $email['data']['from']['email'], $email['data']['from']['name'] );
        
      }
      
      // Set recipients.
      if( gettype($email['data']['to']) == 'string' ) {
        
        $emailer->to( $email['data']['to'] );
        
      }
      else if( !$email['data']['to']['email'] ) {
        
        foreach($email['data']['to'] as $recipient) {
          
          $emailer->to( $recipient['email'], $recipient['name'] );
          
        }
        
      }
      else {
        
        $emailer->to( $email['data']['to']['email'], $email['data']['to']['name'] );
        
      }
      
      // Set clear copiers.
      if( $email['data']['cc'] ) {
        if( gettype($email['data']['cc']) == 'string' ) {

          $emailer->to( $email['data']['cc'] );

        }
        else if( !$email['data']['cc']['email'] ) {

          foreach($email['data']['cc'] as $copy) {

            $emailer->to( $copy['email'], $copy['name'] );

          }

        }
        else {

          $emailer->to( $email['data']['cc']['email'], $email['data']['cc']['name'] );

        }
      }
      
      // Set blind copiers.
      if( $email['data']['bcc'] ) {
        if( gettype($email['data']['bcc']) == 'string' ) {

          $emailer->to( $email['data']['bcc'] );

        }
        else if( !$email['data']['bcc']['email'] ) {

          foreach($email['data']['bcc'] as $copy) {

            $emailer->to( $copy['email'], $copy['name'] );

          }

        }
        else {

          $emailer->to( $email['data']['bcc']['email'], $email['data']['bcc']['name'] );

        }
      }
      
      // Set email parameters.
      $emailer->subject( $email['data']['subject'] );
      $emailer->message( $email['template'] );
      
      // Send the email.
      $results[] = $emailer->send();
      
    }
    
    // Tally the number of emails that passed and failed.
    $sent = count(array_filter($results, function($result){
      return $result['success'] === true;
    }));
    $failed = count(array_filter($results, function($result){
      return $result['success'] === false;
    }));
    
    // Return the results.
    return json_encode(['sent' => $sent, 'failed' => $failed, 'results' => $results]);
    
  }
  
}

class BatchEmailer {
  
  public $template;
  public $data;
  
  protected $bound = [];
  protected $renderer;
  
  use Preview, Test, Email;
  
  /**
   * Constructor function
   */
  function __construct( $template, $data ) {
    
    // Save inputs.
    $this->template = $template;
    $this->data = json_decode($data, true);
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
  
}

?>