#!/bin/bash

CMD=$1

if [ "$CMD" == "" ]; then
  echo "usage: $0 [command]"
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

echo Scenario: Start a hotfix by creating the hotfix branch and the pull requests

# GIVEN

export PREDICTED_VERSION=1.0.0
export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"exit":1},{},{},{},{"stdout":"CREATED"},{},{"stdout":"CREATED"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export GIT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export GH_PATH=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert_equals "checkout hotfix/v1.0.0
checkout -b hotfix/v1.0.0
push -u origin hotfix/v1.0.0
pr list --base main --head hotfix/v1.0.0 --json number --jq .[0].number
pr create --base main --head hotfix/v1.0.0 --title hotfix v1.0.0 to main --body Hotfix v1.0.0
pr list --base develop --head hotfix/v1.0.0 --json number --jq .[0].number
pr create --base develop --head hotfix/v1.0.0 --title hotfix v1.0.0 to develop ↣ --body Hotfix v1.0.0" "$(cat $MOCK_ARGUMENT_FILE)"

echo Scenario: Start a hotfix by creating the hotfix branch and the pull requests where the hotfix branch already exists

# GIVEN

export PREDICTED_VERSION=1.0.0
export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"exit":0},{},{},{"stdout":"CREATED"},{},{"stdout":"CREATED"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export GIT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export GH_PATH=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert_equals "checkout hotfix/v1.0.0
push -u origin hotfix/v1.0.0
pr list --base main --head hotfix/v1.0.0 --json number --jq .[0].number
pr create --base main --head hotfix/v1.0.0 --title hotfix v1.0.0 to main --body Hotfix v1.0.0
pr list --base develop --head hotfix/v1.0.0 --json number --jq .[0].number
pr create --base develop --head hotfix/v1.0.0 --title hotfix v1.0.0 to develop ↣ --body Hotfix v1.0.0" "$(cat $MOCK_ARGUMENT_FILE)"

echo Scenario: Start a hotfix by creating the hotfix branch and the pull requests where the hotfix branch already exists and the pull request to main already exists

# GIVEN

export PREDICTED_VERSION=1.0.0
export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{},{},{"stdout":"47"},{},{"stdout":"CREATED"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export GIT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export GH_PATH=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert_equals "checkout hotfix/v1.0.0
push -u origin hotfix/v1.0.0
pr list --base main --head hotfix/v1.0.0 --json number --jq .[0].number
pr list --base develop --head hotfix/v1.0.0 --json number --jq .[0].number
pr create --base develop --head hotfix/v1.0.0 --title hotfix v1.0.0 to develop ↣ --body Hotfix v1.0.0" "$(cat $MOCK_ARGUMENT_FILE)"

echo Scenario: Start a hotfix by creating the hotfix branch and the pull requests where the hotfix branch already exists and the pull request to develop already exists

# GIVEN

export PREDICTED_VERSION=1.0.0
export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"exit":0},{},{},{"stdout":"CREATED"},{"stdout":"47"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export GIT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export GH_PATH=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert_equals "checkout hotfix/v1.0.0
push -u origin hotfix/v1.0.0
pr list --base main --head hotfix/v1.0.0 --json number --jq .[0].number
pr create --base main --head hotfix/v1.0.0 --title hotfix v1.0.0 to main --body Hotfix v1.0.0
pr list --base develop --head hotfix/v1.0.0 --json number --jq .[0].number" "$(cat $MOCK_ARGUMENT_FILE)"


echo Scenario: Start a hotfix by creating the hotfix branch and the pull requests where the hotfix branch already exists and the pull requests already exist

# GIVEN

export PREDICTED_VERSION=1.0.0
export MOCK_ARGUMENT_FILE=$(mktemp)
export MOCK_RESPONSES='[{"exit":0},{},{"stdout":"47"},{"stdout":"47"}]'
export MOCK_TRACKING_FILE=$(mktemp)
export GIT_PATH="$SCRIPT_DIR/mock_cmd.sh"
export GH_PATH=$SCRIPT_DIR/mock_cmd.sh

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert_equals "checkout hotfix/v1.0.0
push -u origin hotfix/v1.0.0
pr list --base main --head hotfix/v1.0.0 --json number --jq .[0].number
pr list --base develop --head hotfix/v1.0.0 --json number --jq .[0].number" "$(cat $MOCK_ARGUMENT_FILE)"
