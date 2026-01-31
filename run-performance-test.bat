@echo off
echo SSC Voting System - Performance Testing
echo ========================================
echo.

REM Check if server is running
echo Checking if server is running on localhost:5000...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Server is not running on localhost:5000
    echo Please start the server first: npm start
    pause
    exit /b 1
)

echo Server is running! Starting JMeter performance test...
echo.

REM Run JMeter test plan
echo Running performance test with the following configuration:
echo - Health Check: 5 threads x 10 loops
echo - Blockchain Status: 3 threads x 20 loops  
echo - Poll Status: 4 threads x 15 loops
echo - Vote Submission: 10 threads x 50 loops
echo - Results: 3 threads x 25 loops
echo.

REM Start JMeter in non-GUI mode with results file
"C:\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat" -n -t "jmeter-test-plan.jmx" -l "performance-results.jtl" -e -o "performance-report"

echo.
echo Performance test completed!
echo Results saved to: performance-results.jtl
echo HTML report generated in: performance-report folder
echo.
echo Opening performance report...
start performance-report\index.html

pause
