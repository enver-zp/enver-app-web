Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\Pc\Desktop\enver-app\public\zafer-muhur.png")

$bmp192 = new-object System.Drawing.Bitmap 192, 192
$g192 = [System.Drawing.Graphics]::FromImage($bmp192)
$g192.DrawImage($img, 0, 0, 192, 192)
$bmp192.Save("c:\Users\Pc\Desktop\enver-app\public\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g192.Dispose()
$bmp192.Dispose()

$bmp512 = new-object System.Drawing.Bitmap 512, 512
$g512 = [System.Drawing.Graphics]::FromImage($bmp512)
$g512.DrawImage($img, 0, 0, 512, 512)
$bmp512.Save("c:\Users\Pc\Desktop\enver-app\public\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g512.Dispose()
$bmp512.Dispose()

$img.Dispose()
