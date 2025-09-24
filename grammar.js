/**
 * @file TemplateToolkit grammar for tree-sitter
 * @author Jorge Solis <jpsb23@gmail.com>
 * @license MIT
 */

module.exports = grammar({
  name: "template_toolkit",

  extras: $ => [/\s/, $.comment],

  rules: {
    // A source file is a sequence of statements.
    source_file: $ => repeat($._statement),

    // A statement can be content (HTML) or a directive.
    _statement: $ => choice(
      $.content,
      $.directive
    ),

    content: $ => choice(/[^\[]+/, /\[/),
    
    // A directive can be a self-contained block (like IF) or a simple one-liner.
    directive: $ => choice(
      $.if_block,
      $.simple_directive
      // Later: $.foreach_block, etc.
    ),
    
    comment: $ => /#.*/,

    // --- NEW: A simple, one-line directive like [% var = 1 %] ---
    simple_directive: $ => seq(
      '[%',
      $._expression,
      '%]'
    ),
    
    // --- NEW: The entire IF block, from start to end ---
    if_block: $ => seq(
      $.if_directive,
      repeat($._statement), // The body can contain any statement (nesting!)
      repeat($.elsif_directive),
      optional($.else_directive),
      $.end_directive
    ),

    // --- NEW: Rules for the specific directive tags ---
    if_directive:    $ => seq('[%', 'IF', $._expression, '%]'),
    elsif_directive: $ => seq('[%', 'ELSIF', $._expression, '%]'),
    else_directive:  $ => seq('[%', 'ELSE', '%]'),
    end_directive:   $ => seq('[%', 'END', '%]'),

    // --- All expression logic is now self-contained ---
    _expression: $ => choice(
      $.binary_expression,
      $.assignment_expression,
      $.filter_expression,
      $.variable,
      $.string,
      $.bare_string,
      $.array,
      $.hash
    ),

    binary_expression: $ => prec.left(1, seq(
      field('left', $._expression),
      field('operator', choice($.comparison_operator, $.logical_operator)),
      field('right', $._expression)
    )),

    assignment_expression: $ => prec.right(0, seq($.variable, '=', $._expression)),
    
    filter_expression: $ => seq($.variable, '|', $.identifier),

    string: $ => seq("'", /[^']*/, "'"),
    array: $ => seq('[', ']'),
    hash: $ => seq('{', '}'),

    variable: $ => seq($.identifier, repeat(seq('.', $.identifier))),
    
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    
    bare_string: $ => /[a-zA-Z0-9_.\/]+/,

    comparison_operator: $ => '==',
    logical_operator: $ => '||',
  }
});