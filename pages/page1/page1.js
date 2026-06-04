// page1.js
const api = require('../../utils/api');

Page({
  data: {
    resumeTypes: ['简历', '求职简历', '工作简历', '实习简历', '应届生简历', '其他'],
    selectedType: 0,
    topic: '',
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
    this.setData({
      topic: e.detail.value
    });
  },
  bindTypeChange(e) {
    this.setData({
      selectedType: parseInt(e.detail.value)
    });
  },
  bindWordCountInput(e) {
    this.setData({
      wordCount: e.detail.value
    });
  },
  bindRequirementsInput(e) {
    this.setData({
      requirements: e.detail.value
    });
  },
  generatePaper() {
    const { topic, resumeTypes, selectedType, wordCount, requirements } = this.data;
    
    if (!topic.trim()) {
      wx.showToast({
        title: '请输入个人姓名',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      generating: true
    });
    
    const prompt = `专业简历制作服务：为${topic}生成一份${resumeTypes[selectedType]}。工作经验：${wordCount || '无'}年。个人技能：${requirements || '无'}。请按照标准的简历格式生成，包括个人信息、教育背景、工作经历、专业技能、项目经验等部分。内容要专业、简洁、突出个人优势，符合招聘要求。`;
    
    api.callAIService(prompt, (response) => {
      this.setData({
        generating: false
      });
      
      // 保存到历史记录
      this.saveGenerationHistory(topic, resumeTypes[selectedType], response);
      
      // 使用本地存储传递数据，避免URL编码问题
      wx.setStorageSync('tempResult', {
        content: response,
        type: resumeTypes[selectedType],
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