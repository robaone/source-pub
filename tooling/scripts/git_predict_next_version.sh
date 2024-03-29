#!/bin/bash

BASE_FOLDER=$(dirname $BASH_SOURCE)
if [ "$CURRENT_VERSION" == "" ] && [ "$TESTING" != "true" ]; then
  CURRENT_VERSION=$($BASE_FOLDER/git_latest_version_tag.sh)
fi

if [ "$CURRENT_VERSION" == "" ]; then
  echo "1.0.0"
  exit 0
fi

IFS='.' read -a version_parts <<< "$CURRENT_VERSION"

major=${version_parts[0]}
minor=${version_parts[1]}
patch=${version_parts[2]}
git fetch

function get_logs() {
  if [ "$GIT_LOGS" == "" ]; then
    git log origin/main..
  else
    echo "$GIT_LOGS"
  fi
}

if [ "$(get_logs | grep "^\s*BREAKING CHANGE:")" != "" ]; then
  major=$((major+1))
  minor=0
  patch=0
elif [ "$(get_logs | grep "^\s*feat[(:]")" != "" ]; then
  minor=$((minor+1))
  patch=0
elif [ "$(get_logs | grep "^\s*fix[(:]")" != "" ]; then
  patch=$((patch+1))
fi

echo "$major.$minor.$patch"
