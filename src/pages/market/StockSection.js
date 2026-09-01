import React from 'react';
import { FaCaretUp, FaCaretDown, FaFire } from 'react-icons/fa';
import { stockIndices, hotStocks } from './mockData';
import MarketCard from './MarketCard';

const StockSection = () => {
    const getPriceClass = (change) => {
        if (change > 0) return 'price-up';
        if (change < 0) return 'price-down';
        return 'price-flat';
    };

    const formatSign = (val) => (val > 0 ? '+' : '');

    return (
        <div>
            {/* Index Overview */}
            <div className="market-section-title">大盘指数</div>
            <div className="market-index-row">
                {stockIndices.map((item) => (
                    <MarketCard key={item.code} data={item} type="index" />
                ))}
            </div>

            {/* Hot Stocks Table */}
            <div className="market-section-title">
                <FaFire style={{ color: '#ff6b35' }} /> 热门个股
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="market-stock-table">
                    <thead>
                        <tr>
                            <th>名称</th>
                            <th>代码</th>
                            <th>最新价</th>
                            <th>涨跌额</th>
                            <th>涨跌幅</th>
                            <th>成交量</th>
                            <th>成交额</th>
                            <th>最高</th>
                            <th>最低</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotStocks.map((stock) => {
                            const cls = getPriceClass(stock.change);
                            return (
                                <tr key={stock.code}>
                                    <td>{stock.name}</td>
                                    <td>{stock.code}</td>
                                    <td className={cls}>
                                        {stock.price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className={cls}>
                                        {stock.change > 0 ? <FaCaretUp style={{ marginRight: 2 }} /> : stock.change < 0 ? <FaCaretDown style={{ marginRight: 2 }} /> : null}
                                        {formatSign(stock.change)}{stock.change.toFixed(2)}
                                    </td>
                                    <td className={cls}>
                                        {formatSign(stock.changePercent)}{stock.changePercent.toFixed(2)}%
                                    </td>
                                    <td>{stock.volume}</td>
                                    <td>{stock.turnover}</td>
                                    <td>{stock.high.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                                    <td>{stock.low.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockSection;
