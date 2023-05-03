#!/bin/bash

PR_INFO="$(gh pr view $EVENT_NUMBER --json body)"
echo "## PR Info" >&2
echo "$PR_INFO" | jq -r '.body' >&2
SKIP_CD=$(echo "$PR_INFO" | jq -r '.body' | grep '\[x\] Skip CD')
if [ "$SKIP_CD" == "" ]; then
  echo "Skip CD is not set" >&2
  echo "false"
else
  echo "Skip CD is set" >&2
  echo "true"
fi
