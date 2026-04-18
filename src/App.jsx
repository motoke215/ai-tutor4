import { useState, useEffect, useRef, useCallback } from "react"
import { SpeechRecognition } from "@capacitor-community/speech-recognition"

// ─────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────
const PROVIDERS = {
  anthropic: { name:"Anthropic",  models:["claude-opus-4-20250514","claude-sonnet-4-20250514","claude-haiku-4-5-20251001"], baseUrl:"https://api.anthropic.com/v1/messages", fmt:"anthropic" },
  openai:    { name:"OpenAI",     models:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"],                             baseUrl:"https://api.openai.com/v1/chat/completions",   fmt:"openai" },
  deepseek:  { name:"DeepSeek",   models:["deepseek-chat","deepseek-reasoner"],                                               baseUrl:"https://api.deepseek.com/v1/chat/completions", fmt:"openai" },
  zhipu:     { name:"智谱GLM",    models:["glm-4-flash","glm-4","glm-4-air"],                                                 baseUrl:"https://open.bigmodel.cn/api/paas/v4/chat/completions", fmt:"openai" },
  qwen:      { name:"通义千问",   models:["qwen-plus","qwen-turbo","qwen-max"],                                               baseUrl:"https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", fmt:"openai" },
  moonshot:  { name:"月之暗面",   models:["moonshot-v1-8k","moonshot-v1-32k","moonshot-v1-128k"],                            baseUrl:"https://api.moonshot.cn/v1/chat/completions",  fmt:"openai" },
  custom:    { name:"自定义",     models:[],                                                                                   baseUrl:"",                                             fmt:"openai" }
}
const AVATARS  = ["🦊","🐼","🦁","🐸","🐯","🦄","🐳","🦋","🐧","🦜","🐙","🦔"]
const SUBJECTS = ["数学","语文","英语","科学","综合"]
const LVL_COLORS = ["#FF6B6B","#FF9F43","#FECA57","#A3CB38","#26de81","#45AAF2","#4BCFFA","#A29BFE","#FD79A8","#6C5CE7"]

// ─────────────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────────────
function G() {
  return <style>{`
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    body{margin:0;overflow:hidden;font-family:"Comic Sans MS","Segoe UI",cursive}
    @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes wiggle{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)}}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.65;transform:scale(.95)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes waveBar{0%,100%{height:6px}50%{height:28px}}
    @keyframes popIn{0%{transform:scale(0) rotate(-10deg);opacity:0}65%{transform:scale(1.12) rotate(2deg)}100%{transform:scale(1) rotate(0);opacity:1}}
    @keyframes floatStar{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-90px) scale(1.6);opacity:0}}
    @keyframes blinkEye{0%,85%,100%{transform:scaleY(1)}92%{transform:scaleY(.08)}}
    @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.2);opacity:0}}
    @keyframes slideUp{0%{transform:translateY(20px);opacity:0}100%{transform:translateY(0);opacity:1}}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .btn-tap:active{transform:scale(.92)!important;transition:transform .1s!important}
  `}</style>
}

// ─────────────────────────────────────────────────────
//  OWL MASCOT
// ─────────────────────────────────────────────────────
function Owl({ mood="idle", speaking=false }) {
  const pal = {idle:"#A29BFE",happy:"#FECA57",thinking:"#74B9FF",excited:"#FF7675",encouraging:"#55EFC4",listening:"#FD79A8"}
  const c   = pal[mood] || pal.idle
  const isHappy = mood==="happy"||mood==="excited"
  const smilePath = isHappy ? "M 60 92 Q 70 101 80 92" : "M 62 93 Q 70 96 78 93"

  return (
    <div style={{animation:`bounce ${isHappy?"0.7s":"2.2s"} ease-in-out infinite`,display:"inline-block",filter:"drop-shadow(0 6px 12px rgba(0,0,0,.18))"}}>
      <svg width="150" height="168" viewBox="0 0 140 165">
        {/* Ground shadow */}
        <ellipse cx="70" cy="160" rx="32" ry="5" fill="rgba(0,0,0,.12)"/>
        {/* Body */}
        <ellipse cx="70" cy="118" rx="42" ry="46" fill={c}/>
        {/* Belly */}
        <ellipse cx="70" cy="122" rx="24" ry="32" fill="rgba(255,255,255,.22)"/>
        {/* Head */}
        <circle cx="70" cy="66" r="42" fill={c}/>
        {/* Ear tufts */}
        <ellipse cx="46" cy="28" rx="10" ry="16" fill={c} transform="rotate(-22 46 28)" style={{filter:"brightness(.9)"}}/>
        <ellipse cx="94" cy="28" rx="10" ry="16" fill={c} transform="rotate(22 94 28)" style={{filter:"brightness(.9)"}}/>
        {/* Face plate */}
        <ellipse cx="70" cy="68" rx="30" ry="26" fill="rgba(255,255,255,.28)"/>
        {/* Left eye white */}
        <circle cx="54" cy="63" r="12" fill="white"/>
        {/* Left eye iris */}
        <g style={{animation:"blinkEye 3.5s ease-in-out infinite",transformOrigin:"54px 63px"}}>
          <circle cx="56" cy="64" r="8" fill="#2d3436"/>
          <circle cx="58" cy="61" r="2.5" fill="white"/>
        </g>
        {/* Right eye white */}
        <circle cx="86" cy="63" r="12" fill="white"/>
        {/* Right eye iris */}
        <g style={{animation:"blinkEye 3.5s ease-in-out infinite .15s",transformOrigin:"86px 63px"}}>
          <circle cx="88" cy="64" r="8" fill="#2d3436"/>
          <circle cx="90" cy="61" r="2.5" fill="white"/>
        </g>
        {/* Beak */}
        <polygon points="64,79 76,79 70,91" fill="#F39C12"/>
        {/* Mouth */}
        {speaking
          ? <><ellipse cx="70" cy="93" rx="9" ry="5" fill="#c0392b"/><ellipse cx="70" cy="91" rx="9" ry="3" fill="#e74c3c"/></>
          : <path d={smilePath} stroke="#F39C12" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
        {/* Wings */}
        <ellipse cx="32" cy="118" rx="17" ry="30" fill={c} style={{filter:"brightness(.82)",animation:isHappy?"wiggle .55s ease-in-out infinite":"none",transformOrigin:"40px 104px"}}/>
        <ellipse cx="108" cy="118" rx="17" ry="30" fill={c} style={{filter:"brightness(.82)",animation:isHappy?"wiggle .55s ease-in-out infinite reverse":"none",transformOrigin:"100px 104px"}}/>
        {/* Feet */}
        <rect x="48" y="158" width="20" height="6" rx="3" fill="#F39C12"/>
        <rect x="72" y="158" width="20" height="6" rx="3" fill="#F39C12"/>
        {/* Mood extras */}
        {mood==="thinking"&&<><circle cx="110" cy="42" r="4" fill="white" opacity=".7"/><circle cx="120" cy="28" r="6" fill="white" opacity=".75"/><circle cx="130" cy="14" r="9" fill="white" opacity=".8"/></>}
        {isHappy&&<><text x="107" y="48" fontSize="14">✨</text><text x="4"  y="55" fontSize="12">⭐</text></>}
        {mood==="listening"&&<circle cx="70" cy="66" r="52" fill="none" stroke={c} strokeWidth="4" opacity=".35" style={{animation:"ripple 1.4s ease-out infinite"}}/>}
        {mood==="encouraging"&&<><text x="108" y="52" fontSize="13">💪</text><text x="5"   y="60" fontSize="12">🌟</text></>}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────
//  VOICE WAVE BARS
// ─────────────────────────────────────────────────────
function VoiceBars({ active, color="#A29BFE" }) {
  const hs = [.55,1,.7,1.25,.85,1,.5]
  return (
    <div style={{display:"flex",alignItems:"center",gap:"3px",height:"36px"}}>
      {hs.map((h,i)=>(
        <div key={i} style={{width:"4px",borderRadius:"3px",background:color,height:active?`${7+h*21}px`:"5px",animation:active?`waveBar ${.28+i*.07}s ease-in-out ${i*.04}s infinite alternate`:"none",transition:"height .35s ease"}}/>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────
//  STAR BURST OVERLAY
// ─────────────────────────────────────────────────────
function StarBurst({ show }) {
  if (!show) return null
  const items  = ["⭐","🌟","✨","🎉","⭐","🌟","✨"]
  const coords = [{x:90,y:-95},{x:-95,y:-70},{x:22,y:-115},{x:-75,y:55},{x:100,y:45},{x:-30,y:85},{x:60,y:90}]
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {items.map((s,i)=>(
        <div key={i} style={{position:"absolute",fontSize:"30px",top:`calc(50% - 15px)`,left:`calc(50% - 15px)`,animation:`floatStar 1.3s ease-out ${i*.09}s forwards`,transform:`translate(${coords[i].x}px,${coords[i].y}px)`}}>{s}</div>
      ))}
      <div style={{fontSize:"44px",fontWeight:"800",color:"#FECA57",textShadow:"0 3px 12px rgba(0,0,0,.25)",animation:"popIn .5s ease-out"}}>太棒了！🎉</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
//  SETUP SCREEN
// ─────────────────────────────────────────────────────
function SetupScreen({ config, onSave }) {
  const [prov, setProv]   = useState(config.provider||"anthropic")
  const [model, setModel] = useState(config.model||"claude-sonnet-4-20250514")
  const [key, setKey]     = useState(config.apiKey||"")
  const [url, setUrl]     = useState(config.baseUrl||PROVIDERS.anthropic.baseUrl)
  const [cm, setCm]       = useState(config.customModels||"")

  const P = PROVIDERS[prov]||PROVIDERS.custom
  const models = prov==="custom" ? cm.split(",").map(m=>m.trim()).filter(Boolean) : P.models

  const onChangeProv = p => {
    setProv(p); const pr=PROVIDERS[p]; setModel(pr.models[0]||""); setUrl(pr.baseUrl)
  }

  const inp = {width:"100%",padding:"11px 14px",borderRadius:"12px",border:"2px solid #E0E0F0",fontSize:"14px",outline:"none",marginTop:"6px",background:"#FAFAFF",display:"block",boxSizing:"border-box",fontFamily:"monospace"}

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <G/>
      <div style={{background:"white",borderRadius:"28px",padding:"28px 22px",width:"100%",maxWidth:"400px",boxShadow:"0 24px 64px rgba(0,0,0,.28)"}}>
        <div style={{textAlign:"center",marginBottom:"22px"}}>
          <div style={{fontSize:"44px",marginBottom:"6px"}}>🤖</div>
          <h2 style={{margin:0,fontSize:"20px",color:"#2d3436"}}>AI 模型配置</h2>
          <p style={{margin:"4px 0 0",fontSize:"13px",color:"#999"}}>选择您偏好的AI服务商与模型</p>
        </div>

        <p style={{fontSize:"11px",fontWeight:"700",color:"#aaa",margin:"0 0 8px",letterSpacing:"1px",textTransform:"uppercase"}}>提供商</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px",marginBottom:"16px"}}>
          {Object.entries(PROVIDERS).map(([k,p])=>(
            <button key={k} onClick={()=>onChangeProv(k)} className="btn-tap" style={{padding:"8px 2px",borderRadius:"10px",border:"2px solid",cursor:"pointer",fontSize:"11px",fontWeight:"600",transition:"all .2s",borderColor:prov===k?"#667eea":"#eee",background:prov===k?"#F0F0FF":"white",color:prov===k?"#667eea":"#888"}}>{p.name}</button>
          ))}
        </div>

        <p style={{fontSize:"11px",fontWeight:"700",color:"#aaa",margin:"0 0 0",letterSpacing:"1px",textTransform:"uppercase"}}>模型</p>
        {prov==="custom"&&<input value={cm} onChange={e=>setCm(e.target.value)} placeholder="输入模型名，多个用英文逗号分隔" style={inp}/>}
        <select value={model} onChange={e=>setModel(e.target.value)} style={{...inp,marginTop:prov==="custom"?"8px":"6px",cursor:"pointer"}}>
          {models.length?models.map(m=><option key={m} value={m}>{m}</option>):<option value="">请先输入模型名称</option>}
        </select>

        <p style={{fontSize:"11px",fontWeight:"700",color:"#aaa",margin:"16px 0 0",letterSpacing:"1px",textTransform:"uppercase"}}>API Key</p>
        <input value={key} onChange={e=>setKey(e.target.value)} type="password" placeholder={prov==="anthropic"&&!key?"内置接口（可留空）":`${P.name} API Key`} style={inp}/>

        <p style={{fontSize:"11px",fontWeight:"700",color:"#aaa",margin:"14px 0 0",letterSpacing:"1px",textTransform:"uppercase"}}>接口地址</p>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="API Base URL" style={inp}/>

        <div style={{background:"#F6F6FF",borderRadius:"10px",padding:"9px 12px",margin:"12px 0 16px",fontSize:"11px",color:"#999",fontFamily:"monospace",wordBreak:"break-all"}}>
          📡 {url||"请输入接口地址"}
        </div>

        <button onClick={()=>onSave({provider:prov,model,apiKey:key,baseUrl:url||P.baseUrl,customModels:cm})} className="btn-tap" style={{width:"100%",padding:"14px",borderRadius:"14px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"white",fontSize:"16px",fontWeight:"700",boxShadow:"0 4px 18px rgba(102,126,234,.45)"}}>
          保存并开始学习 ✓
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
//  USERS SCREEN
// ─────────────────────────────────────────────────────
function UsersScreen({ users, onSelect, onNew, onSetup }) {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#FFEAA7 0%,#81ECEC 55%,#A29BFE 100%)",padding:"36px 20px 40px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <G/>
      <div style={{animation:"bounce 2s ease-in-out infinite",fontSize:"60px",marginBottom:"6px"}}>🦉</div>
      <h1 style={{margin:"0 0 4px",fontSize:"26px",color:"white",textShadow:"0 2px 10px rgba(0,0,0,.22)"}}>小小学习星球 🌟</h1>
      <p style={{margin:"0 0 28px",color:"rgba(255,255,255,.9)",fontSize:"14px"}}>选择你的小星星，开启今天的冒险！</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px",width:"100%",maxWidth:"340px"}}>
        {users.map(u=>(
          <button key={u.id} onClick={()=>onSelect(u)} className="btn-tap" style={{background:"white",borderRadius:"22px",padding:"20px 12px",border:"none",cursor:"pointer",boxShadow:"0 8px 28px rgba(0,0,0,.13)",display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",transition:"transform .2s,box-shadow .2s"}}>
            <span style={{fontSize:"40px"}}>{u.avatar}</span>
            <span style={{fontWeight:"700",fontSize:"15px",color:"#2d3436"}}>{u.name}</span>
            <div style={{display:"flex",gap:"2px"}}>
              {Array.from({length:Math.min(u.level||1,5)}).map((_,i)=><span key={i} style={{fontSize:"12px"}}>⭐</span>)}
            </div>
            <div style={{background:LVL_COLORS[Math.min((u.level||1)-1,9)]+"22",borderRadius:"20px",padding:"3px 11px",fontSize:"11px",color:LVL_COLORS[Math.min((u.level||1)-1,9)],fontWeight:"700"}}>
              Lv.{u.level||1} · {u.score||0}分
            </div>
          </button>
        ))}

        <button onClick={onNew} className="btn-tap" style={{background:"rgba(255,255,255,.45)",borderRadius:"22px",padding:"20px 12px",border:"3px dashed rgba(255,255,255,.75)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
          <span style={{fontSize:"38px"}}>➕</span>
          <span style={{fontSize:"13px",color:"rgba(255,255,255,.95)",fontWeight:"600"}}>新建学习者</span>
        </button>
      </div>

      <button onClick={onSetup} style={{marginTop:"28px",background:"rgba(255,255,255,.22)",border:"2px solid rgba(255,255,255,.5)",color:"white",padding:"10px 24px",borderRadius:"22px",cursor:"pointer",fontSize:"13px",fontFamily:"inherit"}}>
        ⚙️ AI模型设置
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────
//  NEW USER SCREEN
// ─────────────────────────────────────────────────────
function NewUserScreen({ onCreate, onBack }) {
  const [name, setName]       = useState("")
  const [avatar, setAvatar]   = useState("🦊")
  const [subject, setSubject] = useState("综合")

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#fd79a8,#fdcb6e)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <G/>
      <div style={{background:"white",borderRadius:"28px",padding:"28px 22px",width:"100%",maxWidth:"340px",boxShadow:"0 20px 52px rgba(0,0,0,.22)"}}>
        <h2 style={{textAlign:"center",margin:"0 0 22px",fontSize:"20px",color:"#2d3436"}}>创建我的学习角色 🎨</h2>

        <p style={{fontSize:"12px",color:"#aaa",margin:"0 0 8px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"1px"}}>选头像</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"18px"}}>
          {AVATARS.map(a=>(
            <button key={a} onClick={()=>setAvatar(a)} style={{fontSize:"26px",background:avatar===a?"#FFF9E6":"white",border:avatar===a?"3px solid #FECA57":"2px solid #eee",borderRadius:"12px",padding:"5px",cursor:"pointer",width:"46px",height:"46px",transition:"all .15s"}}>{a}</button>
          ))}
        </div>

        <p style={{fontSize:"12px",color:"#aaa",margin:"0 0 8px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"1px"}}>我的名字</p>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="输入你的名字..." maxLength={10}
          style={{width:"100%",padding:"12px 14px",borderRadius:"12px",border:"2px solid #eee",fontSize:"16px",fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:"16px"}}
          onFocus={e=>e.target.style.borderColor="#fd79a8"} onBlur={e=>e.target.style.borderColor="#eee"}/>

        <p style={{fontSize:"12px",color:"#aaa",margin:"0 0 8px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"1px"}}>学习科目</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"22px"}}>
          {SUBJECTS.map(s=>(
            <button key={s} onClick={()=>setSubject(s)} style={{padding:"8px 14px",borderRadius:"20px",border:"2px solid",cursor:"pointer",fontSize:"13px",transition:"all .15s",borderColor:subject===s?"#fd79a8":"#eee",background:subject===s?"#FFF0F5":"white",color:subject===s?"#fd79a8":"#888",fontWeight:subject===s?"700":"400",fontFamily:"inherit"}}>{s}</button>
          ))}
        </div>

        <button onClick={()=>name.trim()&&onCreate({name:name.trim(),avatar,subject})} disabled={!name.trim()} className="btn-tap"
          style={{width:"100%",padding:"14px",borderRadius:"14px",border:"none",cursor:name.trim()?"pointer":"not-allowed",background:name.trim()?"linear-gradient(135deg,#fd79a8,#fdcb6e)":"#eee",color:name.trim()?"white":"#ccc",fontSize:"16px",fontWeight:"700",marginBottom:"8px"}}>
          出发！🚀
        </button>
        <button onClick={onBack} style={{width:"100%",padding:"10px",background:"none",border:"none",color:"#ccc",cursor:"pointer",fontSize:"14px",fontFamily:"inherit"}}>← 返回</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
//  LEARNING SCREEN
// ─────────────────────────────────────────────────────
function LearningScreen({ user, config, onBack, onUpdateUser }) {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [mood, setMood]         = useState("idle")
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [showStars, setShowStars] = useState(false)
  const [score, setScore]       = useState(user.score||0)
  const [level, setLevel]       = useState(user.level||1)

  const msgsRef    = useRef([])
  const loadRef    = useRef(false)
  const scoreRef   = useRef(user.score||0)
  const levelRef   = useRef(user.level||1)
  const chatRef    = useRef(null)
  const synthRef   = useRef(window.speechSynthesis)
  const sendRef    = useRef(null)

  // Auto-scroll
  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight },[messages])

  // Speech recognition setup + initial greeting
  useEffect(()=>{
    // Setup native speech recognition plugin
    const setupNativeSR = async () => {
      try {
        const { available } = await SpeechRecognition.available()
        if (available) {
          // Listen for results
          await SpeechRecognition.addListener("partialResults", (data) => {
            if (data.matches && data.matches.length > 0) {
              const t = data.matches[0]
              setInput(t)
              setListening(false)
              setTimeout(() => sendRef.current?.(t), 200)
            }
          })
          // Listen for stop
          await SpeechRecognition.addListener("listeningState", (data) => {
            if (data.status === "stopped") {
              setListening(false)
            }
          })
        }
      } catch (e) {
        console.log("Speech recognition not available:", e)
      }
    }
    setupNativeSR()
    setTimeout(()=>sendRef.current?.(null,true), 600)
    return ()=>{
      synthRef.current?.cancel()
      SpeechRecognition.removeAllListeners().catch(()=>{})
    }
  },[])

  // Speak text aloud
  const speak = useCallback(text=>{
    if(!synthRef.current) return
    synthRef.current.cancel()
    const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu,"").replace(/[⭐🌟✨🎉🦉💭🎊💪]/g,"").trim()
    if(!clean) return
    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang="zh-CN"; utt.rate=0.86; utt.pitch=1.18
    // Try to pick a Chinese voice
    const trySpeak = ()=>{
      const voices = synthRef.current.getVoices()
      const zhVoice = voices.find(v=>v.lang.startsWith("zh"))
      if(zhVoice) utt.voice = zhVoice
      utt.onstart = ()=>setSpeaking(true)
      utt.onend   = ()=>{ setSpeaking(false); setMood("idle") }
      utt.onerror = ()=>setSpeaking(false)
      synthRef.current.speak(utt)
    }
    if(synthRef.current.getVoices().length>0) trySpeak()
    else { synthRef.current.addEventListener("voiceschanged", trySpeak, {once:true}); trySpeak() }
  },[])

  // Call AI
  const callAI = useCallback(async (history, isGreeting)=>{
    const lvl = levelRef.current
    const system = `你是专为小朋友设计的AI学习伙伴"星星老师"🌟，语气活泼有趣充满童趣。

学生资料：姓名「${user.name}」，科目「${user.subject||"综合"}」，当前等级${lvl}/10
难度参考：等级1-2超简单，3-4基础，5-6适中，7-8有挑战，9-10专家。

【严格回复格式】（必须遵守）：
第一行：[情绪:开心/思考/激动/鼓励/聆听]
正文：简洁活泼的回复（不超过80字，用emoji增加趣味）
最后一行：[结果:正确/错误/继续]  ← 答对填"正确"，答错填"错误"，一般对话填"继续"

内容要求：
• 根据等级${lvl}严格匹配难度
• 每次回复末尾必须提出问题或挑战，主动引导学生开口回答
• 答对：热情夸奖 + 适当提升难度
• 答错：温和提示，绝不直接给答案，引导学生再想想
• 始终保持鼓励、正向的语气
${isGreeting?`• 这是第一次见面！热情自我介绍，欢迎「${user.name}」，说明你们要一起学${user.subject||"综合"}，然后立刻出一道等级1的超简单题目来开始！`:""}`

    const msgs = isGreeting ? [{role:"user",content:"你好！我来学习了！"}] : history

    // Built-in Anthropic (no key)
    if(config.provider==="anthropic"&&!config.apiKey){
      const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:config.model||"claude-sonnet-4-20250514",max_tokens:450,system,messages:msgs})})
      const d = await r.json(); return d.content?.[0]?.text||""
    }
    // Anthropic with key
    if(config.provider==="anthropic"){
      const r = await fetch(config.baseUrl,{method:"POST",headers:{"Content-Type":"application/json","x-api-key":config.apiKey,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:config.model,max_tokens:450,system,messages:msgs})})
      const d = await r.json(); return d.content?.[0]?.text||""
    }
    // OpenAI-compatible
    const r = await fetch(config.baseUrl,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${config.apiKey}`},body:JSON.stringify({model:config.model,max_tokens:450,messages:[{role:"system",content:system},...msgs]})})
    const d = await r.json(); return d.choices?.[0]?.message?.content||""
  },[config, user])

  // Send message
  const sendMessage = useCallback(async (text, isGreeting=false)=>{
    if(!isGreeting&&(!text||!text.trim())) return
    if(loadRef.current) return
    loadRef.current=true; setLoading(true); setInput("")

    if(!isGreeting&&text){
      const um={role:"user",content:text,isUser:true}
      msgsRef.current=[...msgsRef.current,um]; setMessages([...msgsRef.current])
    }
    setMood("thinking")

    try{
      const history = msgsRef.current.map(m=>({role:m.role,content:m.content}))
      const raw = await callAI(history, isGreeting)

      const moodMatch   = raw.match(/\[情绪[:：](.*?)\]/)
      const resultMatch = raw.match(/\[结果[:：](.*?)\]/)
      const clean = raw.replace(/\[情绪[:：].*?\]/g,"").replace(/\[结果[:：].*?\]/g,"").trim()
      const moodMap = {开心:"happy",思考:"thinking",激动:"excited",鼓励:"encouraging",聆听:"listening"}
      const nm = moodMap[moodMatch?.[1]?.trim()]||"idle"
      const result = resultMatch?.[1]?.trim()

      setMood(nm)
      const am={role:"assistant",content:clean,isUser:false}
      msgsRef.current=[...msgsRef.current,am]; setMessages([...msgsRef.current])
      speak(clean)

      if(result==="正确"){
        const ns=scoreRef.current+20; const nl=Math.min(Math.floor(ns/80)+1,10)
        scoreRef.current=ns; levelRef.current=nl
        setScore(ns); setLevel(nl)
        setShowStars(true); setTimeout(()=>setShowStars(false),1900)
        onUpdateUser({score:ns,level:nl})
      }
    } catch(e){
      const em={role:"assistant",content:"哎呀，网络出了点问题 😅 请检查模型设置后再试试～",isUser:false}
      msgsRef.current=[...msgsRef.current,em]; setMessages([...msgsRef.current])
      setMood("idle")
    }
    loadRef.current=false; setLoading(false)
  },[callAI, speak, onUpdateUser])

  sendRef.current = sendMessage

  const toggleListen = async ()=>{
    try {
      // Check permissions
      const { speechRecognition } = await SpeechRecognition.checkPermissions()
      if (speechRecognition !== "granted") {
        const result = await SpeechRecognition.requestPermissions()
        if (result.speechRecognition !== "granted") {
          return alert("请授权语音权限后重试 🎤")
        }
      }

      if (listening) {
        await SpeechRecognition.stop()
        setListening(false)
      } else {
        await SpeechRecognition.start({
          language: "zh-CN",
          maxResults: 1,
          prompt: "请说话...",
          partialResults: true,
          popup: true,
        })
        setListening(true)
        setMood("listening")
      }
    } catch (e) {
      console.error("Speech error:", e)
      setListening(false)
      alert("语音功能暂时不可用，请使用打字输入 🎤")
    }
  }

  const lc   = LVL_COLORS[Math.min(level-1,9)]
  const lc2  = LVL_COLORS[Math.min(level,9)]
  const prog = ((score%80)/80)*100

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#EBF5FB 0%,#FEF9E7 100%)",overflow:"hidden"}}>
      <G/>
      <StarBurst show={showStars}/>

      {/* ── Header ── */}
      <div style={{background:"white",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 14px rgba(0,0,0,.09)",flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",fontSize:"22px",cursor:"pointer",padding:"4px 6px"}}>←</button>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{fontSize:"26px"}}>{user.avatar}</span>
          <div><div style={{fontWeight:"700",fontSize:"14px",color:"#2d3436"}}>{user.name}</div><div style={{fontSize:"11px",color:"#b2bec3"}}>{user.subject||"综合"}</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"5px",background:lc+"1A",borderRadius:"20px",padding:"5px 13px"}}>
          <span style={{fontSize:"15px"}}>⭐</span>
          <span style={{fontWeight:"800",color:lc,fontSize:"15px"}}>{score}</span>
          <span style={{fontSize:"11px",color:lc,fontWeight:"700",background:lc+"25",borderRadius:"10px",padding:"1px 6px"}}>Lv{level}</span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{height:"5px",background:"#EEF0F5",flexShrink:0}}>
        <div style={{height:"100%",width:`${prog}%`,background:`linear-gradient(90deg,${lc},${lc2})`,transition:"width .7s ease",borderRadius:"0 3px 3px 0"}}/>
      </div>

      {/* ── Mascot area ── */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0 4px",background:"rgba(255,255,255,.42)",flexShrink:0}}>
        <Owl mood={mood} speaking={speaking}/>
        <div style={{height:"24px",display:"flex",alignItems:"center",marginTop:"2px",gap:"8px"}}>
          {speaking  && <VoiceBars active={true} color={lc}/>}
          {listening && <div style={{fontSize:"12px",color:"#fd79a8",fontWeight:"700",animation:"pulse .9s infinite"}}>🎤 正在聆听你...</div>}
          {!speaking && !listening && <div style={{fontSize:"11px",color:"#b2bec3"}}>星星老师在线 ✨</div>}
        </div>
      </div>

      {/* ── Chat ── */}
      <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:"10px"}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.isUser?"flex-end":"flex-start",alignItems:"flex-end",gap:"8px",animation:"slideUp .3s ease-out"}}>
            {!m.isUser && <span style={{fontSize:"22px",flexShrink:0}}>🦉</span>}
            <div style={{maxWidth:"78%",padding:"11px 15px",lineHeight:"1.6",fontSize:"14px",borderRadius:m.isUser?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.isUser?`linear-gradient(135deg,${lc},${lc2})`:"white",color:m.isUser?"white":"#2d3436",boxShadow:m.isUser?`0 4px 16px ${lc}44`:"0 2px 10px rgba(0,0,0,.08)"}}>
              {m.content}
            </div>
            {m.isUser && <span style={{fontSize:"22px",flexShrink:0}}>{user.avatar}</span>}
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <span style={{fontSize:"22px"}}>🦉</span>
            <div style={{background:"white",borderRadius:"18px",padding:"12px 18px",boxShadow:"0 2px 10px rgba(0,0,0,.08)",display:"flex",gap:"6px",alignItems:"center"}}>
              {[0,1,2].map(i=><div key={i} style={{width:"9px",height:"9px",borderRadius:"50%",background:lc,animation:`pulse .75s ease-in-out ${i*.18}s infinite`}}/>)}
            </div>
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div style={{background:"white",padding:"10px 12px 14px",display:"flex",gap:"8px",alignItems:"center",boxShadow:"0 -2px 14px rgba(0,0,0,.08)",flexShrink:0}}>
        <button onClick={toggleListen} className="btn-tap" style={{width:"46px",height:"46px",borderRadius:"50%",border:"none",cursor:"pointer",fontSize:"18px",flexShrink:0,background:listening?"#FF6B6B":lc,color:"white",transition:"all .3s",animation:listening?"pulse .8s infinite":"none",boxShadow:listening?"0 0 0 7px rgba(255,107,107,.22)":`0 3px 12px ${lc}55`}}>🎤</button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage(input)} placeholder="打字回答，或点击🎤说话..."
          style={{flex:1,padding:"11px 16px",borderRadius:"24px",border:"2px solid #eee",outline:"none",fontSize:"14px",fontFamily:"inherit",transition:"border .2s"}}
          onFocus={e=>e.target.style.borderColor=lc} onBlur={e=>e.target.style.borderColor="#eee"}/>
        <button onClick={()=>sendMessage(input)} disabled={!input.trim()||loading} className="btn-tap" style={{width:"46px",height:"46px",borderRadius:"50%",border:"none",cursor:input.trim()?"pointer":"not-allowed",fontSize:"18px",flexShrink:0,background:input.trim()?`linear-gradient(135deg,${lc},${lc2})`:"#eee",color:input.trim()?"white":"#ccc",transition:"all .3s",boxShadow:input.trim()?`0 3px 12px ${lc}55`:"none"}}>▶</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]       = useState("loading")
  const [users, setUsers]         = useState([])
  const [currentUser, setCurrent] = useState(null)
  const [config, setConfig]       = useState({provider:"anthropic",model:"claude-sonnet-4-20250514",apiKey:"",baseUrl:"https://api.anthropic.com/v1/messages"})

  // Load persisted data
  useEffect(()=>{
    const load = async ()=>{
      try{
        const ud = await window.storage.get("slp-v2-users")
        if(ud) setUsers(JSON.parse(ud.value))
        const cd = await window.storage.get("slp-v2-config")
        if(cd) setConfig(JSON.parse(cd.value))
      } catch(e){}
      setScreen("users")
    }; load()
  },[])

  const saveUsers = async u=>{ await window.storage.set("slp-v2-users",JSON.stringify(u)); setUsers(u) }

  const handleNewUser = async data=>{
    const u={id:Date.now().toString(),...data,level:1,score:0,createdAt:new Date().toISOString()}
    const updated=[...users,u]; await saveUsers(updated); setCurrent(u); setScreen("learning")
  }

  const handleUpdateUser = async updates=>{
    const u=users.map(u=>u.id===currentUser.id?{...u,...updates}:u)
    await saveUsers(u); setCurrent(p=>({...p,...updates}))
  }

  const handleSaveConfig = async c=>{
    setConfig(c); await window.storage.set("slp-v2-config",JSON.stringify(c)); setScreen("users")
  }

  // ── Loading ──
  if(screen==="loading") return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#FFEAA7,#74B9FF)"}}>
      <G/><div style={{textAlign:"center"}}><div style={{fontSize:"64px",animation:"spin 2s linear infinite"}}>🌟</div><p style={{color:"white",fontSize:"18px",fontFamily:"'Comic Sans MS',cursive",marginTop:"12px"}}>加载学习星球中...</p></div>
    </div>
  )

  if(screen==="setup")   return <SetupScreen   config={config}  onSave={handleSaveConfig}/>
  if(screen==="newUser") return <NewUserScreen onCreate={handleNewUser} onBack={()=>setScreen("users")}/>
  if(screen==="learning"&&currentUser) return <LearningScreen user={currentUser} config={config} onBack={()=>setScreen("users")} onUpdateUser={handleUpdateUser}/>

  return <UsersScreen users={users} onSelect={u=>{setCurrent(u);setScreen("learning")}} onNew={()=>setScreen("newUser")} onSetup={()=>setScreen("setup")}/>
}
