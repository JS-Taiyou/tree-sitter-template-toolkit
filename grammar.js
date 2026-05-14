module.exports = grammar({
  name: "template_toolkit",

  extras: $ => [/\s/],

  externals: $ => [$.content],

  conflicts: $ => [[$.filter_start_directive, $.keyword], [$.filter_start_directive, $.command_expression], [$.primary_expression, $.command_expression], [$.command_expression], [$.elsif_clause], [$.else_clause], [$.case_clause], [$.default_clause], [$.catch_clause], [$.variable, $.path], [$.path], [$.inline_conditional], [$.inline_foreach], [$.inline_else_clause], [$.inline_elsif_clause]],

  rules: {
    source_file: $ => repeat($._statement),
    _statement: $ => choice($.content, $.directive),
    directive: $ => choice($.conditional_block, $.foreach_block, $.filter_block, $.switch_block, $.while_block, $.block_block, $.try_block, $.simple_directive),
    comment: $ => /#[^%]*/,
    directive_open: $ => choice('[%', '[%-'),
    directive_close: $ => choice('%]', '-%]'),
    simple_directive: $ => seq($.directive_open, $._statement_list, $.directive_close),
    conditional_block: $ => seq(
      $.conditional_start_directive,
      repeat($._statement),
      repeat($.elsif_clause),
      optional($.else_clause),
      $.end_directive
    ),
    foreach_block: $ => seq($.foreach_directive, repeat($._statement), $.end_directive),
    filter_block: $ => seq($.filter_start_directive, repeat($._statement), $.end_directive),
    switch_block: $ => seq($.switch_directive, repeat($.case_clause), optional($.default_clause), $.end_directive),
    switch_directive: $ => seq($.directive_open, 'SWITCH', $._value_expression, $.directive_close),
    case_clause: $ => seq($.case_directive, repeat($._statement)),
    case_directive: $ => seq($.directive_open, 'CASE', $._value_expression, $.directive_close),
    default_clause: $ => seq($.default_directive, repeat($._statement)),
    default_directive: $ => seq($.directive_open, 'DEFAULT', $.directive_close),
    while_block: $ => seq($.while_directive, repeat($._statement), $.end_directive),
    while_directive: $ => seq($.directive_open, 'WHILE', $._value_expression, $.directive_close),
    block_block: $ => seq($.block_directive, repeat($._statement), $.end_directive),
    block_directive: $ => seq($.directive_open, 'BLOCK', $.identifier, $.directive_close),
    try_block: $ => seq($.try_directive, repeat($._statement), repeat($.catch_clause), $.end_directive),
    try_directive: $ => seq($.directive_open, 'TRY', $.directive_close),
    catch_clause: $ => seq($.catch_directive, repeat($._statement)),
    catch_directive: $ => seq($.directive_open, 'CATCH', optional($.identifier), $.directive_close),
    foreach_directive: $ => seq($.directive_open, 'FOREACH', field('iterator', $.variable), field('operator', choice('=', 'IN')), field('list', $._value_expression), $.directive_close),
    conditional_start_directive: $ => seq($.directive_open, choice('IF', 'UNLESS'), $._value_expression, $.directive_close),
    filter_start_directive: $ => seq($.directive_open, 'FILTER', $._value_expression, $.directive_close),
    elsif_directive: $ => seq($.directive_open, 'ELSIF', $._value_expression, $.directive_close),
    elsif_clause: $ => seq($.elsif_directive, repeat($._statement)),
    else_clause: $ => seq($.else_directive_marker, repeat($._statement)),
    else_directive_marker: $ => seq($.directive_open, 'ELSE', $.directive_close),
    end_directive: $ => seq($.directive_open, 'END', $.directive_close),
    inline_conditional: $ => seq(
      choice('IF', 'UNLESS'),
      $._value_expression,
      repeat(seq(';', $._directive_statement)),
      repeat($.inline_elsif_clause),
      optional($.inline_else_clause),
      ';', 'END'
    ),
    inline_elsif_clause: $ => seq(
      ';', 'ELSIF', $._value_expression,
      repeat(seq(';', $._directive_statement))
    ),
    inline_else_clause: $ => seq(
      ';', 'ELSE',
      repeat(seq(';', $._directive_statement))
    ),
    inline_foreach: $ => seq(
      'FOREACH',
      field('iterator', $.variable),
      field('operator', choice('=', 'IN')),
      field('list', $._value_expression),
      repeat(seq(';', $._directive_statement)),
      ';', 'END'
    ),
    _statement_list: $ => seq($._directive_statement, repeat(seq(optional(';'), $._directive_statement)), optional(';')),
    _directive_statement: $ => choice($.command_expression, $.assignment_expression, $.comment, $.inline_conditional, $.inline_foreach, $._value_expression),
    _value_expression: $ => choice(
      $.unary_expression,
      $.ternary_expression,
      $.binary_expression,
      $.filter_expression,
      $.call_expression,
      $.primary_expression
    ),
    unary_expression: $ => prec.right(9, seq(field('operator', '!'), field('operand', $._value_expression))),
    
    primary_expression: $ => choice(
      prec(1, $.variable),
      $.string,
      $.number,
      $.array,
      $.hash,
      $.parenthesized_expression
    ),
    
    call_expression: $ => prec(10, seq(
      field('function', $.primary_expression),
      field('arguments', $.argument_list)
    )),
    argument_list: $ => seq('(', optional(seq(choice($._value_expression, $.named_argument), repeat(seq(',', choice($._value_expression, $.named_argument))))), ')'),
    ternary_expression: $ => prec.right(-1, seq(
      field('condition', $._value_expression), '?',
      field('if_true', $._value_expression), ':',
      field('if_false', $._value_expression)
    )),
    parenthesized_expression: $ => seq('(', $._statement_list, ')'),
    command_expression: $ => choice(
      seq(choice('INCLUDE', 'PROCESS', 'WRAPPER', 'USE'), choice($.path, $.string, $.variable, $.call_expression), repeat(seq(optional(','), choice($.named_argument, $._value_expression)))),
      seq(choice('GET', 'CALL', 'NEXT', 'LAST', 'SET', 'FILTER'), repeat(choice($.named_argument, $._value_expression)))
    ),
    keyword: $ => choice('INCLUDE', 'USE', 'SET', 'GET', 'CALL', 'NEXT', 'FILTER'),
    named_argument: $ => seq($.identifier, choice('=', '=>'), $._value_expression),
    binary_expression: $ => choice(
      prec.left(5, seq(field('left', $._value_expression), field('operator', $.multiplicative_op), field('right', $._value_expression))),
      prec.left(4, seq(field('left', $._value_expression), field('operator', $.additive_op), field('right', $._value_expression))),
      prec.left(3, seq(field('left', $._value_expression), field('operator', '_'), field('right', $._value_expression))),
      prec.left(2, seq(field('left', $._value_expression), field('operator', $.logical_op_high), field('right', $._value_expression))),
      prec.left(1, seq(field('left', $._value_expression), field('operator', $.logical_op_low), field('right', $._value_expression))),
      prec.left(0, seq(field('left', $._value_expression), field('operator', $.comparison_operator), field('right', $._value_expression)))
    ),
    multiplicative_op: $ => choice('*', '/', '%'),
    additive_op: $ => choice('+', '-'),
    assignment_expression: $ => prec.right(0, seq($.variable, '=', $._value_expression)),
    filter_expression: $ => prec.left(1, seq($._value_expression, '|', choice($.identifier, seq($.identifier, $.argument_list)))),
    string: $ => choice(seq("'", /[^']*/, "'"), seq('"', /[^"]*/, '"')),
    number: $ => /\d+(\.\d+)?/,
    array: $ => seq('[', optional(seq($._value_expression, repeat(seq(',', $._value_expression)))), ']'),
    hash: $ => seq('{', optional(seq($.hash_pair, repeat(seq(',', $.hash_pair)))), '}'),
    hash_pair: $ => seq(field('key', choice($.identifier, $.string)), '=>', field('value', $._value_expression)),
    variable: $ => seq(choice($.identifier, $.dollar_interpolation), repeat(seq('.', choice($.identifier, $.interpolation, $.dollar_interpolation)))),
    interpolation: $ => seq('${', $._value_expression, '}'),
    dollar_interpolation: $ => seq('$', $.identifier),
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    path: $ => seq(choice($.identifier, $.dollar_interpolation), repeat1(seq(choice('.', '/'), choice($.identifier, $.dollar_interpolation)))),
    comparison_operator: $ => choice('==', '!=', '<', '<=', '>', '>='),
    logical_op_high: $ => choice('&&', 'AND', 'and'),
    logical_op_low: $ => choice('||', 'OR', 'or'),
  }
});
