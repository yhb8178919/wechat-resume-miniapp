Page({
  data: { record: null },
  onLoad() {
    const record = wx.getStorageSync('_viewCareerRecord');
    if (record) {
      this.setData({ record });
    }
  }
});
