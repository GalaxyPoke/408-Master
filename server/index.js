const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = 3001;

// 视频存储目录
const videosDir = path.join(__dirname, '..', 'public', 'videos');
console.log('Videos directory:', videosDir);
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
  console.log('Created videos directory');
} else {
  console.log('Videos directory exists');
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videosDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueName);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('只支持视频文件'));
    }
  }
});

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件 - 后台管理页面
app.use('/admin', express.static(path.join(__dirname), { index: 'admin.html' }));

// 静态文件 - 视频文件 (添加CORS头支持canvas导出)
app.use('/videos', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(videosDir));

// 初始化数据库
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    gradient TEXT
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'bilibili',
    url TEXT NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER,
    chapter_id TEXT,
    subject_id TEXT,
    content TEXT NOT NULL,
    timestamp INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER,
    chapter_id TEXT,
    subject_id TEXT,
    type TEXT DEFAULT 'choice',
    question TEXT NOT NULL,
    options TEXT,
    answer TEXT NOT NULL,
    explanation TEXT,
    difficulty INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
  );

  CREATE TABLE IF NOT EXISTS exercise_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER NOT NULL,
    user_answer TEXT,
    is_correct INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  );

  CREATE TABLE IF NOT EXISTS knowledge_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER,
    chapter_id TEXT,
    subject_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    importance INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
  );
`);

// 初始化默认数据
const initDefaultData = () => {
  const subjectCount = db.prepare('SELECT COUNT(*) as count FROM subjects').get();
  if (subjectCount.count > 0) return;

  const defaultData = {
    ds: { name: '数据结构', icon: 'DS', gradient: 'from-blue-500 to-blue-600', chapters: [
      '绪论', '线性表', '栈', '队列', '串', '树', '二叉树', '图', '查找', '排序'
    ]},
    co: { name: '计算机组成', icon: 'CO', gradient: 'from-purple-500 to-purple-600', chapters: [
      '计算机系统概述', '数据的表示', '数据的运算', '存储器概述', 'Cache', '虚拟存储器', '指令系统', 'CPU结构', '指令流水线', '总线', '输入输出系统'
    ]},
    os: { name: '操作系统', icon: 'OS', gradient: 'from-emerald-500 to-emerald-600', chapters: [
      '操作系统概述', '进程', '线程', '处理机调度', '进程同步', '死锁', '内存管理', '虚拟内存', '文件系统', '磁盘管理', 'I/O管理'
    ]},
    cn: { name: '计算机网络', icon: 'CN', gradient: 'from-orange-500 to-orange-600', chapters: [
      '网络体系结构', '物理层', '数据链路层', '网络层', 'IP协议', '路由算法', '传输层', 'TCP协议', 'UDP协议', '应用层', 'HTTP协议', 'DNS'
    ]}
  };

  const insertSubject = db.prepare('INSERT INTO subjects (id, name, icon, gradient) VALUES (?, ?, ?, ?)');
  const insertChapter = db.prepare('INSERT INTO chapters (id, subject_id, name, sort_order) VALUES (?, ?, ?, ?)');

  for (const [id, subject] of Object.entries(defaultData)) {
    insertSubject.run(id, subject.name, subject.icon, subject.gradient);
    subject.chapters.forEach((name, index) => {
      insertChapter.run(`${id}-ch${index + 1}`, id, name, index);
    });
  }
  console.log('Default data initialized');
};

initDefaultData();

// API: 获取所有数据
app.get('/api/data', (req, res) => {
  const subjects = db.prepare('SELECT * FROM subjects').all();
  const chapters = db.prepare('SELECT * FROM chapters ORDER BY sort_order').all();
  const videos = db.prepare('SELECT * FROM videos ORDER BY created_at').all();

  const result = {};
  for (const subject of subjects) {
    result[subject.id] = {
      name: subject.name,
      icon: subject.icon,
      gradient: subject.gradient,
      chapters: chapters
        .filter(ch => ch.subject_id === subject.id)
        .map(ch => ({
          id: ch.id,
          name: ch.name,
          videos: videos.filter(v => v.chapter_id === ch.id).map(v => ({
            id: v.id,
            title: v.title,
            type: v.type,
            url: v.url,
            description: v.description,
            progress: v.progress
          }))
        }))
    };
  }
  res.json(result);
});

// API: 添加章节
app.post('/api/chapters', (req, res) => {
  const { id, subject_id, name } = req.body;
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM chapters WHERE subject_id = ?').get(subject_id);
  const sortOrder = (maxOrder.max || 0) + 1;
  
  db.prepare('INSERT INTO chapters (id, subject_id, name, sort_order) VALUES (?, ?, ?, ?)').run(id, subject_id, name, sortOrder);
  res.json({ success: true, id });
});

// API: 删除章节
app.delete('/api/chapters/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM videos WHERE chapter_id = ?').run(id);
  db.prepare('DELETE FROM chapters WHERE id = ?').run(id);
  res.json({ success: true });
});

// API: 添加视频
app.post('/api/videos', (req, res) => {
  const { chapter_id, title, type, url, description } = req.body;
  const result = db.prepare('INSERT INTO videos (chapter_id, title, type, url, description) VALUES (?, ?, ?, ?, ?)').run(chapter_id, title, type, url, description || '');
  res.json({ success: true, id: result.lastInsertRowid });
});

// API: 删除视频
app.delete('/api/videos/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM videos WHERE id = ?').run(id);
  res.json({ success: true });
});

// API: 更新视频进度
app.patch('/api/videos/:id/progress', (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;
  db.prepare('UPDATE videos SET progress = ? WHERE id = ?').run(progress, id);
  res.json({ success: true });
});

// API: 更新视频标题
app.patch('/api/videos/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: '标题不能为空' });
  }
  db.prepare('UPDATE videos SET title = ? WHERE id = ?').run(title, id);
  res.json({ success: true });
});

// API: 上传视频文件
app.post('/api/upload', (req, res) => {
  console.log('Upload request received');
  upload.single('video')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message, err.stack);
      return res.status(400).json({ error: err.message || '上传失败' });
    }
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: '没有上传文件' });
    }
    console.log('File uploaded successfully:', req.file.filename);
    const url = `/videos/${req.file.filename}`;
    res.json({ 
      success: true, 
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  });
});

// API: AI聊天 (硅基流动)
const SILICONFLOW_API_KEY = 'sk-huftmwgtvnruhxwveonhoqukwtnsstlzezlwbflmldeqjruj';
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, model = 'Qwen/Qwen2.5-7B-Instruct' } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '消息格式错误' });
    }

    // 添加系统提示词，专注于408考研
    const systemMessage = {
      role: 'system',
      content: '你是一个专业的408考研辅导助手，精通数据结构、计算机组成原理、操作系统和计算机网络四门课程。请用简洁清晰的方式回答问题，必要时可以使用代码示例或图表说明。'
    };

    const response = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('SiliconFlow API error:', errorData);
      return res.status(response.status).json({ error: 'AI服务请求失败', details: errorData });
    }

    const data = await response.json();
    res.json({
      success: true,
      message: data.choices[0]?.message?.content || '无响应',
      usage: data.usage
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'AI服务异常', details: error.message });
  }
});

// API: 获取可用模型列表
app.get('/api/ai/models', (req, res) => {
  res.json({
    models: [
      { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen2.5-7B (推荐)', description: '通义千问2.5，性价比高' },
      { id: 'Qwen/Qwen2.5-32B-Instruct', name: 'Qwen2.5-32B', description: '通义千问2.5大模型' },
      { id: 'deepseek-ai/DeepSeek-V2.5', name: 'DeepSeek-V2.5', description: 'DeepSeek最新模型' },
      { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4-9B', description: '智谱GLM-4' }
    ]
  });
});

// PDF文件存储目录
const pdfDir = path.join(__dirname, '..', 'public', 'pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// PDF上传配置
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pdfDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueName);
  }
});
const pdfUpload = multer({
  storage: pdfStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('只支持PDF文件'));
    }
  }
});

// API: 上传并解析PDF
app.post('/api/pdf/parse', (req, res) => {
  pdfUpload.single('pdf')(req, res, async (err) => {
    if (err) {
      console.error('PDF upload error:', err.message);
      return res.status(400).json({ error: err.message || '上传失败' });
    }
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    try {
      const pdfPath = req.file.path;
      const dataBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdfParse(dataBuffer);

      res.json({
        success: true,
        filename: req.file.originalname,
        pages: pdfData.numpages,
        text: pdfData.text,
        info: pdfData.info
      });
    } catch (parseError) {
      console.error('PDF parse error:', parseError);
      res.status(500).json({ error: 'PDF解析失败', details: parseError.message });
    }
  });
});

// API: 解析本地PDF文件（通过路径）
app.post('/api/pdf/parse-local', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: '请提供文件路径' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    res.json({
      success: true,
      filename: path.basename(filePath),
      pages: pdfData.numpages,
      text: pdfData.text,
      info: pdfData.info
    });
  } catch (error) {
    console.error('PDF parse error:', error);
    res.status(500).json({ error: 'PDF解析失败', details: error.message });
  }
});

// API: 解析习题册PDF并用AI提取习题
app.post('/api/pdf/parse-exercises', async (req, res) => {
  try {
    const { filePath, subject_id, answerFilePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: '请提供习题文件路径' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '习题文件不存在' });
    }

    // 解析习题PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    // 解析答案PDF（如果提供）
    let answerText = '';
    if (answerFilePath && fs.existsSync(answerFilePath)) {
      const answerBuffer = fs.readFileSync(answerFilePath);
      const answerData = await pdfParse(answerBuffer);
      answerText = answerData.text;
    }

    // 跳过目录，找到实际习题内容
    let textContent = pdfData.text;
    const chapterStart = textContent.indexOf('第一章');
    if (chapterStart > 1000) {
      // 找到第二个"第一章"（实际内容开始）
      const secondChapter = textContent.indexOf('第一章', chapterStart + 100);
      if (secondChapter > 0) {
        textContent = textContent.substring(secondChapter);
      }
    }
    
    // 用AI提取习题
    const prompt = `请从以下习题册内容中提取选择题，返回JSON格式。

习题内容：
${textContent.substring(0, 10000)}

${answerText ? `答案内容：\n${answerText.substring(0, 5000)}` : ''}

请按以下JSON格式返回（只返回JSON，不要其他内容）：
{"exercises":[{"question":"题目内容","options":["A选项","B选项","C选项","D选项"],"answer":"正确答案字母","explanation":"解析","difficulty":1}]}

要求：
1. 提取所有能识别的选择题（格式如：01. 题目内容）
2. 选项格式如：A. 选项内容
3. 如果有答案，匹配对应的正确答案
4. difficulty: 1简单 2中等 3困难
5. 尽可能多提取习题`;

    const aiResponse = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4096
      })
    });

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    // 解析AI返回的JSON
    let exercises = [];
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        exercises = parsed.exercises || [];
      }
    } catch (e) {
      console.error('AI返回解析失败:', e);
    }

    // 保存到数据库
    if (exercises.length > 0 && subject_id) {
      const insertStmt = db.prepare(`
        INSERT INTO exercises (subject_id, type, question, options, answer, explanation, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const e of exercises) {
        insertStmt.run(
          subject_id,
          'choice',
          e.question,
          JSON.stringify(e.options || []),
          e.answer || '',
          e.explanation || '',
          e.difficulty || 1
        );
      }
    }

    res.json({
      success: true,
      filename: path.basename(filePath),
      pages: pdfData.numpages,
      extractedCount: exercises.length,
      exercises: exercises
    });
  } catch (error) {
    console.error('Exercise parse error:', error);
    res.status(500).json({ error: '习题解析失败', details: error.message });
  }
});

// 音频上传配置（用于语音转文字）
const audioDir = path.join(__dirname, '..', 'public', 'audios');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueName);
  }
});
const audioUpload = multer({
  storage: audioStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB (支持视频)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg', 'audio/flac', 'audio/webm', 'video/mp4', 'video/webm', 'video/avi', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|m4a|ogg|flac|webm|mp4|avi|mov|mkv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('只支持音频/视频文件'));
    }
  }
});

// API: 音频转文字 (使用硅基流动 SenseVoice)
app.post('/api/audio/transcribe', (req, res) => {
  audioUpload.single('audio')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    try {
      console.log('开始语音转文字:', req.file.originalname, '大小:', (req.file.size / 1024 / 1024).toFixed(2) + 'MB');
      
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(req.file.path));
      formData.append('model', 'FunAudioLLM/SenseVoiceSmall');
      
      const response = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      // 删除临时文件
      fs.unlinkSync(req.file.path);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('语音转文字失败:', errorText);
        return res.status(response.status).json({ error: '语音转文字失败', details: errorText });
      }

      const data = await response.json();
      res.json({
        success: true,
        text: data.text,
        duration: data.duration
      });
    } catch (error) {
      console.error('语音转文字错误:', error);
      // 尝试删除临时文件
      try { fs.unlinkSync(req.file.path); } catch {}
      res.status(500).json({ error: '语音转文字失败', details: error.message });
    }
  });
});

// API: 通过视频URL转文字
app.post('/api/audio/transcribe-url', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ error: '请提供视频URL' });
    }

    // 如果是本地视频路径，转换为完整路径
    let filePath;
    if (videoUrl.startsWith('/videos/')) {
      filePath = path.join(__dirname, '..', 'public', videoUrl);
    } else {
      return res.status(400).json({ error: '只支持本地视频' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '视频文件不存在' });
    }

    console.log('开始转写本地视频:', filePath);
    
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('model', 'FunAudioLLM/SenseVoiceSmall');
    
    const response = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('语音转文字失败:', errorText);
      return res.status(response.status).json({ error: '语音转文字失败', details: errorText });
    }

    const data = await response.json();
    res.json({
      success: true,
      text: data.text,
      duration: data.duration
    });
  } catch (error) {
    console.error('语音转文字错误:', error);
    res.status(500).json({ error: '语音转文字失败', details: error.message });
  }
});

// 图片上传配置（用于OCR）
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pdfDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueName);
  }
});
const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片文件'));
    }
  }
});

// API: OCR解析图片
app.post('/api/ocr/image', (req, res) => {
  imageUpload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    try {
      console.log('开始OCR识别:', req.file.originalname);
      const result = await Tesseract.recognize(
        req.file.path,
        'chi_sim+eng',
        { 
          logger: m => console.log(m.status, Math.round(m.progress * 100) + '%')
        }
      );
      
      // 删除临时文件
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        text: result.data.text,
        confidence: result.data.confidence
      });
    } catch (error) {
      console.error('OCR error:', error);
      res.status(500).json({ error: 'OCR识别失败', details: error.message });
    }
  });
});

// ========== GitHub集成 ==========

// GitHub OAuth配置 (用户需要在GitHub创建OAuth App获取)
let githubConfig = {
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  accessToken: null,
  username: null
};

// 获取GitHub配置状态
app.get('/api/github/status', (req, res) => {
  res.json({
    configured: !!githubConfig.clientId,
    connected: !!githubConfig.accessToken,
    username: githubConfig.username
  });
});

// 设置GitHub OAuth配置
app.post('/api/github/config', (req, res) => {
  const { clientId, clientSecret } = req.body;
  githubConfig.clientId = clientId;
  githubConfig.clientSecret = clientSecret;
  res.json({ success: true, message: 'GitHub配置已保存' });
});

// 使用Personal Access Token连接（更简单的方式）
app.post('/api/github/token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: '请提供Token' });
  }

  try {
    // 验证token并获取用户信息
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': '408-Study-Guide'
      }
    });

    if (!userRes.ok) {
      return res.status(401).json({ error: 'Token无效或已过期' });
    }

    const userData = await userRes.json();
    githubConfig.accessToken = token;
    githubConfig.username = userData.login;
    githubConfig.clientId = 'token'; // 标记为token方式

    res.json({
      success: true,
      username: userData.login,
      message: '连接成功'
    });
  } catch (error) {
    console.error('GitHub token error:', error);
    res.status(500).json({ error: '连接失败', details: error.message });
  }
});

// GitHub OAuth回调
app.get('/api/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('缺少授权码');
  }

  try {
    // 用code换取access_token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: githubConfig.clientId,
        client_secret: githubConfig.clientSecret,
        code: code
      })
    });

    const tokenData = await tokenRes.json();
    
    if (tokenData.access_token) {
      githubConfig.accessToken = tokenData.access_token;
      
      // 获取用户信息
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'User-Agent': '408-Study-Guide'
        }
      });
      const userData = await userRes.json();
      githubConfig.username = userData.login;
      
      // 重定向回前端
      res.redirect('http://localhost:3000?github=success');
    } else {
      res.redirect('http://localhost:3000?github=error');
    }
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect('http://localhost:3000?github=error');
  }
});

// 获取GitHub授权URL
app.get('/api/github/auth-url', (req, res) => {
  if (!githubConfig.clientId) {
    return res.status(400).json({ error: '请先配置GitHub OAuth' });
  }
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubConfig.clientId}&scope=repo&redirect_uri=http://localhost:3001/api/github/callback`;
  res.json({ url: authUrl });
});

// 上传笔记到GitHub
app.post('/api/github/upload-note', async (req, res) => {
  if (!githubConfig.accessToken) {
    return res.status(401).json({ error: '请先登录GitHub' });
  }

  const { imageData, filename, repoName, message } = req.body;
  
  if (!imageData || !filename) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  try {
    const repo = repoName || '408-study-notes';
    
    // 检查仓库是否存在，不存在则创建
    const repoCheck = await fetch(`https://api.github.com/repos/${githubConfig.username}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${githubConfig.accessToken}`,
        'User-Agent': '408-Study-Guide'
      }
    });

    if (repoCheck.status === 404) {
      // 创建仓库
      await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubConfig.accessToken}`,
          'User-Agent': '408-Study-Guide',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repo,
          description: '408考研学习笔记',
          private: false,
          auto_init: true
        })
      });
      
      // 等待仓库创建完成
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 上传文件
    const base64Content = imageData.replace(/^data:image\/\w+;base64,/, '');
    const filePath = `notes/${filename}`;
    
    // 先检查文件是否存在（获取SHA用于更新）
    let sha = null;
    try {
      const checkRes = await fetch(`https://api.github.com/repos/${githubConfig.username}/${repo}/contents/${filePath}`, {
        headers: {
          'Authorization': `Bearer ${githubConfig.accessToken}`,
          'User-Agent': '408-Study-Guide'
        }
      });
      if (checkRes.ok) {
        const existingFile = await checkRes.json();
        sha = existingFile.sha;
      }
    } catch (e) {
      // 文件不存在，正常情况
    }
    
    const uploadBody = {
      message: message || `添加笔记: ${filename}`,
      content: base64Content
    };
    if (sha) {
      uploadBody.sha = sha; // 更新已存在的文件需要SHA
    }
    
    const uploadRes = await fetch(`https://api.github.com/repos/${githubConfig.username}/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubConfig.accessToken}`,
        'User-Agent': '408-Study-Guide',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadBody)
    });

    const uploadData = await uploadRes.json();
    
    if (uploadRes.ok) {
      res.json({
        success: true,
        url: uploadData.content.html_url,
        message: '笔记已上传到GitHub'
      });
    } else {
      console.error('GitHub upload failed:', uploadData);
      res.status(400).json({ error: uploadData.message || '上传失败' });
    }
  } catch (error) {
    console.error('GitHub upload error:', error);
    res.status(500).json({ error: '上传失败', details: error.message });
  }
});

// 断开GitHub连接
app.post('/api/github/disconnect', (req, res) => {
  githubConfig.accessToken = null;
  githubConfig.username = null;
  res.json({ success: true, message: '已断开GitHub连接' });
});

// ========== 笔记API (边学边记) ==========

// 获取笔记列表
app.get('/api/notes', (req, res) => {
  try {
    const { video_id, chapter_id, subject_id } = req.query;
    let sql = 'SELECT * FROM notes WHERE 1=1';
    const params = [];
    
    if (video_id) {
      sql += ' AND video_id = ?';
      params.push(video_id);
    }
    if (chapter_id) {
      sql += ' AND chapter_id = ?';
      params.push(chapter_id);
    }
    if (subject_id) {
      sql += ' AND subject_id = ?';
      params.push(subject_id);
    }
    
    sql += ' ORDER BY created_at DESC';
    const notes = db.prepare(sql).all(...params);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加笔记
app.post('/api/notes', (req, res) => {
  try {
    const { video_id, chapter_id, subject_id, content, timestamp } = req.body;
    if (!content) {
      return res.status(400).json({ error: '笔记内容不能为空' });
    }
    
    const result = db.prepare(`
      INSERT INTO notes (video_id, chapter_id, subject_id, content, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(video_id || null, chapter_id || null, subject_id || null, content, timestamp || 0);
    
    res.json({ id: result.lastInsertRowid, message: '笔记添加成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新笔记
app.put('/api/notes/:id', (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: '笔记内容不能为空' });
    }
    
    db.prepare(`
      UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(content, req.params.id);
    
    res.json({ message: '笔记更新成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除笔记
app.delete('/api/notes/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    res.json({ message: '笔记删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有笔记（用于导出）
app.get('/api/notes/export', (req, res) => {
  try {
    const notes = db.prepare(`
      SELECT n.*, v.title as video_title, c.name as chapter_name, s.name as subject_name
      FROM notes n
      LEFT JOIN videos v ON n.video_id = v.id
      LEFT JOIN chapters c ON n.chapter_id = c.id
      LEFT JOIN subjects s ON n.subject_id = s.id
      ORDER BY n.created_at DESC
    `).all();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 习题API ==========

// 获取习题列表
app.get('/api/exercises', (req, res) => {
  try {
    const { video_id, chapter_id, subject_id } = req.query;
    let sql = 'SELECT * FROM exercises WHERE 1=1';
    const params = [];
    
    if (video_id) {
      sql += ' AND video_id = ?';
      params.push(video_id);
    }
    if (chapter_id) {
      sql += ' AND chapter_id = ?';
      params.push(chapter_id);
    }
    if (subject_id) {
      sql += ' AND subject_id = ?';
      params.push(subject_id);
    }
    
    sql += ' ORDER BY created_at DESC';
    const exercises = db.prepare(sql).all(...params);
    
    // 解析options JSON
    const result = exercises.map(e => ({
      ...e,
      options: e.options ? JSON.parse(e.options) : []
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加习题
app.post('/api/exercises', (req, res) => {
  try {
    const { video_id, chapter_id, subject_id, type, question, options, answer, explanation, difficulty } = req.body;
    
    const result = db.prepare(`
      INSERT INTO exercises (video_id, chapter_id, subject_id, type, question, options, answer, explanation, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      video_id || null,
      chapter_id || null,
      subject_id || null,
      type || 'choice',
      question,
      JSON.stringify(options || []),
      answer,
      explanation || '',
      difficulty || 1
    );
    
    res.json({ id: result.lastInsertRowid, message: '习题添加成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量添加习题
app.post('/api/exercises/batch', (req, res) => {
  try {
    const { exercises } = req.body;
    const insertStmt = db.prepare(`
      INSERT INTO exercises (video_id, chapter_id, subject_id, type, question, options, answer, explanation, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((items) => {
      for (const e of items) {
        insertStmt.run(
          e.video_id || null,
          e.chapter_id || null,
          e.subject_id || null,
          e.type || 'choice',
          e.question,
          JSON.stringify(e.options || []),
          e.answer,
          e.explanation || '',
          e.difficulty || 1
        );
      }
    });
    
    insertMany(exercises);
    res.json({ message: `成功添加 ${exercises.length} 道习题` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除习题
app.delete('/api/exercises/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);
    res.json({ message: '习题删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 提交答案
app.post('/api/exercises/:id/answer', (req, res) => {
  try {
    const { user_answer } = req.body;
    const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ error: '习题不存在' });
    }
    
    const is_correct = user_answer === exercise.answer ? 1 : 0;
    
    db.prepare(`
      INSERT INTO exercise_records (exercise_id, user_answer, is_correct)
      VALUES (?, ?, ?)
    `).run(req.params.id, user_answer, is_correct);
    
    res.json({
      is_correct: !!is_correct,
      correct_answer: exercise.answer,
      explanation: exercise.explanation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取习题统计
app.get('/api/exercises/stats', (req, res) => {
  try {
    const { video_id, chapter_id, subject_id } = req.query;
    
    let whereClause = '1=1';
    const params = [];
    
    if (video_id) {
      whereClause += ' AND e.video_id = ?';
      params.push(video_id);
    }
    if (chapter_id) {
      whereClause += ' AND e.chapter_id = ?';
      params.push(chapter_id);
    }
    if (subject_id) {
      whereClause += ' AND e.subject_id = ?';
      params.push(subject_id);
    }
    
    const stats = db.prepare(`
      SELECT 
        COUNT(DISTINCT e.id) as total_exercises,
        COUNT(DISTINCT CASE WHEN r.is_correct = 1 THEN e.id END) as correct_count,
        COUNT(DISTINCT CASE WHEN r.id IS NOT NULL THEN e.id END) as attempted_count
      FROM exercises e
      LEFT JOIN exercise_records r ON e.id = r.exercise_id
      WHERE ${whereClause}
    `).get(...params);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 知识点API ==========

// 获取知识点列表
app.get('/api/knowledge', (req, res) => {
  try {
    const { video_id, chapter_id, subject_id } = req.query;
    let sql = 'SELECT * FROM knowledge_points WHERE 1=1';
    const params = [];
    
    if (video_id) {
      sql += ' AND video_id = ?';
      params.push(video_id);
    }
    if (chapter_id) {
      sql += ' AND chapter_id = ?';
      params.push(chapter_id);
    }
    if (subject_id) {
      sql += ' AND subject_id = ?';
      params.push(subject_id);
    }
    
    sql += ' ORDER BY sort_order, created_at';
    const points = db.prepare(sql).all(...params);
    res.json(points);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加知识点
app.post('/api/knowledge', (req, res) => {
  try {
    const { video_id, chapter_id, subject_id, title, content, importance, sort_order } = req.body;
    
    const result = db.prepare(`
      INSERT INTO knowledge_points (video_id, chapter_id, subject_id, title, content, importance, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      video_id || null,
      chapter_id || null,
      subject_id || null,
      title,
      content,
      importance || 1,
      sort_order || 0
    );
    
    res.json({ id: result.lastInsertRowid, message: '知识点添加成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量添加知识点
app.post('/api/knowledge/batch', (req, res) => {
  try {
    const { points } = req.body;
    const insertStmt = db.prepare(`
      INSERT INTO knowledge_points (video_id, chapter_id, subject_id, title, content, importance, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((items) => {
      for (const p of items) {
        insertStmt.run(
          p.video_id || null,
          p.chapter_id || null,
          p.subject_id || null,
          p.title,
          p.content,
          p.importance || 1,
          p.sort_order || 0
        );
      }
    });
    
    insertMany(points);
    res.json({ message: `成功添加 ${points.length} 个知识点` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除知识点
app.delete('/api/knowledge/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM knowledge_points WHERE id = ?').run(req.params.id);
    res.json({ message: '知识点删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根路由 - 显示API状态
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '408学习指南后台API',
    endpoints: {
      'GET /api/data': '获取所有数据',
      'POST /api/chapters': '添加章节',
      'DELETE /api/chapters/:id': '删除章节',
      'POST /api/videos': '添加视频',
      'DELETE /api/videos/:id': '删除视频',
      'PATCH /api/videos/:id/progress': '更新进度',
      'POST /api/ai/chat': 'AI聊天',
      'GET /api/ai/models': '获取AI模型列表',
      'POST /api/pdf/parse': 'PDF上传解析',
      'POST /api/pdf/parse-local': 'PDF本地路径解析',
      'GET /api/notes': '获取笔记列表',
      'POST /api/notes': '添加笔记',
      'PUT /api/notes/:id': '更新笔记',
      'DELETE /api/notes/:id': '删除笔记',
      'GET /api/exercises': '获取习题列表',
      'POST /api/exercises': '添加习题',
      'POST /api/exercises/batch': '批量添加习题',
      'DELETE /api/exercises/:id': '删除习题',
      'POST /api/exercises/:id/answer': '提交答案',
      'GET /api/exercises/stats': '获取习题统计'
    }
  });
});

// ========== 视频转文字 API ==========

// 视频转文字 API
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// ffmpeg 路径
const ffmpegPath = 'C:\\Users\\LENOVO\\Desktop\\功能\\stt\\ffmpeg.exe';
// 本地 STT 服务地址
const LOCAL_STT_URL = 'http://127.0.0.1:9977/api';

app.post('/api/transcribe-video', async (req, res) => {
  const { videoUrl, title } = req.body;
  
  if (!videoUrl) {
    return res.status(400).json({ error: '缺少视频URL' });
  }
  
  try {
    if (videoUrl.includes('/videos/')) {
      // 本地视频，提取文件路径
      const videoFileName = decodeURIComponent(videoUrl.split('/videos/').pop());
      const videoPath = path.join(videosDir, videoFileName);
      
      if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ error: '视频文件不存在: ' + videoFileName });
      }
      
      console.log('Processing video:', videoPath);
      
      // 尝试使用本地 STT 服务 (jianchang512/stt)
      // STT 服务使用两步流程：1. 上传文件 2. 处理文件
      try {
        console.log('Trying local STT service...');
        const FormData = require('form-data');
        
        // 第一步：上传文件到 /upload
        const uploadFormData = new FormData();
        uploadFormData.append('audio', fs.createReadStream(videoPath));
        
        const uploadResponse = await fetch('http://127.0.0.1:9977/upload', {
          method: 'POST',
          body: uploadFormData,
          headers: uploadFormData.getHeaders()
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('Upload result:', uploadResult);
        
        if (uploadResult.code !== 0 || !uploadResult.data) {
          throw new Error(uploadResult.msg || 'Upload failed');
        }
        
        const wavName = uploadResult.data;
        
        // 第二步：处理文件 /process
        const processFormData = new FormData();
        processFormData.append('wav_name', wavName);
        processFormData.append('language', 'zh');
        processFormData.append('model', 'tiny');
        processFormData.append('data_type', 'text');
        
        const processResponse = await fetch('http://127.0.0.1:9977/process', {
          method: 'POST',
          body: processFormData,
          headers: processFormData.getHeaders()
        });
        
        if (!processResponse.ok) {
          throw new Error('Process failed');
        }
        
        const processResult = await processResponse.json();
        console.log('Process result:', processResult);
        
        if (processResult.code !== 0) {
          throw new Error(processResult.msg || 'Process failed');
        }
        
        // 轮询进度直到完成
        let progress = 0;
        let result = null;
        const maxAttempts = 120; // 最多等待 2 分钟
        let attempts = 0;
        
        while (progress < 1 && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const progressFormData = new FormData();
          progressFormData.append('wav_name', wavName);
          progressFormData.append('language', 'zh');
          progressFormData.append('model', 'tiny');
          progressFormData.append('data_type', 'text');
          
          const progressResponse = await fetch('http://127.0.0.1:9977/progressbar', {
            method: 'POST',
            body: progressFormData,
            headers: progressFormData.getHeaders()
          });
          
          const progressData = await progressResponse.json();
          console.log('Progress:', progressData);
          
          if (progressData.code === 0) {
            progress = progressData.data || 0;
            if (progressData.result) {
              result = progressData.result;
            }
          } else {
            throw new Error(progressData.msg || 'Progress check failed');
          }
          
          attempts++;
        }
        
        if (result) {
          // 清理文本格式
          let cleanText = result;
          if (typeof cleanText === 'object') {
            cleanText = JSON.stringify(cleanText);
          }
          
          // 移除多余换行，合并成连续文本
          cleanText = cleanText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('');
          
          console.log('STT result:', cleanText.substring(0, 200));
          res.json({ 
            text: cleanText || '转写完成',
            title: title || videoFileName
          });
          return;
        }
        
        throw new Error('Transcription timeout');
      } catch (sttError) {
        console.log('Local STT error:', sttError.message);
        console.log('Local STT failed, falling back to SiliconFlow...');
      }
      
      // 回退到 SiliconFlow API
      // 检查 ffmpeg 是否存在
      if (!fs.existsSync(ffmpegPath)) {
        return res.status(500).json({ error: '请先启动本地 STT 服务 (运行 stt/start.py)' });
      }
      
      // 使用 ffmpeg 提取音频为 mp3
      const audioDir = path.join(__dirname, '..', 'public', 'audios');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      const audioFileName = `${Date.now()}_audio.mp3`;
      const audioPath = path.join(audioDir, audioFileName);
      
      console.log('Extracting audio from video...');
      await execPromise(`"${ffmpegPath}" -i "${videoPath}" -vn -acodec libmp3lame -q:a 4 -y "${audioPath}"`);
      console.log('Audio extracted:', audioPath);
      
      // 检查音频文件是否生成
      if (!fs.existsSync(audioPath)) {
        return res.status(500).json({ error: '音频提取失败' });
      }
      
      // 使用 SiliconFlow API 进行语音识别
      const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || 'sk-huftmwgtvnruhxwveonhoqukwtnsstlzezlwbflmldeqjruj';
      
      // 读取音频文件
      const audioBuffer = fs.readFileSync(audioPath);
      
      // 调用 SiliconFlow 语音识别 API
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer]), audioFileName);
      formData.append('model', 'FunAudioLLM/SenseVoiceSmall');
      
      console.log('Calling SiliconFlow API...');
      const response = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
        },
        body: formData
      });
      
      // 删除临时音频文件
      fs.unlinkSync(audioPath);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Transcription success, text:', data.text?.substring(0, 100));
        res.json({ 
          text: data.text || '转写完成，但未识别到文字',
          title: title || videoFileName
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('SiliconFlow API error:', errorData);
        res.status(500).json({ 
          error: '语音识别服务暂时不可用',
          details: errorData.message || '请稍后重试'
        });
      }
    } else {
      res.status(400).json({ error: '暂不支持外部视频URL转写，请先下载视频' });
    }
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: '转写失败', details: error.message });
  }
});

// 音频文件转文字 API
app.post('/api/transcribe', audioUpload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传音频文件' });
  }
  
  try {
    const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || 'sk-huftmwgtvnruhxwveonhoqukwtnsstlzezlwbflmldeqjruj';
    
    // 读取音频文件
    const audioBuffer = fs.readFileSync(req.file.path);
    
    // 调用 SiliconFlow 语音识别 API
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer]), req.file.originalname);
    formData.append('model', 'FunAudioLLM/SenseVoiceSmall');
    
    const response = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
      },
      body: formData
    });
    
    // 删除临时文件
    fs.unlinkSync(req.file.path);
    
    if (response.ok) {
      const data = await response.json();
      res.json({ text: data.text || '转写完成，但未识别到文字' });
    } else {
      const errorData = await response.json().catch(() => ({}));
      res.status(500).json({ error: '语音识别失败', details: errorData.message });
    }
  } catch (error) {
    console.error('Transcription error:', error);
    // 清理临时文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: '转写失败', details: error.message });
  }
});

// ========== 卡密激活系统（增强版）==========

const crypto = require('crypto');
const APP_SECRET = '408StudyGuide2024SecretKey!@#$%';

// 创建卡密表
db.exec(`
  CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'month',
    days INTEGER DEFAULT 30,
    used INTEGER DEFAULT 0,
    used_by TEXT,
    used_at DATETIME,
    machine_id TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS activations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id TEXT UNIQUE NOT NULL,
    license_code TEXT NOT NULL,
    activated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    last_verify DATETIME DEFAULT CURRENT_TIMESTAMP,
    verify_count INTEGER DEFAULT 0,
    ip_address TEXT,
    FOREIGN KEY (license_code) REFERENCES licenses(code)
  );
  
  CREATE TABLE IF NOT EXISTS verify_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id TEXT NOT NULL,
    ip_address TEXT,
    result TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 生成随机卡密
function generateLicenseCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    if (i > 0) code += '-';
    for (let j = 0; j < 4; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return code;
}

// 验证请求签名（防止伪造请求）
function verifySignature(machineId, signature) {
  if (!signature) return true; // 浏览器环境可能没有签名
  const timestamp = Date.now().toString().slice(0, -4);
  const expected = crypto.createHmac('sha256', APP_SECRET)
    .update(machineId + timestamp)
    .digest('hex');
  return signature === expected;
}

// 获取客户端IP
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.ip || 
         'unknown';
}

// API: 生成卡密（管理员用）
app.post('/api/license/generate', (req, res) => {
  const { count = 1, type = 'month', days = 30, adminKey } = req.body;
  
  // 简单的管理员验证
  if (adminKey !== '408admin2024') {
    return res.status(403).json({ error: '无权限' });
  }
  
  const codes = [];
  const stmt = db.prepare('INSERT INTO licenses (code, type, days) VALUES (?, ?, ?)');
  
  for (let i = 0; i < count; i++) {
    let code;
    let attempts = 0;
    while (attempts < 10) {
      code = generateLicenseCode();
      try {
        stmt.run(code, type, days);
        codes.push(code);
        break;
      } catch (e) {
        attempts++;
      }
    }
  }
  
  res.json({ success: true, codes, count: codes.length });
});

// API: 激活卡密
app.post('/api/license/activate', (req, res) => {
  const { code, machineId } = req.body;
  const clientIP = getClientIP(req);
  
  if (!code || !machineId) {
    return res.status(400).json({ error: '请提供卡密和机器码' });
  }
  
  // 检查是否已激活
  const existing = db.prepare('SELECT * FROM activations WHERE machine_id = ?').get(machineId);
  if (existing) {
    const now = new Date();
    const expires = new Date(existing.expires_at);
    if (expires > now) {
      // 更新验证时间
      db.prepare('UPDATE activations SET last_verify = CURRENT_TIMESTAMP, verify_count = verify_count + 1, ip_address = ? WHERE machine_id = ?')
        .run(clientIP, machineId);
      return res.json({ 
        success: true, 
        message: '已激活',
        expiresAt: existing.expires_at,
        daysLeft: Math.ceil((expires - now) / (1000 * 60 * 60 * 24))
      });
    }
  }
  
  // 查找卡密
  const license = db.prepare('SELECT * FROM licenses WHERE code = ?').get(code.toUpperCase());
  
  if (!license) {
    return res.status(400).json({ error: '卡密无效' });
  }
  
  if (license.used) {
    return res.status(400).json({ error: '卡密已被使用' });
  }
  
  // 计算过期时间
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + license.days);
  
  // 更新卡密状态
  db.prepare('UPDATE licenses SET used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP, machine_id = ?, ip_address = ? WHERE code = ?')
    .run(machineId, machineId, clientIP, code.toUpperCase());
  
  // 创建或更新激活记录
  if (existing) {
    db.prepare('UPDATE activations SET license_code = ?, activated_at = CURRENT_TIMESTAMP, expires_at = ?, last_verify = CURRENT_TIMESTAMP, verify_count = 1, ip_address = ? WHERE machine_id = ?')
      .run(code.toUpperCase(), expiresAt.toISOString(), clientIP, machineId);
  } else {
    db.prepare('INSERT INTO activations (machine_id, license_code, expires_at, ip_address) VALUES (?, ?, ?, ?)')
      .run(machineId, code.toUpperCase(), expiresAt.toISOString(), clientIP);
  }
  
  res.json({ 
    success: true, 
    message: '激活成功',
    expiresAt: expiresAt.toISOString(),
    daysLeft: license.days
  });
});

// 服务器签名密钥（与客户端保持一致）- 使用已声明的 APP_SECRET
// const APP_SECRET 已在上方声明

// 生成服务器响应签名
function generateServerSignature(data) {
  return crypto.createHmac('sha256', APP_SECRET)
    .update(JSON.stringify(data))
    .digest('hex');
}

// 验证客户端请求签名
function verifyClientSignature(machineId, timestamp, nonce, signature) {
  const expectedSig = crypto.createHmac('sha256', APP_SECRET)
    .update(machineId + timestamp + nonce)
    .digest('hex');
  return signature === expectedSig;
}

// API: 验证激活状态（增强版 - 带签名验证）
app.post('/api/license/verify', (req, res) => {
  const { machineId, timestamp, nonce, signature } = req.body;
  const clientIP = getClientIP(req);
  
  if (!machineId) {
    return res.status(400).json({ error: '请提供机器码' });
  }
  
  // 验证客户端签名（如果提供）
  if (signature && timestamp && nonce) {
    if (!verifyClientSignature(machineId, timestamp, nonce, signature)) {
      return res.status(403).json({ error: '签名验证失败' });
    }
    
    // 检查时间戳是否在合理范围内（5分钟）
    const requestTime = parseInt(timestamp);
    const now = Date.now();
    if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
      return res.status(403).json({ error: '请求已过期' });
    }
  }
  
  // 记录验证日志
  const logResult = (result) => {
    try {
      db.prepare('INSERT INTO verify_logs (machine_id, ip_address, result) VALUES (?, ?, ?)')
        .run(machineId, clientIP, result);
    } catch (e) {}
  };
  
  const activation = db.prepare('SELECT * FROM activations WHERE machine_id = ?').get(machineId);
  
  if (!activation) {
    logResult('not_found');
    const responseData = { activated: false, expiresAt: null };
    return res.json({ 
      ...responseData,
      message: '未激活',
      serverSignature: generateServerSignature(responseData)
    });
  }
  
  const now = new Date();
  const expires = new Date(activation.expires_at);
  
  if (expires <= now) {
    logResult('expired');
    const responseData = { activated: false, expiresAt: activation.expires_at };
    return res.json({ 
      ...responseData,
      message: '已过期',
      serverSignature: generateServerSignature(responseData)
    });
  }
  
  // 更新验证时间和次数
  db.prepare('UPDATE activations SET last_verify = CURRENT_TIMESTAMP, verify_count = verify_count + 1, ip_address = ? WHERE machine_id = ?')
    .run(clientIP, machineId);
  
  logResult('success');
  
  const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
  const responseData = { activated: true, expiresAt: activation.expires_at };
  
  res.json({ 
    ...responseData,
    daysLeft,
    serverSignature: generateServerSignature(responseData)
  });
});

// API: 获取所有卡密（管理员用）
app.get('/api/license/list', (req, res) => {
  const { adminKey } = req.query;
  
  if (adminKey !== '408admin2024') {
    return res.status(403).json({ error: '无权限' });
  }
  
  const licenses = db.prepare('SELECT * FROM licenses ORDER BY created_at DESC').all();
  res.json(licenses);
});

// API: 获取激活统计（管理员用）
app.get('/api/license/stats', (req, res) => {
  const { adminKey } = req.query;
  
  if (adminKey !== '408admin2024') {
    return res.status(403).json({ error: '无权限' });
  }
  
  const totalLicenses = db.prepare('SELECT COUNT(*) as count FROM licenses').get().count;
  const usedLicenses = db.prepare('SELECT COUNT(*) as count FROM licenses WHERE used = 1').get().count;
  const activeUsers = db.prepare('SELECT COUNT(*) as count FROM activations WHERE expires_at > datetime("now")').get().count;
  const todayVerifies = db.prepare('SELECT COUNT(*) as count FROM verify_logs WHERE date(created_at) = date("now")').get().count;
  
  res.json({
    totalLicenses,
    usedLicenses,
    unusedLicenses: totalLicenses - usedLicenses,
    activeUsers,
    todayVerifies
  });
});

// API: 吊销激活（管理员用）
app.post('/api/license/revoke', (req, res) => {
  const { machineId, adminKey } = req.body;
  
  if (adminKey !== '408admin2024') {
    return res.status(403).json({ error: '无权限' });
  }
  
  if (!machineId) {
    return res.status(400).json({ error: '请提供机器码' });
  }
  
  db.prepare('DELETE FROM activations WHERE machine_id = ?').run(machineId);
  
  res.json({ success: true, message: '已吊销激活' });
});

// ========== 自动视频转写功能 ==========

// 转写服务配置（支持多种后端）
const TRANSCRIBE_CONFIG = {
  // 本地 STT 服务 (stt/start.py)
  localSTT: {
    url: LOCAL_STT_URL,
    enabled: true
  },
  // faster-whisper-server (Docker: docker run -d -p 8000:8000 ghcr.io/etalab-ia/faster-whisper-server)
  fasterWhisper: {
    url: 'http://localhost:8000/v1/audio/transcriptions',
    enabled: true
  },
  // 硅基流动 API（备用）
  siliconFlow: {
    url: 'https://api.siliconflow.cn/v1/audio/transcriptions',
    apiKey: SILICONFLOW_API_KEY,
    enabled: true
  }
};

// 创建转写任务表
db.exec(`
  CREATE TABLE IF NOT EXISTS transcribe_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    result TEXT,
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (video_id) REFERENCES videos(id)
  );
  
  CREATE TABLE IF NOT EXISTS video_transcripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER NOT NULL UNIQUE,
    transcript TEXT,
    duration INTEGER,
    word_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id)
  );
`);

// 转写单个视频
async function transcribeVideo(videoId) {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId);
  if (!video) {
    throw new Error('视频不存在');
  }
  
  // 检查是否已有转写结果
  const existing = db.prepare('SELECT * FROM video_transcripts WHERE video_id = ?').get(videoId);
  if (existing) {
    return { success: true, cached: true, transcript: existing.transcript };
  }
  
  // 获取视频文件路径
  let videoPath;
  if (video.type === 'local' && video.url.startsWith('/videos/')) {
    const videoFileName = decodeURIComponent(video.url.split('/videos/').pop());
    videoPath = path.join(videosDir, videoFileName);
  } else {
    throw new Error('仅支持本地视频转写');
  }
  
  if (!fs.existsSync(videoPath)) {
    throw new Error('视频文件不存在: ' + videoPath);
  }
  
  console.log(`[转写] 开始转写视频: ${video.title} (${videoPath})`);
  
  const FormData = require('form-data');
  let transcript = null;
  
  // 优先尝试本地 STT 服务 (stt/start.py)
  if (TRANSCRIBE_CONFIG.localSTT.enabled) {
    try {
      console.log('[转写] 尝试本地 STT 服务 (9977)...');
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(videoPath));
      formData.append('language', 'zh');
      formData.append('model', 'tiny');
      formData.append('response_format', 'srt'); // 用 srt 格式获取时间戳
      
      // 使用 http 模块代替 fetch
      const http = require('http');
      const url = new URL(TRANSCRIBE_CONFIG.localSTT.url);
      
      transcript = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method: 'POST',
          headers: formData.getHeaders(),
          timeout: 300000 // 5分钟超时
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (json.code === 0 && json.data) {
                // 这个 STT 返回的格式很奇怪，每个字符一行
                // 格式类似: 1\n\n\n0\n0\n:\n0\n0\n:\n0\n0\n,\n...\n好\n,\n下\n...
                let rawSrt = json.data;
                
                // 按4个或更多换行分割成字幕块
                let blocks = rawSrt.split(/\n{3,}/);
                let result = [];
                
                for (let block of blocks) {
                  if (!block.trim()) continue;
                  
                  // 每个块的字符都是单独一行
                  let chars = block.split('\n');
                  let blockText = chars.join('');
                  
                  // 尝试匹配时间戳 00:00:00,000 --> 00:00:04,000
                  let timeMatch = blockText.match(/(\d{2}:\d{2}:\d{2}),\d{3}\s*-->\s*(\d{2}:\d{2}:\d{2}),\d{3}(.+)/);
                  if (timeMatch) {
                    let startTime = timeMatch[1];
                    let text = timeMatch[3].replace(/[,，。！？\s]/g, match => match === ' ' ? '' : match);
                    if (text && text.length > 1) {
                      result.push(`[${startTime}] ${text}`);
                    }
                  }
                }
                
                if (result.length > 0) {
                  resolve(result.join('\n'));
                } else {
                  // 解析失败，返回纯文本（去掉时间戳和数字）
                  let plainText = rawSrt
                    .split('\n')
                    .filter(c => c && !c.match(/^[\d:,\->\s]+$/) && !c.match(/^\d+$/))
                    .join('')
                    .replace(/\s+/g, '');
                  resolve(plainText || null);
                }
              } else {
                resolve(null);
              }
            } catch (e) {
              console.log('[转写] 解析错误:', e.message);
              resolve(null);
            }
          });
        });
        
        req.on('error', (e) => {
          console.log('[转写] 本地 STT 请求错误:', e.message);
          resolve(null);
        });
        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });
        
        formData.pipe(req);
      });
      
      if (transcript) {
        console.log('[转写] 本地 STT 服务成功');
      }
    } catch (e) {
      console.log('[转写] 本地 STT 服务不可用:', e.message);
    }
  }
  
  // 尝试 faster-whisper-server
  if (!transcript && TRANSCRIBE_CONFIG.fasterWhisper.enabled) {
    try {
      console.log('[转写] 尝试 faster-whisper-server...');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(videoPath));
      formData.append('model', 'base');
      formData.append('language', 'zh');
      formData.append('response_format', 'json');
      
      const response = await fetch(TRANSCRIBE_CONFIG.fasterWhisper.url, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        transcript = data.text;
        console.log('[转写] faster-whisper-server 成功');
      }
    } catch (e) {
      console.log('[转写] faster-whisper-server 不可用:', e.message);
    }
  }
  
  // 回退到硅基流动
  if (!transcript && TRANSCRIBE_CONFIG.siliconFlow.enabled) {
    try {
      console.log('[转写] 尝试硅基流动 API...');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(videoPath));
      formData.append('model', 'FunAudioLLM/SenseVoiceSmall');
      
      const response = await fetch(TRANSCRIBE_CONFIG.siliconFlow.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TRANSCRIBE_CONFIG.siliconFlow.apiKey}`,
          ...formData.getHeaders()
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        transcript = data.text;
        console.log('[转写] 硅基流动 API 成功');
      }
    } catch (e) {
      console.log('[转写] 硅基流动 API 失败:', e.message);
    }
  }
  
  if (!transcript) {
    throw new Error('所有转写服务都不可用');
  }
  
  // 保存转写结果
  const cleanTranscript = transcript.trim();
  const wordCount = cleanTranscript.length;
  
  db.prepare(`
    INSERT OR REPLACE INTO video_transcripts (video_id, transcript, word_count, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `).run(videoId, cleanTranscript, wordCount);
  
  // 自动创建笔记
  db.prepare(`
    INSERT INTO notes (video_id, chapter_id, subject_id, content, timestamp)
    VALUES (?, ?, ?, ?, 0)
  `).run(
    videoId,
    video.chapter_id,
    video.chapter_id?.split('-')[0] || null,
    `## 📝 视频转写文本\n\n${transcript}\n\n---\n*自动生成于 ${new Date().toLocaleString()}*`
  );
  
  console.log(`[转写] 完成: ${video.title}, 字数: ${wordCount}`);
  
  return { success: true, transcript, wordCount };
}

// 后台自动转写队列
let isTranscribing = false;
const transcribeQueue = [];

async function processTranscribeQueue() {
  if (isTranscribing || transcribeQueue.length === 0) return;
  
  isTranscribing = true;
  const videoId = transcribeQueue.shift();
  
  try {
    // 更新任务状态
    db.prepare('UPDATE transcribe_tasks SET status = ?, progress = 50 WHERE video_id = ? AND status = ?')
      .run('processing', videoId, 'pending');
    
    const result = await transcribeVideo(videoId);
    
    db.prepare('UPDATE transcribe_tasks SET status = ?, progress = 100, result = ?, completed_at = CURRENT_TIMESTAMP WHERE video_id = ?')
      .run('completed', JSON.stringify(result), videoId);
  } catch (error) {
    console.error('[转写] 错误:', error.message);
    db.prepare('UPDATE transcribe_tasks SET status = ?, error = ?, completed_at = CURRENT_TIMESTAMP WHERE video_id = ?')
      .run('failed', error.message, videoId);
  }
  
  isTranscribing = false;
  
  // 继续处理队列
  if (transcribeQueue.length > 0) {
    setTimeout(processTranscribeQueue, 1000);
  }
}

// API: 添加视频到转写队列
app.post('/api/transcribe/add', (req, res) => {
  const { videoId } = req.body;
  
  if (!videoId) {
    return res.status(400).json({ error: '请提供视频ID' });
  }
  
  // 检查是否已有任务
  const existing = db.prepare('SELECT * FROM transcribe_tasks WHERE video_id = ? AND status IN (?, ?)').get(videoId, 'pending', 'processing');
  if (existing) {
    return res.json({ success: true, message: '任务已在队列中', taskId: existing.id });
  }
  
  // 创建任务
  const result = db.prepare('INSERT INTO transcribe_tasks (video_id, status) VALUES (?, ?)').run(videoId, 'pending');
  transcribeQueue.push(videoId);
  
  // 启动处理
  setTimeout(processTranscribeQueue, 100);
  
  res.json({ success: true, taskId: result.lastInsertRowid, message: '已添加到转写队列' });
});

// API: 批量添加视频到转写队列
app.post('/api/transcribe/batch', (req, res) => {
  const { videoIds, chapterId, subjectId, all } = req.body;
  
  let videos = [];
  
  if (all) {
    // 获取所有本地视频
    videos = db.prepare("SELECT id FROM videos WHERE type = 'local' AND url LIKE '/videos/%'").all();
  } else if (subjectId) {
    videos = db.prepare(`
      SELECT v.id FROM videos v
      JOIN chapters c ON v.chapter_id = c.id
      WHERE c.subject_id = ? AND v.type = 'local' AND v.url LIKE '/videos/%'
    `).all(subjectId);
  } else if (chapterId) {
    videos = db.prepare("SELECT id FROM videos WHERE chapter_id = ? AND type = 'local' AND url LIKE '/videos/%'").all(chapterId);
  } else if (videoIds && Array.isArray(videoIds)) {
    videos = videoIds.map(id => ({ id }));
  }
  
  // 过滤已有转写的视频
  const existingTranscripts = db.prepare('SELECT video_id FROM video_transcripts').all().map(r => r.video_id);
  const pendingTasks = db.prepare("SELECT video_id FROM transcribe_tasks WHERE status IN ('pending', 'processing')").all().map(r => r.video_id);
  
  let addedCount = 0;
  for (const video of videos) {
    if (existingTranscripts.includes(video.id) || pendingTasks.includes(video.id)) {
      continue;
    }
    
    db.prepare('INSERT INTO transcribe_tasks (video_id, status) VALUES (?, ?)').run(video.id, 'pending');
    transcribeQueue.push(video.id);
    addedCount++;
  }
  
  // 启动处理
  if (addedCount > 0) {
    setTimeout(processTranscribeQueue, 100);
  }
  
  res.json({ 
    success: true, 
    added: addedCount, 
    skipped: videos.length - addedCount,
    message: `已添加 ${addedCount} 个视频到转写队列`
  });
});

// API: 获取转写任务状态
app.get('/api/transcribe/status', (req, res) => {
  const { videoId } = req.query;
  
  if (videoId) {
    const task = db.prepare('SELECT * FROM transcribe_tasks WHERE video_id = ? ORDER BY created_at DESC LIMIT 1').get(videoId);
    const transcript = db.prepare('SELECT * FROM video_transcripts WHERE video_id = ?').get(videoId);
    return res.json({ task, transcript });
  }
  
  // 返回所有任务统计
  const pending = db.prepare("SELECT COUNT(*) as count FROM transcribe_tasks WHERE status = 'pending'").get().count;
  const processing = db.prepare("SELECT COUNT(*) as count FROM transcribe_tasks WHERE status = 'processing'").get().count;
  const completed = db.prepare("SELECT COUNT(*) as count FROM transcribe_tasks WHERE status = 'completed'").get().count;
  const failed = db.prepare("SELECT COUNT(*) as count FROM transcribe_tasks WHERE status = 'failed'").get().count;
  const totalTranscripts = db.prepare('SELECT COUNT(*) as count FROM video_transcripts').get().count;
  
  const recentTasks = db.prepare(`
    SELECT t.*, v.title as video_title 
    FROM transcribe_tasks t
    JOIN videos v ON t.video_id = v.id
    ORDER BY t.created_at DESC LIMIT 20
  `).all();
  
  res.json({
    queue: { pending, processing, completed, failed },
    totalTranscripts,
    recentTasks,
    isProcessing: isTranscribing
  });
});

// API: 获取视频转写文本
app.get('/api/transcribe/:videoId', (req, res) => {
  const { videoId } = req.params;
  const transcript = db.prepare('SELECT * FROM video_transcripts WHERE video_id = ?').get(videoId);
  
  if (!transcript) {
    return res.status(404).json({ error: '暂无转写文本' });
  }
  
  res.json(transcript);
});

// API: 删除转写文本
app.delete('/api/transcribe/:videoId', (req, res) => {
  const { videoId } = req.params;
  db.prepare('DELETE FROM video_transcripts WHERE video_id = ?').run(videoId);
  db.prepare('DELETE FROM transcribe_tasks WHERE video_id = ?').run(videoId);
  res.json({ success: true });
});

// API: 重试失败的任务
app.post('/api/transcribe/retry', (req, res) => {
  const { videoId, all } = req.body;
  
  if (all) {
    const failed = db.prepare("SELECT video_id FROM transcribe_tasks WHERE status = 'failed'").all();
    db.prepare("UPDATE transcribe_tasks SET status = 'pending', error = NULL WHERE status = 'failed'").run();
    failed.forEach(t => transcribeQueue.push(t.video_id));
    setTimeout(processTranscribeQueue, 100);
    return res.json({ success: true, retried: failed.length });
  }
  
  if (videoId) {
    db.prepare("UPDATE transcribe_tasks SET status = 'pending', error = NULL WHERE video_id = ?").run(videoId);
    transcribeQueue.push(parseInt(videoId));
    setTimeout(processTranscribeQueue, 100);
    return res.json({ success: true });
  }
  
  res.status(400).json({ error: '请提供 videoId 或 all=true' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Database: ${dbPath}`);
  console.log(`视频转写服务已启用`);
});
