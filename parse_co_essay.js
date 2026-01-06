const mammoth = require('mammoth');
const fs = require('fs');

async function parse() {
  console.log('解析: 计算机组成原理综合题\n');
  
  const result = await mammoth.extractRawText({ path: 'doc/[A4版]25WD-计算机组成原理综合题做题本.docx' });
  let text = result.value;
  
  // 跳过目录
  const contentStart = text.indexOf('1.3');
  if (contentStart > 0) text = text.substring(contentStart);
  
  const questions = [];
  let questionId = 1;
  let currentChapter = '';
  let currentQuestion = '';
  
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测小节
    const sectionMatch = line.match(/^(\d+)\.(\d+)\s+(.+)/);
    if (sectionMatch) {
      const chNum = parseInt(sectionMatch[1]);
      const chapterNames = {
        1: '计算机系统概述', 2: '数据的表示和运算', 3: '存储系统',
        4: '指令系统', 5: '中央处理器', 6: '总线', 7: '输入/输出系统'
      };
      currentChapter = `第${chNum}章 ${chapterNames[chNum] || ''}`;
      continue;
    }
    
    // 检测题目 (无空格也匹配)
    const qMatch = line.match(/^(\d{2})\.(.+)/);
    if (qMatch) {
      if (currentQuestion && currentQuestion.length > 20) {
        questions.push({
          id: questionId++,
          chapter: currentChapter,
          question: currentQuestion.replace(/公众号.*?集结地/g, '').replace(/第\s*\d+\s*页.*?页/g, '').trim(),
          type: 'essay',
          subject: '计算机组成原理'
        });
      }
      currentQuestion = qMatch[2];
      continue;
    }
    
    if (currentQuestion && line && !line.includes('公众号') && !line.match(/^第\d+页/)) {
      currentQuestion += '\n' + line;
    }
  }
  
  if (currentQuestion && currentQuestion.length > 20) {
    questions.push({
      id: questionId++,
      chapter: currentChapter,
      question: currentQuestion.replace(/公众号.*?集结地/g, '').replace(/第\s*\d+\s*页.*?页/g, '').trim(),
      type: 'essay',
      subject: '计算机组成原理'
    });
  }
  
  console.log(`解析完成，共 ${questions.length} 道题\n`);
  
  const stats = {};
  questions.forEach(q => { stats[q.chapter] = (stats[q.chapter] || 0) + 1; });
  console.log('章节统计:');
  Object.entries(stats).forEach(([ch, count]) => console.log(`  ${ch}: ${count} 题`));
  
  fs.writeFileSync('src/data/questions/co_essay.json', JSON.stringify(questions, null, 2), 'utf8');
  console.log('\n已保存');
}

parse();
