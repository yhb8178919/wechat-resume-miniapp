// test.js
Page({
  data: {
    message: '测试页面',
    testText: '这是一个测试页面，用于验证小程序基本功能是否正常'
  },
  onLoad() {
    console.log('测试页面加载');
    this.setData({
      message: '测试页面加载成功'
    });
  },
  testFunction() {
    wx.showToast({
      title: '测试功能正常',
      icon: 'success'
    });
  }
});
