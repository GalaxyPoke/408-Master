const mammoth = require('mammoth');
const fs = require('fs');

async function parse() {
  console.log('解析: 数据结构综合题\n');
  
  const result = await mammoth.extractRawText({ path: 'doc/[A4版]25WD-数据结构综合题做题本.docx' });
  let text = result.value;
  
  // 跳过目录部分（找到第一个"第一章绪论"正文）
  const contentStart = text.indexOf('1.1 数据结构的基本概念');
  if (contentStart > 0) {
    text = text.substring(contentStart);
  }
  
  const questions = [];
  let questionId = 1;
  let currentChapter = '';
  
  // 按行处理
  const lines = text.split('\n');
  let currentQuestion = '';
  let inQuestion = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测章节
    const chapterMatch = line.match(/^(\d+\.\d+)\s+(.+)/);
    if (chapterMatch) {
      const section = chapterMatch[1];
      const sectionName = chapterMatch[2].replace(/\(.*\)/, '').trim();
      const chNum = parseInt(section.split('.')[0]);
      
      // 章节映射
      const chapterNames = {
        1: '绪论', 2: '线性表', 3: '栈、队列和数组', 4: '串',
        5: '树与二叉树', 6: '图', 7: '查找', 8: '排序'
      };
      currentChapter = `第${chNum}章 ${chapterNames[chNum] || sectionName}`;
      continue;
    }
    
    // 检测题目开始 01. 02. 等 (无空格也匹配)
    const qMatch = line.match(/^(\d{2})\.(.+)/);
    if (qMatch) {
      // 保存上一题
      if (currentQuestion && currentQuestion.length > 20) {
        questions.push({
          id: questionId++,
          chapter: currentChapter,
          question: currentQuestion.replace(/公众号.*?集结地/g, '').replace(/第\s*\d+\s*页.*?页/g, '').trim(),
          type: 'essay',
          subject: '数据结构'
        });
      }
      currentQuestion = qMatch[2];
      inQuestion = true;
      continue;
    }
    
    // 继续收集题目内容
    if (inQuestion && line && !line.includes('公众号') && !line.match(/^第\d+页/)) {
      currentQuestion += '\n' + line;
    }
  }
  
  // 保存最后一题
  if (currentQuestion && currentQuestion.length > 20) {
    questions.push({
      id: questionId++,
      chapter: currentChapter,
      question: currentQuestion.replace(/公众号.*?集结地/g, '').replace(/第\s*\d+\s*页.*?页/g, '').trim(),
      type: 'essay',
      subject: '数据结构'
    });
  }
  
  console.log(`解析完成，共 ${questions.length} 道题\n`);
  
  const stats = {};
  questions.forEach(q => { stats[q.chapter] = (stats[q.chapter] || 0) + 1; });
  console.log('章节统计:');
  Object.entries(stats).forEach(([ch, count]) => console.log(`  ${ch}: ${count} 题`));
  
  fs.writeFileSync('src/data/questions/ds_essay.json', JSON.stringify(questions, null, 2), 'utf8');
  console.log('\n已保存');
  
  // 预览前3题
  console.log('\n前3题预览:');
  questions.slice(0, 3).forEach(q => {
    console.log(`[${q.chapter}] ${q.question.slice(0, 80)}...`);
  });
}

parse();
