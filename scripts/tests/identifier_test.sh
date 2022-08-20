#!/bin/bash

CMD=$1

echo Scenario: Use pull request number on feature branch

## GIVEN

export STACK_NAME=bob
export PR_NB=123
export BRANCH=feature/test-feature
export REF=refs/heads/123/merge

## WHEN
RESULT=$(eval $CMD)

## THEN
if [ "$RESULT" == "123" ]; then
  echo "OK"
else
  echo "Expected 123, but got ${RESULT}"
  exit 1
fi

echo Scenario: Use develop on push to develop branch

## GIVEN

export TACK_NAME=bob
export PR_NB=
export BRANCH=
export REF=refs/heads/develop

## WHEN
RESULT=$(eval $CMD)

## THEN
if [ "$RESULT" == "develop" ]; then
  echo "OK"
else
  echo "Expected develop, but got ${RESULT}"
  exit 1
fi

echo Scenario: Use staging on release pull request to main branch

## GIVEN

export STACK_NAME=bob
export PR_NB=123
export BRANCH=release/v1.0.0
export REF=refs/heads/123/merge

## WHEN
RESULT=$(eval $CMD)

## THEN
if [ "$RESULT" == "staging" ]; then
  echo "OK"
else
  echo "Expected staging, but got ${RESULT}"
  exit 1
fi

echo Scenario: Use main on push to main branch

## GIVEN

export STACK_NAME=bob
export PR_NB=
export BRANCH=
export REF=refs/heads/main

## WHEN
RESULT=$(eval $CMD)

## THEN
if [ "$RESULT" == "main" ]; then
  echo "OK"
else
  echo "Expected main, but got ${RESULT}"
  exit 1
fi
