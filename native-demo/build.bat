@echo off
REM 编译 flux-demo.dll（gallery FFI demo 的随包原生库样例）
REM 用法：在 native-demo 目录下直接运行 build.bat，产物落到 ..\assets\native\flux-demo.dll
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" >nul
if not exist "..\assets\native" mkdir "..\assets\native"
cl /nologo /LD /O2 flux-demo.c /Fe:"..\assets\native\flux-demo.dll" /link user32.lib kernel32.lib
if errorlevel 1 (
  echo BUILD-FAILED
  exit /b 1
)
echo BUILD-OK
