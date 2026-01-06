const mammoth = require('mammoth');
const fs = require('fs');

const filePath = 'doc/【速刷】26王道操作系统选择题做题本.docx';

console.log('开始解析 Word 文件...');
console.log('文件:', filePath);

mammoth.extractRawText({ path: filePath })
  .then(result => {
    const text = result.value;
    console.log('文本长度:', text.length, '字符');
    
    // 保存到文件
    fs.writeFileSync('word_output.txt', text, 'utf8');
    console.log('已保存到: word_output.txt');
    
    // 打印前 5000 字符看看格式
    console.log('\n--- 前 5000 字符预览 ---\n');
    console.log(text.substring(0, 5000));
  })
  .catch(err => {
    console.error('解析失败:', err.message);
  });
