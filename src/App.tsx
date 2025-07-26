import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Footer from './components/Footer';
import MovingServicePage from './components/MovingServicePage';
import LocalMovingPage from './components/LocalMovingPage';
import MovingPage from './components/MovingPage';
import StoragePage from './components/StoragePage';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import './i18n';
import './styles/app.scss';
import { updatePageMeta } from './utils/systemUtils';

function App() {
  const { i18n } = useTranslation();

  // 监听语言变化，更新页面标题和描述
  useEffect(() => {
    const handleLanguageChange = () => {
      updatePageMeta({
        titleZh: '搬家服务公司',
        titleEn: 'Moving Company',
        descriptionZh: '专业的搬家服务，提供同城搬家、跨省搬家、家具存储等服务',
        descriptionEn: 'Professional moving services including local moving, intercity moving, and furniture storage',
        companyName: '搬家服务公司',
        phone: '+1-xxx-xxx-xxxx',
        email: 'info@movingcompany.com',
        address: 'Vancouver, BC, Canada'
      });
    };

    // 初始更新
    handleLanguageChange();

    // 监听语言变化
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<MovingServicePage />} />
          <Route path="/moving" element={<MovingServicePage />} />
          <Route path="/local-moving" element={<LocalMovingPage />} />
          <Route path="/intercity-moving" element={<MovingPage />} />
          <Route path="/storage" element={<StoragePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
