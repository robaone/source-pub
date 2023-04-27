#!/bin/bash

if [ "$CURL_PATH" == "" ]; then
  CURL_PATH=$(which curl)
fi

OWNER=casechek

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


# Trigger the workflow dispatch
response=$($CURL_PATH -X POST \
-H "Accept: application/vnd.github.v3+json" \
-H "Authorization: Bearer $ACCESS_TOKEN" \
https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$WORKFLOW_NAME/dispatches \
-d '{"ref":"'$BRANCH_NAME'"}')

# Get the run ID from the response
run_id=$(echo $response | jq -r '.id')

# Wait for the workflow run to complete
while true; do
  status=$($CURL_PATH -s -H "Authorization: Bearer $ACCESS_TOKEN" https://api.github.com/repos/$OWNER/$REPO/actions/runs/$run_id | jq -r '.conclusion')
  if [ "$status" != "null" ]; then
    break
  fi
  sleep 5
done

# Exit with the appropriate status code
if [ "$status" == "success" ]; then
  exit 0
else
  exit 1
fi
