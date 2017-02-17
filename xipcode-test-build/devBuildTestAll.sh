#!/usr/bin/env bash

echo "Uninstalling xipcode"
rm -rf node_modules/xipcode

echo "Building xipcode"
cd ../xipcode
gulp
cd ../xipcode-test-build

echo "Installing xipcode"
npm install

echo "Creating test project"
gulp create-project --id=test

echo "Adding test project to project.json"
gulp register-test-project

echo "Running test build"
gulp

echo "Removing test project from project.json"
gulp deregister-test-project

echo "Deleting test project"
gulp remove-test-project
