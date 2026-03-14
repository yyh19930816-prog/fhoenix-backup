# OpenClaw Control UI 参数导出

从 **D:\OpenClaw\app\ui**（红色主题 HUD 界面）提取的、可版本控制的参数与样式，便于备份或接入你自己的 Git 仓库。

## 文件说明

| 文件 | 说明 |
|------|------|
| **theme-variables.json** | 主题 CSS 变量（深色/浅色）的结构化摘要，便于程序读取或二次生成样式 |
| **theme.css** | 核心主题变量精简版（`:root` 与 `data-theme="light"`），可直接作为覆盖层或参考 |
| **ui-params.json** | 构建与运行参数：package 名称/脚本、Vite base/outDir/port、index 标题与入口、主题模式 |
| **README.md** | 本说明与 Git 上传方式 |

完整 `base.css`（含动画、滚动条、focus 等）以原路径为准：`D:\OpenClaw\app\ui\src\styles\base.css`。需要完整副本时可从该路径复制。

## 用法建议

- **仅改主题色**：改 `theme-variables.json` 或 `theme.css` 中 `--accent` / `--primary` 等，再同步回原项目 `base.css` 或构建后替换翠花用的 control-ui。
- **复现构建**：按 `ui-params.json` 中的 `vite.build.outDir`、`base`、`server.port` 等在本地或 CI 中跑 `pnpm install && pnpm build`，用生成的 `dist/control-ui` 替换网关使用的 control-ui 目录。

## 上传到你的 Git 仓库

### 你需要提供的权限/信息

1. **仓库地址**  
   - 例如：`https://github.com/你的用户名/你的仓库名.git` 或  
   - `git@github.com:你的用户名/你的仓库名.git`

2. **写权限（二选一）**  
   - **方式 A（推荐）**：**Personal Access Token (PAT)**  
     - GitHub：Settings → Developer settings → Personal access tokens → 生成 token，勾选 `repo`。  
     - GitLab 等：在账户里创建带 `write_repository` 的 token。  
     - 使用：`git remote add origin https://<你的token>@github.com/用户名/仓库名.git`，或通过 Git 凭据存储保存 token。  
   - **方式 B**：**SSH 密钥**  
     - 本机已配置好 SSH 且公钥已加到 GitHub/GitLab，可直接用 `git@...` 地址 push。

3. **若希望由助理代你执行 push**  
   - 在安全前提下提供：**仓库 URL** + **PAT**（不要发密码或私钥）。  
   - 助理会在本机执行：在导出目录 `openclaw-control-ui-params` 内 `git init` → `git add` → `git commit` → `git remote add origin <URL>` → `git push -u origin main`（或你指定的分支）。  
   - **安全建议**：优先自己在本机执行 push，仅把仓库 URL 和“是否已配置 PAT/SSH”告诉助理即可。

### 你自己在本机上传的步骤

```bash
cd C:\Users\Administrator\openclaw-control-ui-params
git init
git add .
git commit -m "chore: 从 D 盘 OpenClaw Control UI 提取主题与构建参数"
git remote add origin <你的仓库URL>
git branch -M main
git push -u origin main
```

如仓库已存在且非空，可先 `git pull origin main --rebase` 再 push。

---

**来源**：D:\OpenClaw\app\ui（红色主题 Control UI）。  
**用途**：翠花/美团等 OpenClaw 网关的 Control UI 仅负责交互与展示；替换或复用本导出中的参数即可在不改后端的前提下更换主题或构建配置。
