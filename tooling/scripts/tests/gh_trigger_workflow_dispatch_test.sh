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
export SLEEP_TIME=0
export OWNER=owner
export HEAD_SHA=sha
export MOCK_ARGUMENT_FILE="$(mktemp)"
export MOCK_TRACKING_FILE=$(mktemp)
export MOCK_RESPONSES='[{"stdout":"{\"workflows\":[{\"name\":\"workflow\",\"id\":1234}]}"},{},{"stdout":"{\"workflow_runs\":[{\"id\":1234,\"event\":\"workflow_dispatch\",\"created_at\":\"2023-04-27T17:59:29Z\",\"head_sha\":\"'$HEAD_SHA'\"}]}"},{"stdout":"{}"},{"stdout":"{\"conclusion\":\"success\"}"}]'

# WHEN

ACTUAL_RESULT=$($CMD)

# THEN

assert "$(cat $MOCK_ARGUMENT_FILE)" "-H Accept: application/vnd.github.v3+json -H Authorization: Bearer token https://api.github.com/repos/owner/repo/actions/workflows
-X POST -H Accept: application/vnd.github.v3+json -H Authorization: Bearer token https://api.github.com/repos/owner/repo/actions/workflows/1234/dispatches -d {\"ref\":\"branch\"}
-H Accept: application/vnd.github.v3+json -H Authorization: Bearer token https://api.github.com/repos/owner/repo/actions/workflows/1234/runs?branch=branch
-s -H Authorization: Bearer token https://api.github.com/repos/owner/repo/actions/runs/1234
-s -H Authorization: Bearer token https://api.github.com/repos/owner/repo/actions/runs/1234"
assert "Workflow run 1234 completed successfully ✅" "$ACTUAL_RESULT"
