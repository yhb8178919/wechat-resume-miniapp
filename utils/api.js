const API_BASE_URL = 'http://localhost:8080';
const REQUEST_TIMEOUT = 90000;

/** 通用 GET 请求 */
function get(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE_URL + url,
      method: 'GET',
      timeout: 15000,
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: (err) => reject(err)
    });
  });
}

/** 通用 POST 请求 */
function post(url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE_URL + url,
      method: 'POST',
      timeout: 15000,
      header: { 'Content-Type': 'application/json' },
      data: data,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: (err) => reject(err)
    });
  });
}

/** 通用 PUT 请求 */
function put(url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE_URL + url,
      method: 'PUT',
      timeout: 15000,
      header: { 'Content-Type': 'application/json' },
      data: data,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: (err) => reject(err)
    });
  });
}

function callAIService(prompt, onSuccess, onFail) {
  wx.showLoading({
    title: 'AI处理中...',
    mask: true
  });

  wx.request({
    url: `${API_BASE_URL}/api/ai/chat`,
    method: 'POST',
    timeout: REQUEST_TIMEOUT,
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      prompt: prompt
    },
    success: (res) => {
      wx.hideLoading();
      if (res.statusCode === 200 && res.data.code === 200) {
        onSuccess(res.data.data);
      } else if (res.statusCode === 429) {
        wx.showToast({
          title: '请求过于频繁，请稍后再试',
          icon: 'none',
          duration: 3000
        });
        if (onFail) onFail('频率超限');
      } else {
        const errorMsg = res.data.message || '请求失败，请重试';
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        });
        if (onFail) onFail(errorMsg);
      }
    },
    fail: (err) => {
      wx.hideLoading();
      wx.showToast({
        title: '网络错误，请检查连接',
        icon: 'none'
      });
      console.error('请求失败:', err);
      if (onFail) onFail(err);
    }
  });
}

module.exports = {
  get,
  post,
  put,
  callAIService
};
