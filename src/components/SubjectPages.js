import React from 'react';
import { BookOpen, Cpu, HardDrive, Network, CheckCircle, Star } from 'lucide-react';

// 通用科目页面组件
const SubjectPage = ({ title, score, percent, icon: Icon, color, chapters, tips }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50', textDark: 'text-blue-800', textMid: 'text-blue-900', dot: 'bg-blue-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50', textDark: 'text-purple-800', textMid: 'text-purple-900', dot: 'bg-purple-500' },
    green: { bg: 'bg-green-100', text: 'text-green-600', gradient: 'from-green-500 to-green-600', light: 'bg-green-50', textDark: 'text-green-800', textMid: 'text-green-900', dot: 'bg-green-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600', light: 'bg-orange-50', textDark: 'text-orange-800', textMid: 'text-orange-900', dot: 'bg-orange-500' },
  };
  const c = colorMap[color];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-16 h-16 ${c.bg} rounded-2xl flex items-center justify-center`}>
          <Icon className={`h-8 w-8 ${c.text}`} />
        </div>
        <div>
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="text-gray-500">{score}分 | 约占{percent}%</p>
        </div>
      </div>

      {/* 学习建议 */}
      <div className={`${c.light} rounded-2xl p-6 mb-8`}>
        <h2 className={`text-xl font-bold mb-4 ${c.textDark}`}>📚 学习建议</h2>
        <ul className={`space-y-2 ${c.textMid}`}>
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle className={`h-5 w-5 ${c.text} mt-0.5 flex-shrink-0`} />
              <span dangerouslySetInnerHTML={{ __html: tip }} />
            </li>
          ))}
        </ul>
      </div>

      {/* 章节详情 */}
      <div className="space-y-6">
        {chapters.map((chapter, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className={`bg-gradient-to-r ${c.gradient} px-6 py-4 flex items-center justify-between`}>
              <h3 className="text-xl font-bold text-white">{chapter.title}</h3>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < chapter.importance ? 'text-yellow-300 fill-yellow-300' : 'text-white/30'}`} 
                  />
                ))}
              </div>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">核心知识点</h4>
                  <ul className="space-y-2">
                    {chapter.points.map((point, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600">
                        <div className={`w-2 h-2 ${c.dot} rounded-full`}></div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 备考提示</h4>
                  <p className="text-yellow-900">{chapter.tips}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 数据结构页面
export const DataStructurePage = () => {
  const chapters = [
    { title: '线性表', importance: 5, points: ['顺序表与链表的实现', '各种操作的时间复杂度', '双向链表、循环链表', '静态链表'], tips: '重点掌握链表的各种操作，特别是头插法、尾插法、逆置等' },
    { title: '栈、队列和数组', importance: 4, points: ['栈的应用（表达式求值、递归）', '队列的应用（层次遍历）', '循环队列', '特殊矩阵的压缩存储'], tips: '栈和队列的应用是重点，要能灵活运用' },
    { title: '树与二叉树', importance: 5, points: ['二叉树的性质和遍历', '线索二叉树', '树和森林', '哈夫曼树与哈夫曼编码', '并查集'], tips: '必考章节！遍历算法要能手写，各种性质要熟记' },
    { title: '图', importance: 5, points: ['图的存储结构', 'BFS和DFS', '最小生成树', '最短路径', '拓扑排序', '关键路径'], tips: '算法较多，要理解原理并能手写代码' },
    { title: '查找', importance: 4, points: ['顺序查找、折半查找', 'BST、AVL树', 'B树和B+树', '散列表'], tips: 'B树和散列表是重点，要掌握插入删除操作' },
    { title: '排序', importance: 5, points: ['插入排序、交换排序', '选择排序、归并排序', '基数排序', '外部排序'], tips: '各种排序的时间/空间复杂度、稳定性要熟记，快排和堆排必须会写' },
  ];
  const tips = [
    '<strong>先理解后记忆</strong>：数据结构的核心是理解各种结构的特点和适用场景',
    '<strong>多画图</strong>：树、图等结构一定要画图辅助理解',
    '<strong>手写代码</strong>：核心算法要能手写，不能只看不练',
    '<strong>分析复杂度</strong>：时间和空间复杂度分析是基本功',
  ];
  return <SubjectPage title="数据结构" score={45} percent={30} icon={BookOpen} color="blue" chapters={chapters} tips={tips} />;
};

// 计算机组成原理页面
export const ComputerOrganizationPage = () => {
  const chapters = [
    { title: '计算机系统概述', importance: 3, points: ['计算机发展历程', '计算机硬件组成', '计算机软件分类', '计算机性能指标'], tips: '了解性内容为主，重点掌握性能指标的计算' },
    { title: '数据的表示和运算', importance: 5, points: ['进制转换', '定点数的表示和运算', '浮点数的表示和运算', 'ALU的功能和结构'], tips: '必考！补码运算、浮点数IEEE754标准是重中之重' },
    { title: '存储系统', importance: 5, points: ['存储器分类和层次结构', '主存储器', 'Cache', '虚拟存储器'], tips: 'Cache映射方式、地址计算是高频考点' },
    { title: '指令系统', importance: 4, points: ['指令格式', '寻址方式', 'CISC和RISC', '指令流水线'], tips: '寻址方式要熟练掌握，能快速计算有效地址' },
    { title: 'CPU', importance: 5, points: ['CPU的功能和结构', '指令执行过程', '数据通路', '控制器设计'], tips: '指令周期、微操作是重点，要理解指令执行的完整过程' },
    { title: '总线和I/O', importance: 4, points: ['总线概述', 'I/O接口', 'I/O方式', '中断系统'], tips: 'DMA方式和中断方式的区别是常考点' },
  ];
  const tips = [
    '<strong>建立整体观</strong>：先理解计算机系统的整体架构，再深入各部分',
    '<strong>重视计算</strong>：组成原理计算题多，要多练习数值转换、地址计算',
    '<strong>理解硬件工作原理</strong>：不要死记，要理解为什么这样设计',
    '<strong>结合操作系统</strong>：存储系统与OS的内存管理紧密相关',
  ];
  return <SubjectPage title="计算机组成原理" score={45} percent={30} icon={Cpu} color="purple" chapters={chapters} tips={tips} />;
};

// 操作系统页面
export const OperatingSystemPage = () => {
  const chapters = [
    { title: '操作系统概述', importance: 3, points: ['OS的概念和特征', 'OS的发展和分类', 'OS的运行环境', '系统调用'], tips: '概念性内容，理解即可，重点是系统调用和中断' },
    { title: '进程管理', importance: 5, points: ['进程与线程', '进程状态转换', 'CPU调度算法', '进程同步与互斥', '死锁'], tips: '最重要的章节！PV操作、死锁是必考内容' },
    { title: '内存管理', importance: 5, points: ['内存分配方式', '分页存储管理', '分段存储管理', '虚拟内存', '页面置换算法'], tips: '地址转换、页面置换算法是高频考点' },
    { title: '文件管理', importance: 4, points: ['文件系统基础', '目录结构', '文件存储空间管理', '磁盘调度算法'], tips: '磁盘调度算法要会计算，文件分配方式要理解' },
    { title: 'I/O管理', importance: 3, points: ['I/O控制方式', '假脱机技术', '缓冲区管理', '设备分配'], tips: '与组成原理的I/O部分结合学习效果更好' },
  ];
  const tips = [
    '<strong>理解OS的角色</strong>：OS是硬件和应用之间的桥梁，理解这一点很重要',
    '<strong>PV操作多练习</strong>：进程同步是难点，要多做经典问题',
    '<strong>画状态转换图</strong>：进程状态、页面置换都可以画图理解',
    '<strong>结合实际</strong>：联系Linux/Windows的实际机制加深理解',
  ];
  return <SubjectPage title="操作系统" score={35} percent={23} icon={HardDrive} color="green" chapters={chapters} tips={tips} />;
};

// 计算机网络页面
export const ComputerNetworkPage = () => {
  const chapters = [
    { title: '计算机网络体系结构', importance: 4, points: ['网络概述', 'OSI和TCP/IP模型', '各层功能', '网络性能指标'], tips: '理解分层思想，熟记各层协议和功能' },
    { title: '物理层', importance: 2, points: ['通信基础', '传输介质', '物理层设备'], tips: '了解即可，考查较少' },
    { title: '数据链路层', importance: 4, points: ['封装成帧', '差错控制', 'PPP协议', '以太网', '交换机'], tips: 'CSMA/CD协议、以太网帧格式是重点' },
    { title: '网络层', importance: 5, points: ['IP协议', '子网划分', '路由算法', 'ICMP/ARP/DHCP', 'IPv6'], tips: '最重要的章节！IP地址计算、路由选择必考' },
    { title: '传输层', importance: 5, points: ['UDP协议', 'TCP协议', '流量控制', '拥塞控制', '三次握手四次挥手'], tips: 'TCP的各种机制是重点，要深入理解' },
    { title: '应用层', importance: 4, points: ['DNS', 'HTTP', 'FTP', 'SMTP/POP3', 'DHCP'], tips: '各协议的工作过程要清楚，DNS查询过程常考' },
  ];
  const tips = [
    '<strong>分层学习</strong>：按照网络层次结构，一层一层学习',
    '<strong>抓住重点</strong>：网络层和传输层是重中之重',
    '<strong>理解协议</strong>：不要死记协议格式，要理解设计目的',
    '<strong>动手实践</strong>：用Wireshark抓包分析，加深理解',
  ];
  return <SubjectPage title="计算机网络" score={25} percent={17} icon={Network} color="orange" chapters={chapters} tips={tips} />;
};
