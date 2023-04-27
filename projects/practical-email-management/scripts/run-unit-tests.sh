#!/bin/bash

SCRIPT_DIR=$(cd $(dirname $0); pwd)

export OWNER=robaone
export REPO=source-pub
export WORKFLOW_NAME="Practical Email Management"

$SCRIPT_DIR/../../../tooling/scripts/gh_trigger_workflow_dispatch.sh
exit $?
