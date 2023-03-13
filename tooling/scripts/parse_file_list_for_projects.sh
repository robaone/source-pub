#!/bin/bash

# This script takes a list of files and returns the project names for those files

# Example:
# echo "GithubWebhook/README.md" | parse_file_list_for_projects.sh
# GithubWebhook

INPUT="$(cat)"

if [ "$INPUT" == "" ]; then
  echo "You must provide a list of files"
  exit 1
fi

SCRIPT_DIR=$(cd $(dirname $0); pwd)

if [ "$BUILD_DEPENDS_PATH" == "" ]; then
  BUILD_DEPENDS_PATH="$SCRIPT_DIR/build_depends_project_list.sh"
fi

# for each line get the first folder name
FOLDERS="$(echo "$INPUT" | grep 'projects[/]' | sed 's/\// /g' | awk '{print $1 "/" $2}' | sort | uniq)"

# get list of folders triggered by dependencies
DEPENDS_FOLDERS="$(echo "$INPUT" | $BUILD_DEPENDS_PATH | awk '{print "projects/" $1}')"

# combine with FOLDERS and remove duplicates
FOLDERS="$(echo "$FOLDERS $DEPENDS_FOLDERS" | sort | uniq)"

# get list of folders that don't exist
# for each folder in FOLDERS
#  if folder doesn't exist
#    add to list
function folder_exists() {
  local FOLDER=$1
  if [ "$FOLDER_EXISTS_CMD" != "" ]; then
    $FOLDER_EXISTS_CMD "$FOLDER"
    return $?
  else
    if [ -d "$FOLDER" ]; then
      echo 1
    else
      echo 0
    fi
  fi
}

if [ "$FOLDERS_THAT_DONT_EXIST" == "" ]; then
  for FOLDER in $FOLDERS
  do
    if [ "$(folder_exists "$FOLDER")" == "0" ]; then
      FOLDERS_THAT_DONT_EXIST="$FOLDERS_THAT_DONT_EXIST $FOLDER"
    fi
  done
fi

IGNORE_LIST="$IGNORE_LIST $FOLDERS_THAT_DONT_EXIST"

function folder_is_in_list() {
  local FOLDER=$1
  local LIST="$2"
  for IGNORE in $LIST
  do
    if [ "$FOLDER" == "$IGNORE" ]; then
      echo 0
    fi
  done
  echo 1
}
NEW_FOLDERS=""

for FOLDER in $FOLDERS
do
  if [ "$(folder_is_in_list "$FOLDER" "$IGNORE_LIST")" == "1" ]; then
    NEW_FOLDERS="$NEW_FOLDERS $FOLDER"
  fi
done

# replace space with return character
FOLDERS=$(echo $NEW_FOLDERS | sed 's/ /\n/g' | sed 's/^projects\///g')
echo "$FOLDERS"
