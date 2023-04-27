#!/bin/bash

CMD=$1

if [ "$CMD" == "" ]; then
    echo "Usage: $0 [command]"
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

SCRIPT_DIR=$(cd $(dirname $0); pwd)

echo Scenario: Build the list of projects that depend on the given files

# GIVEN

PROJECT2_DEPENDS_CONTENTS="projects/project1/*"

export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"stdout":"projects/project2/.depends"},{"stdout":"'$PROJECT2_DEPENDS_CONTENTS'"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export FIND_PATH="$SCRIPT_DIR/mock_cmd.sh"
export CAT_PATH="$SCRIPT_DIR/mock_cmd.sh"

FILES="projects/project1/file1.txt
README.md"
EXPECTED_RESULTS="project2"

# WHEN

ACTUAL_RESULT="$(echo "$FILES" | $CMD)"

# THEN

assert_equals "$EXPECTED_RESULTS" "$ACTUAL_RESULT"

echo Scenario: Build the list of projects that depend on the given files with root .depends file

# GIVEN

PROJECT2_DEPENDS_CONTENTS="projects/project1/*"
ROOT_DEPENDS_CONTENTS=".github/workflows/*\ntooling/scripts/*"

export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"stdout":"projects/project2/.depends"},{"stdout":"1"},{"stdout":"'$PROJECT2_DEPENDS_CONTENTS'"},{"stdout":"'$ROOT_DEPENDS_CONTENTS'"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export FIND_PATH="$SCRIPT_DIR/mock_cmd.sh"
export CAT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export FILE_EXISTS_CMD="$SCRIPT_DIR/mock_cmd.sh"

FILES=".github/workflows/git-flow.yml
projects/project1/file1.txt
README.md"
EXPECTED_RESULTS="project2
.."

# WHEN

ACTUAL_RESULT="$(echo "$FILES" | $CMD)"

# THEN

assert_equals "$EXPECTED_RESULTS" "$ACTUAL_RESULT"
