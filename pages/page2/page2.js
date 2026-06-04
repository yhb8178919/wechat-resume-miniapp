// page2.js
const api = require('../../utils/api');

Page({
  data: {
    uploadedFile: '',
    uploadedContent: '',
    fileSize: '',
    evaluateRequirements: '',
    evaluating: false,
    evaluationDimensions: [
      { name: '简历结构和格式', checked: true },
      { name: '个人信息完整性', checked: true },
      { name: '工作经历描述', checked: true },
      { name: '专业技能展示', checked: true },
      { name: '语言表达和规范性', checked: true },
      { name: '整体竞争力', checked: true }
    ]
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
  uploadPaper() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['txt', 'doc', 'docx'],
      success: (res) => {
        const file = res.tempFiles[0];
        const fileName = file.name;
        const fileSize = this.formatFileSize(file.size);
        const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        
        // 检查文件类型
        if (fileExt === '.txt') {
          this.setData({
            uploadedFile: fileName,
            fileSize: fileSize
          });
          
          wx.getFileSystemManager().readFile({
            filePath: file.path,
            encoding: 'utf-8',
            success: (res) => {
              this.setData({
                uploadedContent: res.data
              });
              wx.showToast({
                title: '上传成功',
                icon: 'success'
              });
            },
            fail: (err) => {
              console.error('文件读取失败:', err);
              wx.showToast({
                title: '文件读取失败: ' + (err.errMsg || '未知错误'),
                icon: 'none'
              });
            }
          });
        } else {
          // 对于非文本文件，给出提示
          this.setData({
            uploadedFile: fileName,
            fileSize: fileSize
          });
          wx.showToast({
            title: '仅支持纯文本文件(.txt)，其他格式可能无法正确识别',
            icon: 'none',
            duration: 3000
          });
        }
      },
      fail: (err) => {
        console.error('选择文档失败:', err);
        wx.showToast({
          title: '选择文档失败: ' + (err.errMsg || '未知错误'),
          icon: 'none'
        });
      }
    });
  },
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },
  bindEvaluateInput(e) {
    this.setData({
      evaluateRequirements: e.detail.value
    });
  },
  toggleDimension(e) {
    const index = e.currentTarget.dataset.index;
    const evaluationDimensions = this.data.evaluationDimensions;
    evaluationDimensions[index].checked = !evaluationDimensions[index].checked;
    
    this.setData({
      evaluationDimensions: evaluationDimensions
    });
  },
  evaluatePaper() {
    const { uploadedContent, evaluateRequirements, evaluationDimensions, uploadedFile } = this.data;
    
    if (!uploadedContent) {
      wx.showToast({
        title: '请先上传简历',
        icon: 'none'
      });
      return;
    }
    
    const checkedDimensions = evaluationDimensions.filter(item => item.checked).map(item => item.name);
    
    if (checkedDimensions.length === 0) {
      wx.showToast({
        title: '请至少选择一个评估维度',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      evaluating: true
    });
    
    const dimensionsText = checkedDimensions.join('、');
    const prompt = `请对以下简历进行评估和修改建议。评估要求：${evaluateRequirements || '全面评估简历'}。重点评估以下维度：${dimensionsText}。\n\n简历内容：\n${uploadedContent}\n\n请从选定的维度进行详细评估，并给出具体的修改建议。评估结果应该包括：\n1. 各维度的评分（满分100分，精确到小数点后1位）\n2. 各维度的详细分析\n3. 具体的改进建议\n4. 总体评价和总体评分（满分100分，精确到小数点后1位）\n5. 简历竞争力等级（优秀、良好、一般、需改进）\n\n请使用以下格式输出评估结果：\n【总体评价】\n总体评分：[分数]\n竞争力等级：[等级]\n[总体评价内容]\n\n【各维度评估】\n维度1：[维度名称]\n评分：[分数]\n分析：[分析内容]\n建议：[建议内容]\n\n维度2：[维度名称]\n评分：[分数]\n分析：[分析内容]\n建议：[建议内容]\n\n...\n\n【改进建议汇总】\n[改进建议内容]`;
    
    api.callAIService(prompt, (response) => {
      this.setData({
        evaluating: false
      });
      
      // 保存到历史记录
      this.saveEvaluationHistory(uploadedFile, response);
      
      // 使用本地存储传递数据，避免URL编码问题
      wx.setStorageSync('tempResult', {
        content: response,
        type: '简历评估',
        topic: uploadedFile,
        fileName: uploadedFile,
        time: new Date().toLocaleString()
      });
      
      // 跳转到结果展示页面
      wx.navigateTo({
        url: '/pages/result/result'
      });
    }, (error) => {
      this.setData({
        evaluating: false
      });
    });
  },
  saveEvaluationHistory(fileName, content) {
    const history = wx.getStorageSync('evaluationHistory') || [];
    const record = {
      fileName: fileName,
      content: content,
      time: new Date().toLocaleString()
    };
    history.push(record);
    wx.setStorageSync('evaluationHistory', history);
  },

})