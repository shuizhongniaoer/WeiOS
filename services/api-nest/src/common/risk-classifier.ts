import type { RiskLevel } from "@weios/shared-types";

const redPatterns = [
  "send email",
  "send wechat",
  "send dingtalk",
  "trade",
  "transfer",
  "delete",
  "production database",
  "browser cookie",
  "deploy production",
  "dns",
  "发邮件",
  "发微信",
  "发钉钉",
  "交易",
  "转账",
  "删除",
  "生产数据库",
  "浏览器 cookie",
  "部署生产",
  "修改 dns",
];

const yellowPatterns = [
  "modify code",
  "create pr",
  "external api",
  "formal document",
  "draft reply",
  "修改代码",
  "创建 pr",
  "外部 api",
  "正式文档",
  "回复草稿",
];

export function classifyRisk(action: string): RiskLevel {
  const normalized = action.trim().toLowerCase();

  if (redPatterns.some((pattern) => normalized.includes(pattern))) {
    return "red";
  }

  if (yellowPatterns.some((pattern) => normalized.includes(pattern))) {
    return "yellow";
  }

  return "green";
}
