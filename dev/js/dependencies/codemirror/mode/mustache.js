"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (mod) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  CodeMirror.defineMode("mustache", function (config, parserConfig) {

    var mustache = {
      token: function token(stream, state) {

        var ch;

        if (stream.match("{{")) {

          while ((ch = stream.next()) != null) {

            if (ch == "}" && stream.next() == "}") {

              stream.eat("}");

              return "mustache";
            }
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
