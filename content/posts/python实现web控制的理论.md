---
title: "python实现web控制的理论"
date: 2026-06-15T12:41:24+08:00
draft: false
categories: ["Hack"]
description: "从 requests 到 Selenium，手把手拆 HTML、填表单、点按钮、拿接口数据"
tags: ["Hack", "Python", "Web", "爬虫", "Selenium"]
---

> 这篇文章写给刚开始接触 Python Web 操作的同学。
>
> 别一看到“控制网页”“自动化”“爬虫”就觉得很神秘。说白了，网页也是一堆文本和按钮。我们要做的事情，就是先看懂网页的 HTML 长什么样，再让 Python 按我们的想法去请求页面、填写输入框、点击按钮、读取结果。
>
> 下面用我们的作业 `05-web操作模拟系统/web.py` 来讲。文章会尽量按代码顺序走，每一小段代码后面都配逐行解释。你不用急着背代码，先把“这一行为什么要写”想明白。

## 一、先说人话：Web 控制到底在控制什么

浏览器打开一个网页时，其实做了很多事：

1. 向服务器发请求。
2. 拿到 HTML、CSS、JavaScript。
3. 把 HTML 渲染成我们看到的页面。
4. 点击按钮、填写输入框时，页面可能继续请求后台接口。
5. 后台接口再把数据返回给浏览器。

所以 Python 控制网页，一般有两种路线：

| 路线 | 适合场景 | 本文用到的库 |
|---|---|---|
| 直接请求网页 | 数据本来就在 HTML 里 | `requests`、`BeautifulSoup` |
| 控制真实浏览器 | 页面需要点击、输入、执行 JavaScript | `selenium` |

我们的作业刚好两种都用了：

- 第一部分：去 `quotes.toscrape.com` 抓名人名言，练习怎么拆 HTML。
- 第二部分：打开 12306 查票页，练习怎么填表、点查询、再请求接口拿车票数据。

这就很适合入门，因为它不是只讲理论，而是把“网页从哪里来、HTML 怎么拆、按钮怎么点、数据怎么落地”串了一遍。

## 二、先导入工具包

先看开头这几行：

```python
import requests
from bs4 import BeautifulSoup
import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `import requests` | 导入 `requests` 库，用来向网页发 HTTP 请求。你可以把它理解成“Python 版浏览器请求器”。 |
| `from bs4 import BeautifulSoup` | 从 `bs4` 里导入 `BeautifulSoup`，用来解析 HTML。HTML 是一大串文本，Soup 能帮我们按标签去找内容。 |
| `import csv` | 导入 Python 自带的 CSV 工具，后面要把查票结果写成 `tickets.csv`。 |
| `from selenium import webdriver` | 导入 Selenium 的浏览器驱动入口。后面打开 Edge 浏览器要靠它。 |
| `from selenium.webdriver.common.by import By` | 导入定位方式，比如按 `id` 找按钮、按 `class` 找元素。 |
| `import time` | 导入时间模块，后面用 `time.sleep()` 暂停一下，给网页加载留时间。 |

这几行其实已经把作业分成了两类工具：

- `requests + BeautifulSoup`：负责“拿网页、拆网页”。
- `selenium`：负责“打开浏览器、控制浏览器”。

## 三、第一阶段开始：先请求静态网页

作业第一部分是爬取 `https://quotes.toscrape.com` 上的名人名言。

代码如下：

```python
x = input("点击任意键启动")
print("第一部分：爬虫与写入文件试验")
print("请不要操作，我们会爬取url = https://quotes.toscrape.com上的名人名言数据")
url = "https://quotes.toscrape.com"
response = requests.get(url)
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `x = input("点击任意键启动")` | 让程序先停住，等你在终端按回车。这里的 `x` 其实后面没用，只是为了暂停程序。 |
| `print("第一部分：爬虫与写入文件试验")` | 在终端打印提示，告诉使用者现在进入第一部分。 |
| `print("请不要操作，我们会爬取url = https://quotes.toscrape.com上的名人名言数据")` | 再打印一行说明，让使用者知道程序接下来要访问哪个网站。 |
| `url = "https://quotes.toscrape.com"` | 把目标网址保存到变量 `url` 里。以后如果网址要改，只改这一行就行。 |
| `response = requests.get(url)` | 用 `requests` 向这个网址发送 GET 请求，并把服务器返回的结果保存到 `response`。 |

这里最重要的是最后一行。

`requests.get(url)` 的意思是：“Python，你帮我访问一下这个网址，把服务器回给你的东西拿回来。”

注意，它拿回来的不是浏览器画面，而是服务器返回的原始内容。对普通网页来说，这个内容通常就是 HTML。

## 四、检查服务器有没有正常返回

请求发出去了，下一步要先看服务器有没有正常回应。

```python
print("服务器状态：", response.status_code)
if response.status_code == 200:
    print("服务器正常")
else:
    print("异常error,Wrong Code:", response.status_code, "Please Repair")
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `print("服务器状态：", response.status_code)` | 打印服务器状态码。状态码能告诉我们请求成不成功。 |
| `if response.status_code == 200:` | 判断状态码是不是 `200`。HTTP 里 `200` 一般表示请求成功。 |
| `    print("服务器正常")` | 如果状态码是 `200`，说明网页正常返回，就打印“服务器正常”。 |
| `else:` | 如果状态码不是 `200`，就走这里。 |
| `    print("异常error,Wrong Code:", response.status_code, "Please Repair")` | 打印异常提示，并把实际状态码也输出出来，方便排查问题。 |

为什么要看状态码？

因为后面要解析 HTML。如果请求失败了，比如返回 `404` 或 `403`，你再去 `find_all()` 就没意义了。你解析到的可能不是网页正文，而是一页错误提示。

常见状态码可以先记这几个：

| 状态码 | 大概意思 |
|---|---|
| `200` | 请求成功 |
| `403` | 被服务器拒绝 |
| `404` | 页面不存在 |
| `500` | 服务器内部错误 |

## 五、把 HTML 变成可以查找的结构

服务器返回的是一整段 HTML 文本，直接用字符串找很痛苦，所以要交给 BeautifulSoup。

```python
soup = BeautifulSoup(response.text, "html.parser")

quotes = soup.find_all("div", class_="quote")
print("当页的名言数量", len(quotes))
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `soup = BeautifulSoup(response.text, "html.parser")` | 把网页 HTML 文本交给 BeautifulSoup 解析，解析后的对象叫 `soup`。 |
| 空行 | 空行不影响程序，只是让代码看起来更清楚。 |
| `quotes = soup.find_all("div", class_="quote")` | 在整页 HTML 里找所有 `<div class="quote">`，每一个就是一条名言卡片。 |
| `print("当页的名言数量", len(quotes))` | 打印找到多少条名言。`len(quotes)` 就是列表长度。 |

这一段是“拆 HTML”的核心。

HTML 可以想成一堆盒子套盒子。网页上一条名言大概长这样：

```html
<div class="quote">
  <span class="text">一句名言</span>
  <small class="author">作者名字</small>
</div>
```

逐行解释这个 HTML：

| HTML | 这行代表什么 |
|---|---|
| `<div class="quote">` | 一个大盒子，`class="quote"` 说明它是一条名言区域。 |
| `<span class="text">一句名言</span>` | 名言正文，`class="text"` 可以帮我们定位它。 |
| `<small class="author">作者名字</small>` | 作者名字，`class="author"` 可以帮我们定位它。 |
| `</div>` | 大盒子结束。 |

所以我们不是直接在全网页里乱找文本，而是先找所有 `quote` 大盒子，再到每个大盒子里面找正文和作者。

这就是初学者拆 HTML 最该养成的习惯：**先找一条数据的外壳，再从外壳里拿字段。**

## 六、把名言和作者取出来，写进 txt

接下来把每条名言取出来，打印到终端，同时写入 `quotes.txt`。

```python
print("打印数据...并写入本地quote.txt")
with open("quotes.txt", "w", encoding="utf-8") as f:
    for quote in quotes:
        text = quote.find("span", class_="text").text
        author = quote.find("small", class_="author").text
        print(f"作者：{author:<20} 名言：{text}")
        f.write(f"{author:<20} {text}\n")
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `print("打印数据...并写入本地quote.txt")` | 打印提示，告诉使用者程序要开始输出数据并写文件了。 |
| `with open("quotes.txt", "w", encoding="utf-8") as f:` | 打开一个叫 `quotes.txt` 的文件，模式是写入，编码用 `utf-8`，打开后的文件对象叫 `f`。 |
| `    for quote in quotes:` | 遍历刚才找到的所有名言大盒子，每次循环处理一条名言。 |
| `        text = quote.find("span", class_="text").text` | 在当前这条名言里找 `<span class="text">`，再用 `.text` 取出里面的文字。 |
| `        author = quote.find("small", class_="author").text` | 在当前这条名言里找 `<small class="author">`，取出作者名字。 |
| `        print(f"作者：{author:<20} 名言：{text}")` | 把作者和名言打印到终端。`{author:<20}` 表示作者名字左对齐，占 20 个字符宽度。 |
| `        f.write(f"{author:<20} {text}\n")` | 把作者和名言写进文件，末尾的 `\n` 表示换行。 |

这里要特别注意两个细节。

第一，`quote.find(...)` 是在当前这一条名言里面找，不是在整页里找。这样不会串数据。

第二，`.text` 是取标签里的文字。比如：

```html
<small class="author">Albert Einstein</small>
```

对这个标签调用 `.text`，得到的就是：

```text
Albert Einstein
```

到这里，第一阶段就完成了。它的完整思路是：

```text
访问网页 -> 检查状态码 -> 解析 HTML -> 找重复块 -> 提取字段 -> 写入文件
```

## 七、第一阶段结束，准备进入浏览器控制

代码里用几行提示把两个阶段隔开：

```python
time.sleep(0.5)
print("\n")
print("爬虫部分结束，已经将数据集写入quotes.txt")
print("\n")
time.sleep(0.8)
input("第二阶段查票脚本,按任意键启动")
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `time.sleep(0.5)` | 暂停 0.5 秒，让输出节奏慢一点，方便人看。 |
| `print("\n")` | 打印一个换行，让终端显示不那么挤。 |
| `print("爬虫部分结束，已经将数据集写入quotes.txt")` | 提示第一阶段结束，文件已经写好了。 |
| `print("\n")` | 再打印一个换行。 |
| `time.sleep(0.8)` | 再暂停 0.8 秒。 |
| `input("第二阶段查票脚本,按任意键启动")` | 程序停住，等用户确认后再进入第二阶段。 |

这些行不影响核心逻辑，主要是为了让程序跑起来更像一个“有步骤的演示程序”。

## 八、第二阶段：打开 12306 查票页面

接下来开始用 Selenium 控制浏览器。

```python
driver = webdriver.Edge()
driver.get("https://kyfw.12306.cn/otn/leftTicket/init")
time.sleep(2)
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `driver = webdriver.Edge()` | 启动一个 Edge 浏览器，并把这个浏览器对象保存到 `driver`。以后控制浏览器都靠它。 |
| `driver.get("https://kyfw.12306.cn/otn/leftTicket/init")` | 让浏览器打开 12306 余票查询页面。 |
| `time.sleep(2)` | 暂停 2 秒，给网页加载时间。 |

这里的 `driver` 可以理解成“遥控器”。

你后面写：

```python
driver.find_element(...)
driver.execute_script(...)
driver.get_cookies()
```

本质上都是在对这个浏览器发命令。

## 九、拆 12306 的输入框：为什么要看 hidden

作业里记录了 12306 的核心 HTML。我们不用把整段都背下来，先看最关键的出发地输入框：

```html
<input id="fromStation" type="hidden" value="" name="leftTicketDTO.from_station">
<input autocomplete="off" type="text" id="fromStationText" class="inp-txt" value="" name="leftTicketDTO.from_station_name">
```

逐行解释：

| HTML | 这行代表什么 |
|---|---|
| `<input id="fromStation" type="hidden" value="" name="leftTicketDTO.from_station">` | 隐藏输入框，页面上看不见。它保存真正提交给服务器的出发站编码。 |
| `<input autocomplete="off" type="text" id="fromStationText" class="inp-txt" value="" name="leftTicketDTO.from_station_name">` | 可见输入框，用户能看到、能输入。它保存“北京”这种中文站名。 |

这就是 12306 这种网页最容易坑新手的地方。

你在页面上看到的是“北京”，但服务器真正要的可能是 `BJP`。如果你只把可见输入框填成“北京”，页面上看着没问题，实际查询时可能参数还是不对。

所以 Web 控制不能只盯着页面表面，要看 HTML 里有没有：

- `type="hidden"`：隐藏字段。
- `name="leftTicketDTO.from_station"`：真正提交给后端的字段名。
- `id="fromStation"`：脚本可以用来定位它。

一句话：**看得见的值给人看，看不见的值给服务器看。**

## 十、用 JavaScript 填出发地

作业里没有慢慢敲输入框，而是直接用 JavaScript 改页面里的值。

```python
driver.execute_script("document.getElementById('fromStationText').value = '北京';")
driver.execute_script(
    "document.getElementById('fromStation').value = 'BJP';"
)
time.sleep(1)
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `driver.execute_script("document.getElementById('fromStationText').value = '北京';")` | 让浏览器执行一段 JavaScript，把可见输入框 `fromStationText` 的值改成“北京”。 |
| `driver.execute_script(` | 开始执行另一段 JavaScript。这里分多行写，是为了让代码不太长。 |
| `    "document.getElementById('fromStation').value = 'BJP';"` | 把隐藏输入框 `fromStation` 的值改成 `BJP`，也就是北京站的编码。 |
| `)` | 结束这次 `execute_script()` 调用。 |
| `time.sleep(1)` | 暂停 1 秒，让页面状态稳定一下，也方便肉眼观察。 |

里面那段 JavaScript 也拆一下：

```javascript
document.getElementById('fromStationText').value = '北京';
```

逐段解释：

| 片段 | 意思 |
|---|---|
| `document` | 当前网页文档。 |
| `getElementById('fromStationText')` | 按 `id` 找到出发地的可见输入框。 |
| `.value` | 输入框当前的值。 |
| `= '北京'` | 把这个值改成“北京”。 |

这一步完成后，页面上显示的是“北京”，隐藏字段里存的是 `BJP`。两个都填，才像人真的在 12306 里选好了北京。

## 十一、用同样的方法填目的地

到达地也是一套类似结构：

```python
driver.execute_script("document.getElementById('toStationText').value = '上海';")
driver.execute_script(
    "document.getElementById('toStation').value = 'SHH';"
)

time.sleep(1)
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `driver.execute_script("document.getElementById('toStationText').value = '上海';")` | 把可见的目的地输入框改成“上海”。 |
| `driver.execute_script(` | 开始执行另一段 JavaScript。 |
| `    "document.getElementById('toStation').value = 'SHH';"` | 把隐藏的目的地编码改成 `SHH`，这是上海的站点编码。 |
| `)` | 结束这次函数调用。 |
| 空行 | 空行只为了分隔代码，不影响运行。 |
| `time.sleep(1)` | 暂停 1 秒。 |

这里和出发地完全一样：

```text
toStationText 负责显示“上海”
toStation 负责提交“SHH”
```

这就是拆表单时最重要的一件事：**不要只问页面显示什么，还要问后端真正收到什么。**

## 十二、填写出发日期

接下来填日期：

```python
driver.execute_script("document.getElementById('train_date').value = '2026-06-15';")
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `driver.execute_script("document.getElementById('train_date').value = '2026-06-15';")` | 找到 `id="train_date"` 的日期输入框，把它的值改成 `2026-06-15`。 |

这行看起来很短，其实做了三件事：

1. 进入浏览器页面执行 JavaScript。
2. 找到日期输入框。
3. 把日期填进去。

如果你写真实项目，最好还要考虑页面有没有监听 `change` 事件。更稳一点可以写成：

```python
driver.execute_script("""
const el = document.getElementById('train_date');
el.value = '2026-06-15';
el.dispatchEvent(new Event('input', { bubbles: true }));
el.dispatchEvent(new Event('change', { bubbles: true }));
""")
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `driver.execute_script("""` | 开始执行一段多行 JavaScript。 |
| `const el = document.getElementById('train_date');` | 找到日期输入框，并把它保存到 JS 变量 `el`。 |
| `el.value = '2026-06-15';` | 把输入框的值改成指定日期。 |
| `el.dispatchEvent(new Event('input', { bubbles: true }));` | 主动触发一次 `input` 事件，告诉页面“这个输入框刚刚被输入了”。 |
| `el.dispatchEvent(new Event('change', { bubbles: true }));` | 主动触发一次 `change` 事件，告诉页面“这个输入框的值变了”。 |
| `""")` | 结束多行 JavaScript，并执行它。 |

为什么要讲这个？

因为有些网页不是只看输入框的 `value`，还会监听“用户有没有真的输入过”。只改 `value` 时，页面可能看着变了，但内部状态没变。遇到这种情况，补事件就很有用。

## 十三、找到查询按钮并点击

作业里记录了查询按钮的 HTML：

```html
<a style="margin-top: 12px;" href="javascript:" id="query_ticket" class="btn92s" shape="rect">查询</a>
```

逐项解释：

| HTML 片段 | 代表什么 |
|---|---|
| `<a ...>查询</a>` | 这是一个链接标签，但页面把它做成了按钮。 |
| `id="query_ticket"` | 这个按钮的唯一标识，很适合给 Selenium 定位。 |
| `class="btn92s"` | 按钮样式类名，主要给 CSS 用。 |
| `href="javascript:"` | 点它时不是跳普通链接，而是触发页面脚本。 |
| `查询` | 按钮显示出来的文字。 |

点击按钮的代码：

```python
driver.find_element(By.ID, "query_ticket").click()
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `driver.find_element(By.ID, "query_ticket").click()` | 让 Selenium 按 `id` 找到查询按钮，然后点击它。 |

这行可以拆成两半看：

```python
driver.find_element(By.ID, "query_ticket")
```

意思是：在当前浏览器页面里，找一个 `id` 等于 `query_ticket` 的元素。

```python
.click()
```

意思是：对找到的这个元素执行点击。

实际写自动化时，`id` 是很舒服的定位方式。因为一个页面里，`id` 通常应该是唯一的。

## 十四、为什么这里让人手动确认

点击查询后，作业没有马上抓数据，而是先让用户确认：

```python
while True:
    x = input(
        "查好了吗？这一步需要手动确定,\n输入1表示查出正确的东西了，输入0表示没有\n请不要胡乱输入："
    )
    if not (x == "1" or x == "0"):
        print("你输入了个啥？ --来自sjt的质问")
        print("请好好输入！")
        time.sleep(1)
    elif x == "0":
        print("What are you 弄啥嘞？！")
        exit(0)
    else:
        # 核心爬取数据的部分
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `while True:` | 开启一个无限循环。只要不 `break` 或 `exit`，它会一直重复。 |
| `    x = input(` | 等用户输入，并把输入内容保存到变量 `x`。 |
| `        "查好了吗？这一步需要手动确定,\n输入1表示查出正确的东西了，输入0表示没有\n请不要胡乱输入："` | 这是提示文字。`\n` 表示换行，所以终端会分几行显示。 |
| `    )` | 结束 `input()` 函数调用。 |
| `    if not (x == "1" or x == "0"):` | 如果用户输入的既不是 `"1"` 也不是 `"0"`，就说明输入不合法。 |
| `        print("你输入了个啥？ --来自sjt的质问")` | 输入不合法时，打印提示。 |
| `        print("请好好输入！")` | 继续提醒用户重新输入。 |
| `        time.sleep(1)` | 暂停 1 秒，避免提示刷得太快。 |
| `    elif x == "0":` | 如果用户输入 `"0"`，说明查询没成功。 |
| `        print("What are you 弄啥嘞？！")` | 打印一句提示。 |
| `        exit(0)` | 直接退出程序。 |
| `    else:` | 剩下的情况就是用户输入 `"1"`，表示查询成功，可以继续抓数据。 |
| `        # 核心爬取数据的部分` | 注释，说明下面要进入真正抓票数据的代码。 |

为什么要人工确认？

因为 12306 页面比较复杂，可能会有加载慢、参数没填上、网络抽风等情况。作业为了稳一点，让人看一眼页面结果，再决定要不要继续。真实项目里可以用 `WebDriverWait` 自动等结果表格出现，不过入门作业这样写更直观。

## 十五、从浏览器里拿 Cookie

进入 `else` 后，第一步是拿 Cookie：

```python
cookies = {c["name"]: c["value"] for c in driver.get_cookies()}
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `cookies = {c["name"]: c["value"] for c in driver.get_cookies()}` | 从 Selenium 打开的浏览器里取出所有 Cookie，并整理成 `requests` 能用的字典格式。 |

这一行是字典推导式，初学者可能看着有点绕。拆开就是：

```python
raw_cookies = driver.get_cookies()
cookies = {}
for c in raw_cookies:
    cookies[c["name"]] = c["value"]
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `raw_cookies = driver.get_cookies()` | 从浏览器拿到 Cookie 列表。每个 Cookie 都是一个小字典。 |
| `cookies = {}` | 新建一个空字典，准备保存整理后的 Cookie。 |
| `for c in raw_cookies:` | 遍历每一个 Cookie。 |
| `    cookies[c["name"]] = c["value"]` | 用 Cookie 的名字当键，用 Cookie 的值当值，保存到字典里。 |

为什么要拿 Cookie？

因为很多网站不是谁都能直接请求接口。浏览器打开页面后，服务器会给浏览器发一些 Cookie，用来识别这次访问。我们后面用 `requests` 调接口时，把 Cookie 带上，就更像同一个浏览器在继续访问。

## 十六、准备 12306 的接口地址和参数

接下来不是从页面表格里抠字，而是直接请求 12306 的查票接口：

```python
api = "https://kyfw.12306.cn/otn/leftTicket/query"
params = {
    "leftTicketDTO.train_date": "2026-06-15",
    "leftTicketDTO.from_station": "BJP",
    "leftTicketDTO.to_station": "SHH",
    "purpose_codes": "ADULT",
}
headers = {"User-Agent": driver.execute_script("return navigator.userAgent;")}
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `api = "https://kyfw.12306.cn/otn/leftTicket/query"` | 把真正的查票接口地址保存到变量 `api`。 |
| `params = {` | 开始定义请求参数字典。 |
| `    "leftTicketDTO.train_date": "2026-06-15",` | 设置出发日期参数。 |
| `    "leftTicketDTO.from_station": "BJP",` | 设置出发站编码，北京对应 `BJP`。 |
| `    "leftTicketDTO.to_station": "SHH",` | 设置到达站编码，上海对应 `SHH`。 |
| `    "purpose_codes": "ADULT",` | 设置乘客类型，`ADULT` 表示成人票。 |
| `}` | 参数字典结束。 |
| `headers = {"User-Agent": driver.execute_script("return navigator.userAgent;")}` | 设置请求头里的 `User-Agent`，值直接从浏览器里读取。 |

这里要讲一个特别重要的思路：**浏览器负责开门，requests 负责搬数据。**

Selenium 已经帮我们打开了 12306 页面，也拿到了浏览器 Cookie。现在真正查票时，我们不一定非要从网页表格里一点点抠。只要找到后台接口，就可以直接请求接口拿 JSON 数据。

怎么找这个接口？

打开浏览器开发者工具：

1. 按 `F12`。
2. 进 `Network` 面板。
3. 在网页上点一次查询。
4. 找 `Fetch/XHR` 类型的请求。
5. 点开看 URL、参数、返回内容。

很多动态网页都是这样：页面只是外壳，数据其实来自后台接口。

## 十七、请求接口并转成 JSON

接口、参数、Cookie、请求头都准备好了，就可以请求数据了。

```python
resp = requests.get(
    api, params=params, cookies=cookies, headers=headers, verify=False
)
data = resp.json()
trains = data["data"]["result"]
station_map = data["data"]["map"]
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `resp = requests.get(` | 开始用 `requests` 发送 GET 请求，并把响应保存到 `resp`。 |
| `    api, params=params, cookies=cookies, headers=headers, verify=False` | 请求目标是 `api`，带上查询参数、Cookie、请求头，并关闭证书校验。 |
| `)` | 结束 `requests.get()` 调用。 |
| `data = resp.json()` | 把接口返回的 JSON 文本转成 Python 字典。 |
| `trains = data["data"]["result"]` | 从返回数据里取出车次列表。 |
| `station_map = data["data"]["map"]` | 取出站点编码到中文站名的映射表。 |

这里的 `params=params` 很关键。它会自动把参数拼到 URL 后面，大概像这样：

```text
...?leftTicketDTO.train_date=2026-06-15&leftTicketDTO.from_station=BJP&...
```

`verify=False` 是跳过 HTTPS 证书校验。作业里为了跑通可以这样写，但正式项目不建议随便关。能正常校验证书时，最好不要关安全检查。

`resp.json()` 也很好理解：接口返回的如果是 JSON 字符串，这行就把它变成 Python 能操作的字典和列表。

## 十八、拆 12306 返回的车次字符串

12306 返回的车次数据不是特别规整。每一趟车是一长串文本，中间用 `|` 分隔。代码里这样处理：

```python
rows = []
for item in trains:
    f = item.split("|")
    rows.append({
        "车次":   f[3],
        "出发站": station_map.get(f[4], f[4]),
        "到达站": station_map.get(f[5], f[5]),
        "出发":   f[8],
        "到达":   f[9],
        "历时":   f[10],
        "商务座": f[32] or "--",
        "一等座": f[31] or "--",
        "二等座": f[30] or "--",
        "硬卧":   f[28] or "--",
        "硬座":   f[29] or "--",
        "无座":   f[26] or "--",
        "可预订": "是" if f[11] == "Y" else "否",
    })
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `rows = []` | 新建一个空列表，用来保存整理后的每一趟车。 |
| `for item in trains:` | 遍历接口返回的车次列表，每个 `item` 代表一趟车的原始字符串。 |
| `    f = item.split("|")` | 按 `|` 把原始字符串切开，得到一个列表。后面用下标取字段。 |
| `    rows.append({` | 往 `rows` 里追加一个字典，这个字典就是一趟车整理后的信息。 |
| `        "车次":   f[3],` | `f[3]` 是车次，比如 `G1`、`D313` 之类。 |
| `        "出发站": station_map.get(f[4], f[4]),` | `f[4]` 是出发站编码，用 `station_map` 翻译成中文，翻不到就保留原编码。 |
| `        "到达站": station_map.get(f[5], f[5]),` | `f[5]` 是到达站编码，同样翻译成中文。 |
| `        "出发":   f[8],` | `f[8]` 是出发时间。 |
| `        "到达":   f[9],` | `f[9]` 是到达时间。 |
| `        "历时":   f[10],` | `f[10]` 是路程耗时。 |
| `        "商务座": f[32] or "--",` | `f[32]` 是商务座余票；如果是空字符串，就显示 `--`。 |
| `        "一等座": f[31] or "--",` | `f[31]` 是一等座余票；空就显示 `--`。 |
| `        "二等座": f[30] or "--",` | `f[30]` 是二等座余票；空就显示 `--`。 |
| `        "硬卧":   f[28] or "--",` | `f[28]` 是硬卧余票；空就显示 `--`。 |
| `        "硬座":   f[29] or "--",` | `f[29]` 是硬座余票；空就显示 `--`。 |
| `        "无座":   f[26] or "--",` | `f[26]` 是无座余票；空就显示 `--`。 |
| `        "可预订": "是" if f[11] == "Y" else "否",` | 如果 `f[11]` 等于 `Y`，说明可预订，否则显示不可预订。 |
| `    })` | 这一趟车的字典结束，并追加到 `rows` 里。 |

这段代码最关键的是：

```python
f = item.split("|")
```

假设接口返回一段这样的文本：

```text
xxx|xxx|xxx|G1|BJP|SHH|xxx|xxx|07:00|12:00|05:00|Y
```

`split("|")` 以后就变成：

```text
f[3]  -> G1
f[4]  -> BJP
f[5]  -> SHH
f[8]  -> 07:00
f[9]  -> 12:00
f[10] -> 05:00
f[11] -> Y
```

这种接口不太优雅，但实际开发里很常见。遇到这种数据，别硬猜下标，最好先打印一条看看：

```python
f = trains[0].split("|")
for i, val in enumerate(f):
    print(i, val)
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `f = trains[0].split("|")` | 取第一趟车的数据，按 `|` 切开。 |
| `for i, val in enumerate(f):` | 同时遍历下标 `i` 和字段值 `val`。 |
| `    print(i, val)` | 把每个下标和对应的值打印出来，方便确认哪个下标是什么含义。 |

这就是拆接口数据的基本功：先观察，再写解析。

## 十九、把整理好的数据写成 CSV

最后一步，把 `rows` 写到 `tickets.csv`。

```python
with open("tickets.csv", "w", newline="", encoding="utf-8-sig") as fp:
    writer = csv.DictWriter(fp, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `with open("tickets.csv", "w", newline="", encoding="utf-8-sig") as fp:` | 打开 `tickets.csv` 准备写入。`newline=""` 防止多出空行，`utf-8-sig` 方便 Excel 正常识别中文。 |
| `    writer = csv.DictWriter(fp, fieldnames=list(rows[0].keys()))` | 创建一个 CSV 写入器，表头来自第一行数据的所有键，比如“车次”“出发站”“到达站”。 |
| `    writer.writeheader()` | 先写入表头。 |
| `    writer.writerows(rows)` | 把 `rows` 里的所有车次数据一次性写进去。 |

为什么用 `DictWriter`？

因为我们的 `rows` 长这样：

```python
{
    "车次": "G1",
    "出发站": "北京",
    "到达站": "上海",
    "出发": "07:00"
}
```

它本来就是字典。`DictWriter` 可以直接按字典键写列名，很方便。

`utf-8-sig` 也很实用。普通 `utf-8` 文件在某些 Excel 里打开会中文乱码，`utf-8-sig` 对 Excel 更友好。

## 二十、程序结束提示

最后几行：

```python
print(f"搞定，共 {len(rows)} 趟车，已写入 tickets.csv")
input("按任意键退出")
exit(0)
break
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `print(f"搞定，共 {len(rows)} 趟车，已写入 tickets.csv")` | 打印最终结果。`len(rows)` 是整理出来的车次数量。 |
| `input("按任意键退出")` | 暂停程序，等用户看完提示再退出。 |
| `exit(0)` | 正常退出程序。 |
| `break` | 跳出循环。不过这里前面已经 `exit(0)` 了，所以实际不会执行到这一行。 |

这里的 `break` 有点多余，因为 `exit(0)` 已经把程序结束了。保留也不影响运行，只是从代码整洁角度看，可以删掉。

## 二十一、把整件事串起来

现在回头看，这份作业其实不是“写了一个爬虫”这么简单，它练了 Web 控制最重要的几件事：

```text
1. 用 requests 请求网页。
2. 用状态码判断网页有没有正常返回。
3. 用 BeautifulSoup 解析 HTML。
4. 先找重复的大盒子，再从盒子里取字段。
5. 用 Selenium 打开真实浏览器。
6. 看 HTML 里的 id、name、type、value。
7. 同时处理可见输入框和 hidden 隐藏字段。
8. 用 JavaScript 直接修改页面值。
9. 用 Selenium 点击按钮。
10. 从浏览器拿 Cookie。
11. 用 requests 调后台接口。
12. 拆 JSON 和用 `|` 分隔的字段。
13. 写入 CSV 文件。
```

这就是 Python 实现 Web 控制的基本路线。

## 二十二、初学者怎么拆 HTML

最后单独总结一下拆 HTML 的方法。

不要一上来就复制一大串 XPath，也不要看到一堆 `<div>` 就慌。按这个顺序看：

### 1. 先找你要的数据在哪里

比如你要名言，就先在页面上找到一条名言，右键检查元素。

你要车票查询按钮，就右键按钮，检查它对应哪段 HTML。

### 2. 找这一块外面的“大盒子”

名言外面是：

```html
<div class="quote">
```

这说明每条名言都包在 `quote` 盒子里。

### 3. 再找盒子里面的小字段

名言正文：

```html
<span class="text">
```

作者：

```html
<small class="author">
```

所以代码就应该写成：

```python
quotes = soup.find_all("div", class_="quote")
for quote in quotes:
    text = quote.find("span", class_="text").text
    author = quote.find("small", class_="author").text
```

逐行解释：

| 代码 | 这行在干嘛 |
|---|---|
| `quotes = soup.find_all("div", class_="quote")` | 先找所有名言大盒子。 |
| `for quote in quotes:` | 一条一条处理。 |
| `    text = quote.find("span", class_="text").text` | 在当前大盒子里找名言正文。 |
| `    author = quote.find("small", class_="author").text` | 在当前大盒子里找作者。 |

### 4. 表单一定要看 hidden

像 12306 这种：

```html
<input id="fromStation" type="hidden" value="">
<input id="fromStationText" type="text" value="">
```

别只填 `fromStationText`。它只是给人看的。

真正提交给服务器的，往往是 `fromStation` 这种隐藏字段。

### 5. 动态网页一定要看 Network

如果页面 HTML 里没有你要的数据，别死抠 Elements。打开 `Network`，再操作一次网页，看它请求了哪个接口。

很多时候，真正的数据都在接口返回的 JSON 里。

## 二十三、最后说一句

Web 控制不是魔法，它就是三件事：

```text
看懂网页结构
找到真正的数据来源
用 Python 模拟正确的请求和操作
```

刚开始写的时候，可以慢一点。先手动打开网页，看 HTML；再看 Network；再写一小段 Python 验证。每一步都确认了，再继续下一步。

能这样拆网页，你就不是在“复制爬虫代码”，而是真的知道 Python 在替你做什么。
