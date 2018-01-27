# Batch Emailer

Batch Emailer provides a simple front-end interface for generating and sending multiple emails at one time. Batch Emailer works by taking an HTML email template and some JSON contact data, then merging the two before finally sending out an email blast to your contact list. The HTML email templates can be personalized by using the Mustache templating language with the appropriate, corresponding JSON data. Additionally, Batch Emailer allows you to preview your emails before sending as well as generate and send test emails. 

## Prerequisites

This project uses [`npm`](//npmjs.org) and [`composer`](//getcomposer.org) to manage dependencies, and [`grunt`](//gruntjs.com) for task automation.

## Getting Started

To get started, follow the steps below:

1. Verify that all prequistes have been installed on your system.

2. Clone the repo and install both `npm` and `composer` dependencies. 

3. Create a `.env` file in the `data/` folder with the following email server configurations:

  ```
  # Email address and name used for sending test emails.
  FROM_EMAIL=outgoing@test.com
  FROM_NAME="Outgoing Test"
  # Email address and name used for receiving test emails.
  TO_EMAIL=incoming@test.com
  TO_NAME="Incoming Test"
  # Email server configurations used for sending outgoing emails.
  HOST=smtp.host.com
  PORT=0
  USERNAME=username
  PASSWORD=password
  TLS=true
  ```

4. Run `grunt` or `grunt dev` to make customizations to the project.

5. Alternatively, run `grunt dist` to generate production-ready files for deployment.

## Using the Interface

The interface is intended to be simple and intuitive. To use the Batch Emailer, first insert the markup for an HTML email template into the *Template* input field. This email template can optionally be marked up using the Mustache templating language to personalize your emails for each contact. Next, insert some JSON contact data into the *Data* input field. See the [Data Format](#data-format) section for more details on how to format your contact data for proper rendering and sending. Use the provided dropdown menu to choose from several rendering options: preview, test, or email. Click **Go** and let the Batch Emailer do the rest of the work for you. If using the **preview** option, a frame will be rendered, which allows you to look at the merged email template and data in the same browser window. If using the **test** option, your test emails will be sent to the email address you specified in your `.env` file and results of the test will be displayed in the browser window. If using the **email** option, your template and data will be merged and blasted to all contacts listed in your JSON and the results of the batch email process will be displayed in the browser window.

## Data Format

In order to send out batch emails, your JSON data must include an array of individual contact data. Furthermore, for each contact, a `to` and `from` key is required and a `subject` key is recommended. These parameters will be reflected in the email's respective fields. Additionally, the `to` and `from` values can be declared in a number of ways:

### For the `from` parameter:

**A simple string can be used:**
```json
[
  {
    "from": "from@example.com"
  }
]
```

**Alternatively, an object with `email` and `name`(optional) keys can be used:**
```json
[
  {
    "from": {
      "email": "from@example.com",
      "name": "Optional"
    }
  }
]
```

### For the `to` parameter:

**A simple string can be used:**
```json
[
  {
    "to": "to@example.com"
  }
]
```

**Or an object with `email` and `name`(optional) keys can be used:**
```json
[
  {
    "to": {
      "email": "to@example.com",
      "name": "Optional"
    }
  }
]
```

**Or an array of objects can be used to specify more than one email recipient:**
```json
[
  {
    "to": [
      {"email": "to1@example.com", "name": "Optional 1"},
      {"email": "to2@example.com", "name": "Optional 2"}
    ]
  }
]
```