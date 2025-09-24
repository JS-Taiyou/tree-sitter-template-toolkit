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

    content: ($) => choice(/[^\[]+/, /\[/),

    directive: ($) =>
      seq($.tag_start, optional(choice($._statement, $.comment)), $.tag_end),

    tag_start: ($) => "[%",
    tag_end: ($) => "%]",

    comment: ($) => /#.*/,

    // --- RULE MODIFIED ---
    // A statement can now also be a filter expression.
    // NOTE: `filter_expression` must come BEFORE `variable` in the choice,
    // because a filter_expression starts with a variable. This tells the
    // parser to try matching the longer, more specific rule first.
    _statement: ($) =>
      repeat1(
        choice(
          $.filter_expression, // <-- Added this
          $.keyword,
          $.variable,
          $.bare_string,
        ),
      ),

    // --- NEW RULE ---
    // Defines the structure of `variable | filter`
    filter_expression: ($) =>
      seq(
        $.variable,
        $.pipe,
        $.identifier, // The filter name, e.g., 'html'
      ),

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
        "INCLUDE",
        "USE",
        "FILTER",
        "PROCESS",
        "BLOCK",
      ),

    variable: ($) => seq($.identifier, repeat(seq($.dot, $.identifier))),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    dot: ($) => ".",
    bare_string: ($) => /[a-zA-Z0-9_.\/]+/,
    pipe: ($) => "|",
  },
});
