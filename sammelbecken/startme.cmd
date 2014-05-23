psexec \\127.0.0.1 -u JOBS\Administrator -p vana:99=Nir -e -n 5 cmd /c '
set GATEWAY=0
ipconfig | find "192.168.26.226" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.227" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.228" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.229" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.230" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.231" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.232" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.233" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.234" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.235" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.236" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.237" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.238" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.239" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.240" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.241" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.242" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.243" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.244" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.245" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.246" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.247" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.248" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.249" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
ipconfig | find "192.168.26.250" > ipadress.txt
for /F "tokens=2 delims=:" %%G in ( ipadress.txt ) do set GATEWAY=%%G
del ipadress.txt

if %GATEWAY% geq 1 goto AddRoutes

goto END

:AddRoutes
route delete 192.168.24.0
route add 192.168.24.0 mask 255.255.252.0 %GATEWAY%

set IP1=192.168.25.3
set IP2=192.168.25.7
set HOST_ALIAS1=blog blog.job.ch wiki wiki.job.ch jira.job.ch support support.job.ch fotos fotos.job.ch nagios.job.ch
set HOST_ALIAS2=slx
set HOST_FILE=%SystemRoot%\System32\drivers\etc\hosts
set TEMP_FILE=%TEMP%\hosts.tmp

type %HOST_FILE% | find /v "192.168.25.3" | find /v "192.168.25.7" > %TEMP_FILE%
echo %IP1% %HOST_ALIAS1%>>%TEMP_FILE%
echo ## Added %IP1% %HOST_ALIAS1% to the hostsfile
echo %IP2% %HOST_ALIAS2%>>%TEMP_FILE%
echo ## Added %IP2% %HOST_ALIAS2% to the hostsfile
copy /y %TEMP_FILE% %HOST_FILE%
del /F /Q %TEMP_FILE%

pause
:END
pause
'