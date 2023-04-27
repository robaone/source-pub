#!/bin/bash

if [ "$CURL_PATH" == "" ]; then
  CURL_PATH=$(which curl)
fi

if [ "$OWNER" == "" ]; then
  echo "OWNER is required"
  exit 1
fi

if [ "$GITHUB_TOKEN" != "" ]; then
  ACCESS_TOKEN=$GITHUB_TOKEN
fi

if [ "$OWNER" == "" ]; then
  echo "OWNER is required"
  exit 1
fi

if [ "$REPO" == "" ]; then
  echo "REPO is required"
  exit 1
fi

if [ "$WORKFLOW_NAME" == "" ]; then
  echo "WORKFLOW_NAME is required"
  exit 1
fi

if [ "$BRANCH_NAME" == "" ]; then
  echo "BRANCH_NAME is required"
  exit 1
fi

if [ "$SLEEP_TIME" == "" ]; then
  SLEEP_TIME=5
fi

if [ "$HEAD_SHA" == "" ]; then
  HEAD_SHA=$(git rev-parse HEAD)
fi

function get_workflow_id() {
  local name="$1"
  local response="$($CURL_PATH \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    https://api.github.com/repos/$OWNER/$REPO/actions/workflows 2>/dev/null)"
  echo $response | jq ".workflows | .[] | select(.name==\"$WORKFLOW_NAME\") | .id"
}

function trigger_workflow_dispatch() {
  local workflow_id="$1"
  local branch_name="$2"
  # Trigger the workflow dispatch
  $CURL_PATH -X POST \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$workflow_id/dispatches \
    -d '{"ref":"'$branch_name'"}' 2>/dev/null
  if [ "$?" != "0" ]; then
    echo "Failed to trigger workflow dispatch"
    exit 1
  fi
}

function wait_for_workflow_to_complete() {
  local run_id="$1"
  # Wait for the workflow run to complete
  while true; do
    status=$($CURL_PATH -s -H "Authorization: Bearer $ACCESS_TOKEN" https://api.github.com/repos/$OWNER/$REPO/actions/runs/$run_id | jq -r '.conclusion')
    echo "Workflow status: $status" >&2
    if [ "$status" != "null" ]; then
      break
    fi
    sleep $SLEEP_TIME
  done
}

function get_workflow_dispatch_run_id() {
  local workflow_id="$1"
  local branch_name="$2"
  local utc_date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  # Find the run id of the workflow dispatch
  echo "Finding workflow run id by calling https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$workflow_id/runs?head_sha=$HEAD_SHA" >&2
  local result="$($CURL_PATH \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    "https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$workflow_id/runs?head_sha=$HEAD_SHA" 2>/dev/null)"
  if [ "$?" == "0" ]; then
    echo "Filtering workflow runs by event=workflow_dispatch and head_sha=$HEAD_SHA" >&2
    echo $result >&2
    local workflow_info=$(echo "$result" | jq ".workflow_runs[] | select(.event == \"workflow_dispatch\") | select(.head_sha == \"$HEAD_SHA\") | {\"id\":.id, \"created_at\":.created_at}")
    echo "Workflow info: $workflow_info" >&2
    local run_id=$(echo $workflow_info | jq ".id" | head -n 1)
    echo $run_id
  else
    echo "Failed to find workflow run id"
    exit 1
  fi
}

WORKFLOW_ID=$(get_workflow_id "$WORKFLOW_NAME")
echo "Trigging workflow $WORKFLOW_NAME with id $WORKFLOW_ID" >&2
trigger_workflow_dispatch $WORKFLOW_ID $BRANCH_NAME

# try 5 times
for i in {1..5}; do
  if [ "$run_id" != "" ]; then
    break
  fi
  sleep $SLEEP_TIME
  run_id=$(get_workflow_dispatch_run_id $WORKFLOW_ID $BRANCH_NAME)
done

if [ "$run_id" == "" ]; then
  echo "Failed to find workflow run id"
  exit 1
fi

echo "Workflow run id: $run_id" >&2

# Wait for all workflow ids to complete
wait_for_workflow_to_complete $run_id

# Exit with the appropriate status code
if [ "$status" == "success" ]; then
  echo "Workflow run $run_id completed successfully ✅"
  exit 0
else
  echo "Workflow run $run_id failed ❌"
  exit 1
fi
