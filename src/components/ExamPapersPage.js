import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Eye, Download, Plus, X, CheckCircle, ExternalLink, BookOpen } from 'lucide-react';

// 408历年真题在线资源 (2009-2024)
const onlineExamPapers = {
  2024: [
    { id: 'online-2024-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2024%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2024-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2024%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2023: [
    { id: 'online-2023-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2023%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2023-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2023%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2022: [
    { id: 'online-2022-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2022%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2022-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2022%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2021: [
    { id: 'online-2021-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2021%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2021-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2021%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2020: [
    { id: 'online-2020-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2020%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2020-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2020%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2019: [
    { id: 'online-2019-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2019%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2019-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2019%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2018: [
    { id: 'online-2018-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2018%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2018-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2018%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2017: [
    { id: 'online-2017-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2017%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2017-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2017%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2016: [
    { id: 'online-2016-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2016%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2016-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2016%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2015: [
    { id: 'online-2015-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2015%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2015-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2015%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2014: [
    { id: 'online-2014-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2014%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2014-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2014%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2013: [
    { id: 'online-2013-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2013%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2013-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2013%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2012: [
    { id: 'online-2012-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2012%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2012-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2012%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2011: [
    { id: 'online-2011-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2011%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2011-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2011%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2010: [
    { id: 'online-2010-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2010%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2010-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2010%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
  2009: [
    { id: 'online-2009-1', name: '408统考真题', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2009%E5%B9%B4408%E7%9C%9F%E9%A2%98.pdf' },
    { id: 'online-2009-2', name: '408真题答案解析', type: 'online', url: 'https://github.com/CodePanda66/CSPostgraduate-408/blob/master/408Exam/2009%E5%B9%B4408%E7%9C%9F%E9%A2%98%E7%AD%94%E6%A1%88.pdf' },
  ],
};

const ExamPapersPage = () => {
  const [papers, setPapers] = useState(() => {
    const saved = localStorage.getItem('408_examPapers');
    return saved ? JSON.parse(saved) : {
      2025: [],
      2024: [],
      2023: [],
      2022: [],
      2021: [],
      2020: [],
      2019: [],
      2018: [],
      2017: [],
      2016: [],
      2015: [],
      2014: [],
      2013: [],
      2012: [],
      2011: [],
      2010: [],
      2009: [],
    };
  });

  // 合并在线资源和用户上传的资源
  const getMergedPapers = (year) => {
    const uploaded = papers[year] || [];
    const online = onlineExamPapers[year] || [];
    return [...online, ...uploaded];
  };

  const [showUpload, setShowUpload] = useState(false);
  const [uploadYear, setUploadYear] = useState('2024');
  const [uploadName, setUploadName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewingPaper, setViewingPaper] = useState(null);

  const savePapers = (newPapers) => {
    setPapers(newPapers);
    localStorage.setItem('408_examPapers', JSON.stringify(newPapers));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      if (!uploadName) {
        setUploadName(file.name.replace('.pdf', ''));
      }
    } else {
      alert('请选择PDF文件');
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !uploadName) {
      alert('请选择文件并输入名称');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newPaper = {
        id: Date.now(),
        name: uploadName,
        data: e.target.result,
        progress: 0,
        uploadedAt: new Date().toISOString(),
      };

      const newPapers = { ...papers };
      if (!newPapers[uploadYear]) {
        newPapers[uploadYear] = [];
      }
      newPapers[uploadYear].push(newPaper);
      savePapers(newPapers);

      setShowUpload(false);
      setSelectedFile(null);
      setUploadName('');
    };
    reader.readAsDataURL(selectedFile);
  };

  const deletePaper = (year, paperId) => {
    if (!window.confirm('确定要删除这份试卷吗？')) return;
    const newPapers = { ...papers };
    newPapers[year] = newPapers[year].filter(p => p.id !== paperId);
    savePapers(newPapers);
  };

  const updateProgress = (year, paperId, progress) => {
    const newPapers = { ...papers };
    const paper = newPapers[year].find(p => p.id === paperId);
    if (paper) {
      paper.progress = progress;
      savePapers(newPapers);
    }
  };

  const years = Object.keys(papers).sort((a, b) => b - a);

  // 查看PDF
  if (viewingPaper) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
        <div className="bg-white p-4 flex items-center justify-between">
          <h2 className="font-bold text-lg">{viewingPaper.name}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">完成进度:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={viewingPaper.progress}
                onChange={(e) => {
                  updateProgress(viewingPaper.year, viewingPaper.id, parseInt(e.target.value));
                  setViewingPaper({ ...viewingPaper, progress: parseInt(e.target.value) });
                }}
                className="w-32"
              />
              <span className="text-sm font-medium">{viewingPaper.progress}%</span>
            </div>
            <button
              onClick={() => setViewingPaper(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <iframe
          src={viewingPaper.data}
          className="flex-1 w-full"
          title={viewingPaper.name}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">408真题库</h1>
          <p className="text-gray-500">按年份整理的历年真题，支持上传PDF</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg"
        >
          <Upload className="h-5 w-5" />
          上传试卷
        </button>
      </div>

      {/* 按年份显示 */}
      {years.map(year => (
        <div key={year} className="mb-16">
          <h2 className="text-3xl font-black text-gray-800 mb-8 text-center">{year}年</h2>
          
          {(() => {
            const mergedPapers = getMergedPapers(year);
            return mergedPapers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400">暂无{year}年试卷</p>
                <button
                  onClick={() => {
                    setUploadYear(year);
                    setShowUpload(true);
                  }}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  + 上传试卷
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mergedPapers.map(paper => (
                  <div
                    key={paper.id}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden border hover:shadow-xl transition-all group ${
                      paper.type === 'online' ? 'border-blue-200' : 'border-gray-100'
                    }`}
                  >
                    {/* 预览区域 */}
                    <div 
                      className={`h-48 relative cursor-pointer ${
                        paper.type === 'online' 
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-100' 
                          : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}
                      onClick={() => {
                        if (paper.type === 'online') {
                          window.open(paper.url, '_blank');
                        } else {
                          setViewingPaper({ ...paper, year });
                        }
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        {paper.type === 'online' ? (
                          <BookOpen className="h-16 w-16 text-blue-400" />
                        ) : (
                          <FileText className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        {paper.type === 'online' ? (
                          <ExternalLink className="h-8 w-8 text-white" />
                        ) : (
                          <Eye className="h-8 w-8 text-white" />
                        )}
                      </div>
                      {/* 在线标记 */}
                      {paper.type === 'online' && (
                        <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          在线
                        </div>
                      )}
                      {/* 完成标记 */}
                      {paper.progress === 100 && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    {/* 信息区域 */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-800 line-clamp-2">{year}年 {paper.name}</h3>
                        {paper.type !== 'online' && (
                          <button
                            onClick={() => deletePaper(year, paper.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {paper.type === 'online' ? (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <ExternalLink className="h-4 w-4" />
                          <span>点击查看GitHub资源</span>
                        </div>
                      ) : (
                        <>
                          {/* 进度条 */}
                          <div className="mb-2">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  paper.progress === 100 
                                    ? 'bg-green-500' 
                                    : paper.progress > 0 
                                    ? 'bg-indigo-500' 
                                    : 'bg-gray-300'
                                }`}
                                style={{ width: `${paper.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">完成进度</span>
                            <span className={`font-medium ${paper.progress === 100 ? 'text-green-600' : 'text-indigo-600'}`}>
                              {paper.progress}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* 添加按钮 */}
                <button
                  onClick={() => {
                    setUploadYear(year);
                    setShowUpload(true);
                  }}
                  className="h-full min-h-[280px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo-600"
                >
                  <Plus className="h-10 w-10" />
                  <span className="font-medium">添加试卷</span>
                </button>
              </div>
            );
          })()}

          {/* 分隔线 */}
          {year !== years[years.length - 1] && (
            <div className="mt-16 border-b border-gray-200" />
          )}
        </div>
      ))}

      {/* 上传弹窗 */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">上传试卷</h2>
              <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 年份选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
                <select
                  value={uploadYear}
                  onChange={(e) => setUploadYear(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}年</option>
                  ))}
                </select>
              </div>

              {/* 试卷名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">试卷名称</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="如：数据结构、计算机组成原理"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* 文件选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择PDF文件</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2 text-indigo-600">
                        <FileText className="h-6 w-6" />
                        <span className="font-medium">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>点击选择PDF文件</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* 上传按钮 */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !uploadName}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上传
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPapersPage;
