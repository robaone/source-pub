#!/bin/bash

# This scripts generates a matrix object string from a list of projects.
# The matrix object string is used in the GitHub Actions workflow file.

# The script expects a list of projects as input.

PROJECTS="$(cat)"

SCRIPT_DIR=$(cd $(dirname $0); pwd)

if [ "$DEFAULT_OS" == "" ]; then
  DEFAULT_OS="ubuntu-latest"
fi

if [ "$JQ_CMD" == "" ]; then
  JQ_CMD="$(which jq)"
fi

if [ "$JOB_NAME" == "" ]; then
  JOB_NAME="default"
fi

function file_exists() {
  local FILE=$1
  if [ "$FILE_EXISTS_CMD" != "" ]; then
    $FILE_EXISTS_CMD "$FILE"
    return $?
  else
    if [ -f "$FILE" ]; then
      echo 1
    else
      echo 0
    fi
  fi
}

function get_workflow_os () {
  local project=$1
  local job=$2
  local project_path="$SCRIPT_DIR/../../projects/$project"
  if [ "$(file_exists "$project_path/package.json")" == "1" ]; then
    local os=$($JQ_CMD -rc .workflow.${job}.os "$project_path/package.json")
    if [ "$job" != "default" ] && [ "$os" == "null" ]; then
      os=$($JQ_CMD -rc .workflow.default.os "$project_path/package.json")
    fi
    if [ "$os" != "null" ]; then
      parsed_os_value=$(echo "$os" | $JQ_CMD -c . 2>/dev/null)
      if [ "$?" != "0" ]; then
        echo "\"$os\""
      else
        echo "$os"
      fi
    else
      echo "\"$DEFAULT_OS\""
    fi
  else
    echo "\"$DEFAULT_OS\""
  fi
}

function get_targets () {
  local project=$1
  local job=$2
  local project_path="$SCRIPT_DIR/../../projects/$project"
  if [ "$(file_exists "$project_path/package.json")" == "1" ]; then
    local targets=$($JQ_CMD -rc .workflow.${job}.targets "$project_path/package.json")
    if [ "$job" != "default" ] && [ "$targets" == "null" ]; then
      targets=$($JQ_CMD -rc .workflow.default.targets "$project_path/package.json")
    fi
    if [ "$targets" != "null" ]; then
      echo "$targets"
    else
      echo "[]"
    fi
  else
    echo "[]"
  fi
}

function generate_matrix_object() {
  local projects="$1"
  local matrix_object="{\"include\":["
  for project in $projects; do
    local WORKFLOW_OS=$(get_workflow_os "$project" "$JOB_NAME")
    TARGETS=$(get_targets "$project" "$JOB_NAME")
    if [ "$TARGETS" != "[]" ]; then
      local index=0
      while [ $index -lt $(echo "$TARGETS" | jq -r '. | length') ]; do
        TARGET=$(echo "$TARGETS" | jq -r ".[$index]")
        parsed_target_values=$(echo "$TARGET" | jq -c . 2>/dev/null)
        if [ "$?" == "0" ]; then
          TARGET=$(echo "$parsed_target_values" | jq -r '.target')
          OS="\"$(echo "$parsed_target_values" | jq -r '.os')\""
        else
          OS="$WORKFLOW_OS"
        fi
        matrix_object="${matrix_object}{\"project\":\"${project}\",\"os\":$OS,\"target\":\"$TARGET\"},"
        index=$((index+1))
      done
    else
      matrix_object="${matrix_object}{\"project\":\"${project}\",\"os\":$WORKFLOW_OS},"
    fi
  done
  matrix_object="${matrix_object%?}]}" # remove the last comma
  echo $matrix_object
}

generate_matrix_object "$PROJECTS"
