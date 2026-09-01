import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessageToCoach } from '../services/api';
import { Spinner } from 'react-bootstrap';
import { FaArrowUp, FaPaperclip, FaMicrophone } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Gemini风格的渐变十字星标
const GeminiSparkle = () => (
  <div className="gemini-sparkle-container">
    <div className="gemini-sparkle-inner"></div>
  </div>
);

// 获取评分等级
const getScoreLevel = (score) => {
  const percentage = (score / 40) * 100;
  if (percentage >= 85) return '优秀';
  if (percentage >= 70) return '良好';
  if (percentage >= 55) return '中等';
  if (percentage >= 40) return '发展中';
  return '起步阶段';
};

const MarkdownRenderer = ({ children }) => {
  return (
    <div className="gemini-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                customStyle={{ background: '#0d1117', borderRadius: '12px', margin: '16px 0', fontSize: '13px', border: '1px solid rgba(255,255,255,0.08)' }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code style={{ background: 'rgba(255,255,255,0.1)', padding: '3px 6px', borderRadius: '6px', fontSize: '0.9em', color: '#e2e8f0', fontFamily: 'SFMono-Regular, Consolas, monospace' }} {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p style={{ marginBottom: '1.2rem', lineHeight: '1.7', fontSize: '15px' }}>{children}</p>;
          },
          li({ children }) {
            return <li style={{ marginBottom: '0.5rem', lineHeight: '1.7', fontSize: '15px' }}>{children}</li>;
          },
          ul({ children }) {
            return <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.2rem' }}>{children}</ul>;
          },
          ol({ children }) {
            return <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.2rem' }}>{children}</ol>;
          },
          strong({ children }) {
            return <strong style={{ fontWeight: '600', color: '#fff' }}>{children}</strong>;
          }
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

const CoachChat = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [typingEffect, setTypingEffect] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [fullMessageText, setFullMessageText] = useState('');
  const [chatInitialized, setChatInitialized] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const storedAssessment = localStorage.getItem('assessmentResults');
    if (storedAssessment) {
      try {
        const assessmentData = JSON.parse(storedAssessment);
        setUserProfile(assessmentData);
      } catch (error) {
        console.error('解析评估结果时出错:', error);
      }
    }
  }, []);

  const getCategoryName = (category) => {
    const categoryNames = {
      savings: '储蓄能力', risk: '风险管理', emergency: '应急准备',
      debt: '债务管理', knowledge: '财务知识', income: '收入稳定性',
      goals: '财务目标', tracking: '支出追踪', insurance: '保险保障', pressure: '应对能力'
    };
    return categoryNames[category] || category;
  };

  useEffect(() => {
    if (!chatInitialized) {
      let initialMessage = '你好！我是你的智能金融教练。我会基于你的财务模型，为你解答疑惑并规划未来的配置建议。今天我能为你提供什么帮助？';

      if (userProfile) {
        const { userName, resultMessage, categoryScores, categoryAdvice } = userProfile;
        const name = userName || '您';

        let strengths = [], weaknesses = [];
        Object.entries(categoryScores || {}).forEach(([category, score]) => {
          if (score >= 70) strengths.push(getCategoryName(category));
          else if (score <= 40) weaknesses.push(getCategoryName(category));
        });

        initialMessage = `系统已成功接入**“${resultMessage?.title || '财务成长阶段'}”**档案。\n\n`;
        if (strengths.length > 0) initialMessage += `💡 **强项展现**：你在${strengths.join('、')}方面表现出色。\n`;
        if (weaknesses.length > 0) initialMessage += `🎯 **突破方向**：我们需要在${weaknesses.join('、')}上发力提升。\n\n`;

        initialMessage += `结合大数据与您的画像，我为您定制了以下优先策略：\n`;
        const adviceToShow = categoryAdvice?.slice(0, 2) || ['构建防范风险的流动性蓄水池', '量化收支，制定动态的资产配置计划'];
        initialMessage += adviceToShow.map(advice => `- ${advice}`).join('\n');

        initialMessage += `\n\n您可以随时告诉我任何财务上的想法或疑惑，我将为您深度剖析。`;
      }

      setMessages([{ id: 1, sender: 'ai', text: initialMessage }]);
      setChatInitialized(true);
    }
  }, [chatInitialized, userProfile]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // 首次进入只展示一条系统消息时，暂时不滚动，以保证顶部的 Gemini 巨幕问候语不被挤出视野
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, currentTypingText]);

  useEffect(() => {
    if (typingEffect && fullMessageText) {
      let i = 0;
      // 加快点打字速度，接近大模型真实响应感觉
      const interval = setInterval(() => {
        if (i <= fullMessageText.length) {
          setCurrentTypingText(fullMessageText.substring(0, i));
          i += 2;
        } else {
          clearInterval(interval);
          setTypingEffect(false);
          setMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].sender === 'ai') {
              newMsgs[newMsgs.length - 1].text = fullMessageText;
            }
            return newMsgs;
          });
        }
      }, 10);
      return () => clearInterval(interval);
    }
  }, [typingEffect, fullMessageText]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let contextData = {
        message: input,
        user_id: currentUser?.uid || 'guest',
        chat_history: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      };

      if (userProfile) {
        contextData.assessment_results = userProfile;
      }

      const response = await sendMessageToCoach(contextData);
      setLoading(false);

      if (response && response.reply) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: '' }]);
        setFullMessageText(response.reply);
        setTypingEffect(true);
      }
    } catch (error) {
      setLoading(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: '抱歉，数据链路出现阻塞，请稍后再试。' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="gemini-app-root">

      {/* 极简无边框顶部导航 */}
      <header className="gemini-app-top">
        <div className="gemini-brand-logo">
          财赋思 <GeminiSparkle /> <span>AI 教练</span>
        </div>

        {userProfile && (
          <div className="gemini-header-profile">
            <span>健康度: {userProfile.score}/40</span>
            <span className="gemini-score-badge">{getScoreLevel(userProfile.score)}</span>
          </div>
        )}
      </header>

      {/* 对话主体区 */}
      <main className="gemini-chat-scroll-area">
        <div className="gemini-chat-content">

          {messages.length <= 1 && !loading && (
            <div className="gemini-hero-greeting fade-in">
              <h1 className="gemini-gradient-text">你好，{currentUser?.displayName || '探索者'}</h1>
              <h2 className="gemini-sub-greeting">今天想聊点什么财富话题？</h2>
            </div>
          )}

          <div className="gemini-messages-list">
            {messages.map((message, index) => {
              const isUser = message.sender === 'user';
              const isTyping = !isUser && index === messages.length - 1 && typingEffect;

              return (
                <div key={message.id} className={`gemini-msg-row ${isUser ? 'user' : 'ai'}`}>
                  {!isUser && (
                    <div className="gemini-msg-avatar">
                      <GeminiSparkle />
                    </div>
                  )}

                  <div className={`gemini-msg-content ${isUser ? 'user-bg' : ''}`}>
                    {isTyping ? (
                      <MarkdownRenderer>{currentTypingText}</MarkdownRenderer>
                    ) : (
                      <MarkdownRenderer>{message.text}</MarkdownRenderer>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="gemini-msg-row ai">
                <div className="gemini-msg-avatar">
                  <GeminiSparkle />
                </div>
                <div className="gemini-msg-content">
                  <div className="gemini-loading-dots">
                    <div></div><div></div><div></div>
                  </div>
                </div>
              </div>
            )}

            {/* 留出底部空间给输入框 */}
            <div ref={messagesEndRef} className="gemini-scroll-anchor" />
          </div>

        </div>
      </main>

      {/* 底部浮动输入区 */}
      <div className="gemini-input-dock">
        <div className="gemini-input-container">
          <form className="gemini-input-form" onSubmit={handleSendMessage}>
            <button type="button" className="gemini-icon-btn" title="上传凭据附件 (敬请期待)">
              <FaPaperclip size={18} />
            </button>
            <textarea
              className="gemini-textarea"
              placeholder="输入你的财务情况或咨询投资常识..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            <button type="button" className={`gemini-icon-btn ${input.trim() ? 'hidden' : ''}`} title="语音输入 (敬请期待)">
              <FaMicrophone size={18} />
            </button>
            <button
              aria-label="发送消息"
              className={`gemini-send-btn ${input.trim() ? 'active' : ''}`}
              type="submit"
              disabled={loading || !input.trim()}
            >
              {loading ? <Spinner size="sm" animation="border" variant="dark" /> : <FaArrowUp size={16} />}
            </button>
          </form>
          <div className="gemini-footer-disclaimer">
            财赋思 AI 教练可能会提供不够准确的信息，请独立判断并核实所有的重要财务建议。
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ======= 与全局深度对齐同时吸取 Gemini 风格 ======= */
        .gemini-app-root {
          /* 与 Dashboard / app 保持一致的深邃蓝黑背景 */
          background: linear-gradient(180deg, #0f1724 0%, #1a2744 100%);
          color: #e3e3e3;
          min-height: calc(100vh - 60px);
          width: 100%; /* 针对 Edge 的外层收缩修复 */
          display: flex;
          flex-direction: column;
          font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          position: relative;
        }

        /* 顶部栏 */
        .gemini-app-top {
          height: 64px;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          flex-shrink: 0;
          z-index: 10;
        }
        
        .gemini-brand-logo {
          font-size: 1.25rem;
          font-weight: 500;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gemini-brand-logo span {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1rem;
        }

        .gemini-header-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #94a3b8;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .gemini-score-badge {
          background: rgba(255, 193, 7, 0.15);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.3);
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.8rem;
        }

        /* 主区域 */
        .gemini-chat-scroll-area {
          flex: 1 1 auto; /* 保证它能充分占据剩余空间且正确响应 scroll */
          width: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-behavior: smooth;
          display: flex; /* 让子元素继承全宽 */
          flex-direction: column;
        }

        .gemini-chat-content {
          max-width: 860px;
          width: 100%;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }

        /* 巨型打招呼区 */
        .gemini-hero-greeting {
          padding: 4rem 0 3rem 0;
          margin-bottom: auto;
        }

        .gemini-gradient-text {
          font-size: 3.5rem;
          font-weight: 600;
          letter-spacing: -1.5px;
          margin-bottom: 0.5rem;
          background: linear-gradient(74deg, #4285f4 0, #9b72cb 9%, #d96570 20%, #d96570 24%, #9b72cb 35%, #4285f4 44%, #9b72cb 50%, #d96570 56%, #e3e3e3 75%, #e3e3e3 100%);
          background-size: 400% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 8s ease infinite;
        }

        .gemini-sub-greeting {
          font-size: 3.5rem;
          font-weight: 600;
          letter-spacing: -1.5px;
          color: #475569;
        }
        
        @keyframes gradientShift {
          0% { background-position: 100% 0; }
          50% { background-position: 0 0; }
          100% { background-position: 100% 0; }
        }

        /* 消息列表 */
        .gemini-messages-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-top: 1rem;
        }

        .gemini-msg-row {
          display: flex;
          gap: 1rem;
          width: 100%;
        }

        .gemini-msg-row.user {
          justify-content: flex-end;
          padding-left: 2rem;
        }

        .gemini-msg-row.ai {
          justify-content: flex-start;
          padding-right: 2rem;
        }

        /* 极光形星星 */
        .gemini-sparkle-container {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: floatSparkle 4s ease-in-out infinite;
        }

        .gemini-sparkle-inner {
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #4285f4, #d96570, #ffc107);
          /* 用 clip-path 裁出四角星形状 */
          clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
        }
        
        @keyframes floatSparkle {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-3px) rotate(15deg) scale(1.1); }
        }

        .gemini-msg-avatar {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .gemini-msg-content {
          font-size: 15px;
          line-height: 1.7;
          color: #e3e3e3;
          word-break: break-word;
          width: 100%;
          max-width: 100%;
        }

        /* 用于给用户消息的特别背景，模仿 Gemini 用户灰白色大圆角泡泡 */
        .gemini-msg-content.user-bg {
          background-color: #1e293b;
          color: #f8fafc;
          padding: 0.8rem 1.4rem;
          border-radius: 20px 20px 4px 20px;
          max-width: max-content;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.05);
        }

        /* 底部停靠区域，加了一个透明往下的渐变使得滚动自然被切断 */
        .gemini-input-dock {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(180deg, rgba(15, 23, 36, 0) 0%, rgba(15, 23, 36, 0.8) 30%, rgba(15, 23, 36, 1) 100%);
          padding: 1.5rem 0 1rem 0;
          pointer-events: none; /* 让背景不挡住点击事件 */
        }

        .gemini-input-container {
          max-width: 860px;
          width: 100%;
          margin: 0 auto;
          padding: 0 1.5rem;
          pointer-events: auto; /* 恢复点击 */
        }

        /* 输入框本体 */
        .gemini-input-form {
          background-color: rgba(30, 41, 59, 0.8);
          border-radius: 30px;
          display: flex;
          align-items: flex-end;
          padding: 10px 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        
        .gemini-input-form:focus-within {
          border-color: rgba(66, 133, 244, 0.5);
          box-shadow: 0 8px 32px rgba(66, 133, 244, 0.15);
        }

        .gemini-icon-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background 0.2s, color 0.2s;
        }
        
        .gemini-icon-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #e2e8f0;
        }
        
        .gemini-icon-btn.hidden {
          display: none;
        }

        .gemini-textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: #f8fafc;
          outline: none;
          resize: none;
          min-height: 26px;
          max-height: 200px;
          font-size: 15px;
          line-height: 26px;
          padding: 5px 8px;
          font-family: inherit;
        }
        
        .gemini-textarea::placeholder {
           color: #64748b;
        }

        .gemini-send-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background-color: #334155;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          margin-left: auto;
        }

        .gemini-send-btn.active {
          background-color: #fff;
          color: #000;
        }
        
        .gemini-send-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .gemini-footer-disclaimer {
          text-align: center;
          color: #64748b;
          font-size: 12px;
          margin-top: 14px;
          line-height: 1.4;
        }

        .gemini-scroll-anchor {
          height: 140px; /* 给底部悬浮框留出足够大的余量 */
        }

        /* 加载点集 */
        .gemini-loading-dots {
          display: flex;
          gap: 6px;
          padding: 8px 0;
        }
        
        .gemini-loading-dots div {
          width: 8px;
          height: 8px;
          background-color: #4285f4;
          border-radius: 50%;
          animation: gemini-bounce 1.4s infinite ease-in-out both;
        }
        
        .gemini-loading-dots div:nth-child(1) { animation-delay: -0.32s; background-color: #4285f4; }
        .gemini-loading-dots div:nth-child(2) { animation-delay: -0.16s; background-color: #ea4335; }
        .gemini-loading-dots div:nth-child(3) { background-color: #fbbc05; }
        
        @keyframes gemini-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Webkit原生滚动条美化 */
        .gemini-chat-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .gemini-chat-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .gemini-chat-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }
        .gemini-chat-scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

      `}</style>
    </div>
  );
};

export default CoachChat;