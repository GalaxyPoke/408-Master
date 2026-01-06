import React from 'react';
import { 
  Clock, Target, Lightbulb, ArrowRight 
} from 'lucide-react';
import PomodoroTimer from './tools/PomodoroTimer';
import StudyHeatmap from './tools/StudyHeatmap';
import DailyCalendar from './tools/DailyCalendar';
import { useTheme } from '../App';

const HomePage = ({ setActiveSection }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section - 高端简约 */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-3">
              <span className="font-bold">408</span> 考研学习指南
            </h1>
            <p className="text-slate-400 text-sm tracking-widest mb-8">
              EFFICIENT STUDY · SUCCESS GUARANTEED
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setActiveSection('videos')}
                className="bg-white text-slate-900 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-100 transition-all flex items-center gap-2 text-sm"
              >
                开始学习 <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setActiveSection('overview')}
                className="border border-slate-600 text-slate-300 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 hover:border-slate-500 transition-all text-sm"
              >
                学习概览
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 学习工具区 - 番茄钟、热力图、日历 */}
      <div className={`py-16 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-800'}`}>学习仪表盘</h2>
          
          {/* 撕页日历单独一行 */}
          <div className="mb-8">
            <DailyCalendar examDate="2025-12-20" />
          </div>
          
          {/* 番茄钟和热力图 */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8 items-stretch">
            {/* 番茄钟 */}
            <div className="lg:col-span-1">
              <PomodoroTimer />
            </div>
            
            {/* 学习打卡日历（热力图） */}
            <div className="lg:col-span-2">
              <StudyHeatmap />
            </div>
          </div>
          
        </div>
      </div>

      {/* Learning Tips */}
      <div className={`py-16 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-800'}`}>高效学习方法</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`rounded-xl p-6 shadow-md transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <Target className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>理解为主，记忆为辅</h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>408注重对概念的深入理解，死记硬背效果差。要理解原理，建立知识体系。</p>
            </div>
            <div className={`rounded-xl p-6 shadow-md transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                <Lightbulb className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>多做真题，总结规律</h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>真题是最好的复习资料，通过真题了解考试重点和出题风格，总结解题技巧。</p>
            </div>
            <div className={`rounded-xl p-6 shadow-md transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <Clock className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>合理规划，持之以恒</h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>制定科学的学习计划，每天保持稳定的学习时间，避免临时抱佛脚。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
