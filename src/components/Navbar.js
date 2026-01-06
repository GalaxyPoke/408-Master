import React, { useState } from 'react';
import { Menu, X, GraduationCap, Moon, Sun } from 'lucide-react';
import { useTheme } from '../App';

const Navbar = ({ activeSection, setActiveSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  
  const navItems = [
    { id: 'home', label: '首页' },
    { id: 'overview', label: '学习概览' },
    { id: 'videos', label: '408课程' },
    { id: 'notes', label: '笔记中心' },
    { id: 'formula', label: '公式速查' },
    { id: 'quizlibrary', label: '真题库' },
    { id: 'ai', label: 'AI助手' },
    { id: 'algorithm', label: '算法笔记' },
    { id: 'plan', label: '学习计划' },
    { id: 'tools', label: '学习工具' },
  ];

  return (
    <nav className={`shadow-lg sticky top-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveSection('home')}>
            <GraduationCap className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>408学习指南</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === item.id 
                    ? 'bg-blue-600 text-white' 
                    : darkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* 暗黑模式切换按钮 */}
            <button
              onClick={toggleDarkMode}
              className={`ml-2 p-2 rounded-lg transition-all ${
                darkMode 
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={darkMode ? '切换到亮色模式' : '切换到暗黑模式'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'text-yellow-400' : 'text-gray-600'}`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              className={`p-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  activeSection === item.id 
                    ? 'bg-blue-600 text-white' 
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
