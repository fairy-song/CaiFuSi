import React from 'react';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';
import { preciousMetals } from './mockData';

const MetalSection = () => {
    return (
        <div>
            <div className="market-section-title">贵金属实时行情</div>
            <div className="market-metal-grid">
                {preciousMetals.map((metal, idx) => {
                    const isUp = metal.change > 0;
                    const sign = isUp ? '+' : '';
                    const dirClass = isUp ? 'up' : 'down';
                    const priceClass = isUp ? 'price-up' : 'price-down';

                    return (
                        <div
                            key={metal.symbol}
                            className={`market-metal-card ${dirClass} market-animate-in`}
                            style={{ animationDelay: `${idx * 0.08}s` }}
                        >
                            {/* Header */}
                            <div className="market-metal-header">
                                <div>
                                    <div className="market-metal-name">{metal.name}</div>
                                    <div className="market-metal-name-en">{metal.nameEn}</div>
                                </div>
                                <span className="market-metal-symbol">{metal.symbol}</span>
                            </div>

                            {/* Price */}
                            <div className={`market-metal-price ${priceClass}`}>
                                {metal.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="market-metal-unit">{metal.unit}</div>

                            {/* Change Badge */}
                            <div className={`market-metal-change ${dirClass}`}>
                                {isUp ? <FaCaretUp /> : <FaCaretDown />}
                                {sign}{metal.change.toFixed(2)} ({sign}{metal.changePercent.toFixed(2)}%)
                            </div>

                            {/* Detail Grid */}
                            <div className="market-metal-details">
                                <div className="market-metal-detail-item">
                                    <span className="market-metal-detail-label">今开</span>
                                    <span className="market-metal-detail-value">
                                        {metal.open.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="market-metal-detail-item">
                                    <span className="market-metal-detail-label">昨收</span>
                                    <span className="market-metal-detail-value">
                                        {metal.prevClose.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="market-metal-detail-item">
                                    <span className="market-metal-detail-label">最高</span>
                                    <span className="market-metal-detail-value price-up">
                                        {metal.high.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="market-metal-detail-item">
                                    <span className="market-metal-detail-label">最低</span>
                                    <span className="market-metal-detail-value price-down">
                                        {metal.low.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* CNY Price */}
                            <div className="market-metal-cny">
                                <span className="market-metal-cny-label">人民币报价</span>
                                <span className="market-metal-cny-value">
                                    ¥{metal.cnyPrice.toFixed(2)} {metal.cnyUnit}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MetalSection;
