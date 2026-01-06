import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';

const StudyPlanPage = () => {
  const phases = [
    {
      name: '基础阶段',
      duration: '3-6月（约4个月）',
      color: 'blue',
      tasks: ['系统学习四门课程的基础知识', '以王道/天勤等教材为主', '每门课程学完后做配套习题', '建立知识框架，做好笔记'],
      tips: '不求快，重在理解。遇到不懂的要及时解决。'
    },
    {
      name: '强化阶段',
      duration: '7-9月（约3个月）',
      color: 'green',
      tasks: ['二刷教材，查漏补缺', '开始做真题，熟悉题型', '整理错题本，分析错因', '重点攻克薄弱章节'],
      tips: '这个阶段要提高做题速度和准确率。'
    },
    {
      name: '冲刺阶段',
      duration: '10-12月（约3个月）',
      color: 'orange',
      tasks: ['真题模拟，严格计时', '回顾错题和笔记', '背诵重要概念和公式', '保持手感，调整心态'],
      tips: '保持节奏，不要焦虑。相信自己的积累。'
    },
  ];

  const dailyPlan = [
    { time: '上午', duration: '3-4小时', content: '学习新知识或做真题', color: 'blue' },
    { time: '下午', duration: '2-3小时', content: '复习巩固或做习题', color: 'green' },
    { time: '晚上', duration: '2小时', content: '整理笔记或查漏补缺', color: 'purple' },
  ];

  const colorClasses = {
    blue: { gradient: 'from-blue-500 to-blue-600', check: 'text-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
    green: { gradient: 'from-green-500 to-green-600', check: 'text-green-500', bg: 'bg-green-50', text: 'text-green-600' },
    orange: { gradient: 'from-orange-500 to-orange-600', check: 'text-orange-500', bg: 'bg-orange-50', text: 'text-orange-600' },
    purple: { gradient: 'from-purple-500 to-purple-600', check: 'text-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">学习计划</h1>
      <p className="text-gray-500 text-center mb-12">科学规划，高效备考</p>

      {/* 阶段规划 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          全年复习规划
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {phases.map((phase, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`bg-gradient-to-r ${colorClasses[phase.color].gradient} px-6 py-4`}>
                <h3 className="text-xl font-bold text-white">{phase.name}</h3>
                <p className="text-white/80">{phase.duration}</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-4">
                  {phase.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${colorClasses[phase.color].check}`} />
                      <span className="text-gray-700">{task}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">💡 {phase.tips}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 每日安排 */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">每日学习安排建议</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {dailyPlan.map((item, index) => (
            <div key={index} className={`rounded-xl p-6 ${colorClasses[item.color].bg}`}>
              <div className="text-3xl font-bold mb-2">{item.time}</div>
              <div className={`text-lg font-medium mb-2 ${colorClasses[item.color].text}`}>{item.duration}</div>
              <p className="text-gray-700">{item.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            <strong>⚠️ 注意：</strong>以上仅为建议，请根据个人情况调整。保证每天6-8小时的有效学习时间即可。关键是保持规律和持续性。
          </p>
        </div>
      </div>

      {/* 各科时间分配 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">各科目时间分配建议</h2>
        <div className="space-y-4">
          {[
            { name: '数据结构', percent: 30, color: '#3b82f6' },
            { name: '计算机组成原理', percent: 30, color: '#a855f7' },
            { name: '操作系统', percent: 25, color: '#22c55e' },
            { name: '计算机网络', percent: 15, color: '#f97316' },
          ].map(item => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-36 font-medium">{item.name}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                />
              </div>
              <div className="w-12 text-right font-medium">{item.percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanPage;
