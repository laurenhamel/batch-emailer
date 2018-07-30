// Prototypes
String.prototype.toTitleCase = function( proper = false ) {

  let blacklist = ['a', 'an', 'the', 'and', 'but', 'for', 'yet', 'at', 'by', 'from'],
      titlecase = this.replace(/\w\S*/g, (s) => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());

  if( proper ) {

    titlecase.split(' ').forEach((word, index) => {

      if( blacklist.indexOf(word.toLowerCase()) > -1 ) titlecase[index] = word.toLowerCase();

    });

  }

  return titlecase;

};
Array.prototype.unique = function() {

  let result = [];

  this.forEach((value) => {

    if( result.indexOf(value) < 0 ) result.push(value);

  });

  return result;

};

// Globals
let filters = {

  lowercase: ( value ) => value.toLowerCase(),

  uppercase: ( value ) => value.toUpperCase(),

  titlecase: ( value ) => value.toTitleCase()

};
let methods = {};

// Events
let Events = new Vue();

// Microdata
let Microdata = Vue.component('microdata', {

  template: '#template-microdata',

  data() {
    return {
      subject: null,
    };
  },

  filters: $.extend({}, filters),

  methods: $.extend({

    save() {

      Events.$emit('microdata:change', {subject: this.subject});

    }

  }, methods),

  created() {}

});

// Controller
let Controller = Vue.component('controller', {

  template: '#template-controller',

  data() {
    return {
      actions: [
        'preview',
        'test',
        'email'
      ],
      responses: 0,
      action: 'preview',
      read: false,
      delivered: false,
      template: null,
      data: null,
      microdata: null,
      disabled: false
    };
  },

  filters: $.extend({}, filters),

  methods: $.extend({

    process() {

      // Capture self.
      let self = this;

      // Request data.
      Events.$emit('coder:request');

      // Wait for data to load.
      let interval = setInterval(() => {

        if( self.responses >= 2 ) {

          clearInterval(interval);

          self[self.action]();

        }

      }, 100);

    },

    preview() {
      
      // Capture self.
      let self = this;

      // Reset responses.
      self.response = 0;
      self.disabled = true;

      // Get previews.
      $.post('php/emailer.php?action=preview', {
        template: self.template,
        data: self.data
      }, (response) => {
        Events.$emit('previewer:incoming', {previews: response});
        self.disabled = false;
      }, 'json');

    },

    test() {

      // Capture self.
      let self = this,
          data = JSON.parse(self.data);

      // Reset responses.
      self.response = 0;
      self.disabled = true;

      // Merge data.
      data.forEach(function(obj, i) {

        // Merge recipient data.
        if( obj.hasOwnProperty('receipts') ) {
          if( !obj.receipts.hasOwnProperty('read') ) {

            obj = $.extend(true, obj, {receipts: {read: self.read}});

          }
          if( !obj.receipts.hasOwnProperty('delivered') ) {

            obj = $.extend(true, obj, {receipts: {delivered: self.delivered}});

          }
        }
        else {
          obj = $.extend(true, obj, {
            receipts: {
              read: self.read,
              delivered: self.delivered
            }
          });
        }

        // Merge microdata.
        for(let key in self.microdata) {

          if( !obj.hasOwnProperty(key) ) obj[key] = self.microdata[key];
          else {

            if( $.isArray(obj[key]) ) {

              if( $.isArray(self.microdata[key]) ) obj[key] = obj[key].concat(self.microdata[key]).unique();
              else {

                obj[key].push(self.microdata[key]);

                obj[key] = obj[key].unique();

              }

            }

            else if( obj[key] !== null && obj[key] instanceof Object ) {

              if( self.microdata[key] !== null && self.microdata[key] instanceof Object ) {

                obj[key] = $.extend(true, obj[key], self.microdata[key]);

              }

            }

            else if( !obj[key] ) obj[key] = self.microdata[key];

          }

        }

        data[i] = obj;

      });

      // Send tests.
      $.post('php/emailer.php?action=test', {
        template: self.template,
        data: JSON.stringify(data)
      }, 'json').done((response) => {
        Events.$emit('results:incoming', response);
        self.disabled = false;
      }).fail((error) => console.log(error));

    },

    email() {

      // Capture self.
      let self = this,
          data = JSON.parse(self.data);

      // Reset responses.
      self.response = 0;
      self.disabled = true;

      // Merge data.
      data.forEach(function(obj, i) {

        // Merge recipient data.
        if( obj.hasOwnProperty('receipts') ) {
          if( !obj.receipts.hasOwnProperty('read') ) {

            obj = $.extend(true, obj, {receipts: {read: self.read}});

          }
          if( !obj.receipts.hasOwnProperty('delivered') ) {

            obj = $.extend(true, obj, {receipts: {delivered: self.delivered}});

          }
        }
        else {
          obj = $.extend(true, obj, {
            receipts: {
              read: self.read,
              delivered: self.delivered
            }
          });
        }

        // Merge microdata.
        for(let key in self.microdata) {

          if( !obj.hasOwnProperty(key) ) obj[key] = self.microdata[key];
          else {

            if( $.isArray(obj[key]) ) {

              if( $.isArray(self.microdata[key]) ) obj[key] = obj[key].concat(self.microdata[key]).unique();
              else {

                obj[key].push(self.microdata[key]);

                obj[key] = obj[key].unique();

              }

            }

            else if( obj[key] !== null && obj[key] instanceof Object ) {

              if( self.microdata[key] !== null && self.microdata[key] instanceof Object ) {

                obj[key] = $.extend(true, obj[key], self.microdata[key]);

              }

            }

            else if( !obj[key] ) obj[key] = self.microdata[key];

          }

        }

        data[i] = obj;

      });

      // Send emails.
      $.post('php/emailer.php?action=email', {
        template: self.template,
        data: JSON.stringify(data)
      }, 'json').done((response) => {
        Events.$emit('results:incoming', response);
        self.disabled = false;
      }).fail((error) => console.log(error));

    }

  }, methods),

  created() {

    // Capture self.
    let self = this;

    // Capture response data.
    Events.$on('coder:response', (data) => {

      self[data.bind] = data.value;

      self.responses++;

    });

    // Capture microdata.
    Events.$on('microdata:change', (data) => { self.microdata = data; });

  }

});

// Previewer
let Previewer = Vue.component('previewer', {

  template: '#template-previewer',

  data() {
    return {
      previews: [],
      active: 0,
      count: 0
    };
  },

  filters: $.extend({}, filters),

  methods: $.extend({}, methods),

  created() {

    // Capture self.
    let self = this;

    // Look for incoming preview requests.
    Events.$on('previewer:incoming', (data) => {

      self.previews = data.previews;
      self.count = data.previews.length;

    });

  }

});

// Preview
let Preview = Vue.component('preview', {

  template: '#template-preview',

  props: ['preview', 'active'],

  data() {
    return {};
  },

  filters: $.extend({}, filters),

  methods: $.extend({}, methods)

});

// Results
let Results = Vue.component('results', {

  template: '#template-results',

  data() {
    return {
      sent: 0,
      failed: 0,
      results: []
    };
  },

  filters: $.extend({}, filters),

  methods: $.extend({

    sentTo() {

      return this.results.filter((result) => {
        return result.success === true;
      }).map((result) => {

        let string = [];

        result.to.forEach((to) => {

          string.push( to.email + (to.name ? '(' + to.name + ')' : '') );

        });

        return string.join(', ');

      });

    },

    failedTo() {

      return this.results.filter((result) => {
        return result.success === false;
      }).map((result) => {

        let string = [];

        result.to.forEach((to) => {

          string.push( to.email + (to.name ? '(' + to.name + ')' : '') );

        });

        return string.join(', ');

      });

    }

  }, methods),

  created() {

    // Capture self.
    let self = this;

    // Generate feedback data.
    Events.$on('results:incoming', (data) => {

      self.sent = data.sent;
      self.failed = data.failed;
      self.results = data.results;

    });

  }

});

// Coder
let Coder = Vue.component('coder', {

  template: '#template-coder',

  props: ['lang', 'bind'],

  data() {
    return {
      editor: null,
      mode: null,
      modes: {
        html: 'mustache',
        js: 'javascript',
        json: {name: 'javascript', json: true},
        php: 'php',
        md: {name: 'gfm'},
        css: 'css',
        scss: 'sass'
      },
      scripts: {
        html: ['htmlmixed', 'xml', 'css', 'javascript', 'mustache'],
        js: ['javascript'],
        json: ['javascript'],
        php: ['htmlmixed', 'xml', 'javascript', 'css', 'clike'],
        md: ['markdown', 'gfm'],
        css: ['css'],
        scss: ['css', 'sass']
      }
    };
  },

  filters: $.extend({}, filters),

  methods: $.extend({}, methods),

  mounted() {

    let self = this;

    self.mode = self.modes[self.lang];

    let scripts = [];

    self.scripts[self.lang].forEach((script) => {

      scripts.push( $.getScript('js/dependencies/codemirror/mode/' + script + '.js') );

    });

    $.when(...scripts).done(() => {

      self.editor = CodeMirror.fromTextArea(self.$el, {
        lineNumbers: true,
        tabSize: 2,
        mode: self.mode,
        theme: 'dark'
      });

    });

    Events.$on('coder:request', () => {

      Events.$emit('coder:response', {bind: self.bind, value: self.editor.getValue()});

    });

  }

});

// App
let App = new Vue({

  el: '#app'

});