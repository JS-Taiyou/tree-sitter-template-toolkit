/**
 * @file TemplateToolkit grammar for tree-sitter
 * @author Jorge Solis <jpsb23@gmail.com>
 * @license MIT
 */

module.exports = grammar({
  name: "template_toolkit",

  extras: ($) => [/\s/],

  rules: {
    source_file: ($) => repeat(choice($.content, $.directive)),

    // --- THIS IS THE CORRECTED RULE ---
    // It now defines content as either:
    // 1. A sequence of characters that are NOT '['.
    // 2. A single, literal '[' character.
    content: ($) =>
      choice(
        /[^\[]+/, // Matches 'foo ' and ' bar'
        /\[/, // Matches the lone '[' in 'foo [ bar'
      ),

    directive: ($) => seq($.tag_start, optional($._statement), $.tag_end),

    tag_start: ($) => "[%",
    tag_end: ($) => "%]",

    _statement: ($) => choice($.comment, $.keyword, $.variable),

    comment: ($) => /#.*/,

    keyword: ($) =>
      choice(
        "IF",
        "END",
        "FOREACH",
        "WHILE",
        "SWITCH",
        "CASE",
        "GET",
        "CALL",
        "SET",
      ),

    variable: ($) => seq($.identifier, repeat(seq($.dot, $.identifier))),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    dot: ($) => ".",
  },
});
