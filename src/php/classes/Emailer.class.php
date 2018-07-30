<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Emailer extends PHPMailer {

  protected $mail;
  
  // FOR DEVELOPMENT ONLY: Set to `false` before production.
  private $debugging = false;

  public $receipts = [
    'read' => [],
    'delivered' => []
  ];

  function __construct(){

    // Load mail engine.
    $this->mail = new PHPMailer(true);

    // Configure the engine.
    $this->mail->isHTML(true);
    $this->mail->isSMTP();
    $this->mail->Host = $_ENV['HOST'];
    $this->mail->Port = $_ENV['PORT'];
    $this->mail->SMTPAuth = true;
    $this->mail->Username = $_ENV['USERNAME'];
    $this->mail->Password = $_ENV['PASSWORD'];
    $this->mail->CharSet = 'UTF-8';
    if( $this->debugging ) $this->mail->SMTPDebug = 2;
    if( (bool) $_ENV['TLS'] ) $this->mail->SMTPSecure = 'tls';

  }

  public function from( $email, $name = '' ) {

    try { 
      
      $this->mail->setFrom($email, $name); 
    
    } 
    
    catch( phpmailerException $error ) {
      
      throw $error;
      
    }
    
    catch( Exception $error ) {
      
      throw $error;
      
    }

  }

  function to( $email, $name = '' ) {

    try { 
      
      $this->mail->addAddress($email, $name); 
    
    } 
    
    catch( phpmailerException $error ) {
      
      throw $error;
      
    }
    
    catch( Exception $error ) {
      
      throw $error;
      
    }

  }

  function cc( $email, $name = '' ) {

    try { 
      
      $this->mail->addCC($email, $name); 
    
    } 
    
    catch( phpmailerException $error ) {
      
      throw $error;
      
    }
    
    catch( Exception $error ) {
      
      throw $error;
      
    }

  }

  function bcc( $email, $name = '' ) {

    try { 
      
      $this->mail->addBCC($email, $name); 
    
    } 
    
    catch( phpmailerException $error ) {
      
      throw $error;
      
    }
    
    catch( Exception $error ) {
      
      throw $error;
      
    }

  }

  function replyto( $email, $name = '' ) {

    try { 
      
      $this->mail->addReplyTo($email, $name); 
    
    } 
    
    catch( phpmailerException $error ) {
      
      throw $error;
      
    }
    
    catch( Exception $error ) {
      
      throw $error;
      
    }

  }

  function attach( $file, $name = '' ) {

    try { 
      
      $this->mail->addAttachment($email, $name); 
    
    } 
    
    catch( phpmailerException $error ) {
      
      throw $error;
      
    }
    
    catch( Exception $error ) {
      
      throw $error;
      
    }

  }

  function subject( $subject ) {

    try { 
      
      $this->mail->Subject = $subject;
    
    } 
    
    catch( phpmailerException $error ) {
      
      throw $error;
      
    }
    
    catch( Exception $error ) {
      
      throw $error;
      
    }

  }

  function message( $message ) {

    try { 
      
      $this->mail->Body = $message;
      $this->mail->AltBody = strip_tags($message);
    
    } 
    
    catch( phpmailerException $error ) {
      
      throw $error;
      
    }
    
    catch( Exception $error ) {
      
      throw $error;
      
    }

  }

  function readReceipt( $notify ) {

    try { 
      
      $this->mail->AddCustomHeader("X-Confirm-Reading-To: $notify");
      $this->mail->AddCustomHeader("Disposition-Notification-To: $notify");
    
    } 
    
    catch( phpmailerException $error ) {
      
      throw $error;
      
    }
    
    catch( Exception $error ) {
      
      throw $error;
      
    }

  }

  function deliveryReceipt( $notify ) {

    try { 
      
      $this->mail->AddCustomHeader("Return-Receipt-To: $notify");
    
    } 
    
    catch( phpmailerException $error ) {
      
      throw $error;
      
    }
    
    catch( Exception $error ) {
      
      throw $error;
      
    }

  }

  function send() {
    
    // Initialize the result.
    $result = [
      'success' => true,
      'error' => false,
      'to' => $this->mail->getToAddresses()
    ];

    // Try to send the email.
    try {
      
      // Send the email.
      $this->mail->send();
      
    }
    
    // Catch mailer errors.
    catch( phpmailerException $error ) {
      
      // Save the error.
      $result['error'] = true;
      $result['message'] = $error->getMessage();
      
    }
    
    // Catch generic errors.
    catch( Exception $error ) {
      
      // Save the error.
      $result['error'] = true;
      $result['message'] = $error->getMessage();
      
    }

    // Check for errors.
    if( $result['error'] ) $result['success'] = false;

    // Return the result.
    return $result;

  }

}

?>