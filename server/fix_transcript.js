const Database = require('better-sqlite3');
const db = new Database('server/data.db');

const rows = db.prepare('SELECT * FROM video_transcripts').all();

rows.forEach(r => {
  // 去掉中文字符之间的空格，保留标点
  let clean = r.transcript
    .replace(/ ([,，。！？、；：""''（）【】])/g, '$1')
    .replace(/([,，。！？]) /g, '$1')
    .replace(/([一-龥]) ([一-龥])/g, '$1$2') // 去掉中文之间的空格
    .replace(/([一-龥]) ([一-龥])/g, '$1$2') // 再来一次确保全部处理
    .replace(/([一-龥]) ([一-龥])/g, '$1$2')
    .replace(/ +/g, ' ')
    .trim();
  
  db.prepare('UPDATE video_transcripts SET transcript = ? WHERE id = ?').run(clean, r.id);
  console.log('已清理 ID:', r.id);
});

console.log('完成，共清理', rows.length, '条记录');
