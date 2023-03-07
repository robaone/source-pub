#!/bin/bash

# This script tests the parse_file_list_for_projects.sh script

CMD=$1

if [ "$CMD" == "" ]; then
  echo "You must provide a command to run"
  exit 1
fi

function assert_equals {
  if [ "$1" != "$2" ]; then
    echo "Expected: $1"
    echo "Actual:   $2"
    exit 1
  else
    echo "OK"
  fi
}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo Scenario: No Files

# GIVEN

INPUT=""
EXPECTED_RESULT="You must provide a list of files"

# WHEN

ACTUAL_RESULT="$(echo "$INPUT" | eval $CMD)"

# THEN

assert_equals "1" "$?"
assert_equals "$EXPECTED_RESULT" "$ACTUAL_RESULT"

echo Scenario: Project files

# GIVEN

INPUT=".github/workflows/git-flow.yml
projects/GithubWebhook/README.md
projects/GithubWebhook/src/index.ts
projects/Other/README.md
docs/adr/0001-architecture-decision-record.md
README.md"
EXPECTED_RESULT="GithubWebhook
Other"
export MOCK_ARGUMENT_FILE="$(mktemp)"
export MOCK_RESPONSES='[{"stdout":"1"},{"stdout":"1"}]'
export MOCK_TRACKING_FILE="$(mktemp)"
export FOLDER_EXISTS_CMD=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT="$(echo "$INPUT" | eval $CMD)"

# THEN

assert_equals "0" "$?"
assert_equals "$EXPECTED_RESULT" "$ACTUAL_RESULT"
