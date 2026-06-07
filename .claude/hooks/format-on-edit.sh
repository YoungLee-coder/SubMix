#!/bin/bash
# Format the just-edited file with whatever formatter is installed for its type.
# Invoked by .claude/settings.json as a PostToolUse hook on Edit|MultiEdit|Write.
# Stdin is the Claude Code hook payload (JSON). Failures must never block the edit.

set -u

# Need jq to read the payload. No jq -> do nothing, quietly.
command -v jq > /dev/null 2>&1 || exit 0

FILE=$(jq -r '.tool_input.file_path // empty' 2> /dev/null || true)
[[ -z "$FILE" ]] && exit 0
[[ ! -f "$FILE" ]] && exit 0

have() { command -v "$1" > /dev/null 2>&1; }

case "$FILE" in
    *.js | *.jsx | *.ts | *.tsx | *.mjs | *.cjs | *.json | *.css | *.scss | *.html | *.md | *.yaml | *.yml | *.vue | *.svelte)
        if have prettier; then
            prettier --write "$FILE" > /dev/null 2>&1 || true
        elif have npx; then
            npx --no-install prettier --write "$FILE" > /dev/null 2>&1 || true
        fi
        ;;
    *.go)
        if have goimports; then
            goimports -w "$FILE" > /dev/null 2>&1 || true
        elif have gofmt; then
            gofmt -w "$FILE" > /dev/null 2>&1 || true
        fi
        ;;
    *.py)
        if have ruff; then
            ruff format "$FILE" > /dev/null 2>&1 || true
            ruff check --fix "$FILE" > /dev/null 2>&1 || true
        elif have black; then
            black "$FILE" > /dev/null 2>&1 || true
        fi
        ;;
    *.rs)
        have rustfmt && rustfmt "$FILE" > /dev/null 2>&1 || true
        ;;
    *.sh | *.bash)
        have shfmt && shfmt -w "$FILE" > /dev/null 2>&1 || true
        ;;
    *.c | *.h | *.cc | *.cpp | *.hpp | *.cxx)
        have clang-format && clang-format -i "$FILE" > /dev/null 2>&1 || true
        ;;
    *.rb)
        have rubocop && rubocop -A "$FILE" > /dev/null 2>&1 || true
        ;;
esac

exit 0
