import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  BookOpen, Code, Brain, Zap, Trophy, ChevronRight, 
  ArrowLeft, ExternalLink, Search, X, Layers
} from 'lucide-react';

// 算法分类数据
const ALGORITHM_CATEGORIES = [
  {
    id: 'data-structure',
    name: '数据结构系列',
    icon: Layers,
    color: 'blue',
    description: '链表、树、图、栈、队列等核心数据结构',
    folder: '数据结构系列',
    articles: [
      { file: '二叉树总结.md', title: '二叉树总结（纲领篇）' },
      { file: '二叉树系列1.md', title: '二叉树系列（思路篇）' },
      { file: '二叉树系列2.md', title: '二叉树系列（构造篇）' },
      { file: 'BST1.md', title: '二叉搜索树（特性篇）' },
      { file: 'BST2.md', title: '二叉搜索树（基操篇）' },
      { file: '递归反转链表的一部分.md', title: '递归反转链表' },
      { file: '队列实现栈栈实现队列.md', title: '队列实现栈/栈实现队列' },
      { file: '单调栈.md', title: '单调栈解题模板' },
      { file: '单调队列.md', title: '单调队列解题模板' },
      { file: '二叉堆详解实现优先级队列.md', title: '二叉堆与优先级队列' },
      { file: '图.md', title: '图论基础' },
      { file: 'dijkstra算法.md', title: 'Dijkstra 最短路径算法' },
      { file: '拓扑排序.md', title: '拓扑排序详解' },
      { file: '实现计算器.md', title: '实现计算器' },
      { file: '设计Twitter.md', title: '设计 Twitter' },
    ]
  },
  {
    id: 'dynamic-programming',
    name: '动态规划系列',
    icon: Brain,
    color: 'purple',
    description: '背包问题、子序列、股票买卖等经典DP',
    folder: '动态规划系列',
    articles: [
      { file: '动态规划详解进阶.md', title: '动态规划解题框架' },
      { file: '最优子结构.md', title: '最优子结构原理' },
      { file: '背包问题.md', title: '经典背包问题' },
      { file: '子序列问题模板.md', title: '子序列问题模板' },
      { file: '动态规划设计：最长递增子序列.md', title: '最长递增子序列' },
      { file: 'LCS.md', title: '最长公共子序列' },
      { file: '编辑距离.md', title: '编辑距离问题' },
      { file: '团灭股票问题.md', title: '团灭股票买卖问题' },
      { file: '抢房子.md', title: '打家劫舍系列' },
      { file: '动态规划之博弈问题.md', title: '博弈问题' },
      { file: '动态规划之四键键盘.md', title: '四键键盘问题' },
      { file: '高楼扔鸡蛋问题.md', title: '高楼扔鸡蛋问题' },
      { file: '状态压缩技巧.md', title: '状态压缩技巧' },
      { file: '动态规划之KMP字符匹配算法.md', title: 'KMP 字符匹配算法' },
      { file: '动态规划之正则表达.md', title: '正则表达式匹配' },
      { file: '单词拼接.md', title: '单词拼接问题' },
      { file: '贪心算法之区间调度问题.md', title: '贪心：区间调度问题' },
      { file: '魔塔.md', title: '地下城游戏' },
    ]
  },
  {
    id: 'algorithm-thinking',
    name: '算法思维系列',
    icon: Zap,
    color: 'green',
    description: '双指针、滑动窗口、回溯、BFS/DFS等',
    folder: '算法思维系列',
    articles: []
  },
  {
    id: 'interview',
    name: '高频面试系列',
    icon: Trophy,
    color: 'orange',
    description: '面试高频题目与技巧总结',
    folder: '高频面试系列',
    articles: []
  }
];

const AlgorithmPage = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  const [articleContent, setArticleContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(ALGORITHM_CATEGORIES);

  // 初始化时加载文章列表
  useEffect(() => {
    const loadArticleLists = async () => {
      const updatedCategories = await Promise.all(
        ALGORITHM_CATEGORIES.map(async (category) => {
          if (category.articles.length > 0) return category;
          
          try {
            // 尝试从文件夹读取文章列表
            const response = await fetch(`/fucking-algorithm/${category.folder}/`);
            if (response.ok) {
              const text = await response.text();
              // 解析目录中的 .md 文件
              const mdFiles = text.match(/href="([^"]+\.md)"/g);
              if (mdFiles) {
                const articles = mdFiles.map(match => {
                  const file = match.match(/href="([^"]+\.md)"/)[1];
                  const title = decodeURIComponent(file.replace('.md', ''));
                  return { file, title };
                }).filter(a => a.file !== 'README.md');
                return { ...category, articles };
              }
            }
          } catch (e) {
            console.log('Could not load article list for', category.name);
          }
          return category;
        })
      );
      setCategories(updatedCategories);
    };
    
    loadArticleLists();
  }, []);

  // 加载文章内容
  const loadArticle = async (category, article) => {
    setLoading(true);
    setActiveArticle(article);
    
    try {
      const response = await fetch(`/fucking-algorithm/${category.folder}/${article.file}`);
      if (response.ok) {
        let content = await response.text();
        // 修复图片路径
        content = content.replace(/!\[([^\]]*)\]\(\.\.\/pictures\//g, '![$1](/fucking-algorithm/pictures/');
        content = content.replace(/!\[([^\]]*)\]\(pictures\//g, '![$1](/fucking-algorithm/pictures/');
        setArticleContent(content);
      } else {
        setArticleContent('# 文章加载失败\n\n请检查文件是否存在。');
      }
    } catch (error) {
      setArticleContent('# 加载错误\n\n' + error.message);
    }
    
    setLoading(false);
  };

  // 返回分类列表
  const goBack = () => {
    if (activeArticle) {
      setActiveArticle(null);
      setArticleContent('');
    } else {
      setActiveCategory(null);
    }
  };

  // 搜索过滤
  const filteredArticles = activeCategory?.articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // 颜色映射
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      icon: 'bg-blue-100',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-100',
      icon: 'bg-purple-100',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      hover: 'hover:bg-green-100',
      icon: 'bg-green-100',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      hover: 'hover:bg-orange-100',
      icon: 'bg-orange-100',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          {(activeCategory || activeArticle) && (
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              返回{activeArticle ? activeCategory.name : '分类'}
            </button>
          )}
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Code className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {activeArticle ? activeArticle.title : activeCategory ? activeCategory.name : 'labuladong 算法笔记'}
              </h1>
              <p className="text-slate-500 mt-1">
                {activeArticle 
                  ? `来自 ${activeCategory.name}` 
                  : activeCategory 
                    ? activeCategory.description 
                    : '手把手带你刷算法，通俗易懂的算法教程'}
              </p>
            </div>
          </div>

          {/* 外部链接 */}
          {!activeCategory && (
            <div className="mt-4 flex items-center gap-4">
              <a
                href="https://labuladong.online/algo/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <ExternalLink size={16} />
                访问官网
              </a>
              <a
                href="https://github.com/labuladong/fucking-algorithm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                <BookOpen size={16} />
                GitHub 仓库
              </a>
            </div>
          )}
        </div>

        {/* 主内容区 */}
        {!activeCategory ? (
          // 分类列表
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const colors = colorClasses[category.color];
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category)}
                  className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-6 text-left transition-all hover:shadow-lg hover:scale-[1.02] group`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-3 ${colors.icon} rounded-xl`}>
                      <Icon className={`h-8 w-8 ${colors.text}`} />
                    </div>
                    <ChevronRight className={`h-6 w-6 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-4">{category.name}</h2>
                  <p className="text-slate-600 mt-2">{category.description}</p>
                  <div className="mt-4 text-sm text-slate-500">
                    {category.articles.length} 篇文章
                  </div>
                </button>
              );
            })}
          </div>
        ) : !activeArticle ? (
          // 文章列表
          <div>
            {/* 搜索框 */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* 文章网格 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((article, index) => {
                const colors = colorClasses[activeCategory.color];
                return (
                  <button
                    key={index}
                    onClick={() => loadArticle(activeCategory, article)}
                    className={`bg-white border border-slate-200 rounded-xl p-4 text-left transition-all hover:shadow-md hover:border-slate-300 group`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${colors.text.replace('text', 'bg')}`} />
                      <span className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {article.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                {searchTerm ? '没有找到匹配的文章' : '暂无文章'}
              </div>
            )}
          </div>
        ) : (
          // 文章内容
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
              </div>
            ) : (
              <article className="prose prose-slate prose-lg max-w-none p-8 prose-headings:text-slate-900 prose-a:text-indigo-600 prose-code:text-pink-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {articleContent}
                </ReactMarkdown>
              </article>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgorithmPage;
