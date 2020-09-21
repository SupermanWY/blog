# 你真的懂 sessionStorage 吗？

## 前言
都 0202 年了，竟然还有人在说 seession Storage。没错今天我们来讨论一下你可能会遗漏的细节。

## 定义
我们首先看一下 MDN 上对 sessionStorage 的定义

> sessionStorage 与 localStorage 类型，但是存储在 sessionStorage 里面的数据在页面会话结束时会被清除。
> 1. 页面会话在浏览器打开期间一直保持，并且重新加载或恢复页面仍会保持原来的页面会话。
> 2. 在新标签或窗口打开一个页面时会复制顶级浏览会话的上下文作为新会话的上下文，这点和 session cookies 的运行方式不同。
> 3. 打开多个相同的URL的Tabs页面，会创建各自的sessionStorage。
> 4. 关闭对应浏览器tab，会清除对应的sessionStorage。

## 解释

我们逐一看一下这四点

（1）首先第一点，**页面会话在浏览器打开期间一直保持，并且重新加载或恢复页面仍会保持原来的页面会话。**

这一点很好理解，只要浏览器 tab 页没有关闭，我们的 sessionStorage 就一直存在，也就是刷新并不会清楚 sessionStorage。

（2）接下来第二点可能是很多人都不会注意到的细节。**在新标签或窗口打开一个页面时会复制顶级浏览会话的上下文作为新会话的上下文，这点和 session cookies 的运行方式不同。**

这句话的意思我简单描述一下，如果是从一个页面打开一个新的窗口或者一个新的 tab 页，那么这个页面会与顶级窗口公用一个 sessionStorage。

**举个例子**

```html
<!-- 页面 1 代码 -->
<body>
  <h1>这是页面 1</h1>
  <a href="./demo2.html" target="_blank" >跳转到页面  2</a>
</body>

<script>
  sessionStorage.setItem('test', 'test')
</script>
```

![](https://imgkr2.cn-bj.ufileos.com/f0e34011-3d14-4ca4-9392-cf598c482954.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=XI4UCenCaoYQsLkShAyGABKwYBg%253D&Expires=1599668490)


在页面 1 内存入 sessionStorage test，然后，我们再通过 a 标签打开一个新的标签页

```html
<!-- 页面 2 代码 -->
<body>
  <h1>这是页面 2</h1>
</body>

<script>
  console.log(sessionStorage.getItem('test'))
</script>
```

![](https://imgkr2.cn-bj.ufileos.com/803f3bf7-c5fd-431b-8c49-717c25c3d8d7.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=SfxDB4CDEDgBwtVMzwubSWv55N8%253D&Expires=1599668651)

在页面 2 内打印 ```sessionStorage.getItem('test')```，我们此时发现能够拿到 test。

到这我们也就理解了第二句话的意思，但是这里我们会对一个词产生歧义，MDN 上说新的窗口会复制**顶级**的浏览会话的上下文，何为顶级？我们猜测一下，如果我们从页面 2 再打开一个页面 3，那此时的顶级是不是就是页面 1，所以页面3还是复制的页面 1 的sessionStorage？我们实验一下

在页面 2 内新增如下代码
```html
<body>
  <h1>这是页面 2</h1>
  <a href="./demo3.html" target="_blank">跳转页面 3</a>
</body>
</html>

<script>
  console.log(sessionStorage.getItem('test'))
  sessionStorage.setItem('test2', 'test2')
</script>
```
页面 2 内 sessionStorate 存入 test2，然后从页面 2 进入页面 3

然后我们可以发现页面 3 内也可以拿到 test2
![](https://imgkr2.cn-bj.ufileos.com/09adba99-1563-4edc-bf93-e10d38f14bdf.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=HA0QoTHB%252F1d%252BXEa0nvg7E7OAf2E%253D&Expires=1599669638)

所以顶级并不是我们所理解的那样，看起来就是父级的意思。。。

我们此时再想一下，页面 2 内存入了 test2，那么此时页面 1 内是否可以获取？
![](https://imgkr2.cn-bj.ufileos.com/0eb77ea5-d751-460c-a4f7-219bb9b67d2b.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=Y1lygbc0ePP2g%252Fg0Go%252BozUJH1RQ%253D&Expires=1599669825)

事实证明不可以。

**结论：** 新打开的标签页会复制父级的 sessionStorage，类似于深拷贝，之后 sessionStorage 的变更不会同步。

（3）第三点**打开多个相同的URL的Tabs页面，会创建各自的sessionStorage。**

这一点很好理解，相同 url 的多个 tab 页，sessionStorage 并不会同步，也就是说它们不属于同一个 session。

（4）第四点就没什么好说的了

## 总结
大家再使用的时候一定会很容易忽略掉第二点，希望这篇文章能够帮助大家消灭掉一些因 sessionStorage 而引起的魔幻 bug.