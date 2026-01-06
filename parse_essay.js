const mammoth = require('mammoth');
const fs = require('fs');

async function parseEssayQuestions(filePath, subject, subjectId) {
  console.log(`\n解析综合题: ${filePath}`);
  
  const result = await mammoth.extractRawText({ path: filePath });
  let text = result.value;
  
  const questions = [];
  let questionId = 1;
  
  // 提取章节 - 支持两种格式: "第一章" 和 "第1 章"
  const chapterRegex1 = /第([一二三四五六七八九十]+)章\s*([^\n\.]+)/g;
  const chapterRegex2 = /第(\d+)\s*章\s*([^\n\.]+)/g;
  
  const chapterPositions = [];
  
  let match;
  while ((match = chapterRegex1.exec(text)) !== null) {
    const chapterNum = '一二三四五六七八九十'.indexOf(match[1]) + 1;
    const chapterName = match[2].trim().replace(/\s+/g, '').replace(/\.+/g, '').slice(0, 15);
    if (chapterName.length > 0) {
      chapterPositions.push({ index: match.index, name: `第${chapterNum}章 ${chapterName}` });
    }
  }
  
  while ((match = chapterRegex2.exec(text)) !== null) {
    const chapterNum = parseInt(match[1]);
    const chapterName = match[2].trim().replace(/\s+/g, '').replace(/\.+/g, '').slice(0, 15);
    if (chapterName.length > 0 && chapterNum <= 10) {
      chapterPositions.push({ index: match.index, name: `第${chapterNum}章 ${chapterName}` });
    }
  }
  
  // 按位置排序并去重
  chapterPositions.sort((a, b) => a.index - b.index);
  const uniqueChapters = [];
  chapterPositions.forEach(c => {
    if (!uniqueChapters.find(u => u.name === c.name)) {
      uniqueChapters.push(c);
    }
  });
  
  console.log('找到章节:', uniqueChapters.map(c => c.name));
  
  // 匹配综合题: 01. 或 1. 开头
  const questionRegex = /(?:^|\n)\s*(\d{1,2})\.\s*([^]*?)(?=\n\s*\d{1,2}\.\s|\n第[一二三四五六七八九十\d]+\s*章|$)/g;
  
  let currentChapter = '';
  
  while ((match = questionRegex.exec(text)) !== null) {
    const qNum = parseInt(match[1]);
    if (qNum > 50) continue;
    
    // 找章节
    for (let i = uniqueChapters.length - 1; i >= 0; i--) {
      if (match.index > uniqueChapters[i].index) {
        currentChapter = uniqueChapters[i].name;
        break;
      }
    }
    
    // 清理题目
    let questionText = match[2].trim()
      .replace(/公众号.*?集结地/g, '')
      .replace(/第\s*\d+\s*页.*?页/g, '')
      .replace(/[A-Z]{2}\s*综合题.*?[^\n]+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    if (questionText.length < 15) continue;
    if (questionText.includes('...')) continue;
    
    questions.push({
      id: questionId++,
      chapter: currentChapter,
      question: questionText,
      type: 'essay',
      subject: subject
    });
  }
  
  console.log(`解析完成，共 ${questions.length} 道综合题`);
  return questions;
}

async function parseAll() {
  const subjects = [
    { file: 'doc/[A4版]25WD-数据结构综合题做题本.docx', name: '数据结构', id: 'ds' },
    { file: 'doc/[A4版]25WD-计算机组成原理综合题做题本.docx', name: '计算机组成原理', id: 'co' },
    { file: 'doc/[A4版]WD-操作系统综合题做题本.docx', name: '操作系统', id: 'os' },
    { file: 'doc/[A4版]25WD-计算机网络综合题做题本.docx', name: '计算机网络', id: 'cn' },
  ];
  
  let totalCount = 0;
  
  for (const sub of subjects) {
    try {
      const questions = await parseEssayQuestions(sub.file, sub.name, sub.id);
      totalCount += questions.length;
      
      fs.writeFileSync(`src/data/questions/${sub.id}_essay.json`, JSON.stringify(questions, null, 2), 'utf8');
      
      const chapters = {};
      questions.forEach(q => { chapters[q.chapter] = (chapters[q.chapter] || 0) + 1; });
      console.log('章节统计:');
      Object.entries(chapters).forEach(([ch, count]) => console.log(`  ${ch}: ${count} 题`));
    } catch (err) {
      console.error(`解析 ${sub.name} 失败:`, err.message);
    }
  }
  
  console.log(`\n========== 总计: ${totalCount} 道综合题 ==========`);
}

parseAll();
