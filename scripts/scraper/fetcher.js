/**
 * 网页抓取模块
 * 负责从 csgraduates.com 获取真题页面
 */

const https = require('https');

const BASE_URL = 'https://www.csgraduates.com/study_methods/408quiz';

/**
 * 获取指定年份的真题页面HTML
 * @param {number} year 年份
 * @returns {Promise<string>} HTML内容
 */
function fetchYearData(year) {
  const url = `${BASE_URL}/${year}/`;
  
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

module.exports = { fetchYearData, BASE_URL };
