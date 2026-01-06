// 王道408四科题库
// ========== 选择题 ==========
// 数据结构: 389题 | 计算机组成: 524题 | 操作系统: 549题 | 计算机网络: 475题
// 选择题总计: 1937题

export { default as questionsDS } from './ds.json';
export { default as questionsCO } from './co.json';
export { default as questionsOS } from './os.json';
export { default as questionsCN } from './cn.json';

// ========== 综合题/大题 ==========
// 数据结构: 152题 | 计算机组成: 85题 | 操作系统: 113题 | 计算机网络: 70题
// 综合题总计: 420题

export { default as essayDS } from './ds_essay.json';
export { default as essayCO } from './co_essay.json';
export { default as essayOS } from './os_essay.json';
export { default as essayCN } from './cn_essay.json';

// 题目数量统计
export const questionStats = {
  choice: {
    ds: { name: '数据结构', count: 389 },
    co: { name: '计算机组成原理', count: 524 },
    os: { name: '操作系统', count: 549 },
    cn: { name: '计算机网络', count: 475 },
    total: 1937
  },
  essay: {
    ds: { name: '数据结构', count: 152 },
    co: { name: '计算机组成原理', count: 85 },
    os: { name: '操作系统', count: 113 },
    cn: { name: '计算机网络', count: 70 },
    total: 420
  },
  grandTotal: 2357
};
