/**
 * 数据解析模块
 * 负责从HTML中提取题目数据
 */

// 科目映射：题号范围 -> 科目代码
const SUBJECT_RANGES = [
  { start: 1, end: 11, subject: 'ds' },   // 数据结构
  { start: 12, end: 22, subject: 'co' },  // 计算机组成原理
  { start: 23, end: 32, subject: 'os' },  // 操作系统
  { start: 33, end: 40, subject: 'cn' },  // 计算机网络
];

// 答案映射
const ANSWER_MAP = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };

/**
 * 根据题号获取科目
 */
function getSubject(questionNum) {
  for (const range of SUBJECT_RANGES) {
    if (questionNum >= range.start && questionNum <= range.end) {
      return range.subject;
    }
  }
  return 'ds'; // 默认
}

/**
 * 解析答案表格，获取每题的正确答案
 * 格式: No. Ans No. Ans ...
 */
function parseAnswerTable(html) {
  const answers = {};
  
  // 匹配答案表格中的内容
  // 格式如: 1 D 2 A 3 A ...
  const tableMatch = html.match(/选择题答案速对[\s\S]*?<\/table>/i);
  if (tableMatch) {
    // 提取所有 数字+字母 的组合
    const answerPattern = /(\d+)\s*[<>\w="\/\s]*?([ABCD])/g;
    let match;
    while ((match = answerPattern.exec(tableMatch[0])) !== null) {
      const num = parseInt(match[1]);
      const ans = match[2];
      if (num >= 1 && num <= 40) {
        answers[num] = ANSWER_MAP[ans];
      }
    }
  }
  
  // 备用方案：直接从文本中提取
  if (Object.keys(answers).length < 30) {
    const textPattern = /\b(\d{1,2})\s+([ABCD])\b/g;
    let match;
    while ((match = textPattern.exec(html)) !== null) {
      const num = parseInt(match[1]);
      const ans = match[2];
      if (num >= 1 && num <= 40 && !answers[num]) {
        answers[num] = ANSWER_MAP[ans];
      }
    }
  }
  
  return answers;
}

/**
 * 清理HTML标签和多余空白
 */
function cleanText(text) {
  return text
    .replace(/<[^>]+>/g, '') // 移除HTML标签
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')    // 合并空白
    .trim();
}

/**
 * 从HTML解析题目
 */
function parseQuestions(html, year) {
  const questions = [];
  const answers = parseAnswerTable(html);
  
  // 匹配题目块: ##### 数字 开头的内容
  // 每个题目包含题干和选项
  const questionPattern = /<h5[^>]*>(\d+)<\/h5>([\s\S]*?)(?=<h5|<h4|<h3|$)/gi;
  
  let match;
  while ((match = questionPattern.exec(html)) !== null) {
    const questionNum = parseInt(match[1]);
    const content = match[2];
    
    if (questionNum < 1 || questionNum > 40) continue;
    
    // 提取题干（第一段文字）
    const questionText = extractQuestionText(content);
    if (!questionText) continue;
    
    // 提取选项
    const options = extractOptions(content);
    if (options.length !== 4) continue;
    
    // 获取答案
    const answer = answers[questionNum];
    if (answer === undefined) continue;
    
    questions.push({
      subject: getSubject(questionNum),
      q: questionText,
      options: options,
      answer: answer
    });
  }
  
  return questions;
}

/**
 * 提取题干文本
 */
function extractQuestionText(content) {
  // 尝试提取第一个<p>标签或直接文本
  const pMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (pMatch) {
    const text = cleanText(pMatch[1]);
    // 过滤掉太短的或只有链接的
    if (text.length > 10 && !text.startsWith('http')) {
      return text;
    }
  }
  
  // 直接提取文本
  const textMatch = content.match(/^[\s\S]*?(?=<ul|<ol|A\.|A、|A\s)/i);
  if (textMatch) {
    const text = cleanText(textMatch[0]);
    if (text.length > 10) {
      return text;
    }
  }
  
  return null;
}

/**
 * 提取选项
 */
function extractOptions(content) {
  const options = [];
  
  // 方案1: 匹配 A. B. C. D. 格式
  const optionPattern = /([ABCD])[.、\s]\s*([^ABCD\n]+?)(?=[ABCD][.、\s]|$|正确答案|<\/)/g;
  let match;
  while ((match = optionPattern.exec(content)) !== null) {
    const text = cleanText(match[2]);
    if (text.length > 0) {
      options.push(text);
    }
  }
  
  if (options.length === 4) return options;
  
  // 方案2: 匹配<li>标签
  options.length = 0;
  const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  while ((match = liPattern.exec(content)) !== null) {
    const text = cleanText(match[1]);
    if (text.length > 0) {
      options.push(text);
    }
    if (options.length >= 4) break;
  }
  
  return options.slice(0, 4);
}

module.exports = { parseQuestions, getSubject, ANSWER_MAP };
