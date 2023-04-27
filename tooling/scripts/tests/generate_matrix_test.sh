#!/bin/bash

CMD=$1

SCRIPT_DIR=$(cd $(dirname $0); pwd)

function assert_equals {
  if [ "$1" != "$2" ]; then
    echo "Expected $1 but got $2"
    exit 1
  else
    echo "OK"
  fi
}

echo Scenario: Generate a matrix object string from the default OS

# GIVEN

unset DEFAULT_OS
export PROJECTS="GithubWebhook
OtherProject"
export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_TRACKING_FILE=$(mktemp)
export MOCK_RESPONSES='[]'
export FILE_EXISTS_CMD=$SCRIPT_DIR/mock_cmd.sh
export JQ_CMD=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN
assert_equals '{"include":[{"project":"GithubWebhook","os":"ubuntu-latest"},{"project":"OtherProject","os":"ubuntu-latest"}]}' "$ACTUAL_RESULT"


echo Scenario: Generate a matrix object string from a default OS

# GIVEN

export DEFAULT_OS="ubuntu-22.04"
export PROJECTS="GithubWebhook
OtherProject"
export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_TRACKING_FILE=$(mktemp)
export MOCK_RESPONSES='[]'
export FILE_EXISTS_CMD=$SCRIPT_DIR/mock_cmd.sh
export JQ_CMD=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN
assert_equals '{"include":[{"project":"GithubWebhook","os":"ubuntu-22.04"},{"project":"OtherProject","os":"ubuntu-22.04"}]}' "$ACTUAL_RESULT"

echo Scenario: Generate a matrix object string from 2 targets with 2 OSes

# GIVEN

export DEFAULT_OS="ubuntu-22.04"
export PROJECTS="GithubWebhook
OtherProject"
export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_TRACKING_FILE=$(mktemp)
export MOCK_RESPONSES='[{"stdout":"1"},{"stdout":"ubuntu-22.04"},{"exit":1},{"stdout":"1"},
{"stdout":"[]"},
{"stdout":"1"},{"stdout":"ubuntu-22.04"},{"exit":1},{"stdout":"1"},
{"stdout":"[{\"os\":\"macos-latest\",\"target\":\"ios\"},\"web\"]"}]'
export FILE_EXISTS_CMD=$SCRIPT_DIR/mock_cmd.sh
export JQ_CMD=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN
assert_equals '{"include":[{"project":"GithubWebhook","os":"ubuntu-22.04"},{"project":"OtherProject","os":"macos-latest","target":"ios"},{"project":"OtherProject","os":"ubuntu-22.04","target":"web"}]}' "$ACTUAL_RESULT"
