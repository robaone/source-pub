#!/bin/bash

# This scripts generates a matrix object string from a list of projects.
# The matrix object string is used in the GitHub Actions workflow file.

# The script expects a list of projects as input.

PROJECTS="$(cat)"

SCRIPT_DIR=$(cd $(dirname $0); pwd)

if [ "$DEFAULT_OS" == "" ]; then
  DEFAULT_OS="ubuntu-latest"
fi

if [ "$CAT_CMD" == "" ]; then
  CAT_CMD="cat"
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

function is_empty_string() {
  local STRING="$1"
  # remove all empty spaces and remove all line breaks
  local STRING=$(echo "$STRING" | sed 's/ //g' | sed 's/\n//g')
  # check if the string is empty
  if [ "$STRING" == "" ]; then
    echo 1
  else
    echo 0
  fi
}

if [ "$(is_empty_string "$PROJECTS")" == "1" ]; then
  echo "{\"include\":[]}"
  exit 0
fi

function get_workflow_os () {
  local project_json="$1"
  local job=$2
  local os=$(echo "$project_json" | jq -rc '.workflow.'${job}'.os' 2>/dev/null)
  if [ "$?" != "0" ] || [ "$os" == "" ]; then
    os="null"
  fi
  if [ "$job" != "default" ] && [ "$os" == "null" ]; then
    os=$(echo "$project_json" | jq -rc .workflow.default.os)
  fi
  if [ "$os" != "null" ]; then
    parsed_os_value=$(echo "$os" | jq -c . 2>/dev/null)
    if [ "$?" != "0" ]; then
      echo "\"$os\""
    else
      echo "$os"
    fi
  else
    echo "\"$DEFAULT_OS\""
  fi
}

function get_targets () {
  local project_json="$1"
  local job=$2
  local project_path="$SCRIPT_DIR/../../projects/$project"
  local targets=$(echo "$project_json" | jq -rc .workflow.${job}.targets 2>/dev/null)
  if [ "$targets" == "" ]; then
    targets="null"
  fi
  if [ "$job" != "default" ] && [ "$targets" == "null" ]; then
    targets=$(echo "$project_json" | jq -rc .workflow.default.targets 2>/dev/null)
  fi
  if [ "$targets" != "null" ] && [ "$targets" != "" ]; then
    echo "$targets"
  else
    echo "[]"
  fi
}

function get_workflow() {
  local project_json="$1"
  local job=$2
  local target=$3
  local workflow=$(echo "$project_json" | jq -rc ".workflow.${job}.targets[] | select(.target == \"${target}\") | .workflow" 2>/dev/null)
  if [ "$workflow" == "" ] || [ "$workflow" == "null" ]; then
    workflow=$(echo "$project_json" | jq -rc .workflow.${job}.workflow 2>/dev/null)
    if [ "$workflow" == "" ]; then
      workflow="null"
    fi
    if [ "$job" != "default" ] && [ "$workflow" == "null" ]; then
      workflow=$(echo "$project_json" | jq -rc ".workflow.default.targets[] | select(.target == \"${target}\") | .workflow" 2>/dev/null)
      if [ "$workflow" == "" ] || [ "$workflow" == "null" ]; then
        workflow=$(echo "$project_json" | jq -rc .workflow.default.workflow 2>/dev/null)
      fi
    fi
  fi
  if [ "$workflow" != "null" ] && [ "$workflow" != "" ]; then
    echo "$workflow"
  else
    echo "null"
  fi
}

function generate_matrix_object() {
  local projects="$1"
  local matrix_object="{\"include\":["
  for project in $projects; do
    local project_path="$SCRIPT_DIR/../../projects/$project"
    if [ "$(file_exists "$project_path/package.json")" != "1" ]; then
      continue
    fi
    local project_json=$($CAT_CMD "$project_path/package.json")
    local WORKFLOW_OS=$(get_workflow_os "$project_json" "$JOB_NAME")
    TARGETS=$(get_targets "$project_json" "$JOB_NAME")
    if [ "$TARGETS" != "[]" ]; then
      local index=0
      while [ $index -lt $(echo "$TARGETS" | jq -r '. | length') ]; do
        TARGET=$(echo "$TARGETS" | jq -r ".[$index]")
        parsed_target_values=$(echo "$TARGET" | jq -c . 2>/dev/null)
        if [ "$?" == "0" ] && [ "$parsed_target_values" != "" ]; then
          TARGET=$(echo "$parsed_target_values" | jq -r '.target')
          OS="\"$(echo "$parsed_target_values" | jq -r '.os')\""
          if [ "$OS" == "\"null\"" ] || [ "$OS" == "\"\"" ]; then
            OS="$WORKFLOW_OS"
          fi
        else
          OS="$WORKFLOW_OS"
        fi
        CUSTOM_WORKFLOW=$(get_workflow "$project_json" "$JOB_NAME" "$TARGET")
        if [ "$CUSTOM_WORKFLOW" != "null" ] && [ "$CUSTOM_WORKFLOW" != "" ]; then
          matrix_object="${matrix_object}{\"project\":\"${project}\",\"os\":$OS,\"target\":\"$TARGET\",\"workflow\":\"$CUSTOM_WORKFLOW\",\"bypass\":\"false\"},"
        else
          matrix_object="${matrix_object}{\"project\":\"${project}\",\"os\":$OS,\"target\":\"$TARGET\"},"
        fi
        index=$((index+1))
      done
    else
      matrix_object="${matrix_object}{\"project\":\"${project}\",\"os\":$WORKFLOW_OS},"
    fi
  done
  if [ "$matrix_object" == "{\"include\":[" ]; then
    matrix_object="${matrix_object}]}"
    echo $matrix_object
    exit 0
  fi
  matrix_object="${matrix_object%?}]}" # remove the last comma
  echo $matrix_object
}

generate_matrix_object "$PROJECTS"
