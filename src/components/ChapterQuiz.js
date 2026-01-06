import React, { useState, useMemo } from 'react';
import { 
  X, Check, ChevronRight, ChevronLeft, 
  BookOpen, RotateCcw, FileText, Sparkles, Loader2, Lightbulb, RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// 导入选择题数据
import questionsOS from '../data/questions/os.json';
import questionsCN from '../data/questions/cn.json';
import questionsDS from '../data/questions/ds.json';
import questionsCO from '../data/questions/co.json';

// 导入综合题数据
import essayOS from '../data/questions/os_essay.json';
import essayCN from '../data/questions/cn_essay.json';
import essayDS from '../data/questions/ds_essay.json';
import essayCO from '../data/questions/co_essay.json';

// 章节映射
const CHAPTER_MAPPING = {
  // 数据结构
  'ds-ch1': '第1章 绪论',
  'ds-ch2': '第2章 线性表',
  'ds-ch3': '第3章 栈、队列和数组',
  'ds-ch4': '第3章 栈、队列和数组',
  'ds-ch5': '第3章 栈、队列和数组',
  'ds-ch6': '第5章 树与二叉树',
  'ds-ch7': '第5章 树与二叉树',
  'ds-ch8': '第5章 树与二叉树',
  'ds-ch9': '第7章 查找',
  'ds-ch10': '第8章 排序',
  // 计算机组成原理
  'co-ch1': '第1章 计算机系统概述',
  'co-ch2': '第2章 数据的表示和运算',
  'co-ch3': '第2章 数据的表示和运算',
  'co-ch4': '第3章 存储系统',
  'co-ch5': '第3章 存储系统',
  'co-ch6': '第3章 存储系统',
  'co-ch7': '第4章 指令系统',
  'co-ch8': '第5章 中央处理器',
  'co-ch9': '第5章 中央处理器',
  'co-ch10': '第6章 总线',
  'co-ch11': '第7章 输入/ 输出系统',
  // 操作系统
  'os-ch1': '第1章 计算机系统概述',
  'os-ch2': '第2章 进程与线程',
  'os-ch3': '第2章 进程与线程',
  'os-ch4': '第2章 进程与线程',
  'os-ch5': '第2章 进程与线程',
  'os-ch6': '第2章 进程与线程',
  'os-ch7': '第3章 内存管理',
  'os-ch8': '第3章 内存管理',
  'os-ch9': '第4章 文件管理',
  'os-ch10': '第4章 文件管理',
  'os-ch11': '第5章 输入/输出管理',
  // 计算机网络
  'cn-ch1': '第1章 计算机网络体系结构',
  'cn-ch2': '第2章 物理层',
  'cn-ch3': '第3章 数据链路层',
  'cn-ch4': '第4章 网络层',
  'cn-ch5': '第4章 网络层',
  'cn-ch6': '第4章 网络层',
  'cn-ch7': '第5章 传输层',
  'cn-ch8': '第5章 传输层',
  'cn-ch9': '第5章 传输层',
  'cn-ch10': '第6章 应用层',
  'cn-ch11': '第6章 应用层',
  'cn-ch12': '第6章 应用层',
};

const ChapterQuiz = ({ isOpen, onClose, chapterId, chapterName, subjectId }) => {
  const [questionType, setQuestionType] = useState('choice'); // choice 或 essay
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState({});
  
  // AI 解析相关状态
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState(null);
  const [similarLoading, setSimilarLoading] = useState(false);

  // 缓存 key
  const getCacheKey = (type) => `quiz_ai_${subjectId}_${currentQuestion?.id}_${type}`;

  // 加载缓存
  const loadCache = (type) => {
    try {
      const cached = localStorage.getItem(getCacheKey(type));
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  };

  // 保存缓存
  const saveCache = (type, data) => {
    try {
      localStorage.setItem(getCacheKey(type), JSON.stringify(data));
    } catch (e) {}
  };

  // 根据章节筛选题目
  const questions = useMemo(() => {
    let questionBank = [];
    
    if (questionType === 'choice') {
      if (subjectId === 'os') questionBank = questionsOS;
      else if (subjectId === 'cn') questionBank = questionsCN;
      else if (subjectId === 'ds') questionBank = questionsDS;
      else if (subjectId === 'co') questionBank = questionsCO;
    } else {
      if (subjectId === 'os') questionBank = essayOS;
      else if (subjectId === 'cn') questionBank = essayCN;
      else if (subjectId === 'ds') questionBank = essayDS;
      else if (subjectId === 'co') questionBank = essayCO;
    }
    
    if (!questionBank.length) return [];
    
    const mappedChapter = CHAPTER_MAPPING[chapterId];
    if (!mappedChapter) return questionBank.slice(0, 20);
    
    return questionBank.filter(q => q.chapter === mappedChapter);
  }, [chapterId, subjectId, questionType]);

  const currentQuestion = questions[currentIndex];

  // 切换题型时重置
  const handleTypeChange = (type) => {
    setQuestionType(type);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setAiAnalysis(null);
    setSimilarQuestions(null);
  };

  // 选择答案
  const handleSelectAnswer = (label) => {
    if (showAnswer) return;
    setSelectedAnswer(label);
  };

  // 确认答案
  const handleConfirm = () => {
    if (!selectedAnswer) return;
    setShowAnswer(true);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer }));
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setAiAnalysis(null);
      setSimilarQuestions(null);
    }
  };

  // 上一题
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setAiAnalysis(null);
      setSimilarQuestions(null);
    }
  };

  // 重置
  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setAnswers({});
    setAiAnalysis(null);
    setSimilarQuestions(null);
  };

  // AI 深度解析
  const handleAiAnalysis = async () => {
    if (!currentQuestion) return;
    
    // 先检查缓存
    const cached = loadCache('analysis');
    if (cached) {
      setAiAnalysis(cached);
      return;
    }
    
    setAiLoading(true);
    setAiAnalysis(null);
    
    const subjectNames = { ds: '数据结构', co: '计算机组成原理', os: '操作系统', cn: '计算机网络' };
    const subjectName = subjectNames[subjectId] || '408';
    
    const optionsText = currentQuestion.options 
      ? currentQuestion.options.map(o => `${o.label}. ${o.text}`).join('\n')
      : '';
    
    const prompt = `你是一位资深的408考研辅导老师，请对以下${subjectName}题目进行深度解析。

【题目】
${currentQuestion.question}
${optionsText ? '\n【选项】\n' + optionsText : ''}

请按以下格式回答：

## 📌 正确答案
给出正确答案并简要说明

## 🔍 深度解析
1. **题目考查点**：这道题考查的是什么知识点
2. **底层原理**：详细解释相关的底层原理和机制
3. **解题思路**：一步步分析如何得出答案
4. **易错点**：指出容易犯错的地方

## 📚 知识拓展
- 相关概念的联系
- 在实际系统中的应用
- 与其他知识点的关联

## 💡 记忆技巧
给出便于记忆的口诀或方法`;

    try {
      const res = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'Qwen/Qwen2.5-7B-Instruct'
        })
      });
      
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || data.message || data.content || '';
      
      if (content) {
        setAiAnalysis(content);
        saveCache('analysis', content);
      } else {
        setAiAnalysis('解析生成失败，请重试');
      }
    } catch (err) {
      console.error('AI解析错误:', err);
      setAiAnalysis('网络错误，请检查后端服务是否启动');
    } finally {
      setAiLoading(false);
    }
  };

  // AI 举一反三
  const handleSimilarQuestions = async () => {
    if (!currentQuestion) return;
    
    // 先检查缓存
    const cached = loadCache('similar');
    if (cached) {
      setSimilarQuestions(cached);
      return;
    }
    
    setSimilarLoading(true);
    setSimilarQuestions(null);
    
    const subjectNames = { ds: '数据结构', co: '计算机组成原理', os: '操作系统', cn: '计算机网络' };
    const subjectName = subjectNames[subjectId] || '408';
    
    const prompt = `你是一位资深的408考研命题专家，请根据以下${subjectName}题目，生成3道举一反三的变式题。

【原题】
${currentQuestion.question}

要求：
1. 每道变式题要考查相同或相近的知识点
2. 难度可以略有变化（简单/中等/困难各一道）
3. 题型保持一致（选择题生成选择题，大题生成大题）
4. 每道题都要给出答案和简要解析

请按以下JSON格式返回（不要返回其他内容）：
{
  "questions": [
    {
      "difficulty": "简单/中等/困难",
      "question": "题目内容",
      "options": ["A. xxx", "B. xxx", "C. xxx", "D. xxx"],
      "answer": "A/B/C/D",
      "explanation": "简要解析"
    }
  ]
}`;

    try {
      const res = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'Qwen/Qwen2.5-7B-Instruct'
        })
      });
      
      const data = await res.json();
      let content = data.choices?.[0]?.message?.content || data.message || data.content || '';
      
      // 解析JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const questions = parsed.questions || [];
        setSimilarQuestions(questions);
        saveCache('similar', questions);
      } else {
        setSimilarQuestions([]);
      }
    } catch (err) {
      console.error('举一反三错误:', err);
      setSimilarQuestions([]);
    } finally {
      setSimilarLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            <div>
              <h2 className="font-semibold">王道习题 · {chapterName}</h2>
              <p className="text-sm text-purple-200">共 {questions.length} 题</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 题型切换 */}
        <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-4">
          <span className="text-sm text-gray-500">题型:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleTypeChange('choice')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                questionType === 'choice' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-gray-600 border hover:bg-gray-100'
              }`}
            >
              选择题
            </button>
            <button
              onClick={() => handleTypeChange('essay')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                questionType === 'essay' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-gray-600 border hover:bg-gray-100'
              }`}
            >
              综合题
            </button>
          </div>
          <span className="text-xs text-gray-400 ml-auto">
            进度: {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* 进度条 */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0}%` }}
          />
        </div>

        {/* 题目内容 */}
        <div className="flex-1 overflow-auto p-6">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText className="h-16 w-16 mb-4" />
              <p className="text-lg">该章节暂无{questionType === 'choice' ? '选择题' : '综合题'}</p>
            </div>
          ) : (
            <>
              {/* 题号 */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                  第 {currentIndex + 1} 题
                </span>
                {currentQuestion?.hasImage && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded text-xs">
                    含图片
                  </span>
                )}
              </div>

              {/* 题目 */}
              <div className="mb-6">
                <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {currentQuestion?.question}
                </p>
              </div>

              {/* 选择题选项 */}
              {questionType === 'choice' && currentQuestion?.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedAnswer === option.label;
                    return (
                      <button
                        key={option.label}
                        onClick={() => handleSelectAnswer(option.label)}
                        disabled={showAnswer}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${showAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                            isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {option.label}
                          </span>
                          <span className="flex-1 text-gray-700 pt-1">{option.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 综合题提示 */}
              {questionType === 'essay' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 text-sm">
                    📝 这是一道综合题/大题，请在纸上作答后对照答案。
                  </p>
                </div>
              )}

              {/* AI 功能按钮 */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAiAnalysis}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-sm"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  AI 深度解析
                </button>
                <button
                  onClick={handleSimilarQuestions}
                  disabled={similarLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-sm"
                >
                  {similarLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  举一反三
                </button>
              </div>

              {/* AI 解析结果 */}
              {aiAnalysis && (
                <div className="mt-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold text-purple-700">AI 深度解析</span>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown
                      components={{
                        h2: ({children}) => <h3 className="text-base font-bold text-purple-700 mt-4 mb-2">{children}</h3>,
                        h3: ({children}) => <h4 className="text-sm font-semibold text-gray-800 mt-3 mb-1">{children}</h4>,
                        p: ({children}) => <p className="mb-2 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="text-gray-700">{children}</li>,
                        strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        code: ({children}) => <code className="bg-purple-100 px-1 rounded text-purple-800 text-xs">{children}</code>,
                      }}
                    >
                      {aiAnalysis}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* 举一反三结果 */}
              {similarQuestions && similarQuestions.length > 0 && (
                <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-blue-700">举一反三 · 变式练习</span>
                  </div>
                  <div className="space-y-4">
                    {similarQuestions.map((q, idx) => (
                      <SimilarQuestionCard key={idx} question={q} index={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* 答案提示 */}
              {showAnswer && questionType === 'choice' && !aiAnalysis && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-700 text-sm">
                    💡 点击"AI 深度解析"获取详细答案和底层原理分析
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
            上一题
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </button>
            
            {questionType === 'choice' && !showAnswer ? (
              <button
                onClick={handleConfirm}
                disabled={!selectedAnswer}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Check className="h-5 w-5" />
                确认
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                下一题
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-30"
          >
            下一题
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 举一反三题目卡片（答案默认隐藏）
const SimilarQuestionCard = ({ question: q, index: idx }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  
  return (
    <div className="p-4 bg-white rounded-lg border border-blue-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
          变式{idx + 1}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs ${
          q.difficulty === '简单' ? 'bg-green-100 text-green-600' :
          q.difficulty === '中等' ? 'bg-yellow-100 text-yellow-600' :
          'bg-red-100 text-red-600'
        }`}>
          {q.difficulty}
        </span>
      </div>
      <p className="text-gray-800 mb-2">{q.question}</p>
      {q.options && (
        <div className="text-sm text-gray-600 space-y-1 mb-3">
          {q.options.map((opt, i) => (
            <div key={i}>{opt}</div>
          ))}
        </div>
      )}
      {!showAnswer ? (
        <button
          onClick={() => setShowAnswer(true)}
          className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
        >
          <Lightbulb className="h-4 w-4" />
          查看答案
        </button>
      ) : (
        <div className="mt-2 pt-2 border-t border-blue-100">
          <p className="text-sm">
            <span className="text-green-600 font-medium">答案: {q.answer}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">{q.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default ChapterQuiz;
