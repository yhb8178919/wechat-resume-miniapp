Page({
  data: {
    url: ''
  },
  onLoad(options) {
    if (options.url) {
      this.setData({ url: decodeURIComponent(options.url) });
    }
  },
  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});
