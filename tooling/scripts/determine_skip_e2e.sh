#!/bin/bash

gh pr view $EVENT_NUMBER --json body > pr_info.json
echo "## PR Info" >&2
cat pr_info.json | jq -r '.body' >&2
SKIP_E2E=$(cat pr_info.json | jq -r '.body' | grep '\[x\] Skip e2e')
if [ "$SKIP_E2E" == "" ]; then
  echo "Skip E2E is not set" >&2
  echo "false"
else
  echo "Skip E2E is set" >&2
  echo "true"
fi
