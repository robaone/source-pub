#!/bin/bash

if [ "$EVENT" != "pull_request" ]; then
  echo "Not applicable"
  exit 0
fi
if [ "$PACKAGE_PATH" == "" ]; then
  PACKAGE_PATH=.
fi
if [ "$SCRIPT_PATH" == "" ]; then
  SCRIPT_PATH=$(dirname $0)
fi
if [ "$CURRENT_BRANCH" == "" ]; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD);
fi
PARSED_BRANCH_VERSION=$(echo $CURRENT_BRANCH | sed -E 's/(release|hotfix)\/v//')
if [ "$TARGET_BRANCH" == "" ]; then
  echo "Target branch is not specified in TARGET_BRANCH environment variable"
  exit 1
fi
if [ "$TARGET_BRANCH" != "main" ]; then
  echo "Nothing to do here"
  exit 0
fi
PACKAGE_VERSION=$(jq -r .version $PACKAGE_PATH/package.json);
if [ "$NEXT_PREDICTED_RELEASE" == "" ]; then
  NEXT_PREDICTED_RELEASE=$($SCRIPT_PATH/git_predict_next_version.sh)
fi
if [ "$NEXT_PREDICTED_RELEASE" != "$PACKAGE_VERSION" ]; then
  echo "Release Version = $NEXT_PREDICTED_RELEASE";
  echo "Package Version = $PACKAGE_VERSION";
  echo "
See: https://github.com/casechek/Answers/discussions/158"
  exit 1
else
  echo "Everyting is good.  Ready to release"
  figlet "version $PACKAGE_VERSION"
fi
