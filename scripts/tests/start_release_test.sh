#!/bin/bash

CMD=$1

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

echo Scenario: Start a release by creating the release branch and the pull requests

# GIVEN

export PREDICTED_VERSION=1.0.0
export ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"stdout":"","exit":1},{"stdout":""},{"stdout":""},{"stdout":""},{"stdout":"CREATED"},{"stdout":""},{"stdout":"CREATED"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export GIT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export GH_PATH=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert_equals "checkout release/v1.0.0
checkout -b release/v1.0.0
push -u origin release/v1.0.0
pr list --base main --head release/v1.0.0 --json number --jq .[0].number
pr create --base main --head release/v1.0.0 --title release v1.0.0 to main --body Release v1.0.0
pr list --base develop --head release/v1.0.0 --json number --jq .[0].number
pr create --base develop --head release/v1.0.0 --title release v1.0.0 to develop ↣ --body Release v1.0.0" "$(cat $ARGUMENT_FILE)"

echo Scenario: Start a release by creating the release branch and the pull requests where the release branch already exists

# GIVEN

export PREDICTED_VERSION=1.0.0
export ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"stdout":"","exit":0},{"stdout":""},{"stdout":""},{"stdout":"CREATED"},{"stdout":""},{"stdout":"CREATED"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export GIT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export GH_PATH=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert_equals "checkout release/v1.0.0
push -u origin release/v1.0.0
pr list --base main --head release/v1.0.0 --json number --jq .[0].number
pr create --base main --head release/v1.0.0 --title release v1.0.0 to main --body Release v1.0.0
pr list --base develop --head release/v1.0.0 --json number --jq .[0].number
pr create --base develop --head release/v1.0.0 --title release v1.0.0 to develop ↣ --body Release v1.0.0" "$(cat $ARGUMENT_FILE)"

echo Scenario: Start a release by creating the release branch and the pull requests where the release branch already exists and the pull request to main already exists

# GIVEN

export PREDICTED_VERSION=1.0.0
export ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"stdout":"","exit":0},{"stdout":""},{"stdout":"47"},{"stdout":""},{"stdout":"CREATED"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export GIT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export GH_PATH=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert_equals "checkout release/v1.0.0
push -u origin release/v1.0.0
pr list --base main --head release/v1.0.0 --json number --jq .[0].number
pr list --base develop --head release/v1.0.0 --json number --jq .[0].number
pr create --base develop --head release/v1.0.0 --title release v1.0.0 to develop ↣ --body Release v1.0.0" "$(cat $ARGUMENT_FILE)"

echo Scenario: Start a release by creating the release branch and the pull requests where the release branch already exists and the pull request to develop already exists

# GIVEN

export PREDICTED_VERSION=1.0.0
export ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"stdout":"","exit":0},{"stdout":""},{"stdout":""},{"stdout":"CREATED"},{"stdout":"47"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export GIT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export GH_PATH=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert_equals "checkout release/v1.0.0
push -u origin release/v1.0.0
pr list --base main --head release/v1.0.0 --json number --jq .[0].number
pr create --base main --head release/v1.0.0 --title release v1.0.0 to main --body Release v1.0.0
pr list --base develop --head release/v1.0.0 --json number --jq .[0].number" "$(cat $ARGUMENT_FILE)"


echo Scenario: Start a release by creating the release branch and the pull requests where the release branch already exists and the pull requests already exist

# GIVEN

export PREDICTED_VERSION=1.0.0
export ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"stdout":"","exit":0},{"stdout":""},{"stdout":"47"},{"stdout":"47"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export GIT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export GH_PATH=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert_equals "checkout release/v1.0.0
push -u origin release/v1.0.0
pr list --base main --head release/v1.0.0 --json number --jq .[0].number
pr list --base develop --head release/v1.0.0 --json number --jq .[0].number" "$(cat $ARGUMENT_FILE)"
