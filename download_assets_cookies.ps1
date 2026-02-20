$headers_ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
$headers_cookie = "techaro.lol-anubis-auth=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhY3Rpb24iOiJDSEFMTEVOR0UiLCJjaGFsbGVuZ2UiOiIwMTljNjhmNC1lMzBhLTdmMzMtODQ5Ny1iMjU0MjNjMDVjMDgiLCJleHAiOjE3NzE4OTIyMDYsImlhdCI6MTc3MTI4NzQwNiwibWV0aG9kIjoiZmFzdCIsIm5iZiI6MTc3MTI4NzM0NiwicG9saWN5UnVsZSI6ImFjOTgwZjQ5YzRkMzVmYWIiLCJyZXN0cmljdGlvbiI6IjMyZDhkNmFkYmQ4Y2E4OTZlNDBjYWM5MWE3NDhkOTJlMjM1ZDcxOThkMGNmNTAzMjFjZGRlNTEwMDFmOTc1ODUifQ.66ZihMP4xdvXFCFjxcnWa8I2v-7oxGHmEr5OvoYKESRbBIrIq9DB3qeaVIBi2h6fsmdVbOBy8b9hOx0HBVCaBA; _gid=GA1.2.36194742.1771558158; _gat=1; _ga_SN60VCSS09=GS2.1.s1771558157$o4$g1$t1771559077$j60$l0$h0; _ga=GA1.1.1707853323.1771287407"

$c3_tiles = @(
    "https://wikicarpedia.com/images/6/67/Traders_And_Builders_C3_Tile_A.png",
    "https://wikicarpedia.com/images/2/2a/Traders_And_Builders_C3_Tile_B.png",
    "https://wikicarpedia.com/images/a/a4/Traders_And_Builders_C3_Tile_C.png",
    "https://wikicarpedia.com/images/1/18/Traders_And_Builders_C3_Tile_D.png",
    "https://wikicarpedia.com/images/4/40/Traders_And_Builders_C3_Tile_E.png",
    "https://wikicarpedia.com/images/5/54/Traders_And_Builders_C3_Tile_F.png",
    "https://wikicarpedia.com/images/c/c6/Traders_And_Builders_C3_Tile_G.png",
    "https://wikicarpedia.com/images/0/03/Traders_And_Builders_C3_Tile_H.png",
    "https://wikicarpedia.com/images/4/43/Traders_And_Builders_C3_Tile_I.png",
    "https://wikicarpedia.com/images/e/e7/Traders_And_Builders_C3_Tile_J.png",
    "https://wikicarpedia.com/images/1/12/Traders_And_Builders_C3_Tile_K.png",
    "https://wikicarpedia.com/images/0/0e/Traders_And_Builders_C3_Tile_L.png",
    "https://wikicarpedia.com/images/3/3a/Traders_And_Builders_C3_Tile_M.png",
    "https://wikicarpedia.com/images/d/d2/Traders_And_Builders_C3_Tile_N.png",
    "https://wikicarpedia.com/images/2/26/Traders_And_Builders_C3_Tile_O.png",
    "https://wikicarpedia.com/images/9/98/Traders_And_Builders_C3_Tile_P.png",
    "https://wikicarpedia.com/images/2/2a/Traders_And_Builders_C3_Tile_Q.png",
    "https://wikicarpedia.com/images/3/3a/Traders_And_Builders_C3_Tile_R.png",
    "https://wikicarpedia.com/images/f/f5/Traders_And_Builders_C3_Tile_S.png",
    "https://wikicarpedia.com/images/9/92/Traders_And_Builders_C3_Tile_T.png",
    "https://wikicarpedia.com/images/6/6f/Traders_And_Builders_C3_Tile_U.png",
    "https://wikicarpedia.com/images/9/94/Traders_And_Builders_C3_Tile_V.png",
    "https://wikicarpedia.com/images/4/41/Traders_And_Builders_C3_Tile_W.png",
    "https://wikicarpedia.com/images/5/5c/Traders_And_Builders_C3_Tile_X.png"
)

$c2_tiles = @(
    "https://wikicarpedia.com/images/3/3b/Traders_And_Builders_C2_Tile_A.jpg",
    "https://wikicarpedia.com/images/9/94/Traders_And_Builders_C2_Tile_B.jpg",
    "https://wikicarpedia.com/images/6/6a/Traders_And_Builders_C2_Tile_C.jpg",
    "https://wikicarpedia.com/images/f/fc/Traders_And_Builders_C2_Tile_D.jpg",
    "https://wikicarpedia.com/images/0/01/Traders_And_Builders_C2_Tile_E.jpg",
    "https://wikicarpedia.com/images/f/fc/Traders_And_Builders_C2_Tile_F.jpg",
    "https://wikicarpedia.com/images/9/90/Traders_And_Builders_C2_Tile_G.jpg",
    "https://wikicarpedia.com/images/9/99/Traders_And_Builders_C2_Tile_H.jpg",
    "https://wikicarpedia.com/images/2/23/Traders_And_Builders_C2_Tile_I.jpg",
    "https://wikicarpedia.com/images/f/f5/Traders_And_Builders_C2_Tile_J.jpg",
    "https://wikicarpedia.com/images/f/fd/Traders_And_Builders_C2_Tile_K.jpg",
    "https://wikicarpedia.com/images/c/cb/Traders_And_Builders_C2_Tile_L.jpg",
    "https://wikicarpedia.com/images/3/3b/Traders_And_Builders_C2_Tile_M.jpg",
    "https://wikicarpedia.com/images/e/e7/Traders_And_Builders_C2_Tile_N.jpg",
    "https://wikicarpedia.com/images/1/1e/Traders_And_Builders_C2_Tile_O.jpg",
    "https://wikicarpedia.com/images/5/50/Traders_And_Builders_C2_Tile_P.jpg",
    "https://wikicarpedia.com/images/3/39/Traders_And_Builders_C2_Tile_Q.jpg",
    "https://wikicarpedia.com/images/c/c4/Traders_And_Builders_C2_Tile_R.jpg",
    "https://wikicarpedia.com/images/3/3e/Traders_And_Builders_C2_Tile_S.jpg",
    "https://wikicarpedia.com/images/e/ed/Traders_And_Builders_C2_Tile_T.jpg",
    "https://wikicarpedia.com/images/c/c2/Traders_And_Builders_C2_Tile_U.jpg",
    "https://wikicarpedia.com/images/9/97/Traders_And_Builders_C2_Tile_V.jpg",
    "https://wikicarpedia.com/images/b/b8/Traders_And_Builders_C2_Tile_W.jpg",
    "https://wikicarpedia.com/images/e/e9/Traders_And_Builders_C2_Tile_X.jpg"
)

$goods_c3 = @{
    "wine"  = "https://wikicarpedia.com/images/6/62/Traders_And_Builders_C3_Good_Barrel.png"
    "grain" = "https://wikicarpedia.com/images/3/33/Traders_And_Builders_C3_Good_Wheat.png"
    "cloth" = "https://wikicarpedia.com/images/9/91/Traders_And_Builders_C3_Good_Cloth.png"
}

$meeple_builder = "https://wikicarpedia.com/images/d/d2/Figure_Builders_C2.png"
$meeple_pig = "https://wikicarpedia.com/images/d/d7/Figure_Pigs_C2.png"

$dest_c3 = "c:\DEV\carcassonne-ai\public\images\TradersAndBuilders_C3"
$dest_c2 = "c:\DEV\carcassonne-ai\public\images\TradersAndBuilders_C2"

New-Item -ItemType Directory -Force -Path $dest_c3 | Out-Null
New-Item -ItemType Directory -Force -Path $dest_c2 | Out-Null

function Download-With-Curl {
    param ($url, $dest)
    Write-Host "Downloading $url to $dest using curl..."
    # Escape cookies for command line
    # Note: Powershell variables in string...
    # Using Call Operator & for safety with exe
    # The cookie string has special chars which might be an issue.
    # I'll pass it carefully.
    
    $curlArgs = @("-A", $headers_ua, "-b", $headers_cookie, "-o", $dest, $url, "--create-dirs", "-L", "--fail")
    
    # Run curl
    & curl.exe @curlArgs
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Curl failed with exit code $LASTEXITCODE"
    }
    else {
        # Check file size
        if (Test-Path $dest) {
            $jw = Get-Item $dest
            if ($jw.Length -lt 5000) {
                Write-Host "Warning: File $dest is suspiciously small ($($jw.Length) bytes). Likely blocked."
            }
            else {
                Write-Host "Success: $dest ($($jw.Length) bytes)"
            }
        }
    }
}

# Download C3 Tiles
foreach ($url in $c3_tiles) {
    $filename = Split-Path $url -Leaf
    Download-With-Curl -url $url -dest "$dest_c3\$filename"
}

# Download C2 Tiles
foreach ($url in $c2_tiles) {
    $filename = Split-Path $url -Leaf
    Download-With-Curl -url $url -dest "$dest_c2\$filename"
}

# Download C3 Goods
foreach ($key in $goods_c3.Keys) {
    $url = $goods_c3[$key]
    if ($key -eq "wine") { $name = "Good_Wine.png" }
    elseif ($key -eq "grain") { $name = "Good_Grain.png" }
    elseif ($key -eq "cloth") { $name = "Good_Cloth.png" }
    else { $name = Split-Path $url -Leaf }
    Download-With-Curl -url $url -dest "$dest_c3\$name"
}

# Download Meeples
Download-With-Curl -url $meeple_builder -dest "$dest_c3\Builder.png"
Download-With-Curl -url $meeple_pig -dest "$dest_c3\Pig.png"
Download-With-Curl -url $meeple_builder -dest "$dest_c2\Builder.png"
Download-With-Curl -url $meeple_pig -dest "$dest_c2\Pig.png"
