const mammoth = require('mammoth');
const fs = require('fs');

async function parseWordQuestions(filePath, subject) {
  console.log(`解析: ${filePath}`);
  
  const result = await mammoth.extractRawText({ path: filePath });
  let text = result.value;
  
  // 预处理：合并多行，清理格式
  text = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
  
  const questions = [];
  let currentChapter = '';
  let questionId = 1;
  
  // 用正则匹配完整题目: (数字) 题目 A. xxx B. xxx C. xxx D. xxx
  const fullQuestionRegex = /\((\d+)\)\s*(.+?)\s*A\.\s*(.+?)\s*B\.\s*(.+?)\s*C\.\s*(.+?)\s*D\.\s*(.+?)(?=\(\d+\)|第\d+\s*章|$)/g;
  
  // 提取章节
  const chapterRegex = /第(\d+)\s*章\s*([^第]+?)(?=第\d+\s*章|\(\d+\)|$)/g;
  let chapterMatch;
  const chapterPositions = [];
  
  while ((chapterMatch = chapterRegex.exec(text)) !== null) {
    chapterPositions.push({
      index: chapterMatch.index,
      name: `第${chapterMatch[1]}章 ${chapterMatch[2].trim().split(/\d+\.\d+/)[0].trim()}`
    });
  }
  
  // 匹配所有题目
  let match;
  while ((match = fullQuestionRegex.exec(text)) !== null) {
    // 找到当前题目所属章节
    for (let i = chapterPositions.length - 1; i >= 0; i--) {
      if (match.index > chapterPositions[i].index) {
        currentChapter = chapterPositions[i].name;
        break;
      }
    }
    
    const questionText = match[2].trim()
      .replace(/·第\d+\s*页.*?页·/g, '')
      .replace(/公众号.*?集结地/g, '')
      .replace(/CN\s*速刷.*?概述/g, '')
      .trim();
    
    // 清理选项文本
    const cleanOption = (opt) => opt.trim()
      .replace(/·第\d+\s*页.*?页·/g, '')
      .replace(/公众号.*?集结地/g, '')
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

// 解析计算机网络
parseWordQuestions('doc/【速刷】26王道计算机网络选择题做题本.docx', '计算机网络')
  .then(questions => {
    // 保存为 JSON
    fs.writeFileSync(
      'src/data/questions_cn.json', 
      JSON.stringify(questions, null, 2), 
      'utf8'
    );
    console.log('已保存到: src/data/questions_cn.json');
    
    // 打印章节统计
    const chapters = {};
    questions.forEach(q => {
      chapters[q.chapter] = (chapters[q.chapter] || 0) + 1;
    });
    console.log('\n--- 章节统计 ---');
    Object.entries(chapters).forEach(([ch, count]) => {
      console.log(`${ch}: ${count} 题`);
    });
    
    // 打印前 3 题预览
    console.log('\n--- 前 3 题预览 ---');
    console.log(JSON.stringify(questions.slice(0, 3), null, 2));
  })
  .catch(err => {
    console.error('解析失败:', err);
  });
