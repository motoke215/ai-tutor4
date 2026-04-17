import { useState, useRef, useEffect, useCallback } from "react";
import { Settings, Users, Plus, Trash2 } from "lucide-react";
import { Capacitor, registerPlugin } from "@capacitor/core";

const NativeVoice = Capacitor.isNativePlatform()
  ? registerPlugin("NativeVoice")
  : null;
const isNativeVoicePlatform = Capacitor.getPlatform() === "android" && !!NativeVoice;

function normalizePermissionState(state) {
  const value = String(state || "prompt").toLowerCase();
  if (["granted", "denied", "prompt", "prompt-with-rationale"].includes(value)) return value;
  if (value === "promptwithrationale") return "prompt-with-rationale";
  return "prompt";
}

const THEMES = {
  amber: {
    id: "amber", name: "暗夜琥珀", icon: "🌙",
    bg: "#0f0d0a", surface: "#1a1612", card: "#211d18", border: "#2e2820",
    accent: "#f0a500", accentDim: "#c47f00", accentGlow: "rgba(240,165,0,0.15)",
    text: "#f5ede0", textDim: "#a89880", textMuted: "#6b5e50",
    userBubble: "linear-gradient(135deg, #f0a500, #c47f00)",
    userText: "#0f0d0a",
    headerBg: "rgba(15,13,10,0.88)",
    inputBg: "#211d18",
    orb1: "rgba(240,165,0,0.07)", orb2: "rgba(240,100,0,0.04)",
  },
  scholar: {
    id: "scholar", name: "白日书院", icon: "☀️",
    bg: "#faf7f2", surface: "#f2ede4", card: "#ffffff", border: "#e8ddd0",
    accent: "#8b5e3c", accentDim: "#6b4228", accentGlow: "rgba(139,94,60,0.12)",
    text: "#2d1f14", textDim: "#7a5c44", textMuted: "#b8997d",
    userBubble: "linear-gradient(135deg, #8b5e3c, #6b4228)",
    userText: "#ffffff",
    headerBg: "rgba(250,247,242,0.92)",
    inputBg: "#f8f4ee",
    orb1: "rgba(139,94,60,0.06)", orb2: "rgba(200,150,80,0.04)",
  },
  ocean: {
    id: "ocean", name: "深海墨水", icon: "🌊",
    bg: "#060d1a", surface: "#0c1628", card: "#101e35", border: "#1a2d4a",
    accent: "#38bdf8", accentDim: "#0ea5e9", accentGlow: "rgba(56,189,248,0.15)",
    text: "#e0f0ff", textDim: "#7eaed4", textMuted: "#4a7090",
    userBubble: "linear-gradient(135deg, #38bdf8, #0284c7)",
    userText: "#060d1a",
    headerBg: "rgba(6,13,26,0.90)",
    inputBg: "#101e35",
    orb1: "rgba(56,189,248,0.07)", orb2: "rgba(6,182,212,0.04)",
  },
  bamboo: {
    id: "bamboo", name: "竹林清风", icon: "🎋",
    bg: "#080f0a", surface: "#0e1810", card: "#132014", border: "#1d3020",
    accent: "#6ee7b7", accentDim: "#34d399", accentGlow: "rgba(110,231,183,0.14)",
    text: "#e8f5ee", textDim: "#7fbf9c", textMuted: "#4a7a5a",
    userBubble: "linear-gradient(135deg, #6ee7b7, #10b981)",
    userText: "#080f0a",
    headerBg: "rgba(8,15,10,0.90)",
    inputBg: "#132014",
    orb1: "rgba(110,231,183,0.07)", orb2: "rgba(52,211,153,0.04)",
  },
};

const MODEL_PROVIDERS = {
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    icon: "🔵",
    color: "#346cf0",
    defaultUrl: "https://api.deepseek.com/v1",
    endpoint: "/chat/completions",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat", desc: "通用对话模型" },
      { id: "deepseek-coder", name: "DeepSeek Coder", desc: "代码专用模型" },
    ],
  },
  minimax: {
    id: "minimax",
    name: "MiniMax",
    icon: "🟠",
    color: "#ff6b35",
    defaultUrl: "https://api.minimax.chat/v1",
    endpoint: "/text/chatcompletion_v2",
    extraFields: [
      { id: "groupId", label: "Group ID", placeholder: "输入 MiniMax Group ID（仅旧版接口需要）" },
    ],
    models: [
      { id: "MiniMax-M2.7", name: "MiniMax M2.7", desc: "新一代旗舰通用模型" },
      { id: "MiniMax-M2.5", name: "MiniMax M2.5", desc: "稳定对话与推理" },
      { id: "MiniMax-M2", name: "MiniMax M2", desc: "通用对话模型" },
      { id: "MiniMax-M2.1", name: "MiniMax M2.1", desc: "轻量高性价比" },
      { id: "MiniMax-M2-Her", name: "MiniMax M2-Her", desc: "角色陪伴风格" },
    ],
  },
  siliconflow: {
    id: "siliconflow",
    name: "硅基流动",
    icon: "💧",
    color: "#00d4aa",
    defaultUrl: "https://api.siliconflow.cn/v1",
    endpoint: "/chat/completions",
    voiceInputUrl: "https://api.siliconflow.cn/v1/audio/transcriptions",
    voiceOutputUrl: "https://api.siliconflow.cn/v1/audio/speech",
    voiceModels: {
      input: [{ id: "FunAudioLLM/SenseVoiceSmall", name: "SenseVoiceSmall" }],
      output: [{ id: "FunAudioLLM/CosyVoice2-0.5B", name: "CosyVoice2" }],
    },
    models: [
      { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen2.5-72B", desc: "旗舰模型" },
      { id: "Qwen/Qwen2.5-14B-Instruct", name: "Qwen2.5-14B", desc: "更强推理" },
      { id: "Qwen/Qwen2.5-7B-Instruct", name: "Qwen2.5-7B", desc: "通识对话" },
      { id: "deepseek-ai/DeepSeek-V2.5", name: "DeepSeek-V2.5", desc: "最新融合模型" },
      { id: "THUDM/glm-4-9b-chat", name: "GLM-4-9B", desc: "智谱4代9B" },
      { id: "meta-llama/Llama-3.1-70B-Instruct", name: "Llama-3.1-70B", desc: "Meta 3.1 70B" },
    ],
  },
  dashscope: {
    id: "dashscope",
    name: "阿里通义",
    icon: "🔶",
    color: "#ff6a00",
    defaultUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    endpoint: "/chat/completions",
    models: [
      { id: "qwen-turbo", name: "Qwen Turbo", desc: "快速版" },
      { id: "qwen-plus", name: "Qwen Plus", desc: "增强版" },
      { id: "qwen-max", name: "Qwen Max", desc: "最强版" },
    ],
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: "⚫",
    color: "#10a37f",
    defaultUrl: "https://api.openai.com/v1",
    endpoint: "/chat/completions",
    models: [
      { id: "gpt-4o", name: "GPT-4o", desc: "最新旗舰" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "轻量快速" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", desc: "Turbo版" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", desc: "经典模型" },
    ],
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    icon: "🟤",
    color: "#d4a574",
    defaultUrl: "https://api.anthropic.com/v1",
    endpoint: "/messages",
    models: [
      { id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet", desc: "均衡智能" },
      { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku", desc: "快速响应" },
      { id: "claude-3-opus-latest", name: "Claude 3 Opus", desc: "更强推理" },
    ],
  },
};

const TEACHERS = [
  {
    keys: ["python","javascript","js","编程","代码","code","react","vue","算法","数据结构","typescript","java","c++","rust","go","swift"],
    name: "Alex", title: "编程教练", avatar: "A", lang: "zh-CN",
    style: "你是一个酷炫的硅谷风技术教练，用简洁的比喻解释技术概念，偶尔用英文术语，风格直接犀利",
  },
  {
    keys: ["english","英语","法语","日语","韩语","spanish","german","外语","语言","口语","写作","雅思","托福","gre"],
    name: "Sarah", title: "外语老师", avatar: "S", lang: "en-US",
    style: "You are a warm and encouraging language teacher. Mix Chinese explanations with target language practice. Always correct mistakes kindly and make students speak",
  },
  {
    keys: ["数学","math","几何","代数","微积分","概率","统计","物理","化学","力学","热力学","电磁"],
    name: "王老师", title: "理科导师", avatar: "王", lang: "zh-CN",
    style: "你是严谨但风趣的理科老师，善用生活中的实例解释抽象公式，坚持先问后讲，不放过任何逻辑漏洞",
  },
  {
    keys: ["历史","文学","语文","哲学","政治","地理","人文","诗词","古文","文化","伦理","逻辑"],
    name: "陈老师", title: "文科导师", avatar: "陈", lang: "zh-CN",
    style: "你是儒雅渊博的文科老师，善于用故事和背景知识引导学生，提问充满思辨性，总能把知识讲活",
  },
  {
    keys: ["经济","金融","商业","管理","市场","会计","投资","股票","企业","创业","营销","战略"],
    name: "李老师", title: "商科导师", avatar: "李", lang: "zh-CN",
    style: "你是思维敏锐的商科导师，用案例教学法，总是先问学生对商业世界的直觉判断，然后引导深入",
  },
  {
    keys: ["生物","医学","健康","心理","神经","解剖","遗传","生态","营养","中医","药学"],
    name: "林老师", title: "生命科学导师", avatar: "林", lang: "zh-CN",
    style: "你是温柔细心的生命科学老师，把复杂的生物概念类比到日常生活，特别注重理解而非死记",
  },
];

const DEFAULT_TEACHER = {
  name: "孔老师", title: "博学导师", avatar: "孔", lang: "zh-CN",
  style: "你是一位博学通才的导师，善于从多角度切入任何知识领域，因材施教，充满耐心",
};

const STORAGE_KEYS = {
  USERS: "tutor_users",
  CURRENT_USER: "tutor_current_user",
  MODEL_CONFIGS: "tutor_model_configs",
  ACTIVE_PROVIDER: "tutor_active_provider",
  GLOBAL_SETTINGS: "tutor_global_settings",
  PROGRESS_PREFIX: "tutor_progress_",
};

function getTeacher(subject) {
  if (!subject) return DEFAULT_TEACHER;
  const lower = subject.toLowerCase();
  return TEACHERS.find(t => t.keys.some(k => lower.includes(k))) || DEFAULT_TEACHER;
}

const masteryColor = (v) => {
  if (v < 30) return "#f87171";
  if (v < 60) return "#fb923c";
  if (v < 80) return "#facc15";
  return "#4ade80";
};

const masteryLabel = (v) => {
  if (v < 20) return ["继续加油", "💪"];
  if (v < 50) return ["初见端倪", "🌱"];
  if (v < 70) return ["逐渐清晰", "🔥"];
  if (v < 90) return ["快要掌握", "⚡"];
  return ["已经掌握", "✨"];
};

function getPermissionErrorMessage(error) {
  const message = String(error?.message || error || "");
  const name = String(error?.name || "");
  const combined = `${name} ${message}`.toLowerCase();
  if (/permission|denied|notallowed|security|forbidden/.test(combined)) {
    return "麦克风权限被拒绝，请到系统设置 → 应用 → AI一对一私教 → 权限中开启麦克风后重试";
  }
  if (/notfound|device not found|found no microphone|input device/.test(combined)) {
    return "未检测到可用麦克风，请确认设备已连接并可正常录音";
  }
  if (/notreadable|trackstart|hardware/.test(combined)) {
    return "麦克风当前被其他应用占用，请关闭占用后重试";
  }
  return message || "无法启动录音，请检查麦克风权限";
}

async function queryNativeMicrophonePermission() {
  if (!NativeVoice) return null;
  try {
    const result = await NativeVoice.checkPermissions();
    return normalizePermissionState(result?.microphone);
  } catch {
    return null;
  }
}

async function requestNativeMicrophonePermission() {
  if (!NativeVoice) return null;
  try {
    const result = await NativeVoice.requestPermissions();
    return normalizePermissionState(result?.microphone);
  } catch {
    return null;
  }
}

async function openNativeAppSettings() {
  if (!NativeVoice) return false;
  try {
    await NativeVoice.openAppSettings();
    return true;
  } catch {
    return false;
  }
}

async function queryMicrophonePermission() {
  const nativeState = await queryNativeMicrophonePermission();
  if (nativeState) return nativeState;
  if (!navigator.permissions?.query) return "prompt";
  try {
    const status = await navigator.permissions.query({ name: "microphone" });
    return status?.state || "prompt";
  } catch {
    return "prompt";
  }
}

function isLikelyVoiceInvalid(errorText) {
  return /invalid voice|voice.*invalid|unsupported voice|unknown voice|"code"\s*:\s*20047/i.test(String(errorText || ""));
}

function normalizeSiliconFlowVoiceName(voice) {
  const value = String(voice || "").trim().toLowerCase();
  const aliasMap = {
    anna: "anna",
    longxiaochun: "longxiaochun",
    otetsu: "otetsu",
    yunjian: "yunjian",
    "fishaudio/anna": "anna",
    "fishaudio/longxiaochun": "longxiaochun",
    "fishaudio/otetsu": "otetsu",
    "fishaudio/yunjian": "yunjian",
    "funaudiollm/cosyvoice2-0.5b:anna": "anna",
    "funaudiollm/cosyvoice2-0.5b:longxiaochun": "longxiaochun",
    "funaudiollm/cosyvoice2-0.5b:otetsu": "otetsu",
    "funaudiollm/cosyvoice2-0.5b:yunjian": "yunjian",
  };
  return aliasMap[value] || "";
}
function buildTutorSystemPrompt(subject, level, goal) {
  return `你正在辅导学生学习「${subject}」，学生水平：${level}，目标：${goal || "全面掌握"}。

【苏格拉底教学原则】
1. 永不直接给答案——先问学生已知什么，找到知识漏洞
2. 用问题引导学生自己推导出答案
3. 掌握率<80%时绝不推进新知识点，坚守一个点直到真正理解
4. 学生卡壳时：换比喻、换例子、换角度，最多换三次
5. 每3-4轮必须做一次小测验，主动验证理解（不是听懂了，是会用）
6. 回复必须简洁有力，≤120字，像真正在面对面讲课

【掌握率规则】
- 学生主动推导出正确答案 → +15~20
- 学生答对但是靠猜 → +5~8
- 学生部分理解 → +3~6
- 学生答错/不懂 → -5~10
- 学生说"懂了"但无法举例 → -3

【严格按JSON格式回复，不输出任何额外文字】:
{
  "message": "你的教学内容（\\n分隔段落）",
  "masteryDelta": 整数,
  "currentMastery": 0-100整数,
  "mode": "explore|explain|test|praise|redirect|milestone之一",
  "suggestedResponses": ["选项1","选项2","选项3"],
  "insight": "一句话描述学生理解状态"
}`;
}

function normalizeSuggestedResponses(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => typeof item === "string" ? item.trim() : String(item || "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

function buildSafeAssistantMessage(parsed) {
  return {
    role: "assistant",
    content: typeof parsed?.message === "string" && parsed.message.trim() ? parsed.message : "（解析失败，请重试）",
    mode: typeof parsed?.mode === "string" && parsed.mode ? parsed.mode : "explain",
    insight: typeof parsed?.insight === "string" ? parsed.insight : "",
    suggestedResponses: normalizeSuggestedResponses(parsed?.suggestedResponses),
  };
}

function MasteryRing({ value }) {
  const r = 26, c = 32, stroke = 5;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const col = masteryColor(value);
  return (
    <svg width={64} height={64}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(128,128,128,0.2)" strokeWidth={stroke} />
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={col}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 5px ${col})` }}
      />
      <text x={c} y={c + 5} textAnchor="middle" fill={col} fontSize={12} fontWeight={700} fontFamily="monospace">{value}%</text>
    </svg>
  );
}

function TypingDots({ T, teacher }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accentGlow, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: T.accent, fontWeight: 700, flexShrink: 0 }}>
        {teacher.avatar}
      </div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "4px 18px 18px 18px", padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, animation: `dotBounce 1.2s ${i*0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function generateId() {
  return "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11);
}

function loadUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function loadCurrentUserId() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || null;
}

function saveCurrentUserId(userId) {
  if (userId) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

function normalizeProviderConfig(raw = {}, providerId) {
  const source = raw?.[providerId];
  const provider = MODEL_PROVIDERS[providerId];
  const config = typeof source === "object" && source ? source : {};
  return {
    apiKey: typeof config.apiKey === "string" ? config.apiKey : "",
    model: typeof config.model === "string" ? config.model : provider?.models?.[0]?.id || "",
    groupId: typeof config.groupId === "string" ? config.groupId : "",
    voiceInputModel: typeof config.voiceInputModel === "string" ? config.voiceInputModel : provider?.voiceModels?.input?.[0]?.id || "",
    voiceOutputModel: typeof config.voiceOutputModel === "string" ? config.voiceOutputModel : provider?.voiceModels?.output?.[0]?.id || "",
  };
}

function normalizeModelConfigs(rawConfigs = {}) {
  return Object.keys(MODEL_PROVIDERS).reduce((acc, providerId) => {
    acc[providerId] = normalizeProviderConfig(rawConfigs, providerId);
    return acc;
  }, {});
}

function loadModelConfigs() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIGS);
    if (!data) return normalizeModelConfigs();
    return normalizeModelConfigs(JSON.parse(data));
  } catch {
    return normalizeModelConfigs();
  }
}

function saveModelConfigs(configs) {
  localStorage.setItem(STORAGE_KEYS.MODEL_CONFIGS, JSON.stringify(normalizeModelConfigs(configs)));
}

function loadActiveProvider() {
  const value = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROVIDER) || "deepseek";
  return MODEL_PROVIDERS[value] ? value : "deepseek";
}

function saveActiveProvider(provider) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROVIDER, provider);
}

function loadGlobalSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GLOBAL_SETTINGS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveGlobalSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.GLOBAL_SETTINGS, JSON.stringify(settings));
}

function loadPermissionPrompted() {
  return !!loadGlobalSettings().permissionPrompted;
}

function savePermissionPrompted(value) {
  saveGlobalSettings({ ...loadGlobalSettings(), permissionPrompted: !!value });
}

function loadProgress(userId, subject) {
  if (!userId) return null;
  try {
    const key = STORAGE_KEYS.PROGRESS_PREFIX + userId + "_" + subject;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveProgress(userId, subject, progress) {
  if (!userId) return;
  const key = STORAGE_KEYS.PROGRESS_PREFIX + userId + "_" + subject;
  localStorage.setItem(key, JSON.stringify({ ...progress, lastUpdated: new Date().toISOString() }));
}

function loadUserProgressList(userId) {
  if (!userId) return [];
  const results = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEYS.PROGRESS_PREFIX + userId + "_")) {
      const subject = key.replace(STORAGE_KEYS.PROGRESS_PREFIX + userId + "_", "");
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data) results.push({ subject, ...data });
      } catch {}
    }
  }
  return results;
}

function toOpenAIMessage(message) {
  return { role: message.role, content: typeof message.content === "string" ? message.content : String(message.content || "") };
}

function toAnthropicMessages(messages) {
  return messages
    .filter(message => message.role !== "system")
    .map(message => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: [{ type: "text", text: typeof message.content === "string" ? message.content : String(message.content || "") }],
    }));
}

function extractMiniMaxText(data) {
  return data?.reply
    || data?.choices?.[0]?.message?.content
    || data?.base_resp?.reply
    || data?.output?.text
    || data?.output_text
    || data?.data?.reply
    || data?.data?.text
    || data?.messages?.[0]?.text
    || "";
}

function extractResponseText(provider, data) {
  if (provider === "anthropic") {
    return data.content?.find?.(item => item.type === "text")?.text || "";
  }
  if (provider === "minimax") {
    return extractMiniMaxText(data);
  }
  return data.choices?.[0]?.message?.content || "";
}

function buildMiniMaxBody(config, messages, system) {
  const allMessages = system ? [{ role: "system", content: system }, ...messages] : messages;
  const usesLegacyEndpoint = /chatcompletion_v2/i.test(MODEL_PROVIDERS.minimax.endpoint);

  if (usesLegacyEndpoint) {
    if (!config.groupId) {
      throw new Error("MiniMax 需要填写 Group ID");
    }
    return {
      model: config.model,
      messages: messages.map(toOpenAIMessage),
      temperature: 0.7,
      tokens_to_generate: 1000,
      reply_constraints: { sender_type: "BOT", sender_name: "AI Tutor" },
      bot_setting: [{ bot_name: "AI Tutor", content: system || "You are a helpful assistant." }],
      group_id: config.groupId,
    };
  }

  return {
    model: config.model,
    messages: allMessages.map(toOpenAIMessage),
    temperature: 0.7,
    max_tokens: 1000,
  };
}

async function callModelAPI(providerId, config, messages, system) {
  const provider = MODEL_PROVIDERS[providerId];
  if (!provider) throw new Error("未识别的模型服务商");
  if (!config.apiKey) throw new Error("请先配置 API Key");
  if (!config.model) throw new Error("请先选择模型");

  const url = `${provider.defaultUrl.replace(/\/$/, "")}${provider.endpoint}`;
  const headers = { "Content-Type": "application/json" };
  let body;
  const messagesWithSystem = system ? [{ role: "system", content: system }, ...messages] : messages;

  switch (providerId) {
    case "anthropic":
      headers["x-api-key"] = config.apiKey;
      headers["anthropic-version"] = "2023-06-01";
      body = {
        model: config.model,
        max_tokens: 1000,
        system: system || undefined,
        messages: toAnthropicMessages(messagesWithSystem),
      };
      break;
    case "minimax":
      headers.Authorization = `Bearer ${config.apiKey}`;
      body = buildMiniMaxBody(config, messages, system);
      break;
    default:
      headers.Authorization = `Bearer ${config.apiKey}`;
      body = {
        model: config.model,
        messages: messagesWithSystem.map(toOpenAIMessage),
        max_tokens: 1000,
        temperature: 0.7,
      };
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    try {
      const errorData = JSON.parse(errorText || "{}");
      throw new Error(errorData.error?.message || errorData.base_resp?.status_msg || errorData.message || `API请求失败 [${response.status}]`);
    } catch {
      throw new Error(`API请求失败 [${response.status}] ${errorText.slice(0, 160)}`.trim());
    }
  }

  const data = await response.json();
  const content = extractResponseText(providerId, data);
  if (!content) throw new Error("模型已返回响应，但未解析到可显示内容");
  return content;
}

async function transcribeAudio(config, blob, lang) {
  if (!config.apiKey) throw new Error("请先配置硅基流动 API Key");
  const provider = MODEL_PROVIDERS.siliconflow;
  const formData = new FormData();
  formData.append("model", config.voiceInputModel || provider.voiceModels.input[0].id);
  formData.append("language", lang);
  formData.append("file", blob, "speech.webm");

  const response = await fetch(provider.voiceInputUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`语音识别失败 [${response.status}] ${errorText.slice(0, 120)}`.trim());
  }

  const data = await response.json();
  return data.text || data.result || data.results?.[0]?.text || "";
}

function guessSiliconFlowVoice(text, lang) {
  const normalizedLang = String(lang || "").toLowerCase();
  const normalizedText = String(text || "");
  if (normalizedLang.startsWith("en") || /^[\x00-\x7F\s.,!?;:'"()\-]+$/.test(normalizedText)) {
    return "FunAudioLLM/CosyVoice2-0.5B:anna";
  }
  if (normalizedLang.startsWith("ja")) return "FunAudioLLM/CosyVoice2-0.5B:otetsu";
  if (normalizedLang.startsWith("ko")) return "FunAudioLLM/CosyVoice2-0.5B:yunjian";
  return "FunAudioLLM/CosyVoice2-0.5B:longxiaochun";
}

async function synthesizeSpeech(config, text, lang) {
  if (!config.apiKey) throw new Error("请先配置硅基流动 API Key");
  const provider = MODEL_PROVIDERS.siliconflow;
  const preferredVoice = normalizeSiliconFlowVoiceName(config.voiceName || guessSiliconFlowVoice(text, lang));
  const voicesToTry = Array.from(new Set([
    preferredVoice,
    normalizeSiliconFlowVoiceName(guessSiliconFlowVoice(text, lang)),
    normalizeSiliconFlowVoiceName(String(lang || "").toLowerCase().startsWith("en") ? "anna" : "longxiaochun"),
    "longxiaochun",
    "anna",
  ].filter(Boolean)));

  let lastErrorText = "";

  for (const voice of voicesToTry) {
    const response = await fetch(provider.voiceOutputUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.voiceOutputModel || provider.voiceModels.output[0].id,
        input: text,
        voice,
        response_format: "mp3",
      }),
    });

    if (response.ok) {
      return response.blob();
    }

    const errorText = await response.text().catch(() => "");
    lastErrorText = errorText;
    if (!isLikelyVoiceInvalid(errorText)) {
      throw new Error(`语音播报失败 [${response.status}] ${errorText.slice(0, 120)}`.trim());
    }
  }

  throw new Error("当前语音音色不可用，请改用默认音色或稍后重试");
}

function ModelConfigPanel({ T, configs, setConfigs, activeProvider, setActiveProvider, onClose }) {
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  const handleSave = () => {
    saveModelConfigs(configs);
    saveActiveProvider(activeProvider);
    onClose();
  };

  const handleTest = async (providerId) => {
    const config = normalizeProviderConfig(configs, providerId);
    if (!config.apiKey) {
      setTestResult({ provider: providerId, success: false, message: "请先输入 API Key" });
      return;
    }
    if (!config.model) {
      setTestResult({ provider: providerId, success: false, message: "请先选择模型" });
      return;
    }
    setTestingProvider(providerId);
    setTestResult(null);
    try {
      await callModelAPI(providerId, config, [{ role: "user", content: "Hi" }], "You are a helpful assistant.");
      setTestResult({ provider: providerId, success: true, message: "连接成功！" });
    } catch (error) {
      setTestResult({ provider: providerId, success: false, message: error.message });
    } finally {
      setTestingProvider(null);
    }
  };

  const updateConfig = (providerId, field, value) => {
    setConfigs(prev => ({
      ...prev,
      [providerId]: {
        ...normalizeProviderConfig(prev, providerId),
        [field]: value,
      },
    }));
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, width: "100%", maxWidth: 580, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Settings size={18} color={T.accent} /> 模型配置
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 8 }}>当前使用</div>
            <select
              value={activeProvider}
              onChange={e => setActiveProvider(e.target.value)}
              style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 14, fontFamily: "inherit" }}
            >
              {Object.entries(MODEL_PROVIDERS).map(([providerId, provider]) => (
                <option key={providerId} value={providerId}>{provider.icon} {provider.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(MODEL_PROVIDERS).map(([providerId, provider]) => {
              const config = normalizeProviderConfig(configs, providerId);
              const isActive = activeProvider === providerId;
              const isTesting = testingProvider === providerId;
              const result = testResult?.provider === providerId ? testResult : null;
              return (
                <div key={providerId} style={{ background: isActive ? T.accentGlow : T.surface, border: `1px solid ${isActive ? provider.color : T.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>{provider.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{provider.name}</span>
                    {isActive && <span style={{ fontSize: 10, background: provider.color, color: "#fff", padding: "2px 6px", borderRadius: 8 }}>使用中</span>}
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>API Key</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type={showPassword[providerId] ? "text" : "password"}
                        value={config.apiKey}
                        onChange={e => updateConfig(providerId, "apiKey", e.target.value)}
                        placeholder="输入 API Key"
                        style={{ flex: 1, background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 13, fontFamily: "inherit" }}
                      />
                      <button onClick={() => setShowPassword(prev => ({ ...prev, [providerId]: !prev[providerId] }))} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", color: T.textMuted, cursor: "pointer" }}>
                        {showPassword[providerId] ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>

                  {provider.extraFields?.map(field => (
                    <div key={field.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{field.label}</div>
                      <input
                        value={config[field.id] || ""}
                        onChange={e => updateConfig(providerId, field.id, e.target.value)}
                        placeholder={field.placeholder}
                        style={{ width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 13, fontFamily: "inherit" }}
                      />
                    </div>
                  ))}

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>API URL</div>
                    <div style={{ width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.accent, fontSize: 13, fontFamily: "monospace" }}>
                      {provider.defaultUrl}{provider.endpoint}
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>模型</div>
                    <select
                      value={config.model}
                      onChange={e => updateConfig(providerId, "model", e.target.value)}
                      style={{ width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 13, fontFamily: "inherit" }}
                    >
                      {provider.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>

                  {provider.voiceModels?.input && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>语音识别模型</div>
                      <select
                        value={config.voiceInputModel}
                        onChange={e => updateConfig(providerId, "voiceInputModel", e.target.value)}
                        style={{ width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 13, fontFamily: "inherit" }}
                      >
                        {provider.voiceModels.input.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                      </select>
                    </div>
                  )}

                  {provider.voiceModels?.output && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>语音播报模型</div>
                      <select
                        value={config.voiceOutputModel}
                        onChange={e => updateConfig(providerId, "voiceOutputModel", e.target.value)}
                        style={{ width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 13, fontFamily: "inherit" }}
                      >
                        {provider.voiceModels.output.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => handleTest(providerId)} disabled={isTesting} style={{ background: isTesting ? T.border : provider.color, border: "none", borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: 12, cursor: isTesting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                      {isTesting ? "测试中..." : "测试连接"}
                    </button>
                    {result && <span style={{ fontSize: 12, color: result.success ? "#4ade80" : "#f87171" }}>{result.success ? "✓ " : "✗ "}{result.message}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 20px", borderTop: `1px solid ${T.border}` }}>
          <button onClick={onClose} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 16px", color: T.text, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>取消</button>
          <button onClick={handleSave} style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`, border: "none", borderRadius: 8, padding: "8px 20px", color: T.userText, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>保存配置</button>
        </div>
      </div>
    </div>
  );
}

function UserCenterPanel({ T, currentUser, users, onClose, onSwitchUser, onAddUser, onDeleteUser }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🧑‍🎓");
  const avatars = ["🧑‍🎓", "👨‍💻", "👩‍🏫", "🧙", "🦸", "👽", "🤖", "🎅", "🧛", "🧜", "👸", "🤴"];

  const handleAddUser = () => {
    if (!newUsername.trim()) return;
    onAddUser(newUsername.trim(), selectedAvatar);
    setNewUsername("");
    setSelectedAvatar("🧑‍🎓");
    setShowAddForm(false);
  };

  const userProgressList = (userId) => loadUserProgressList(userId);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={18} color={T.accent} /> 用户中心
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {users.map(user => {
              const progressList = userProgressList(user.id);
              const isCurrentUser = currentUser?.id === user.id;
              return (
                <div key={user.id} style={{ background: isCurrentUser ? T.accentGlow : T.surface, border: `1px solid ${isCurrentUser ? T.accent : T.border}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 28 }}>{user.avatar}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                          {user.username}
                          {isCurrentUser && <span style={{ fontSize: 11, color: T.accent, marginLeft: 6 }}>当前用户</span>}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                          {progressList.length > 0 ? progressList.map(p => `${p.subject} ${p.mastery || 0}%`).join(" | ") : "暂无学习记录"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!isCurrentUser && <button onClick={() => { onSwitchUser(user.id); onClose(); }} style={{ background: T.accent, border: "none", borderRadius: 6, padding: "4px 10px", color: T.userText, fontSize: 11, cursor: "pointer" }}>切换</button>}
                      {users.length > 1 && <button onClick={() => onDeleteUser(user.id)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", color: T.textMuted, fontSize: 11, cursor: "pointer" }}><Trash2 size={12} /></button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {showAddForm ? (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12 }}>添加新用户</div>
              <div style={{ marginBottom: 12 }}>
                <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="输入用户名" style={{ width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.text, fontSize: 14, fontFamily: "inherit" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>选择头像</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {avatars.map(av => (
                    <button key={av} onClick={() => setSelectedAvatar(av)} style={{ fontSize: 20, background: selectedAvatar === av ? T.accentGlow : "transparent", border: `1px solid ${selectedAvatar === av ? T.accent : T.border}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}>{av}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleAddUser} disabled={!newUsername.trim()} style={{ flex: 1, background: newUsername.trim() ? T.accent : T.border, border: "none", borderRadius: 8, padding: "8px", color: T.userText, fontSize: 13, cursor: newUsername.trim() ? "pointer" : "not-allowed" }}>确定添加</button>
                <button onClick={() => setShowAddForm(false)} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 13, cursor: "pointer" }}>取消</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddForm(true)} style={{ width: "100%", background: "transparent", border: `1px dashed ${T.border}`, borderRadius: 12, padding: "12px", color: T.textMuted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={16} /> 添加新用户
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VoiceSettingsPanel({ T, voiceSettings, onUpdate, onClose, voiceCapability, activeProvider, voicePermissionState, onRequestMicrophonePermission, onOpenSystemPermissionSettings, permissionPrompted }) {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() || []);
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const voiceModes = [
    { id: "push-to-talk", label: "按键说话", desc: "点击录音，识别后自动发送" },
    { id: "text", label: "文字输入", desc: "纯文字模式" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, width: "100%", maxWidth: 420, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>🔊 语音设置</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, fontSize: 12, color: T.textDim, lineHeight: 1.7 }}>
            当前模型：{MODEL_PROVIDERS[activeProvider]?.name || "未选择"}
            <br />语音输入：{voiceCapability.input ? "已启用" : "不可用"}
            <br />麦克风权限：{voicePermissionState === "granted" ? "已授权" : voicePermissionState === "denied" ? "已拒绝" : voicePermissionState === "prompt-with-rationale" ? "需要再次确认" : voicePermissionState === "unsupported" ? "当前环境不支持查询" : permissionPrompted ? "已请求，等待系统确认" : "待请求"}
            <br />权限列表状态：{voicePermissionState === "granted" || voicePermissionState === "denied" || voicePermissionState === "prompt-with-rationale" ? "系统已登记麦克风权限" : permissionPrompted ? "已触发申请，等待系统登记" : "尚未触发申请，所以权限页可能为空"}
            <br />扬声器说明：Android 系统通常不会单独显示“扬声器/喇叭”权限；播放语音默认不需要额外授权。
            <br />如果权限页显示“未请求任何权限”，请先点一次下方“请求麦克风权限”。若你此前点过“拒绝”，系统可能不再弹窗，此时请直接点“打开系统权限设置”手动开启麦克风。
            {activeProvider === "minimax" && <><br />MiniMax 模型名称已按新版本保留，若旧接口报错可补填 Group ID。</>}
            {voiceCapability.reason && <><br />{voiceCapability.reason}</>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={onRequestMicrophonePermission} style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`, border: "none", borderRadius: 10, padding: "10px 14px", color: T.userText, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {voicePermissionState === "granted" ? "重新检测麦克风权限" : "请求麦克风权限"}
            </button>
            <button onClick={onOpenSystemPermissionSettings} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              打开系统权限设置
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>启用语音</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>开启后支持录音识别与老师朗读</div>
            </div>
            <button onClick={() => onUpdate({ enabled: !voiceSettings.enabled })} style={{ width: 48, height: 26, borderRadius: 13, border: "none", background: voiceSettings.enabled ? T.accent : T.border, position: "relative", cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: voiceSettings.enabled ? 24 : 2, transition: "left 0.2s" }} />
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>自动朗读</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>老师回复时自动播放语音</div>
            </div>
            <button onClick={() => onUpdate({ autoSpeak: !voiceSettings.autoSpeak })} style={{ width: 48, height: 26, borderRadius: 13, border: "none", background: voiceSettings.autoSpeak ? T.accent : T.border, position: "relative", cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: voiceSettings.autoSpeak ? 24 : 2, transition: "left 0.2s" }} />
            </button>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>语音模式</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {voiceModes.map(mode => (
                <button key={mode.id} onClick={() => onUpdate({ voiceMode: mode.id })} style={{ display: "flex", alignItems: "center", gap: 10, background: voiceSettings.voiceMode === mode.id ? T.accentGlow : "transparent", border: `1px solid ${voiceSettings.voiceMode === mode.id ? T.accent : T.border}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${voiceSettings.voiceMode === mode.id ? T.accent : T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {voiceSettings.voiceMode === mode.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{mode.label}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{mode.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>语速: {voiceSettings.speed || 1.0}x</div>
            <input type="range" min="0.5" max="2" step="0.1" value={voiceSettings.speed || 1.0} onChange={e => onUpdate({ speed: parseFloat(e.target.value) })} style={{ width: "100%", accentColor: T.accent }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 4 }}><span>慢</span><span>正常</span><span>快</span></div>
          </div>

          {voices.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>系统语音包</div>
              <select value={voiceSettings.voiceId || ""} onChange={e => onUpdate({ voiceId: e.target.value })} style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 13, fontFamily: "inherit" }}>
                <option value="">默认语音</option>
                {voices.map((v, i) => <option key={i} value={v.voiceURI || v.name}>{v.name} ({v.lang})</option>)}
              </select>
            </div>
          )}
        </div>

        <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.border}` }}>
          <button onClick={onClose} style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px", color: T.text, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>完成</button>
        </div>
      </div>
    </div>
  );
}

function RecoveryDialog({ T, progress, onResume, onNewSession }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, width: "100%", maxWidth: 380, padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>检测到未完成的学习</div>
          <div style={{ fontSize: 13, color: T.textDim }}>{progress.subject} · 掌握率 {progress.mastery || 0}%</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onResume} style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`, border: "none", borderRadius: 10, padding: "12px", color: T.userText, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>继续学习</button>
          <button onClick={onNewSession} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px", color: T.text, fontSize: 14, cursor: "pointer" }}>开始新课程</button>
        </div>
      </div>
    </div>
  );
}

function PronunciationText({ text, lang, voiceEnabled, voiceSettings }) {
  const synthRef = useRef(null);
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
  }, []);

  const speakWord = (word) => {
    if (!synthRef.current || !voiceEnabled) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = lang;
    utter.rate = voiceSettings?.speed || 0.8;
    if (voiceSettings?.voiceId) {
      const voices = synthRef.current.getVoices();
      const match = voices.find(v => v.voiceURI === voiceSettings.voiceId || v.name === voiceSettings.voiceId);
      if (match) utter.voice = match;
    }
    synthRef.current.speak(utter);
  };

  return <>{text.split(/(\s+)/).map((part, i) => /\s+/.test(part) ? <span key={i}>{part}</span> : (/['\w]+/.test(part) ? <span key={i} onClick={() => speakWord(part)} style={{ cursor: voiceEnabled ? "pointer" : "default" }}>{part}</span> : <span key={i}>{part}</span>))}</>;
}

export default function App() {
  const [themeId, setThemeId] = useState(() => loadGlobalSettings().themeId || "amber");
  const T = THEMES[themeId];

  const [users, setUsers] = useState(loadUsers);
  const [currentUser, setCurrentUser] = useState(() => {
    const userId = loadCurrentUserId();
    const allUsers = loadUsers();
    return allUsers.find(u => u.id === userId) || allUsers[0] || null;
  });
  const [modelConfigs, setModelConfigs] = useState(loadModelConfigs);
  const [activeProvider, setActiveProvider] = useState(loadActiveProvider);
  const [voiceSettings, setVoiceSettings] = useState(() => loadGlobalSettings().voiceSettings || { enabled: true, autoSpeak: false, speed: 1.0, voiceMode: "push-to-talk", voiceId: "" });
  const [phase, setPhase] = useState(() => loadUsers().length === 0 ? "welcome" : "onboard");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("初学者");
  const [goal, setGoal] = useState("");
  const [mastery, setMastery] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiHistory, setApiHistory] = useState([]);
  const [teacher, setTeacher] = useState(DEFAULT_TEACHER);
  const [voiceCapability, setVoiceCapability] = useState({ input: false, output: false, reason: "" });
  const [voicePermissionState, setVoicePermissionState] = useState("prompt");
  const [voiceError, setVoiceError] = useState("");
  const [permissionPrompted, setPermissionPrompted] = useState(loadPermissionPrompted);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [showUserCenter, setShowUserCenter] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [sessionStats, setSessionStats] = useState({ turns: 0, startTime: null });
  const [recoveryProgress, setRecoveryProgress] = useState(null);
  const nativeSpeechResultHandlerRef = useRef(null);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const systemRef = useRef("");
  const synthRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    let active = true;

    const syncVoiceCapability = async () => {
      const canRecord = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
      const canSpeak = !!window.speechSynthesis;
      const supportsSiliconVoice = !!modelConfigs.siliconflow?.apiKey;
      const permissionState = canRecord ? await queryMicrophonePermission() : "unsupported";
      if (!active) return;

      setVoicePermissionState(permissionState);
      setVoiceCapability({
        input: isNativeVoicePlatform || (canRecord && supportsSiliconVoice),
        output: isNativeVoicePlatform || canSpeak || supportsSiliconVoice,
        reason: isNativeVoicePlatform
          ? permissionState === "granted"
            ? "当前安卓版本已启用原生语音输入与原生朗读。"
            : "当前安卓版本使用原生语音能力；点击麦克风会直接触发系统麦克风授权。"
          : !supportsSiliconVoice
            ? "请先配置硅基流动 API Key 以启用手机语音识别。"
            : permissionState === "denied"
              ? "麦克风权限已被系统拒绝。请点“打开系统权限设置”手动开启，部分安卓系统在拒绝后不会再次弹窗。"
              : permissionState === "granted"
                ? "麦克风权限已获取；安卓系统不会单独提供“扬声器”权限，语音播放默认可直接使用。"
                : permissionState === "prompt-with-rationale"
                  ? "系统建议再次请求麦克风权限；若仍无弹窗，请直接进入系统设置手动开启。"
                  : Capacitor.isNativePlatform()
                    ? "点击下方麦克风按钮后，系统会弹出麦克风授权；安卓不会单独提供“扬声器”权限。"
                    : "浏览器/系统不会显示“扬声器”权限，播放语音默认无需单独授权。",
      });

      if (canSpeak) synthRef.current = window.speechSynthesis;
    };

    syncVoiceCapability();

    const restoreListener = Capacitor.isNativePlatform()
      ? null
      : null;

    return () => {
      active = false;
    };
  }, [modelConfigs.siliconflow?.apiKey]);

  useEffect(() => {
    if (phase === "chat" && currentUser && subject) {
      autoSaveTimerRef.current = setInterval(() => {
        saveProgress(currentUser.id, subject, { subject, level, goal, mastery, messages, apiHistory, sessionStats, teacher });
      }, 30000);
    }
    return () => autoSaveTimerRef.current && clearInterval(autoSaveTimerRef.current);
  }, [phase, currentUser, subject, mastery, messages, apiHistory, sessionStats, teacher, level, goal]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (phase === "chat" && currentUser && subject) {
        saveProgress(currentUser.id, subject, { subject, level, goal, mastery, messages, apiHistory, sessionStats, teacher });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [phase, currentUser, subject, mastery, messages, apiHistory, sessionStats, teacher, level, goal]);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "46px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  useEffect(() => {
    if (phase === "onboard" && currentUser) {
      const progressList = loadUserProgressList(currentUser.id);
      if (progressList.length > 0) {
        setRecoveryProgress(progressList.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))[0]);
      }
    }
  }, [phase, currentUser]);

  useEffect(() => {
    if (!isNativeVoicePlatform || !NativeVoice?.addListener) return;

    let speechEndTimer = null;
    const clearSpeechEndTimer = () => {
      if (speechEndTimer) {
        clearTimeout(speechEndTimer);
        speechEndTimer = null;
      }
    };

    const listeners = [];
    const register = async () => {
      listeners.push(await NativeVoice.addListener("speechResult", ({ text }) => {
        const transcript = String(text || "").trim();
        clearSpeechEndTimer();
        setIsRecording(false);
        if (!transcript) {
          setVoiceError("未识别到语音内容");
          return;
        }
        nativeSpeechResultHandlerRef.current?.(transcript);
      }));
      listeners.push(await NativeVoice.addListener("speechError", ({ message }) => {
        clearSpeechEndTimer();
        setIsRecording(false);
        setVoiceError(String(message || "语音识别失败"));
      }));
      listeners.push(await NativeVoice.addListener("speechEnd", () => {
        clearSpeechEndTimer();
        speechEndTimer = setTimeout(() => setIsRecording(false), 1200);
      }));
      listeners.push(await NativeVoice.addListener("ttsStart", () => {
        setIsSpeaking(true);
      }));
      listeners.push(await NativeVoice.addListener("ttsEnd", () => {
        setIsSpeaking(false);
      }));
      listeners.push(await NativeVoice.addListener("ttsError", ({ message }) => {
        setIsSpeaking(false);
        setVoiceError(String(message || "原生语音播报失败"));
      }));
    };

    register();

    return () => {
      clearSpeechEndTimer();
      listeners.forEach(listener => listener?.remove?.());
    };
  }, [teacher.lang, voiceSettings.voiceMode]);

  const requestMicrophonePermission = useCallback(async () => {
    setPermissionPrompted(true);
    if (Capacitor.isNativePlatform()) {
      const nativeRequest = await requestNativeMicrophonePermission();
      if (nativeRequest === "denied") {
        setVoicePermissionState("denied");
        setVoiceCapability(prev => ({
          ...prev,
          reason: "麦克风权限已被系统拒绝。请点“打开系统权限设置”手动开启，部分安卓系统在拒绝后不会再次弹窗。",
        }));
        setVoiceError("系统已拒绝麦克风权限，请点击“打开系统权限设置”并手动开启后再试");
        return false;
      }
      if (nativeRequest === "granted") {
        setVoicePermissionState("granted");
        return true;
      }
      if (isNativeVoicePlatform) {
        setVoicePermissionState(nativeRequest || "prompt");
        return nativeRequest === "granted";
      }
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError("当前设备不支持麦克风录音");
      setVoicePermissionState("unsupported");
      return false;
    }
    try {
      setVoiceError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      const refreshedState = await queryMicrophonePermission();
      setVoicePermissionState(refreshedState === "prompt" ? "granted" : refreshedState);
      setVoiceCapability(prev => ({
        ...prev,
        input: !!modelConfigs.siliconflow?.apiKey,
        reason: modelConfigs.siliconflow?.apiKey
          ? "麦克风权限已获取；安卓系统权限页通常只显示“麦克风”，不会单独显示扬声器权限。"
          : "麦克风权限已获取；如需语音识别，请先配置硅基流动 API Key。",
      }));
      return true;
    } catch (error) {
      const permissionState = /denied|permission|notallowed|security/i.test(String(error?.message || error?.name || "")) ? "denied" : "prompt";
      setVoicePermissionState(permissionState);
      setVoiceCapability(prev => ({
        ...prev,
        reason: permissionState === "denied"
          ? "麦克风权限已被系统拒绝。请点“打开系统权限设置”手动开启，部分安卓系统在拒绝后不会再次弹窗。"
          : prev.reason,
      }));
      setVoiceError(getPermissionErrorMessage(error));
      return false;
    }
  }, [modelConfigs.siliconflow?.apiKey]);

  const startRecording = async () => {
    if (!voiceSettings.enabled || voiceSettings.voiceMode === "text") return;
    if (!voiceCapability.input) {
      setVoiceError(voiceCapability.reason || "当前设备不支持语音输入");
      return;
    }
    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) return;

    if (isNativeVoicePlatform) {
      try {
        setVoiceError("");
        nativeSpeechResultHandlerRef.current = (transcript) => {
          setInput(transcript);
          if (voiceSettings.voiceMode === "push-to-talk") {
            setTimeout(() => handleSend(transcript), 0);
          }
        };
        await NativeVoice.startListening({ lang: teacher.lang || "zh-CN" });
        setIsRecording(true);
      } catch (error) {
        setVoiceError(error?.message || "启动原生语音识别失败");
        setIsRecording(false);
      }
      return;
    }

    if (!modelConfigs.siliconflow?.apiKey) {
      setVoiceError("请先在设置里配置硅基流动 API Key，再使用语音识别");
      return;
    }
    try {
      setVoiceError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      const supportedMimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : (MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "");
      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => event.data?.size && audioChunksRef.current.push(event.data);
      recorder.onerror = () => {
        setIsRecording(false);
        setVoiceError("录音失败，请检查麦克风权限");
      };
      recorder.onstop = async () => {
        setIsRecording(false);
        mediaStreamRef.current?.getTracks?.().forEach(track => track.stop());
        mediaStreamRef.current = null;
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType || "audio/webm" });
        audioChunksRef.current = [];
        if (!audioBlob.size) return;
        try {
          const transcript = await transcribeAudio(modelConfigs.siliconflow, audioBlob, teacher.lang === "en-US" ? "en" : "zh");
          if (!transcript) throw new Error("未识别到语音内容");
          setInput(transcript.trim());
          if (voiceSettings.voiceMode === "push-to-talk") {
            setTimeout(() => handleSend(transcript.trim()), 0);
          }
        } catch (error) {
          setVoiceError(error.message || "语音识别失败");
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setVoiceError(getPermissionErrorMessage(error));
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (isNativeVoicePlatform) {
      NativeVoice?.stopListening?.().catch(() => {});
      nativeSpeechResultHandlerRef.current = null;
      setIsRecording(false);
      return;
    }
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const speakText = useCallback(async (text) => {
    if (!voiceSettings.enabled || !text) return;
    try {
      setVoiceError("");
      if (isNativeVoicePlatform) {
        await NativeVoice.speak({
          text,
          lang: teacher.lang || "zh-CN",
          rate: voiceSettings.speed || 1.0,
        });
        return;
      }
      if (modelConfigs.siliconflow?.apiKey) {
        setIsSpeaking(true);
        const blob = await synthesizeSpeech(modelConfigs.siliconflow, text, teacher.lang || "zh-CN");
        const objectUrl = URL.createObjectURL(blob);
        audioPlayerRef.current?.pause();
        const audio = new Audio(objectUrl);
        audioPlayerRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(objectUrl);
          setIsSpeaking(false);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          setIsSpeaking(false);
          if (synthRef.current) {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = teacher.lang || "zh-CN";
            utter.rate = voiceSettings.speed || 1.0;
            synthRef.current.speak(utter);
            return;
          }
          setVoiceError("当前语音音色不可用，请改用默认音色或稍后重试");
        };
        await audio.play();
        return;
      }
      if (!synthRef.current) {
        setVoiceError("当前设备没有可用的系统朗读能力");
        return;
      }
      synthRef.current.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = teacher.lang || "zh-CN";
      utter.rate = voiceSettings.speed || 1.0;
      if (voiceSettings.voiceId) {
        const voices = synthRef.current.getVoices();
        const match = voices.find(v => v.voiceURI === voiceSettings.voiceId || v.name === voiceSettings.voiceId);
        if (match) utter.voice = match;
      }
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => {
        setIsSpeaking(false);
        setVoiceError("系统朗读失败");
      };
      synthRef.current.speak(utter);
    } catch (error) {
      setIsSpeaking(false);
      setVoiceError(error.message || "语音播报失败");
    }
  }, [voiceSettings, teacher.lang, modelConfigs.siliconflow]);

  const stopSpeaking = () => {
    if (isNativeVoicePlatform) {
      NativeVoice?.stopSpeak?.().catch(() => {});
    }
    synthRef.current?.cancel();
    audioPlayerRef.current?.pause();
    if (audioPlayerRef.current) audioPlayerRef.current.currentTime = 0;
    setIsSpeaking(false);
  };

  const parseResponse = (text) => {
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) throw new Error();
      const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      return {
        message: typeof parsed?.message === "string" && parsed.message.trim() ? parsed.message : text,
        masteryDelta: Number.isFinite(parsed?.masteryDelta) ? parsed.masteryDelta : 0,
        currentMastery: Number.isFinite(parsed?.currentMastery) ? parsed.currentMastery : mastery,
        mode: typeof parsed?.mode === "string" ? parsed.mode : "explain",
        suggestedResponses: normalizeSuggestedResponses(parsed?.suggestedResponses),
        insight: typeof parsed?.insight === "string" ? parsed.insight : "",
      };
    } catch {
      return { message: text, masteryDelta: 0, currentMastery: mastery, mode: "explain", suggestedResponses: [], insight: "" };
    }
  };

  const callTutor = useCallback(async (userMsg, history) => {
    setLoading(true);
    try {
      const config = normalizeProviderConfig(modelConfigs, activeProvider);
      if (!config.apiKey || !config.model) {
        setMessages(prev => [...prev, { role: "assistant", content: "请先在设置中配置 API Key 和选择模型", mode: "explain", insight: "", suggestedResponses: ["打开设置", "配置模型"] }]);
        setLoading(false);
        return;
      }
      const msgs = [...history, { role: "user", content: userMsg }];
      const raw = await callModelAPI(activeProvider, config, msgs, systemRef.current);
      const parsed = parseResponse(raw);
      const newMastery = Math.max(0, Math.min(100, parsed.currentMastery ?? (mastery + (parsed.masteryDelta ?? 0))));
      const newHistory = [...msgs, { role: "assistant", content: raw }];
      setApiHistory(newHistory);
      const aiMsg = buildSafeAssistantMessage(parsed);
      setMessages(prev => [...prev, aiMsg]);
      setMastery(newMastery);
      setSessionStats(prev => ({ ...prev, turns: prev.turns + 1 }));
      if (voiceSettings.autoSpeak && parsed.message) speakText(parsed.message.slice(0, 300));
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: `出错了: ${error.message}`, mode: "explain", insight: "", suggestedResponses: ["重试", "检查API配置"] }]);
    } finally {
      setLoading(false);
    }
  }, [modelConfigs, activeProvider, mastery, voiceSettings.autoSpeak, speakText]);

  useEffect(() => {
    nativeSpeechResultHandlerRef.current = null;
  }, [teacher.lang, subject]);

  const handleAddUser = (username, avatar) => {
    const newUser = { id: generateId(), username, avatar, createdAt: new Date().toISOString(), settings: { theme: themeId } };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    setCurrentUser(newUser);
    saveCurrentUserId(newUser.id);
  };

  const handleSwitchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      saveCurrentUserId(userId);
      setPhase("onboard");
      setSubject("");
      setMessages([]);
      setApiHistory([]);
      setMastery(0);
    }
  };

  const handleDeleteUser = (userId) => {
    if (users.length <= 1) return;
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveUsers(updated);
    if (currentUser?.id === userId) {
      setCurrentUser(updated[0]);
      saveCurrentUserId(updated[0].id);
    }
  };

  const handleStart = async () => {
    if (!subject.trim()) return;
    const t = getTeacher(subject);
    setTeacher(t);
    systemRef.current = buildTutorSystemPrompt(subject.trim(), level, goal.trim());
    setPhase("chat");
    setMastery(0);
    setMessages([]);
    setApiHistory([]);
    setSessionStats({ turns: 0, startTime: Date.now() });
    await callTutor(`你好，我想学「${subject.trim()}」，请开始吧。`, []);
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    if (isRecording) stopRecording();
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    await callTutor(msg, apiHistory);
  };

  const handleResumeProgress = () => {
    if (!recoveryProgress) return;
    setSubject(recoveryProgress.subject);
    setLevel(recoveryProgress.level || "初学者");
    setGoal(recoveryProgress.goal || "");
    setMastery(recoveryProgress.mastery || 0);
    setMessages(recoveryProgress.messages || []);
    setApiHistory(recoveryProgress.apiHistory || []);
    setSessionStats(recoveryProgress.sessionStats || { turns: 0, startTime: Date.now() });
    const t = getTeacher(recoveryProgress.subject);
    setTeacher(t);
    systemRef.current = buildTutorSystemPrompt(recoveryProgress.subject, recoveryProgress.level || "初学者", recoveryProgress.goal || "");
    setPhase("chat");
    setRecoveryProgress(null);
  };

  const handleNewSession = () => {
    setRecoveryProgress(null);
    setSubject("");
    setMessages([]);
    setApiHistory([]);
    setMastery(0);
  };

  const handleUpdateVoiceSettings = (updates) => {
    const newSettings = { ...voiceSettings, ...updates };
    setVoiceSettings(newSettings);
    saveGlobalSettings({ ...loadGlobalSettings(), voiceSettings: newSettings, themeId, permissionPrompted });
  };

  const handleOpenSystemPermissionSettings = async () => {
    const opened = await openNativeAppSettings();
    if (!opened) {
      setVoiceError("当前环境无法直接打开系统权限设置，请手动前往系统设置开启麦克风权限");
    }
  };

  const handleChangeTheme = (newThemeId) => {
    setThemeId(newThemeId);
    saveGlobalSettings({ ...loadGlobalSettings(), themeId: newThemeId, voiceSettings, permissionPrompted });
  };

  const MODE_INFO = {
    explore: { label: "🔍 探索提问", color: "#60a5fa" },
    explain: { label: "📖 知识讲解", color: T.accent },
    test: { label: "✏️ 知识测验", color: "#a78bfa" },
    praise: { label: "🌟 答得好", color: "#4ade80" },
    redirect: { label: "🔄 再想一想", color: "#f87171" },
    milestone: { label: "🏆 里程碑", color: "#fbbf24" },
  };
  const LEVELS = ["零基础", "初学者", "有些了解", "中级", "高级"];
  const PRESETS = ["Python编程", "英语口语", "高中数学", "经济学", "机器学习", "历史"];

  if (phase === "welcome") return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Georgia','Times New Roman',serif", overflowY: "auto" }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} } * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontSize: 64 }}>🎓</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}><span style={{ background: `linear-gradient(135deg, ${T.text}, ${T.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI 一对一私教</span></div>
          <div style={{ fontSize: 15, color: T.textDim, lineHeight: 1.6 }}>欢迎使用 AI 私教系统<br />打造你的专属学习伙伴</div>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          <button onClick={() => { const username = "学生" + Math.floor(Math.random() * 1000); handleAddUser(username, "🧑‍🎓"); setPhase("onboard"); }} style={{ width: "100%", background: `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`, border: "none", borderRadius: 12, padding: "14px", color: T.userText, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>快速开始（创建默认用户）</button>
          <button onClick={() => setShowUserCenter(true)} style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px", color: T.text, fontSize: 15, cursor: "pointer" }}>创建自定义用户</button>
        </div>
      </div>
      {showUserCenter && <UserCenterPanel T={T} currentUser={null} users={[]} onClose={() => setShowUserCenter(false)} onSwitchUser={handleSwitchUser} onAddUser={(name, av) => { handleAddUser(name, av); setShowUserCenter(false); setPhase("onboard"); }} onDeleteUser={handleDeleteUser} />}
    </div>
  );

  if (phase === "onboard") return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Georgia','Times New Roman',serif", overflowY: "auto", position: "relative" }}>
      <style>{`@keyframes dotBounce { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} } @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} } @keyframes spin { to{transform:rotate(360deg)} } * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; } input, button { outline: none; }`}</style>
      {recoveryProgress && <RecoveryDialog T={T} progress={recoveryProgress} onResume={handleResumeProgress} onNewSession={handleNewSession} />}
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${T.orb1} 0%, transparent 70%)`, left: -150, top: -150, pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${T.orb2} 0%, transparent 70%)`, right: -100, bottom: 0, pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${T.border}`, background: T.headerBg, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.accent, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🕯</span> 私塾 · AI家教
          {currentUser && <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 400, marginLeft: 8 }}>· {currentUser.avatar} {currentUser.username}</span>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowUserCenter(true)} style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 10px", color: T.text, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}><Users size={14} /> {currentUser?.avatar || "👤"}</button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowThemes(p => !p)} style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 10px", color: T.accent, cursor: "pointer", fontSize: 14 }}>{THEMES[themeId].icon}</button>
            {showThemes && <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 8, display: "flex", flexDirection: "column", gap: 4, zIndex: 200, minWidth: 130 }}>{Object.values(THEMES).map(th => <button key={th.id} onClick={() => { handleChangeTheme(th.id); setShowThemes(false); }} style={{ background: themeId === th.id ? T.accentGlow : "transparent", border: "none", borderRadius: 8, padding: "6px 10px", color: themeId === th.id ? T.accent : T.textDim, cursor: "pointer", fontSize: 13, textAlign: "left", display: "flex", gap: 8, alignItems: "center", fontFamily: "inherit" }}>{th.icon} {th.name}</button>)}</div>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px", display: "flex", flexDirection: "column", gap: 32, animation: "fadeUp 0.5s ease" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}><span style={{ background: `linear-gradient(135deg, ${T.text}, ${T.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>你的专属 AI 家教<br />已就位</span></div>
          <div style={{ fontSize: 15, color: T.textDim, lineHeight: 1.75 }}>不是搜索引擎，不是空白输入框<br />而是一位懂你的导师，从漏洞到掌握，超越98%的同龄人</div>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 28, display: "flex", flexDirection: "column", gap: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          <div>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 8 }}>我想学什么</div>
            <input value={subject} onChange={e => setSubject(e.target.value)} onKeyDown={e => e.key === "Enter" && handleStart()} placeholder="Python编程 / 英语口语 / 高中数学 / 自定义…" style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 14.5, fontFamily: "inherit" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>{PRESETS.map(s => <button key={s} onClick={() => setSubject(s)} style={{ background: subject === s ? T.accentGlow : "transparent", border: `1px solid ${subject === s ? T.accent : T.border}`, borderRadius: 14, padding: "4px 10px", color: subject === s ? T.accent : T.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>)}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 8 }}>当前水平</div>
            <div style={{ display: "flex", gap: 6 }}>{LEVELS.map(l => <button key={l} onClick={() => setLevel(l)} style={{ flex: 1, background: level === l ? T.accentGlow : T.surface, border: `1px solid ${level === l ? T.accent : T.border}`, borderRadius: 8, padding: "7px 0", color: level === l ? T.accent : T.textDim, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: level === l ? 600 : 400 }}>{l}</button>)}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 8 }}>学习目标（选填）</div>
            <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="例如：通过期末考试 / 能独立写代码 / 日常对话…" style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 14, fontFamily: "inherit" }} />
          </div>

          {subject && (() => { const t = getTeacher(subject); return <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.accentGlow, border: `1px solid ${T.accent}33`, borderRadius: 12, padding: "12px 16px" }}><div style={{ width: 42, height: 42, borderRadius: "50%", background: T.accentGlow, border: `1px solid ${T.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: T.accent, fontWeight: 700, flexShrink: 0 }}>{t.avatar}</div><div><div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{t.name} <span style={{ fontSize: 12, color: T.textDim }}>· {t.title}</span></div><div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>将担任你的专属导师 {t.lang === "en-US" ? "🎙️ 支持英语语音" : "🎙️ 支持中文语音"}</div></div></div>; })()}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{MODEL_PROVIDERS[activeProvider]?.icon || "🔧"}</span>
              <div>
                <div style={{ fontSize: 12, color: T.text }}>当前模型: {MODEL_PROVIDERS[activeProvider]?.name || "未配置"}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{modelConfigs[activeProvider]?.model ? MODEL_PROVIDERS[activeProvider]?.models.find(m => m.id === modelConfigs[activeProvider].model)?.name || modelConfigs[activeProvider].model : "未选择模型"}</div>
              </div>
            </div>
            <button onClick={() => setShowModelConfig(true)} style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", color: T.accent, fontSize: 12, cursor: "pointer" }}><Settings size={12} style={{ marginRight: 4 }} />配置</button>
          </div>

          <button onClick={handleStart} disabled={!subject.trim()} style={{ background: subject.trim() ? `linear-gradient(135deg, ${T.accent}, ${T.accentDim})` : T.border, border: "none", borderRadius: 12, padding: "14px", color: subject.trim() ? T.userText : T.textMuted, fontSize: 15, fontWeight: 700, cursor: subject.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>开始一对一学习 →</button>
        </div>
      </div>

      {showModelConfig && <ModelConfigPanel T={T} configs={modelConfigs} setConfigs={setModelConfigs} activeProvider={activeProvider} setActiveProvider={setActiveProvider} onClose={() => setShowModelConfig(false)} />}
      {showUserCenter && <UserCenterPanel T={T} currentUser={currentUser} users={users} onClose={() => setShowUserCenter(false)} onSwitchUser={handleSwitchUser} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />}
    </div>
  );

  const [ml] = masteryLabel(mastery);
  const elapsed = sessionStats.startTime ? Math.round((Date.now() - sessionStats.startTime) / 60000) : 0;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: T.bg, color: T.text, fontFamily: "'Georgia','Times New Roman',serif", overflow: "hidden", position: "relative" }}>
      <style>{`@keyframes dotBounce { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} } @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} } @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} } @keyframes recordPulse { 0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,0.4)} 50%{box-shadow:0 0 0 8px rgba(248,113,113,0)} } * { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; } textarea:focus { border-color: ${T.accent} !important; outline: none; } .qbtn:hover { background: ${T.accentGlow} !important; border-color: ${T.accent} !important; } .iconbtn:hover { opacity: 0.8; }`}</style>
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${T.orb1} 0%, transparent 70%)`, left: -150, top: -100, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${T.border}`, background: T.headerBg, backdropFilter: "blur(12px)", flexShrink: 0, position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="iconbtn" onClick={() => setPhase("onboard")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 20, padding: "2px 4px", lineHeight: 1 }}>←</button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.accentGlow, border: `1px solid ${T.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: T.accent, fontWeight: 700 }}>{teacher.avatar}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{teacher.name} <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 400 }}>· {teacher.title}</span></div>
            <div style={{ fontSize: 11, color: T.textMuted, display: "flex", gap: 8 }}><span style={{ color: T.accent }}>{subject}</span><span>·</span><span>{level}</span><span>·</span><span>第{sessionStats.turns}轮</span>{elapsed > 0 && <><span>·</span><span>{elapsed}分钟</span></>}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setShowUserCenter(true)} style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 8px", color: T.text, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><Users size={12} /> {currentUser?.avatar || "👤"}</button>
          <button onClick={() => setShowVoiceSettings(true)} style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 8px", color: T.accent, cursor: "pointer", fontSize: 14 }}>🔊</button>
          <button onClick={() => setShowModelConfig(true)} style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 8px", color: T.accent, cursor: "pointer", fontSize: 14 }}>{MODEL_PROVIDERS[activeProvider]?.icon || "⚙️"}</button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowThemes(p => !p)} style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 10px", color: T.accent, cursor: "pointer", fontSize: 14 }}>{THEMES[themeId].icon}</button>
            {showThemes && <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 8, display: "flex", flexDirection: "column", gap: 4, zIndex: 200, minWidth: 130 }}>{Object.values(THEMES).map(th => <button key={th.id} onClick={() => { handleChangeTheme(th.id); setShowThemes(false); }} style={{ background: themeId === th.id ? T.accentGlow : "transparent", border: "none", borderRadius: 8, padding: "6px 10px", color: themeId === th.id ? T.accent : T.textDim, cursor: "pointer", fontSize: 13, textAlign: "left", display: "flex", gap: 8, alignItems: "center", fontFamily: "inherit" }}>{th.icon} {th.name}</button>)}</div>}
          </div>
          <MasteryRing value={mastery} />
        </div>
      </div>

      <div style={{ height: 3, background: T.border, flexShrink: 0, position: "relative", zIndex: 9 }}><div style={{ height: "100%", width: `${mastery}%`, background: `linear-gradient(90deg, ${masteryColor(mastery)}, ${masteryColor(Math.min(mastery+20,100))})`, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: `0 0 6px ${masteryColor(mastery)}` }} /></div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 780, width: "100%", margin: "0 auto", alignSelf: "stretch", position: "relative", zIndex: 1 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start", animation: "fadeUp 0.25s ease" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: msg.role === "user" ? `linear-gradient(135deg, ${T.accent}, ${T.accentDim})` : T.accentGlow, border: msg.role === "user" ? "none" : `1px solid ${T.border}`, color: msg.role === "user" ? T.userText : T.accent }}>{msg.role === "user" ? "你" : teacher.avatar}</div>
            <div style={{ maxWidth: "76%" }}>
              {msg.role === "assistant" && msg.mode && MODE_INFO[msg.mode] && <div style={{ fontSize: 11, fontFamily: "monospace", padding: "2px 8px", borderRadius: 10, background: `${MODE_INFO[msg.mode].color}18`, color: MODE_INFO[msg.mode].color, display: "inline-block", marginBottom: 6, fontWeight: 600, letterSpacing: "0.04em" }}>{MODE_INFO[msg.mode].label}</div>}
              <div style={{ background: msg.role === "user" ? T.userBubble : T.card, border: msg.role === "user" ? "none" : `1px solid ${T.border}`, borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px", padding: "11px 15px", color: msg.role === "user" ? T.userText : T.text, fontSize: 14.5, lineHeight: 1.65, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                <PronunciationText text={msg.content} lang={msg.role === "assistant" ? teacher.lang : "zh-CN"} voiceEnabled={voiceSettings.enabled} voiceSettings={voiceSettings} />
              </div>
              {msg.role === "assistant" && <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>{msg.insight && <div style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic", fontFamily: "monospace" }}>💭 {msg.insight}</div>}<button onClick={() => speakText(msg.content)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 13, padding: "0 4px" }} title="朗读">🔊</button></div>}
              {msg.role === "assistant" && msg.suggestedResponses?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>{msg.suggestedResponses.map((r, j) => <button key={j} onClick={() => handleSend(r)} style={{ background: T.surface, border: `1px solid ${T.accent}33`, borderRadius: 18, padding: "5px 12px", color: T.accent, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{r}</button>)}</div>}
            </div>
          </div>
        ))}
        {loading && <TypingDots T={T} teacher={teacher} />}
        <div ref={chatEndRef} />
      </div>

      {mastery >= 80 && messages.length > 0 && !loading && <div style={{ margin: "0 16px 4px", maxWidth: 780, alignSelf: "center", width: "calc(100% - 32px)", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.35)", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#4ade80", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>✨ 掌握率已达 <strong>{mastery}%</strong>！这个知识点你已经真正掌握了，可以继续深入。</div>}

      <div style={{ padding: "10px 16px 16px", borderTop: `1px solid ${T.border}`, maxWidth: 780, width: "100%", margin: "0 auto", flexShrink: 0, position: "relative", zIndex: 10 }}>
        {isSpeaking && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12, color: T.accent }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, animation: "pulse 1s infinite" }} />{teacher.name}正在朗读… <button onClick={stopSpeaking} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>停止</button></div>}
        {voiceError && <div style={{ marginBottom: 8, fontSize: 12, color: "#f87171" }}>{voiceError}</div>}
        {voiceSettings.enabled && voicePermissionState !== "granted" && (
          <div style={{ marginBottom: 8, fontSize: 12, color: T.textMuted }}>
            麦克风尚未授权。首次安装后请先点击左侧麦克风触发系统申请；若系统已拒绝且权限页仍显示“未请求任何权限”，请卸载旧版本后安装最新 APK 再试。
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          {voiceSettings.enabled && voiceSettings.voiceMode !== "text" && <button onClick={isRecording ? stopRecording : startRecording} disabled={loading} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: isRecording ? "#f87171" : T.surface, borderColor: isRecording ? "#f87171" : T.border, borderStyle: "solid", borderWidth: 1, color: isRecording ? "#fff" : T.textMuted, cursor: loading ? "not-allowed" : "pointer", fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", animation: isRecording ? "recordPulse 1.5s infinite" : "none" }} title={isRecording ? "停止录音" : "语音输入"}>{isRecording ? "⏹" : "🎙"}</button>}
          <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} disabled={loading} placeholder={isRecording ? `正在录音（${teacher.lang === "en-US" ? "请说英语" : "请说话"}）…` : "输入你的回答或问题… (Enter发送，Shift+Enter换行)"} rows={1} style={{ flex: 1, background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 14, lineHeight: 1.5, resize: "none", fontFamily: "inherit", minHeight: 46, maxHeight: 120, boxShadow: "none" }} />
          <button onClick={() => handleSend()} disabled={loading || !input.trim()} style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: (loading || !input.trim()) ? T.border : `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`, color: (loading || !input.trim()) ? T.textMuted : T.userText, cursor: (loading || !input.trim()) ? "not-allowed" : "pointer", fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{loading ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 16 }}>⟳</span> : "↑"}</button>
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6, textAlign: "center" }}>{mastery < 80 ? `💡 勇敢说出你的想法——答错了也没关系，错误是最好的老师 · 掌握率 ${mastery}%` : `🏆 你已掌握这个知识点！告诉${teacher.name}你想学什么新内容吧`}</div>
      </div>

      {showModelConfig && <ModelConfigPanel T={T} configs={modelConfigs} setConfigs={setModelConfigs} activeProvider={activeProvider} setActiveProvider={setActiveProvider} onClose={() => setShowModelConfig(false)} />}
      {showUserCenter && <UserCenterPanel T={T} currentUser={currentUser} users={users} onClose={() => setShowUserCenter(false)} onSwitchUser={handleSwitchUser} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />}
      {showVoiceSettings && <VoiceSettingsPanel T={T} voiceSettings={voiceSettings} onUpdate={handleUpdateVoiceSettings} onClose={() => setShowVoiceSettings(false)} voiceCapability={voiceCapability} activeProvider={activeProvider} voicePermissionState={voicePermissionState} onRequestMicrophonePermission={requestMicrophonePermission} onOpenSystemPermissionSettings={handleOpenSystemPermissionSettings} permissionPrompted={permissionPrompted} />}
    </div>
  );
}
