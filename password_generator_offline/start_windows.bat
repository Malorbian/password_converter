@echo off
title Passwortgenerator (Offline)

echo Starte lokalen Server...
echo.

start "" http://localhost:8080

server\caddy_windows_amd64.exe file-server --root site --listen localhost:8080

echo.
echo Server wurde beendet.
pause