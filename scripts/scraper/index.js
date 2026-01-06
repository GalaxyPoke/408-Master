/**
 * 408历年真题抓取脚本 - 主入口
 * 从 csgraduates.com 抓取408历年真题数据
 * 
 * 使用方法: node scripts/scraper/index.js
 */

const { fetchYearData } = require('./fetcher');
const { parseQuestions } = require('./parser');
const { saveYearData, generateIndex } = require('./output');

// 需要抓取的年份范围
const YEARS = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];

async function main() {
  console.log('========================================');
  console.log('408历年真题抓取工具');
  console.log('数据来源: csgraduates.com');
  console.log('========================================\n');

  const results = {};

  for (const year of YEARS) {
    console.log(`\n[${year}] 开始抓取...`);
    
    try {
      // 1. 获取网页内容
      const html = await fetchYearData(year);
      console.log(`[${year}] 网页获取成功`);
      
      // 2. 解析题目数据
      const questions = parseQuestions(html, year);
      console.log(`[${year}] 解析完成，共 ${questions.length} 道选择题`);
      
      // 3. 保存到文件
      await saveYearData(year, questions);
      console.log(`[${year}] 数据已保存`);
      
      results[year] = questions.length;
      
      // 延迟避免请求过快
      await sleep(1000);
    } catch (error) {
      console.error(`[${year}] 抓取失败:`, error.message);
      results[year] = 0;
    }
  }

  // 生成索引文件
  console.log('\n生成索引文件...');
  await generateIndex(YEARS);

  // 输出统计
  console.log('\n========================================');
  console.log('抓取完成！统计:');
  console.log('========================================');
  let total = 0;
  for (const [year, count] of Object.entries(results)) {
    console.log(`${year}年: ${count} 题`);
    total += count;
  }
  console.log(`总计: ${total} 题`);
  console.log('\n数据文件位置: src/data/years/');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
