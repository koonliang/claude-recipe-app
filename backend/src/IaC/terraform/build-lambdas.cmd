@echo off
setlocal EnableDelayedExpansion

echo Building Lambda Functions...
echo ===============================

:: Set build configuration
set BUILD_CONFIG=Release
set RUNTIME=linux-x64
set OUTPUT_DIR=%~dp0\lambdas

:: Create output directory if it doesn't exist
if not exist "%OUTPUT_DIR%" (
    echo Creating output directory: %OUTPUT_DIR%
    mkdir "%OUTPUT_DIR%"
)

:: Define lambda mappings: project_name:zip_name
set "LAMBDA_MAPPING=Authorizer:authorizer-lambda Recipe:recipe-lambda User:user-lambda"

for %%M in (%LAMBDA_MAPPING%) do (
    for /f "tokens=1,2 delims=:" %%A in ("%%M") do (
        echo.
        echo Building %%A Lambda...
        echo -----------------------
        
        set LAMBDA_DIR=%~dp0..\..\Lambdas\%%A
        set PUBLISH_DIR=!LAMBDA_DIR!\bin\%BUILD_CONFIG%\net8.0\%RUNTIME%\publish
        set ZIP_FILE=%OUTPUT_DIR%\%%B.zip
    
        :: Clean previous build
        echo Cleaning previous build for %%A...
        if exist "!PUBLISH_DIR!" (
            rmdir /s /q "!PUBLISH_DIR!"
        )
        
        :: Build and publish the lambda
        echo Publishing %%A...
        dotnet publish "!LAMBDA_DIR!\%%A.csproj" ^
            --configuration %BUILD_CONFIG% ^
            --runtime %RUNTIME% ^
            --self-contained false ^
            --output "!PUBLISH_DIR!"
        
        if !errorlevel! neq 0 (
            echo ERROR: Failed to build %%A lambda
            goto :error
        )
        
        :: Create zip file
        echo Creating zip package for %%A as %%B.zip...
        if exist "!ZIP_FILE!" (
            del "!ZIP_FILE!"
        )
        
        :: Use PowerShell to create zip file (available on Windows 10+)
        powershell -Command "Compress-Archive -Path '!PUBLISH_DIR!\*' -DestinationPath '!ZIP_FILE!' -Force"
        
        if !errorlevel! neq 0 (
            echo ERROR: Failed to create zip package for %%A
            goto :error
        )
        
        echo Successfully created: !ZIP_FILE!
    )
)

echo.
echo ===============================
echo All Lambda functions built successfully!
echo Package location: %OUTPUT_DIR%
echo.
echo Available packages:
set "ZIP_FILES=authorizer-lambda.zip recipe-lambda.zip user-lambda.zip"
for %%Z in (%ZIP_FILES%) do (
    if exist "%OUTPUT_DIR%\%%Z" (
        echo   - %%Z
    )
)
echo ===============================

goto :end

:error
echo.
echo ===============================
echo Build failed!
echo ===============================
exit /b 1

:end
endlocal