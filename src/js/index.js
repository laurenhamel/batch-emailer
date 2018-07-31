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

// Extend.
$.isObject = function( object ) {
  
  return !$.isArray(object) && object !== null && object instanceof Object;
  
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

// API
let Batchailer = new Vue({
  
  data: {
    src: 'php/batchailer.php'
  },
  
  methods: {
    
    request( method, template, data ) {
      
      return $.post(`${this.src}?action=${method}`, {template, data}, 'json')
        .fail((error) => console.log(error));
      
    },
    
    preview( template, data ) {
      
      return this.request('PREVIEW', template, data);
      
    },
    
    merge( template, data ) {
      
      return this.request('MERGE', template, data);
      
    },
    
    test( template, data ) {
      
      return this.request('TEST', template, JSON.stringify(data));
      
    },
    
    email( template, data ) {
      
      return this.request('EMAIL', template, data);
      
    }
    
  }
  
});

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
        'merge',
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
      
      // Reset the previewer.
      Events.$emit('previewer:reset');
      
      // Reset errors.
      Events.$emit('errors:reset');

      // Reset responses.
      this.response = 0;
      this.disabled = true;

      // Get previews.
      Batchailer.preview(this.template, this.data)
        .done((previews) => Events.$emit('previewer:incoming', {previews}))
        .always(() => this.disabled = false);

    },
    
    merge() {
      
      // Reset the previewer.
      Events.$emit('previewer:reset');
      
      // Reset the merger.
      Events.$emit('merger:reset');
      
      // Reset errors.
      Events.$emit('errors:reset');
      
      // Reset response.
      this.response = 0;
      this.disabled = true;
      
      // Get merges.
      Batchailer.merge(this.template, this.data)
        .done((merges) => Events.$emit('merger:incoming', {merges}))
        .always(() => this.disabled = false);
      
    },

    test() {
      
      // Reset errors.
      Events.$emit('errors:reset');

      // Reset responses.
      this.response = 0;
      this.disabled = true;

      // Send tests.
      Batchailer.test(this.template, this.compiled)
        .done((response) => Events.$emit('results:incoming', response))
        .always(() => this.disabled = false);

    },

    email() {
      
      // Reset errors.
      Events.$emit('errors:reset');

      // Reset responses.
      this.response = 0;
      this.disabled = true;

      // Send emails.
      Batchailer.email(this.template, this.compiled)
        .done((response) => Events.$emit('results:incoming', response))
        .always(() => this.disabled = false);

    },
    
    init( data ) {
      
      this[data.bind] = data.value;
      
      this.responses++;
      
    }

  }, methods),

  created() {

    // Capture self.
    let self = this;

    // Capture response data.
    Events.$on('coder:response', (data) => this.init(data));

    // Capture microdata.
    Events.$on('microdata:change', (data) => this.microdata = data);

  },
  
  computed: {
    
    compiled() {
      
      // Parse data.
      let data = JSON.parse(this.data);
      
      // Compile data.
      data.map((email) => {
        
        // Merge receipt data.
        if( email.hasOwnProperty('receipts') ) {
          
          // Set read and delivery receipts.
          if( !email.receipts.hasOwnProperty('read') ) email = $.extend(true, email, {receipts: {read: this.read}});
          if( !email.receipts.hasOwnProperty('delivered')) email = $.extend(true, email, {receipts: {delivered: this.delivered}});
          
        }
        
        // Otherwise, set receipt data.
        else email = $.extend(true, email, {reciepts: {read: this.read, delivered: this.delivered}});
        
        // Merge microdata.
        for( let key in this.microdata ) {
          
          // Set microdata.
          if( !email.hasOwnProperty(key) ) email[key] = this.microdata[key];
          
          // Otherwise, merge microdata.
          else {
            
            // Handle array data.
            if( $.isArray(email[key]) ) {
              
              // Merge array data into the existing array.
              if( $.isArray(this.microdata[key]) ) email[key] = email[key].concat(this.microdata[key]).unique();
              
              // Otherwise, append data onto the array.
              else email[key] = email[key].concat([this.microdata[key]]).unique();
              
            }
            
            // Otherwise, handle object data.
            else if( $.isObject(email[key]) ) {
              
              // Extend objects.
              if( $.isObject(this.microdata[key]) ) email[key] = $.extend(true, email[key], this.microdata[key]);
              
            }
            
            // Otherwise, handle simple data.
            else if( !email[key] ) email[key] = this.microdata[key];
            
          }
          
        }
        
      });
      
      // Return the compiled data.
      return data;
      
    }
    
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

  methods: $.extend({
    
    reset() {
      
      this.previews = [];
      this.count = 0;
      this.active = 0;
      
    },
    
    preview( data ) {
      
      this.previews = data.previews;
      this.count = data.previews.length || 0;
      this.active = 0;
      
    }
    
  }, methods),

  created() {
    
    // Look for reset requests.
    Events.$on('previewer:reset', () => this.reset());

    // Look for incoming preview requests.
    Events.$on('previewer:incoming', (data) => this.preview(data));

  }

});

// Merger
let Merger = Vue.component('merger', {
  
  template: '#template-merger',
  
  data() {
    return {
      merges: [],
      active: 0,
      count: 0
    };
  },
  
  filters: $.extend({}, filters),
  
  methods: $.extend({
    
    reset() {
      
      this.merges = [];
      this.count = 0;
      this.active = 0;
      
    },
    
    merge( data ) {
      
      this.merges = data.merges;
      this.count = data.merges.length || 0;
      this.active = 0;
      
    }
    
  }, methods),
  
  created() {
    
    // Look for reset requests.
    Events.$on('merger:reset', () => this.reset());
    
    // Look for incoming merge requests.
    Events.$on('merger:incoming', (data) => this.merge(data));
    
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

// Merge
let Merge = Vue.component('merge', {

  template: '#template-merge',

  props: ['merge', 'active'],

  data() {
    return {};
  },

  filters: $.extend({}, filters),

  methods: $.extend({
    
    highlight() {
      
      CodeMirror.runMode(this.merge, 'text/html', this.$el);
      
    }
    
  }, methods),
  
  mounted() {
    
    if( this.active ) this.highlight();
    
  }

});

// Results
let Results = Vue.component('results', {

  template: '#template-results',

  data() {
    return {
      passed: [],
      passing: 0,
      failed: [],
      failing: 0,
      results: []
    };
  },

  filters: $.extend({}, filters),

  methods: $.extend({
    
    save( data ) {
      
      // Save results.
      this.passed = data.passed;
      this.passing = data.passed.length || 0;
      this.failed = data.failed;
      this.failing = data.failed.length || 0;
      this.results = data.results;
      
      // Check for errors.
      if( data.error ) Events.$emit('errors:incoming', data.errors);
      
    }
    
  }, methods),

  created() {

    // Generate feedback data.
    Events.$on('results:incoming', (data) => this.save(data));

  },
  
  computed: {
    
    successful() {
      
      return this.results.filter((result) => result.success === true).map((result) => {

        let string = [];

        result.to.forEach((to) => {

          string.push( to.email + (to.name ? ' (' + to.name + ')' : '') );

        });

        return string.join(', ');

      });
      
    },
    
    unsuccessful() {
    
      return this.results.filter((result) => result.success === false).map((result) => {

        let string = [];

        result.to.forEach((to) => {

          string.push( to.email + (to.name ? ' (' + to.name + ')' : '') );

        });

        return string.join(', ');

      });
      
    }
    
  }

});

// Errors
let Errors = Vue.component('errors', {
  
  template: '#template-errors',
  
  data() {
    return {
      errors: []
    };
  },
  
  filters: $.extend({}, filters),
  
  methods: $.extend({
    
    log( errors ) {
      
      this.errors = errors;
      
    },
    
    reset() {
      
      this.errors = [];
      
    },
    
    dismiss( index ) {
      
      this.errors.splice(index, 1);
      
    }
    
  }, methods),
  
  created() {
    
    // Generate feedback data.
    Events.$on('errors:incoming', (errors) => this.log(errors));
    
    // Reset feedback data.
    Events.$on('errors:reset', () => this.reset());
    
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

    // Set mode.
    this.mode = this.modes[this.lang];

    // Initialize scripts.
    let scripts = [];

    // Load scripts.
    this.scripts[this.lang].forEach((script) => scripts.push( $.getScript(`js/dependencies/codemirror/mode/${script}.js`) ));

    // Load code editors.
    $.when(...scripts).done(() => {

      this.editor = CodeMirror.fromTextArea(this.$el, {
        lineNumbers: true,
        tabSize: 2,
        mode: this.mode,
        theme: 'dark'
      });

    });

    Events.$on('coder:request', () => Events.$emit('coder:response', {bind: this.bind, value: this.editor.getValue()}));

  }

});

// App
let App = new Vue({

  el: '#app'

});