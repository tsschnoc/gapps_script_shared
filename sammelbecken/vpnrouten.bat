rem for vpn
ping -n 8 127.0.0.1

rem ***********************************
rem ** Routen                        **
rem ***********************************
SET GATEWAY_JOBS=0
SET GATEWAY=0
SET CARMENSTRASSE=0
 
rem ***********************************
rem ** Statische Route beifuegen     **
rem ***********************************
rem everyware **************************************************************
ipconfig | find "192.168.80" > %SYSTEMROOT%\TEMP\ipadress.txt
for /F "tokens=2 delims=:" %%G in ( %SYSTEMROOT%\TEMP\ipadress.txt ) do set GATEWAY=%%G
del %SYSTEMROOT%\TEMP\ipadress.txt
if %GATEWAY% geq 1 goto AddRoutes
goto RoutenJobs
 
:AddRoutes
route delete 10.212.1.128
route delete 10.212.1.0

route add 10.212.1.128 mask 255.255.255.128 %GATEWAY%
route add 10.212.1.0 mask 255.255.255.128 192.168.24.1

:RoutenJobs
rem jobs ********************************************************************
ipconfig | find "192.168.24.1" > %SYSTEMROOT%\TEMP\carm.txt
for /F "tokens=2 delims=:" %%G in ( %SYSTEMROOT%\TEMP\carm.txt ) do set CARMENSTRASSE=%%G
del %SYSTEMROOT%\TEMP\carm.txt
if %CARMENSTRASSE% geq 1 goto END

:CheckGateway
ipconfig | find "192.168.26" > %SYSTEMROOT%\TEMP\ipadress2.txt
for /F "tokens=2 delims=:" %%G in ( %SYSTEMROOT%\TEMP\ipadress2.txt ) do set GATEWAY_JOBS=%%G
del %SYSTEMROOT%\TEMP\ipadress2.txt
if %GATEWAY_JOBS% geq 1 goto AddRoutesJobs
goto END
 
:AddRoutesJobs
route delete 192.168.24.0
route delete 192.168.25.0
route delete 192.168.26.0
route delete 10.212.1.0

route add 192.168.24.0 mask 255.255.252.0 %GATEWAY_JOBS%
route add 10.212.1.0 mask 255.255.255.128 %GATEWAY_JOBS%

set IP1=192.168.25.3
set IP2=192.168.25.7
set HOST_ALIAS1=blog blog.job.ch wiki wiki.job.ch jira.job.ch support support.job.ch fotos fotos.job.ch nagios.job.ch
set HOST_ALIAS2=slx
set HOST_FILE=%SystemRoot%\System32\drivers\etc\hosts
set TEMP_FILE=%SYSTEMROOT%\TEMP\hosts.tmp

type %HOST_FILE% | find /v "192.168.25.3" | find /v "192.168.25.7" > %TEMP_FILE%
echo %IP1% %HOST_ALIAS1%>>%TEMP_FILE%
echo ## Added %IP1% %HOST_ALIAS1% to the hostsfile
echo %IP2% %HOST_ALIAS2%>>%TEMP_FILE%
echo ## Added %IP2% %HOST_ALIAS2% to the hostsfile
copy /y %TEMP_FILE% %HOST_FILE%
del /F /Q %TEMP_FILE%
 
:END