@echo off
echo ==============================================
echo   MENJALANKAN EDDY AI BACKEND & CLOUDFLARE TUNNEL
echo ==============================================
echo.
echo 1. Memulai Elysia Backend (Port 3003)...
start "EDDY AI Backend" cmd /k "cd /d C:\project\english-ai && bun run dev:api"

echo 2. Menunggu server siap...
timeout /t 3 >nul

echo 3. Memulai Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:3003"

echo.
echo ==============================================
echo   KEDUA PROSES SUDAH AKTIF DI WINDOW TERPISAH!
echo   - Window Backend mencatat request API & suara
echo   - Window Cloudflare menampilkan URL publik (https://...trycloudflare.com)
echo   - Jangan tutup kedua window selama client mengetes
echo ==============================================
pause
