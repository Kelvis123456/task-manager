$j = ($input | Out-String | ConvertFrom-Json)
$cmd = $j.tool_input.command

# Only intercept PR merge / git merge-to-main commands
$isMerge = $cmd -match 'gh pr merge|git merge\s+(main|master)|git pull.*main|git pull.*master'
if (-not $isMerge) { exit 0 }

Push-Location 'C:\Users\Usuario\task-manager'
$out = npm test 2>&1 | Out-String
$code = $LASTEXITCODE
Pop-Location

if ($code -ne 0) {
    # Extract failure summary
    $failLine = ($out -split "`n" | Select-String 'Tests:.*failed').Line
    if (-not $failLine) { $failLine = "One or more test suites failed." }

    $reason = @"
PR MERGE BLOCKED - unit tests are not passing at 100%.

$failLine

All tests must pass before merging to main. Fix the failing tests and retry.

Full Jest output:
$out
"@
    @{
        hookSpecificOutput = @{
            hookEventName            = 'PreToolUse'
            permissionDecision       = 'deny'
            permissionDecisionReason = $reason
        }
    } | ConvertTo-Json -Compress
    exit 0
}

# 100% pass — inject confirmation context and allow
$passSummary = ($out -split "`n" | Select-String 'Tests:.*passed').Line.Trim()
@{
    hookSpecificOutput = @{
        hookEventName     = 'PreToolUse'
        additionalContext = "PR Merge Gate APPROVED: $passSummary - all tests passing at 100%."
    }
} | ConvertTo-Json -Compress
