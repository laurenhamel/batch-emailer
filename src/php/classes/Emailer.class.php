<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Emailer extends PHPMailer {

  protected $mail;

  public $settings = [
    'Subject'     => null,
    'Message'     => null,
    'From'        => [],
    'To'          => [],
    'CC'          => [],
    'BCC'         => [],
    'ReplyTo'     => [],
    'Attachments' => []
  ];

  function __construct(){

    // Load mail engine.
    $mail = new PHPMailer(true);

    // Configure the engine.
    $mail->isHTML(true);
    $mail->isSMTP();
    $mail->Host = $_ENV['HOST'];
    $mail->Port = $_ENV['PORT'];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['USERNAME'];
    $mail->Password = $_ENV['PASSWORD'];
    if( (bool) $_ENV['TLS'] ) $mail->SMTPSecure = 'tls';

    // Save engine.
    $this->mail = $mail;

  }

  function from( $email, $name = '' ) {

    $this->settings['From'] = ['email' => $email, 'name' => $name];
    echo json_encode($this->settings['From']);
  }

  function to( $email, $name = '' ) {

    $this->settings['To'][] = ['email' => $email, 'name' => $name];

    return count($this->settings['To']) - 1;

  }

  function cc( $email, $name = '' ) {

    $this->settings['CC'][] = ['email' => $email, 'name' => $name];

    return count($this->settings['CC']) - 1;

  }

  function bcc( $email, $name = '' ) {

    $this->settings['BCC'][] = ['email' => $email, 'name' => $name];

    return count($this->settings['BCC']) - 1;

  }

  function replyto( $email, $name = '' ) {

    $this->settings['ReplyTo'][] = ['email' => $email, 'name' => $name];

    return count($this->settings['ReplyTo']) - 1;

  }

  function attach( $file, $name = '' ) {

    $this->settings['Attachments'][] = ['file' => $email, 'name' => $name];

    return count($this->settings['Attachments']) - 1;

  }

  function subject( $subject ) {

    $this->settings['Subject'] = $subject;

  }

  function message( $message ) {

    $this->settings['Message'] = $message;

  }

  function send() {

    // Capture settings.
    $settings = $this->settings;

    // Set sender.
    $this->mail->setFrom($settings['From']['email'], $settings['From']['name']);

    // Add recipients.
    foreach($settings['To'] as $recipient) {

      $this->mail->addAddress($recipient['email'], $recipient['name']);

    }

    // Add reply to addresses.
    foreach($settings['ReplyTo'] as $address) {

      $this->mail->addReplyTo($address['email'], $address['name']);

    }

    // Add clear copies.
    foreach($settings['CC'] as $copy) {

      $this->mail->addCC($copy['email'], $copy['name']);

    }

    // Add blind copies.
    foreach($settings['BCC'] as $blind) {

      $this->mail->addBCC($blind['email'], $blind['name']);

    }

    // Add attachments.
    foreach($settings['Attachments'] as $attachments) {

      $this->mail->addAttachment($attachment['file'], $attachment['name']);

    }

    // Set subject.
    $this->mail->Subject = $settings['Subject'];

    // Set message.
    $this->mail->Body = $settings['Message'];

    // Set plain text version of message.
    $this->mail->AltBody = strip_tags($settings['Message']);

    // Send the email.
    $result = $this->mail->send();

    // Email successful.
    if( !$result ) return [
      "success" => false,
      "error" => $this->mail->ErrorInfo,
      "to" => $settings['To']
    ];

    return $results = [
      "success" => true,
      "to" => $settings['To']
    ];

  }

}

?>