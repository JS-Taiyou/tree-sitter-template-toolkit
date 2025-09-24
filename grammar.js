/**
 * @file TemplateToolkit grammar for tree-sitter
 * @author Jorge Solis <jpsb23@gmail.com>
 * @license MIT
 */

module.exports = grammar({
  name: "template_toolkit",

  extras: $ => [/\s/],

  rules: {
    source_file: $ => repeat(choice($.content, $.directive)),

    content: $ => choice(/[^\[]+/, /\[/, /[^\{}]+/),

    directive: $ => seq(
      $.tag_start,
      optional(choice($._statement, $.comment)),
      $.tag_end
    ),

    tag_start: $ => '[%',
    tag_end: $ => '%]',
    
    comment: $ => /#.*/,

    _statement: $ => repeat1(
      choice(
        $.assignment_expression,
        $.filter_expression,
        $.keyword,
        $.variable,
        $.bare_string
      )
    ),

    assignment_expression: $ => seq(
      $.variable,
      $.assignment_operator,
      $._value
    ),
    
    assignment_operator: $ => '=',

    _value: $ => choice(
      $.array, $.hash
    ),

    array: $ => seq('[', ']'),
    hash: $ => seq('{', '}'),

    filter_expression: $ => seq(
      $.variable,
      $.pipe,
      $.identifier
    ),

    keyword: $ => choice(
      'IF', 'END', 'FOREACH', 'WHILE', 'SWITCH', 'CASE', 'GET', 'CALL', 'SET', 'INCLUDE'
    ),

    variable: $ => seq(
      $.identifier,
      repeat(seq($.dot, $.identifier))
    ),
    
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    dot: $ => '.',
    bare_string: $ => /[a-zA-Z0-9_.\/]+/,
    pipe: $ => '|',
  }
});