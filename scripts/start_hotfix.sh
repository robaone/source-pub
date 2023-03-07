#!/bin/bash

# This script to create a hotfix branch if it does not exist by using
# the next predicted version.
# It will push the branch to the remote repository and
# create a pull request that targets the main branch and a pull request
# that targets the develop branch.

SCRIPT_DIR="$(cd $(dirname $0); pwd)"

if [ "$PREDICTED_VERSION" == "" ]; then
  PREDICTED_VERSION=$($SCRIPT_DIR/git_predict_next_version.sh)
fi

if [ "$GIT_PATH" == "" ]; then
  GIT_PATH=$(which git)
fi

if [ "$GH_PATH" == "" ]; then
  GH_PATH=$(which gh)
fi

# create a new branch if it does not exist or switch to it if it does
$GIT_PATH checkout hotfix/v$PREDICTED_VERSION || $GIT_PATH checkout -b hotfix/v$PREDICTED_VERSION
if [ "$?" != "0" ]; then
  exit 1
fi

# push the branch to the remote repository
$GIT_PATH push -u origin hotfix/v$PREDICTED_VERSION
if [ "$?" != "0" ]; then
  exit 1
fi

# create a pull request that targets the main branch if it does not exist
function pull_request_exists() {
  local branch=$1
  local target_branch=$2
  # use gh to check if the pull request exists
  local pull_request=$($GH_PATH pr list --base $target_branch --head $branch --json number --jq '.[0].number')
  if [ "$?" != "0" ]; then
    exit 1
  fi
  if [ "$pull_request" == "" ]; then
    echo "false"
  else
    echo "true"
  fi
}

function create_pull_request() {
  local branch=$1
  local target_branch=$2
  local title="$3"
  local body="$4"
  # use gh to create the pull request
  $GH_PATH pr create --base $target_branch --head $branch --title "$title" --body "$body"
}

if [ "$(pull_request_exists hotfix/v$PREDICTED_VERSION main)" == "false" ]; then
  create_pull_request hotfix/v$PREDICTED_VERSION main "hotfix v$PREDICTED_VERSION to main" "Hotfix v$PREDICTED_VERSION"
  if [ "$?" != "0" ]; then
    exit 1
  fi
fi

# create a pull request that targets the develop branch if it does not exist
if [ "$(pull_request_exists hotfix/v$PREDICTED_VERSION develop)" == "false" ]; then
  create_pull_request hotfix/v$PREDICTED_VERSION develop "hotfix v$PREDICTED_VERSION to develop ↣" "Hotfix v$PREDICTED_VERSION"
  if [ "$?" != "0" ]; then
    exit 1
  fi
fi

