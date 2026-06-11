// index.js
Page({
  data: {
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

  // 打开外部链接
  openUrl(url) {
    wx.navigateTo({
      url: '/pages/webview/webview?url=' + encodeURIComponent(url)
    });
  },

  // ── 核心功能 ──
  navigateToCareer() {
    wx.navigateTo({ url: '/pages/career/career' });
  },
  navigateToGenerate() {
    wx.navigateTo({ url: '/pages/page1/page1' });
  },
  navigateToEvaluate() {
    wx.navigateTo({ url: '/pages/page2/page2' });
  },
  navigateToDefense() {
    wx.navigateTo({ url: '/pages/defense/defense' });
  },
  navigateToHistory() {
    wx.navigateTo({ url: '/pages/page4/page4' });
  },
  navigateToProfile() {
    wx.navigateTo({ url: '/pages/page3/page3' });
  },

  // ── 实用工具（本地AI页面）──
  navigateToTemplate() {
    wx.navigateTo({ url: '/pages/page5/page5' });
  },
  navigateToInterviewQA() {
    wx.navigateTo({ url: '/pages/page6/page6' });
  },
  navigateToSalary() {
    wx.navigateTo({ url: '/pages/page7/page7' });
  },
  navigateToSkillTest() {
    wx.navigateTo({ url: '/pages/page8/page8' });
  },

  // ── 求职资讯（本地AI页面）──
  openJobTips() {
    wx.navigateTo({ url: '/pages/page9/page9' });
  },
  openIndustry() {
    wx.navigateTo({ url: '/pages/page10/page10' });
  },
  openCareerWiki() {
    wx.navigateTo({ url: '/pages/page11/page11' });
  },
  openTopCompanies() {
    wx.navigateTo({ url: '/pages/page12/page12' });
  }
})
