#!/bin/bash

SCRIPT_DIR=$(cd $(dirname $0); pwd)

export OWNER=roboane
export REPO=source-pub
export WORKFLOW_NAME="Practical Email Management"
export BRANCH_NAME=$(git branch --show-current)

bash -xv $SCRIPT_DIR/../../../tooling/scripts/gh_trigger_workflow_dispatch.sh
exit $?
