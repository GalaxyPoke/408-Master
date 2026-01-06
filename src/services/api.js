const API_BASE = 'http://localhost:3001/api';

export const api = {
  // 获取所有数据
  async getData() {
    const res = await fetch(`${API_BASE}/data`);
    return res.json();
  },

  // 添加章节
  async addChapter(id, subjectId, name) {
    const res = await fetch(`${API_BASE}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, subject_id: subjectId, name })
    });
    return res.json();
  },

  // 删除章节
  async deleteChapter(id) {
    const res = await fetch(`${API_BASE}/chapters/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // 添加视频
  async addVideo(chapterId, title, type, url, description) {
    const res = await fetch(`${API_BASE}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapter_id: chapterId, title, type, url, description })
    });
    return res.json();
  },

  // 删除视频
  async deleteVideo(id) {
    const res = await fetch(`${API_BASE}/videos/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // 更新视频进度
  async updateProgress(id, progress) {
    const res = await fetch(`${API_BASE}/videos/${id}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress })
    });
    return res.json();
  }
};
