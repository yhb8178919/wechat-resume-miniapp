// result.js
Page({
  data: {
    title: 'AI生成结果',
    content: '',
    type: '',
    topic: '',
    fileName: '',
    time: '',
    overallScore: '--',
    scoreLevel: '--',
    scorePercentage: 0
  },
  onLoad(options) {
    console.log('Result page loaded with options:', options);
    
    if (options.historyIndex) {
      // 从历史记录中获取结果
      const historyType = options.historyType || 'generation';
      const history = wx.getStorageSync(historyType + 'History') || [];
      const index = parseInt(options.historyIndex);
      
      if (history[index]) {
        const record = history[index];
        this.setData({
          content: record.content,
          type: record.type || record.fileName || '结果',
          topic: record.topic || '',
          fileName: record.fileName || '',
          time: record.time,
          title: '历史记录'
        });
      }
    } else {
      // 从本地存储中获取临时结果
      const tempResult = wx.getStorageSync('tempResult');
      if (tempResult) {
        this.setData({
          content: tempResult.content,
          type: tempResult.type || '论文',
          topic: tempResult.topic || '',
          fileName: tempResult.fileName || '',
          time: tempResult.time || new Date().toLocaleString()
        });
        // 清除临时数据
        wx.removeStorageSync('tempResult');
      }
    }
    
    // 解析评分信息
    if (this.data.type === '简历评估' || this.data.type === '评估结果') {
      this.parseScoreInfo(this.data.content);
    }
  },
  parseScoreInfo(content) {
    // 解析总体评分
    const scoreMatch = content.match(/总体评分：([\d.]+)/);
    if (scoreMatch && scoreMatch[1]) {
      const score = scoreMatch[1];
      this.setData({
        overallScore: score,
        scorePercentage: (parseFloat(score) / 100) * 100
      });
    }
    
    // 解析竞争力等级
    const levelMatch = content.match(/竞争力等级：([^\n]+)/);
    if (levelMatch && levelMatch[1]) {
      this.setData({
        scoreLevel: levelMatch[1]
      });
    }
  },
  copyContent() {
    const { content } = this.data;
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },
  downloadContent() {
    const { content, type, topic, fileName } = this.data;
    
    if (!content || content.trim() === '') {
      wx.showToast({
        title: '没有可下载的内容',
        icon: 'none'
      });
      return;
    }
    
    const fileNameToUse = fileName || `${topic || 'result'}_${new Date().getTime()}.txt`;
    const filePath = `${wx.env.USER_DATA_PATH}/${fileNameToUse}`;
    
    console.log('准备下载文件:', filePath);
    
    try {
      wx.getFileSystemManager().writeFile({
        filePath: filePath,
        data: content,
        encoding: 'utf-8',
        success: (res) => {
          console.log('文件写入成功:', res);
          
          // 延迟打开文档，确保文件已完全写入
          setTimeout(() => {
            wx.openDocument({
              filePath: filePath,
              success: (res) => {
                console.log('打开文档成功:', res);
                wx.showToast({
                  title: '下载成功',
                  icon: 'success'
                });
              },
              fail: (err) => {
                console.error('打开文档失败:', err);
                wx.showToast({
                  title: '打开文档失败: ' + (err.errMsg || '未知错误'),
                  icon: 'none'
                });
              }
            });
          }, 500);
        },
        fail: (err) => {
          console.error('保存文件失败:', err);
          wx.showToast({
            title: '保存失败: ' + (err.errMsg || '未知错误'),
            icon: 'none'
          });
        }
      });
    } catch (error) {
      console.error('下载过程中发生错误:', error);
      wx.showToast({
        title: '下载失败: ' + error.message,
        icon: 'none'
      });
    }
  },
  goBack() {
    wx.navigateBack();
  }
});
