const mammoth = require('mammoth');
const fs = require('fs');

async function parseWordQuestions(filePath, subject) {
  console.log(`解析: ${filePath}`);
  
  const result = await mammoth.extractRawText({ path: filePath });
  let text = result.value;
  
  text = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
  
  const questions = [];
  let currentChapter = '';
  let questionId = 1;
  
  // (数字) 格式
  const fullQuestionRegex = /\((\d+)\)\s*(.+?)\s*A\.\s*(.+?)\s*B\.\s*(.+?)\s*C\.\s*(.+?)\s*D\.\s*(.+?)(?=\(\d+\)|第\d+\s*章|$)/g;
  
  // 提取章节 - 计组格式: 第1 章计算机系统概述
  const chapterRegex = /第(\d+)\s*章\s*([^\d第(]+?)(?=\d+\.\d+|第\d+\s*章|\(\d+\)|$)/g;
  let chapterMatch;
  const chapterPositions = [];
  
  while ((chapterMatch = chapterRegex.exec(text)) !== null) {
    let chapterName = chapterMatch[2].trim()
      .replace(/答案.*$/, '')
      .replace(/\d+\s*$/, '')
      .trim();
    if (chapterName.length > 1 && chapterName.length < 30) {
      chapterPositions.push({
        index: chapterMatch.index,
        name: `第${chapterMatch[1]}章 ${chapterName}`
      });
    }
  }
  
  console.log('找到章节:', chapterPositions.map(c => c.name));
  
  const cleanOption = (opt) => opt.trim()
    .replace(/·第\d+\s*页.*?页·/g, '')
    .replace(/公众号.*?集结地/g, '')
    .trim();
  
  const cleanQuestion = (q) => q.trim()
    .replace(/·第\d+\s*页.*?页·/g, '')
    .replace(/公众号.*?集结地/g, '')
    .trim();
  
  let match;
  while ((match = fullQuestionRegex.exec(text)) !== null) {
    for (let i = chapterPositions.length - 1; i >= 0; i--) {
      if (match.index > chapterPositions[i].index) {
        currentChapter = chapterPositions[i].name;
        break;
      }
    }
    
    const questionText = cleanQuestion(match[2]);
    if (questionText.length < 5) continue;
    
    questions.push({
      id: questionId++,
      chapter: currentChapter,
      question: questionText,
      options: [
        { label: 'A', text: cleanOption(match[3]) },
        { label: 'B', text: cleanOption(match[4]) },
        { label: 'C', text: cleanOption(match[5]) },
        { label: 'D', text: cleanOption(match[6]) }
      ],
      answer: null,
      subject: subject
    });
  }
  
  console.log(`解析完成，共 ${questions.length} 道题`);
  return questions;
}

parseWordQuestions('doc/【无间隙】26王道计算机组成原理选择题做题本.docx', '计算机组成原理')
  .then(questions => {
    fs.writeFileSync('src/data/questions_co.json', JSON.stringify(questions, null, 2), 'utf8');
    console.log('已保存到: src/data/questions_co.json');
    
    const chapters = {};
    questions.forEach(q => { chapters[q.chapter] = (chapters[q.chapter] || 0) + 1; });
    console.log('\n--- 章节统计 ---');
    Object.entries(chapters).forEach(([ch, count]) => console.log(`${ch}: ${count} 题`));
  });
