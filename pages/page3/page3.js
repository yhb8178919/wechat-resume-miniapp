// page3.js 个人中心
const api = require('../../utils/api');

Page({
  data: {
    userInfo: { id: '', nickname: '', username: '', avatar: '', phone: '', email: '', createdAt: '' },
    stats: { paperCount: 0, evaluateCount: 0, wordCount: 0 },
    isLoggedIn: false,

    // 登录弹窗
    loginPopupVisible: false,
    loginUsername: '',
    loginPassword: '',

    // 注册弹窗
    registerPopupVisible: false,
    regUsername: '',
    regPassword: '',
    regEmail: '',

    // 编辑资料弹窗
    editPopupVisible: false,
    editNickname: '',
    editPhone: '',
    editEmail: '',
    editSaving: false,

    // 修改密码弹窗
    passwordPopupVisible: false,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  onLoad() {
    this.loadUserInfo();
    this.loadUserStats();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.id) {
      this.setData({ userInfo, isLoggedIn: true });
    }
  },

  loadUserStats() {
    const stats = wx.getStorageSync('userStats') || { paperCount: 0, evaluateCount: 0, wordCount: 0 };
    this.setData({ stats });
  },

  // ══════════════════════════════════════
  // 登录
  // ══════════════════════════════════════
  login() {
    if (this.data.isLoggedIn) return;
    this.setData({ loginPopupVisible: true, loginUsername: '', loginPassword: '' });
  },
  closeLoginPopup() { this.setData({ loginPopupVisible: false }); },
  onUsernameInput(e) { this.setData({ loginUsername: e.detail.value }); },
  onPasswordInput(e) { this.setData({ loginPassword: e.detail.value }); },

  submitLogin() {
    const { loginUsername, loginPassword } = this.data;
    if (!loginUsername || !loginPassword) {
      wx.showToast({ title: '请输入完整信息', icon: 'none' });
      return;
    }
    this.closeLoginPopup();

    wx.showLoading({ title: '登录中...' });
    api.post('/api/auth/login', { username: loginUsername, password: loginPassword })
      .then(res => {
        wx.hideLoading();
        if (res.data && res.data.code === 200 && res.data.data) {
          const user = res.data.data;
          wx.setStorageSync('userInfo', user);
          this.setData({ userInfo: user, isLoggedIn: true });
          wx.showToast({ title: '登录成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.data?.message || '登录失败', icon: 'none' });
        }
      })
      .catch(err => {
        wx.hideLoading();
        if (err.statusCode === 401) {
          wx.showToast({ title: '账号或密码错误', icon: 'none' });
        } else {
          wx.showToast({ title: '网络错误，请检查后端', icon: 'none' });
        }
      });
  },

  // ══════════════════════════════════════
  // 注册
  // ══════════════════════════════════════
  register() {
    this.setData({ registerPopupVisible: true, regUsername: '', regPassword: '', regEmail: '' });
  },
  closeRegisterPopup() { this.setData({ registerPopupVisible: false }); },
  onRegUsernameInput(e) { this.setData({ regUsername: e.detail.value }); },
  onRegPasswordInput(e) { this.setData({ regPassword: e.detail.value }); },
  onRegEmailInput(e) { this.setData({ regEmail: e.detail.value }); },

  submitRegister() {
    const { regUsername, regPassword, regEmail } = this.data;
    if (!regUsername || !regPassword) {
      wx.showToast({ title: '请输入完整信息', icon: 'none' });
      return;
    }
    if (regPassword.length < 6) {
      wx.showToast({ title: '密码长度不少于6位', icon: 'none' });
      return;
    }
    if (!regEmail || !regEmail.includes('@')) {
      wx.showToast({ title: '请输入正确邮箱', icon: 'none' });
      return;
    }
    this.closeRegisterPopup();

    wx.showLoading({ title: '注册中...' });
    api.post('/api/auth/register', { username: regUsername, password: regPassword, email: regEmail, nickname: regUsername })
      .then(res => {
        wx.hideLoading();
        if (res.data && res.data.code === 200) {
          wx.showToast({ title: '注册成功，请登录', icon: 'success' });
        } else {
          wx.showToast({ title: res.data?.message || '注册失败', icon: 'none' });
        }
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '注册失败，请检查网络', icon: 'none' });
      });
  },

  // ══════════════════════════════════════
  // 编辑资料
  // ══════════════════════════════════════
  editProfile() {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    const { userInfo } = this.data;
    this.setData({
      editPopupVisible: true,
      editNickname: userInfo.nickname || '',
      editPhone: userInfo.phone || '',
      editEmail: userInfo.email || ''
    });
  },
  closeEditPopup() { this.setData({ editPopupVisible: false }); },
  onEditNickname(e) { this.setData({ editNickname: e.detail.value }); },
  onEditPhone(e) { this.setData({ editPhone: e.detail.value }); },
  onEditEmail(e) { this.setData({ editEmail: e.detail.value }); },

  submitEdit() {
    const { editNickname, editPhone, editEmail, userInfo } = this.data;
    if (this.data.editSaving) return;
    this.setData({ editSaving: true });

    api.put('/api/profile/' + userInfo.id, {
      nickname: editNickname,
      phone: editPhone,
      email: editEmail
    }).then(res => {
      this.setData({ editSaving: false });
      if (res.data && res.data.code === 200) {
        const updated = res.data.data;
        wx.setStorageSync('userInfo', updated);
        this.setData({ userInfo: updated });
        this.closeEditPopup();
        wx.showToast({ title: '保存成功', icon: 'success' });
      } else {
        wx.showToast({ title: res.data?.message || '保存失败', icon: 'none' });
      }
    }).catch(() => {
      this.setData({ editSaving: false });
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  },

  // ══════════════════════════════════════
  // 修改密码
  // ══════════════════════════════════════
  changePassword() {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    this.setData({ passwordPopupVisible: true, oldPassword: '', newPassword: '', confirmPassword: '' });
  },
  closePasswordPopup() { this.setData({ passwordPopupVisible: false }); },
  onOldPasswordInput(e) { this.setData({ oldPassword: e.detail.value }); },
  onNewPasswordInput(e) { this.setData({ newPassword: e.detail.value }); },
  onConfirmPasswordInput(e) { this.setData({ confirmPassword: e.detail.value }); },

  submitPassword() {
    const { oldPassword, newPassword, confirmPassword, userInfo } = this.data;
    if (!oldPassword || !newPassword || !confirmPassword) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次新密码不一致', icon: 'none' });
      return;
    }
    if (newPassword.length < 6) {
      wx.showToast({ title: '新密码长度不少于6位', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '修改中...' });
    api.put('/api/profile/' + userInfo.id + '/password', { oldPassword, newPassword })
      .then(res => {
        wx.hideLoading();
        if (res.data && res.data.code === 200) {
          this.closePasswordPopup();
          wx.showToast({ title: '密码修改成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.data?.message || '原密码错误', icon: 'none' });
        }
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '修改失败', icon: 'none' });
      });
  },

  // ══════════════════════════════════════
  // 登出
  // ══════════════════════════════════════
  logout() {
    wx.showModal({
      title: '确认退出？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          this.setData({
            isLoggedIn: false,
            userInfo: { id: '', nickname: '未登录', username: '', avatar: '', phone: '', email: '', createdAt: '' }
          });
          wx.showToast({ title: '已退出', icon: 'none' });
        }
      }
    });
  },

  clearCache() {
    wx.showModal({
      title: '确认清空？',
      content: '将清除所有本地缓存数据',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.loadUserInfo();
          this.loadUserStats();
          wx.showToast({ title: '已清空', icon: 'none' });
        }
      }
    });
  }
});
