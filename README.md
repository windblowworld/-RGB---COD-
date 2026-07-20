# 水样 COD 检测小程序

基于微信小程序云开发的水样化学需氧量（COD）辅助计算工具。用户输入 RGB 值后，小程序会按标定公式计算 COD，并提供多次测量结果的平均值计算。

## 功能

- 根据 RGB 值计算高量程或低量程 COD 结果
- 根据 B 值自动切换量程，也可手动选择量程
- 录入最多 10 次测量结果并自动排除明显离群值
- 提供 COD 指标说明和使用建议

## 本地运行

1. 使用微信开发者工具导入本仓库根目录。
2. 在 `miniprogram/app.js` 中替换 `env` 为自己的云开发环境 ID，或选择项目所需的云环境。
3. 如需使用云函数，在开发者工具中部署 `cloudfunctions` 下对应的函数。

## 注意事项

- RGB 输入范围为 0–255；计算结果取决于当前标定公式及其适用范围。
- 本项目用于辅助计算，不应替代经校准仪器或实验室检测结果。
- `project.private.config.json` 是开发者工具的本地配置，已加入忽略规则；若它已经被 Git 跟踪，请在首次提交前执行 `git rm --cached project.private.config.json`。

## 项目结构

```text
miniprogram/                 小程序前端
  pages/index-main/          COD 计算主页面
cloudfunctions/              云函数
project.config.json          微信开发者工具公共配置
```
