#!/bin/bash

CMD=$1

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

function assert() {
  if [ "$1" != "$2" ]; then
    echo "Expected: $2"
    echo "Actual:   $1"
    exit 1
  else
    echo "OK"
  fi
}

echo "Scenario: trigger workflow dispatch"

# GIVEN

export CURL_PATH="$SCRIPT_DIR/mock_cmd.sh"
export REPO=repo
export WORKFLOW_NAME=workflow
export GITHUB_TOKEN=token
export BRANCH_NAME=branch
export MOCK_ARGUMENT_FILE="$(mktemp)"
export MOCK_RESPONSES='[{"stdout": "{\"id\":1234}"},{"stdout":"{}"},{"stdout":"{\"conclusion\":\"success\"}"}]'
export MOCK_TRACKING_FILE="$(mktemp)"

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert "$(cat $MOCK_ARGUMENT_FILE)" "-X POST -H Accept: application/vnd.github.v3+json -H Authorization: Bearer token https://api.github.com/repos/casechek/repo/actions/workflows/workflow/dispatches -d {\"ref\":\"branch\"}
-s -H Authorization: Bearer token https://api.github.com/repos/casechek/repo/actions/runs/1234
-s -H Authorization: Bearer token https://api.github.com/repos/casechek/repo/actions/runs/1234"
