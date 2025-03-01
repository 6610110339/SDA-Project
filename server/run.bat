@echo off
:loop
npm run develop
timeout /t 3 > nul
goto loop
