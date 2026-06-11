// page1.js
const api = require('../../utils/api');

Page({
  data: {
    topic: '',
    major: '',
    wordCount: '',
    requirements: '',
    generating: false
  },
  onLoad() {
  },
  onReady() {
  },
  onShow() {
  },
  onHide() {
  },
  onUnload() {
  },
  onPullDownRefresh() {
  },
  onReachBottom() {
  },
  onShareAppMessage() {
  },
  bindTopicInput(e) {
    const v = e.detail.value.replace(/[<>"']/g, '').substring(0, 20);
    this.setData({ topic: v });
  },
  bindMajorInput(e) {
    const v = e.detail.value.replace(/[<>"']/g, '').substring(0, 30);
    this.setData({ major: v });
  },
  bindWordCountInput(e) {
    let v = e.detail.value.replace(/\D/g, '');
    if (v !== '') {
      const num = parseInt(v, 10);
      if (num > 60) v = '60';
    }
    this.setData({ wordCount: v });
  },
  bindWordCountBlur(e) {
    let v = e.detail.value;
    if (v === '' || v === '0') {
      this.setData({ wordCount: '' });
      return;
    }
    const num = parseInt(v, 10);
    if (isNaN(num) || num < 0) {
      this.setData({ wordCount: '' });
      wx.showToast({ title: '请输入有效的工作年限', icon: 'none' });
    } else if (num > 60) {
      this.setData({ wordCount: '60' });
    }
  },
  bindRequirementsInput(e) {
    const v = e.detail.value.substring(0, 500);
    this.setData({ requirements: v });
  },
  generatePaper() {
    const { topic, major, wordCount, requirements } = this.data;
    
    // 姓名校验
    if (!topic.trim()) {
      wx.showToast({ title: '请输入个人姓名', icon: 'none' });
      return;
    }
    if (topic.trim().length < 2) {
      wx.showToast({ title: '姓名至少2个字符', icon: 'none' });
      return;
    }

    // 工作经验校验
    if (wordCount !== '') {
      const years = parseInt(wordCount, 10);
      if (isNaN(years) || years < 0) {
        wx.showToast({ title: '工作年限不能为负数', icon: 'none' });
        return;
      }
      if (years > 60) {
        wx.showToast({ title: '工作年限不能超过60年', icon: 'none' });
        return;
      }
    }

    // 个人技能校验
    if (requirements.trim() && requirements.trim().length < 2) {
      wx.showToast({ title: '技能描述至少2个字符', icon: 'none' });
      return;
    }
    
    this.setData({
      generating: true
    });
    
    const prompt = `专业简历制作服务：为${topic}生成一份简历。所学专业：${major || '不限'}。工作经验：${wordCount || '无'}年。个人技能：${requirements || '无'}。请按照标准的简历格式生成，包括个人信息、教育背景（结合所学专业）、工作经历、专业技能、项目经验等部分。内容要专业、简洁、突出个人优势，符合招聘要求。`;
    
    api.callAIService(prompt, (response) => {
      this.setData({
        generating: false
      });
      
      // 保存到历史记录
      this.saveGenerationHistory(topic, '简历', response);
      
      // 使用本地存储传递数据，避免URL编码问题
      wx.setStorageSync('tempResult', {
        content: response,
        type: '简历',
        topic: topic,
        time: new Date().toLocaleString()
      });
      
      // 跳转到结果展示页面
      wx.navigateTo({
        url: '/pages/result/result'
      });
    }, (error) => {
      this.setData({
        generating: false
      });
    });
  },
  saveGenerationHistory(topic, type, content) {
    const history = wx.getStorageSync('generationHistory') || [];
    const record = {
      topic: topic,
      type: type,
      content: content,
      time: new Date().toLocaleString()
    };
    history.push(record);
    wx.setStorageSync('generationHistory', history);
  },
  copyPaper() {
    const { generatedPaper } = this.data;
    wx.setClipboardData({
      data: generatedPaper,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },

})