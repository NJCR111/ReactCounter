## react 计算器实现练习

#### 👤 作者

**娘吉才让**  
前端开发工程师  
- 📧 邮箱：19357574131@163.com
- 💼 GitHub：[github.com/NJCR111](https://github.com/NJCR111)  
- 🎇 项目演示：[njcr111.github.io/ReactCounterWeb](https://njcr111.github.io/ReactCounterWeb/)  

> "这个计算器项目实现了核心的四则运算功能，支持连续计算、负号处理和百分比运算。欢迎提出改进建议！"
>

### 计算器边界条件列表
#### 输入时
* 连续输入操作符号，顶替上一个操作符号
* 变号操作，反复变号栈顶有操作符的时候变号;多个变号之间是否相互干扰
* ...
#### 项目结构(主要部分)

   ```
       ├── src/ # 源代码目录 
       │ ├── components/ # 可复用组件 
       │ │ ├── Counter.css # 计算器组件样式 
       │ │ ├── config.ts   # 计算器算法实现和配置
       │ │ └── Counter.tsx # 计算器组件逻辑 

   ```


包管理工具 pnpm
1. 安装依赖
    `pnpm install`
2. 运行
   `pnpm dev`
3. 打包(tsc校验)
   `pnpm build`
4. 直接打包
   `pnpm build-n`