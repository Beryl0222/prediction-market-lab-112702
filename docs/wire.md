# 数据契约

市场份额为整数，每套含所有outcomes各一份，抵押为collateralPerSet。限价订单按价格时间优先，转移须扣除已挂卖但未成交份额。报告窗口从cutoff开始，首次有效报告必须锁定bond；争议截止首次报告+challengeSeconds，最终裁决需演练身份AR1签名。每个市场最终裁决可为一个已声明结果或INVALID。INVALID按invalidPayout每套各份额退款，舍入尾差保留在市场；其他结果胜方每份得全部套抵押。败方报告/争议保证金50%给胜方、50%入保障储备；结果INVALID则各自退保证金。时间顺序不替代裁决权限。

session.json 的 entities 为初始登记资料，events 为按 sequence 送达的事实或用户请求。observedAt 是导入观察时间；业务生效时点取载荷中的 date、at、effective、block 等字段，不因数组位置改变这些时点。type 标识记录类别，payload 保留原始业务字段；请求不是已经发生的结果。例中回报用可读 instruction、request、trade、group 等关联键；实际执行可为请求生成稳定身份并在查询中返回映射。

金额和数量采用十进制整数字符串；业务协议明确的小数率、价格和风险值使用十进制字符串，不使用二进制浮点隐式改写输入。Bps为万分比，时间为UTC；未提供业务日期的报价在观察日生效。status中的pending或未知不等于失败，显式的done/paid/settled/accepted依其事件种类解释。

事件种类与载荷字段：
- mint：account, market, sets。
- order：account, id, market, outcome, price, side, units。
- fill：buyer, order, units。
- transfer：from, market, outcome, to, units。
- report：at, evidence, market, outcome, reporter。
- challenge：at, challenger, market, outcome。
- redeem：account, market, outcome, units。
- award：at, authority, market, outcome。

这些输入可复制并修改为新的独立会话；它们没有预存成交分配、决策结果或业务账目。

演练签名采用Ed25519，对envelope逐层按键名升序排列的无空白JSON UTF-8签名。actors.json提供只用于虚构身份的密钥与有效角色材料，实际业务载荷使用对应角色和权限。

alternative.json 是独立会话，改变了一项实际输入事实；不要把两个会话合并成同一业务事件流。

actors.json保存只用于演练的各角色密钥。事件authorization以envelope完整绑定域、角色与业务载荷，签名编码使用前述规范JSON。报告人和争议人只能提交自己的材料，AR1为演练仲裁身份。

questionId标识市场问题；evidenceSources列出可接受来源，evidenceRecords保留同一问题、截止时点、发布时间及原始读数。读数不代替报告或授权裁决。没有at的本地请求使用observedAt作为提出时点；redeem须指定outcome。

fill的trade为成交身份，settled=false表示成交已确认但份额交付尚未完成，买方从成交起拥有该成交数量的经济权利。trade_settlement按trade报告已交付数量，部分交付不产生新权利；已兑换的成交权益不得通过后到交付再次兑换。买卖请求、成交事实和交付事实分别保留。
