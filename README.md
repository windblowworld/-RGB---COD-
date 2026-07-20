# 基于手机 RGB 图像的 COD 实时可视化快速分析系统

本项目是水样化学需氧量（COD）辅助分析系统：微信小程序负责 RGB 数据录入和结果展示，独立 Node.js 服务负责参数校验、量程选择、标定公式计算、异常值处理与检测记录保存，实现前后端解耦。

## 论文成果

王诗彤，贺洋洋，**熊细鸿**，张维，夏美琳，唐凤琳. 基于手机RGB图像-微信小程序的化学需氧量（COD）实时可视化快速分析[J]. 大学化学，2026，41(1)：394-405.

你作为论文第三作者熊细鸿参与了相关工作。论文链接：[中国知网](https://kns.cnki.net/kcms2/article/abstract?v=hUjjRxyvaVO7ggD70-8QVSVSyTYjxM1j2ecB9irtQq_A4I2xkMJ6SZlCF9oPFPjTW_qQRNptuLqYs-wI9_SYqduxCR5ipGeQjNBCwTiHSbGirLCv9tM9HtW7D7eznxTUAVaFbx3iA32wbis2EHvnXGy-h0vU3dKXnWAg8M-CCo4bWHVnyZVVhg==&uniplatform=NZKPT&language=CHS)。

```bibtex
@article{DXHX202601037,
  author = {王诗彤 and 贺洋洋 and 熊细鸿 and 张维 and 夏美琳 and 唐凤琳},
  title = {基于手机RGB图像-微信小程序的化学需氧量（COD）实时可视化快速分析},
  journal = {大学化学},
  volume = {41},
  number = {1},
  pages = {394--405},
  year = {2026},
  issn = {1000-8438}
}
```

## 架构与功能

```text
微信小程序 → HTTPS / JSON → Node.js 独立 COD 服务
```

- 校验 0–255 范围内的 RGB 参数，支持高低量程自动或手动选择。
- 服务端统一执行 RGB-COD 标定多项式，并返回公式版本。
- 最多支持 10 次检测值的中位数离群值过滤与平均值计算。
- 提供检测记录写入、查询、健康检查、自动化测试和 Docker 部署支持。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 客户端 | 微信小程序、WXML、WXSS、JavaScript、`wx.request` |
| 后端 | Node.js 18+、原生 HTTP、RESTful API、JSON |
| 算法 | RGB-COD 高低量程多项式标定、公式版本管理 |
| 数据处理 | 中位数离群值过滤、平均值计算 |
| 存储 | JSON 演示存储，可替换为 MySQL/PostgreSQL |
| 测试与部署 | Node.js 原生测试框架、Docker |

## 项目结构

```text
miniprogram/                 微信小程序客户端
  config.js                  后端服务地址配置
  pages/index-main/          COD 计算页面
  pages/codInfo/             COD 指标说明
  pages/useTips/             使用建议
server/                      独立后端服务
  src/algorithm.js           标定公式与版本
  src/validation.js          API 参数校验
  src/storage.js             检测记录持久化
  src/app.js                 HTTP 服务和路由
  test/                      API 自动化测试
```

旧 QuickStart 页面已移除；保留的旧云函数和组件不参与当前运行链路。

## 本地运行

需要 Node.js 18 或更高版本：

```bash
cd server
npm test
npm start
```

访问 `http://127.0.0.1:3000/health`，返回 `{"status":"ok"}` 即表示服务正常。

使用微信开发者工具导入仓库根目录。开发联调时，在“详情 → 本地设置”勾选“不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书”。

## 使用前需要修改的配置

### 后端地址

编辑 `miniprogram/config.js`：

```js
module.exports = { apiBaseUrl: 'http://127.0.0.1:3000' };
```

- 开发者工具本地调试：使用 `127.0.0.1`。
- 手机局域网调试：改为电脑局域网 IP，例如 `http://192.168.1.10:3000`；手机和电脑需处于同一 Wi-Fi，并在防火墙中允许 Node.js 访问专用网络。
- 正式上线：必须使用 HTTPS 域名，并在微信公众平台添加为 request 合法域名。

### AppID、标定公式与存储

- 在 `project.config.json` 中替换为自己的小程序 AppID。
- 在 `server/src/algorithm.js` 中根据实验条件更新公式系数，并同步更新 `FORMULA_VERSION`。
- 演示记录写入 `server/data/measurements.json`；生产环境应替换为 MySQL/PostgreSQL，并加入数据库迁移、微信登录、限流、日志和监控。

## API

- `GET /health`：健康检查。
- `POST /api/v1/cod/calculate`：计算单次 COD。
- `POST /api/v1/cod/average`：计算多次检测值平均值并过滤离群值。
- `POST /api/v1/measurements`：计算并保存一条检测记录。
- `GET /api/v1/measurements`：查询近期检测记录。

计算请求示例：

```json
{ "r": 1, "g": 2, "b": 11, "range": "auto" }
```

## Docker

```bash
docker build -t cod-analysis-service ./server
docker run --rm -p 3000:3000 cod-analysis-service
```

## 安全说明

不要提交 `project.private.config.json`、`miniprogram/envList.js`、生产域名、数据库密码、Token 或其他密钥。当前项目用于辅助分析，不替代经校准仪器或实验室检测结果。
