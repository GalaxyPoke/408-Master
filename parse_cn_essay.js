const mammoth = require('mammoth');
const fs = require('fs');

async function parse() {
  console.log('解析: 计算机网络综合题\n');
  
  const result = await mammoth.extractRawText({ path: 'doc/[A4版]25WD-计算机网络综合题做题本.docx' });
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
    
    // 检测小节
    const sectionMatch = line.match(/^(\d+)\.(\d+)\s+(.+)/);
    if (sectionMatch) {
      const chNum = parseInt(sectionMatch[1]);
      const chapterNames = {
        1: '计算机网络体系结构', 2: '物理层', 3: '数据链路层',
        4: '网络层', 5: '传输层', 6: '应用层'
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
          subject: '计算机网络'
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
      subject: '计算机网络'
    });
  }
  
  console.log(`解析完成，共 ${questions.length} 道题\n`);
  
  const stats = {};
  questions.forEach(q => { stats[q.chapter] = (stats[q.chapter] || 0) + 1; });
  console.log('章节统计:');
  Object.entries(stats).forEach(([ch, count]) => console.log(`  ${ch}: ${count} 题`));
  
  fs.writeFileSync('src/data/questions/cn_essay.json', JSON.stringify(questions, null, 2), 'utf8');
  console.log('\n已保存');
}

parse();
