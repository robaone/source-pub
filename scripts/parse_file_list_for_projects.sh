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

# for each line get the first folder name
FOLDERS="$(echo "$INPUT" | grep '[/]' | sed 's/\// /g' | awk '{print $1}' | sort | uniq)"

# replace docs with ADRPublisher and remove duplicates and publish adr documents
FOLDERS="$(echo "$FOLDERS" | sed 's/docs/ADRPublisher/g' | sort | uniq)"

# remove items from the list that are in the ignore list
IGNORE_LIST=".github scripts docs node_modules"

# get list of folders that don't exist
# for each folder in FOLDERS
#  if folder doesn't exist
#    add to list
function folder_exists() {
  local FOLDER=$1
  if [ -d "$FOLDER" ]; then
    echo 1
  else
    echo 0
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
FOLDERS=$(echo $NEW_FOLDERS | sed 's/ /\n/g')
echo "$FOLDERS"
