import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Navbar,
  HomePage,
  OverviewPage,
  StudyPlanPage,
  ResourcesPage,
  DataStructurePage,
  ComputerOrganizationPage,
  OperatingSystemPage,
  ComputerNetworkPage,
  ToolsPage,
  FormulaPage,
  QuizLibrary,
  VideoPage,
  AIAssistantPage,
  NotesCenter,
  AlgorithmPage,
  ActivationPage,
} from './components';
import FloatingPomodoro from './components/FloatingPomodoro';
import { PomodoroProvider } from './contexts/PomodoroContext';

// 创建主题上下文
export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// 生成机器码
const getMachineId = () => {
  const stored = localStorage.getItem('machineId');
  if (stored) return stored;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('408考研学习指南', 2, 2);
  const canvasData = canvas.toDataURL();
  
  const info = [
    navigator.userAgent,
    navigator.language,
    window.screen.width + 'x' + window.screen.height,
    new Date().getTimezoneOffset(),
    canvasData.slice(-50)
  ].join('|');
  
  let hash = 0;
  for (let i = 0; i < info.length; i++) {
    const char = info.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const machineId = 'M' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  localStorage.setItem('machineId', machineId);
  return machineId;
};

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isActivated, setIsActivated] = useState(null); // null=检查中, true=已激活, false=未激活
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // 检查激活状态
  useEffect(() => {
    const checkActivation = async () => {
      const machineId = getMachineId();
      
      try {
        const res = await fetch('http://localhost:3001/api/license/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ machineId })
        });
        
        const data = await res.json();
        
        if (data.activated) {
          localStorage.setItem('activationData', JSON.stringify({
            activated: true,
            expiresAt: data.expiresAt,
            machineId
          }));
          setIsActivated(true);
        } else {
          localStorage.removeItem('activationData');
          setIsActivated(false);
        }
      } catch (err) {
        // 后端未启动时，检查本地缓存
        const cached = localStorage.getItem('activationData');
        if (cached) {
          const { expiresAt } = JSON.parse(cached);
          if (new Date(expiresAt) > new Date()) {
            setIsActivated(true);
            return;
          }
        }
        setIsActivated(false);
      }
    };
    
    checkActivation();
  }, []);

  // 切换暗黑模式时更新 localStorage 和 html class
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // 激活成功回调
  const handleActivated = () => {
    setIsActivated(true);
  };

  // 检查激活状态中
  if (isActivated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200">正在验证激活状态...</p>
        </div>
      </div>
    );
  }

  // 未激活，显示激活页面
  if (!isActivated) {
    return <ActivationPage onActivated={handleActivated} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage setActiveSection={setActiveSection} />;
      case 'overview':
        return <OverviewPage />;
      case 'ds':
        return <DataStructurePage />;
      case 'co':
        return <ComputerOrganizationPage />;
      case 'os':
        return <OperatingSystemPage />;
      case 'cn':
        return <ComputerNetworkPage />;
      case 'plan':
        return <StudyPlanPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'tools':
        return <ToolsPage />;
      case 'formula':
        return <FormulaPage />;
      case 'quizlibrary':
        return <QuizLibrary />;
      case 'videos':
        return <VideoPage />;
      case 'ai':
        return <AIAssistantPage />;
      case 'notes':
        return <NotesCenter />;
      case 'algorithm':
        return <AlgorithmPage />;
      default:
        return <HomePage setActiveSection={setActiveSection} />;
    }
  };

  return (
    <PomodoroProvider>
      <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
          <main>
            {renderContent()}
          </main>
          <footer className={`py-8 transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-800'} text-white`}>
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-gray-400">408考研学习指南 | 祝你考研顺利，一战成硕!</p>
            </div>
          </footer>
        </div>
        {/* 全局悬浮番茄钟 */}
        <FloatingPomodoro />
      </ThemeContext.Provider>
    </PomodoroProvider>
  );
}

export default App;
