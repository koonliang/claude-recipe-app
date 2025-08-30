#!/bin/bash
set -e

echo "Building Lambda functions..."

# Create lambdas directory
mkdir -p lambdas

cd ../../..

# Build User Lambda
echo "Building User Lambda..."
cd src/Lambdas/User
rm -rf publish/
dotnet publish -c Release -r linux-x64 --self-contained false -o publish/
cd publish
python3 -c "
import zipfile
import os
with zipfile.ZipFile('../../../../src/IaC/terraform/lambdas/user-lambda.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        for file in files:
            zf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), '.'))
"
cd ../../../..

# Build Recipe Lambda
echo "Building Recipe Lambda..."
cd src/Lambdas/Recipe
rm -rf publish/
dotnet publish -c Release -r linux-x64 --self-contained false -o publish/
cd publish
python3 -c "
import zipfile
import os
with zipfile.ZipFile('../../../../src/IaC/terraform/lambdas/recipe-lambda.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        for file in files:
            zf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), '.'))
"
cd ../../../..
# Build Authorizer Lambda
echo "Building Authorizer Lambda..."
cd src/Lambdas/Authorizer
rm -rf publish/
dotnet publish -c Release -r linux-x64 --self-contained false -o publish/
cd publish
python3 -c "
import zipfile
import os
with zipfile.ZipFile('../../../../src/IaC/terraform/lambdas/authorizer-lambda.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        for file in files:
            zf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), '.'))
"
pwd
echo "All Lambda functions built successfully!"
cd ../../../../src/IaC/terraform
echo "Generated files:"
ls -la lambdas/