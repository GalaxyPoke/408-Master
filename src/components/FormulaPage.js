import React, { useState } from 'react';
import { BookOpen, Cpu, HardDrive, Network, Search, ChevronDown, ChevronUp } from 'lucide-react';

const FormulaPage = () => {
  const [activeSubject, setActiveSubject] = useState('ds');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const formulas = {
    ds: {
      name: '数据结构',
      icon: BookOpen,
      color: 'blue',
      sections: [
        {
          title: '时间复杂度',
          items: [
            { name: '常数阶', formula: 'O(1)', desc: '与问题规模无关' },
            { name: '对数阶', formula: 'O(log n)', desc: '二分查找等' },
            { name: '线性阶', formula: 'O(n)', desc: '遍历一次' },
            { name: '线性对数阶', formula: 'O(n log n)', desc: '快排、归并平均' },
            { name: '平方阶', formula: 'O(n²)', desc: '冒泡、选择、插入' },
            { name: '指数阶', formula: 'O(2ⁿ)', desc: '穷举' },
          ]
        },
        {
          title: '排序算法复杂度',
          items: [
            { name: '冒泡排序', formula: '时间O(n²) 空间O(1)', desc: '稳定' },
            { name: '选择排序', formula: '时间O(n²) 空间O(1)', desc: '不稳定' },
            { name: '插入排序', formula: '时间O(n²) 空间O(1)', desc: '稳定' },
            { name: '希尔排序', formula: '时间O(n^1.3) 空间O(1)', desc: '不稳定' },
            { name: '快速排序', formula: '时间O(nlogn) 空间O(logn)', desc: '不稳定' },
            { name: '归并排序', formula: '时间O(nlogn) 空间O(n)', desc: '稳定' },
            { name: '堆排序', formula: '时间O(nlogn) 空间O(1)', desc: '不稳定' },
            { name: '基数排序', formula: '时间O(d(n+r)) 空间O(r)', desc: '稳定' },
          ]
        },
        {
          title: '二叉树性质',
          items: [
            { name: '节点数', formula: 'n = n₀ + n₁ + n₂', desc: '度为0,1,2的节点数之和' },
            { name: '叶子节点', formula: 'n₀ = n₂ + 1', desc: '叶子比度2节点多1' },
            { name: '第i层最多节点', formula: '2^(i-1)', desc: 'i从1开始' },
            { name: '深度为k最多节点', formula: '2^k - 1', desc: '满二叉树' },
            { name: '完全二叉树深度', formula: '⌊log₂n⌋ + 1', desc: 'n为节点数' },
          ]
        },
        {
          title: '图算法',
          items: [
            { name: 'DFS/BFS', formula: '邻接表O(V+E) 邻接矩阵O(V²)', desc: '遍历' },
            { name: 'Prim', formula: 'O(V²) 或 O(ElogV)', desc: '最小生成树' },
            { name: 'Kruskal', formula: 'O(ElogE)', desc: '最小生成树' },
            { name: 'Dijkstra', formula: 'O(V²) 或 O(ElogV)', desc: '单源最短路径' },
            { name: 'Floyd', formula: 'O(V³)', desc: '多源最短路径' },
          ]
        },
      ]
    },
    co: {
      name: '计算机组成原理',
      icon: Cpu,
      color: 'purple',
      sections: [
        {
          title: '数据表示',
          items: [
            { name: '原码范围', formula: '-(2^(n-1)-1) ~ 2^(n-1)-1', desc: 'n位有符号数' },
            { name: '补码范围', formula: '-2^(n-1) ~ 2^(n-1)-1', desc: 'n位有符号数' },
            { name: '补码转换', formula: '[X]补 = 2^n + X', desc: 'X为负数时' },
            { name: 'IEEE754单精度', formula: '1+8+23位', desc: '符号+阶码+尾数' },
            { name: 'IEEE754双精度', formula: '1+11+52位', desc: '符号+阶码+尾数' },
          ]
        },
        {
          title: '存储系统',
          items: [
            { name: 'Cache命中率', formula: 'H = Nc / (Nc + Nm)', desc: 'Nc命中次数,Nm缺失次数' },
            { name: '平均访问时间', formula: 'Ta = H×Tc + (1-H)×Tm', desc: 'Tc缓存时间,Tm主存时间' },
            { name: '直接映射', formula: 'Cache行号 = 主存块号 mod Cache行数', desc: '' },
            { name: '全相联映射', formula: '主存块可映射到任意Cache行', desc: '' },
            { name: '组相联映射', formula: '组号 = 主存块号 mod 组数', desc: '' },
          ]
        },
        {
          title: '性能指标',
          items: [
            { name: 'CPI', formula: 'CPI = 时钟周期数 / 指令数', desc: '每条指令周期数' },
            { name: 'MIPS', formula: 'MIPS = 指令数 / (执行时间×10⁶)', desc: '每秒百万条指令' },
            { name: 'CPU时间', formula: 'CPU时间 = 指令数×CPI×时钟周期', desc: '' },
            { name: '吞吐率', formula: 'TP = n / Tk', desc: 'n条指令,Tk总时间' },
            { name: '加速比', formula: 'S = T1 / Tn', desc: '串行时间/并行时间' },
          ]
        },
      ]
    },
    os: {
      name: '操作系统',
      icon: HardDrive,
      color: 'green',
      sections: [
        {
          title: '进程调度',
          items: [
            { name: '周转时间', formula: '周转时间 = 完成时间 - 到达时间', desc: '' },
            { name: '带权周转时间', formula: '带权周转时间 = 周转时间 / 服务时间', desc: '' },
            { name: '平均周转时间', formula: '平均周转时间 = Σ周转时间 / n', desc: '' },
            { name: '响应比', formula: 'R = (等待时间+服务时间) / 服务时间', desc: 'HRRN算法' },
          ]
        },
        {
          title: '死锁',
          items: [
            { name: '死锁必要条件', formula: '互斥+占有等待+不可抢占+循环等待', desc: '4个条件同时满足' },
            { name: '银行家算法', formula: 'Need = Max - Allocation', desc: '还需要的资源' },
            { name: '安全性检查', formula: 'Work >= Need[i]', desc: '找安全序列' },
          ]
        },
        {
          title: '内存管理',
          items: [
            { name: '页号', formula: '页号 = 逻辑地址 / 页面大小', desc: '取整' },
            { name: '页内偏移', formula: '偏移 = 逻辑地址 mod 页面大小', desc: '' },
            { name: '物理地址', formula: '物理地址 = 块号×页面大小 + 偏移', desc: '' },
            { name: '缺页率', formula: 'f = 缺页次数 / 访问次数', desc: '' },
          ]
        },
        {
          title: '磁盘调度',
          items: [
            { name: 'FCFS', formula: '按请求顺序服务', desc: '先来先服务' },
            { name: 'SSTF', formula: '选择最近磁道', desc: '最短寻道时间优先' },
            { name: 'SCAN', formula: '电梯算法，单向扫描', desc: '扫描算法' },
            { name: 'C-SCAN', formula: '单向扫描，返回起点', desc: '循环扫描' },
          ]
        },
      ]
    },
    cn: {
      name: '计算机网络',
      icon: Network,
      color: 'orange',
      sections: [
        {
          title: '性能指标',
          items: [
            { name: '带宽', formula: 'bps (比特/秒)', desc: '数据传输速率' },
            { name: '时延', formula: '总时延 = 发送+传播+处理+排队', desc: '' },
            { name: '发送时延', formula: '发送时延 = 数据长度 / 带宽', desc: '' },
            { name: '传播时延', formula: '传播时延 = 距离 / 传播速率', desc: '' },
            { name: '时延带宽积', formula: '时延带宽积 = 传播时延 × 带宽', desc: '链路上的比特数' },
            { name: '利用率', formula: 'U = 有效数据 / 总数据', desc: '' },
          ]
        },
        {
          title: 'IP地址',
          items: [
            { name: 'A类地址', formula: '1.0.0.0 ~ 126.255.255.255', desc: '网络号8位' },
            { name: 'B类地址', formula: '128.0.0.0 ~ 191.255.255.255', desc: '网络号16位' },
            { name: 'C类地址', formula: '192.0.0.0 ~ 223.255.255.255', desc: '网络号24位' },
            { name: '子网数', formula: '2^子网位数', desc: '' },
            { name: '主机数', formula: '2^主机位数 - 2', desc: '减去网络地址和广播地址' },
          ]
        },
        {
          title: 'TCP',
          items: [
            { name: '序号范围', formula: '0 ~ 2³² - 1', desc: '32位序号' },
            { name: '窗口大小', formula: '最大65535字节', desc: '16位窗口字段' },
            { name: 'RTT估计', formula: 'RTTs = (1-α)×RTTs + α×RTT', desc: 'α通常0.125' },
            { name: '超时重传', formula: 'RTO = RTTs + 4×RTTd', desc: '' },
            { name: '拥塞窗口', formula: '慢开始: cwnd×2, 拥塞避免: cwnd+1', desc: '' },
          ]
        },
      ]
    },
  };

  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const currentSubject = formulas[activeSubject];
  const Icon = currentSubject.icon;

  const colorClasses = {
    blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    green: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  };
  const c = colorClasses[currentSubject.color];

  // 搜索过滤
  const filteredSections = currentSubject.sections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">公式速查</h1>
      <p className="text-gray-500 text-center mb-8">快速查找408常用公式和复杂度</p>

      {/* 科目切换 */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Object.entries(formulas).map(([key, subject]) => {
          const SubIcon = subject.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveSubject(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeSubject === key
                  ? `${colorClasses[subject.color].bg} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <SubIcon className="h-4 w-4" />
              {subject.name}
            </button>
          );
        })}
      </div>

      {/* 搜索框 */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索公式..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 公式列表 */}
      <div className="space-y-4">
        {filteredSections.map((section, i) => (
          <div key={i} className={`bg-white rounded-xl shadow-md overflow-hidden border ${c.border}`}>
            <button
              onClick={() => toggleSection(section.title)}
              className={`w-full px-6 py-4 flex items-center justify-between ${c.light} hover:opacity-90 transition-all`}
            >
              <h3 className={`font-bold ${c.text}`}>{section.title}</h3>
              {expandedSections[section.title] ? (
                <ChevronUp className={`h-5 w-5 ${c.text}`} />
              ) : (
                <ChevronDown className={`h-5 w-5 ${c.text}`} />
              )}
            </button>
            {(expandedSections[section.title] !== false) && (
              <div className="p-4">
                <div className="grid gap-3">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                      <div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                        {item.desc && <span className="text-gray-500 text-sm ml-2">({item.desc})</span>}
                      </div>
                      <code className={`px-3 py-1 ${c.light} ${c.text} rounded-lg font-mono text-sm`}>
                        {item.formula}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormulaPage;
