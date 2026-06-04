// simple-test.js
Page({
  data: {
    message: '简单测试页面',
    testText: '这是一个简单的测试页面，不使用navigation-bar组件'
  },
  onLoad() {
    console.log('简单测试页面加载');
  },
  testFunction() {
    wx.showToast({
      title: '测试功能正常',
      icon: 'success'
    });
  }
});
