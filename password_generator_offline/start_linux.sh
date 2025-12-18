#!/bin/bash

echo "Starte lokalen Server..."

xdg-open http://localhost:8080 >/dev/null 2>&1 &

chmod +x ./server/caddy_linux_amd64

./server/caddy_linux_amd64 file-server --root site --listen localhost:8080

echo "Server wurde beendet."