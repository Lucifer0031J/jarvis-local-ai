@echo off
title PROJECT J.A.R.V.I.S. Launcher
cd /d "%~dp0"

REM Launch interactive PowerShell terminal in the foreground.
REM -NoExit guarantees the window will NEVER close, so you can see all outputs and errors!
powershell.exe -NoExit -ExecutionPolicy Bypass -File "%~dp0start.ps1"
