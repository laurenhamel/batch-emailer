'use strict';

// Prototypes
String.prototype.toTitleCase = function () {
  var proper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


  var blacklist = ['a', 'an', 'the', 'and', 'but', 'for', 'yet', 'at', 'by', 'from'],
      titlecase = this.replace(/\w\S*/g, function (s) {
    return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
  });

  if (proper) {

    titlecase.split(' ').forEach(function (word, index) {

      if (blacklist.indexOf(word.toLowerCase()) > -1) titlecase[index] = word.toLowerCase();
    });
  }

  return titlecase;
};

// Globals
var filters = {

  lowercase: function lowercase(value) {
    return value.toLowerCase();
  },

  uppercase: function uppercase(value) {
    return value.toUpperCase();
  },

  titlecase: function titlecase(value) {
    return value.toTitleCase();
  }

};
var methods = {};

// Events
var Events = new Vue();

// Controller
var Controller = Vue.component('controller', {

  template: '#template-controller',

  data: function data() {
    return {
      actions: ['preview', 'test', 'email'],
      responses: 0,
      action: 'preview',
      template: null,
      data: null
    };
  },


  filters: $.extend({}, filters),

  methods: $.extend({
    process: function process() {

      // Capture self.
      var self = this;

      // Request data.
      Events.$emit('coder:request');

      // Wait for data to load.
      var interval = setInterval(function () {

        if (self.responses >= 2) {

          clearInterval(interval);

          self[self.action]();
        }
      }, 100);
    },
    preview: function preview() {

      // Reset responses.
      this.response = 0;

      // Get previews.
      $.post('php/emailer.php?action=preview', {
        template: this.template,
        data: this.data
      }, function (response) {
        Events.$emit('previewer:incoming', { previews: response });
      }, 'json');
    },
    test: function test() {

      // Capture self.
      var self = this;

      // Reset responses.
      self.response = 0;

      // Send tests.
      $.post('php/emailer.php?action=test', {
        template: this.template,
        data: this.data
      }, function (response) {
        Events.$emit('results:incoming', response);
      }, 'json');
    },
    email: function email() {

      // Capture self.
      var self = this;

      // Reset responses.
      self.response = 0;

      // Send emails.
      $.post('php/emailer.php?action=email', {
        template: this.template,
        data: this.data
      }, function (response) {
        Events.$emit('results:incoming', response);
      }, 'json');
    }
  }, methods),

  created: function created() {

    // Capture self.
    var self = this;

    // Capture response data. 
    Events.$on('coder:response', function (data) {

      self[data.bind] = data.value;

      self.responses++;
    });
  }
});

// Previewer
var Previewer = Vue.component('previewer', {

  template: '#template-previewer',

  data: function data() {
    return {
      previews: [],
      active: 0,
      count: 0
    };
  },


  filters: $.extend({}, filters),

  methods: $.extend({}, methods),

  created: function created() {

    // Capture self.
    var self = this;

    // Look for incoming preview requests.
    Events.$on('previewer:incoming', function (data) {

      self.previews = data.previews;
      self.count = data.previews.length;
    });
  }
});

// Preview
var Preview = Vue.component('preview', {

  template: '#template-preview',

  props: ['preview', 'active'],

  data: function data() {
    return {};
  },


  filters: $.extend({}, filters),

  methods: $.extend({}, methods)

});

// Results
var Results = Vue.component('results', {

  template: '#template-results',

  data: function data() {
    return {
      sent: 0,
      failed: 0,
      results: []
    };
  },


  filters: $.extend({}, filters),

  methods: $.extend({
    sentTo: function sentTo() {

      return this.results.filter(function (result) {
        return result.success === true;
      }).map(function (result) {

        var string = [];

        result.to.forEach(function (to) {

          string.push(to.email + (to.name ? '(' + to.name + ')' : ''));
        });

        return string.join(', ');
      });
    },
    failedTo: function failedTo() {

      return this.results.filter(function (result) {
        return result.success === false;
      }).map(function (result) {

        var string = [];

        result.to.forEach(function (to) {

          string.push(to.email + (to.name ? '(' + to.name + ')' : ''));
        });

        return string.join(', ');
      });
    }
  }, methods),

  created: function created() {

    // Capture self.
    var self = this;

    // Generate feedback data.
    Events.$on('results:incoming', function (data) {

      self.sent = data.sent;
      self.failed = data.failed;
      self.results = data.results;
    });
  }
});

// Coder
var Coder = Vue.component('coder', {

  template: '#template-coder',

  props: ['lang', 'bind'],

  data: function data() {
    return {
      editor: null,
      mode: null,
      modes: {
        html: 'mustache',
        js: 'javascript',
        json: { name: 'javascript', json: true },
        php: 'php',
        md: { name: 'gfm' },
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

  mounted: function mounted() {
    var _$;

    var self = this;

    self.mode = self.modes[self.lang];

    var scripts = [];

    self.scripts[self.lang].forEach(function (script) {

      scripts.push($.getScript('js/dependencies/codemirror/mode/' + script + '.js'));
    });

    (_$ = $).when.apply(_$, scripts).done(function () {

      self.editor = CodeMirror.fromTextArea(self.$el, {
        lineNumbers: true,
        tabSize: 2,
        mode: self.mode,
        theme: 'dark'
      });
    });

    Events.$on('coder:request', function () {

      Events.$emit('coder:response', { bind: self.bind, value: self.editor.getValue() });
    });
  }
});

// App
var App = new Vue({

  el: '#app'

});
