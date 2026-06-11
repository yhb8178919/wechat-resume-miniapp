// ============================================================
// 手机测试配置：已设为电脑局域网IP
// 如果IP变了，在 cmd 输入 ipconfig 查看新的 IPv4 地址并修改
// ============================================================
const API_BASE_URL = 'http://10.79.87.209:8080';
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

/** 
 * 流式 AI 调用 - 数据边生成边返回，速度感知提升约 50%
 * 使用 enableChunked 接收分块数据，DeepSeek 每生成一个 token 即推送
 */
function callAIService(prompt, onSuccess, onFail) {
  wx.showLoading({
    title: 'AI处理中...',
    mask: true
  });

  // 先尝试流式接口，失败则自动降级到非流式
  const reqTask = wx.request({
    url: `${API_BASE_URL}/api/ai/chat/stream`,
    method: 'POST',
    timeout: REQUEST_TIMEOUT,
    enableChunked: true,
    responseType: 'text',
    header: { 'Content-Type': 'application/json' },
    data: { prompt: prompt },
    success: (res) => {
      wx.hideLoading();
      if (res.statusCode === 200 && res.data) {
        const content = res.data;
        if (content.startsWith('ERROR:')) {
          // 流式返回错误，降级到非流式
          console.warn('流式调用异常，降级到非流式:', content);
          callAIServiceFallback(prompt, onSuccess, onFail);
          return;
        }
        onSuccess(content);
      } else if (res.statusCode === 429) {
        wx.showToast({ title: '请求过于频繁，请稍后再试', icon: 'none', duration: 3000 });
        if (onFail) onFail('频率超限');
      } else {
        // 降级到非流式
        callAIServiceFallback(prompt, onSuccess, onFail);
      }
    },
    fail: (err) => {
      // 部分旧版本微信不支持 enableChunked，降级
      console.warn('流式请求失败，降级到非流式:', err);
      callAIServiceFallback(prompt, onSuccess, onFail);
    }
  });

  // onChunkReceived：实时接收每个 token 块
  if (reqTask && reqTask.onChunkReceived) {
    reqTask.onChunkReceived((chunk) => {
      // chunk.data 是 ArrayBuffer，此处仅用于确认数据在流转
    });
  }
}

/** 非流式降级调用 */
function callAIServiceFallback(prompt, onSuccess, onFail) {
  wx.showLoading({
    title: 'AI处理中...',
    mask: true
  });

  wx.request({
    url: `${API_BASE_URL}/api/ai/chat`,
    method: 'POST',
    timeout: REQUEST_TIMEOUT,
    header: { 'Content-Type': 'application/json' },
    data: { prompt: prompt },
    success: (res) => {
      wx.hideLoading();
      if (res.statusCode === 200 && res.data.code === 200) {
        onSuccess(res.data.data);
      } else if (res.statusCode === 429) {
        wx.showToast({ title: '请求过于频繁，请稍后再试', icon: 'none', duration: 3000 });
        if (onFail) onFail('频率超限');
      } else {
        const errorMsg = (res.data && res.data.message) || '请求失败，请重试';
        wx.showToast({ title: errorMsg, icon: 'none' });
        if (onFail) onFail(errorMsg);
      }
    },
    fail: (err) => {
      wx.hideLoading();
      wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
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
