module.exports = grammar({
  name: "template_toolkit",

  extras: $ => [/\s/, $.comment],

  rules: {
    source_file: $ => repeat($._statement),
    _statement: $ => choice($.content, $.directive),
    content: $ => choice(/[^\[]+/, /\[/),
    directive: $ => choice($.conditional_block, $.simple_directive),
    comment: $ => /#.*/,
    simple_directive: $ => seq('[%', $._statement_list, '%]'),
    conditional_block: $ => seq(
      $.conditional_start_directive,
      repeat($._statement),
      repeat($.elsif_directive),
      optional($.else_directive),
      $.end_directive
    ),
    conditional_start_directive: $ => seq('[%', choice('IF', 'UNLESS'), $._value_expression, optional(seq(';', $._statement_list)), '%]'),
    elsif_directive:             $ => seq('[%', 'ELSIF', $._value_expression, optional(seq(';', $._statement_list)), '%]'),
    else_directive:              $ => seq('[%', 'ELSE', $._statement_list, '%]'),
    end_directive:               $ => seq('[%', 'END', '%]'),
    _statement_list: $ => seq($._directive_statement, repeat(seq(';', $._directive_statement))),
    _directive_statement: $ => choice($.command_expression, $.assignment_expression, $._value_expression),

    // The top-level expression rule, includes operations
    _value_expression: $ => choice(
      $.ternary_expression,
      $.binary_expression,
      $.filter_expression,
      $.call_expression, // <-- A call is a high-level expression
      $.primary_expression // <-- The fundamental units
    ),

    // --- NEW: The Primary Expression Rule ---
    // These are the "nouns" or basic units of the language.
    primary_expression: $ => choice(
      $.variable,
      $.string,
      $.array,
      $.hash,
      $.parenthesized_expression
    ),
    
    // --- MODIFIED: A call expression now operates ON a primary expression ---
    // This resolves the ambiguity.
    call_expression: $ => prec(10, seq(
      field('function', $.primary_expression),
      field('arguments', $.parenthesized_expression)
    )),

    ternary_expression: $ => prec.right(-1, seq(
      field('condition', $._value_expression), '?',
      field('if_true', $._value_expression), ':',
      field('if_false', $._value_expression)
    )),
    parenthesized_expression: $ => seq('(', optional($._statement_list), ')'),
    command_expression: $ => seq($.keyword, repeat1($._value_expression)),
    keyword: $ => choice('INCLUDE', 'USE', 'SET', 'GET', 'CALL', 'NEXT'),
    binary_expression: $ => choice(
      prec.left(3, seq(field('left', $._value_expression), field('operator', '_'), field('right', $._value_expression))),
      prec.left(2, seq(field('left', $._value_expression), field('operator', $.logical_op_high), field('right', $._value_expression))),
      prec.left(1, seq(field('left', $._value_expression), field('operator', $.logical_op_low), field('right', $._value_expression))),
      prec.left(0, seq(field('left', $._value_expression), field('operator', $.comparison_operator), field('right', $._value_expression)))
    ),
    assignment_expression: $ => prec.right(0, seq($.variable, '=', $._value_expression)),
    filter_expression: $ => seq($._value_expression, '|', $.identifier),
    string: $ => seq("'", /[^']*/, "'"),
    array: $ => seq('[', ']'),
    hash: $ => seq('{', optional(seq($.hash_pair, repeat(seq(',', $.hash_pair)))), '}'),
    hash_pair: $ => seq(field('key', choice($.identifier, $.string)), '=>', field('value', $._value_expression)),
    variable: $ => seq($.identifier, repeat(seq('.', $.identifier))),
    identifier: $ => /[a-zA-Z0-9_][a-zA-Z0-9_]*/,
    comparison_operator: $ => choice('==', '!=', '<', '<=', '>', '>='),
    logical_op_high: $ => choice('&&', 'and'),
    logical_op_low: $ => choice('||', 'or'),
  }
});