# GRS Fantasy Park — Local HTTP Server
# Serves static files on http://localhost:8080

$port = 8080
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# MIME type mapping
$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.png'  = 'image/png'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'  = 'font/ttf'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Host "ERROR: Port $port is in use. Trying 8081..." -ForegroundColor Red
    $port = 8081
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    try {
        $listener.Start()
    } catch {
        Write-Host "ERROR: Port 8081 also in use. Trying 9000..." -ForegroundColor Red
        $port = 9000
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$port/")
        $listener.Start()
    }
}

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Magenta
Write-Host "  GRS Fantasy Park - Maintenance Dashboard" -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Server running at:" -ForegroundColor White
Write-Host "  -> http://localhost:$port" -ForegroundColor Green
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor DarkGray
Write-Host ""

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq '/') { $urlPath = '/index.html' }
        if ($urlPath -eq '/technician' -or $urlPath -eq '/technician/') { $urlPath = '/technician.html' }

        $filePath = Join-Path $root ($urlPath.TrimStart('/').Replace('/', '\'))
        if (-not (Test-Path $filePath -PathType Leaf) -and (Test-Path ($filePath + '.html') -PathType Leaf)) {
            $filePath = $filePath + '.html'
            $urlPath = $urlPath + '.html'
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }

            $response.ContentType = $contentType
            $response.StatusCode = 200
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache")

            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $fileBytes.Length
            $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)

            $ts = Get-Date -Format "HH:mm:ss"
            Write-Host "  [$ts] 200 $urlPath" -ForegroundColor DarkGray
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)

            $ts = Get-Date -Format "HH:mm:ss"
            Write-Host "  [$ts] 404 $urlPath" -ForegroundColor Yellow
        }

        $response.OutputStream.Close()
    } catch {
        # Listener was stopped
        break
    }
}
