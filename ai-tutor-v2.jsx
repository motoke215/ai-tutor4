import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sun, Moon, Settings, ChevronLeft, Send, User, Users, Plus, Trash2, Edit3, Check, X, ChevronDown, ChevronUp, Play, Pause, SkipBack, Globe, Zap } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// THEME SYSTEM — 4 visual styles
// ═══════════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL PROVIDERS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const MODEL_PROVIDERS = {
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔵',
    defaultUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat (V3)' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (R1)' },
    ],
    color: '#0066cc',
  },
  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    icon: '🟠',
    defaultUrl: 'https://api.minimax.chat/v1',
    models: [
      { id: 'MiniMax-Text-01', name: 'MiniMax Text 01' },
      { id: 'abab6.5s-chat', name: 'ABAB 6.5S Chat' },
      { id: 'abab6-chat', name: 'ABAB 6 Chat' },
    ],
    color: '#ff6b00',
  },
  siliconflow: {
    id: 'siliconflow',
    name: '硅基流动',
    icon: '💧',
    defaultUrl: 'https://api.siliconflow.cn/v1',
    models: [
      { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B' },
      { id: 'Qwen/Qwen2.5-14B-Instruct', name: 'Qwen 2.5 14B' },
      { id: 'deepseek-ai/DeepSeek-V2.5', name: 'DeepSeek V2.5' },
      { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4 9B' },
      { id: 'internlm/internlm2_5-7b-chat', name: 'InternLM 2.5 7B' },
    ],
    color: '#00d4aa',
  },
  dashscope: {
    id: 'dashscope',
    name: '阿里通义',
    icon: '🔶',
    defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-turbo', name: 'Qwen Turbo (快速)' },
      { id: 'qwen-plus', name: 'Qwen Plus (增强)' },
      { id: 'qwen-max', name: 'Qwen Max (最强)' },
      { id: 'qwen-max-long', name: 'Qwen Max Long (长文本)' },
    ],
    color: '#ff6a00',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    icon: '⚫',
    defaultUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
    color: '#10a37f',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🟤',
    defaultUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
      { id: 'claude-haiku-4-20250514', name: 'Claude Haiku 4' },
    ],
    color: '#d4a574',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER PERSONAS
// ═══════════════════════════════════════════════════════════════════════════════
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

function getTeacher(subject) {
  if (!subject) return DEFAULT_TEACHER;
  const lower = subject.toLowerCase();
  return TEACHERS.find(t => t.keys.some(k => lower.includes(k))) || DEFAULT_TEACHER;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTERY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
function buildSystem(subject, level, goal, teacher) {
  return `${teacher.style}

你正在辅导学生学习「${subject}」，学生水平：${level}，目标：${goal || "全面掌握"}。

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

// ═══════════════════════════════════════════════════════════════════════════════
// MASTERY RING
// ═══════════════════════════════════════════════════════════════════════════════
function MasteryRing({ value, accent }) {
  const r = 26, c = 32, stroke = 5;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const col = masteryColor(value);
  return (
    <svg width={64} height={64}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(128,128,128,0.2)" strokeWidth={stroke} />
      <circle
        cx={c} cy={c} r={r} fill="none"
        stroke={col} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 5px ${col})` }}
      />
      <text x={c} y={c + 5} textAnchor="middle" fill={col} fontSize={12} fontWeight={700} fontFamily="monospace">{value}%</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPING DOTS
// ═══════════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const STORAGE_KEYS = {
  USERS: 'tutor_users',
  CURRENT_USER: 'tutor_current_user',
  MODEL_CONFIGS: 'tutor_model_configs',
  ACTIVE_PROVIDER: 'tutor_active_provider',
  GLOBAL_SETTINGS: 'tutor_global_settings',
  PROGRESS_PREFIX: 'tutor_progress_',
};

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function loadUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function loadCurrentUserId() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || null;
}

function saveCurrentUserId(userId) {
  if (userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

function loadModelConfigs() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIGS);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function saveModelConfigs(configs) {
  localStorage.setItem(STORAGE_KEYS.MODEL_CONFIGS, JSON.stringify(configs));
}

function loadActiveProvider() {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROVIDER) || 'deepseek';
}

function saveActiveProvider(provider) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROVIDER, provider);
}

function loadGlobalSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GLOBAL_SETTINGS);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function saveGlobalSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.GLOBAL_SETTINGS, JSON.stringify(settings));
}

function loadProgress(userId, subject) {
  if (!userId) return null;
  try {
    const key = STORAGE_KEYS.PROGRESS_PREFIX + userId + '_' + subject;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveProgress(userId, subject, progress) {
  if (!userId) return;
  const key = STORAGE_KEYS.PROGRESS_PREFIX + userId + '_' + subject;
  localStorage.setItem(key, JSON.stringify({ ...progress, lastUpdated: new Date().toISOString() }));
}

function loadUserProgressList(userId) {
  if (!userId) return [];
  const results = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEYS.PROGRESS_PREFIX + userId + '_')) {
      const subject = key.replace(STORAGE_KEYS.PROGRESS_PREFIX + userId + '_', '');
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data) results.push({ subject, ...data });
      } catch {}
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API CALL ADAPTERS
// ═══════════════════════════════════════════════════════════════════════════════
async function callModelAPI(provider, config, messages, system) {
  const { apiKey, url, model } = config;

  if (!apiKey) {
    throw new Error('请先配置 API Key');
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  let body = {};
  let endpoint = url.endsWith('/') ? url : url + '/';

  switch (provider) {
    case 'deepseek':
      headers['Authorization'] = `Bearer ${apiKey}`;
      endpoint += 'chat/completions';
      body = {
        model: model,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };
      break;

    case 'minimax':
      headers['Authorization'] = `Bearer ${apiKey}`;
      endpoint += 'text/chatcompletion_v2';
      body = {
        model: model,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };
      break;

    case 'siliconflow':
      headers['Authorization'] = `Bearer ${apiKey}`;
      endpoint += 'chat/completions';
      body = {
        model: model,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };
      break;

    case 'dashscope':
      headers['Authorization'] = `Bearer ${apiKey}`;
      endpoint += 'chat/completions';
      body = {
        model: model,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };
      break;

    case 'openai':
      headers['Authorization'] = `Bearer ${apiKey}`;
      endpoint += 'chat/completions';
      body = {
        model: model,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };
      break;

    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      endpoint = url.replace('/v1', '') + '/messages';
      body = {
        model: model,
        max_tokens: 1000,
        system: system,
        messages: messages,
      };
      break;

    default:
      throw new Error(`不支持的模型提供商: ${provider}`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
  }

  const data = await response.json();

  // Parse response based on provider
  if (provider === 'anthropic') {
    return data.content?.[0]?.text || '';
  } else {
    return data.choices?.[0]?.message?.content || '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL CONFIG PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function ModelConfigPanel({ T, onClose }) {
  const [configs, setConfigs] = useState(loadModelConfigs);
  const [activeProvider, setActiveProvider] = useState(loadActiveProvider);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  const handleSave = () => {
    saveModelConfigs(configs);
    saveActiveProvider(activeProvider);
    onClose();
  };

  const handleTest = async (providerId) => {
    const config = configs[providerId];
    if (!config?.apiKey) {
      setTestResult({ provider: providerId, success: false, message: '请先输入 API Key' });
      return;
    }
    setTestingProvider(providerId);
    setTestResult(null);
    try {
      await callModelAPI(providerId, config, [{ role: 'user', content: 'Hi' }], 'You are a helpful assistant.');
      setTestResult({ provider: providerId, success: true, message: '连接成功！' });
    } catch (e) {
      setTestResult({ provider: providerId, success: false, message: e.message });
    }
    setTestingProvider(null);
  };

  const updateConfig = (providerId, field, value) => {
    setConfigs(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [field]: value,
        ...(field === 'provider' ? {} : {}),
      },
    }));
  };

  const togglePasswordVisibility = (providerId) => {
    setShowPassword(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} color={T.accent} /> 模型配置
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {/* Active Provider Selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace', marginBottom: 8 }}>
              当前使用
            </div>
            <select
              value={activeProvider}
              onChange={e => setActiveProvider(e.target.value)}
              style={{
                width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
                padding: '10px 14px', color: T.text, fontSize: 14, fontFamily: 'inherit',
              }}
            >
              {Object.values(MODEL_PROVIDERS).map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
              ))}
            </select>
          </div>

          {/* Provider Configs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.values(MODEL_PROVIDERS).map(provider => {
              const config = configs[provider.id] || {};
              const isActive = activeProvider === provider.id;
              const isTesting = testingProvider === provider.id;
              const result = testResult?.provider === provider.id ? testResult : null;

              return (
                <div key={provider.id} style={{
                  background: isActive ? T.accentGlow : T.surface,
                  border: `1px solid ${isActive ? provider.color : T.border}`,
                  borderRadius: 12, padding: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>{provider.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{provider.name}</span>
                    {isActive && <span style={{ fontSize: 10, background: provider.color, color: '#fff', padding: '2px 6px', borderRadius: 8 }}>使用中</span>}
                  </div>

                  {/* API Key */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>API Key</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type={showPassword[provider.id] ? 'text' : 'password'}
                        value={config.apiKey || ''}
                        onChange={e => updateConfig(provider.id, 'apiKey', e.target.value)}
                        placeholder="输入 API Key"
                        style={{
                          flex: 1, background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8,
                          padding: '8px 10px', color: T.text, fontSize: 13, fontFamily: 'inherit',
                        }}
                      />
                      <button
                        onClick={() => togglePasswordVisibility(provider.id)}
                        style={{
                          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
                          padding: '6px 10px', color: T.textMuted, cursor: 'pointer',
                        }}
                      >
                        {showPassword[provider.id] ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  {/* URL */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>API URL</div>
                    <input
                      type="text"
                      value={config.url || provider.defaultUrl}
                      onChange={e => updateConfig(provider.id, 'url', e.target.value)}
                      placeholder={provider.defaultUrl}
                      style={{
                        width: '100%', background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8,
                        padding: '8px 10px', color: T.text, fontSize: 13, fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  {/* Model */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>模型</div>
                    <select
                      value={config.model || ''}
                      onChange={e => updateConfig(provider.id, 'model', e.target.value)}
                      style={{
                        width: '100%', background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8,
                        padding: '8px 10px', color: T.text, fontSize: 13, fontFamily: 'inherit',
                      }}
                    >
                      <option value="">选择模型...</option>
                      {provider.models.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Test Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => handleTest(provider.id)}
                      disabled={isTesting}
                      style={{
                        background: isTesting ? T.border : provider.color,
                        border: 'none', borderRadius: 8, padding: '6px 14px',
                        color: '#fff', fontSize: 12, cursor: isTesting ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {isTesting ? '测试中...' : '测试连接'}
                    </button>
                    {result && (
                      <span style={{
                        fontSize: 12, color: result.success ? '#4ade80' : '#f87171',
                      }}>
                        {result.success ? '✓ ' : '✗ '}{result.message}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 20px',
          borderTop: `1px solid ${T.border}`,
        }}>
          <button
            onClick={onClose}
            style={{
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
              padding: '8px 16px', color: T.text, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`,
              border: 'none', borderRadius: 8, padding: '8px 20px',
              color: T.userText, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER CENTER PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function UserCenterPanel({ T, currentUser, users, onClose, onSwitchUser, onAddUser, onDeleteUser }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🧑‍🎓');

  const avatars = ['🧑‍🎓', '👨‍💻', '👩‍🏫', '🧙', '🦸', '👽', '🤖', '🎅', '🧛', '🧜', '👸', '🤴'];

  const handleAddUser = () => {
    if (!newUsername.trim()) return;
    onAddUser(newUsername.trim(), selectedAvatar);
    setNewUsername('');
    setSelectedAvatar('🧑‍🎓');
    setShowAddForm(false);
  };

  const userProgressList = (userId) => loadUserProgressList(userId);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
        width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color={T.accent} /> 用户中心
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {/* User List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {users.map(user => {
              const progressList = userProgressList(user.id);
              const isCurrentUser = currentUser?.id === user.id;

              return (
                <div key={user.id} style={{
                  background: isCurrentUser ? T.accentGlow : T.surface,
                  border: `1px solid ${isCurrentUser ? T.accent : T.border}`,
                  borderRadius: 12, padding: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 28 }}>{user.avatar}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                          {user.username}
                          {isCurrentUser && <span style={{ fontSize: 11, color: T.accent, marginLeft: 6 }}>当前用户</span>}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                          {progressList.length > 0
                            ? progressList.map(p => `${p.subject} ${p.mastery || 0}%`).join(' | ')
                            : '暂无学习记录'
                          }
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!isCurrentUser && (
                        <button
                          onClick={() => { onSwitchUser(user.id); onClose(); }}
                          style={{
                            background: T.accent, border: 'none', borderRadius: 6,
                            padding: '4px 10px', color: T.userText, fontSize: 11, cursor: 'pointer',
                          }}
                        >
                          切换
                        </button>
                      )}
                      {users.length > 1 && (
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          style={{
                            background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6,
                            padding: '4px 8px', color: T.textMuted, fontSize: 11, cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add User Form */}
          {showAddForm ? (
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12 }}>添加新用户</div>
              <div style={{ marginBottom: 12 }}>
                <input
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="输入用户名"
                  style={{
                    width: '100%', background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 8,
                    padding: '10px 12px', color: T.text, fontSize: 14, fontFamily: 'inherit',
                  }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>选择头像</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {avatars.map(av => (
                    <button
                      key={av}
                      onClick={() => setSelectedAvatar(av)}
                      style={{
                        fontSize: 20, background: selectedAvatar === av ? T.accentGlow : 'transparent',
                        border: `1px solid ${selectedAvatar === av ? T.accent : T.border}`,
                        borderRadius: 8, padding: '4px 8px', cursor: 'pointer',
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleAddUser}
                  disabled={!newUsername.trim()}
                  style={{
                    flex: 1, background: newUsername.trim() ? T.accent : T.border,
                    border: 'none', borderRadius: 8, padding: '8px',
                    color: T.userText, fontSize: 13, cursor: newUsername.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  确定添加
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  style={{
                    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
                    padding: '8px 12px', color: T.text, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                width: '100%', background: 'transparent', border: `1px dashed ${T.border}`,
                borderRadius: 12, padding: '12px', color: T.textMuted, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Plus size={16} /> 添加新用户
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function VoiceSettingsPanel({ T, voiceSettings, onUpdate, onClose }) {
  const [voices, setVoices] = useState([]);
  const [showVoices, setShowVoices] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const voiceModes = [
    { id: 'realtime', label: '实时对话', desc: '全程语音交互' },
    { id: 'push-to-talk', label: '按键说话', desc: '按住录音，松开发送' },
    { id: 'text', label: '文字输入', desc: '纯文字模式' },
  ];

  const speedOptions = [
    { value: 0.6, label: '0.6x (很慢)' },
    { value: 0.8, label: '0.8x (慢速)' },
    { value: 1.0, label: '1.0x (正常)' },
    { value: 1.2, label: '1.2x (快速)' },
    { value: 1.5, label: '1.5x (很快)' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
        width: '100%', maxWidth: 420, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔊 语音设置
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Enable Voice */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>启用语音</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>开启后支持语音交互</div>
            </div>
            <button
              onClick={() => onUpdate({ enabled: !voiceSettings.enabled })}
              style={{
                width: 48, height: 26, borderRadius: 13, border: 'none',
                background: voiceSettings.enabled ? T.accent : T.border,
                position: 'relative', cursor: 'pointer',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: voiceSettings.enabled ? 24 : 2,
                transition: 'left 0.2s',
              }} />
            </button>
          </div>

          {/* Auto Speak */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>自动朗读</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>老师回复时自动播放语音</div>
            </div>
            <button
              onClick={() => onUpdate({ autoSpeak: !voiceSettings.autoSpeak })}
              style={{
                width: 48, height: 26, borderRadius: 13, border: 'none',
                background: voiceSettings.autoSpeak ? T.accent : T.border,
                position: 'relative', cursor: 'pointer',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: voiceSettings.autoSpeak ? 24 : 2,
                transition: 'left 0.2s',
              }} />
            </button>
          </div>

          {/* Voice Mode */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>语音模式</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {voiceModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => onUpdate({ voiceMode: mode.id })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: voiceSettings.voiceMode === mode.id ? T.accentGlow : 'transparent',
                    border: `1px solid ${voiceSettings.voiceMode === mode.id ? T.accent : T.border}`,
                    borderRadius: 10, padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', border: `2px solid ${voiceSettings.voiceMode === mode.id ? T.accent : T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {voiceSettings.voiceMode === mode.id && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{mode.label}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{mode.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>
              语速: {voiceSettings.speed || 1.0}x
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.speed || 1.0}
              onChange={e => onUpdate({ speed: parseFloat(e.target.value) })}
              style={{
                width: '100%', accentColor: T.accent,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.textMuted, marginTop: 4 }}>
              <span>慢</span><span>正常</span><span>快</span>
            </div>
          </div>

          {/* Voice Selection */}
          {voices.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>语音包</div>
              <select
                value={voiceSettings.voiceId || ''}
                onChange={e => onUpdate({ voiceId: e.target.value })}
                style={{
                  width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
                  padding: '8px 10px', color: T.text, fontSize: 13, fontFamily: 'inherit',
                }}
              >
                <option value="">默认语音</option>
                {voices.map((v, i) => (
                  <option key={i} value={v.voiceURI || v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}` }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
              padding: '10px', color: T.text, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECOVERY DIALOG
// ═══════════════════════════════════════════════════════════════════════════════
function RecoveryDialog({ T, progress, onResume, onNewSession }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
        width: '100%', maxWidth: 380, padding: 24,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>
            检测到未完成的学习
          </div>
          <div style={{ fontSize: 13, color: T.textDim }}>
            {progress.subject} · 掌握率 {progress.mastery || 0}%
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onResume}
            style={{
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`,
              border: 'none', borderRadius: 10, padding: '12px',
              color: T.userText, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            继续学习
          </button>
          <button
            onClick={onNewSession}
            style={{
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
              padding: '12px', color: T.text, fontSize: 14, cursor: 'pointer',
            }}
          >
            开始新课程
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORD PRONUNCIATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
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

  // Split text and make words clickable
  const parts = text.split(/(\s+)/).map((part, i) => {
    if (/\s+/.test(part)) return <span key={i}>{part}</span>;
    // Check if it looks like a word (letters)
    if (/[\w']+/.test(part)) {
      return (
        <span
          key={i}
          onClick={() => speakWord(part)}
          style={{ cursor: voiceEnabled ? 'pointer' : 'default' }}
          title={voiceEnabled ? `点击发音: ${part}` : part}
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });

  return <>{parts}</>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [themeId, setThemeId] = useState(() => {
    const settings = loadGlobalSettings();
    return settings.themeId || 'amber';
  });
  const T = THEMES[themeId];

  // User state
  const [users, setUsers] = useState(loadUsers);
  const [currentUser, setCurrentUser] = useState(() => {
    const userId = loadCurrentUserId();
    const allUsers = loadUsers();
    return allUsers.find(u => u.id === userId) || allUsers[0] || null;
  });

  // Model config state
  const [modelConfigs, setModelConfigs] = useState(loadModelConfigs);
  const [activeProvider, setActiveProvider] = useState(loadActiveProvider);

  // Voice settings
  const [voiceSettings, setVoiceSettings] = useState(() => {
    const settings = loadGlobalSettings();
    return settings.voiceSettings || {
      enabled: true,
      autoSpeak: false,
      speed: 1.0,
      voiceMode: 'push-to-talk',
      voiceId: '',
    };
  });

  // App phase
  const [phase, setPhase] = useState(() => {
    // Check if user exists, if not go to welcome
    const allUsers = loadUsers();
    if (allUsers.length === 0) return 'welcome';
    return 'onboard';
  });

  // Learning state
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("初学者");
  const [goal, setGoal] = useState("");
  const [mastery, setMastery] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiHistory, setApiHistory] = useState([]);
  const [teacher, setTeacher] = useState(DEFAULT_TEACHER);

  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // UI states
  const [showThemes, setShowThemes] = useState(false);
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [showUserCenter, setShowUserCenter] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [sessionStats, setSessionStats] = useState({ turns: 0, startTime: null });
  const [recoveryProgress, setRecoveryProgress] = useState(null);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const systemRef = useRef("");
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // Check voice support
  useEffect(() => {
    const hasSpeech = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    const hasSynth = "speechSynthesis" in window;
    setVoiceSupported(hasSpeech && hasSynth);
    if (hasSynth) synthRef.current = window.speechSynthesis;
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (phase === 'chat' && currentUser && subject) {
      autoSaveTimerRef.current = setInterval(() => {
        saveProgress(currentUser.id, subject, {
          subject,
          level,
          goal,
          mastery,
          messages,
          apiHistory,
          sessionStats,
          teacher,
        });
      }, 30000); // Save every 30 seconds
    }
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [phase, currentUser, subject, mastery, messages, apiHistory, sessionStats, teacher, level, goal]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (phase === 'chat' && currentUser && subject) {
        saveProgress(currentUser.id, subject, {
          subject,
          level,
          goal,
          mastery,
          messages,
          apiHistory,
          sessionStats,
          teacher,
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase, currentUser, subject, mastery, messages, apiHistory, sessionStats, teacher, level, goal]);

  // Scroll to bottom
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "46px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Check for recovery progress
  useEffect(() => {
    if (phase === 'onboard' && currentUser) {
      const progressList = loadUserProgressList(currentUser.id);
      if (progressList.length > 0) {
        // Get most recent
        const mostRecent = progressList.sort((a, b) =>
          new Date(b.lastUpdated) - new Date(a.lastUpdated)
        )[0];
        setRecoveryProgress(mostRecent);
      }
    }
  }, [phase, currentUser]);

  // ── Voice input ──────────────────────────────────────────────────────────
  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = teacher.lang || "zh-CN";
    rec.continuous = voiceSettings.voiceMode === 'realtime';
    rec.interimResults = true;
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      setInput(transcript);
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  // ── Voice output (TTS) ───────────────────────────────────────────────────
  const speakText = useCallback((text) => {
    if (!synthRef.current || !voiceSettings.enabled) return;
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
    utter.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utter);
  }, [voiceSettings, teacher.lang]);

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  // ── Parse AI response ────────────────────────────────────────────────────
  const parseResponse = (text) => {
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace === -1) throw new Error();
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } catch {
      return { message: text, masteryDelta: 0, currentMastery: mastery, mode: "explain", suggestedResponses: [], insight: "" };
    }
  };

  // ── Call tutor API ───────────────────────────────────────────────────────
  const callTutor = useCallback(async (userMsg, history) => {
    setLoading(true);
    try {
      const config = modelConfigs[activeProvider] || {};
      if (!config.apiKey || !config.model) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "请先在设置中配置 API Key 和选择模型",
          mode: "explain",
          insight: "",
          suggestedResponses: ["打开设置", "配置模型"],
        }]);
        setLoading(false);
        return;
      }

      const msgs = [...history, { role: "user", content: userMsg }];
      const raw = await callModelAPI(activeProvider, config, msgs, systemRef.current);
      const parsed = parseResponse(raw);
      const newMastery = Math.max(0, Math.min(100, parsed.currentMastery ?? (mastery + (parsed.masteryDelta ?? 0))));

      const newHistory = [...msgs, { role: "assistant", content: raw }];
      setApiHistory(newHistory);

      const aiMsg = {
        role: "assistant",
        content: parsed.message || "（解析失败，请重试）",
        mode: parsed.mode || "explain",
        insight: parsed.insight || "",
        suggestedResponses: parsed.suggestedResponses || [],
      };
      setMessages(prev => [...prev, aiMsg]);
      setMastery(newMastery);
      setSessionStats(prev => ({ ...prev, turns: prev.turns + 1 }));

      if (voiceSettings.autoSpeak && parsed.message) {
        speakText(parsed.message.slice(0, 300));
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `出错了: ${e.message}`,
        mode: "explain",
        insight: "",
        suggestedResponses: ["重试", "检查API配置"],
      }]);
    } finally {
      setLoading(false);
    }
  }, [modelConfigs, activeProvider, mastery, voiceSettings.autoSpeak, teacher.lang, speakText]);

  // ── User Management ─────────────────────────────────────────────────────
  const handleAddUser = (username, avatar) => {
    const newUser = {
      id: generateId(),
      username,
      avatar,
      createdAt: new Date().toISOString(),
      settings: { theme: themeId },
    };
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
      // Reset to onboard to let them choose subject
      setPhase('onboard');
      setSubject('');
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

  // ── Handle Start ────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!subject.trim()) return;
    const t = getTeacher(subject);
    setTeacher(t);
    systemRef.current = buildSystem(subject.trim(), level, goal.trim(), t);
    setPhase("chat");
    setMastery(0);
    setMessages([]);
    setApiHistory([]);
    setSessionStats({ turns: 0, startTime: Date.now() });
    await callTutor(`你好，我想学「${subject.trim()}」，请开始吧。`, []);
  };

  // ── Handle Send ─────────────────────────────────────────────────────────
  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    if (isRecording) stopRecording();
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    await callTutor(msg, apiHistory);
  };

  // ── Resume Progress ─────────────────────────────────────────────────────
  const handleResumeProgress = () => {
    if (recoveryProgress) {
      setSubject(recoveryProgress.subject);
      setLevel(recoveryProgress.level || "初学者");
      setGoal(recoveryProgress.goal || "");
      setMastery(recoveryProgress.mastery || 0);
      setMessages(recoveryProgress.messages || []);
      setApiHistory(recoveryProgress.apiHistory || []);
      setSessionStats(recoveryProgress.sessionStats || { turns: 0, startTime: Date.now() });
      const t = getTeacher(recoveryProgress.subject);
      setTeacher(t);
      systemRef.current = buildSystem(recoveryProgress.subject, recoveryProgress.level || "初学者", recoveryProgress.goal || "", t);
      setPhase("chat");
      setRecoveryProgress(null);
    }
  };

  const handleNewSession = () => {
    setRecoveryProgress(null);
    setSubject('');
    setMessages([]);
    setApiHistory([]);
    setMastery(0);
  };

  // ── Update Voice Settings ───────────────────────────────────────────────
  const handleUpdateVoiceSettings = (updates) => {
    const newSettings = { ...voiceSettings, ...updates };
    setVoiceSettings(newSettings);
    const settings = loadGlobalSettings();
    saveGlobalSettings({ ...settings, voiceSettings: newSettings });
  };

  // ── Update Theme ─────────────────────────────────────────────────────────
  const handleChangeTheme = (newThemeId) => {
    setThemeId(newThemeId);
    const settings = loadGlobalSettings();
    saveGlobalSettings({ ...settings, themeId: newThemeId });
  };

  // ── Mode label/color ──────────────────────────────────────────────────────
  const MODE_INFO = {
    explore:   { label: "🔍 探索提问", color: "#60a5fa" },
    explain:   { label: "📖 知识讲解", color: T.accent },
    test:      { label: "✏️ 知识测验", color: "#a78bfa" },
    praise:    { label: "🌟 答得好",   color: "#4ade80" },
    redirect:  { label: "🔄 再想一想", color: "#f87171" },
    milestone: { label: "🏆 里程碑",   color: "#fbbf24" },
  };

  const LEVELS = ["零基础", "初学者", "有些了解", "中级", "高级"];
  const PRESETS = ["Python编程", "英语口语", "高中数学", "经济学", "机器学习", "历史"];

  // ═══════════════════════════════════════════════════════════════════════════
  // WELCOME SCREEN (No Users)
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "welcome") return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Georgia','Times New Roman',serif", overflowY: "auto" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontSize: 64 }}>🎓</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            <span style={{ background: `linear-gradient(135deg, ${T.text}, ${T.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI 一对一私教</span>
          </div>
          <div style={{ fontSize: 15, color: T.textDim, lineHeight: 1.6 }}>
            欢迎使用 AI 私教系统<br />
            打造你的专属学习伙伴
          </div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          <button
            onClick={() => {
              const username = "学生" + Math.floor(Math.random() * 1000);
              handleAddUser(username, '🧑‍🎓');
              setPhase('onboard');
            }}
            style={{
              width: '100%', background: `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`,
              border: 'none', borderRadius: 12, padding: '14px',
              color: T.userText, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            快速开始（创建默认用户）
          </button>
          <button
            onClick={() => setShowUserCenter(true)}
            style={{
              width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
              padding: '14px', color: T.text, fontSize: 15, cursor: 'pointer',
            }}
          >
            创建自定义用户
          </button>
        </div>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: T.textMuted }}>首次使用将自动创建默认用户</div>
        </div>
      </div>
      {showUserCenter && (
        <UserCenterPanel
          T={T}
          currentUser={null}
          users={[]}
          onClose={() => setShowUserCenter(false)}
          onSwitchUser={handleSwitchUser}
          onAddUser={(name, av) => {
            handleAddUser(name, av);
            setShowUserCenter(false);
            setPhase('onboard');
          }}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // ONBOARDING SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "onboard") return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Georgia','Times New Roman',serif", overflowY: "auto", position: "relative" }}>
      <style>{`
        @keyframes dotBounce { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
        input, button { outline: none; }
      `}</style>

      {/* Recovery Dialog */}
      {recoveryProgress && (
        <RecoveryDialog
          T={T}
          progress={recoveryProgress}
          onResume={handleResumeProgress}
          onNewSession={handleNewSession}
        />
      )}

      {/* Ambient */}
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${T.orb1} 0%, transparent 70%)`, left: -150, top: -150, pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${T.orb2} 0%, transparent 70%)`, right: -100, bottom: 0, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${T.border}`, background: T.headerBg, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.accent, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🕯</span> 私塾 · AI家教
          {currentUser && (
            <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 400, marginLeft: 8 }}>
              · {currentUser.avatar} {currentUser.username}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: 'center' }}>
          {/* User Button */}
          <button
            onClick={() => setShowUserCenter(true)}
            style={{
              background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8,
              padding: "5px 10px", color: T.text, cursor: "pointer", fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Users size={14} /> {currentUser?.avatar || '👤'}
          </button>
          {/* Theme switcher */}
          <div style={{ position: "relative" }}>
            <button className="iconbtn" onClick={() => setShowThemes(p => !p)}
              style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 10px", color: T.accent, cursor: "pointer", fontSize: 14 }}>
              {THEMES[themeId].icon}
            </button>
            {showThemes && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 8, display: "flex", flexDirection: "column", gap: 4, zIndex: 200, minWidth: 130 }}>
                {Object.values(THEMES).map(th => (
                  <button key={th.id} onClick={() => { handleChangeTheme(th.id); setShowThemes(false); }}
                    style={{ background: themeId === th.id ? T.accentGlow : "transparent", border: "none", borderRadius: 8, padding: "6px 10px", color: themeId === th.id ? T.accent : T.textDim, cursor: "pointer", fontSize: 13, textAlign: "left", display: "flex", gap: 8, alignItems: "center", fontFamily: "inherit" }}>
                    {th.icon} {th.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px", display: "flex", flexDirection: "column", gap: 32, animation: "fadeUp 0.5s ease" }}>
        {/* Hero */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
            <span style={{ background: `linear-gradient(135deg, ${T.text}, ${T.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>你的专属 AI 家教<br />已就位</span>
          </div>
          <div style={{ fontSize: 15, color: T.textDim, lineHeight: 1.75 }}>
            不是搜索引擎，不是空白输入框<br />
            而是一位懂你的导师，从漏洞到掌握，超越98%的同龄人
          </div>
        </div>

        {/* Input Card */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 28, display: "flex", flexDirection: "column", gap: 20, boxShadow: `0 8px 32px rgba(0,0,0,0.2)` }}>
          {/* Subject */}
          <div>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 8 }}>我想学什么</div>
            <input
              value={subject} onChange={e => setSubject(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleStart()}
              placeholder="Python编程 / 英语口语 / 高中数学 / 自定义…"
              style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 14.5, fontFamily: "inherit", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {PRESETS.map(s => (
                <button key={s} onClick={() => setSubject(s)}
                  style={{ background: subject === s ? T.accentGlow : "transparent", border: `1px solid ${subject === s ? T.accent : T.border}`, borderRadius: 14, padding: "4px 10px", color: subject === s ? T.accent : T.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 8 }}>当前水平</div>
            <div style={{ display: "flex", gap: 6 }}>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  style={{ flex: 1, background: level === l ? T.accentGlow : T.surface, border: `1px solid ${level === l ? T.accent : T.border}`, borderRadius: 8, padding: "7px 0", color: level === l ? T.accent : T.textDim, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: level === l ? 600 : 400, transition: "all 0.2s" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 8 }}>学习目标（选填）</div>
            <input
              value={goal} onChange={e => setGoal(e.target.value)}
              placeholder="例如：通过期末考试 / 能独立写代码 / 日常对话…"
              style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 14, fontFamily: "inherit", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          {/* Teacher preview */}
          {subject && (() => {
            const t = getTeacher(subject);
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.accentGlow, border: `1px solid ${T.accent}33`, borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: T.accentGlow, border: `1px solid ${T.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: T.accent, fontWeight: 700, flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{t.name} <span style={{ fontSize: 12, color: T.textDim }}>· {t.title}</span></div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>将担任你的专属导师 {t.lang === "en-US" ? "🎙️ 支持英语语音" : "🎙️ 支持中文语音"}</div>
                </div>
              </div>
            );
          })()}

          {/* Model info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{MODEL_PROVIDERS[activeProvider]?.icon || '🔧'}</span>
              <div>
                <div style={{ fontSize: 12, color: T.text }}>当前模型: {MODEL_PROVIDERS[activeProvider]?.name || '未配置'}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>
                  {modelConfigs[activeProvider]?.model
                    ? MODEL_PROVIDERS[activeProvider]?.models.find(m => m.id === modelConfigs[activeProvider].model)?.name || modelConfigs[activeProvider].model
                    : '未选择模型'
                  }
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowModelConfig(true)}
              style={{
                background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8,
                padding: '6px 12px', color: T.accent, fontSize: 12, cursor: 'pointer',
              }}
            >
              <Settings size={12} style={{ marginRight: 4 }} />
              配置
            </button>
          </div>

          {/* Start button */}
          <button onClick={handleStart} disabled={!subject.trim()}
            style={{ background: subject.trim() ? `linear-gradient(135deg, ${T.accent}, ${T.accentDim})` : T.border, border: "none", borderRadius: 12, padding: "14px", color: subject.trim() ? T.userText : T.textMuted, fontSize: 15, fontWeight: 700, cursor: subject.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", letterSpacing: "0.04em", transition: "opacity 0.2s" }}>
            开始一对一学习 →
          </button>
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { i: "🔍", t: "知识漏洞诊断", d: "先摸底再讲，精准找到你的盲区" },
            { i: "📊", t: "掌握率追踪", d: "实时监测，低于80%绝不推进" },
            { i: "🎙️", t: "实时语音对话", d: "说出你的答案，打造沉浸式环境" },
            { i: "🧑‍🏫", t: "专属教师人格", d: "不同学科匹配不同风格导师" },
          ].map(f => (
            <div key={f.t} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ fontSize: 22, flexShrink: 0 }}>{f.i}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, marginBottom: 3 }}>{f.t}</div>
                <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5 }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showModelConfig && (
        <ModelConfigPanel
          T={T}
          onClose={() => {
            setShowModelConfig(false);
            setModelConfigs(loadModelConfigs());
            setActiveProvider(loadActiveProvider());
          }}
        />
      )}
      {showUserCenter && (
        <UserCenterPanel
          T={T}
          currentUser={currentUser}
          users={users}
          onClose={() => setShowUserCenter(false)}
          onSwitchUser={handleSwitchUser}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  const [ml, mlIcon] = masteryLabel(mastery);
  const elapsed = sessionStats.startTime ? Math.round((Date.now() - sessionStats.startTime) / 60000) : 0;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: T.bg, color: T.text, fontFamily: "'Georgia','Times New Roman',serif", overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes dotBounce { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes recordPulse { 0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,0.4)} 50%{box-shadow:0 0 0 8px rgba(248,113,113,0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
        textarea:focus { border-color: ${T.accent} !important; outline: none; }
        .qbtn:hover { background: ${T.accentGlow} !important; border-color: ${T.accent} !important; }
        .iconbtn:hover { opacity: 0.8; }
      `}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${T.orb1} 0%, transparent 70%)`, left: -150, top: -100, pointerEvents: "none", zIndex: 0 }} />

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${T.border}`, background: T.headerBg, backdropFilter: "blur(12px)", flexShrink: 0, position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="iconbtn" onClick={() => setPhase("onboard")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 20, padding: "2px 4px", lineHeight: 1 }}>←</button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.accentGlow, border: `1px solid ${T.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: T.accent, fontWeight: 700 }}>
            {teacher.avatar}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{teacher.name} <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 400 }}>· {teacher.title}</span></div>
            <div style={{ fontSize: 11, color: T.textMuted, display: "flex", gap: 8 }}>
              <span style={{ color: T.accent }}>{subject}</span>
              <span>·</span>
              <span>{level}</span>
              <span>·</span>
              <span>第{sessionStats.turns}轮</span>
              {elapsed > 0 && <><span>·</span><span>{elapsed}分钟</span></>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* User button */}
          <button
            onClick={() => setShowUserCenter(true)}
            style={{
              background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8,
              padding: "5px 8px", color: T.text, cursor: "pointer", fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Users size={12} /> {currentUser?.avatar || '👤'}
          </button>
          {/* Voice settings */}
          {voiceSupported && (
            <button className="iconbtn" onClick={() => setShowVoiceSettings(true)}
              style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 8px", color: T.accent, cursor: "pointer", fontSize: 14 }}>
              🔊
            </button>
          )}
          {/* Model config */}
          <button className="iconbtn" onClick={() => setShowModelConfig(true)}
            style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 8px", color: T.accent, cursor: "pointer", fontSize: 14 }}>
            {MODEL_PROVIDERS[activeProvider]?.icon || '⚙️'}
          </button>
          {/* Theme switcher */}
          <div style={{ position: "relative" }}>
            <button className="iconbtn" onClick={() => setShowThemes(p => !p)}
              style={{ background: T.accentGlow, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 10px", color: T.accent, cursor: "pointer", fontSize: 14 }}>
              {THEMES[themeId].icon}
            </button>
            {showThemes && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 8, display: "flex", flexDirection: "column", gap: 4, zIndex: 200, minWidth: 130 }}>
                {Object.values(THEMES).map(th => (
                  <button key={th.id} onClick={() => { handleChangeTheme(th.id); setShowThemes(false); }}
                    style={{ background: themeId === th.id ? T.accentGlow : "transparent", border: "none", borderRadius: 8, padding: "6px 10px", color: themeId === th.id ? T.accent : T.textDim, cursor: "pointer", fontSize: 13, textAlign: "left", display: "flex", gap: 8, alignItems: "center", fontFamily: "inherit" }}>
                    {th.icon} {th.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Mastery ring */}
          <MasteryRing value={mastery} accent={T.accent} />
        </div>
      </div>

      {/* ── Mastery bar ── */}
      <div style={{ height: 3, background: T.border, flexShrink: 0, position: "relative", zIndex: 9 }}>
        <div style={{ height: "100%", width: `${mastery}%`, background: `linear-gradient(90deg, ${masteryColor(mastery)}, ${masteryColor(Math.min(mastery+20,100))})`, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: `0 0 6px ${masteryColor(mastery)}` }} />
      </div>

      {/* ── Chat messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 780, width: "100%", margin: "0 auto", alignSelf: "stretch", position: "relative", zIndex: 1 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start", animation: "fadeUp 0.25s ease" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: msg.role === "user" ? `linear-gradient(135deg, ${T.accent}, ${T.accentDim})` : T.accentGlow, border: msg.role === "user" ? "none" : `1px solid ${T.border}`, color: msg.role === "user" ? T.userText : T.accent }}>
              {msg.role === "user" ? "你" : teacher.avatar}
            </div>
            <div style={{ maxWidth: "76%" }}>
              {msg.role === "assistant" && msg.mode && MODE_INFO[msg.mode] && (
                <div style={{ fontSize: 11, fontFamily: "monospace", padding: "2px 8px", borderRadius: 10, background: `${MODE_INFO[msg.mode].color}18`, color: MODE_INFO[msg.mode].color, display: "inline-block", marginBottom: 6, fontWeight: 600, letterSpacing: "0.04em" }}>
                  {MODE_INFO[msg.mode].label}
                </div>
              )}
              <div style={{ background: msg.role === "user" ? T.userBubble : T.card, border: msg.role === "user" ? "none" : `1px solid ${T.border}`, borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px", padding: "11px 15px", color: msg.role === "user" ? T.userText : T.text, fontSize: 14.5, lineHeight: 1.65, boxShadow: `0 2px 8px rgba(0,0,0,0.15)` }}>
                <PronunciationText
                  text={msg.content}
                  lang={msg.role === "assistant" ? teacher.lang : "zh-CN"}
                  voiceEnabled={voiceSettings.enabled}
                  voiceSettings={voiceSettings}
                />
              </div>
              {msg.role === "assistant" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                  {msg.insight && <div style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic", fontFamily: "monospace" }}>💭 {msg.insight}</div>}
                  {voiceSupported && (
                    <button className="iconbtn" onClick={() => speakText(msg.content)}
                      style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 13, padding: "0 4px" }} title="朗读">
                      🔊
                    </button>
                  )}
                </div>
              )}
              {msg.role === "assistant" && msg.suggestedResponses?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {msg.suggestedResponses.map((r, j) => (
                    <button key={j} className="qbtn" onClick={() => handleSend(r)}
                      style={{ background: T.surface, border: `1px solid ${T.accent}33`, borderRadius: 18, padding: "5px 12px", color: T.accent, fontSize: 13, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <TypingDots T={T} teacher={teacher} />}
        <div ref={chatEndRef} />
      </div>

      {/* ── Mastery milestone banner ── */}
      {mastery >= 80 && messages.length > 0 && !loading && (
        <div style={{ margin: "0 16px 4px", maxWidth: 780, alignSelf: "center", width: "calc(100% - 32px)", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.35)", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#4ade80", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          ✨ 掌握率已达 <strong>{mastery}%</strong>！这个知识点你已经真正掌握了，可以继续深入。
        </div>
      )}

      {/* ── Input area ── */}
      <div style={{ padding: "10px 16px 16px", borderTop: `1px solid ${T.border}`, maxWidth: 780, width: "100%", margin: "0 auto", flexShrink: 0, position: "relative", zIndex: 10 }}>
        {/* Speak if TTS is active */}
        {isSpeaking && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12, color: T.accent }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, animation: "pulse 1s infinite" }} />
            {teacher.name}正在朗读… <button onClick={stopSpeaking} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>停止</button>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          {/* Voice mic button */}
          {voiceSupported && voiceSettings.enabled && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              style={{
                width: 44, height: 44, borderRadius: "50%", border: "none",
                background: isRecording ? "#f87171" : T.surface,
                border: `1px solid ${isRecording ? "#f87171" : T.border}`,
                color: isRecording ? "#fff" : T.textMuted,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                animation: isRecording ? "recordPulse 1.5s infinite" : "none",
                transition: "all 0.2s",
              }}
              title={isRecording ? "停止录音" : `语音输入 (${teacher.lang === 'en-US' ? '英语' : '中文'})`}>
              {isRecording ? "⏹" : "🎙"}
            </button>
          )}
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={loading}
            placeholder={isRecording ? `正在录音（${teacher.lang === 'en-US' ? '请说英语' : '请说话'}）…` : "输入你的回答或问题… (Enter发送，Shift+Enter换行)"}
            rows={1}
            style={{ flex: 1, background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 14, lineHeight: 1.5, resize: "none", fontFamily: "inherit", transition: "border-color 0.2s", minHeight: 46, maxHeight: 120, boxShadow: "none" }}
          />
          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              width: 44, height: 44, borderRadius: 12, border: "none",
              background: (loading || !input.trim()) ? T.border : `linear-gradient(135deg, ${T.accent}, ${T.accentDim})`,
              color: (loading || !input.trim()) ? T.textMuted : T.userText,
              cursor: (loading || !input.trim()) ? "not-allowed" : "pointer",
              fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
            {loading ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 16 }}>⟳</span> : "↑"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6, textAlign: "center" }}>
          {mastery < 80
            ? `💡 勇敢说出你的想法——答错了也没关系，错误是最好的老师 · 掌握率 ${mastery}%`
            : `🏆 你已掌握这个知识点！告诉${teacher.name}你想学什么新内容吧`}
        </div>
      </div>

      {/* Modals */}
      {showModelConfig && (
        <ModelConfigPanel
          T={T}
          onClose={() => {
            setShowModelConfig(false);
            setModelConfigs(loadModelConfigs());
            setActiveProvider(loadActiveProvider());
          }}
        />
      )}
      {showUserCenter && (
        <UserCenterPanel
          T={T}
          currentUser={currentUser}
          users={users}
          onClose={() => setShowUserCenter(false)}
          onSwitchUser={handleSwitchUser}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
      {showVoiceSettings && (
        <VoiceSettingsPanel
          T={T}
          voiceSettings={voiceSettings}
          onUpdate={handleUpdateVoiceSettings}
          onClose={() => setShowVoiceSettings(false)}
        />
      )}
    </div>
  );
}
