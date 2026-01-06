import React, { useState } from 'react';
import { BookOpen, Cpu, HardDrive, Network, ChevronRight, Library, Layers, CheckCircle } from 'lucide-react';
import { examData, essayData, getYears, getStats } from '../data/quizData';

const QuizLibrary = () => {
  const [mode, setMode] = useState('library'); // library, paper, quiz
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [quizInfo, setQuizInfo] = useState({ year: '', subject: '' });
  const [paperQuestions, setPaperQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});

  const years = getYears();
  const stats = getStats();

  const subjects = [
    { key: 'ds', name: '数据结构', icon: BookOpen, bgColor: 'bg-blue-600', hoverColor: 'hover:bg-blue-700' },
    { key: 'co', name: '计算机组成', icon: Cpu, bgColor: 'bg-purple-600', hoverColor: 'hover:bg-purple-700' },
    { key: 'os', name: '操作系统', icon: HardDrive, bgColor: 'bg-green-600', hoverColor: 'hover:bg-green-700' },
    { key: 'cn', name: '计算机网络', icon: Network, bgColor: 'bg-orange-600', hoverColor: 'hover:bg-orange-700' },
  ];

  // 获取某科目某年份的题目
  const getQuestions = (subjectKey, year) => {
    if (!examData[year]) return [];
    if (subjectKey === 'all') {
      return examData[year].map(q => ({ ...q, year }));
    }
    return examData[year].filter(q => q.subject === subjectKey).map(q => ({ ...q, year }));
  };

  // 获取某年份某科目的题目数量
  const getYearSubjectCount = (year, subjectKey) => {
    if (!examData[year]) return 0;
    if (subjectKey === 'all') return examData[year].length;
    return examData[year].filter(q => q.subject === subjectKey).length;
  };

  // 打开试卷（显示全部题目列表）
  const openPaper = (subjectKey, year) => {
    const questions = getQuestions(subjectKey, year);
    if (questions.length === 0) return;
    
    const subjectName = subjectKey === 'all' ? '408综合' : subjects.find(s => s.key === subjectKey)?.name;
    setQuizInfo({ year, subject: subjectName });
    setPaperQuestions(questions);
    setUserAnswers({});
    setMode('paper');
  };

  // 返回书架
  const backToLibrary = () => {
    setMode('library');
    setPaperQuestions([]);
    setUserAnswers({});
  };

  // 选择答案（试卷模式）
  const selectAnswer = (questionIndex, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  // 提交试卷
  const submitPaper = () => {
    // 计算得分
    let correctCount = 0;
    paperQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResult(true);
  };

  // 选择答案
  const handleAnswer = (index) => {
    if (answered.includes(currentQuestion)) return;
    setSelectedAnswer(index);
  };

  // 提交答案
  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === currentQuestions[currentQuestion].answer;
    if (isCorrect) setScore(score + 1);
    setAnswered([...answered, currentQuestion]);
    setShowResult(true);
  };

  // 下一题
  const nextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  // 上一题
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  // 书本组件
  const Book = ({ title, count, bgColor, hoverColor, icon: Icon, onClick }) => (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 group`}
    >
      {/* 书本主体 */}
      <div className={`${bgColor} ${hoverColor} w-28 h-40 rounded-r-lg rounded-l-sm shadow-lg transition-all relative overflow-hidden`}>
        {/* 书脊效果 */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20"></div>
        {/* 书本内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2 pl-4">
          <Icon className="w-8 h-8 mb-2 opacity-90" />
          <div className="text-xs font-bold text-center leading-tight">{title}</div>
          <div className="text-xs mt-2 opacity-80">{count}题</div>
        </div>
        {/* 高光效果 */}
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
      </div>
      {/* 书本底部阴影 */}
      <div className="absolute -bottom-2 left-1 right-1 h-2 bg-black/20 rounded-full blur-sm"></div>
    </div>
  );

  // 书架页面
  const renderLibrary = () => (
    <div className="min-h-screen bg-white">
      {/* 顶部标题 */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <h1 className="text-4xl font-light text-gray-900 tracking-tight">408真题库</h1>
          <p className="text-gray-400 mt-3 text-lg font-light">{stats.totalQuestions} 道题目 · {years.length} 个年份</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* 按年份展示书架 */}
        {years.map(year => {
          const yearTotal = stats.byYear[year] || 0;
          if (yearTotal === 0) return null;

          return (
            <div key={year} className="mb-16">
              {/* 年份标签 */}
              <div className="flex items-baseline gap-4 mb-8">
                <h2 className="text-2xl font-medium text-gray-900">{year}</h2>
                <span className="text-sm text-gray-400">{yearTotal} 题</span>
              </div>

              {/* 书本列表 */}
              <div className="flex items-end gap-6 flex-wrap">
                {/* 四门科目的书 */}
                {subjects.map(subject => {
                  const count = getYearSubjectCount(year, subject.key);
                  if (count === 0) return null;
                  return (
                    <Book
                      key={subject.key}
                      title={subject.name}
                      count={count}
                      bgColor={subject.bgColor}
                      hoverColor={subject.hoverColor}
                      icon={subject.icon}
                      onClick={() => openPaper(subject.key, year)}
                    />
                  );
                })}
                
                {/* 综合书 */}
                <Book
                  title="408综合"
                  count={yearTotal}
                  bgColor="bg-gray-800"
                  hoverColor="hover:bg-gray-900"
                  icon={Layers}
                  onClick={() => openPaper('all', year)}
                />
              </div>

              {/* 书架阴影投射效果 */}
              <div className="mt-6 relative h-8">
                {/* 书本投影 */}
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/[0.06] to-transparent"></div>
                {/* 书架边缘线 */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gray-200"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 答题页面 - 试卷样式
  const renderQuiz = () => {
    if (currentQuestions.length === 0) return null;
    
    const question = currentQuestions[currentQuestion];
    const subjectConfig = subjects.find(s => s.key === question.subject);
    const progress = ((currentQuestion + 1) / currentQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-white">
        {/* 试卷头部 */}
        <div className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="max-w-3xl mx-auto px-8 py-4 flex items-center justify-between">
            <button 
              onClick={backToLibrary}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
            >
              ← 返回
            </button>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">{quizInfo.year}年 · {quizInfo.subject}</div>
            </div>
            <div className="text-sm text-gray-400">
              {currentQuestion + 1} / {currentQuestions.length}
            </div>
          </div>
          {/* 极简进度条 */}
          <div className="h-[2px] bg-gray-100">
            <div 
              className="h-full bg-gray-900 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 试卷内容 */}
        <div className="max-w-3xl mx-auto px-8 py-16">
          {/* 题号 */}
          <div className="mb-8">
            <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
              Question {currentQuestion + 1}
            </span>
          </div>

          {/* 题目 */}
          <div className="mb-12">
            <p className="text-xl text-gray-900 leading-relaxed font-light">
              {question.q}
            </p>
          </div>

          {/* 选项 */}
          <div className="space-y-4 mb-16">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.answer;
              const isAnswered = answered.includes(currentQuestion);
              
              let optionStyle = 'border border-gray-200 hover:border-gray-400';
              let letterStyle = 'text-gray-400 border-gray-200';
              
              if (isAnswered) {
                if (isCorrect) {
                  optionStyle = 'border border-green-500 bg-green-50/50';
                  letterStyle = 'text-green-600 border-green-500 bg-green-500 text-white';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border border-red-400 bg-red-50/50';
                  letterStyle = 'text-red-500 border-red-400 bg-red-400 text-white';
                }
              } else if (isSelected) {
                optionStyle = 'border border-gray-900';
                letterStyle = 'text-white border-gray-900 bg-gray-900';
              }

              return (
                <div
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`p-5 rounded-lg cursor-pointer transition-all duration-200 ${optionStyle}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all ${letterStyle}`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="text-gray-700 pt-0.5 leading-relaxed">{option}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-100">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← 上一题
            </button>

            <div className="flex items-center gap-4">
              {!answered.includes(currentQuestion) && (
                <button
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  确认
                </button>
              )}
              
              {answered.includes(currentQuestion) && currentQuestion < currentQuestions.length - 1 && (
                <button
                  onClick={nextQuestion}
                  className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all"
                >
                  下一题 →
                </button>
              )}
            </div>
          </div>

          {/* 完成提示 */}
          {answered.length === currentQuestions.length && (
            <div className="mt-16 text-center py-12 border-t border-gray-100">
              <div className="text-6xl mb-6">✓</div>
              <div className="text-2xl font-light text-gray-900 mb-2">完成</div>
              <div className="text-gray-400 mb-8">
                正确 {score} / {currentQuestions.length} · 正确率 {Math.round((score / currentQuestions.length) * 100)}%
              </div>
              <button
                onClick={backToLibrary}
                className="px-8 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-400 transition-all"
              >
                返回书架
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 试卷页面 - 显示全部题目
  const renderPaper = () => {
    const subjectNames = {
      ds: '数据结构',
      co: '计算机组成原理', 
      os: '操作系统',
      cn: '计算机网络'
    };

    // 按科目分组选择题
    const groupedQuestions = {};
    paperQuestions.forEach((q, idx) => {
      if (!groupedQuestions[q.subject]) {
        groupedQuestions[q.subject] = [];
      }
      groupedQuestions[q.subject].push({ ...q, globalIndex: idx });
    });

    // 获取大题数据
    const yearEssays = essayData[quizInfo.year] || [];
    const filteredEssays = quizInfo.subject === '408综合' 
      ? yearEssays 
      : yearEssays.filter(e => subjectNames[e.subject] === quizInfo.subject);

    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div className="min-h-screen bg-white">
        {/* 试卷头部 */}
        <div className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={backToLibrary}
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
              >
                ← 返回书架
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  已答 {answeredCount} / {paperQuestions.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 试卷标题 */}
        <div className="max-w-4xl mx-auto px-8 pt-12 pb-8 border-b border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              {quizInfo.year}年全国硕士研究生入学统一考试
            </h1>
            <h2 className="text-xl text-gray-500 font-light">
              计算机学科专业基础 · {quizInfo.subject}
            </h2>
            <div className="mt-6 text-sm text-gray-400">
              共 {paperQuestions.length} 题 · 每题 2 分 · 共 {paperQuestions.length * 2} 分
            </div>
          </div>
        </div>

        {/* 试卷内容 */}
        <div className="max-w-4xl mx-auto px-8 py-12">
          {['ds', 'co', 'os', 'cn'].map(subjectKey => {
            const questions = groupedQuestions[subjectKey];
            if (!questions || questions.length === 0) return null;

            return (
              <div key={subjectKey} className="mb-16">
                {/* 科目标题 */}
                <div className="mb-8 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900">
                    {subjectNames[subjectKey]}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    共 {questions.length} 题
                  </p>
                </div>

                {/* 题目列表 */}
                <div className="space-y-10">
                  {questions.map((q, localIdx) => {
                    const globalIdx = q.globalIndex;
                    const selectedAnswer = userAnswers[globalIdx];
                    const isAnswered = selectedAnswer !== undefined;

                    return (
                      <div key={globalIdx} className="group">
                        {/* 题目 */}
                        <div className="mb-6">
                          <span className="text-sm font-medium text-gray-400 mr-3">
                            {globalIdx + 1}.
                          </span>
                          <span className="text-gray-900 leading-relaxed">
                            {q.q}
                          </span>
                        </div>

                        {/* 选项 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                          {q.options.map((option, optIdx) => {
                            const isSelected = selectedAnswer === optIdx;
                            const isCorrect = showResult && optIdx === q.answer;
                            const isWrong = showResult && isSelected && optIdx !== q.answer;

                            let optionStyle = 'border border-gray-200 hover:border-gray-300';
                            if (isCorrect) {
                              optionStyle = 'border border-green-500 bg-green-50';
                            } else if (isWrong) {
                              optionStyle = 'border border-red-400 bg-red-50';
                            } else if (isSelected) {
                              optionStyle = 'border border-gray-900 bg-gray-50';
                            }

                            return (
                              <div
                                key={optIdx}
                                onClick={() => !showResult && selectAnswer(globalIdx, optIdx)}
                                className={`p-3 rounded-lg cursor-pointer transition-all text-sm ${optionStyle} ${showResult ? 'cursor-default' : ''}`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className={`font-medium ${isCorrect ? 'text-green-600' : isWrong ? 'text-red-500' : isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span className={`${isCorrect ? 'text-green-700' : isWrong ? 'text-red-600' : 'text-gray-700'}`}>
                                    {option}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* 大题部分 */}
          {filteredEssays.length > 0 && (
            <div className="mt-16 pt-12 border-t-2 border-gray-200">
              <div className="mb-8">
                <h2 className="text-2xl font-medium text-gray-900">二、综合应用题</h2>
                <p className="text-sm text-gray-400 mt-2">共 {filteredEssays.length} 题 · {filteredEssays.reduce((sum, e) => sum + e.score, 0)} 分</p>
              </div>

              <div className="space-y-12">
                {filteredEssays.map((essay, idx) => (
                  <div key={essay.id} className="border border-gray-100 rounded-xl p-8 bg-gray-50/50">
                    {/* 题目头部 */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <span className="text-sm font-medium text-gray-400">第 {essay.id} 题</span>
                        <h3 className="text-lg font-medium text-gray-900 mt-1">{essay.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">{subjectNames[essay.subject]}</span>
                          <span className="text-xs text-gray-400">{essay.score} 分</span>
                        </div>
                      </div>
                    </div>

                    {/* 题目内容 */}
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-500 mb-3">【题目】</div>
                      <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans text-sm bg-white p-4 rounded-lg border border-gray-100">
                        {essay.question}
                      </pre>
                    </div>

                    {/* 参考答案（可折叠） */}
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2">
                        <span>查看参考答案</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                          {essay.answer}
                        </pre>
                      </div>
                    </details>

                    {/* 知识点标签 */}
                    {essay.tags && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {essay.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          {!showResult && (
            <div className="mt-16 pt-8 border-t border-gray-100 text-center">
              <button
                onClick={submitPaper}
                disabled={answeredCount < paperQuestions.length}
                className="px-12 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                提交选择题 ({answeredCount}/{paperQuestions.length})
              </button>
              <p className="mt-4 text-sm text-gray-400">
                {answeredCount < paperQuestions.length ? `还有 ${paperQuestions.length - answeredCount} 题未作答` : '已全部作答，可以提交'}
              </p>
            </div>
          )}

          {/* 成绩展示 */}
          {showResult && (
            <div className="mt-16 pt-12 border-t border-gray-100 text-center">
              <div className="text-6xl font-light text-gray-900 mb-4">
                {score}/{paperQuestions.length}
              </div>
              <div className="text-xl text-gray-500 mb-2">
                正确率 {Math.round((score / paperQuestions.length) * 100)}%
              </div>
              <div className="text-gray-400 mb-8">
                得分 {score * 2} / {paperQuestions.length * 2} 分
              </div>
              <button
                onClick={backToLibrary}
                className="px-8 py-3 border border-gray-200 text-gray-600 font-medium rounded-lg hover:border-gray-400 transition-all"
              >
                返回书架
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (mode === 'library') return renderLibrary();
  if (mode === 'paper') return renderPaper();
  return renderQuiz();
};

export default QuizLibrary;
