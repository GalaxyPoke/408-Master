const fs = require('fs');
const pdfParse = require('pdf-parse');

const filePath = 'doc/【速刷】26王道数据结构选择题做题本.pdf';

console.log('开始解析PDF...');
console.log('文件:', filePath);

const dataBuffer = fs.readFileSync(filePath);
console.log('文件大小:', (dataBuffer.length / 1024 / 1024).toFixed(2), 'MB');

pdfParse(dataBuffer).then(data => {
  console.log('页数:', data.numpages);
  console.log('文本长度:', data.text.length, '字符');
  
  // 保存到文件
  fs.writeFileSync('pdf_output.txt', data.text, 'utf8');
  console.log('已保存到: pdf_output.txt');
  
  // 打印前 3000 字符看看格式
  console.log('\n--- 前 3000 字符预览 ---\n');
  console.log(data.text.substring(0, 3000));
}).catch(err => {
  console.error('解析失败:', err.message);
});
