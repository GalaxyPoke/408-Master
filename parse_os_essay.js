const mammoth = require('mammoth');
const fs = require('fs');

async function parse() {
  console.log('解析: 操作系统综合题\n');
  
  const result = await mammoth.extractRawText({ path: 'doc/[A4版]WD-操作系统综合题做题本.docx' });
  let text = result.value;
  
  // 跳过目录
  const contentStart = text.indexOf('1.1');
  if (contentStart > 0) text = text.substring(contentStart);
  
  const questions = [];
  let questionId = 1;
  let currentChapter = '';
  let currentQuestion = '';
  
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测小节 1.1 2.1 等
    const sectionMatch = line.match(/^(\d+)\.(\d+)\s+(.+)/);
    if (sectionMatch) {
      const chNum = parseInt(sectionMatch[1]);
      const chapterNames = {
        1: '计算机系统概述', 2: '进程与线程', 3: '内存管理', 
        4: '文件管理', 5: '输入/输出管理'
      };
      currentChapter = `第${chNum}章 ${chapterNames[chNum] || ''}`;
      continue;
    }
    
    // 检测题目 01. 或 01.xxx (无空格也匹配)
    const qMatch = line.match(/^(\d{2})\.(.+)/);
    if (qMatch) {
      // 保存上一题
      if (currentQuestion && currentQuestion.length > 10) {
        questions.push({
          id: questionId++,
          chapter: currentChapter,
          question: currentQuestion.replace(/公众号.*?集结地/g, '').replace(/第\s*\d+\s*页.*?页/g, '').trim(),
          type: 'essay',
          subject: '操作系统'
        });
      }
      currentQuestion = qMatch[2].trim();
      continue;
    }
    
    // 继续收集题目内容
    if (currentQuestion && line && !line.includes('公众号') && !line.match(/^第\d+页/) && !line.includes('OS 综合题')) {
      currentQuestion += '\n' + line;
    }
  }
  
  // 最后一题
  if (currentQuestion && currentQuestion.length > 10) {
    questions.push({
      id: questionId++,
      chapter: currentChapter,
      question: currentQuestion.replace(/公众号.*?集结地/g, '').replace(/第\s*\d+\s*页.*?页/g, '').trim(),
      type: 'essay',
      subject: '操作系统'
    });
  }
  
  console.log(`解析完成，共 ${questions.length} 道题\n`);
  
  const stats = {};
  questions.forEach(q => { stats[q.chapter] = (stats[q.chapter] || 0) + 1; });
  console.log('章节统计:');
  Object.entries(stats).forEach(([ch, count]) => console.log(`  ${ch}: ${count} 题`));
  
  fs.writeFileSync('src/data/questions/os_essay.json', JSON.stringify(questions, null, 2), 'utf8');
  console.log('\n已保存');
  
  // 预览前5题
  console.log('\n前5题预览:');
  questions.slice(0, 5).forEach((q, i) => {
    console.log(`${i+1}. [${q.chapter}] ${q.question.slice(0, 60)}...`);
  });
}

parse();
