module.exports = grammar({
  name: "template_toolkit",

  extras: $ => [/\s/, $.comment],

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.content,
      $.directive
    ),

    content: $ => choice(/[^\[]+/, /\[/),
    
    directive: $ => choice(
      $.conditional_block,
      $.simple_directive
    ),
    
    comment: $ => /#.*/,

    simple_directive: $ => seq('[%', $._directive_statement, '%]'),
    
    conditional_block: $ => seq(
      $.conditional_start_directive,
      repeat($._statement),
      repeat($.elsif_directive),
      optional($.else_directive),
      $.end_directive
    ),

    conditional_start_directive: $ => seq('[%', choice('IF', 'UNLESS'), $._value_expression, '%]'),
    elsif_directive:             $ => seq('[%', 'ELSIF', $._value_expression, '%]'),
    else_directive:              $ => seq('[%', 'ELSE', '%]'),
    end_directive:               $ => seq('[%', 'END', '%]'),

    _directive_statement: $ => choice(
      $.command_expression,
      $.assignment_expression,
      $._value_expression
    ),

    _value_expression: $ => choice(
      $.ternary_expression,     
      $.binary_expression,
      $.filter_expression,
      $.variable,
      $.string,
      $.bare_string,
      $.array,
      $.hash,
      $.parenthesized_expression
    ),

    ternary_expression: $ => prec.right(-1, seq(
      field('condition', $._value_expression),
      '?',
      field('if_true', $._value_expression),
      ':',
      field('if_false', $._value_expression)
    )),

    parenthesized_expression: $ => seq('(', $._value_expression, ')'),

    command_expression: $ => seq($.keyword, repeat1($._value_expression)),
    keyword: $ => choice('INCLUDE', 'USE', 'SET', 'GET', 'CALL', 'NEXT'),

    binary_expression: $ => choice(
      prec.left(2, seq(field('left', $._value_expression), field('operator', $.logical_op_high), field('right', $._value_expression))),
      prec.left(1, seq(field('left', $._value_expression), field('operator', $.logical_op_low), field('right', $._value_expression))),
      prec.left(0, seq(field('left', $._value_expression), field('operator', $.comparison_operator), field('right', $._value_expression)))
    ),

    assignment_expression: $ => prec.right(0, seq($.variable, '=', $._value_expression)),
    
    filter_expression: $ => seq($._value_expression, '|', $.identifier),

    string: $ => seq("'", /[^']*/, "'"),
    array: $ => seq('[', ']'),
    hash: $ => seq('{', '}'),

    variable: $ => seq($.identifier, repeat(seq('.', $.identifier))),
    
    identifier: $ => /[a-zA-Z0-9_][a-zA-Z0-9_]*/,
    
    bare_string: $ => /[a-zA-Z0-9_.\/]+/,

    comparison_operator: $ => choice('==', '!=', '<', '<=', '>', '>='),
    logical_op_high: $ => choice('&&', 'and'),
    logical_op_low: $ => choice('||', 'or'),
  }
});