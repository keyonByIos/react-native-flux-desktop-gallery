/*
 * flux-demo.c —— gallery FFI demo 的「随包原生库」样例。
 *
 * 目的：证明 react-native-flux-desktop-ffi 能通过相对路径（相对 process.cwd()）加载
 *   应用自带的第三方 DLL，并按声明式签名调用其 extern "C" 导出。
 *   打包成 exe 时，本 .dll 经 app.json 的 pack.nativeLibs 一并内嵌，运行时随解压目录落地。
 *
 * 编译（MSVC，x64）：
 *   cl /LD /O2 flux-demo.c /Fe:flux-demo.dll
 * 只导 extern "C"，避免 C++ name mangling，FFI 侧按裸名解析。
 */
#include <windows.h>

/* 标量入参/返回：求和。FFI 签名：['i32','i32'] -> 'i32' */
__declspec(dllexport) int __cdecl flux_add(int a, int b) {
    return a + b;
}

/* 原生计算：斐波那契（迭代，非递归，纯 CPU）。FFI 签名：['i32'] -> 'i32' */
__declspec(dllexport) int __cdecl flux_fib(int n) {
    int i, a = 0, b = 1, t;
    if (n <= 0) return 0;
    for (i = 0; i < n; i++) { t = a + b; a = b; b = t; }
    return a;
}

/* 输出缓冲区：native 往 out 写 n 个平方数（out[i] = (i+1)^2）。
 * FFI 签名：['ptr','i32'] -> 'void'；JS 侧先 alloc(n*4) 传地址，再 readBytes 读回。 */
__declspec(dllexport) void __cdecl flux_squares(int* out, int n) {
    int i;
    if (!out) return;
    for (i = 0; i < n; i++) out[i] = (i + 1) * (i + 1);
}

/* 宽字符串回显：把输入 wchar_t* 复制到调用方缓冲区并转大写（仅 ASCII 段）。
 * FFI 签名：['u16str','ptr','i32'] -> 'i32'（返回字符数）。演示 u16str 入参封送。 */
__declspec(dllexport) int __cdecl flux_upper_to(const wchar_t* in, wchar_t* out, int cap) {
    int i = 0;
    if (!in || !out || cap <= 0) return 0;
    while (in[i] != L'\0' && i < cap - 1) {
        wchar_t c = in[i];
        if (c >= L'a' && c <= L'z') c = (wchar_t)(c - L'a' + L'A');
        out[i] = c;
        i++;
    }
    out[i] = L'\0';
    return i;
}

BOOL WINAPI DllMain(HINSTANCE h, DWORD reason, LPVOID reserved) {
    (void)h; (void)reason; (void)reserved;
    return TRUE;
}
