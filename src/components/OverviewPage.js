import React from 'react';
import { BookMarked, TrendingUp, ChevronRight } from 'lucide-react';

const OverviewPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">408学习概览</h1>
      
      {/* 考试介绍 */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <BookMarked className="h-8 w-8 text-blue-600" />
          什么是408？
        </h2>
        <div className="prose max-w-none text-gray-700 space-y-4">
          <p>
            <strong>408计算机学科专业基础</strong>是全国硕士研究生招生考试中计算机相关专业的统考科目，
            涵盖计算机科学与技术学科的四门核心基础课程。
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">考试时间</h3>
              <p>每年12月下旬，考试时长3小时（180分钟）</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">试卷结构</h3>
              <p>总分150分，选择题80分（40题），综合应用题70分（7题）</p>
            </div>
          </div>
        </div>
      </div>

      {/* 分值分布 */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">各科目分值分布</h2>
        <div className="space-y-4">
          {[
            { name: '数据结构', score: 45, percent: 30, color: '#3b82f6' },
            { name: '计算机组成原理', score: 45, percent: 30, color: '#a855f7' },
            { name: '操作系统', score: 35, percent: 23, color: '#22c55e' },
            { name: '计算机网络', score: 25, percent: 17, color: '#f97316' },
          ].map(item => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-32 font-medium">{item.name}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                <div 
                  className="h-full rounded-full flex items-center justify-end pr-3"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                >
                  <span className="text-white text-sm font-bold">{item.score}分</span>
                </div>
              </div>
              <div className="w-16 text-right text-gray-500">{item.percent}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* 学习顺序建议 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          推荐学习顺序
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: 1, name: '数据结构', reason: '基础中的基础，算法思维培养' },
            { step: 2, name: '计算机组成', reason: '理解硬件原理，为OS打基础' },
            { step: 3, name: '操作系统', reason: '承上启下，综合性强' },
            { step: 4, name: '计算机网络', reason: '相对独立，可灵活安排' },
          ].map(item => (
            <div key={item.step} className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200 hover:border-blue-400 transition-all">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2 mt-2">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.reason}</p>
              </div>
              {item.step < 4 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
