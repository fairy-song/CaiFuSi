import React, { useState } from 'react';
import { FaChartLine, FaCoins } from 'react-icons/fa';
import MarketBanner from './MarketBanner';
import StockSection from './StockSection';
import MetalSection from './MetalSection';
import './market.css';

const TABS = [
    { key: 'stock', label: '热门股票', icon: <FaChartLine /> },
    { key: 'metal', label: '贵金属', icon: <FaCoins /> },
];

const MarketPage = () => {
    const [activeTab, setActiveTab] = useState('stock');

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    return (
        <div className="market-page">
            <MarketBanner />

            <div className="market-content">
                {/* Tab Navigation */}
                <div className="market-tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`market-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="market-animate-in" key={activeTab}>
                    {activeTab === 'stock' && <StockSection />}
                    {activeTab === 'metal' && <MetalSection />}
                </div>

                {/* Footer Info */}
                <div className="market-timestamp">
                    数据更新时间：{timeStr}（模拟数据，仅供展示）
                </div>
                <div className="market-disclaimer">
                    免责声明：以上数据仅供参考，不构成任何投资建议。投资有风险，入市须谨慎。
                </div>
            </div>
        </div>
    );
};

export default MarketPage;
