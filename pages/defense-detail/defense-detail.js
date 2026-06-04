Page({
  data: { record: null },
  onLoad() {
    const record = wx.getStorageSync('_viewDefenseRecord');
    if (record) {
      this.setData({ record });
    }
  }
});
