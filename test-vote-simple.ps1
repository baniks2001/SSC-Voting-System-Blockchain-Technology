$body = Get-Content 'test-vote-simple.json' -Raw

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/voting/cast-blockchain' -Method POST -ContentType 'application/json' -Body $body -ErrorAction Stop
    Write-Host "Success:" $response
} catch {
    Write-Host "Error:" $_.Exception.Message
    Write-Host "Status Code:" $_.Exception.Response.StatusCode
    
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $reader.BaseStream.Position = 0
    $errorResponse = $reader.ReadToEnd()
    Write-Host "Response:" $errorResponse
}
