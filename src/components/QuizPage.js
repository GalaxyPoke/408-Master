import React, { useState } from 'react';
import { BookOpen, Cpu, HardDrive, Network, CheckCircle, XCircle, RotateCcw, Trophy, ChevronRight, Calendar, Filter } from 'lucide-react';
import { examData, getYears } from '../data/quizData';

const QuizPage = () => {
  const [activeYear, setActiveYear] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);

  const years = getYears();

  const subjectInfo = {
    ds: { name: '数据结构', icon: BookOpen, color: 'blue' },
    co: { name: '计算机组成原理', icon: Cpu, color: 'purple' },
    os: { name: '操作系统', icon: HardDrive, color: 'green' },
    cn: { name: '计算机网络', icon: Network, color: 'orange' },
  };

  // 开始某年份的练习
  const startYearQuiz = (year) => {
    setActiveYear(year);
    setCurrentQuestions(examData[year]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered([]);
  };

  // 开始某科目的练习（所有年份）
  const startSubjectQuiz = (subjectKey) => {
    setActiveSubject(subjectKey);
    const questions = [];
    years.forEach(year => {
      examData[year].filter(q => q.subject === subjectKey).forEach(q => {
        questions.push({ ...q, year });
      });
    });
    setCurrentQuestions(questions);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered([]);
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const isCorrect = index === currentQuestions[currentQuestion].answer;
    if (isCorrect) setScore(score + 1);
    setAnswered([...answered, { question: currentQuestion, selected: index, correct: isCorrect }]);
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setActiveYear(null);
    setActiveSubject(null);
    setCurrentQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered([]);
  };

  const colorClasses = {
    blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100', gradient: 'from-blue-500 to-cyan-500' },
    purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100', gradient: 'from-purple-500 to-pink-500' },
    green: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100', gradient: 'from-green-500 to-emerald-500' },
    orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:bg-orange-100', gradient: 'from-orange-500 to-red-500' },
  };

  // 选择界面（年份+科目）
  if (!activeYear && !activeSubject) {
    const totalQuestions = years.reduce((sum, year) => sum + examData[year].length, 0);
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">408真题练习</h1>
          <p className="text-gray-500">共收录 {years.length} 年真题，{totalQuestions} 道选择题</p>
        </div>

        {/* 按年份选择 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            按年份练习
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {years.map(year => (
              <button
                key={year}
                onClick={() => startYearQuiz(year)}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-3xl font-black mb-2">{year}</div>
                <div className="text-white/80 text-sm">{examData[year].length} 题</div>
              </button>
            ))}
          </div>
        </div>

        {/* 按科目选择 */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Filter className="h-6 w-6 text-indigo-600" />
            按科目练习
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(subjectInfo).map(([key, subject]) => {
              const Icon = subject.icon;
              const c = colorClasses[subject.color];
              const count = years.reduce((sum, year) => sum + examData[year].filter(q => q.subject === key).length, 0);
              return (
                <button
                  key={key}
                  onClick={() => startSubjectQuiz(key)}
                  className={`bg-gradient-to-br ${c.gradient} rounded-2xl p-6 text-white text-left hover:opacity-90 transition-all transform hover:scale-105 shadow-lg`}
                >
                  <Icon className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                  <p className="text-white/80 text-sm">{count} 道真题</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span>开始练习</span>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = currentQuestions[currentQuestion];
  const currentSubjectInfo = subjectInfo[currentQ?.subject];
  const c = currentSubjectInfo ? colorClasses[currentSubjectInfo.color] : colorClasses.blue;

  // 结果界面
  if (showResult) {
    const percentage = Math.round((score / currentQuestions.length) * 100);
    const title = activeYear ? `${activeYear}年真题` : (currentSubjectInfo?.name || '真题练习');
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Trophy className={`h-20 w-20 mx-auto mb-4 ${percentage >= 60 ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h2 className="text-3xl font-bold mb-2">练习完成！</h2>
          <p className="text-gray-500 mb-6">{title}</p>
          
          <div className={`text-6xl font-bold mb-2 ${percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
            {percentage}%
          </div>
          <p className="text-gray-600 mb-6">答对 {score} / {currentQuestions.length} 题</p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => activeYear ? startYearQuiz(activeYear) : startSubjectQuiz(activeSubject)}
              className={`px-6 py-3 ${c.bg} text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2`}
            >
              <RotateCcw className="h-5 w-5" /> 再练一次
            </button>
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
            >
              返回选择
            </button>
          </div>

          {/* 答题详情 */}
          <div className="mt-8 text-left">
            <h3 className="font-bold mb-4">答题详情</h3>
            <div className="space-y-2">
              {answered.map((a, i) => (
                <div key={i} className={`p-3 rounded-lg flex items-center gap-3 ${a.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  {a.correct ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-sm">第{i + 1}题: {a.correct ? '正确' : '错误'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 答题界面
  const quizTitle = activeYear ? `${activeYear}年真题` : (currentSubjectInfo?.name || '真题练习');
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={resetQuiz}
          className="text-gray-500 hover:text-gray-700"
        >
          ← 返回
        </button>
        <div className="flex items-center gap-2">
          {currentQ.year && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
              {currentQ.year}年
            </span>
          )}
          <span className={`px-3 py-1 ${c.light} ${c.text} rounded-full text-sm font-medium`}>
            {currentSubjectInfo?.name}
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>第 {currentQuestion + 1} 题</span>
          <span>共 {currentQuestions.length} 题</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${c.bg} rounded-full transition-all duration-300`}
            style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-6">{currentQ.q}</h2>
        <div className="space-y-3">
          {currentQ.options.map((option, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === currentQ.answer;
            const showCorrect = selectedAnswer !== null && isCorrect;
            const showWrong = selectedAnswer !== null && isSelected && !isCorrect;
            
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                  showCorrect ? 'bg-green-100 border-2 border-green-500' :
                  showWrong ? 'bg-red-100 border-2 border-red-500' :
                  isSelected ? `${c.bg} text-white` :
                  `bg-gray-50 ${c.hover} border-2 border-transparent`
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  showCorrect ? 'bg-green-500 text-white' :
                  showWrong ? 'bg-red-500 text-white' :
                  isSelected ? 'bg-white/30' :
                  'bg-gray-200'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
                {showCorrect && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
                {showWrong && <XCircle className="h-5 w-5 text-red-500 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 下一题按钮 */}
      {selectedAnswer !== null && (
        <button
          onClick={nextQuestion}
          className={`w-full py-4 ${c.bg} text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2`}
        >
          {currentQuestion < currentQuestions.length - 1 ? '下一题' : '查看结果'}
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default QuizPage;
