#!/bin/bash

echo "Starte lokalen Server..."

open http://localhost:8080

chmod +x ./server/caddy_mac_arm64

./server/caddy_mac_arm64 file-server --root site --listen localhost:8080

echo "Server wurde beendet."