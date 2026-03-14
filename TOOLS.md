# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## 主脑与副脑

- **主脑**：**v31**（硅基 DeepSeek-V3.1），备选 **v3**、**v32**。
- **副脑**：**gemini**（xhub 中转 Gemini 3.1 Pro）、**gpt**（xhub GPT 5.4），同一 xhub URL/key。

**你可以自己决定**用主脑还是副脑、用哪一个模型；不必等主人切换。需要时在对话里用 **`/model v31`** / **`/model v3`** / **`/model v32`** 切主脑，**`/model gemini`** / **`/model gpt`** 切副脑；也可通过 `session_status` 等工具设置当前会话模型。

限流或超时时会自动 fallback；若仍报错，可切回主脑（如 **`/model v31`**）。

## Webchat / Control UI 对话

在网页对话里，系统会自动把你回复中的文字发回给主人。使用 `message(send)` 时需指定 target 才能投递。

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
