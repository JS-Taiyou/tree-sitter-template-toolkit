#include <tree_sitter/parser.h>

enum TokenType {
  CONTENT,
};

void *tree_sitter_template_toolkit_external_scanner_create(void) {
  return NULL;
}

void tree_sitter_template_toolkit_external_scanner_destroy(void *payload) {
}

unsigned tree_sitter_template_toolkit_external_scanner_serialize(void *payload, char *buffer) {
  return 0;
}

void tree_sitter_template_toolkit_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
}

bool tree_sitter_template_toolkit_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  if (!valid_symbols[CONTENT]) return false;
  if (lexer->eof(lexer)) return false;

  bool advanced = false;

  while (!lexer->eof(lexer)) {
    if (lexer->lookahead == '[') {
      lexer->advance(lexer, false);
      if (lexer->eof(lexer)) {
        lexer->mark_end(lexer);
        return true;
      }
      if (lexer->lookahead == '%') {
        return advanced;
      }
      if (lexer->lookahead == '-') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == '%') {
          return advanced;
        }
        advanced = true;
        lexer->mark_end(lexer);
        continue;
      }
      advanced = true;
      lexer->mark_end(lexer);
      continue;
    }
    lexer->advance(lexer, false);
    advanced = true;
    lexer->mark_end(lexer);
  }

  return advanced;
}
