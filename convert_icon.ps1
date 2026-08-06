Add-Type -AssemblyName System.Drawing

 = 'D:\projects\daily_planner\src-tauri\icons\128x128@2x.png'
 = 'D:\projects\daily_planner\src-tauri\icons\icon.ico'

 = [System.Drawing.Bitmap]::FromFile()

# Save as ICO format
.Save(, [System.Drawing.Imaging.ImageFormat]::Icon)

.Dispose()

Write-Output 'Written ICO file'
 = [System.IO.File]::ReadAllBytes()
Write-Output ('Size: ' + .Length + ' bytes')
Write-Output ('Header: ' + (([0..5] | ForEach-Object { .ToString('X2') }) -join ' '))