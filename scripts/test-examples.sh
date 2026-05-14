#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TREE_SITTER="$PROJECT_ROOT/node_modules/.bin/tree-sitter"
EXAMPLES_DIR="$PROJECT_ROOT/test-examples"

cd "$PROJECT_ROOT"

PASS=0
FAIL=0

for file in "$EXAMPLES_DIR"/*.tt "$EXAMPLES_DIR"/*.tt2; do
    [ -f "$file" ] || continue
    
    name=$(basename "$file")
    output=$("$TREE_SITTER" parse "$file" 2>&1) || true
    
    if echo "$output" | grep -q "ERROR"; then
        echo "FAIL  $name"
        echo "  $(echo "$output" | grep -c "ERROR") ERROR(s) found"
        FAIL=$((FAIL + 1))
    else
        echo "PASS  $name"
        PASS=$((PASS + 1))
    fi
done

echo ""
echo "==================="
echo "PASS: $PASS"
echo "FAIL: $FAIL"
echo "==================="

[ $FAIL -eq 0 ]
