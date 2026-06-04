// page4.js
Page({
  data: {
    currentTab: 0,
    generationHistory: [],
    evaluationHistory: [],
    careerHistory: [],
    defenseHistory: []
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

    this.setData({
      generationHistory: genProcessed,
      evaluationHistory: evaProcessed,
      careerHistory: career,
      defenseHistory: defense
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
      wx.navigateTo({
        url: `/pages/result/result?historyType=generation&content=${encodeURIComponent(r.content)}&type=${encodeURIComponent(r.type)}&topic=${encodeURIComponent(r.topic)}&time=${encodeURIComponent(r.time)}`
      });
    } else if (type === 'evaluation') {
      const r = this.data.evaluationHistory[index];
      wx.navigateTo({
        url: `/pages/result/result?historyType=evaluation&content=${encodeURIComponent(r.content)}&type=论文评估&fileName=${encodeURIComponent(r.fileName)}&time=${encodeURIComponent(r.time)}`
      });
    } else if (type === 'career') {
      const r = this.data.careerHistory[index];
      wx.setStorageSync('_viewCareerRecord', r);
      wx.navigateTo({ url: '/pages/career-detail/career-detail' });
    } else if (type === 'defense') {
      const r = this.data.defenseHistory[index];
      wx.setStorageSync('_viewDefenseRecord', r);
      wx.navigateTo({ url: '/pages/defense-detail/defense-detail' });
    }
  },

  deleteRecord(e) {
    const type = e.currentTarget.dataset.type;
    const index = e.currentTarget.dataset.index;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const keyMap = {
            generation: 'generationHistory',
            evaluation: 'evaluationHistory',
            career: 'careerHistory',
            defense: 'defenseHistory'
          };
          const storageKeyMap = {
            generation: 'generationHistory',
            evaluation: 'evaluationHistory',
            career: 'careerHistory',
            defense: 'defenseHistory'
          };

          const dataKey = keyMap[type];
          const storageKey = storageKeyMap[type];
          const list = [...this.data[dataKey]];
          list.splice(index, 1);
          wx.setStorageSync(storageKey, list);
          this.setData({ [dataKey]: list });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});
