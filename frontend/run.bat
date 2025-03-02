@echo off
:loop
npm run dev
timeout /t 3 > nul
goto loop
