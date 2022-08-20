#!/bin/bash

CMD=$1
if [ "$PACKAGE_PATH" == "" ]; then
  export PACKAGE_PATH=$2
fi
export TARGET_BRANCH=main
if [ ! -d $PACKAGE_PATH ]; then
  mkdir $PACKAGE_PATH
fi

if [ "$PACKAGE_PATH" == "" ]; then
  echo "You must set the PACKAGE_PATH environment variable"
  exit 1
fi

echo Scenario: Pass when the branch and version match on release

## GIVEN

export EVENT=pull_request
export CURRENT_BRANCH=release/v1.0.0
export NEXT_PREDICTED_RELEASE=1.0.0
echo '{"version":"1.0.0"}' > $PACKAGE_PATH/package.json

## WHEN
eval $CMD
exit_code=$?

## THEN
if [ "$exit_code" == "0" ]; then
  echo "OK"
else
  echo "Expected exit code 0, but got ${exit_code}"
  exit 1
fi

echo Scenario: Pass when the branch and version match on hotfix

## GIVEN

export EVENT=pull_request
export CURRENT_BRANCH=hotfix/v1.0.0
export NEXT_PREDICTED_RELEASE=1.0.0
echo '{"version":"1.0.0"}' > $PACKAGE_PATH/package.json

## WHEN
eval $CMD
exit_code=$?

## THEN
if [ "$exit_code" == "0" ]; then
  echo "OK"
else
  echo "Expected exit code 0, but got ${exit_code}"
  exit 1
fi

echo Scenario: Fail when the branch and version do not match on release

## GIVEN

export EVENT=pull_request
export CURRENT_BRANCH=release/v1.2.0
export NEXT_PREDICTED_RELEASE=1.2.0
echo '{"version":"1.0.0"}' > $PACKAGE_PATH/package.json

## WHEN
eval $CMD
exit_code=$?

## THEN
if [ "$exit_code" == "1" ]; then
  echo "OK"
else
  echo "Expected exit code 1, but got ${exit_code}"
  exit 1
fi

echo Scenario: Fail when the branch and version do not match on hotfix

## GIVEN

export EVENT=pull_request
export CURRENT_BRANCH=hotfix/v1.2.0
export NEXT_PREDICTED_RELEASE=1.2.0
echo '{"version":"1.0.0"}' > $PACKAGE_PATH/package.json

## WHEN
eval $CMD
exit_code=$?

## THEN
if [ "$exit_code" == "1" ]; then
  echo "OK"
else
  echo "Expected exit code 1, but got ${exit_code}"
  exit 1
fi

echo Scenario: Do nothing if the branch is develop

## GIVEN

export EVENT=pull_request
export CURRENT_BRANCH=hotfix/v1.2.0
export TARGET_BRANCH=develop

## WHEN
RESULT=$(eval $CMD)
exit_code=$?

## THEN
if [ "$exit_code" == "0" ] && [[ "$RESULT" == *"Nothing to do here"* ]]; then
  echo "OK"
else
  echo "Expected exit code 0, but got ${exit_code} or result = $RESULT"
  exit 1
fi

echo Scenario: Reject package version if not equal the next release

## GIVEN

export EVENT=pull_request
export CURRENT_BRANCH=release/v1.1.0
export NEXT_PREDICTED_RELEASE=1.0.1
export TARGET_BRANCH=main
echo '{"version":"1.1.0"}' > $PACKAGE_PATH/package.json

## WHEN
eval $CMD
exit_code=$?

## THEN
if [ "$exit_code" == "1" ]; then
  echo "OK"
else
  echo "Expected exit code 1, but got ${exit_code}"
  exit 1
fi
