(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineMode("mustache", function (config, parserConfig) {
    
    var mustache = {
      token: function(stream, state) {
      
        var ch;
      
        if (stream.match("{{")) {
        
          while ((ch = stream.next()) != null)
          
            if (ch == "}" && stream.next() == "}") {
            
              stream.eat("}");
            
              return "mustache";
          
            }
      
        }
      
        while (stream.next() != null && !stream.match("{{", false)) {}
        
        return null;
        
      }
    };
    
    var mode = CodeMirror.getMode(config, parserConfig.backdrop || 'htmlmixed');

    return CodeMirror.overlayMode(mode, mustache);
    
  });
  
});