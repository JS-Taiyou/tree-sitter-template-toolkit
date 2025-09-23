package tree_sitter_template_toolkit_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_template_toolkit "github.com/tree-sitter/tree-sitter-template_toolkit/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_template_toolkit.Language())
	if language == nil {
		t.Errorf("Error loading TemplateToolkit grammar")
	}
}
