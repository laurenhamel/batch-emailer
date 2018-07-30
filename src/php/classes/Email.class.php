<?php

class Email {
  
  // Capture data.
  public $message;
  public $data;
  
  // Initialize email.
  protected $email;
  
  // Capture errors.
  protected $errors = [];
  
  // Constructor
  function __construct( $message, array $data ) {
    
    // Save data.
    $this->message = $message;
    $this->data = $data;
    
    // Generate email.
    $this->email = new Emailer();
    
    // Parse email data.
    $this->parse();
    
  }
  
  // Parse email data.
  private function parse() {
    
    // Localize message and data.
    $data = $this->data;
    $message = $this->message;
    
    // Try parsing the data.
    try {
    
      // Set sender. (required)
      if( isset($data['from']) ) {
        if( is_string($data['from']) ) $this->email->from($data['from']);
        else $this->email->from($data['from']['email'], $data['from']['name']);
      }
      else { throw new Exception('Sender missing'); }

      // Set recipient. (required)
      if( isset($data['to']) ) {
        if( is_string($data['to']) ) $this->email->to($data['to']);
        else if( is_associative_array($data['to']) ) $this->email->to($data['to']['email'], $data['to']['name']);
        else foreach( $data['to'] as $person ) { $this->email->to($person['email'], $person['name']); }
      }
      else { throw new Exception('Recipient missing'); }
      
      // Set clear copy. (optional)
      if( isset($data['cc']) ) {
        if( is_string($data['cc']) ) $this->email->cc($data['cc']);
        else if( is_associative_array($data['cc']) ) $this->email->cc($data['cc']['email'], $data['cc']['name']);
        else foreach( $data['cc'] as $person ) { $this->email->cc($person['email'], $person['name']); }
      }
      
      // Set blind copy. (optional)
      if( isset($data['bcc']) ) {
        if( is_string($data['bcc']) ) $this->email->bcc($data['bcc']);
        else if( is_associative_array($data['bcc']) ) $this->email->bcc($data['bcc']['email'], $data['bcc']['name']);
        else foreach( $data['bcc'] as $person ) { $this->email->bcc($person['email'], $person['name']); }
      }
      
      // Set receipts. (optional)
      if( isset($data['receipts']) ) {
        
        // Set read receipts.
        if( isset($data['receipts']['read']) and $data['receipts']['read'] === true ) {
          if( is_string($data['from']) ) $this->email->readReceipt($data['from']);
          else $this->email->readReceipt($data['from']['email']);
        }
        
        // Set delivery receipts.
        if( isset($data['receipts']['delivered']) and $data['receipts']['delivered'] === true ) {
          if( is_string($data['from']) ) $this->email->deliveryReceipt($data['from']);
          else $this->email->deliveryReceipt($data['from']['email']);
        }
        
      }
      
      // Set email subject. (required)
      if( isset($data['subject']) ) $this->email->subject($data['subject']);
      else { throw new Exception('Subject missing'); }
      
      // Set email message. (required)
      if( isset($message) ) $this->email->message($message);
      else { throw new Exception('Message missing'); };
      
      
    }
    
    // Catch email exceptions.
    catch( phpmailerException $error ) {
      
      // Return the error.
      throw $error;
      
    }
    
    // Catch all other exceptions.
    catch( Exception $error ) {
      
      // Return the error.
      throw $error;
      
    }
    
  }
  
  // Send the email.
  public function send() {
    
    return $this->email->send();
    
  }
  
}

?>