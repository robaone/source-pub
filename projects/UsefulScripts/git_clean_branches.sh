#!/bin/bash

#################################################
# Clean up your local git branches by removing
# all branches except the long lived ones.
#
# For example, if you have just finished working
# on a feature branch and you have published it
# you can run this and it will delete it for you
# without you having to type in the branch name.
#
# Tip: Checkout your main branch first (i.e. main)
#################################################

BRANCH_LIST=$(git branch | grep -v alpha | grep -v beta | grep -v develop | grep -v main)
if [ "$?" == "0" ] && [ "$(echo $BRANCH_LIST | wc -l | xargs )" != "0" ]; then
  echo "You are about to delete the following branches"
  echo $BRANCH_LIST

  read -p "Are you sure? " -n 1 -r
  echo    # (optional) move to a new line
  if [[ ! $REPLY =~ ^[Yy]$ ]]
  then
     exit 1
  fi
  echo $BRANCH_LIST | awk '{print "git branch -D " $1}' | sh
else
  echo "Nothing to do"
  exit 2
fi
