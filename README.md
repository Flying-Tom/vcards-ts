# 📇 vCards-TypeScript

[![Check](https://img.shields.io/github/actions/workflow/status/Flying-Tom/vcards-ts/check.yml?label=Check&logo=github)](https://github.com/Flying-Tom/vcards-ts/actions/workflows/check.yml)
[![Release](https://img.shields.io/github/actions/workflow/status/Flying-Tom/vcards-ts/release.yml?label=Release&logo=github)](https://github.com/Flying-Tom/vcards-ts/actions/workflows/release.yml)
[![Sync](https://img.shields.io/github/actions/workflow/status/Flying-Tom/vcards-ts/sync.yml?label=Sync&logo=github)](https://github.com/Flying-Tom/vcards-ts/actions/workflows/sync.yml)
[![License](https://img.shields.io/github/license/Flying-Tom/vcards-ts?logo=mit)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18-green?logo=node.js)](package.json)

基于 [metowolf/vCards](https://github.com/metowolf/vCards) 的 TypeScript 重写版，额外增加了国际化服务的邮箱和头像维护。

## 📂 目录说明

数据统一存放在 `data/` 目录下：

- 🌐 **`data/国际服务/`**：本项目手动维护的部分，包含 Gmail、OpenAI、Cloudflare 等，主要维护邮箱字段。
- 🔄 **其他目录**：从上游自动同步的分类, Github Actions 定时从原项目拉取并合并更改。

---

## 🚀 部署与使用

### 1. 🛠️ 服务部署

推荐使用 Docker 运行打包好的 Radicale 服务：

```bash
docker run -d --name vcards-ts -p 5232:5232 flyingtom/vcards:main
```

### 2. 📱 客户端配置 (CardDAV)

在设备上添加 CardDAV 账户，服务器地址填写 `http://<IP>:5232/` (或你的域名)，密码任意。

- 🍎 **iOS**: 设置 -> 邮件 -> 账户 -> 添加账户 -> 其他 -> 添加 CardDAV 账户
  - 用户名：`ios`
- 💻 **macOS**: 系统设置 -> 互联网账户 -> 添加账户 -> 添加其他账户... -> CardDAV 账户
  - 用户名：`macos`

---

## 🛠️ 开发与构建

### 💻 环境

- Node.js 18+
- pnpm

### 📜 命令

```bash
# 安装依赖
pnpm install

# 运行格式与数据校验
pnpm test

# 构建标准 .vcf 文件
pnpm build

# 生成 Radicale 兼容的 CardDAV 目录结构
pnpm radicale
```

---

## 🤝 贡献指南

1. 在 `data/` 目录下添加 `yaml` 和 `png`。
2. 📏 **图标规范**：
   - 🖼️ 格式：PNG（不支持 SVG）。
   - 📐 尺寸：200x200 px，主体居中约 140px。
   - ⚖️ 体积：20 kB 以内。
3. ✅ 执行 `pnpm test` 确保校验通过。

---

## 🙏 致谢

感谢原项目 [metowolf/vCards](https://github.com/metowolf/vCards) 提供的数据和贡献者们的辛勤维护！
