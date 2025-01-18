#!/bin/bash

CMD=$1

SCRIPT_DIR=$(cd $(dirname $0); pwd)

function assert_equals {
  if [ "$1" != "$2" ]; then
    echo "Expected $1 but got $2"
    exit 1
  else
    echo "OK"
  fi
}

function beforeAll {
  export FILE_EXISTS_CMD=$SCRIPT_DIR/mock_cmd.sh
  export CAT_CMD=$SCRIPT_DIR/mock_cmd.sh
}

function beforeEach {
  export MOCK_ARGUMENT_FILE=$(mktemp)
  export MOCK_TRACKING_FILE=$(mktemp)
}

beforeAll

echo Scenario: Generate a matrix object string where project.json does not exist
beforeEach

# GIVEN

export DEFAULT_OS="pop-os-20.04"
export PROJECTS="my-pop-project"
export MOCK_RESPONSES='[{"stdout":"0"}]'


# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN

assert_equals '{"include":[]}' "$ACTUAL_RESULT"

echo Scenario: Generate a matrix object where where project.json exists but does not contain a workflow object
beforeEach

# GIVEN

PACKAGE_JSON='{}'
export DEFAULT_OS="pop-os-20.04"
export PROJECTS="my-pop-project"
export MOCK_RESPONSES='[{"stdout":"1"},{"stdout":"'$( echo $PACKAGE_JSON | sed 's/"/\\"/g' )'"}]'

# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN

assert_equals '{"include":[{"project":"my-pop-project","os":"pop-os-20.04"}]}' "$ACTUAL_RESULT"

echo Scenario: Generate a matrix object string from the default OS
beforeEach

# GIVEN

PACKAGE_JSON='{ "workflow": { "default": { "os": "ubuntu-14.04" } } }'
PACKAGE2_JSON='{}'
unset DEFAULT_OS
export PROJECTS="GithubWebhook
OtherProject"
export MOCK_RESPONSES='[
{"stdout":"1"},{"stdout":"'$( echo $PACKAGE_JSON | sed 's/"/\\"/g' )'"},
{"stdout":"1"},{"stdout":"'$( echo $PACKAGE2_JSON | sed 's/"/\\"/g' )'"}
]'

# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN
assert_equals '{"include":[{"project":"GithubWebhook","os":"ubuntu-14.04"},{"project":"OtherProject","os":"ubuntu-latest"}]}' "$ACTUAL_RESULT"

echo Scenario: Generate a matrix object string from a target OS
beforeEach

# GIVEN

PACKAGE_JSON='{ "workflow": { "default": { "targets": [ { "target":"target1", "os":"ubuntu-14.04" } ] } } }'
export DEFAULT_OS="ubuntu-22.04"
export PROJECTS="project"
export MOCK_RESPONSES='[{"stdout":"1"},{"stdout":"'$( echo $PACKAGE_JSON | sed 's/"/\\"/g' )'"}]'

# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN
assert_equals '{"include":[{"project":"project","os":"ubuntu-14.04","target":"target1"}]}' "$ACTUAL_RESULT"

echo Scenario: Generate a matrix object string from 2 targets with 2 OSes
beforeEach

# GIVEN

PACKAGE_JSON='{ "workflow": { "default": { "targets": [ { "target":"ios", "os":"macos-latest" }, { "target":"web", "os":"ubuntu-22.04" } ] } } }'
export DEFAULT_OS="ubuntu-22.04"
export PROJECTS="project"
export MOCK_RESPONSES='[
{"stdout":"1"},{"stdout":"'$( echo $PACKAGE_JSON | sed 's/"/\\"/g' )'"}
]'

# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN
assert_equals '{"include":[{"project":"project","os":"macos-latest","target":"ios"},{"project":"project","os":"ubuntu-22.04","target":"web"}]}' "$ACTUAL_RESULT"

echo Scenario: Generate a matrix object string with a custom workflow dispatch
beforeEach

# GIVEN

PACKAGE_JSON='{ "workflow": { "default": { "targets": [ { "target":"ios", "workflow": "custom-workflow" }]}}}'
unset DEFAULT_OS
export PROJECTS="project"
export MOCK_RESPONSES='[
{"stdout":"1"},{"stdout":"'$( echo $PACKAGE_JSON | sed 's/"/\\"/g' )'"}
]'

# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN

assert_equals '{"include":[{"project":"project","os":"ubuntu-latest","target":"ios","workflow":"custom-workflow","bypass":"false"}]}' "$ACTUAL_RESULT"

echo Scenario: Generate a matrix object string with a base custom workflow dispatch
beforeEach

# GIVEN

PACKAGE_JSON='{ "workflow": { "default": { "targets": [ { "target":"ios" }], "workflow": "custom-workflow"}}}'
unset DEFAULT_OS
export PROJECTS="project"
export MOCK_RESPONSES='[
{"stdout":"1"},{"stdout":"'$( echo $PACKAGE_JSON | sed 's/"/\\"/g' )'"}
]'

# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN

assert_equals '{"include":[{"project":"project","os":"ubuntu-latest","target":"ios","workflow":"custom-workflow","bypass":"false"}]}' "$ACTUAL_RESULT"

echo Scenario: Generate a matrix object and skip e2e tests
beforeEach

# GIVEN

PACKAGE_JSON='{ "workflow": { "default": { "targets": [ { "target":"ios", "workflow": "custom-workflow" }]}}}'
unset DEFAULT_OS
export PROJECTS="project"
export MOCK_RESPONSES='[
{"stdout":"1"},{"stdout":"'$( echo $PACKAGE_JSON | sed 's/"/\\"/g' )'"}
]'
export SKIP_E2E=true
export JOB_NAME=featureTest

# WHEN

ACTUAL_RESULT=$(echo "$PROJECTS" | $CMD)

# THEN

assert_equals '{"include":[]}' "$ACTUAL_RESULT"
