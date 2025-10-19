@echo off
start cmd /k "php artisan serve"
timeout /t 5 >nul
start chrome http://127.0.0.1:8000
code .
