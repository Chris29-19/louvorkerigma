@echo off
title Publicar LouvorApp - Netlify
cd /d "%~dp0"
cls
echo ============================================
echo    Publicar LouvorApp no Netlify
echo ============================================
echo.
echo  Vou abrir o navegador para voce fazer login
echo  no Netlify (com Google ou GitHub).
echo.
echo  Depois do login, o site sera publicado!
echo.
echo  Se aparecer "No directory linked", escolha:
echo    "Deploy existing project"
echo    "Create a new site" (nome aleatorio)
echo.
pause
echo.
echo Abrindo navegador...
powershell -ExecutionPolicy Bypass -Command "npx netlify-cli deploy --prod --dir=. --open"
echo.
echo Se deu certo, veja o URL acima.
echo Se nao funcionou, faca manualmente:
echo   1. Abra https://app.netlify.com/drop
echo   2. Arraste a pasta "Repertorio louvor" para la
echo.
pause
