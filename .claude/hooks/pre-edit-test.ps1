$j = ($input | Out-String | ConvertFrom-Json)
$f = $j.tool_input.file_path
if ($f -notlike '*task-manager*') { exit 0 }

Push-Location 'C:\Users\Usuario\task-manager'
$out = npm test 2>&1 | Out-String
$code = $LASTEXITCODE
Pop-Location

$s = if ($code -eq 0) { 'PASSED' } else { 'FAILED' }

@{
    systemMessage = "Pre-edit tests: $s"
    hookSpecificOutput = @{
        hookEventName     = 'PreToolUse'
        additionalContext = "PRE-EDIT TEST RUN - ${s}:`n$out"
    }
} | ConvertTo-Json -Compress
