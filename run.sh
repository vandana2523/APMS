#!/bin/bash

# Check if the required parameters are provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <PROJECT_NAME> <SPRINT_NAME>"
  exit 1
fi

# Assign parameters to variables
PROJECT_NAME="$1"
SPRINT_NAME="$2"

# Run the Cypress tests
npx cypress run --env sprint="$SPRINT_NAME",project="$PROJECT_NAME" --headed

  # Send the email report
  node sendEmail.js "$PROJECT_NAME" "$SPRINT_NAME"
