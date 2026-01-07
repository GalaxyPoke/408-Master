"use client";

import { 
  BookOpen, 
  Brain, 
  Clock, 
  Code2, 
  Database, 
  Download, 
  Github, 
  GitBranch,
  GraduationCap, 
  Laptop, 
  LineChart, 
  Monitor,
  Network, 
  Pencil, 
  Play, 
  Settings, 
  Sparkles, 
  Star, 
  Target, 
  Timer, 
  Trophy, 
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />
      <HeroSection />
      <TrustedSection />
      <FeaturesSection />
      <SubjectsSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/70 backdrop-blur-xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.1)] border-b border-white/50" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
              <span className="text-sm font-light text-white tracking-wider">408</span>
            </div>
            <span className="text-lg font-medium text-slate-800 tracking-wide">考研学习指南</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-500 hover:text-slate-800 transition-colors text-sm">功能</a>
            <a href="#subjects" className="text-slate-500 hover:text-slate-800 transition-colors text-sm">科目</a>
            <a href="#pricing" className="text-slate-500 hover:text-slate-800 transition-colors text-sm">价格</a>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/GalaxyPoke/408-Master"
              target="_blank"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="#download"
              className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 text-sm"
            >
              <Download className="w-4 h-4" />
              免费下载
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-slate-100 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-slate-100 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-slate-50 to-white rounded-full blur-3xl opacity-80" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-xl mb-8">
          <span className="text-2xl font-light text-white tracking-wider">408</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-medium text-slate-800 mb-4 leading-tight tracking-tight">
          让备考更<span className="text-slate-600">高效</span>
        </h1>
        <h1 className="text-5xl md:text-7xl font-medium text-slate-800 mb-8 leading-tight tracking-tight">
          让学习更<span className="text-slate-600">智能</span>
        </h1>
        
        <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
          408-Master 集成刷题、视频学习、笔记、学习管理等功能<br />
          帮助考研党科学规划、高效备考
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a 
            href="#download"
            className="group bg-gradient-to-r from-slate-800 to-slate-900 text-white px-8 py-4 rounded-2xl font-medium text-base hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-3 shadow-xl shadow-slate-900/20"
          >
            <Download className="w-5 h-5" />
            免费下载
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a 
            href="https://github.com/GalaxyPoke/408-Master"
            target="_blank"
            className="bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-medium text-base hover:bg-white hover:border-slate-300 transition-all flex items-center gap-3 shadow-lg"
          >
            <Github className="w-5 h-5" />
            查看源码
          </a>
        </div>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {["王道题库", "视频学习", "番茄钟", "学习打卡", "Markdown笔记", "思维导图"].map((feature) => (
            <span 
              key={feature}
              className="bg-white/80 backdrop-blur-sm border border-slate-100 text-slate-500 px-4 py-2 rounded-xl text-sm shadow-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
      
      {/* Scroll Indicator - minimal style */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-slate-300">
          <span className="text-xs tracking-wider">向下滚动</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

function TrustedSection() {
  return (
    <section className="py-12 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-slate-400 text-xs font-medium mb-8 tracking-wide">受到全国考研学子的信赖</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {["清华大学", "北京大学", "浙江大学", "上海交大", "复旦大学", "中科大"].map((uni) => (
            <span key={uni} className="text-slate-300 text-base font-medium">{uni}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "智能刷题系统",
      subtitle: "王道题库 · 错题记录 · 章节分类",
      description: "边看视频边刷题，3000+道精选题目覆盖408全部考点。视频讲到哪，题目刷到哪，学练结合效率翻倍。",
      gradient: "from-blue-600 via-cyan-500 to-teal-400",
      bgGradient: "from-blue-950/50 via-cyan-950/30 to-transparent",
      preview: <QuizPreviewFull />
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: "视频学习中心",
      subtitle: "本地视频 · 进度追踪 · 断点续播",
      description: "一边播放视频课程，一边记录笔记、刷题、截图。所有学习工具围绕视频展开，告别频繁切换窗口。",
      gradient: "from-purple-600 via-pink-500 to-rose-400",
      bgGradient: "from-purple-950/50 via-pink-950/30 to-transparent",
      preview: <VideoPreviewFull />
    },
    {
      icon: <Pencil className="w-8 h-8" />,
      title: "Markdown笔记",
      subtitle: "公式渲染 · 代码高亮 · 实时预览",
      description: "边听课边记笔记，支持LaTeX公式和代码高亮。视频暂停时快速记录重点，不打断学习节奏。",
      gradient: "from-orange-600 via-amber-500 to-yellow-400",
      bgGradient: "from-orange-950/50 via-amber-950/30 to-transparent",
      preview: <MarkdownPreviewFull />
    },
    {
      icon: <Timer className="w-8 h-8" />,
      title: "番茄钟专注",
      subtitle: "科学计时 · 悬浮窗口 · 专注模式",
      description: "悬浮窗计时，看视频时始终可见。25分钟专注学习+5分钟休息，科学规划视频学习时间。",
      gradient: "from-green-600 via-emerald-500 to-teal-400",
      bgGradient: "from-green-950/50 via-emerald-950/30 to-transparent",
      preview: <PomodoroPreviewFull />
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: "学习数据统计",
      subtitle: "热力图 · 打卡记录 · 成就系统",
      description: "自动统计视频学习时长、刷题数量、笔记字数。GitHub风格热力图，让每一天的努力都看得见。",
      gradient: "from-indigo-600 via-violet-500 to-purple-400",
      bgGradient: "from-indigo-950/50 via-violet-950/30 to-transparent",
      preview: <HeatmapPreviewFull />
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "思维导图",
      subtitle: "知识梳理 · 框架构建 · 可视化学习",
      description: "看完一章视频后，用思维导图梳理知识点。边学边整理，构建属于你自己的知识体系。",
      gradient: "from-pink-600 via-rose-500 to-red-400",
      bgGradient: "from-pink-950/50 via-rose-950/30 to-transparent",
      preview: <MindmapPreviewFull />
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Draw.IO 集成",
      subtitle: "专业绘图 · 流程图 · 架构图",
      description: "视频讲解算法流程时，同步绘制流程图加深理解。支持导出PNG/SVG，方便复习回顾。",
      gradient: "from-teal-600 via-emerald-500 to-green-400",
      bgGradient: "from-teal-950/50 via-emerald-950/30 to-transparent",
      preview: <DrawIOPreview />
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: "视频截图笔记",
      subtitle: "一键截图 · 自动关联 · 快速复习",
      description: "看到重点画面一键截图，自动记录视频时间点。复习时点击截图直接跳转，快速定位知识点。",
      gradient: "from-cyan-600 via-sky-500 to-blue-400",
      bgGradient: "from-cyan-950/50 via-sky-950/30 to-transparent",
      preview: <VideoScreenshotPreview />
    },
    {
      icon: <Pencil className="w-8 h-8" />,
      title: "手写画布",
      subtitle: "自由绘制 · 手写笔记 · 算法推演",
      description: "跟着视频一起推演算法，手写绘制数据结构图、公式推导。边听边画，理解更深刻。",
      gradient: "from-amber-600 via-orange-500 to-red-400",
      bgGradient: "from-amber-950/50 via-orange-950/30 to-transparent",
      preview: <DrawingBoardPreview />
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "飞书文档集成",
      subtitle: "云端同步 · 多端协作 · 团队共享",
      description: "学习笔记云端同步，换台电脑继续学习。与研友共享笔记，一起看视频讨论难点。",
      gradient: "from-blue-600 via-indigo-500 to-violet-400",
      bgGradient: "from-blue-950/50 via-indigo-950/30 to-transparent",
      preview: <FeishuPreview />
    },
    {
      icon: <Code2 className="w-8 h-8" />,
      title: "代码练习题",
      subtitle: "手写代码 · 在线编译 · 即时验证",
      description: "视频讲完算法后立即动手写代码，在线编译验证。看懂不等于会写，边学边练才能真正掌握。",
      gradient: "from-emerald-600 via-green-500 to-lime-400",
      bgGradient: "from-emerald-950/50 via-green-950/30 to-transparent",
      preview: <CodePracticePreview />
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI举一反三",
      subtitle: "智能分析 · 变式训练 · 深度理解",
      description: "刷题遇到不会的？AI分析错题原因，推荐相关视频章节复习，并生成变式题目强化训练。",
      gradient: "from-violet-600 via-purple-500 to-fuchsia-400",
      bgGradient: "from-violet-950/50 via-purple-950/30 to-transparent",
      preview: <AIPreview />
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "考研倒计时",
      subtitle: "精准计时 · 每日激励 · 目标可视化",
      description: "实时显示距离考研的天数、时分秒。每日更新励志语录，让你始终保持备考动力，目标清晰可见。",
      gradient: "from-red-600 via-orange-500 to-amber-400",
      bgGradient: "from-red-950/50 via-orange-950/30 to-transparent",
      preview: <CountdownPreview />
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "学习日历",
      subtitle: "任务规划 · 科目分类 · 进度追踪",
      description: "可视化的周/月日历视图，快速添加各科目学习任务。边看视频边规划，让复习计划一目了然。",
      gradient: "from-sky-600 via-blue-500 to-indigo-400",
      bgGradient: "from-sky-950/50 via-blue-950/30 to-transparent",
      preview: <CalendarPreview />
    }
  ];

  return (
    <section id="features">
      {features.map((feature, index) => (
        <div 
          key={index}
          className="min-h-screen flex items-center py-20 relative"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute ${index % 2 === 0 ? '-right-40' : '-left-40'} top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-slate-100 to-transparent rounded-full blur-3xl opacity-50`} />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Text Content */}
              <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="inline-flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg text-white">
                    {feature.icon}
                  </div>
                  <span className="text-slate-400 text-sm font-medium">{feature.subtitle}</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-medium text-slate-800 leading-tight">
                  {feature.title}
                </h2>
                
                <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                  {feature.description}
                </p>
                
                <a 
                  href="#download"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 rounded-xl font-medium text-sm hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                  立即体验
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              
              {/* Preview Window */}
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-slate-200 to-slate-100 rounded-3xl filter blur-2xl opacity-60" />
                  
                  {/* App Window */}
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] overflow-hidden">
                    {/* Window Header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-slate-400 text-xs ml-2">408-Master · {feature.title}</span>
                    </div>
                    {/* Preview Content */}
                    <div className="p-6 bg-white">
                      {feature.preview}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature number indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {features.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-slate-800 w-6' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function QuizPreviewFull() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">数据结构</span>
          <span className="text-slate-300">›</span>
          <span className="text-slate-500 text-sm">第3章 栈和队列</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">进度</span>
          <span className="text-slate-800 font-medium">12 / 50</span>
        </div>
      </div>
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
        <div className="flex items-start gap-3 mb-4">
          <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-600 text-xs font-medium">单选</span>
          <p className="text-slate-800">下列关于栈的叙述中，错误的是（）</p>
        </div>
        <div className="space-y-2 mt-4">
          {[
            { opt: "A", text: "栈是一种后进先出的线性表", correct: false },
            { opt: "B", text: "栈顶元素最先被删除", correct: false },
            { opt: "C", text: "栈底元素最先被删除", correct: true },
            { opt: "D", text: "压入栈的第一个元素在栈底", correct: false }
          ].map((option, i) => (
            <div 
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                option.correct 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium ${
                option.correct ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{option.opt}</span>
              <span className={`text-sm ${option.correct ? 'text-green-700' : 'text-slate-600'}`}>{option.text}</span>
              {option.correct && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm">
          <ArrowRight className="w-4 h-4 rotate-180" />
          上一题
        </button>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors text-xs">收藏</button>
          <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors text-xs">解析</button>
        </div>
        <button className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm">
          下一题
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function VideoPreviewFull() {
  return (
    <div className="space-y-4">
      <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
            <Play className="w-8 h-8 text-slate-800 ml-1" />
          </div>
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg bg-slate-900/80 text-white text-xs">1080P</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-4">
          <div className="flex items-center gap-3">
            <button className="text-white"><Play className="w-4 h-4" /></button>
            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-white rounded-full" />
            </div>
            <span className="text-white text-xs font-mono">12:34 / 45:20</span>
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-slate-800 font-medium">王道数据结构 - 第三章 栈和队列</h3>
          <div className="flex items-center gap-4 text-slate-400 text-sm mt-2">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 45分钟</span>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> 第3章</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">学习中 27%</span>
      </div>
    </div>
  );
}

function MarkdownPreviewFull() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex gap-1">
          {["编辑", "预览", "分屏"].map((tab, i) => (
            <button 
              key={tab}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                i === 2 ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >{tab}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <BookOpen className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 font-mono text-sm">
          <p className="text-purple-300"># 栈的基本操作</p>
          <p className="text-slate-300 mt-3">栈是一种**后进先出**的数据结构。</p>
          <p className="text-purple-300 mt-3">## 代码实现</p>
          <p className="text-slate-500 mt-2">```c</p>
          <p className="text-blue-300">void <span className="text-yellow-300">Push</span>(Stack *S, int x) {"{"}</p>
          <p className="text-slate-300 ml-4">S-&gt;data[++S-&gt;top] = x;</p>
          <p className="text-blue-300">{"}"}</p>
          <p className="text-slate-500">```</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 mb-3">栈的基本操作</h1>
          <p className="text-slate-600 text-sm">栈是一种<strong className="text-slate-800">后进先出</strong>的数据结构。</p>
          <h2 className="text-base font-semibold text-slate-800 mt-4 mb-2">代码实现</h2>
          <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs">
            <p><span className="text-blue-300">void</span> <span className="text-yellow-300">Push</span>(Stack *S, int x) {"{"}</p>
            <p className="text-slate-300 ml-4">S-&gt;data[++S-&gt;top] = x;</p>
            <p className="text-blue-300">{"}"}</p>
          </div>
          <h2 className="text-base font-semibold text-slate-800 mt-4 mb-2">时间复杂度</h2>
          <div className="text-center py-2 text-base text-slate-600 italic">T(n) = O(1)</div>
        </div>
      </div>
    </div>
  );
}

function PomodoroPreviewFull() {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="88" stroke="#e2e8f0" strokeWidth="10" fill="none" />
          <circle 
            cx="96" cy="96" r="88" 
            stroke="url(#pomodoroGradientLight)" 
            strokeWidth="10" 
            fill="none"
            strokeLinecap="round"
            strokeDasharray="553"
            strokeDashoffset="138"
          />
          <defs>
            <linearGradient id="pomodoroGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-medium text-slate-800 font-mono">18:42</span>
          <span className="text-slate-400 text-sm mt-1">专注时间</span>
        </div>
      </div>
      
      <div className="flex gap-4 mt-6">
        <button className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4v12l12-6L4 4z" transform="rotate(180 10 10)" />
          </svg>
        </button>
        <button className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-all">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
          </svg>
        </button>
        <button className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4v12l12-6L4 4z" />
          </svg>
        </button>
      </div>
      
      <div className="flex gap-2 mt-6">
        <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-600 text-xs font-medium">专注 25分钟</span>
        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs">短休息 5分钟</span>
        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs">长休息 15分钟</span>
      </div>
      
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
        <span>今日专注: <span className="text-slate-700">4小时32分</span></span>
        <span>完成番茄: <span className="text-green-600">11个</span></span>
      </div>
    </div>
  );
}

function HeatmapPreviewFull() {
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月"];
  const colors = ["bg-slate-100", "bg-green-200", "bg-green-300", "bg-green-400", "bg-green-500"];
  
  const data = [
    [0,2,3,1,4,2,0,3,2,1,4,3,2,1,0,2,3,4,1,2,3,0,1,2,4,3,2,1,0,2],
    [1,3,2,4,0,1,3,2,4,1,0,2,3,4,1,3,2,0,4,1,2,3,4,0,1,2,3,4,1,0],
    [2,1,4,0,3,2,1,4,0,3,2,1,4,0,3,2,1,4,0,3,2,1,4,0,3,2,1,4,0,3],
    [3,4,0,2,1,3,4,0,2,1,3,4,0,2,1,3,4,0,2,1,3,4,0,2,1,3,4,0,2,1],
    [4,0,1,3,2,4,0,1,3,2,4,0,1,3,2,4,0,1,3,2,4,0,1,3,2,4,0,1,3,2],
    [0,1,2,4,3,0,1,2,4,3,0,1,2,4,3,0,1,2,4,3,0,1,2,4,3,0,1,2,4,3],
    [1,2,3,0,4,1,2,3,0,4,1,2,3,0,4,1,2,3,0,4,1,2,3,0,4,1,2,3,0,4]
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-800 font-medium">学习打卡记录</h3>
        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-slate-500 text-sm">
          <option>2024年</option>
        </select>
      </div>
      
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <div className="flex gap-1 text-xs text-slate-400 mb-2 ml-6">
          {months.map(m => <span key={m} className="w-[28px] text-center">{m}</span>)}
        </div>
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 text-xs text-slate-400 pr-1">
            {["一", "", "三", "", "五", "", "日"].map((d, i) => (
              <span key={i} className="h-3 leading-3 w-4 text-right">{d}</span>
            ))}
          </div>
          <div className="flex gap-[2px] overflow-hidden">
            {Array.from({ length: 30 }).map((_, week) => (
              <div key={week} className="flex flex-col gap-[2px]">
                {Array.from({ length: 7 }).map((_, day) => (
                  <div 
                    key={day} 
                    className={`w-3 h-3 rounded-sm ${colors[data[day][week]]} hover:ring-1 hover:ring-slate-400 transition-all cursor-pointer`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end mt-3 text-xs text-slate-400">
          <span>少</span>
          {colors.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
          <span>多</span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: "186", label: "总打卡", color: "text-slate-800" },
          { value: "23", label: "连续打卡", color: "text-green-600" },
          { value: "4.5h", label: "日均学习", color: "text-slate-800" },
          { value: "92%", label: "本月完成率", color: "text-slate-800" }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <div className={`text-xl font-medium ${stat.color}`}>{stat.value}</div>
            <div className="text-slate-400 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MindmapPreviewFull() {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-800 font-medium">数据结构知识体系</span>
          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-xs">编辑中</span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors text-xs">缩放</button>
          <button className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors text-xs">导出</button>
        </div>
      </div>
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
        <svg className="w-full h-[220px]" viewBox="0 0 500 220">
          {/* 连接线 - 曲线 */}
          <path d="M250 110 Q175 80 120 55" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M250 110 Q175 110 120 110" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M250 110 Q175 140 120 165" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M250 110 Q325 80 380 55" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M250 110 Q325 110 380 110" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          <path d="M250 110 Q325 140 380 165" stroke="#cbd5e1" strokeWidth="2" fill="none" />
          
          {/* 中心节点 */}
          <rect x="200" y="85" width="100" height="50" rx="10" fill="#1e293b" />
          <text x="250" y="115" textAnchor="middle" fill="white" fontSize="13" fontWeight="500">数据结构</text>
          
          {/* 左侧节点 */}
          <rect x="50" y="35" width="90" height="36" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="95" y="58" textAnchor="middle" fill="#475569" fontSize="11">线性表</text>
          
          <rect x="50" y="92" width="90" height="36" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="95" y="115" textAnchor="middle" fill="#475569" fontSize="11">栈和队列</text>
          
          <rect x="50" y="149" width="90" height="36" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="95" y="172" textAnchor="middle" fill="#475569" fontSize="11">树与二叉树</text>
          
          {/* 右侧节点 */}
          <rect x="360" y="35" width="90" height="36" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="405" y="58" textAnchor="middle" fill="#475569" fontSize="11">图</text>
          
          <rect x="360" y="92" width="90" height="36" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="405" y="115" textAnchor="middle" fill="#475569" fontSize="11">查找算法</text>
          
          <rect x="360" y="149" width="90" height="36" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="405" y="172" textAnchor="middle" fill="#475569" fontSize="11">排序算法</text>
        </svg>
      </div>
    </div>
  );
}

function VideoScreenshotPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-800 font-medium">视频截图笔记</h3>
        <span className="text-slate-400 text-sm">共 8 张截图</span>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {[
          { time: "02:34", title: "栈的定义" },
          { time: "08:12", title: "入栈操作" },
          { time: "15:45", title: "出栈操作" },
          { time: "23:18", title: "栈的应用" }
        ].map((item, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="relative bg-slate-700 rounded-lg overflow-hidden aspect-video mb-2">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/50">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-xs font-mono">
                {item.time}
              </div>
            </div>
            <p className="text-slate-600 text-xs truncate group-hover:text-slate-800 transition-colors">{item.title}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-20 h-14 bg-slate-700 rounded-lg shrink-0 relative overflow-hidden">
            <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-slate-900/80 text-white text-xs font-mono">02:34</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-slate-800 font-medium text-sm">栈的定义</span>
              <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-600 text-xs">已关联</span>
            </div>
            <p className="text-slate-500 text-xs">栈是只允许在一端进行插入或删除操作的线性表...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawingBoardPreview() {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      {/* Title bar */}
      <div className="bg-blue-50 border-b border-blue-100 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-blue-500" />
          <span className="text-slate-700 text-sm font-medium">手写笔记</span>
          <span className="text-slate-400 text-xs">- 手写/绘图</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-6 h-6 rounded hover:bg-blue-100 flex items-center justify-center text-slate-400">⊡</button>
          <button className="w-6 h-6 rounded hover:bg-red-100 flex items-center justify-center text-red-400">×</button>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-100 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Drawing tools */}
          <button className="w-7 h-7 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
            <Pencil className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm">✎</button>
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm">◇</button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm">—</button>
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm">□</button>
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm">○</button>
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm">T</button>
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm">🖼</button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          {/* Color picker */}
          <button className="w-7 h-7 rounded flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-white shadow" />
          </button>
          <span className="text-slate-300 text-xs mx-1">—●+</span>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          {/* Undo/Redo */}
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm">↩</button>
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm">↪</button>
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-orange-400 flex items-center justify-center text-sm">🗑</button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm">▦</button>
        </div>
        
        {/* Right buttons */}
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 text-slate-500 text-xs flex items-center gap-1 hover:bg-slate-100 rounded">
            <Download className="w-3 h-3" /> PNG
          </button>
          <button className="px-2 py-1 text-slate-500 text-xs flex items-center gap-1 hover:bg-slate-100 rounded">
            <Download className="w-3 h-3" /> SVG
          </button>
          <button className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded flex items-center gap-1">
            💾 保存笔记
          </button>
          <button className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded flex items-center gap-1">
            <Github className="w-3 h-3" /> 连接GitHub
          </button>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="bg-white min-h-[200px]">
        {/* Empty white canvas */}
      </div>
      
      {/* Status bar */}
      <div className="bg-slate-50 border-t border-slate-100 px-3 py-1.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>工具: 画笔</span>
          <span>线宽: 3px</span>
          <span>图形: 0个</span>
        </div>
        <span>历史: 1/2</span>
      </div>
    </div>
  );
}

function FeishuPreview() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Title bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <span className="text-slate-700 text-sm font-medium">飞书文档</span>
          <span className="text-slate-400 text-xs">(ESC关闭)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-500 text-xs">↗ 新窗口</span>
          <button className="w-6 h-6 rounded-full bg-slate-300 hover:bg-slate-400 flex items-center justify-center text-white text-xs">×</button>
        </div>
      </div>
      
      <div className="flex">
        {/* Left sidebar */}
        <div className="w-40 bg-slate-50 border-r border-slate-100 p-2">
          <div className="flex items-center gap-2 p-2 text-slate-600 text-xs">
            <span>≡</span>
            <span>飞书云文档</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-600 text-xs rounded mb-1">
            <span className="w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center text-xs">考</span>
            <span>考研-408</span>
          </div>
          <div className="flex items-center gap-2 p-2 text-slate-500 text-xs">
            <span>🔍</span>
            <span>搜索</span>
          </div>
          <div className="text-slate-400 text-xs p-2">目录</div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-600 text-xs rounded">
            <span>📄</span>
            <span>首页</span>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-3">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-slate-400">
              用户的飞书 &gt; 考研-408 &gt; <span className="text-slate-600">首页</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded">分享</button>
              <button className="px-2 py-1 text-slate-500 text-xs">✏️ 编辑</button>
            </div>
          </div>
          
          {/* Cover image */}
          <div className="h-20 bg-gradient-to-r from-blue-100 via-blue-50 to-slate-100 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-slate-400 text-xs">📚 知识库封面</span>
          </div>
          
          {/* Content */}
          <div className="flex gap-4">
            {/* TOC */}
            <div className="w-24 text-xs space-y-1">
              <div className="text-slate-400">«</div>
              <div className="text-blue-500 font-medium">首页</div>
              <div className="text-slate-500">🎯 愿景和目标</div>
              <div className="text-slate-500">📖 知识空间简介</div>
              <div className="text-slate-500">⭐ 常用文档</div>
            </div>
            
            {/* Document content */}
            <div className="flex-1 text-xs">
              <h3 className="text-lg font-medium text-slate-800 mb-2">首页</h3>
              <p className="text-slate-500 mb-3 border-l-2 border-slate-200 pl-2">在首页你可以对空间进行说明...</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <span>🎯</span>
                  <span className="font-medium">愿景和目标</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span>📖</span>
                  <span className="font-medium">知识空间简介</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom toolbar */}
      <div className="bg-slate-50 border-t border-slate-100 px-3 py-1.5 flex items-center gap-4 text-xs text-slate-400">
        <span>💬</span>
        <span>✏️</span>
        <span>📎</span>
        <span className="ml-auto">最近修改: 2025年12月23日</span>
      </div>
    </div>
  );
}

function DrawIOPreview() {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      {/* Title bar */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
            <GitBranch className="w-3 h-3 text-white" />
          </div>
          <span className="text-slate-700 text-sm font-medium">Draw.io 流程图编辑器</span>
        </div>
        <span className="text-slate-400 text-xs">关闭</span>
      </div>
      
      {/* Menu bar */}
      <div className="bg-white border-b border-slate-100 px-3 py-1.5 flex items-center gap-4">
        {["文件", "编辑", "查看", "调整图形", "其它", "帮助"].map((menu, i) => (
          <span key={i} className="text-slate-600 text-xs hover:text-slate-800 cursor-pointer">{menu}</span>
        ))}
      </div>
      
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-100 px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">100%</span>
          <div className="flex gap-1">
            <button className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400">+</button>
            <button className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400">−</button>
          </div>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <div className="flex gap-0.5">
            {["↩", "↪", "🗑", "📋"].map((icon, i) => (
              <button key={i} className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 text-xs">{icon}</button>
            ))}
          </div>
        </div>
        <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded">保存</button>
      </div>
      
      <div className="flex">
        {/* Left sidebar - Shape library */}
        <div className="w-36 bg-white border-r border-slate-100 p-2">
          <div className="mb-2">
            <div className="text-xs text-slate-500 mb-1">▼ 便签本</div>
            <div className="text-xs text-slate-400 px-2 py-1 border border-dashed border-slate-200 rounded text-center">拖元素到此处</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-2">▼ 通用</div>
            <div className="grid grid-cols-4 gap-1">
              {/* Row 1 */}
              <div className="w-6 h-6 border border-slate-300 rounded-sm" />
              <div className="w-6 h-6 border border-slate-300 rounded-full" />
              <div className="w-6 h-6 border border-slate-300 rounded-sm" style={{borderRadius: '0 50% 50% 0'}} />
              <div className="w-6 h-6 flex items-center justify-center"><div className="w-4 h-4 border border-slate-300 rotate-45" /></div>
              {/* Row 2 */}
              <div className="w-6 h-6 border border-slate-300" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}} />
              <div className="w-6 h-6 border border-slate-300 rounded-lg" />
              <div className="w-6 h-6 border border-slate-300" style={{clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'}} />
              <div className="w-6 h-6 border border-slate-300" style={{clipPath: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)'}} />
            </div>
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 bg-white p-2 min-h-[180px] relative" style={{backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '12px 12px'}}>
          {/* Empty canvas with grid */}
        </div>
        
        {/* Right panel */}
        <div className="w-32 bg-white border-l border-slate-100 p-2 text-xs">
          <div className="flex border-b border-slate-100 mb-2">
            <span className="px-2 py-1 text-blue-500 border-b-2 border-blue-500">绘图</span>
            <span className="px-2 py-1 text-slate-400">样式</span>
          </div>
          <div className="space-y-2">
            <div className="text-slate-500">查看</div>
            <label className="flex items-center gap-1 text-slate-600">
              <input type="checkbox" className="w-3 h-3" defaultChecked /> 网格
            </label>
            <label className="flex items-center gap-1 text-slate-600">
              <input type="checkbox" className="w-3 h-3" defaultChecked /> 页面视图
            </label>
            <div className="text-slate-500 mt-2">页面尺寸</div>
            <div className="text-slate-600">A4 (210mm x 297mm)</div>
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="bg-white border-t border-slate-100 px-3 py-1.5 flex items-center gap-2">
        <button className="text-blue-500 text-xs">+ 更多图形</button>
        <span className="text-slate-400 text-xs ml-auto">第 1 页</span>
      </div>
    </div>
  );
}

function CodePracticePreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-800 font-medium">链表反转</span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-600 text-xs">中等</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs">重置</button>
          <button className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs">运行</button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-3 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-700">C++</span>
            <span>solution.cpp</span>
          </div>
          <pre className="text-slate-300 leading-relaxed">
<span className="text-blue-300">ListNode</span>* <span className="text-yellow-300">reverseList</span>(<span className="text-blue-300">ListNode</span>* head) {"{"}
  <span className="text-blue-300">ListNode</span>* prev = <span className="text-purple-300">nullptr</span>;
  <span className="text-blue-300">ListNode</span>* curr = head;
  <span className="text-purple-300">while</span> (curr != <span className="text-purple-300">nullptr</span>) {"{"}
    <span className="text-blue-300">ListNode</span>* next = curr-&gt;next;
    curr-&gt;next = prev;
    prev = curr;
    curr = next;
  {"}"}
  <span className="text-purple-300">return</span> prev;
{"}"}
          </pre>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="text-slate-500 text-xs mb-2">运行结果</div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-1">
              <CheckCircle className="w-4 h-4" />
              通过所有测试用例
            </div>
            <div className="text-green-600 text-xs">执行用时: 4ms | 内存消耗: 8.2MB</div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>测试用例 1</span>
              <span className="text-green-500">✓ 通过</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>测试用例 2</span>
              <span className="text-green-500">✓ 通过</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>测试用例 3</span>
              <span className="text-green-500">✓ 通过</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-800 font-medium">AI 举一反三</span>
        </div>
        <span className="px-2 py-1 rounded-full bg-violet-100 text-violet-600 text-xs">智能分析中</span>
      </div>
      
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-red-500 text-xs">✗</span>
          </div>
          <div>
            <p className="text-slate-700 text-sm font-medium mb-1">原题：栈的出栈序列判断</p>
            <p className="text-slate-500 text-xs">你在此题上答错了2次，AI已分析你的薄弱点</p>
          </div>
        </div>
        
        <div className="bg-violet-50 rounded-lg p-3 border border-violet-100 mb-4">
          <div className="flex items-center gap-2 text-violet-700 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            AI 分析
          </div>
          <p className="text-violet-600 text-xs leading-relaxed">
            你对"栈的入栈出栈顺序"概念理解存在偏差。建议重点复习：1) 栈的LIFO特性 2) 合法出栈序列的判定方法
          </p>
        </div>
        
        <div className="text-slate-700 text-sm font-medium mb-2">为你生成的变式题目：</div>
        <div className="space-y-2">
          {[
            { title: "队列的入队出队序列", difficulty: "简单", color: "green" },
            { title: "双栈模拟队列", difficulty: "中等", color: "amber" },
            { title: "栈的最小元素", difficulty: "中等", color: "amber" }
          ].map((q, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:border-slate-200 cursor-pointer transition-colors">
              <span className="text-slate-600 text-xs">{q.title}</span>
              <span className={`px-2 py-0.5 rounded-lg text-xs ${q.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{q.difficulty}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CountdownPreview() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-w-xs mx-auto">
      {/* Red header */}
      <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span className="font-medium">2026年1月</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span>🕐</span>
          <span>14:55</span>
        </div>
      </div>
      
      {/* Date display */}
      <div className="p-6 text-center">
        <div className="text-7xl font-light text-slate-800 mb-2">7</div>
        <div className="text-slate-600 mb-4">
          <span className="font-medium">星期三</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>正月初八</span>
        </div>
        
        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 text-blue-500 text-sm mb-2">
          <span>◎</span>
          <span>距离考研还有</span>
          <span>⚙️</span>
        </div>
        
        <div className="flex items-baseline justify-center gap-1 mb-1">
          <span className="text-4xl font-bold text-slate-800">346</span>
          <span className="text-slate-500 text-sm">天</span>
          <span className="text-2xl font-bold text-slate-800 ml-2">09</span>
          <span className="text-slate-500 text-sm">时</span>
          <span className="text-2xl font-bold text-slate-800">04</span>
          <span className="text-slate-500 text-sm">分</span>
          <span className="text-2xl font-bold text-slate-800">49</span>
          <span className="text-slate-500 text-sm">秒</span>
        </div>
        
        <div className="text-slate-400 text-sm mb-4">目标: 2026-12-20</div>
        
        {/* Quote card */}
        <div className="bg-amber-50 rounded-xl p-4 text-sm">
          <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
            <span>✨</span>
            <span>🖼</span>
            <span>动画</span>
            <span>&gt;</span>
            <span>🔄</span>
          </div>
          <p className="text-slate-600 italic mb-2">&ldquo;我对Darling啊，最喜欢了。我们从今以后，都要在一起哦。&rdquo;</p>
          <p className="text-slate-400 text-xs">—「Darling in the FRANXX」</p>
        </div>
        
        <div className="text-blue-500 text-sm mt-4">点击查看今日任务 &gt;</div>
      </div>
      
      {/* Bottom gradient */}
      <div className="h-1 bg-gradient-to-r from-red-400 via-amber-400 to-yellow-400" />
    </div>
  );
}

function CalendarPreview() {
  const hours = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00"];
  const days = [
    { day: 5, week: "周一" },
    { day: 6, week: "周二" },
    { day: 7, week: "周三", current: true },
    { day: 8, week: "周四" },
    { day: 9, week: "周五" },
    { day: 10, week: "周六" },
    { day: 11, week: "周日" }
  ];
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <div>
              <div className="font-medium text-slate-800">学习日历</div>
              <div className="text-xs text-slate-400">规划你的408复习计划</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">快速添加:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-600">◇ 数据结构</span>
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-600">⚙ 计算机组成</span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-600">🖥 操作系统</span>
            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-600">🌐 计算机网络</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button className="px-2 py-1 border border-slate-200 rounded text-slate-600">今天</button>
            <button className="px-2 py-1 text-slate-400">上一页</button>
            <button className="px-2 py-1 text-slate-400">下一页</button>
            <span className="font-medium text-slate-700 ml-2">1月5日 - 1月11日</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <button className="px-2 py-1 text-slate-400">月</button>
            <button className="px-2 py-1 bg-blue-500 text-white rounded">周</button>
            <button className="px-2 py-1 text-slate-400">日</button>
            <button className="px-2 py-1 text-slate-400">日程</button>
          </div>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="flex">
        {/* Time column */}
        <div className="w-12 border-r border-slate-100">
          <div className="h-8" />
          {hours.map((h, i) => (
            <div key={i} className="h-8 text-xs text-slate-400 text-right pr-2 pt-1">{h}</div>
          ))}
        </div>
        
        {/* Days columns */}
        <div className="flex-1 grid grid-cols-7">
          {/* Header row */}
          {days.map((d, i) => (
            <div key={i} className={`h-8 border-b border-slate-100 text-center text-xs py-1 ${d.current ? 'bg-blue-50' : ''}`}>
              <span className="text-slate-400">{d.day} </span>
              <span className={d.current ? 'text-blue-500 font-medium' : 'text-slate-500'}>{d.week}</span>
            </div>
          ))}
          
          {/* Grid cells */}
          {hours.map((_, hi) => (
            days.map((d, di) => (
              <div 
                key={`${hi}-${di}`} 
                className={`h-8 border-b border-r border-slate-50 ${d.current ? 'bg-blue-50/50' : ''}`}
              />
            ))
          ))}
        </div>
      </div>
      
      {/* Current time indicator */}
      <div className="relative">
        <div className="absolute left-12 right-0 top-0 border-t-2 border-red-500" style={{marginTop: '-80px'}}>
          <div className="w-2 h-2 rounded-full bg-red-500 -mt-1 -ml-1" />
        </div>
      </div>
    </div>
  );
}

function QuizPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-indigo-400 text-sm font-medium">数据结构 &gt; 第3章 栈和队列</span>
        <span className="text-gray-400 text-sm">12 / 50</span>
      </div>
      <div className="bg-white/5 rounded-xl p-5">
        <p className="text-white mb-4">下列关于栈的叙述中，错误的是（）</p>
        <div className="space-y-3">
          {[
            "A. 栈是一种后进先出的线性表",
            "B. 栈顶元素最先被删除",
            "C. 栈底元素最先被删除",
            "D. 压入栈的第一个元素在栈底"
          ].map((option, i) => (
            <div 
              key={i}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                i === 2 
                  ? 'border-green-500 bg-green-500/10 text-green-400' 
                  : 'border-white/10 hover:border-white/30 text-gray-300'
              }`}
            >
              {option}
              {i === 2 && <CheckCircle className="w-4 h-4 inline ml-2" />}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">上一题</button>
        <button className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">下一题</button>
      </div>
    </div>
  );
}

function VideoPreview() {
  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-indigo-500 rounded-full" />
            </div>
            <span className="text-white text-sm">12:34 / 45:20</span>
          </div>
        </div>
      </div>
      <div className="text-white font-medium">王道数据结构 - 第三章 栈和队列</div>
      <div className="flex items-center gap-4 text-gray-400 text-sm">
        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 45分钟</span>
        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> 第3章</span>
        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">学习中</span>
      </div>
    </div>
  );
}

function MarkdownPreview() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-white/10 pb-3">
        {["编辑", "预览"].map((tab, i) => (
          <button 
            key={tab}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              i === 0 ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >{tab}</button>
        ))}
      </div>
      <div className="bg-white/5 rounded-lg p-4 font-mono text-sm">
        <p className="text-purple-400"># 栈的基本操作</p>
        <p className="text-gray-300 mt-2">栈是一种**后进先出**的数据结构。</p>
        <p className="text-gray-300 mt-2">## 代码实现</p>
        <div className="bg-black/30 rounded p-3 mt-2">
          <p className="text-blue-400">void</p>
          <p className="text-yellow-400 ml-2">Push(Stack *S, int x) {"{"}</p>
          <p className="text-gray-300 ml-4">S-&gt;data[++S-&gt;top] = x;</p>
          <p className="text-yellow-400 ml-2">{"}"}</p>
        </div>
        <p className="text-gray-300 mt-2">## 公式</p>
        <p className="text-cyan-400 mt-1">$$ T(n) = O(1) $$</p>
      </div>
    </div>
  );
}

function PomodoroPreview() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
          <circle 
            cx="96" cy="96" r="88" 
            stroke="url(#pomodoroGradient)" 
            strokeWidth="8" 
            fill="none"
            strokeLinecap="round"
            strokeDasharray="553"
            strokeDashoffset="138"
          />
          <defs>
            <linearGradient id="pomodoroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">18:42</span>
          <span className="text-gray-400 text-sm mt-1">专注中</span>
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
          </svg>
        </button>
        <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4v12l12-6L4 4z" />
          </svg>
        </button>
      </div>
      <div className="flex gap-4 mt-6 text-sm">
        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">专注 25分钟</span>
        <span className="px-3 py-1 rounded-full bg-white/10 text-gray-400">休息 5分钟</span>
      </div>
    </div>
  );
}

function HeatmapPreview() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const heatmapData = [
    [0,2,3,1,4,2,0,3,2,1,4,3,2,1,0,2,3,4,1,2,3,0,1,2,4,3],
    [1,3,2,4,0,1,3,2,4,1,0,2,3,4,1,3,2,0,4,1,2,3,4,0,1,2],
    [2,1,4,0,3,2,1,4,0,3,2,1,4,0,3,2,1,4,0,3,2,1,4,0,3,2],
    [3,4,0,2,1,3,4,0,2,1,3,4,0,2,1,3,4,0,2,1,3,4,0,2,1,3],
    [4,0,1,3,2,4,0,1,3,2,4,0,1,3,2,4,0,1,3,2,4,0,1,3,2,4],
    [0,1,2,4,3,0,1,2,4,3,0,1,2,4,3,0,1,2,4,3,0,1,2,4,3,0],
    [1,2,3,0,4,1,2,3,0,4,1,2,3,0,4,1,2,3,0,4,1,2,3,0,4,1]
  ];
  const colors = ["bg-gray-800", "bg-green-900", "bg-green-700", "bg-green-500", "bg-green-400"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white font-medium">学习打卡记录</span>
        <span className="text-gray-400 text-sm">2024年</span>
      </div>
      <div className="flex gap-1 text-xs text-gray-500 mb-2 ml-8">
        {months.map(m => <span key={m} className="w-[52px] text-center">{m}</span>)}
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 text-xs text-gray-500 pr-2">
          {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((d, i) => (
            <span key={i} className="h-3 leading-3">{d}</span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {Array.from({ length: 26 }).map((_, week) => (
            <div key={week} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, day) => (
                <div 
                  key={day} 
                  className={`w-3 h-3 rounded-sm ${colors[heatmapData[day][week]]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end mt-4 text-xs text-gray-400">
        <span>Less</span>
        {colors.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
        <span>More</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">156</div>
          <div className="text-gray-400 text-xs">总打卡天数</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">23</div>
          <div className="text-gray-400 text-xs">连续打卡</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-indigo-400">4.2h</div>
          <div className="text-gray-400 text-xs">日均学习</div>
        </div>
      </div>
    </div>
  );
}

function MindmapPreview() {
  return (
    <div className="relative min-h-[300px]">
      <svg className="w-full h-full" viewBox="0 0 400 300">
        {/* 连接线 */}
        <path d="M200 150 L100 80" stroke="rgba(129,140,248,0.5)" strokeWidth="2" fill="none" />
        <path d="M200 150 L100 150" stroke="rgba(129,140,248,0.5)" strokeWidth="2" fill="none" />
        <path d="M200 150 L100 220" stroke="rgba(129,140,248,0.5)" strokeWidth="2" fill="none" />
        <path d="M200 150 L300 80" stroke="rgba(167,139,250,0.5)" strokeWidth="2" fill="none" />
        <path d="M200 150 L300 150" stroke="rgba(167,139,250,0.5)" strokeWidth="2" fill="none" />
        <path d="M200 150 L300 220" stroke="rgba(167,139,250,0.5)" strokeWidth="2" fill="none" />
        
        {/* 中心节点 */}
        <rect x="150" y="125" width="100" height="50" rx="8" fill="url(#centerGradient)" />
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">数据结构</text>
        
        {/* 左侧节点 */}
        <rect x="40" y="60" width="80" height="36" rx="6" fill="rgba(99,102,241,0.3)" stroke="rgba(99,102,241,0.5)" />
        <text x="80" y="83" textAnchor="middle" fill="#a5b4fc" fontSize="12">线性表</text>
        
        <rect x="40" y="132" width="80" height="36" rx="6" fill="rgba(99,102,241,0.3)" stroke="rgba(99,102,241,0.5)" />
        <text x="80" y="155" textAnchor="middle" fill="#a5b4fc" fontSize="12">栈和队列</text>
        
        <rect x="40" y="204" width="80" height="36" rx="6" fill="rgba(99,102,241,0.3)" stroke="rgba(99,102,241,0.5)" />
        <text x="80" y="227" textAnchor="middle" fill="#a5b4fc" fontSize="12">树</text>
        
        {/* 右侧节点 */}
        <rect x="280" y="60" width="80" height="36" rx="6" fill="rgba(168,85,247,0.3)" stroke="rgba(168,85,247,0.5)" />
        <text x="320" y="83" textAnchor="middle" fill="#c4b5fd" fontSize="12">图</text>
        
        <rect x="280" y="132" width="80" height="36" rx="6" fill="rgba(168,85,247,0.3)" stroke="rgba(168,85,247,0.5)" />
        <text x="320" y="155" textAnchor="middle" fill="#c4b5fd" fontSize="12">查找</text>
        
        <rect x="280" y="204" width="80" height="36" rx="6" fill="rgba(168,85,247,0.3)" stroke="rgba(168,85,247,0.5)" />
        <text x="320" y="227" textAnchor="middle" fill="#c4b5fd" fontSize="12">排序</text>
        
        <defs>
          <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function SubjectsSection() {
  const subjects = [
    {
      icon: <Database className="w-8 h-8" />,
      name: "数据结构",
      topics: ["线性表", "栈与队列", "树与二叉树", "图", "查找", "排序"],
      color: "indigo",
      questions: "800+"
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      name: "计算机组成原理",
      topics: ["计算机系统概述", "数据表示", "存储系统", "指令系统", "CPU", "总线"],
      color: "purple",
      questions: "900+"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      name: "操作系统",
      topics: ["进程管理", "内存管理", "文件系统", "I/O管理", "死锁"],
      color: "pink",
      questions: "850+"
    },
    {
      icon: <Network className="w-8 h-8" />,
      name: "计算机网络",
      topics: ["网络体系结构", "物理层", "数据链路层", "网络层", "传输层", "应用层"],
      color: "cyan",
      questions: "750+"
    }
  ];

  const colorMap: Record<string, string> = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-pink-600",
    cyan: "from-cyan-500 to-cyan-600"
  };

  return (
    <section id="subjects" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-slate-800 mb-4">
            四大核心科目
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            完整覆盖408统考全部知识点，题库持续更新
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {subjects.map((subject, index) => (
            <div 
              key={index}
              className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.15)] transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                  {subject.icon}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-slate-800">{subject.name}</h3>
                  <p className="text-slate-400 text-sm">{subject.questions} 道题目</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {subject.topics.map((topic, i) => (
                  <span 
                    key={i}
                    className="bg-slate-50 text-slate-500 px-3 py-1 rounded-xl text-sm border border-slate-100"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolsSection() {
  const tools = [
    { icon: <Timer className="w-5 h-5" />, name: "番茄钟", desc: "专注学习" },
    { icon: <Target className="w-5 h-5" />, name: "学习打卡", desc: "每日坚持" },
    { icon: <LineChart className="w-5 h-5" />, name: "热力图", desc: "可视化进度" },
    { icon: <Clock className="w-5 h-5" />, name: "倒计时", desc: "考研倒计时" },
    { icon: <Pencil className="w-5 h-5" />, name: "笔记本", desc: "Markdown编辑" },
    { icon: <Layers className="w-5 h-5" />, name: "思维导图", desc: "DrawIO集成" },
    { icon: <Code2 className="w-5 h-5" />, name: "算法练习", desc: "手写代码" },
    { icon: <BookOpen className="w-5 h-5" />, name: "公式速查", desc: "快速复习" },
  ];

  return (
    <section id="tools" className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-slate-800 mb-4">
            丰富的学习工具
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            一站式集成你需要的所有学习工具
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <div 
              key={index}
              className="group bg-white/70 backdrop-blur-xl rounded-2xl p-6 text-center shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] border border-white/50 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mx-auto mb-3 text-white shadow-lg group-hover:scale-105 transition-transform">
                {tool.icon}
              </div>
              <h3 className="text-slate-800 font-medium mb-1">{tool.name}</h3>
              <p className="text-slate-400 text-sm">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "3000+", label: "题库数量", icon: <BookOpen className="w-6 h-6" /> },
    { value: "98%", label: "用户满意度", icon: <Star className="w-6 h-6" /> },
    { value: "10000+", label: "学习用户", icon: <Users className="w-6 h-6" /> },
    { value: "4.9", label: "综合评分", icon: <Trophy className="w-6 h-6" /> },
  ];

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-medium text-slate-800 mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      content: "408-Master真的帮了我大忙！题库质量很高，配合视频学习效率翻倍。最后408考了130+，推荐给所有考研党！",
      author: "张同学",
      role: "2024届考生 | 上岸985",
      avatar: "Z"
    },
    {
      content: "番茄钟和学习打卡功能太好用了，帮我养成了每天坚持学习的习惯。热力图看着满满的成就感！",
      author: "李同学", 
      role: "2024届考生 | 上岸211",
      avatar: "L"
    },
    {
      content: "Markdown笔记功能简直是神器，代码高亮+公式渲染，复习的时候特别方便。思维导图帮我梳理了整个知识体系。",
      author: "王同学",
      role: "2024届考生 | 上岸C9",
      avatar: "W"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-slate-800 mb-4">
            来自考研成功者的声音
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            听听他们如何通过408-Master实现自己的考研梦想
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.15)] transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">&quot;{testimonial.content}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-medium shadow-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-slate-800 font-medium text-sm">{testimonial.author}</div>
                  <div className="text-slate-400 text-xs">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-slate-800 mb-4">
            选择适合你的版本
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            一次购买，永久使用。助你高效备战408
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* 基础版 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50">
            <div className="text-center mb-6">
              <h3 className="text-xl font-medium text-slate-800 mb-2">基础版</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-medium text-slate-800">¥59</span>
                <span className="text-slate-400">/永久</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "3000+ 选择题题库",
                "视频学习中心",
                "Markdown笔记",
                "番茄钟 & 学习打卡",
                "学习热力图统计",
                "思维导图集成",
                "手写画布功能"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <a 
              href="#download"
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              获取基础版
            </a>
          </div>
          
          {/* 专业版 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border-2 border-slate-800 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-800 text-white text-xs font-medium rounded-full">
              推荐
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-medium text-slate-800 mb-2">专业版</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-medium text-slate-800">¥99</span>
                <span className="text-slate-400">/永久</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "包含基础版全部功能",
                "代码练习题 + 在线编译",
                "AI 举一反三智能分析",
                "AI 错题分析 & 变式训练",
                "飞书文档云端同步",
                "视频截图笔记功能",
                "优先技术支持",
                "终身免费更新"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <a 
              href="#download"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white font-medium text-sm hover:from-slate-700 hover:to-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              获取专业版
            </a>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-slate-400 text-sm mb-4">
            购买后获得激活卡密，在应用内激活即可使用
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              安全支付
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              永久授权
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              即时发货
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="download" className="min-h-screen flex items-center justify-center py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-slate-100 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-slate-100 to-transparent rounded-full blur-3xl opacity-60" />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="text-center mb-10">
              {/* Logo */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl mb-8 shadow-2xl">
                <span className="text-3xl font-light text-white tracking-wider">408</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-medium text-slate-800 mb-4">
                开始你的考研之旅
              </h2>
              <p className="text-slate-500 max-w-md mx-auto">
                一站式备考工具，助你高效复习，轻松上岸
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <a 
                href="https://github.com/GalaxyPoke/408-Master/releases"
                target="_blank"
                className="group px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl font-medium hover:from-slate-700 hover:to-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Laptop className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-300">立即下载</div>
                  <div className="font-semibold">Windows 桌面版</div>
                </div>
              </a>
              
              <a 
                href="https://github.com/GalaxyPoke/408-Master"
                target="_blank"
                className="group px-8 py-4 bg-white/70 backdrop-blur text-slate-800 rounded-2xl font-medium hover:bg-white transition-all flex items-center justify-center gap-3 border border-slate-200 shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Github className="w-5 h-5 text-slate-700" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400">开源项目</div>
                  <div className="font-semibold">查看源码</div>
                </div>
              </a>
            </div>
            
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow">
              <span className="text-xs font-light text-white">408</span>
            </div>
            <span className="text-slate-400 text-sm">考研学习指南 © 2026</span>
          </div>
          
          <p className="text-slate-400 text-xs">
            祝各位考研顺利，一战成硕
          </p>
          
          <div className="flex items-center gap-4">
            <a href="https://github.com/GalaxyPoke/408-Master" target="_blank" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
