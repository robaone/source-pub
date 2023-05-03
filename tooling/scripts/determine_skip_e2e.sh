#!/bin/bash

PR_INFO="$(gh pr view $EVENT_NUMBER --json body)"
echo "## PR Info" >&2
echo "$PR_INFO" | jq -r '.body' >&2
SKIP_E2E=$(echo "$PR_INFO" | jq -r '.body' | grep '\[x\] Skip e2e')
if [ "$SKIP_E2E" == "" ]; then
  echo "Skip E2E is not set" >&2
  echo "false"
else
  echo "Skip E2E is set" >&2
  echo "true"
fi
