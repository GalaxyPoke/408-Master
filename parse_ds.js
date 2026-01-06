const mammoth = require('mammoth');
const fs = require('fs');

async function parseWordQuestions(filePath, subject) {
  console.log(`解析: ${filePath}`);
  
  const result = await mammoth.extractRawText({ path: filePath });
  let text = result.value;
  
  // 预处理：清理格式
  text = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
  
  const questions = [];
  let currentChapter = '';
  let questionId = 1;
  
  // 数据结构用的是 "1. 题目" 格式
  // 匹配: 数字. 题目 A. xxx B. xxx C. xxx D. xxx
  const fullQuestionRegex = /(\d+)\.\s+(.+?)\s*A\.\s*(.+?)\s*B\.\s*(.+?)\s*C\.\s*(.+?)\s*D\.\s*(.+?)(?=\d+\.\s+[^0-9]|第\d+\s*章|\d+\.\d+\s+[^\d]|$)/g;
  
  // 提取章节 (第1章 绪论)
  const chapterRegex = /第(\d+)\s*章\s*([^\d第]+?)(?=\d+\.\d+|\d+\.\s+[^0-9]|$)/g;
  let chapterMatch;
  const chapterPositions = [];
  
  while ((chapterMatch = chapterRegex.exec(text)) !== null) {
    const chapterName = chapterMatch[2].trim()
      .replace(/\d+\s*$/, '')
      .replace(/答案.*$/, '')
      .trim();
    if (chapterName.length > 1 && chapterName.length < 20) {
      chapterPositions.push({
        index: chapterMatch.index,
        name: `第${chapterMatch[1]}章 ${chapterName}`
      });
    }
  }
  
  console.log('找到章节:', chapterPositions.map(c => c.name));
  
  // 匹配所有题目
  let match;
  while ((match = fullQuestionRegex.exec(text)) !== null) {
    const qNum = parseInt(match[1]);
    // 跳过目录中的数字
    if (qNum > 500) continue;
    
    // 找到当前题目所属章节
    for (let i = chapterPositions.length - 1; i >= 0; i--) {
      if (match.index > chapterPositions[i].index) {
        currentChapter = chapterPositions[i].name;
        break;
      }
    }
    
    // 清理题目文本
    const questionText = match[2].trim()
      .replace(/·第\d+\s*页.*?页·/g, '')
      .replace(/公众号.*?集结地/g, '')
      .replace(/速刷DS.*?绪论/g, '')
      .replace(/26\s*王道.*?做题本/g, '')
      .trim();
    
    // 跳过太短的题目
    if (questionText.length < 5) continue;
    
    // 清理选项文本
    const cleanOption = (opt) => opt.trim()
      .replace(/·第\d+\s*页.*?页·/g, '')
      .replace(/公众号.*?集结地/g, '')
      .replace(/速刷DS.*?绪论/g, '')
      .trim();
    
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

// 解析数据结构
parseWordQuestions('doc/【速刷】26王道数据结构选择题做题本.docx', '数据结构')
  .then(questions => {
    fs.writeFileSync(
      'src/data/questions_ds.json', 
      JSON.stringify(questions, null, 2), 
      'utf8'
    );
    console.log('已保存到: src/data/questions_ds.json');
    
    // 章节统计
    const chapters = {};
    questions.forEach(q => {
      chapters[q.chapter] = (chapters[q.chapter] || 0) + 1;
    });
    console.log('\n--- 章节统计 ---');
    Object.entries(chapters).forEach(([ch, count]) => {
      console.log(`${ch}: ${count} 题`);
    });
    
    // 前3题预览
    console.log('\n--- 前 3 题预览 ---');
    console.log(JSON.stringify(questions.slice(0, 3), null, 2));
  })
  .catch(err => {
    console.error('解析失败:', err);
  });
