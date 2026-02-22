$headers_ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"

$tiles = @(
    @("A", "https://wikicarpedia.com/images/6/61/Inns_And_Cathedrals_C31_Tile_A.jpg"),
    @("B", "https://wikicarpedia.com/images/e/e4/Inns_And_Cathedrals_C31_Tile_B.jpg"),
    @("C", "https://wikicarpedia.com/images/7/74/Inns_And_Cathedrals_C31_Tile_C.jpg"),
    @("D", "https://wikicarpedia.com/images/d/dc/Inns_And_Cathedrals_C31_Tile_D.jpg"),
    @("E", "https://wikicarpedia.com/images/c/c4/Inns_And_Cathedrals_C31_Tile_E.jpg"),
    @("F", "https://wikicarpedia.com/images/a/ae/Inns_And_Cathedrals_C31_Tile_F.jpg"),
    @("G", "https://wikicarpedia.com/images/d/d5/Inns_And_Cathedrals_C31_Tile_G.jpg"),
    @("H", "https://wikicarpedia.com/images/2/2c/Inns_And_Cathedrals_C31_Tile_H.jpg"),
    @("I", "https://wikicarpedia.com/images/1/10/Inns_And_Cathedrals_C31_Tile_I.jpg"),
    @("J", "https://wikicarpedia.com/images/4/42/Inns_And_Cathedrals_C31_Tile_J.jpg"),
    @("Ka", "https://wikicarpedia.com/images/c/cf/Inns_And_Cathedrals_C31_Tile_Ka.jpg"),
    @("Kb", "https://wikicarpedia.com/images/c/c3/Inns_And_Cathedrals_C31_Tile_Kb.jpg"),
    @("L", "https://wikicarpedia.com/images/9/96/Inns_And_Cathedrals_C31_Tile_L.jpg"),
    @("M", "https://wikicarpedia.com/images/9/9f/Inns_And_Cathedrals_C31_Tile_M.jpg"),
    @("N", "https://wikicarpedia.com/images/d/db/Inns_And_Cathedrals_C31_Tile_N.jpg"),
    @("O", "https://wikicarpedia.com/images/4/4b/Inns_And_Cathedrals_C31_Tile_O.jpg"),
    @("P", "https://wikicarpedia.com/images/c/c3/Inns_And_Cathedrals_C31_Tile_P.jpg"),
    @("Q", "https://wikicarpedia.com/images/e/e7/Inns_And_Cathedrals_C31_Tile_Q.jpg"),
    @("R", "https://wikicarpedia.com/images/3/30/Inns_And_Cathedrals_C31_Tile_R.jpg"),
    @("S", "https://wikicarpedia.com/images/f/f9/Inns_And_Cathedrals_C31_Tile_S.jpg"),
    @("T", "https://wikicarpedia.com/images/5/5c/Inns_And_Cathedrals_C31_Tile_T.jpg"),
    @("U", "https://wikicarpedia.com/images/9/9b/Inns_And_Cathedrals_C31_Tile_U.jpg"),
    @("V", "https://wikicarpedia.com/images/7/7b/Inns_And_Cathedrals_C31_Tile_V.jpg"),
    @("W", "https://wikicarpedia.com/images/d/d4/Inns_And_Cathedrals_C31_Tile_W.jpg")
)

$destDir = "public/images/InnsAndCathedrals_C3"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir }

foreach ($tile in $tiles) {
    $id = $tile[0]
    $url = $tile[1]
    $dest = "$destDir/Inns_And_Cathedrals_C3_Tile_$id.jpg"
    Write-Host "Downloading Tile $id..."
    
    $curlArgs = @("-A", $headers_ua, "-o", $dest, $url, "-L", "--fail")
    & curl.exe @curlArgs
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Curl failed for Tile $id with exit code $LASTEXITCODE"
    }
    else {
        Write-Host "Success: $dest"
    }
}
