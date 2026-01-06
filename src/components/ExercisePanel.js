import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, XCircle, ChevronRight, ChevronLeft, 
  Plus, Trash2, BookOpen, Award, RotateCcw, Lightbulb,
  FileText, Edit3, Save, Star, Sparkles, Loader2
} from 'lucide-react';

const ExercisePanel = ({ isOpen, onClose, videoId, chapterId, subjectId, videoTitle }) => {
  const [exercises, setExercises] = useState([]);
  const [knowledgePoints, setKnowledgePoints] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ total_exercises: 0, correct_count: 0, attempted_count: 0 });
  const [mode, setMode] = useState('knowledge'); // knowledge, practice, add
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const subjects = [
    { id: 'ds', name: '数据结构', color: 'from-blue-500 to-blue-600' },
    { id: 'co', name: '计算机组成', color: 'from-purple-500 to-purple-600' },
    { id: 'os', name: '操作系统', color: 'from-emerald-500 to-emerald-600' },
    { id: 'net', name: '计算机网络', color: 'from-orange-500 to-orange-600' }
  ];
  
  // 使用传入的subjectId
  const activeSubject = subjectId || 'ds';
  
  // 添加习题表单
  const [newExercise, setNewExercise] = useState({
    type: 'choice',
    question: '',
    options: ['', '', '', ''],
    answer: 'A',
    explanation: '',
    difficulty: 1
  });

  // 加载习题和知识点
  useEffect(() => {
    if (isOpen && videoId) {
      loadExercises();
      loadStats();
      loadKnowledgePoints();
    }
  }, [isOpen, videoId]);

  const loadKnowledgePoints = async () => {
    try {
      const params = new URLSearchParams();
      if (videoId) params.append('video_id', videoId);
      
      const res = await fetch(`http://localhost:3001/api/knowledge?${params}`);
      const data = await res.json();
      setKnowledgePoints(data);
    } catch (e) {
      console.error('Load knowledge points error:', e);
    }
  };

  const loadExercises = async () => {
    try {
      const params = new URLSearchParams();
      if (videoId) params.append('video_id', videoId);
      
      const res = await fetch(`http://localhost:3001/api/exercises?${params}`);
      const data = await res.json();
      setExercises(data);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
    } catch (e) {
      console.error('Load exercises error:', e);
    }
  };

  const loadStats = async () => {
    try {
      const params = new URLSearchParams();
      if (videoId) params.append('video_id', videoId);
      
      const res = await fetch(`http://localhost:3001/api/exercises/stats?${params}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Load stats error:', e);
    }
  };

  // 提交答案
  const submitAnswer = async () => {
    if (!selectedAnswer || !exercises[currentIndex]) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/exercises/${exercises[currentIndex].id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_answer: selectedAnswer })
      });
      const data = await res.json();
      setResult(data);
      setShowResult(true);
      loadStats();
    } catch (e) {
      console.error('Submit answer error:', e);
    } finally {
      setLoading(false);
    }
  };

  // 下一题
  const nextQuestion = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
    }
  };

  // 上一题
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
    }
  };

  // 添加习题
  const handleAddExercise = async () => {
    if (!newExercise.question.trim()) {
      alert('请输入题目');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3001/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          subject_id: subjectId,
          ...newExercise,
          options: newExercise.options.filter(o => o.trim())
        })
      });
      
      if (res.ok) {
        alert('习题添加成功！');
        setNewExercise({
          type: 'choice',
          question: '',
          options: ['', '', '', ''],
          answer: 'A',
          explanation: '',
          difficulty: 1
        });
        loadExercises();
        loadStats();
        setMode('practice');
      }
    } catch (e) {
      alert('添加失败: ' + e.message);
    }
  };

  // 删除习题
  const handleDeleteExercise = async (id) => {
    if (!window.confirm('确定删除这道习题吗？')) return;
    
    try {
      await fetch(`http://localhost:3001/api/exercises/${id}`, { method: 'DELETE' });
      loadExercises();
      loadStats();
    } catch (e) {
      console.error('Delete exercise error:', e);
    }
  };

  // AI生成知识点和习题
  const generateKnowledgeAndExercises = async () => {
    setGenerating(true);
    const currentSubjectName = subjects.find(s => s.id === activeSubject)?.name || '数据结构';
    
    // 构建更精准的提示词
    let topicInfo = currentSubjectName;
    if (videoTitle) {
      topicInfo = `${currentSubjectName} - ${videoTitle}`;
    }
    
    try {
      // 根据学科和视频标题生成知识点和习题
      const prompt = `你是一个408考研辅导专家。请根据以下课程内容生成知识点和习题。

课程：${topicInfo}

请按以下JSON格式返回（不要返回其他内容）：
{
  "knowledgePoints": [
    {"title": "知识点标题", "content": "详细内容说明（要具体、准确，包含定义、公式、特点等）", "importance": 1或2(2表示重点)}
  ],
  "exercises": [
    {"question": "题目", "options": ["A选项", "B选项", "C选项", "D选项"], "answer": "A/B/C/D", "explanation": "解析", "difficulty": 1-3}
  ]
}

要求：
1. 生成4-6个与"${videoTitle || currentSubjectName}"直接相关的核心知识点
2. 每个知识点生成1-2道选择题
3. 题目要符合408考研真题风格
4. 难度分布：简单2道、中等3道、困难1道
5. 知识点内容要具体详细，包含定义、公式、例子等`;

      const res = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'Qwen/Qwen2.5-7B-Instruct'
        })
      });

      const data = await res.json();
      
      console.log('API返回数据:', data);
      
      // 检查API是否返回错误
      if (data.error) {
        alert('AI服务错误: ' + (data.details || data.error));
        return;
      }
      
      let content = data.choices?.[0]?.message?.content || data.message || data.content || '';
      
      if (!content) {
        alert('AI未返回内容，请检查API配置');
        return;
      }
      
      console.log('AI返回原始内容:', content);
      
      // 提取JSON - 更健壮的解析
      let parsed = null;
      
      // 清理内容：移除markdown代码块标记
      let cleanContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      // 找到第一个{和最后一个}
      const firstBrace = cleanContent.indexOf('{');
      const lastBrace = cleanContent.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = cleanContent.substring(firstBrace, lastBrace + 1);
        console.log('提取的JSON:', jsonStr);
        try {
          parsed = JSON.parse(jsonStr);
        } catch (e) {
          console.error('JSON解析失败:', e, '原始字符串:', jsonStr);
          alert('JSON解析失败，请重试。错误: ' + e.message);
          return;
        }
      } else {
        alert('AI返回内容中未找到JSON格式数据');
        return;
      }
      
      if (parsed && (parsed.knowledgePoints || parsed.exercises)) {
        
        // 保存知识点
        if (parsed.knowledgePoints?.length > 0) {
          await fetch('http://localhost:3001/api/knowledge/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              points: parsed.knowledgePoints.map((p, idx) => ({
                video_id: videoId,
                subject_id: subjectId,
                title: p.title,
                content: p.content,
                importance: p.importance || 1,
                sort_order: idx
              }))
            })
          });
        }
        
        // 保存习题
        if (parsed.exercises?.length > 0) {
          await fetch('http://localhost:3001/api/exercises/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              exercises: parsed.exercises.map(e => ({
                video_id: videoId,
                subject_id: subjectId,
                type: 'choice',
                question: e.question,
                options: e.options,
                answer: e.answer,
                explanation: e.explanation || '',
                difficulty: e.difficulty || 1
              }))
            })
          });
        }
        
        // 重新加载
        loadKnowledgePoints();
        loadExercises();
        loadStats();
        alert('知识点和习题生成成功！');
      } else {
        alert('AI返回格式错误，请重试');
      }
    } catch (e) {
      console.error('Generate error:', e);
      alert('生成失败: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  const currentExercise = exercises[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-blue-500" />
            <div>
              <h2 className="font-semibold text-slate-800">408知识点与习题</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* 统计 */}
            <div className="flex items-center gap-4 text-slate-500 text-sm">
              <span className="flex items-center gap-1">
                <FileText size={16} />
                {stats.total_exercises} 题
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={16} />
                {stats.correct_count}/{stats.attempted_count}
              </span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 模式切换 */}
        <div className="flex items-center gap-2 px-6 py-3 bg-white border-b">
          <button
            onClick={() => setMode('knowledge')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'knowledge' ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Star size={16} className="inline mr-2" />
            知识点
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'practice' ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen size={16} className="inline mr-2" />
            做题练习
          </button>
          <button
            onClick={() => setMode('add')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'add' ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus size={16} className="inline mr-2" />
            添加习题
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-auto p-6">
          {mode === 'knowledge' ? (
            /* 知识点展示 */
            <div className="space-y-4">
              {knowledgePoints.length > 0 ? (
                knowledgePoints.map((point, idx) => (
                  <div key={point.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-semibold text-sm">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-800">{point.title}</h3>
                          {point.importance >= 2 && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs rounded-full flex items-center gap-1">
                              <Star size={10} fill="currentColor" />
                              重点
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{point.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Star size={48} className="mb-4" />
                  <p className="text-lg mb-2">暂无知识点</p>
                  <p className="text-sm mb-4 text-center">
                    {videoTitle ? (
                      <>将为 <span className="text-blue-500 font-medium">"{videoTitle}"</span> 生成知识点和习题</>
                    ) : (
                      <>将为 <span className="text-blue-500 font-medium">{subjects.find(s => s.id === activeSubject)?.name}</span> 生成知识点和习题</>
                    )}
                  </p>
                  <button
                    onClick={generateKnowledgeAndExercises}
                    disabled={generating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        AI生成知识点和习题
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {knowledgePoints.length > 0 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setMode('practice')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
                  >
                    <BookOpen size={18} />
                    开始做题巩固
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'practice' ? (
            exercises.length > 0 ? (
              <div className="space-y-6">
                {/* 题目进度 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    第 {currentIndex + 1} / {exercises.length} 题
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map(d => (
                      <span
                        key={d}
                        className={`w-2 h-2 rounded-full ${
                          d <= (currentExercise?.difficulty || 1) ? 'bg-amber-400' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">难度</span>
                  </div>
                </div>

                {/* 题目 */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <p className="text-lg font-medium text-slate-800 leading-relaxed">
                    {currentExercise?.question}
                  </p>
                </div>

                {/* 选项 */}
                <div className="space-y-3">
                  {currentExercise?.options?.map((option, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = selectedAnswer === letter;
                    const isCorrect = showResult && result?.correct_answer === letter;
                    const isWrong = showResult && isSelected && !result?.is_correct;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => !showResult && setSelectedAnswer(letter)}
                        disabled={showResult}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          isCorrect ? 'border-green-500 bg-green-50' :
                          isWrong ? 'border-red-500 bg-red-50' :
                          isSelected ? 'border-blue-500 bg-blue-50' :
                          'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCorrect ? 'bg-green-500 text-white' :
                          isWrong ? 'bg-red-500 text-white' :
                          isSelected ? 'bg-blue-500 text-white' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {letter}
                        </span>
                        <span className="flex-1">{option}</span>
                        {isCorrect && <CheckCircle className="text-green-500" size={20} />}
                        {isWrong && <XCircle className="text-red-500" size={20} />}
                      </button>
                    );
                  })}
                </div>

                {/* 解析 */}
                {showResult && result?.explanation && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                      <Lightbulb size={18} />
                      解析
                    </div>
                    <p className="text-slate-600">{result.explanation}</p>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                  >
                    <ChevronLeft size={18} />
                    上一题
                  </button>
                  
                  <div className="flex items-center gap-3">
                    {!showResult ? (
                      <button
                        onClick={submitAnswer}
                        disabled={!selectedAnswer || loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        {loading ? '提交中...' : '提交答案'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedAnswer(null);
                          setShowResult(false);
                          setResult(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        <RotateCcw size={16} />
                        重做
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteExercise(currentExercise?.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                      title="删除此题"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <button
                    onClick={nextQuestion}
                    disabled={currentIndex === exercises.length - 1}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                  >
                    下一题
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <BookOpen size={48} className="mb-4" />
                <p className="text-lg mb-2">暂无习题</p>
                <p className="text-sm mb-4">点击"添加习题"为这节课添加练习题</p>
                <button
                  onClick={() => setMode('add')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Plus size={16} className="inline mr-2" />
                  添加习题
                </button>
              </div>
            )
          ) : (
            /* 添加习题表单 */
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">题目类型</label>
                <select
                  value={newExercise.type}
                  onChange={(e) => setNewExercise({ ...newExercise, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="choice">单选题</option>
                  <option value="multiple">多选题</option>
                  <option value="judge">判断题</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">题目内容</label>
                <textarea
                  value={newExercise.question}
                  onChange={(e) => setNewExercise({ ...newExercise, question: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none"
                  rows={3}
                  placeholder="请输入题目..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">选项</label>
                <div className="space-y-2">
                  {newExercise.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...newExercise.options];
                          newOptions[idx] = e.target.value;
                          setNewExercise({ ...newExercise, options: newOptions });
                        }}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                        placeholder={`选项 ${String.fromCharCode(65 + idx)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">正确答案</label>
                  <select
                    value={newExercise.answer}
                    onChange={(e) => setNewExercise({ ...newExercise, answer: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    {['A', 'B', 'C', 'D'].map(letter => (
                      <option key={letter} value={letter}>{letter}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">难度</label>
                  <select
                    value={newExercise.difficulty}
                    onChange={(e) => setNewExercise({ ...newExercise, difficulty: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value={1}>简单</option>
                    <option value={2}>中等</option>
                    <option value={3}>困难</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">解析（可选）</label>
                <textarea
                  value={newExercise.explanation}
                  onChange={(e) => setNewExercise({ ...newExercise, explanation: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none"
                  rows={2}
                  placeholder="输入答案解析..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setMode('practice')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleAddExercise}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Save size={16} className="inline mr-2" />
                  保存习题
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExercisePanel;
