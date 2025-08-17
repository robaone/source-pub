#!/bin/bash

CMD=$1

function assert_equals {
  if [ "$1" != "$2" ]; then
    echo "Expected $1 but got $2"
    exit 1
  else
    echo "OK"
  fi
}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo Scenario: Get the latest version on no tags

## GIVEN

export MOCK_ARGUMENT_FILE="$(mktemp)"
export MOCK_TRACKING_FILE="$(mktemp)"
export VERSIONS="\n"
export MOCK_RESPONSES='[{"stdout":"'${VERSIONS}'"}]'
export GIT_CMD_PATH="$SCRIPT_DIR/mock_cmd.sh"
EXPECTED_RESULT=

## WHEN

ACTUAL_RESULT=$(eval $CMD)

## THEN

assert_equals $EXPECTED_RESULT $ACTUAL_RESULT

echo Scenario: Get the latest version from invalid tags

## GIVEN

export MOCK_ARGUMENT_FILE="$(mktemp)"
export MOCK_TRACKING_FILE="$(mktemp)"
export VERSIONS="invalid"
export MOCK_RESPONSES='[{"stdout":"'${VERSIONS}'"}]'
export GIT_CMD_PATH="$SCRIPT_DIR/mock_cmd.sh"

EXPECTED_RESULT=

## WHEN

ACTUAL_RESULT=$(eval $CMD)

## THEN

assert_equals $EXPECTED_RESULT $ACTUAL_RESULT

echo Scenario: Get the latest version from valid tags

## GIVEN

export VERSIONS="v1.0.0\nv0.9.0\nv0.10.0\nv0.0.2500"
export MOCK_ARGUMENT_FILE="$(mktemp)"
export MOCK_TRACKING_FILE="$(mktemp)"
export MOCK_RESPONSES='[{"stdout":"'${VERSIONS}'"}]'
export GIT_CMD_PATH="$SCRIPT_DIR/mock_cmd.sh"

EXPECTED_RESULT=1.0.0

## WHEN

ACTUAL_RESULT=$(eval $CMD)

## THEN

assert_equals $EXPECTED_RESULT $ACTUAL_RESULT

echo Scenario: Get the latest version from combination of tags

## GIVEN

export VERSIONS="v1.0.0\nmy-change\nv0.9.0\nsomething-else-v2.0.0\nv0.10.0\nv0.0.2500\nv1.2.0-develop.1"
export MOCK_ARGUMENT_FILE="$(mktemp)"
export MOCK_TRACKING_FILE="$(mktemp)"
export MOCK_RESPONSES='[{"stdout":"'${VERSIONS}'"}]'
export GIT_CMD_PATH="$SCRIPT_DIR/mock_cmd.sh"

EXPECTED_RESULT=1.0.0

## WHEN

ACTUAL_RESULT=$(eval $CMD)

## THEN

assert_equals $EXPECTED_RESULT $ACTUAL_RESULT