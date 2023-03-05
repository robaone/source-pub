#!/bin/bash

CMD=$1

function assert_equals() {
  if [ "$1" != "$2" ]; then
    echo "Expected: $1"
    echo "Actual:   $2"
    exit 1
  else
    echo "OK"
  fi
}

SCRIPT_DIR=$(cd $(dirname $0); pwd)

echo Scenario: Start a feature by creating a new branch

# GIVEN
export FEATURE_NAME="My Feature"
export TICKET_ID="1"

# a temp file to store the argument file
export ARGUMENT_FILE1=$(mktemp)
export MOCK_RESPONSE1=""
export GIT_PATH=$SCRIPT_DIR/capture_arguments1.sh

# WHEN
ACTUAL_RESULT=$($CMD)

# THEN
assert_equals "checkout develop
pull
checkout -b feature/1-my-feature" "$(cat $ARGUMENT_FILE1)"
