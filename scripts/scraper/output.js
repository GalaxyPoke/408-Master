/**
 * 数据输出模块
 * 负责将解析后的数据保存为JS文件
 */

const fs = require('fs');
const path = require('path');

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../../src/data/years');

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 保存某年份的数据
 * @param {number} year 年份
 * @param {Array} questions 题目数组
 */
async function saveYearData(year, questions) {
  ensureDir(OUTPUT_DIR);
  
  const filePath = path.join(OUTPUT_DIR, `exam${year}.js`);
  
  const content = `// ${year}年408真题选择题数据
// 自动生成，数据来源: csgraduates.com

export const exam${year} = ${JSON.stringify(questions, null, 2)};

export default exam${year};
`;

  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 生成索引文件，汇总所有年份
 */
async function generateIndex(years) {
  ensureDir(OUTPUT_DIR);
  
  const imports = years.map(y => `import { exam${y} } from './exam${y}';`).join('\n');
  const exports = years.map(y => `  ${y}: exam${y},`).join('\n');
  
  const content = `// 历年真题数据索引
// 自动生成

${imports}

export const examDataByYear = {
${exports}
};

export default examDataByYear;
`;

  const filePath = path.join(OUTPUT_DIR, 'index.js');
  fs.writeFileSync(filePath, content, 'utf-8');
}

module.exports = { saveYearData, generateIndex, OUTPUT_DIR };
