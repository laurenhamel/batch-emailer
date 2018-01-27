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

// Globals
let filters = {
  
  lowercase: ( value ) => value.toLowerCase(),
  
  uppercase: ( value ) => value.toUpperCase(),
  
  titlecase: ( value ) => value.toTitleCase()
  
};
let methods = {};

// Events
let Events = new Vue();

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
      template: null,
      data: null
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
      
      // Reset responses.
      this.response = 0;
      
      // Get previews.
      $.post('php/emailer.php?action=preview', {
        template: this.template,
        data: this.data
      }, (response) => { 
        Events.$emit('previewer:incoming', {previews: response});
      }, 'json');
      
    },
    
    test() {
      
      // Capture self.
      let self = this;
      
      // Reset responses.
      self.response = 0;
      
      // Send tests.
      $.post('php/emailer.php?action=test', {
        template: this.template,
        data: this.data,
      }, (response) => {
        Events.$emit('results:incoming', response);
      }, 'json');
      
    },
    
    email() {
      
      // Capture self.
      let self = this;
      
      // Reset responses.
      self.response = 0;
      
      // Send emails.
      $.post('php/emailer.php?action=email', {
        template: this.template,
        data: this.data
      }, (response) => {
        Events.$emit('results:incoming', response);
      }, 'json');
      
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