$body = @{
    ballotId = "test-ballot-123"
    voterId = "test-voter-123"
    votes = @(
        @{ candidateId = 79; position = "President" },
        @{ candidateId = 80; position = "Vice President" }
    )
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/voting/cast-blockchain' -Method POST -ContentType 'application/json' -Body $body -ErrorAction Stop
    Write-Host "Success:" $response
} catch {
    Write-Host "Error:" $_.Exception.Message
    Write-Host "Status Code:" $_.Exception.Response.StatusCode
    Write-Host "Response:" $_.Exception.Response.GetResponseStream() | Get-Content
}
