import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/moving-service.scss';

function MovingServicePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLocalMoving = () => {
    navigate('/local-moving');
  };

  const handleIntercityMoving = () => {
    navigate('/intercity-moving');
  };

  return (
    <main className="moving-service-page">
      <div className="title">
        <h1>{t('movingService.title')}</h1>
        <p>{t('movingService.subtitle')}</p>
      </div>
      
      <div className="service-options">
        <div className="service-card local-moving" onClick={handleLocalMoving}>
          <div className="service-icon">
            <div className="icon-placeholder">🏠</div>
          </div>
          <h2>{t('movingService.localMoving')}</h2>
          <p>{t('movingService.localDescription')}</p>
          <ul>
            <li>Professional movers</li>
            <li>Flexible scheduling</li>
            <li>Hourly rates</li>
          </ul>
          <button className="select-button">Choose Local Moving</button>
        </div>
        
        <div className="service-card intercity-moving" onClick={handleIntercityMoving}>
          <div className="service-icon">
            <div className="icon-placeholder">🚚</div>
          </div>
          <h2>{t('movingService.intercityMoving')}</h2>
          <p>{t('movingService.intercityDescription')}</p>
          <ul>
            <li>Full service package</li>
            <li>Long distance transport</li>
            <li>Storage options</li>
          </ul>
          <button className="select-button">Choose Intercity Moving</button>
        </div>
      </div>
    </main>
  );
}

export default MovingServicePage; 