import React from 'react';
import { BookOpen, GraduationCap, Target, Lightbulb, Star } from 'lucide-react';

const ResourcesPage = () => {
  const resources = [
    {
      category: '教材推荐',
      icon: BookOpen,
      color: 'blue',
      items: [
        { name: '王道考研系列', desc: '最主流的408复习资料，知识点全面，习题丰富', rating: 5 },
        { name: '天勤考研系列', desc: '讲解细致，适合基础薄弱的同学', rating: 4 },
        { name: '严蔚敏《数据结构》', desc: '经典教材，适合深入学习', rating: 4 },
        { name: '唐朔飞《计算机组成原理》', desc: '考研指定参考书之一', rating: 4 },
      ]
    },
    {
      category: '视频课程',
      icon: GraduationCap,
      color: 'green',
      items: [
        { name: '王道考研视频课', desc: 'B站免费，配合王道书使用效果最佳', rating: 5 },
        { name: '咸鱼学长408', desc: '讲解通俗易懂，适合入门', rating: 4 },
        { name: '郝斌数据结构', desc: '基础讲解非常细致', rating: 4 },
        { name: '哈工大操作系统', desc: '深入理解OS原理', rating: 4 },
      ]
    },
    {
      category: '刷题资源',
      icon: Target,
      color: 'purple',
      items: [
        { name: '历年真题', desc: '最重要的复习资料，至少刷3遍', rating: 5 },
        { name: '王道习题', desc: '配套教材的习题，覆盖面广', rating: 5 },
        { name: 'LeetCode', desc: '练习数据结构算法题', rating: 4 },
        { name: '模拟题', desc: '考前模拟，适应考试节奏', rating: 3 },
      ]
    },
    {
      category: '辅助工具',
      icon: Lightbulb,
      color: 'orange',
      items: [
        { name: 'Anki', desc: '间隔重复记忆软件，背诵利器', rating: 5 },
        { name: 'XMind/幕布', desc: '思维导图工具，整理知识框架', rating: 4 },
        { name: 'Notion', desc: '笔记管理工具，建立知识库', rating: 4 },
        { name: 'Wireshark', desc: '网络抓包工具，理解网络协议', rating: 3 },
      ]
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">资源推荐</h1>
      <p className="text-gray-500 text-center mb-12">精选学习资源，助你高效备考</p>

      <div className="grid md:grid-cols-2 gap-8">
        {resources.map((category, index) => {
          const Icon = category.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`px-6 py-4 flex items-center gap-3 ${colorClasses[category.color]}`}>
                <Icon className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">{category.category}</h2>
              </div>
              <div className="p-6 space-y-4">
                {category.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0 ml-4">
                      {[...Array(5)].map((_, j) => (
                        <Star 
                          key={j} 
                          className={`h-4 w-4 ${j < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 学习建议 */}
      <div className="mt-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">📌 最后的建议</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">关于资料选择</h3>
            <ul className="space-y-2 text-blue-100">
              <li>• 资料不在多，在于精。选定一套主力资料深入学习</li>
              <li>• 真题是最好的资料，一定要反复研究</li>
              <li>• 视频课可以加速看，节省时间</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">关于学习方法</h3>
            <ul className="space-y-2 text-blue-100">
              <li>• 理解 &gt; 记忆，要知其然更要知其所以然</li>
              <li>• 多动手，算法要写，计算要练</li>
              <li>• 建立知识体系，形成自己的理解</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
