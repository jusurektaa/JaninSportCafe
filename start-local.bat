@echo off
cd /d "%~dp0"
echo.
echo  Janin Sport Cafe - paikallinen esikatselu
echo  ==========================================
echo  Avaa selaimessa:  http://localhost:3000
echo  Lopeta palvelin:   Ctrl+C
echo.
npx --yes serve -l 3000 .
