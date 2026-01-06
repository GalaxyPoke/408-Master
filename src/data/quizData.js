// 408考研历年真题数据库
// 选择题和大题数据都从 years/ 目录导入

// 从years目录导入各年份数据
import { examDataByYear, essayDataByYear } from './years';

// 导出选择题数据
export const examData = examDataByYear;

// 导出大题数据
export const essayData = essayDataByYear;

// 科目信息配置
export const subjectInfo = {
  ds: { name: '数据结构', color: 'blue' },
  co: { name: '计算机组成原理', color: 'purple' },
  os: { name: '操作系统', color: 'green' },
  cn: { name: '计算机网络', color: 'orange' },
};

// 获取所有年份
export const getYears = () => Object.keys(examData).sort((a, b) => b - a);

// 获取某年份的题目
export const getQuestionsByYear = (year) => examData[year] || [];

// 获取某科目的所有题目（跨年份）
export const getQuestionsBySubject = (subjectKey) => {
  const questions = [];
  Object.keys(examData).forEach(year => {
    examData[year]
      .filter(q => q.subject === subjectKey)
      .forEach(q => questions.push({ ...q, year }));
  });
  return questions;
};

// 获取题目统计
export const getStats = () => {
  const stats = {
    totalQuestions: 0,
    byYear: {},
    bySubject: { ds: 0, co: 0, os: 0, cn: 0 }
  };
  
  Object.keys(examData).forEach(year => {
    stats.byYear[year] = examData[year].length;
    stats.totalQuestions += examData[year].length;
    examData[year].forEach(q => {
      stats.bySubject[q.subject]++;
    });
  });
  
  return stats;
};
