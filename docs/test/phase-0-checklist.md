# Phase 0 冒烟测试 — 人工对照清单

> 配合 `scripts/phase-0.mjs` 使用。本清单是「人眼对照」用，脚本是「自动验证」用。两者配合，最大限度避免误判。

## 使用流程

1. 打开本清单，对照每一步
2. 运行 `node scripts/phase-0.mjs <step>`（例如 `0-4`）
3. 脚本通过 → 在本清单对应行打勾 `[x]`
4. 脚本失败 → 看脚本输出的「回滚命令」段，执行后回到第 1 步

## 全局前置（执行任何微步骤前必做）

- [ ] 4 套凭据（M-2~M-5）已在对应平台**重签**
- [ ] staging 服务器 .env 已填入新凭据（**不要**用生产 .env）
- [ ] docker / docker compose v2 已安装
- [ ] Node >= 18 已安装
- [ ] 宿主机 27018 / 6380 / 9001 / 3000 / 3002 / 3010 端口未被占用
- [ ] /etc/letsencrypt/live/aiautoedit.art/ 证书已就位
- [ ] 腾讯云安全组已放行 staging 子域的 80/443/9010

## 0-1 凭据就绪

> 目的：确认 .env 中 4 套凭据已替换为真实值且 Key 有效

| 检查项 | 预期 | 结果 |
|---|---|---|
| MINIMAX_API_KEY 非占位符 | `__REPLACE_ME__` 不出现 | [ ] |
| DASHSCOPE_API_KEY 非占位符 | 同上 | [ ] |
| DOYIN_CLIENT_ID / SECRET 非占位符 | 同上 | [ ] |
| MAIL_PASS 非占位符 | 同上 | [ ] |
| MINIMAX 网关直连 | HTTP 200/401/402（说明链路通） | [ ] |
| DASHSCOPE 网关直连 | HTTP 200/401/403 | [ ] |
| 旧 Key 已从生产 .env 移除 | grep 不含 `sk-cp-vVYM7B9nZ` 等泄露值 | [ ] |

回滚（如失败）：本步骤仅读 .env，无需回滚操作；如发现旧 Key 仍在生产 .env，立即到生产 .env 移除。

## 0-2 代码同步

> 目的：确认 staging 服务器已拉取最新代码

| 检查项 | 预期 | 结果 |
|---|---|---|
| working tree clean | `git status` 无输出 | [ ] |
| 最近 20 个 commit 含 AI 路由修复 | 出现 Wanxiang / minimax / 路由相关关键字 | [ ] |
| 当前 HEAD 是 phase-0-ready 分支 | `git rev-parse --abbrev-ref HEAD` | [ ] |
| 当前 commit hash 已记录 | 写进 §10 登记 | [ ] |

回滚：`git reset --hard HEAD@{1}`（回滚刚才的 pull）

## 0-3 compose 静态校验

| 检查项 | 预期 | 结果 |
|---|---|---|
| `docker compose -f docker-compose.yml config -q` | 退出码 0，无错误输出 | [ ] |
| config 输出包含 10 个 service | 数量正确 | [ ] |

回滚：无需。

## 0-4 数据层（mongodb + redis）

| 检查项 | 预期 | 结果 |
|---|---|---|
| mongodb 容器 healthy | `docker compose ps mongodb` 显示 `(healthy)` | [ ] |
| redis 容器 healthy | 同上 | [ ] |
| 副本集已初始化 | `rs.status().ok == 1` | [ ] |
| redis PING | 返回 `PONG` | [ ] |
| 宿主机 27018 / 6380 端口可连 | `nc -zv 127.0.0.1 27018` OK | [ ] |

回滚：
```bash
docker compose down mongodb mongodb-rs-init redis
docker volume rm aiautoedit_mongodb-data aiautoedit_redis-data
```

## 0-5 对象存储（rustfs）

| 检查项 | 预期 | 结果 |
|---|---|---|
| rustfs 容器 healthy | `(healthy)` | [ ] |
| rustfs-init 已执行 | logs 含 "created" 或 "already exists" | [ ] |
| bucket `aitoearn` 已建 | `mc ls rustfs/` 显示 aitoearn | [ ] |
| 9001 控制台端口通 | `curl http://127.0.0.1:9001/` 200/404 | [ ] |

回滚：
```bash
docker compose down rustfs rustfs-init
docker volume rm aiautoedit_rustfs-data
```

## 0-6 AI 服（aitoearn-ai）

| 检查项 | 预期 | 结果 |
|---|---|---|
| aitoearn-ai 容器 healthy | `(healthy)` | [ ] |
| /health 端点 | HTTP 200/404 | [ ] |
| 启动日志无 error/exception | `docker compose logs aitoearn-ai` 过滤 error 后为空 | [ ] |
| 启动日志有 "listening on 3010" | 出现 | [ ] |

回滚：
```bash
docker compose down aitoearn-ai
# 查看失败原因：
cat /tmp/ai-fail-0-6.log
# 常见：MINIMAX_API_KEY 未配置 / DASHSCOPE_API_KEY 未配置
```

## 0-7 主服（aitoearn-server）

| 检查项 | 预期 | 结果 |
|---|---|---|
| aitoearn-server 容器 healthy | `(healthy)` | [ ] |
| /health 端点 | HTTP 200/404 | [ ] |
| 启动日志无 unhandled/fatal | grep 后为空 | [ ] |
| 启动日志有 "listening on 3002" | 出现 | [ ] |

回滚：
```bash
docker compose down aitoearn-server
# 常见：aitoearn-ai 未 healthy 导致 ECONNREFUSED
```

## 0-8 Web（aitoearn-web）

| 检查项 | 预期 | 结果 |
|---|---|---|
| aitoearn-web 容器 healthy | `(healthy)` | [ ] |
| 容器内 3000 端口通 | `curl http://127.0.0.1:3000/` | [ ] |

回滚：
```bash
docker compose down aitoearn-web
```

## 0-9 Nginx

| 检查项 | 预期 | 结果 |
|---|---|---|
| nginx 容器 healthy | `(healthy)` | [ ] |
| 证书可读 | `docker run --rm -v /etc/letsencrypt:/etc alpine ls /etc/letsencrypt/live/aiautoedit.art/` 成功 | [ ] |
| 外网 `curl https://aiautoedit.art/_nhealth` | HTTP 200 | [ ] |
| TLS 协议 | TLSv1.2 或 TLSv1.3 | [ ] |

回滚：
```bash
docker compose down nginx
# 常见：443 安全组未开 / 证书路径错 / nginx.conf 语法错（先 docker compose logs nginx）
```

## 0-10 探活 7 个核心路径

| URL | 预期状态码 | 实际状态码 | 备注 |
|---|---|---|---|
| `https://aiautoedit.art/_nhealth` | 200 | ____ | nginx 探活 |
| `https://aiautoedit.art/api/health` | 200/404 | ____ | server 探活 |
| `https://aiautoedit.art/api/ai/models-config` | 200/401 | ____ | ai 探活（需鉴权可能 401） |
| `https://aiautoedit.art/healthz` | 200 | ____ | web 探活 |
| `https://aiautoedit.art/api/auth/login` (POST) | 400/401/405 | ____ | 路由可达 |

**7 个全部命中预期才通过。**

回滚：纯只读探活，无需回滚。

## 0-11 AI 路由 4 通道

> 关键回归。**这步会真实产生计费**。

| 通道 | 模型 | 调用方法 | 预期日志 | 实际是否命中 |
|---|---|---|---|---|
| 文本 | `MiniMax-M2.7` | `node scripts/smoke-ai-routes.mjs` | `https://api.minimaxi.com/v1/chat/completions` | [ ] |
| 图像 | `wan2.7-image` | 同上 | `https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation` | [ ] |
| 视频 | `wan2.7-t2v-2026-04-25` | 同上 | `https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis` | [ ] |
| 兜底 | `MiniMax-M2.7`（主坏） | `--skip-fallback` 默认不跑，需要时人工触发 | 日志出现 "DeepSeek 兜底成功" | [ ] |

**禁用项检查**（每条都必须在日志中找不到）：
- [ ] 文本通道日志中不含 `dashscope.aliyuncs.com`
- [ ] 文本通道日志中不含 `qwen-plus` / `qwen-turbo`
- [ ] 图像/视频通道日志中不含 `api.minimaxi.com`

**详细命令**：
```bash
docker compose logs --tail=100 aitoearn-ai | grep -E "minimax|dashscope|deepseek" | head -30
```

回滚（任一错路由）：
```bash
docker compose down aitoearn-ai
# 修复 config.js / openai.service.ts / image.service.ts / video.service.ts
git diff HEAD~1
docker compose up -d aitoearn-ai
# 重新跑 0-6 → 0-7 → 0-10 → 0-11
```

## 0-12 阶段收尾

| 动作 | 完成 |
|---|---|
| 在 aiautoedit-README.md §10 登记"Phase 0 通过"记录 | [ ] |
| `git tag phase-0-passed-2026-06-07 -m "..."` | [ ] |
| `git push origin phase-0-passed-2026-06-07` | [ ] |
| 远端可见 tag | [ ] |

回滚：`git tag -d phase-0-passed-2026-06-07`（仅删除本地 tag）

---

## 通过 Phase 0 后的进入条件

✅ 所有 12 个微步骤都在本清单打勾
✅ `.phase-0-state.json` 中 `passed` 数组长度 = 12
✅ `docs/test/phase-0.log` 无 FAIL 行
✅ git tag `phase-0-passed-*` 已推

→ 可以进入 **Phase 1（账号域）**。

## 常用命令速查

```bash
# 查看进度
node scripts/phase-0.mjs status

# 重置（重新跑）
node scripts/phase-0.mjs reset

# 跑单个微步骤
node scripts/phase-0.mjs 0-4

# 跑多个微步骤
node scripts/phase-0.mjs 0-3 0-4 0-5

# 强制跑（忽略前置依赖，不推荐）
node scripts/phase-0.mjs --force 0-7

# 仅跑 AI 路由 smoke
node scripts/smoke-ai-routes.mjs

# 跳视频
node scripts/smoke-ai-routes.mjs --skip-video

# 强制测试兜底
node scripts/smoke-ai-routes.mjs --skip-fallback=false
```

## 失败排查决策树

```
0-1 失败 → 凭据未替换，去平台重签
0-2 失败 → 代码未同步，git pull
0-3 失败 → docker-compose.yml 有语法错，看 docker compose config 输出
0-4 失败 → 数据层问题，看 mongodb/redis 日志
0-5 失败 → 对象存储问题，看 rustfs 日志（可能是 RUSTFS_ALLOW_INSECURE_DEFAULT_CREDENTIALS 没设）
0-6 失败 → aitoearn-ai 启动失败，看完整日志
   - 看到 "MINIMAX_API_KEY must be set" → 0-1 没通过
   - 看到 "DASHSCOPE_API_KEY must be set" → 0-1 没通过
   - 看到 "MONGODB_URI invalid" → 0-4 失败残留
0-7 失败 → aitoearn-server 启动失败
   - 看到 ECONNREFUSED 127.0.0.1:3010 → aitoearn-ai 没起来，回 0-6
0-8 失败 → aitoearn-web 启动失败，看 next.js 日志
0-9 失败 → nginx 配置错（最常见是证书路径）
0-10 失败 → 路由不可达（最常见是 nginx 反代规则错）
0-11 失败 → AI 路由错（最严重，需要人工判断）
   - 文本走错：config.js 中 OPENAI_BASE_URL 误指 dashscope
   - 图像走错：image.service.ts 没正确路由到 WanxiangService
   - 视频走错：video.service.ts 的 channel 字段没改 / 路由到 handleWanxiangGeneration 失败
0-12 失败 → 仅 tag 未推，git push 即可
```
