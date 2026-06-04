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

  // ── 实用工具（外部链接）──
  navigateToTemplate() {
    this.openUrl('https://wenku.baidu.com');
  },
  navigateToInterviewQA() {
    this.openUrl('https://wenku.baidu.com');
  },
  navigateToSalary() {
    this.openUrl('https://wenku.baidu.com');
  },
  navigateToSkillTest() {
    this.openUrl('https://wenku.baidu.com');
  },

  // ── 求职资讯（外部链接）──
  openJobTips() {
    // 求职攻略 - 知乎求职话题
    this.openUrl('https://www.zhihu.com/topic/19551004');
  },
  openIndustry() {
    // 行业分析 - 36氪
    this.openUrl('https://36kr.com');
  },
  openCareerWiki() {
    // 职场百科 - 脉脉
    this.openUrl('https://maimai.cn');
  },
  openTopCompanies() {
    // 名企直通车 - BOSS直聘
    this.openUrl('https://www.zhipin.com');
  }
})
