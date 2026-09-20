---
title: "第一次用 VS Code 写 C++ 的教程"
date: 2026-09-09T11:40:00+08:00
draft: false
categories: ["教程"]
description: "装 VS Code、装 GCC、配环境变量、装插件、按 F6 一键编译运行并弹出独立窗口，最后装 CPH 打比赛。"
tags: ["VS Code", "C++", "GCC", "C++26", "CPH", "环境配置", "教程", "竞赛"]
---

> 写给完全没碰过编程的
>
> 理论上，我们的整包安装脚本，可以双击一个文件全自动装完。但是属于测试阶段，可能会被Windows Defender拦截住。
>
> 想自己一步步装的，从第一节开始往下抄，**每一步都告诉你点哪里、粘什么命令**。全文照做就行。

---

## 零、懒人包（推荐所有人先试这个）

### 下载

脚本放在我自己的服务器上，**国内直连，不用挂梯子**：

| 内容 | 链接 |
| --- | --- |
| **整包（下这个）** | [vscode-dev-setup.zip](https://acm-lycoris.cn/downloads/vscode-dev-setup.zip) |
| 单文件 · 启动器 | [install.cmd](https://acm-lycoris.cn/downloads/vscode-dev-setup/install.cmd) |
| 单文件 · 主脚本 | [setup.ps1](https://acm-lycoris.cn/downloads/vscode-dev-setup/setup.ps1) |
| 说明文档 | [README.md](https://acm-lycoris.cn/downloads/vscode-dev-setup/README.md) |
| **源码仓库（GitHub）** | <https://github.com/Lyra-Lycoris/vscode-dev-setup> |

整包 SHA-256（不放心的可以自己校验）：

```text
DFEDD1E052FD26A595CC5E39B7EF9CBA265977E82CE53D3DB61566D96625EF2C
```

### 用法

1. 下载 zip，**解压出来**（重点：不要在压缩包里直接双击）。
2. 确认 `install.cmd` 和 `setup.ps1` 在同一个文件夹里。
3. 双击 **`install.cmd`**。
4. 弹出蓝色窗口问「你要允许此应用对你的设备进行更改吗」，点 **「是」**。
5. 等着。全程要联网，快的十几分钟，慢的一小时。
6. 看到绿色的 **`SUCCESS`** 就成了，它会自动打开 VS Code。

### 它帮你装了什么

- **VS Code**（写代码的编辑器）
- **GCC 编译器**（MSYS2 UCRT64 里的 g++ / gdb，就是下面第二节要手动装的东西）
- Python 3.13、Java 21（顺手装的，以后课上要用）
- VS Code 的 C/C++、Python、Java 插件
- 帮你配好环境变量
- 生成三个能直接跑的示例项目，而且**真的编译运行了一遍**，跑通才报 SUCCESS

### 几个说明

- 装到一半断网了？**再双击一次就行**，装好的不会重装。
- 每次运行都新建一个示例文件夹，**不会覆盖你写的代码**。
- 装完**必须关掉所有已经开着的 VS Code 和终端窗口再重开**，环境变量才生效。

> 懒人包装完之后，请**直接跳到第四节**装插件，然后往下配 Compile Run 和 CPH。第一到第三节是给想手动装的人看的，你已经不需要了。

---

## 一、装 VS Code

### 下载

打开 <https://code.visualstudio.com/Download>

页面上 Windows 那一块有三个按钮，**认准这个**：

| 按钮 | 选不选 |
| --- | --- |
| **User Installer · x64** | ✅ **选这个** |
| System Installer · x64 | ❌ 不用 |
| .zip / CLI | ❌ 不用 |

> 只有 Surface Pro X 这类 ARM 笔记本才选 Arm64。**99% 的人都是 x64**，不确定就选 x64。

### 安装

双击下载好的安装包，一路「下一步」。走到 **「选择附加任务」** 这一页时停一下，**四个全部勾上**：

- ☑ 将「通过 Code 打开」操作添加到 Windows 资源管理器**文件**上下文菜单
- ☑ 将「通过 Code 打开」操作添加到 Windows 资源管理器**目录**上下文菜单
- ☑ 将 Code 注册为受支持的文件类型的编辑器
- ☑ **添加到 PATH** ← **这个千万别取消**

然后一路下一步装完。

### 装中文界面

打开 VS Code，按 **`Ctrl + Shift + X`**，在左边搜索框里输入 `Chinese`，找到 **Chinese (Simplified) Language Pack**，点 **Install**。

装完右下角会弹提示问要不要重启，点 **Restart**，界面就变中文了。

---

## 二、装编译器 GCC

**先说清楚一件事：VS Code 只是个写字的工具，它自己不会编译 C++。** 就像 Word 不会帮你打印一样，得单独装个编译器。

我们装 **GCC**（业界最主流的 C++ 编译器，Codeforces、洛谷、力扣的评测机用的都是它）。Windows 上装 GCC 最省事的方式是通过 **MSYS2**。

### 第 1 步：下载 MSYS2

**国内直链（快）**：

```text
https://mirrors.tuna.tsinghua.edu.cn/msys2/distrib/msys2-x86_64-latest.exe
```

官网（慢一点）：<https://www.msys2.org/>

### 第 2 步：安装

双击安装包，**一路「下一步」，什么都别改**。

安装路径保持默认的 **`C:\msys64`** —— 后面所有命令都是按这个路径写的，你改了就得自己对着改，没必要给自己找麻烦。

最后一页有个「Run MSYS2 now」的勾，**取消掉**，我们等下从开始菜单开。

### 第 3 步：换成国内镜像源（不换会很慢）

MSYS2 默认从国外服务器下载，国内速度感人。换成清华源。

**右键点开始菜单** → 选 **「终端」**（或者「Windows PowerShell」），把下面这一整段粘进去按回车：

```powershell
$m = 'C:\msys64\etc\pacman.d'
$lines = @{
  'mirrorlist.mingw' = 'Server = https://mirrors.tuna.tsinghua.edu.cn/msys2/mingw/$repo/'
  'mirrorlist.msys'  = 'Server = https://mirrors.tuna.tsinghua.edu.cn/msys2/msys/$arch/'
}
foreach ($f in $lines.Keys) {
    $p = Join-Path $m $f
    if (-not (Test-Path $p)) { Write-Host "跳过 $f（没找到）"; continue }
    $c = Get-Content $p -Raw
    if ($c.TrimStart().StartsWith('Server = https://mirrors.tuna')) {
        Write-Host "$f 已经是清华源了"
    } else {
        Set-Content $p ($lines[$f] + "`n" + $c) -Encoding ASCII
        Write-Host "$f 已切换到清华源"
    }
}
Write-Host "`n完成。"
```

> **怎么粘贴？** 复制之后在终端窗口里**点一下右键**就粘进去了，或者按 `Ctrl + V`。粘完按一下**回车**。

### 第 4 步：装 GCC

在开始菜单里搜 **「MSYS2 UCRT64」**（图标是紫色的），打开它。会弹出一个紫色的终端窗口。

**先更新系统**，粘进去回车：

```bash
pacman -Syu
```

中途问你 `[Y/n]` 就直接按回车。**如果它更新完自己把窗口关了，这是正常的**，重新打开「MSYS2 UCRT64」再执行一次上面这条命令。

然后**装编译器**：

```bash
pacman -S --needed mingw-w64-ucrt-x86_64-gcc mingw-w64-ucrt-x86_64-gdb
```

问 `[Y/n]` 一路回车。装完把这个紫色窗口关掉，**后面再也不用打开它了**。

---

## 三、配环境变量（一个脚本搞定）

编译器装好了，但 Windows 还不知道它在哪。要告诉系统一声。

**别去点那个「系统属性 → 环境变量」的窗口**，容易点错还容易把原来的东西删掉。直接跑脚本。

**右键开始菜单 → 「终端」**，把下面一整段粘进去回车：

```powershell
# 自动找到 GCC 并加进环境变量
$cands = @(
    'C:\msys64\ucrt64\bin',
    "$env:LOCALAPPDATA\msys64\ucrt64\bin",
    'D:\msys64\ucrt64\bin',
    'E:\msys64\ucrt64\bin'
)
$bin = $cands | Where-Object { Test-Path (Join-Path $_ 'g++.exe') } | Select-Object -First 1
if (-not $bin) { throw '没找到 g++.exe，请先完成第二节把 GCC 装上' }
Write-Host "找到编译器: $bin"

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if (($userPath -split ';') -contains $bin) {
    Write-Host '环境变量里已经有了，不用重复添加'
} else {
    [Environment]::SetEnvironmentVariable('Path', "$bin;$userPath", 'User')
    Write-Host '已写入环境变量'
}

Write-Host "`n===== 完成 ====="
Write-Host '请把所有终端窗口和 VS Code 全部关掉，重新打开再验证。'
```

看到 `===== 完成 =====` 就成了。

### 验证

**把所有终端窗口和 VS Code 全部关掉**（这一步别偷懒，环境变量只对新开的窗口生效）。

重新右键开始菜单 → 「终端」，输入：

```powershell
g++ --version
```

能看到类似这样的输出就对了：

```text
g++.exe (Rev5, Built by MSYS2 project) 16.1.0
```

再验证调试器：

```powershell
gdb --version
```

两个都有输出，这一节就过了。

> **要是提示「无法将 g++ 项识别为 cmdlet」**：说明环境变量没生效。检查两点 ——（1）终端窗口是不是重开过了；（2）第二节的 `pacman -S` 是不是真的装成功了。

---

## 四、装 VS Code 插件

打开 VS Code，在顶部菜单点 **「终端」→「新建终端」**，下面会出现一个终端框。把下面四行**一次性**粘进去，按回车：

```powershell
code --install-extension ms-vscode.cpptools
code --install-extension danielpinto8zz6.c-cpp-compile-run
code --install-extension DivyanshuAgrawal.competitive-programming-helper
code --install-extension MS-CEINTL.vscode-language-pack-zh-hans
```

装的是这四个：

| 插件 | 干什么 |
| --- | --- |
| **C/C++** | 微软官方，负责代码高亮、自动补全、报错提示。必装 |
| **C/C++ Compile Run** | **按 F6 一键编译运行。主角** |
| **CPH** | 打比赛用，一键跑完所有样例。第七节讲 |
| 中文语言包 | 界面变中文 |

### 这几个别装

装了会打架，看到了绕开走：

- ❌ **Code Runner**（名字很像，功能重复，会抢快捷键）
- ❌ **C/C++ Extension Pack**（塞了一堆你用不上的东西）
- ❌ 各种第三方的「C++ 智能提示」插件

装完按 **`Ctrl + Shift + P`**，输入 `Reload Window`，回车重载一下。

---

## 五、配置 C/C++ Compile Run

这个插件最舒服的一点是：**F6 是它自带的，不用你去配快捷键，也不用写什么 tasks.json、launch.json。** 只要改几行设置就完事。

### 改设置

按 **`Ctrl + Shift + P`** → 输入 `Preferences: Open User Settings (JSON)` → 回车。

会打开一个叫 `settings.json` 的文件。把下面这段粘进最外层那对大括号 `{ }` 里面：

```json
{
  "c-cpp-compile-run.cpp-compiler": "C:/msys64/ucrt64/bin/g++.exe",
  "c-cpp-compile-run.c-compiler": "C:/msys64/ucrt64/bin/gcc.exe",
  "c-cpp-compile-run.cpp-flags": "-std=c++26 -O2 -Wall -Wextra -g3",
  "c-cpp-compile-run.c-flags": "-std=c23 -O2 -Wall -Wextra -g3",
  "c-cpp-compile-run.run-in-external-terminal": true,
  "c-cpp-compile-run.save-before-compile": true
}
```

逐行说明：

| 这一行 | 干什么 |
| --- | --- |
| `cpp-compiler` / `c-compiler` | 告诉插件编译器在哪。**MSYS2 没装在 C 盘的话把盘符改掉** |
| `cpp-flags` | 编译参数。**`-std=c++26` 就是 C++26 开关**，这一行千万别写错 |
| `run-in-external-terminal` | **设成 `true`，按 F6 就会弹出独立的黑框窗口** |
| `save-before-compile` | 按 F6 自动帮你存盘，不用每次 `Ctrl+S` |

两个注意点：

1. **路径用正斜杠 `/`**，不要用反斜杠 `\`，JSON 里会报错。
2. 如果 `settings.json` 里原来已经有内容，**在最后一项后面补个逗号 `,` 再粘**，别把原来的删掉。

存盘（**`Ctrl + S`**）。

### 快捷键（全是自带的，不用配）

| 键 | 作用 |
| --- | --- |
| **F6** | **编译 + 运行**（最常用，就用这个） |
| **F8** | 编译 + 运行，**强制弹出独立窗口**（不管上面那个设置是 true 还是 false） |
| **F7** | 编译 + 运行，但会先问你要不要临时改编译参数和运行参数 |
| **F5** | 调试（打断点单步跑） |
| `Ctrl + 6` | 和 F6 一样 |

### 关于那个弹出来的黑框窗口

设了 `run-in-external-terminal: true` 之后，按 F6 会弹出一个独立的 cmd 窗口跑你的程序。

**程序跑完窗口不会自己关**，会停在那儿显示：

```text
请按任意键继续. . .
```

按一下键才关掉，所以你有充足的时间看输出，不用担心一闪而过。

不想每次都弹窗的话，把 `run-in-external-terminal` 改成 `false`，程序就在 VS Code 下方的终端里跑；**需要弹窗的时候按 F8 就行**，F8 是强制弹窗，不受设置影响。

> ⚠️ **弹出来的窗口不认中文。** 那个独立窗口用的是系统默认编码，你的程序里如果 `cout` 中文字符串，会显示成 `鎺掑簭鍚` 这种乱码。
>
> 解决办法：**竞赛代码本来就不该输出中文**（输出格式题目都规定死了）。真要打印中文调试，改用 F6 + `run-in-external-terminal: false`，VS Code 自带的终端是认 UTF-8 的。

### 编译出来的 exe 在哪

默认放在**源文件旁边的 `output` 文件夹**里。比如你在 `D:\code\main.cpp` 按 F6，可执行文件就是 `D:\code\output\main.exe`。

这个文件夹是自动建的，不用管它。

---

## 六、写个程序验证一下

新建一个文件夹放代码，**路径里不要有中文、不要有空格**。比如 `D:\code` 就很好，`D:\我的 C++ 作业` 就会出各种莫名其妙的问题。

用 VS Code 打开这个文件夹（菜单 → 文件 → 打开文件夹），新建 `main.cpp`，输入：

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <format>

int main() {
    int n;
    if (!(std::cin >> n)) {
        std::cout << "no input\n";
        return 0;
    }

    std::vector<int> a(n);
    for (int& x : a) std::cin >> x;

    std::ranges::sort(a);
    long long sum = std::reduce(a.begin(), a.end(), 0LL);

    std::cout << std::format("__cplusplus = {}\n", __cplusplus);
    std::cout << std::format("sorted : {}\n", a);
    std::cout << std::format("sum = {}, max = {}\n", sum, a.back());
    return 0;
}
```

按 **F6**。弹出来的黑窗口里输入：

```text
5
3 1 4 1 5
```

回车。正确输出长这样：

```text
__cplusplus = 202400
sorted : [1, 1, 3, 4, 5]
sum = 14, max = 5

请按任意键继续. . .
```

**看到 `202400` 就说明 C++26 真的开起来了。**

对照表，看看你的数字是多少：

| 你看到的 | 什么情况 |
| --- | --- |
| **202400** | ✅ C++26，配置完全正确 |
| 202302 | C++23。GCC 版本旧了，回第二节跑一次 `pacman -Syu` |
| 201703 | C++17。第五节的 `cpp-flags` 那一行没写对 |

顺便说一句，这段代码里的 `std::format("{}", a)` 能直接把整个数组打印成 `[1, 1, 3, 4, 5]`，是新标准才有的本事，老的 C++ 得自己写循环。

到这里环境就全配好了，可以开始写代码了。

---

## 七、CPH：打比赛用的神器

前面配的东西够你写作业了。但要**打比赛**，还差一个。

想想平时怎么测样例：复制题目样例 → 切到窗口 → 粘贴 → 回车 → 用眼睛比对输出对不对 → 不对就改 → 再来一遍。一道题三个样例，一场比赛五道题，光复制粘贴就能耗掉半小时。

**CPH 就是来干掉这半小时的。**

它能：

- 把一道题的**所有样例存在 VS Code 里**，写一次以后一直在
- **按一个键跑完全部样例**，绿色 = 过，红色 = 挂，还会告诉你哪个字符开始不一样
- 除了题目样例，自己造的边界数据也能一起塞进去批量测

### 配置

按 `Ctrl + Shift + P` → `Preferences: Open User Settings (JSON)`，在大括号里再加两行：

```json
{
  "cph.language.cpp.Args": "-std=c++26 -O2 -Wall",
  "cph.general.timeOut": 3000
}
```

**就这么多。** CPH 默认就是用 `g++` 编译的，你第三节已经把 g++ 加进环境变量了，所以它直接就能找到，不用配路径。

（`timeOut` 是单个样例的超时时间，单位毫秒，3000 就是 3 秒。）

> CPH 用的是 `Ctrl + Alt + B` 这类快捷键，和 Compile Run 的 F5~F8 **不冲突**，两个插件可以放心一起用。

### 第 1 步：打开判题面板，创建题目

装完 CPH 之后，VS Code **最左边那条竖着的图标栏**会多出一个**柱状图图标**，点它就能打开 **「CPH 评测器」** 面板。

打开你要写的 `.cpp` 文件，面板里会显示「此文档没有关联的 CPH 题目。」，点那个蓝色的 **「＋ 创建题目」**：

![CPH 面板：创建题目](/images/cph/cph-create-problem.png)

### 第 2 步：把样例填进去

创建完会出现一张叫 **TC 1** 的卡片，上面两个框：

- **输入** —— 把题目样例的输入原样粘进去
- **预期输出** —— 把样例给的正确答案原样粘进去

![CPH 面板：填测试用例](/images/cph/cph-testcase-panel.png)

界面上几个地方解释一下：

| 位置 | 是什么 |
| --- | --- |
| 左上角 `Local: B_Apartments` | 题目名，就是你的文件名 |
| 右上角 `0 / 1 通过` | 通过数 / 总数。**全过了会变成 `1 / 1 通过`** |
| 卡片右上角 **绿色 ▶** | 只跑这一个用例 |
| 卡片右上角 **红色垃圾桶** | 删掉这一个用例 |
| 输入框右边的「复制」 | 把框里内容复制走 |

### 第 3 步：题目有几个样例就加几个

点绿色的 **「＋ 新建测试用例」**，会出现 TC 2、TC 3……一个样例一张卡片，全部填进去。

**建议连样例之外的数据也加进去**：边界情况（n = 1、全是 0、最大值）自己造几组填进来，比赛时能省下大把 WA 的时间。

### 第 4 步：跑

写完代码之后，两种跑法：

- 点面板底部蓝色的 **「运行全部」**
- 或者直接按 **`Ctrl + Alt + B`**（不用离开代码，更快）

改完代码再按一次 `Ctrl + Alt + B` 就重新编译加重跑，**全程不用碰鼠标**。

### 结果怎么看

每张卡片会变颜色：

| 颜色 | 什么意思 |
| --- | --- |
| 🟢 **AC / Passed** | 过了 |
| 🔴 **WA / Failed** | 答案不对。**点开会把你的输出和正确答案并排放** |

除此之外，他可能会报SIGTERM
这种情况就是时间超限，比如你的算法太慢了，或者出现死循环
还可能会爆掉，弹出一堆乱码，这时候你就要看看你的代码是不是有啥问题，比如数组越界，或者纯粹的编译错误

### 记住这两个键

| 键 | 作用 |
| --- | --- |
| `Ctrl + Alt + B` | 编译并跑全部用例 |
| `Ctrl + Alt + D` | 光标跳到判题面板 |

### 面板底下那些按钮

- **「导入」** —— 从文件批量导入测试数据，数据多的时候用得上。
- **「设置 ONLINE_JUDGE」** —— 勾上之后 CPH 编译时会多加一个 `-D ONLINE_JUDGE`，配合代码里的 `#ifndef ONLINE_JUDGE` 用。**新手用不上，别勾。**
- 剩下的「支持」「反馈」「猫咪」「关于」都是作者的链接，不用管。

### 新手常踩的坑

| 现象 | 怎么办 |
| --- | --- |
| 提示 `Could not launch the compiler g++` | g++ 不在环境变量里 → 回第三节 |
| 点了「运行全部」没反应 | 代码有编译错误。看 VS Code 下方的「输出」面板 |
| **所有用例都 WA，但输出看着一模一样** | 多半是**行尾多了空格**或**最后少了换行**。点开对比面板它会标出来 |
| 预期输出填错了导致一直 WA | 从题目页面复制的时候**别把多余的空行也复制进来** |
| 用例都过了，交上去还是 WA | CPH 只测你填的数据。样例过了不代表题做对了，该想的还是得想 |

---

## 八、报错速查表

配环境卡住了，先在这里找：

| 现象 | 原因 | 怎么办 |
| --- | --- | --- |
| `无法将"g++"项识别为 cmdlet` | 环境变量没配或没生效 | 第三节，**并且把所有窗口关掉重开** |
| 按 F6 没反应 | 光标不在 `.cpp` 文件里 | 先点一下代码区域再按 |
| 按 F6 提示找不到编译器 | 第五节的路径写错了 | 检查盘符，检查用的是不是正斜杠 `/` |
| `pacman` 下载卡住不动 | 用的国外源 | 第二节第 3 步换清华源 |
| **黑框窗口里中文乱码** | 外部窗口不认 UTF-8 | 代码别输出中文；或把 `run-in-external-terminal` 改成 `false` |
| `__cplusplus` 显示 201703 | `cpp-flags` 没写对 | 第五节检查那一行 |
| `error: 'format' is not a member of 'std'` | 标准版本太低 | 同上 |
| 改了代码但运行结果没变 | 插件判断源文件没改就不重编译 | 先 `Ctrl + S` 存盘再按 F6 |
| 代码全是红波浪线但能编译 | 插件的索引乱了 | `Ctrl+Shift+P` → `C/C++: Reset IntelliSense Database` |
| 编译报一堆看不懂的错 | 路径里有中文或空格 | 把代码挪到 `D:\code` 这种纯英文路径下 |
| 改完设置没效果 | 没存盘 | `Ctrl + S`，然后 `Ctrl+Shift+P` → `Reload Window` |

---

## 九、最后

配完之后你的日常就三个键：

- **F6** —— 编译运行，弹窗看结果
- **F5** —— 打断点调试
- **`Ctrl + Alt + B`** —— 一键跑完所有样例

再也不用复制粘贴样例了。

懒人包的源码都在这，欢迎提 issue：

**<https://github.com/Lyra-Lycoris/vscode-dev-setup>**

国内直链再放一次，收藏起来给同学发：

**<https://acm-lycoris.cn/downloads/vscode-dev-setup.zip>**