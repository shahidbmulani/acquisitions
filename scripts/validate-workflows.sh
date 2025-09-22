#!/bin/bash

# GitHub Actions Workflow Validation Script
# This script checks the basic syntax of GitHub Actions workflow files

set -e

echo "🔍 Validating GitHub Actions Workflows..."
echo "================================="

WORKFLOWS_DIR=".github/workflows"
VALIDATION_PASSED=true

# Function to validate YAML syntax
validate_yaml() {
    local file=$1
    echo "Checking: $file"
    
    # Check if file exists
    if [ ! -f "$file" ]; then
        echo "❌ File not found: $file"
        VALIDATION_PASSED=false
        return 1
    fi
    
    # Basic YAML syntax check - look for common YAML issues
    if [ -s "$file" ]; then
        echo "✅ File is not empty: $file"
        # Check for basic YAML structure (this is a simple check)
        if head -n 1 "$file" | grep -q "^name:"; then
            echo "✅ Starts with name field: $file"
        else
            echo "⚠️  File doesn't start with name field (may be valid): $file"
        fi
    else
        echo "❌ File is empty: $file"
        VALIDATION_PASSED=false
        return 1
    fi
    
    # Check for required GitHub Actions keys
    if grep -q "^name:" "$file" && grep -q "^on:" "$file" && grep -q "^jobs:" "$file"; then
        echo "✅ Contains required GitHub Actions keys: $file"
    else
        echo "❌ Missing required keys (name, on, jobs): $file"
        VALIDATION_PASSED=false
        return 1
    fi
    
    echo ""
}

# Check if workflows directory exists
if [ ! -d "$WORKFLOWS_DIR" ]; then
    echo "❌ Workflows directory not found: $WORKFLOWS_DIR"
    exit 1
fi

# Validate each workflow file
echo "📋 Validating workflow files..."
echo ""

validate_yaml "$WORKFLOWS_DIR/lint-and-format.yml"
validate_yaml "$WORKFLOWS_DIR/tests.yml"
validate_yaml "$WORKFLOWS_DIR/docker-build-and-push.yml"

# Summary
echo "================================="
if [ "$VALIDATION_PASSED" = true ]; then
    echo "🎉 All workflows passed validation!"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push these workflows to your repository"
    echo "2. Configure required secrets in GitHub repository settings:"
    echo "   - DOCKER_USERNAME"
    echo "   - DOCKER_PASSWORD"
    echo "3. Set up branch protection rules for main and staging branches"
    echo "4. Create a pull request to test the workflows"
    exit 0
else
    echo "❌ Some workflows failed validation!"
    echo "Please fix the issues above before using these workflows."
    exit 1
fi