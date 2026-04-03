# Push all changes to the origin/main branch
git add .
$message = $args[0]
if (-not $message) {
    $message = "Manual update from Antigravity"
}
git commit -m $message
git push origin main
