// 认证工具函数

// 检查用户是否已登录
export const isLoggedIn = (): boolean => {
  const loginStatus = localStorage.getItem('isLoggedIn');
  const loginTime = localStorage.getItem('loginTime');
  
  if (!loginStatus || !loginTime) {
    return false;
  }
  
  // 检查登录是否在24小时内
  const loginTimestamp = parseInt(loginTime);
  const currentTime = Date.now();
  const hoursSinceLogin = (currentTime - loginTimestamp) / (1000 * 60 * 60);
  
  // 如果超过24小时，自动登出
  if (hoursSinceLogin > 24) {
    logout();
    return false;
  }
  
  return loginStatus === 'true';
};

// 登出用户
export const logout = (): void => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('loginTime');
};

// 获取登录时间
export const getLoginTime = (): Date | null => {
  const loginTime = localStorage.getItem('loginTime');
  return loginTime ? new Date(parseInt(loginTime)) : null;
};

// 获取登录状态信息
export const getLoginInfo = (): { isLoggedIn: boolean; loginTime: Date | null } => {
  return {
    isLoggedIn: isLoggedIn(),
    loginTime: getLoginTime()
  };
}; 