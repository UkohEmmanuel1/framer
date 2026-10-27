@echo off
cd /d "%~dp0"
echo Starting Canvas Studio at http://127.0.0.1:4173
echo Keep this window open while using the editor.
node server.mjs
pause
