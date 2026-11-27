# 事件合约的争议裁决与持仓兑付

本项目资料用于本地事件合约的争议裁决与持仓兑付业务演练。所有客户、账户、市场和交易都是合成内容，金额口径与业务日历见 [数据契约](docs/wire.md)。

运行环境为 Node.js 22.23.2。依赖由 package-lock.json 固定，准备依赖使用 npm ci --ignore-scripts。

运行 npm run inspect 查看原始资料；npm run feed 启动本机只读资料服务，启动输出提供实际端口，GET /session.json 返回整个会话。该服务只提供事实输入，不受理或决定业务交易。PORT 可以指定端口。

npm test 检查资料标识、事件顺序及JSON可读取性；npm run build 检查资料工具的语法。上述命令只验证现有资料工具。fixtures 保存合成输入，tools 是读取工具，test 是资料完整性检查，docs 是格式与领域约定。
