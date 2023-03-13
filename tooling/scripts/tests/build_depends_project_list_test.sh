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

export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{}]'
export MOCK_TRACKING_FILE=$(mktemp)

EXPECTED_RESULTS="project1
project12"

# WHEN

ACTUAL_RESULT="$($CMD)"

# THEN

assert_equals "$EXPECTED_RESULTS" "$ACTUAL_RESULT"
