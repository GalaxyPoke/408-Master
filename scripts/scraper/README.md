# 408历年真题抓取脚本

从 csgraduates.com 抓取408历年真题数据，转换为项目所需的JS格式。

## 文件结构

```
scripts/scraper/
├── index.js      # 主入口
├── fetcher.js    # 网页抓取模块
├── parser.js     # 数据解析模块
├── output.js     # 数据输出模块
└── README.md     # 说明文档
```

## 使用方法

```bash
cd c:\Users\LENOVO\Desktop\408
node scripts/scraper/index.js
```

## 输出

数据将保存到 `src/data/years/` 目录：

```
src/data/years/
├── exam2009.js
├── exam2010.js
├── ...
├── exam2018.js
└── index.js      # 汇总索引
```

## 数据格式

每个年份文件导出一个数组：

```javascript
export const exam2018 = [
  {
    subject: 'ds',  // ds/co/os/cn
    q: '题目内容',
    options: ['A选项', 'B选项', 'C选项', 'D选项'],
    answer: 0  // 0=A, 1=B, 2=C, 3=D
  },
  // ...
];
```

## 数据来源

- 网站: https://www.csgraduates.com/study_methods/408quiz/
- 年份: 2009-2018
