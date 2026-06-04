// career.js
const api = require('../../utils/api');

Page({
  data: {
    topic: '',
    content: '',
    recommendations: null,
    recommending: false,
    importedFile: ''
  },

  bindTopicInput(e) {
    this.setData({ topic: e.detail.value });
  },

  bindContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  importDocument() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['txt', 'doc', 'docx'],
      success: (res) => {
        const file = res.tempFiles[0];
        const fileName = file.name;
        const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

        if (fileExt === '.txt') {
          this.setData({ importedFile: fileName });
          wx.getFileSystemManager().readFile({
            filePath: file.path,
            encoding: 'utf-8',
            success: (res) => {
              const text = res.data.trim();
              this.setData({ content: text });
              wx.showToast({ title: '导入成功', icon: 'success' });
            },
            fail: () => {
              wx.showToast({ title: '文件读取失败，请手动粘贴内容', icon: 'none' });
            }
          });
        } else {
          wx.showToast({ title: '仅支持 .txt 文件，请转换格式后重试', icon: 'none', duration: 2500 });
        }
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '无法选择文件，请在微信聊天中打开小程序后使用此功能', icon: 'none', duration: 3000 });
        }
      }
    });
  },

  recommendCareer() {
    const { topic, content } = this.data;
    if (!topic.trim() && !content.trim()) {
      wx.showToast({ title: '请输入简历主题或内容', icon: 'none' });
      return;
    }

    this.setData({ recommending: true });

    const prompt = `请根据以下简历信息，推荐3-5个最匹配的职业方向。

简历主题：${topic || '未提供'}
简历内容：${content || '未提供'}

请严格按以下JSON格式输出，不要输出其他内容：
[
  {"job":"职业名称","description":"职业描述（20字内）","reason":"基于简历内容的推荐理由（30字内）"},
  ...
]`;

    api.callAIService(prompt, (response) => {
      this.setData({ recommending: false });
      const recommendations = this.parseRecommendations(response);
      this.setData({ recommendations });

      if (recommendations.length > 0) {
        this.saveRecommendationHistory(topic, content, recommendations);
      }
    }, (error) => {
      this.setData({ recommending: false });
      wx.showToast({ title: '分析失败，请重试', icon: 'none' });
    });
  },

  parseRecommendations(text) {
    const items = [];
    // 优先尝试JSON解析
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const arr = JSON.parse(jsonMatch[0]);
        if (Array.isArray(arr)) {
          return arr.filter(item => item.job).slice(0, 5);
        }
      }
    } catch (e) { /* fallthrough */ }

    // 回退：逐行解析
    const lines = text.split('\n');
    let current = null;

    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;

      // 匹配 "职业1：..." 或 "1. ..." 或 "1、..." 或 "**职业1**：..." 等
      const jobMatch = t.match(/(?:职业\s*\d+|^\d+)[\.\、：:\s]+(.+)/);
      if (jobMatch || t.match(/^\d+[\.\、]/) || t.startsWith('职业')) {
        if (current) items.push(current);

        let jobName = '';
        if (jobMatch) {
          jobName = jobMatch[1].trim();
        } else {
          jobName = t.replace(/^(?:职业\s*\d+\s*[：:]?\s*|\d+[\.\、]\s*)/, '').trim().replace(/^[【\[](.+?)[】\]]/, '$1');
        }

        if (jobName && jobName.length < 50) {
          current = { job: jobName, description: '', reason: '' };
        } else {
          current = null;
        }
        continue;
      }

      if (!current) continue;

      if (t.startsWith('描述') || t.startsWith('简介') || t.startsWith('说明')) {
        current.description = t.replace(/^(?:描述|简介|说明)[：:]\s*/, '').trim();
      } else if (t.startsWith('推荐理由') || t.startsWith('理由') || t.startsWith('原因')) {
        current.reason = t.replace(/^(?:推荐理由|理由|原因)[：:]\s*/, '').trim();
      } else if (t.length > 3 && !t.startsWith('{') && !t.startsWith('[')) {
        // 可能是连在一起的文本，尝试分割
        if (!current.description) {
          current.description = t;
        } else if (!current.reason) {
          current.reason = t;
        }
      }
    }
    if (current) items.push(current);

    return items.slice(0, 5);
  },

  saveRecommendationHistory(topic, content, recommendations) {
    const history = wx.getStorageSync('careerHistory') || [];
    const record = {
      topic: topic,
      content: content,
      recommendations: recommendations,
      time: new Date().toLocaleString()
    };
    history.unshift(record);
    if (history.length > 20) history.splice(20);
    wx.setStorageSync('careerHistory', history);
  },

  copyRecommendations() {
    const { recommendations } = this.data;
    if (!recommendations || !recommendations.length) return;

    let text = '职业推荐结果\n\n';
    recommendations.forEach((item, i) => {
      text += `${i + 1}. ${item.job}\n   描述：${item.description}\n   推荐理由：${item.reason}\n\n`;
    });

    wx.setClipboardData({
      data: text,
      success: () => { wx.showToast({ title: '已复制', icon: 'success' }); }
    });
  },

  downloadRecommendations() {
    const { recommendations, topic } = this.data;
    if (!recommendations || !recommendations.length) {
      wx.showToast({ title: '无内容可下载', icon: 'none' });
      return;
    }

    let text = '职业推荐结果\n\n';
    recommendations.forEach((item, i) => {
      text += `${i + 1}. ${item.job}\n描述：${item.description}\n推荐理由：${item.reason}\n\n`;
    });

    const filePath = wx.env.USER_DATA_PATH + '/career_' + Date.now() + '.txt';
    const fs = wx.getFileSystemManager();
    fs.writeFile({
      filePath: filePath,
      data: text,
      encoding: 'utf8',
      success: () => {
        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => {
          wx.openDocument({
            filePath: filePath,
            fail: (err) => {
              wx.showToast({ title: '打开失败: ' + err.errMsg, icon: 'none' });
            }
          });
        }, 500);
      },
      fail: (err) => {
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    });
  }
});
