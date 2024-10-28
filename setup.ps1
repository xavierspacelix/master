# Set environment variables permanently
[Environment]::SetEnvironmentVariable("FILE_SIZE_LIMIT", "5242880", "User")
[Environment]::SetEnvironmentVariable("dollar", "$", "User")
[Environment]::SetEnvironmentVariable("http_upgrade", "http_upgrade", "User")
[Environment]::SetEnvironmentVariable("scheme", "scheme", "User")
[Environment]::SetEnvironmentVariable("REDIS_URL", "redis://localhost:6379/", "User")
[Environment]::SetEnvironmentVariable("PGHOST", "localhost", "User")

# Get system information
$HOSTNAME = hostname
$MAC_ADDRESS = (Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object -First 1).MacAddress
$CPU_INFO = Get-CimInstance Win32_Processor | Select-Object -ExpandProperty Name
$MEMORY_INFO = Get-CimInstance Win32_ComputerSystem | Select-Object -ExpandProperty TotalPhysicalMemory
$DISK_INFO = Get-CimInstance Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::round($_.Size/1GB, 2)}}, @{Name="Free(GB)";Expression={[math]::round($_.FreeSpace/1GB, 2)}}

# Concatenate information and compute SHA-256 hash
$signatureString = "$HOSTNAME$MAC_ADDRESS$CPU_INFO$MEMORY_INFO$DISK_INFO"
$SHA256 = [System.Security.Cryptography.SHA256]::Create()
$bytes = [System.Text.Encoding]::UTF8.GetBytes($signatureString)
$hash = $SHA256.ComputeHash($bytes)
$SIGNATURE = [BitConverter]::ToString($hash) -replace '-'

# Export the MACHINE_SIGNATURE variable
[Environment]::SetEnvironmentVariable("MACHINE_SIGNATURE", $SIGNATURE, "User")
[Environment]::SetEnvironmentVariable("SECRET_KEY", "9a42fus914rvels6u5e8egk770eamkeotm7rqdig25vl8jdkrv", "User")
[Environment]::SetEnvironmentVariable("USE_MINIO", "1", "User")

# Optional: Output to confirm
Write-Output "Environment variables set successfully."
