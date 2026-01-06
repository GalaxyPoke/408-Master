import React, { useState } from 'react';
import { BookOpen, Cpu, HardDrive, Network, CheckCircle, Circle, Clock, TrendingUp } from 'lucide-react';

const StudyProgress = () => {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('408_studyProgress');
    return saved ? JSON.parse(saved) : {
      ds: { chapters: [0, 0, 0, 0, 0, 0] },
      co: { chapters: [0, 0, 0, 0, 0, 0] },
      os: { chapters: [0, 0, 0, 0, 0] },
      cn: { chapters: [0, 0, 0, 0, 0, 0] },
    };
  });

  const [expandedSubject, setExpandedSubject] = useState(null);

  const subjects = [
    { id: 'ds', name: '数据结构', icon: BookOpen, gradient: 'from-blue-500 to-cyan-400', chapters: ['线性表', '栈队列', '树', '图', '查找', '排序'] },
    { id: 'co', name: '计组', icon: Cpu, gradient: 'from-purple-500 to-pink-400', chapters: ['概述', '数据', '存储', '指令', 'CPU', 'I/O'] },
    { id: 'os', name: '操作系统', icon: HardDrive, gradient: 'from-emerald-500 to-teal-400', chapters: ['概述', '进程', '内存', '文件', 'I/O'] },
    { id: 'cn', name: '计网', icon: Network, gradient: 'from-orange-500 to-amber-400', chapters: ['体系', '物理', '链路', '网络', '传输', '应用'] },
  ];

  const updateChapterStatus = (subjectId, chapterIndex) => {
    const newProgress = { ...progress };
    const currentStatus = newProgress[subjectId].chapters[chapterIndex];
    newProgress[subjectId].chapters[chapterIndex] = (currentStatus + 1) % 3;
    setProgress(newProgress);
    localStorage.setItem('408_studyProgress', JSON.stringify(newProgress));
  };

  const getSubjectProgress = (subjectId) => {
    const chapters = progress[subjectId].chapters;
    const completed = chapters.filter(s => s === 2).length;
    return Math.round((completed / chapters.length) * 100);
  };

  const getTotalProgress = () => {
    let total = 0;
    let completed = 0;
    subjects.forEach(s => {
      total += progress[s.id].chapters.length;
      completed += progress[s.id].chapters.filter(c => c === 2).length;
    });
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      {/* 装饰 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
      
      <div className="relative p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">学习进度</h2>
              <p className="text-xs text-white/50">点击切换状态</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">{getTotalProgress()}%</div>
            <div className="text-xs text-white/50">总进度</div>
          </div>
        </div>

        {/* 科目卡片 */}
        <div className="space-y-3">
          {subjects.map(subject => {
            const Icon = subject.icon;
            const subjectProgress = getSubjectProgress(subject.id);
            const isExpanded = expandedSubject === subject.id;
            
            return (
              <div key={subject.id} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                {/* 科目头部 */}
                <button
                  onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-white">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${subject.gradient} rounded-full transition-all`}
                        style={{ width: `${subjectProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white/80 w-10 text-right">{subjectProgress}%</span>
                  </div>
                </button>
                
                {/* 章节列表 */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-3 gap-2">
                      {subject.chapters.map((chapter, i) => {
                        const status = progress[subject.id].chapters[i];
                        return (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateChapterStatus(subject.id, i);
                            }}
                            className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                              status === 2 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : status === 1 
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {status === 2 ? <CheckCircle className="h-3 w-3" /> : status === 1 ? <Clock className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                            {chapter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-white/40"><Circle className="h-3 w-3" /> 未学</span>
          <span className="flex items-center gap-1 text-amber-400"><Clock className="h-3 w-3" /> 学习中</span>
          <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="h-3 w-3" /> 已掌握</span>
        </div>
      </div>
    </div>
  );
};

export default StudyProgress;
