# 飞书凤凰回复 — 验证步骤

## 已完成的修复

1. **dmPolicy**: 已设为 `open`，`allowFrom: ["*"]`，任意用户私聊都会处理并回复。
2. **defaultAccount**: 已设为 `main`，网关使用带 App ID/Secret 的「main」账号（之前被 doctor 误用无凭证的 default）。
3. 网关已重启，日志中可见 `feishu[main]: WebSocket client started`。

## 飞书开放平台必查项（否则收不到消息）

在 [飞书开放平台](https://open.feishu.cn/app) 进入你的应用（美团活的 / 凤凰）：

1. **事件订阅**
   - 选择 **「使用长连接接收事件」**（不要选「请求地址」Webhook 除非你已配置公网 URL）。
   - 在「订阅事件」中勾选 **`im.message.receive_v1`**（接收单聊/群聊消息）。
   - 保存后若提示「应用未建立长连接」，需先**发布/启用**应用再保存。

2. **权限**
   - 确保已开通并启用：`im:message`、`im:message:send_as_bot` 等发送/接收消息所需权限。

3. **可用性**
   - 机器人需被用户**添加为好友或加入群**后才能收到该会话消息。

## 人类方式 E2E 测试（你本地执行）

在终端执行：

```bash
export PATH="$HOME/.local/nodejs/bin:$HOME/.local/bin:$PATH"
node ~/.openclaw/scripts/e2e-feishu-reply.mjs
```

脚本会：

1. 检查网关与 `feishu[main]` WebSocket 已启动。
2. 提示你在 **90 秒内** 在飞书里给「凤凰」发一条私聊（例如「你好」）。
3. 监控网关日志；一旦检测到飞书消息到达，会打印 `[通过]` 并退出 0。
4. 若 90 秒内未检测到，会提示检查事件订阅并退出 1。

**通过标准**：你发一条私聊 → 脚本检测到消息到达 → 凤凰在飞书里回复你。若脚本通过但凤凰仍不回复，请查看网关日志中的 agent/发送 相关报错。
