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
skewer_case_feature_name=$(echo $feature_name | sed 's/ /-/g' | tr '[:upper:]' '[:lower:]')

$GIT_PATH checkout develop && \
$GIT_PATH pull && \
$GIT_PATH checkout -b feature/${ticket_id}-${skewer_case_feature_name}
