import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, ProgressBar, Modal, Form, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaChartLine, FaPiggyBank, FaWallet, FaExchangeAlt, FaRobot,
  FaRoute, FaToolbox, FaBookOpen, FaTasks,
  FaCalculator, FaClipboardList, FaBalanceScale, FaBullseye,
  FaStar, FaCheckCircle, FaCommentDots
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

// 增强型徽章组件
const EnhancedBadge = ({ children, bg, className = '' }) => {
  return (
    <Badge
      bg={bg}
      className={`custom-badge px-3 py-2 rounded-pill fw-normal position-relative overflow-hidden ${className}`}
    >
      <span className="badge-content position-relative">{children}</span>
      <span className="badge-glow"></span>
    </Badge>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState(''); // 'savings' or 'budget'
  const [editValue, setEditValue] = useState('');
  const [savingsGoal, setSavingsGoal] = useState(20000);

  // Feature module modal states
  const [activeModal, setActiveModal] = useState(null);
  const [activeToolkit, setActiveToolkit] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);

  // Budget calculator state
  const [calcIncome, setCalcIncome] = useState('8000');
  const [calcRent, setCalcRent] = useState('2000');
  const [calcFood, setCalcFood] = useState('1500');
  const [calcTransport, setCalcTransport] = useState('500');
  const [calcOther, setCalcOther] = useState('1000');

  // Goal planner state
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalMonths, setGoalMonths] = useState('');

  const openFeatureModal = (name) => setActiveModal(name);
  const closeFeatureModal = () => { setActiveModal(null); setActiveToolkit(null); setActiveArticle(null); };

  useEffect(() => {
    // 模拟数据
    const mockUserData = {
      name: currentUser?.displayName || '张小明',
      financialHealth: 75,
      savingsGoalProgress: 65,
      totalSavings: 15000,
      monthlyBudget: 8000,
      monthlySpending: 6500,
      recentTransactions: [
        { id: 1, date: '2023-05-28', category: '餐饮', amount: -150 },
        { id: 2, date: '2023-05-27', category: '交通', amount: -50 },
        { id: 3, date: '2023-05-26', category: '工资', amount: 8000 },
        { id: 4, date: '2023-05-25', category: '购物', amount: -300 },
      ]
    };
    setUserData(mockUserData);
  }, [currentUser]);

  // ==========================================
  // 金融数据脱敏与格式化规范应用 (finance_ui_formatter)
  // ==========================================

  // 1. 姓名脱敏处理
  const formatName = (name) => {
    if (!name) return '用户';
    return name.length > 1 ? name.charAt(0) + '*'.repeat(name.length > 2 ? 2 : 1) : name;
  };

  // 2. 金额格式化（千分位、保留两位小数）
  const formatCurrency = (value) => {
    return `¥${Number(Math.abs(value)).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 3. 交易异动标识（明示正负号、红涨绿跌）
  // 按照 Market 页的约定：上涨为 #cf1322, 下跌为 #3f8600
  const formatTransactionAmount = (amount) => {
    const isPositive = amount > 0;
    const sign = isPositive ? '+' : '-';
    const colorClass = isPositive ? 'market-up' : 'market-down';
    return <span className={`tabular-nums fw-bold ${colorClass}`}>{sign}{formatCurrency(amount)}</span>;
  };

  const handleOpenEdit = (type) => {
    setEditType(type);
    if (type === 'savings') {
      setEditValue(savingsGoal.toString());
    } else if (type === 'budget') {
      setEditValue(userData.monthlyBudget.toString());
    }
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const value = parseFloat(editValue);
    if (isNaN(value) || value <= 0) {
      alert('请输入有效的金额');
      return;
    }

    if (editType === 'savings') {
      setSavingsGoal(value);
      const newProgress = Math.min((userData.totalSavings / value) * 100, 100);
      setUserData({
        ...userData,
        savingsGoalProgress: Math.round(newProgress)
      });
    } else if (editType === 'budget') {
      setUserData({
        ...userData,
        monthlyBudget: value
      });
    }
    setShowEditModal(false);
  };

  if (!userData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#0a0f1e' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="market-dashboard-page">

      <Container className="py-5 position-relative z-1">
        {/* Header Section */}
        <div className="mb-5 animate__animated animate__fadeIn">
          <h1 className="market-banner-title">欢迎, {formatName(userData.name)}</h1>
          <p className="market-banner-subtitle">
            全览财务核心数据，精准把握收支与净值动向。
          </p>
        </div>

        {/* Top Metric Cards */}
        <Row className="g-4 mb-5 animate__animated animate__fadeInUp animate__delay-1s">
          <Col md={4}>
            <div className="market-modern-card h-100">
              <div className="market-card-header">
                <div className="d-flex align-items-center">
                  <FaChartLine className="me-2 text-warning fs-5" />
                  <span className="market-section-title mb-0">财务健康度</span>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-baseline mb-2">
                <span className="market-main-value text-white">{userData.financialHealth}</span>
                <span className="market-label-muted">/ 100</span>
              </div>

              <div className="progress market-progress mb-3">
                <ProgressBar
                  now={userData.financialHealth}
                  variant="warning"
                  className="w-100"
                />
              </div>

              <div className="market-label-muted d-flex justify-content-between">
                <span>综合评估结果计算得出</span>
                <span className="market-badge-inline">良好</span>
              </div>
            </div>
          </Col>

          <Col md={4}>
            <div className="market-modern-card h-100">
              <div className="market-card-header">
                <div className="d-flex align-items-center">
                  <FaPiggyBank className="me-2 text-warning fs-5" />
                  <span className="market-section-title mb-0">储蓄目标</span>
                </div>
                <button
                  className="market-btn-icon"
                  onClick={() => handleOpenEdit('savings')}
                  title="设置储蓄目标"
                >
                  <span className="icon-setting">设置</span>
                </button>
              </div>

              <div className="d-flex flex-column mb-3">
                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="market-label-muted">当前累计</span>
                  <span className="market-main-value text-white tabular-nums">{formatCurrency(userData.totalSavings)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-baseline mt-1">
                  <span className="market-label-muted">目标金额</span>
                  <span className="market-sub-value text-warning tabular-nums">{formatCurrency(savingsGoal)}</span>
                </div>
              </div>

              <div className="progress market-progress mb-2">
                <ProgressBar
                  now={userData.savingsGoalProgress}
                  variant="success"
                  className="w-100 bg-success"
                />
              </div>
              <div className="market-label-muted text-end tabular-nums">进度 {userData.savingsGoalProgress}%</div>
            </div>
          </Col>

          <Col md={4}>
            <div className="market-modern-card h-100">
              <div className="market-card-header">
                <div className="d-flex align-items-center">
                  <FaWallet className="me-2 text-warning fs-5" />
                  <span className="market-section-title mb-0">本月预算</span>
                </div>
                <button
                  className="market-btn-icon"
                  onClick={() => handleOpenEdit('budget')}
                  title="编辑本月预算"
                >
                  <span className="icon-setting">设置</span>
                </button>
              </div>

              <div className="mb-4">
                <div className="market-label-muted mb-1">剩余可用额度</div>
                <div className="market-main-value text-white tabular-nums">
                  {formatCurrency(userData.monthlyBudget - userData.monthlySpending)}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-end mb-2 pt-2 border-top border-light-alpha">
                <div className="d-flex flex-column">
                  <span className="market-label-muted mb-1">总预算</span>
                  <span className="market-sub-value tabular-nums">{formatCurrency(userData.monthlyBudget)}</span>
                </div>
                <div className="d-flex flex-column text-end">
                  <span className="market-label-muted mb-1">已支出</span>
                  <span className="market-sub-value tabular-nums">{formatCurrency(userData.monthlySpending)}</span>
                </div>
              </div>
              <div className="progress market-progress mt-2" style={{ height: '4px' }}>
                <ProgressBar
                  now={(userData.monthlySpending / userData.monthlyBudget) * 100}
                  variant="warning"
                  className="w-100"
                />
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mb-5 animate__animated animate__fadeInUp animate__delay-2s">
          <Col md={12}>
            <div className="market-table-container">
              <div className="market-table-header px-4 py-3 d-flex justify-content-between align-items-center border-bottom border-light-alpha">
                <div className="d-flex align-items-center">
                  <FaExchangeAlt className="me-2 text-warning" />
                  <span className="market-section-title mb-0">最近交易记录</span>
                </div>
                <button className="market-btn-outline">全文查看</button>
              </div>

              <div className="table-responsive">
                <table className="market-data-table w-100">
                  <thead>
                    <tr>
                      <th className="ps-4">交易日期</th>
                      <th>交易类别</th>
                      <th className="pe-4 text-end">交易金额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.recentTransactions.map((transaction, index) => (
                      <tr key={transaction.id}>
                        <td className="ps-4 text-white font-monospace">{transaction.date}</td>
                        <td>
                          <span className="market-category-tag">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          {formatTransactionAmount(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Col>
        </Row>

        {/* ====== Four Core Feature Modules ====== */}
        <Row className="g-4 mb-5 animate__animated animate__fadeInUp animate__delay-2s">
          {/* Module 1: Personalized Growth Path */}
          <Col md={6}>
            <div className="market-modern-card h-100" style={{ cursor: 'pointer' }} onClick={() => openFeatureModal('growth')}>
              <div className="market-card-header">
                <div className="d-flex align-items-center">
                  <FaRoute className="me-2 text-warning fs-5" />
                  <span className="market-section-title mb-0">个性化成长路径模块</span>
                </div>
                <span className="market-badge-inline">Lv.3 进阶</span>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="market-label-muted">当前阶段</span>
                  <span className="text-white fw-bold" style={{ fontSize: '0.95rem' }}>财务规划进阶</span>
                </div>
                <div className="progress market-progress mb-3">
                  <ProgressBar now={62} variant="info" className="w-100" />
                </div>
                <div className="d-flex justify-content-between">
                  <span className="market-label-muted" style={{ fontSize: '0.75rem' }}>阶段进度 62%</span>
                  <span className="market-label-muted" style={{ fontSize: '0.75rem' }}>下一阶段: 投资策略</span>
                </div>
              </div>

              <div className="growth-milestones pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="d-flex align-items-center mb-2">
                  <FaStar className="text-warning me-2" style={{ fontSize: '0.8rem' }} />
                  <span className="text-white" style={{ fontSize: '0.85rem' }}>已解锁: 基础储蓄 → 预算管理 → 财务规划</span>
                </div>
                <div className="d-flex align-items-center">
                  <FaBullseye className="me-2" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }} />
                  <span className="market-label-muted" style={{ fontSize: '0.85rem' }}>下一目标: 掌握基金定投策略</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Module 2: Financial Mental Toolkit */}
          <Col md={6}>
            <div className="market-modern-card h-100">
              <div className="market-card-header">
                <div className="d-flex align-items-center">
                  <FaToolbox className="me-2 text-warning fs-5" />
                  <span className="market-section-title mb-0">金融心智工具箱</span>
                </div>
                <span className="market-badge-inline">4 个工具</span>
              </div>

              <Row className="g-3">
                {[
                  { icon: <FaCalculator />, name: '预算计算器', desc: '智能规划收支' },
                  { icon: <FaClipboardList />, name: '记账助手', desc: '轻松记录日常' },
                  { icon: <FaBalanceScale />, name: '风险评估', desc: '量化投资风险' },
                  { icon: <FaBullseye />, name: '目标规划', desc: '设定财务目标' },
                ].map((tool, idx) => (
                  <Col xs={6} key={idx}>
                    <div className="toolkit-item text-center p-3 rounded-3" style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                      onClick={() => { setActiveToolkit(tool.name); openFeatureModal('toolkit'); }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,193,7,0.3)';
                        e.currentTarget.style.background = 'rgba(255,193,7,0.06)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                    >
                      <div className="text-warning mb-2 fs-5">{tool.icon}</div>
                      <div className="text-white fw-bold" style={{ fontSize: '0.85rem' }}>{tool.name}</div>
                      <div className="market-label-muted" style={{ fontSize: '0.75rem' }}>{tool.desc}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>

          {/* Module 3: Knowledge Base & Case Studies */}
          <Col md={6}>
            <div className="market-modern-card h-100">
              <div className="market-card-header">
                <div className="d-flex align-items-center">
                  <FaBookOpen className="me-2 text-warning fs-5" />
                  <span className="market-section-title mb-0">知识库与案例学习模块</span>
                </div>
                <button className="market-btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }} onClick={() => openFeatureModal('knowledge')}>查看全部</button>
              </div>

              <div className="knowledge-list">
                {[
                  { tag: '入门', title: '理解复利：让时间为你赚钱', reads: '2.3k 阅读' },
                  { tag: '案例', title: '小白到进阶：一位上班族的基金定投之路', reads: '1.8k 阅读' },
                  { tag: '进阶', title: '资产配置策略：鸡蛋不放在一个篮子里', reads: '3.1k 阅读' },
                ].map((article, idx) => (
                  <div key={idx} className="knowledge-item d-flex align-items-center py-3" style={{
                    borderBottom: idx < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                    onClick={() => { setActiveArticle(article); openFeatureModal('knowledge'); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="market-badge-inline me-3" style={{
                      minWidth: '40px',
                      textAlign: 'center',
                      fontSize: '0.7rem',
                      background: article.tag === '案例' ? 'rgba(23,162,184,0.15)' : article.tag === '进阶' ? 'rgba(40,167,69,0.15)' : 'rgba(255,193,7,0.1)',
                      color: article.tag === '案例' ? '#17a2b8' : article.tag === '进阶' ? '#28a745' : '#ffc107',
                    }}>{article.tag}</span>
                    <div className="flex-grow-1">
                      <div className="text-white" style={{ fontSize: '0.9rem' }}>{article.title}</div>
                    </div>
                    <span className="market-label-muted ms-2" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{article.reads}</span>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* Module 4: Progress Tracking & Feedback */}
          <Col md={6}>
            <div className="market-modern-card h-100" style={{ cursor: 'pointer' }} onClick={() => openFeatureModal('progress')}>
              <div className="market-card-header">
                <div className="d-flex align-items-center">
                  <FaTasks className="me-2 text-warning fs-5" />
                  <span className="market-section-title mb-0">进度追踪与反馈模块</span>
                </div>
              </div>

              <Row className="g-3 mb-3">
                {[
                  { label: '已完成课程', value: '12', icon: <FaCheckCircle className="text-success" /> },
                  { label: '学习天数', value: '45', icon: <FaStar className="text-warning" /> },
                  { label: '评估次数', value: '6', icon: <FaChartLine className="text-info" /> },
                ].map((stat, idx) => (
                  <Col xs={4} key={idx} className="text-center">
                    <div className="p-2 rounded-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="mb-1">{stat.icon}</div>
                      <div className="text-white fw-bold fs-5">{stat.value}</div>
                      <div className="market-label-muted" style={{ fontSize: '0.7rem' }}>{stat.label}</div>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="d-flex align-items-start">
                  <FaCommentDots className="text-info me-2 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white fw-bold mb-1" style={{ fontSize: '0.9rem' }}>最新 AI 教练反馈</div>
                    <p className="market-label-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                      您本周的储蓄习惯有明显改善，建议下一步尝试了解指数基金的运作机制，逐步建立长期投资信心。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center animate__animated animate__fadeInUp animate__delay-3s">
          <Col md={10} lg={8}>
            <div className="market-modern-card text-center py-5 recommendation-card">
              <div className="mb-4">
                <FaRobot className="text-warning fs-1" />
              </div>
              <h3 className="mb-3 text-white fw-bold">智能财务分析</h3>
              <p className="mb-4 market-label-muted fs-6 px-lg-5">
                想要深入了解您的资金健康度？我们的 AI 金融教练能够根据长线数据趋势，洞察您的消费与储蓄节奏，提供专业的定制建议。
              </p>
              <Link
                to="/coach"
                className="market-btn-primary px-5 py-3 rounded-3 fw-bold text-decoration-none d-inline-block"
              >
                启动 AI 教练 <FaRobot className="ms-2" />
              </Link>
            </div>
          </Col>
        </Row>

        {/* Footer Info matched with Market */}
        <div className="market-timestamp mt-5">
          最近同步时间：{new Date().toLocaleString('zh-CN', { hour12: false })}（数据来源于模拟结算系统）
        </div>
      </Container>

      {/* 依照 Market 的极简交易终端设计理念 */}
      <style jsx>{`
        .market-dashboard-page {
          min-height: calc(100vh - 170px);
          background: linear-gradient(180deg, #0f1724 0%, #1a2744 100%);
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .market-banner-title {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .market-banner-subtitle {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .market-section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
        }

        /* 统一的半透明玻璃卡片 */
        .market-modern-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .market-modern-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 193, 7, 0.3);
        }

        .market-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .market-main-value {
          font-size: 2rem;
          font-weight: 700;
        }

        .market-sub-value {
          font-size: 1rem;
          font-weight: 600;
        }

        .market-label-muted {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .border-light-alpha {
          border-color: rgba(255, 255, 255, 0.08) !important;
        }

        .tabular-nums {
          font-variant-numeric: tabular-nums;
          font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }

        /* 颜色标识与 Market 完全对齐 */
        .market-up { color: #cf1322; }
        .market-down { color: #3f8600; }

        /* 按钮与表单控件 */
        .market-btn-icon {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .market-btn-icon:hover { color: #ffc107; }

        .market-btn-outline {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
          padding: 0.4rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .market-btn-outline:hover {
          border-color: #ffc107;
          color: #ffc107;
          background: rgba(255, 193, 7, 0.05);
        }

        .market-btn-primary {
          background: #ffc107;
          color: #0f1724;
          border: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .market-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
          color: #0f1724;
        }

        /* 进度条定制 */
        .market-progress {
          height: 6px;
          background-color: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;
        }

        .market-badge-inline {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* 交易表格按 Market Stock Table 样式 */
        .market-table-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          overflow: hidden;
          transition: border-color 0.3s ease;
        }
        .market-table-container:hover {
           border-color: rgba(255, 193, 7, 0.2);
        }

        .market-data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .market-data-table thead th {
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          font-weight: 500;
          text-align: left;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .market-data-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: background 0.2s;
        }

        .market-data-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .market-data-table tbody td {
          padding: 1rem 0;
          color: rgba(255, 255, 255, 0.85);
        }

        .market-data-table tbody tr:last-child {
          border-bottom: none;
        }

        .market-category-tag {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
        }

        /* 页脚文字 */
        .market-timestamp {
          text-align: center;
          color: rgba(255, 255, 255, 0.35);
          font-size: 0.8rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .recommendation-card {
           background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
           border-top: 1px solid rgba(255, 193, 7, 0.2);
        }
      `}</style>

      {/* 行内暗色模态宽对话框配置 */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered contentClassName="bg-dark text-white border-secondary">
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title className="fw-bold" style={{ fontSize: '1.25rem' }}>
            {editType === 'savings' ? '设置储蓄目标' : '设置本月预算'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label className="market-label-muted">
                {editType === 'savings' ? '计划金额 (¥)' : '可用额度 (¥)'}
              </Form.Label>
              <Form.Control
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="请输入金额"
                min="0"
                step="100"
                style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
              />
              <Form.Text className="market-label-muted mt-2 d-block">
                {editType === 'savings'
                  ? `当前已累计: ${formatCurrency(userData?.totalSavings)}`
                  : `当前已支出: ${formatCurrency(userData?.monthlySpending)}`
                }
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="link" onClick={() => setShowEditModal(false)} className="text-white text-decoration-none border-0">
            取消
          </Button>
          <Button onClick={handleSaveEdit} className="market-btn-primary fw-bold border-0 px-4 py-2">
            确认修改
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ========== Growth Path Modal ========== */}
      <Modal show={activeModal === 'growth'} onHide={closeFeatureModal} centered size="lg" contentClassName="bg-dark text-white border-secondary">
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title className="fw-bold"><FaRoute className="me-2 text-warning" />个性化成长路径</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-white fw-bold">当前等级: Lv.3 进阶学习者</span>
              <span style={{ color: '#ffc107', fontSize: '0.85rem' }}>经验值: 1240 / 2000</span>
            </div>
            <ProgressBar now={62} variant="info" style={{ height: '8px', background: 'rgba(255,255,255,0.08)' }} />
          </div>
          <h6 className="text-warning mb-3">学习路线图</h6>
          {[
            { stage: 'Lv.1 入门', title: '基础储蓄', status: 'done', desc: '学习储蓄的基本概念和紧急备用金的建立方法' },
            { stage: 'Lv.2 基础', title: '预算管理', status: 'done', desc: '掌握50/30/20法则，建立科学的预算分配体系' },
            { stage: 'Lv.3 进阶', title: '财务规划', status: 'current', desc: '学习长期财务规划、保险配置和税务优化基础' },
            { stage: 'Lv.4 高级', title: '投资策略', status: 'locked', desc: '了解指数基金、债券和资产配置的核心策略' },
            { stage: 'Lv.5 专家', title: '财务自由', status: 'locked', desc: '构建被动收入体系，实现长期财务自由目标' },
          ].map((item, idx) => (
            <div key={idx} className="d-flex align-items-start mb-3 p-3 rounded-3" style={{
              background: item.status === 'current' ? 'rgba(23,162,184,0.12)' : 'rgba(255,255,255,0.03)',
              border: item.status === 'current' ? '1px solid rgba(23,162,184,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}>
              <div className="me-3 mt-1">
                {item.status === 'done' && <FaCheckCircle className="text-success" />}
                {item.status === 'current' && <FaStar className="text-info" />}
                {item.status === 'locked' && <span style={{ color: 'rgba(255,255,255,0.3)' }}>🔒</span>}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <span className="text-white fw-bold" style={{ fontSize: '0.95rem' }}>{item.stage} — {item.title}</span>
                  <span style={{ fontSize: '0.75rem', color: item.status === 'done' ? '#28a745' : item.status === 'current' ? '#17a2b8' : 'rgba(255,255,255,0.3)' }}>
                    {item.status === 'done' ? '✓ 已完成' : item.status === 'current' ? '学习中...' : '待解锁'}
                  </span>
                </div>
                <p className="mb-0 mt-1" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button onClick={closeFeatureModal} className="market-btn-primary fw-bold border-0 px-4 py-2">继续学习当前阶段</Button>
        </Modal.Footer>
      </Modal>

      {/* ========== Toolkit Modal ========== */}
      <Modal show={activeModal === 'toolkit'} onHide={closeFeatureModal} centered size="lg" contentClassName="bg-dark text-white border-secondary">
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title className="fw-bold">
            <FaToolbox className="me-2 text-warning" />
            {activeToolkit || '金融心智工具箱'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(activeToolkit === '预算计算器' || !activeToolkit) && (
            <div className={activeToolkit ? '' : 'mb-4'}>
              {!activeToolkit && <h6 className="text-warning mb-3"><FaCalculator className="me-2" />预算计算器</h6>}
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>月收入 (¥)</Form.Label>
                  <Form.Control type="number" value={calcIncome} onChange={e => setCalcIncome(e.target.value)}
                    style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                </Col>
                <Col md={6}>
                  <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>房租/房贷 (¥)</Form.Label>
                  <Form.Control type="number" value={calcRent} onChange={e => setCalcRent(e.target.value)}
                    style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                </Col>
                <Col md={4}>
                  <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>餐饮 (¥)</Form.Label>
                  <Form.Control type="number" value={calcFood} onChange={e => setCalcFood(e.target.value)}
                    style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                </Col>
                <Col md={4}>
                  <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>交通 (¥)</Form.Label>
                  <Form.Control type="number" value={calcTransport} onChange={e => setCalcTransport(e.target.value)}
                    style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                </Col>
                <Col md={4}>
                  <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>其他 (¥)</Form.Label>
                  <Form.Control type="number" value={calcOther} onChange={e => setCalcOther(e.target.value)}
                    style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                </Col>
              </Row>
              <div className="p-3 rounded-3" style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.2)' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white">总支出</span>
                  <span className="text-warning fw-bold tabular-nums">¥{(parseFloat(calcRent || 0) + parseFloat(calcFood || 0) + parseFloat(calcTransport || 0) + parseFloat(calcOther || 0)).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white">每月可储蓄</span>
                  <span className="fw-bold tabular-nums" style={{ color: (parseFloat(calcIncome || 0) - parseFloat(calcRent || 0) - parseFloat(calcFood || 0) - parseFloat(calcTransport || 0) - parseFloat(calcOther || 0)) >= 0 ? '#28a745' : '#cf1322' }}>
                    ¥{(parseFloat(calcIncome || 0) - parseFloat(calcRent || 0) - parseFloat(calcFood || 0) - parseFloat(calcTransport || 0) - parseFloat(calcOther || 0)).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-white">储蓄率</span>
                  <span className="text-info fw-bold">{parseFloat(calcIncome) > 0 ? (((parseFloat(calcIncome) - parseFloat(calcRent || 0) - parseFloat(calcFood || 0) - parseFloat(calcTransport || 0) - parseFloat(calcOther || 0)) / parseFloat(calcIncome)) * 100).toFixed(1) : '0.0'}%</span>
                </div>
              </div>
            </div>
          )}
          {(activeToolkit === '记账助手' || !activeToolkit) && (
            <div className={activeToolkit ? '' : 'mb-4'}>
              {!activeToolkit && <h6 className="text-warning mb-3 mt-4"><FaClipboardList className="me-2" />记账助手</h6>}
              <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>选择类别</Form.Label>
                  <Form.Select style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <option>餐饮</option><option>交通</option><option>购物</option><option>娱乐</option><option>医疗</option><option>教育</option>
                  </Form.Select>
                </Form.Group>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>金额 (¥)</Form.Label>
                    <Form.Control type="number" placeholder="输入金额" style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>日期</Form.Label>
                    <Form.Control type="date" defaultValue={new Date().toISOString().split('T')[0]} style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                  </Col>
                </Row>
                <Form.Group className="mt-3">
                  <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>备注</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="可选备注..." style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                </Form.Group>
                <Button className="market-btn-primary fw-bold border-0 px-4 py-2 mt-3 w-100">添加记录</Button>
              </div>
            </div>
          )}
          {(activeToolkit === '风险评估' || !activeToolkit) && (
            <div className={activeToolkit ? '' : 'mb-4'}>
              {!activeToolkit && <h6 className="text-warning mb-3 mt-4"><FaBalanceScale className="me-2" />风险评估</h6>}
              <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { q: '您的投资经验', a: ['无经验', '1-3年', '3-5年', '5年以上'] },
                  { q: '您能承受的最大亏损', a: ['5%以内', '10%以内', '20%以内', '30%以上'] },
                  { q: '投资目标期限', a: ['1年内', '1-3年', '3-5年', '5年以上'] },
                ].map((item, idx) => (
                  <Form.Group key={idx} className="mb-3">
                    <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>{idx + 1}. {item.q}</Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                      {item.a.map((opt, i) => (
                        <Button key={i} variant="outline-secondary" size="sm" className="text-white"
                          style={{ borderColor: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}
                          onClick={e => {
                            e.currentTarget.parentElement.querySelectorAll('button').forEach(b => { b.style.borderColor = 'rgba(255,255,255,0.2)'; b.style.background = 'transparent'; });
                            e.currentTarget.style.borderColor = '#ffc107'; e.currentTarget.style.background = 'rgba(255,193,7,0.15)';
                          }}
                        >{opt}</Button>
                      ))}
                    </div>
                  </Form.Group>
                ))}
                <Button className="market-btn-primary fw-bold border-0 px-4 py-2 w-100">生成风险评估报告</Button>
              </div>
            </div>
          )}
          {(activeToolkit === '目标规划' || !activeToolkit) && (
            <div>
              {!activeToolkit && <h6 className="text-warning mb-3 mt-4"><FaBullseye className="me-2" />目标规划</h6>}
              <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Row className="g-3 mb-3">
                  <Col md={12}>
                    <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>目标名称</Form.Label>
                    <Form.Control placeholder="例如: 旅行基金、应急储备" value={goalName} onChange={e => setGoalName(e.target.value)}
                      style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>目标金额 (¥)</Form.Label>
                    <Form.Control type="number" placeholder="50000" value={goalAmount} onChange={e => setGoalAmount(e.target.value)}
                      style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="text-white" style={{ fontSize: '0.85rem' }}>计划月数</Form.Label>
                    <Form.Control type="number" placeholder="12" value={goalMonths} onChange={e => setGoalMonths(e.target.value)}
                      style={{ background: '#1a2744', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} />
                  </Col>
                </Row>
                {goalAmount && goalMonths && parseFloat(goalMonths) > 0 && (
                  <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(23,162,184,0.1)', border: '1px solid rgba(23,162,184,0.2)' }}>
                    <div className="text-white mb-1" style={{ fontSize: '0.9rem' }}>规划建议</div>
                    <div className="text-info fw-bold" style={{ fontSize: '1.1rem' }}>每月需储蓄 ¥{(parseFloat(goalAmount) / parseFloat(goalMonths)).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }} className="mt-1">预计 {goalMonths} 个月后达成{goalName ? ` "${goalName}"` : ''}目标</div>
                  </div>
                )}
                <Button className="market-btn-primary fw-bold border-0 px-4 py-2 w-100">保存目标计划</Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* ========== Knowledge Base Modal ========== */}
      <Modal show={activeModal === 'knowledge'} onHide={closeFeatureModal} centered size="lg" contentClassName="bg-dark text-white border-secondary">
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title className="fw-bold"><FaBookOpen className="me-2 text-warning" />{activeArticle ? activeArticle.title : '知识库与案例学习'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {activeArticle ? (
            <div>
              <div className="d-flex align-items-center mb-3">
                <span className="market-badge-inline me-2" style={{
                  background: activeArticle.tag === '案例' ? 'rgba(23,162,184,0.15)' : activeArticle.tag === '进阶' ? 'rgba(40,167,69,0.15)' : 'rgba(255,193,7,0.1)',
                  color: activeArticle.tag === '案例' ? '#17a2b8' : activeArticle.tag === '进阶' ? '#28a745' : '#ffc107',
                }}>{activeArticle.tag}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{activeArticle.reads}</span>
              </div>
              {activeArticle.title === '理解复利：让时间为你赚钱' && (
                <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', fontSize: '0.95rem' }}>
                  <p>复利被爱因斯坦称为"世界第八大奇迹"。简单来说，复利就是<strong className="text-warning">利息产生利息</strong>的效应。</p>
                  <h6 className="text-info mt-4 mb-2">复利计算公式</h6>
                  <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', textAlign: 'center', fontSize: '1.1rem' }}>A = P * (1 + r)^n</div>
                  <p>其中 P=本金, r=年利率, n=年数, A=终值</p>
                  <h6 className="text-info mt-4 mb-2">实际案例</h6>
                  <p>假设每月定投 ¥1,000，年化收益 8%：</p>
                  <ul>
                    <li>10年后: 约 ¥<strong>182,946</strong>（投入 ¥120,000）</li>
                    <li>20年后: 约 ¥<strong>589,020</strong>（投入 ¥240,000）</li>
                    <li>30年后: 约 ¥<strong>1,500,295</strong>（投入 ¥360,000）</li>
                  </ul>
                  <p className="text-warning">关键启示：时间是复利最大的盟友，越早开始越好！</p>
                </div>
              )}
              {activeArticle.title === '小白到进阶：一位上班族的基金定投之路' && (
                <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', fontSize: '0.95rem' }}>
                  <p>小王，28岁，月薪 ¥12,000。2022年开始基金定投之旅。</p>
                  <h6 className="text-info mt-3 mb-2">第一阶段：试水期 (前3个月)</h6>
                  <p>选择两只宽基指数基金（沪深300+中证500），每月各投 ¥500。总投入 ¥3,000。</p>
                  <h6 className="text-info mt-3 mb-2">第二阶段：加仓期 (4-12个月)</h6>
                  <p>市场下跌时坚持定投，甚至加码至每月 ¥1,500。这期间经历了心理考验——账面浮亏最高达 -12%。</p>
                  <h6 className="text-info mt-3 mb-2">第三阶段：收获期 (第二年)</h6>
                  <p>市场回暖后，总收益率达到 +18.6%，远超银行定期存款。关键经验：</p>
                  <ul>
                    <li>定投纪律 &gt; 择时能力</li>
                    <li>亏损时加码是最难也最有效的策略</li>
                    <li>选择低费率的指数基金比主动基金更稳健</li>
                  </ul>
                </div>
              )}
              {activeArticle.title === '资产配置策略：鸡蛋不放在一个篮子里' && (
                <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', fontSize: '0.95rem' }}>
                  <p>资产配置是投资理财的核心原则，其本质是<strong className="text-warning">通过分散投资来降低整体风险</strong>。</p>
                  <h6 className="text-info mt-3 mb-2">经典的资产配置模型</h6>
                  <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="d-flex justify-content-between mb-2"><span>股票/股票基金</span><span className="fw-bold">40-60%</span></div>
                    <ProgressBar now={50} variant="warning" style={{ height: '6px', background: 'rgba(255,255,255,0.08)' }} className="mb-3" />
                    <div className="d-flex justify-content-between mb-2"><span>债券/债券基金</span><span className="fw-bold">20-30%</span></div>
                    <ProgressBar now={25} variant="info" style={{ height: '6px', background: 'rgba(255,255,255,0.08)' }} className="mb-3" />
                    <div className="d-flex justify-content-between mb-2"><span>现金/货币基金</span><span className="fw-bold">10-20%</span></div>
                    <ProgressBar now={15} variant="success" style={{ height: '6px', background: 'rgba(255,255,255,0.08)' }} className="mb-3" />
                    <div className="d-flex justify-content-between mb-2"><span>其他 (黄金/REITs)</span><span className="fw-bold">5-10%</span></div>
                    <ProgressBar now={10} style={{ height: '6px', background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                  <p className="text-warning">关键原则：根据年龄和风险承受能力调整比例。年龄越大，债券比例应越高。</p>
                </div>
              )}
              <Button variant="outline-secondary" onClick={() => setActiveArticle(null)} className="mt-3 text-white" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                ← 返回文章列表
              </Button>
            </div>
          ) : (
            <div>
              {[
                { tag: '入门', title: '理解复利：让时间为你赚钱', reads: '2.3k 阅读' },
                { tag: '案例', title: '小白到进阶：一位上班族的基金定投之路', reads: '1.8k 阅读' },
                { tag: '进阶', title: '资产配置策略：鸡蛋不放在一个篮子里', reads: '3.1k 阅读' },
                { tag: '入门', title: '信用卡使用的5大黄金法则', reads: '1.5k 阅读' },
                { tag: '案例', title: '从负债到净资产50万：一个真实的财务逆袭故事', reads: '4.2k 阅读' },
                { tag: '进阶', title: '如何通过税务优化合法节税', reads: '2.7k 阅读' },
              ].map((article, idx) => (
                <div key={idx} className="d-flex align-items-center p-3 rounded-3 mb-2" style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onClick={() => setActiveArticle(article)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,193,7,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <span className="market-badge-inline me-3" style={{
                    minWidth: '40px', textAlign: 'center', fontSize: '0.7rem',
                    background: article.tag === '案例' ? 'rgba(23,162,184,0.15)' : article.tag === '进阶' ? 'rgba(40,167,69,0.15)' : 'rgba(255,193,7,0.1)',
                    color: article.tag === '案例' ? '#17a2b8' : article.tag === '进阶' ? '#28a745' : '#ffc107',
                  }}>{article.tag}</span>
                  <div className="flex-grow-1 text-white" style={{ fontSize: '0.9rem' }}>{article.title}</div>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{article.reads}</span>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* ========== Progress Tracking Modal ========== */}
      <Modal show={activeModal === 'progress'} onHide={closeFeatureModal} centered size="lg" contentClassName="bg-dark text-white border-secondary">
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title className="fw-bold"><FaTasks className="me-2 text-warning" />进度追踪与反馈</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3 mb-4">
            {[
              { label: '已完成课程', value: '12', icon: <FaCheckCircle className="text-success" /> },
              { label: '学习天数', value: '45', icon: <FaStar className="text-warning" /> },
              { label: '评估次数', value: '6', icon: <FaChartLine className="text-info" /> },
              { label: '知识掌握度', value: '72%', icon: <FaBookOpen className="text-primary" /> },
            ].map((stat, idx) => (
              <Col xs={6} md={3} key={idx} className="text-center">
                <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="mb-2">{stat.icon}</div>
                  <div className="text-white fw-bold" style={{ fontSize: '1.5rem' }}>{stat.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>
          <h6 className="text-warning mb-3">学习历程</h6>
          {[
            { date: '2026-04-07', action: '完成课程「预算管理基础」', type: 'course' },
            { date: '2026-04-05', action: '通过心智评估测试 (得分: 82/100)', type: 'assessment' },
            { date: '2026-04-03', action: '阅读文章「理解复利」', type: 'article' },
            { date: '2026-04-01', action: '完成课程「储蓄目标设定」', type: 'course' },
            { date: '2026-03-28', action: '首次使用预算计算器', type: 'tool' },
            { date: '2026-03-25', action: '通过心智评估测试 (得分: 68/100)', type: 'assessment' },
          ].map((item, idx) => (
            <div key={idx} className="d-flex align-items-center py-2 px-3 mb-1 rounded-2" style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', minWidth: '90px', fontFamily: 'monospace' }}>{item.date}</span>
              <span className="me-2">
                {item.type === 'course' ? '📚' : item.type === 'assessment' ? '📝' : item.type === 'article' ? '📖' : '🔧'}
              </span>
              <span className="text-white" style={{ fontSize: '0.9rem' }}>{item.action}</span>
            </div>
          ))}
          <h6 className="text-warning mb-3 mt-4">AI 教练反馈记录</h6>
          {[
            { date: '04-07', msg: '您本周的储蓄习惯有明显改善，建议下一步尝试了解指数基金的运作机制，逐步建立长期投资信心。' },
            { date: '04-01', msg: '预算执行率达到 87%，表现优秀！建议将剩余预算的一部分用于建立紧急备用金，目标 3-6 个月生活费。' },
            { date: '03-25', msg: '首次评估显示您在风险意识方面得分较高，但在主动储蓄方面还有提升空间。建议先从自动转账开始养成习惯。' },
          ].map((fb, idx) => (
            <div key={idx} className="d-flex align-items-start p-3 mb-2 rounded-3" style={{ background: 'rgba(23,162,184,0.06)', border: '1px solid rgba(23,162,184,0.12)' }}>
              <FaCommentDots className="text-info me-2 mt-1 flex-shrink-0" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{fb.date}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>{fb.msg}</div>
              </div>
            </div>
          ))}
        </Modal.Body>
      </Modal>
    </div >
  );
};

export default Dashboard;