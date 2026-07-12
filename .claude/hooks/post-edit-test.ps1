$j = ($input | Out-String | ConvertFrom-Json)
$f = $j.tool_input.file_path
if ($f -notlike '*task-manager*') { exit 0 }

Push-Location 'C:\Users\Usuario\task-manager'
$out = npm test 2>&1 | Out-String
$code = $LASTEXITCODE
Pop-Location

if ($code -ne 0) {
    $ctx = @"
UNIT TESTS FAILED after editing $f.

Jest output:
$out

Required actions:
1) Identify each failing test and explain the root cause.
2) Write a numbered fix plan with the exact code changes needed.
3) Present the plan to the user and wait for explicit approval before applying any changes.
"@
} else {
    $ctx = "All tests passed after editing $f."
}

@{
    hookSpecificOutput = @{
        hookEventName     = 'PostToolUse'
        additionalContext = $ctx
    }
} | ConvertTo-Json -Compress
