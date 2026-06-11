// page4.js
Page({
  data: {
    currentTab: 0,
    generationHistory: [],
    evaluationHistory: [],
    careerHistory: [],
    defenseHistory: [],
    toolHistory: []
  },

  onShow() {
    this.loadAllHistory();
  },

  loadAllHistory() {
    const gen = wx.getStorageSync('generationHistory') || [];
    gen.sort((a, b) => new Date(b.time) - new Date(a.time));
    const genProcessed = gen.map(item => ({
      ...item,
      preview: (item.content || '').substring(0, 80) + '...'
    }));

    const eva = wx.getStorageSync('evaluationHistory') || [];
    eva.sort((a, b) => new Date(b.time) - new Date(a.time));
    const evaProcessed = eva.map(item => ({
      ...item,
      preview: (item.content || '').substring(0, 80) + '...'
    }));

    const career = wx.getStorageSync('careerHistory') || [];
    career.sort((a, b) => new Date(b.time) - new Date(a.time));

    const defense = wx.getStorageSync('defenseHistory') || [];
    defense.sort((a, b) => new Date(b.time) - new Date(a.time));

    const tool = wx.getStorageSync('toolHistory') || [];
    tool.sort((a, b) => new Date(b.time) - new Date(a.time));
    const sourceColors = {
      '简历模板': {bg:'#E3F2FD',c:'#2196F3'},
      '面试题库': {bg:'#E8F5E9',c:'#4CAF50'},
      '薪资查询': {bg:'#FFF3E0',c:'#FF9800'},
      '技能测评': {bg:'#F3E5F5',c:'#9C27B0'},
      '求职攻略': {bg:'#E3F2FD',c:'#2196F3'},
      '行业分析': {bg:'#E8F5E9',c:'#4CAF50'},
      '职场百科': {bg:'#FFF3E0',c:'#FF9800'},
      '名企直通车': {bg:'#F3E5F5',c:'#9C27B0'}
    };
    const toolProcessed = tool.map(item => ({
      ...item,
      preview: (item.content || '').substring(0, 80) + '...',
      tagBg: (sourceColors[item.source] || {bg:'#EEF1F5',c:'#666'}).bg,
      tagColor: (sourceColors[item.source] || {bg:'#EEF1F5',c:'#666'}).c
    }));

    this.setData({
      generationHistory: genProcessed,
      evaluationHistory: evaProcessed,
      careerHistory: career,
      defenseHistory: defense,
      toolHistory: toolProcessed
    });
  },

  switchTab(e) {
    this.setData({ currentTab: parseInt(e.currentTarget.dataset.index) });
  },

  viewDetail(e) {
    const type = e.currentTarget.dataset.type;
    const index = e.currentTarget.dataset.index;

    if (type === 'generation') {
      const r = this.data.generationHistory[index];
      wx.setStorageSync('_viewHistoryRecord', r);
      wx.navigateTo({ url: '/pages/result/result?historyType=generation&fromHistory=1' });
    } else if (type === 'evaluation') {
      const r = this.data.evaluationHistory[index];
      wx.setStorageSync('_viewHistoryRecord', r);
      wx.navigateTo({ url: '/pages/result/result?historyType=evaluation&fromHistory=1' });
    } else if (type === 'career') {
      const r = this.data.careerHistory[index];
      wx.setStorageSync('_viewCareerRecord', r);
      wx.navigateTo({ url: '/pages/career-detail/career-detail' });
    } else if (type === 'defense') {
      const r = this.data.defenseHistory[index];
      wx.setStorageSync('_viewDefenseRecord', r);
      wx.navigateTo({ url: '/pages/defense-detail/defense-detail' });
    } else if (type === 'tool') {
      const r = this.data.toolHistory[index];
      wx.setStorageSync('_viewHistoryRecord', r);
      wx.navigateTo({ url: '/pages/result/result?historyType=tool&fromHistory=1' });
    }
  },

  deleteRecord(e) {
    const type = e.currentTarget.dataset.type;
    const index = e.currentTarget.dataset.index;

    const storageKeyMap = {
      generation: 'generationHistory',
      evaluation: 'evaluationHistory',
      career: 'careerHistory',
      defense: 'defenseHistory',
      tool: 'toolHistory'
    };
    const dataKeyMap = {
      generation: 'generationHistory',
      evaluation: 'evaluationHistory',
      career: 'careerHistory',
      defense: 'defenseHistory',
      tool: 'toolHistory'
    };

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const storageKey = storageKeyMap[type];
          const list = [...this.data[dataKeyMap[type]]];
          list.splice(index, 1);
          wx.setStorageSync(storageKey, list);
          this.setData({ [dataKeyMap[type]]: list });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});
