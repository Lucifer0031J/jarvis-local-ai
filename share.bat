@echo off
title PROJECT J.A.R.V.I.S. Remote Share Gateway
cd /d "%~dp0"

REM Launch interactive PowerShell terminal in the foreground.
REM Extracts your public trycloudflare URL and copies it to clipboard automatically!
powershell.exe -NoExit -ExecutionPolicy Bypass -File "%~dp0share.ps1"
