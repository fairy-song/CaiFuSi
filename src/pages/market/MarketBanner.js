import React from 'react';
import { Container } from 'react-bootstrap';
import { FaNewspaper } from 'react-icons/fa';
import { marketNews } from './mockData';

const MarketBanner = () => {
    const duplicatedNews = [...marketNews, ...marketNews];

    return (
        <div className="market-banner">
            <Container>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 className="market-banner-title">
                        金融市场
                    </h1>
                    <p className="market-banner-subtitle">
                        实时追踪热门股票与贵金属行情走势
                    </p>

                    <div className="market-news-ticker">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaNewspaper style={{ color: '#ffc107', flexShrink: 0 }} />
                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                <div className="market-news-ticker-inner">
                                    {duplicatedNews.map((news, idx) => (
                                        <span key={idx} className="market-news-item">
                                            {news}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default MarketBanner;
