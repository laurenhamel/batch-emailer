"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (mod) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  CodeMirror.defineMode("apache", function () {
    return {
      token: function token(stream, state) {

        var sol = stream.sol() || state.afterSection;
        var eol = stream.eol();

        state.afterSection = false;

        if (sol) {

          if (state.nextMultiline) {

            state.inMultiline = true;
            state.nextMultiline = false;
          } else {

            state.position = "def";
          }
        }

        if (eol && !state.nextMultiline) {

          state.inMultiline = false;
          state.position = "def";
        }

        if (sol) {

          while (stream.eatSpace()) {}
        }

        var ch = stream.next();

        if (sol && ch === "#") {

          state.position = "comment";

          stream.skipToEnd();

          return "comment";
        } else if (ch === " ") {

          state.position = "variable";

          //return null;
        } else if (ch === '"') {

          // Quote found on this line
          if (stream.skipTo('"')) {

            // Skip quote
            stream.next();
          } else {

            // Rest of line is string
            stream.skipToEnd();
          }

          state.position = "quote";
        } else if (ch === '<' || ch === '>') {

          state.position = "def";
        }

        return state.position;
      },

      startState: function startState() {
        return {
          position: "def", // Current position, "def", "quote" or "comment"
          nextMultiline: false, // Is the next line multiline value
          inMultiline: false, // Is the current line a multiline value
          afterSection: false // Did we just open a section
        };
      }

    };
  });
});
