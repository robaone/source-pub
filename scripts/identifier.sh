#!/bin/bash

if [ "$BRANCH" == "" ] && [ "$REF" == "" ]; then
  echo "Usage: set BRANCH or REF environment variable"
  exit 1
fi
if [ "$STACK_NAME" == "" ]; then
  echo "Usage: set STACK_NAME environment variable"
  exit 1
fi

IDENTIFIER=$BRANCH
if [[ "$BRANCH" =~ ^(release|hotfix)[/]v[0-9]+[.][0-9]+[.][0-9]+$ ]]; then
    IDENTIFIER=staging
else
    IDENTIFIER=$(echo $REF | sed -E 's/(refs\/heads\/)//')
    if [ "$IDENTIFIER" != 'develop' ] && [ "$IDENTIFIER" != 'main' ] && [ $PR_NB != "" ]; then
        IDENTIFIER=$PR_NB
    fi
fi
if [ "$IDENTIFIER" == "staging" ]; then
    TESTING_STATUS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME-$IDENTIFIER --region $REGION | jq -r '.Stacks[].Tags[] | select(.Key | contains("testing")) | .Value')
    if [[ "$TESTING_STATUS" == "true" ]]; then
        TESTING_VERSION=$(aws cloudformation describe-stacks --stack-name $STACK_NAME-$IDENTIFIER --region $REGION | jq -r '.Stacks[].Tags[] | select(.Key | contains("version")) | .Value')
        if [ "$TESTING_VERSION" != "$(echo $BRANCH | sed -E 's/(release|hotfix)\/v//')" ]; then
            exit 1
        fi
    fi
fi
echo $IDENTIFIER
