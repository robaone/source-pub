#!/bin/bash

# This script prompts the user for a feature name and create a new branch 
# in the format of feature/<ticketid>-<featurename> where <featurename> is skewer case

# This script is intended to be run from the root of the repository

if [ "$GIT_PATH" == "" ]; then
  GIT_PATH=$(which git)
fi
# prompt the user for a feature name
if [ "$FEATURE_NAME" == "" ]; then
  read -p "Enter a feature name: " FEATURE_NAME
fi
feature_name=$FEATURE_NAME


# prompt the user for a ticket id
if [ "$TICKET_ID" == "" ]; then
  read -p "Enter a ticket id: " TICKET_ID
fi
ticket_id=$TICKET_ID

# create a new branch in the format of feature/<ticketid>-<featurename> where <featurename> is skewer case
skewer_case_feature_name=$(echo "$feature_name" | sed 's/ /-/g' | tr '[:upper:]' '[:lower:]')
if [ "$?" != "0" ]; then
  echo "Error: failed to convert feature name to skewer case"
  exit 1
fi

branch_name="feature/${ticket_id}-${skewer_case_feature_name}"

$GIT_PATH show-ref --verify --quiet "refs/heads/$branch_name"
if [ "$?" != "0" ]; then
  echo "Branch $branch_name already exists. Please choose a different feature name or ticket id."
  exit 1
fi

$GIT_PATH checkout develop && \
$GIT_PATH pull && \
$GIT_PATH checkout -b $branch_name
exit $?
