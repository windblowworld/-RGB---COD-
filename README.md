# 基于手机 RGB 图像的 COD 实时可视化快速分析系统

本项目是一个面向水样化学需氧量（COD）辅助分析的微信小程序系统。小程序端负责 RGB 数据录入与结果展示，独立后端服务统一负责参数校验、量程选择、标定公式计算、异常值处理及检测记录存储，实现前后端解耦。

## 论文成果

本项目相关研究成果已发表，论文链接：

[基于手机RGB图像-微信小程序的化学需氧量（COD）实时可视化快速分析（中国知网）](https://kns.cnki.net/kcms2/article/abstract?v=hUjjRxyvaVO7ggD70-8QVSVSyTYjxM1j2ecB9irtQq_A4I2xkMJ6SZlCF9oPFPjTW_qQRNptuLqYs-wI9_SYqduxCR5ipGeQjNBCwTiHSbGirLCv9tM9HtW7D7eznxTUAVaFbx3iA32wbis2EHvnXGy-h0vU3dKXnWAg8M-CCo4bWHVnyZVVhg==&uniplatform=NZKPT&language=CHS)

@article{DXHX202601037,
author = {  王诗彤 and     贺洋洋 and     熊细鸿 and     张维 and     夏美琳 and 唐凤琳},
title = {基于手机RGB图像-微信小程序的化学需氧量（COD）实时可视化快速分析},
journal = {大学化学},
volume = {41},
 number = {1},
pages = {394-405},
year = {2026},
issn = {1000-8438},
}

## 系统架构

```text
微信小程序
  └─ RGB 数据录入、量程选择、结果展示
              │ HTTPS / JSON
              ▼
独立 COD 后端服务（Node.js）
  ├─ RGB 参数校验
  ├─ 高/低量程自动选择
  ├─ 标定多项式与公式版本管理
  ├─ 中位数离群值过滤与平均值计算
  └─ 检测记录持久化
```

## 功能特性

- 校验 RGB 输入是否处于 0–255 的有效范围。
- 支持高、低量程手动选择，以及按 B 值自动选择量程。
- 服务端执行 COD 标定多项式，避免不同客户端版本使用不同算法。
- 最多支持 10 次检测值的中位数离群值剔除与平均值计算。
- 提供检测记录写入、查询及健康检查接口。
- 内置 API 自动化测试与 Docker 部署文件。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 客户端 | 微信小程序、WXML、WXSS、JavaScript、`wx.request` |
| 后端 | Node.js 18+、原生 HTTP、RESTful API、JSON |
| 核心算法 | RGB-COD 高低量程多项式标定、公式版本管理 |
| 数据处理 | 中位数异常值过滤、平均值计算 |
| 数据存储 | 本地 JSON 演示存储，可替换为 MySQL/PostgreSQL |
| 测试与部署 | Node.js 原生测试框架、Docker |

## 目录结构

```text
miniprogram/                 微信小程序客户端
  config.js                  后端服务地址配置
  pages/index-main/          COD 计算页面
server/                      独立后端服务
  src/algorithm.js           标定公式与算法版本
  src/validation.js          API 参数校验
  src/storage.js             检测记录持久化适配层
  src/app.js                 HTTP 服务及路由入口
  test/                      API 自动化测试
```

> 当前小程序启动入口已收敛为 COD 计算、COD 说明和使用建议三个页面。仓库中仍保留的 CloudBase QuickStart 源文件不参与运行，属于历史模板资料。

## 本地运行

### 1. 启动后端服务

需要安装 Node.js 18 或更高版本：

```bash
cd server
npm test
npm start
```

服务默认监听 `http://127.0.0.1:3000`。浏览器访问以下地址，返回 `{"status":"ok"}` 即表示启动成功：

```text
http://127.0.0.1:3000/health
```

如需更换端口：

```powershell
$env:PORT=8080
npm start
```

### 2. 配置并运行小程序

使用微信开发者工具导入仓库根目录，然后修改 `miniprogram/config.js`：

```js
module.exports = {
  apiBaseUrl: 'http://127.0.0.1:3000',
};
```

在微信开发者工具的“详情 → 本地设置”中，开发联调时勾选“不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书”，然后重新编译。

## 使用本项目时需要修改的内容

### 后端地址

- **开发者工具本地调试**：使用 `http://127.0.0.1:3000`。
- **手机局域网调试**：将地址改为电脑的局域网 IP，例如 `http://192.168.1.10:3000`；手机和电脑必须连接同一个 Wi-Fi，同时允许 Windows 防火墙放行 Node.js 的专用网络访问。
- **正式上线**：必须配置 HTTPS 域名，并在微信公众平台中添加为小程序的 request 合法域名，例如 `https://api.example.com`。

### 小程序 AppID

若使用自己的微信小程序账号，请在 `project.config.json` 中替换 `appid` 为自己的 AppID；不要提交包含个人调试信息的 `project.private.config.json`。

### COD 标定公式

标定公式位于 `server/src/algorithm.js`，其中包含高、低量程的计算系数和 `FORMULA_VERSION`。

使用不同设备、光照条件、水样类型或重新标定实验数据时，应：

1. 根据实验结果更新高、低量程的公式系数。
2. 更新 `FORMULA_VERSION`，例如 `rgb-calibration-v2`。
3. 使用已知标准样本补充 API 或人工验证记录。
4. 不要将当前公式直接用于超出原始实验条件的场景。

### 检测记录存储

演示环境中，记录保存在 `server/data/measurements.json`，该目录已被 Git 忽略。

生产环境建议替换为 MySQL 或 PostgreSQL，并设计检测记录表、标定系数版本表和数据库迁移脚本；同时接入微信登录，实现按用户隔离数据。

## API 说明

### 健康检查

```text
GET /health
```

### 单次 COD 计算

```text
POST /api/v1/cod/calculate
```

```json
{ "r": 1, "g": 2, "b": 11, "range": "auto" }
```

`range` 可选值为 `auto`、`high`、`low`。响应包含 COD 结果、实际量程和公式版本。

### 平均值计算

```text
POST /api/v1/cod/average
```

```json
{ "values": [18.2, 18.6, 18.4], "range": "high" }
```

服务端按中位数和量程阈值过滤离群值，返回平均值、接受的数值及剔除数量。

### 检测记录

- `POST /api/v1/measurements`：计算并保存一条检测记录。
- `GET /api/v1/measurements`：查询最近的检测记录。

## Docker 部署

```bash
docker build -t cod-analysis-service ./server
docker run --rm -p 3000:3000 cod-analysis-service
```

## 安全与上线建议

- 不要提交 `project.private.config.json`、`miniprogram/envList.js`、生产域名、数据库密码、Token 或其他密钥。
- 生产环境需补充微信登录态校验、限流、结构化日志、监控告警、HTTPS 与数据库备份。
- 当前 JSON 文件存储适用于本地演示，不适合多实例部署或高并发写入。
- 本项目用于辅助分析，不能替代经校准仪器或实验室检测结果。

## 后续演进方向

1. 使用 MySQL 替换 JSON 存储，并引入标定系数版本表。
2. 接入微信登录和用户数据隔离。
3. 增加 Redis 限流、缓存、监控指标与告警。
4. 保持 REST API 契约不变，将 Node.js 服务替换为 C++（Drogon/Boost.Beast）实现，以满足更高性能需求。
