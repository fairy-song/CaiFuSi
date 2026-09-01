import React from 'react';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';

const MarketCard = ({ data, type = 'stock' }) => {
    const isUp = data.change > 0;
    const isFlat = data.change === 0;
    const colorClass = isFlat ? 'price-flat' : isUp ? 'price-up' : 'price-down';
    const sign = isUp ? '+' : '';

    if (type === 'index') {
        return (
            <div className="market-index-card market-animate-in">
                <div className="market-index-name">{data.name}</div>
                <div className={`market-index-price ${colorClass}`}>
                    {data.price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                </div>
                <div className={`market-index-change ${colorClass}`}>
                    {isUp ? <FaCaretUp /> : !isFlat ? <FaCaretDown /> : null}
                    {sign}{data.change.toFixed(2)} ({sign}{data.changePercent.toFixed(2)}%)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.35rem' }}>
                    成交额 {data.volume}
                </div>
            </div>
        );
    }

    return null;
};

export default MarketCard;
