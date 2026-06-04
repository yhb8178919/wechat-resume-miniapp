Page({
  data: {
    paperTitle: '',
    paperContent: '',
    isDefenseStarted: false,
    isDefenseEnded: false,
    currentQuestion: '',
    currentQuestionIndex: 0,
    userAnswer: '',
    currentFeedback: '',
    totalQuestions: 5,
    correctAnswers: 0,
    questions: [],
    answers: [],
    feedbacks: [],
    defenseHistory: [],
    passRate: 0,
    isLastQuestion: false
  },

  onLoad() {
    this.loadDefenseHistory();
  },

  bindTitleInput(e) {
    this.setData({ paperTitle: e.detail.value });
  },

  bindContentInput(e) {
    this.setData({ paperContent: e.detail.value });
  },

  bindAnswerInput(e) {
    this.setData({ userAnswer: e.detail.value });
  },

  navigateBack() {
    wx.navigateBack({ delta: 1 });
  },

  startDefense() {
    if (!this.data.paperTitle || !this.data.paperContent) {
      wx.showToast({ title: '请填写简历信息', icon: 'none' });
      return;
    }
    this.generateQuestions();

    this.setData({
      isDefenseStarted: true,
      isDefenseEnded: false,
      currentQuestionIndex: 0,
      currentQuestion: this.data.questions[0],
      userAnswer: '',
      currentFeedback: '',
      correctAnswers: 0,
      answers: [],
      feedbacks: [],
      isLastQuestion: this.data.questions.length === 1
    });
  },

  generateQuestions() {
    const pool = [
      '请简要介绍一下您自己，包括您的教育背景和工作经历。',
      '您为什么对这份工作感兴趣？请谈谈您的职业规划。',
      '请描述一个您在工作中遇到的挑战，以及您是如何解决的。',
      '请谈谈您最大的优势和需要改进的地方。',
      '您对未来三到五年的职业规划是什么？',
      '请介绍一个您参与过的成功项目，您在其中的角色是什么？',
      '您如何处理工作中的压力和紧迫的截止日期？',
      '您如何看待团队合作？请举例说明一次协作经历。',
      '您为什么离开上一家公司（或准备离开）？',
      '您对我们公司有什么了解？为什么选择我们？'
    ];

    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);

    this.setData({
      questions: selected,
      totalQuestions: selected.length
    });
  },

  submitAnswer() {
    const answer = this.data.userAnswer.trim();
    if (!answer) {
      wx.showToast({ title: '请输入回答', icon: 'none' });
      return;
    }

    const feedback = this.generateFeedback(this.data.currentQuestion, answer);
    const newAnswers = [...this.data.answers, answer];
    const newFeedbacks = [...this.data.feedbacks, feedback];

    // 回答长度 > 30 视为优良回答
    const isGood = answer.length > 30;
    const newCorrect = this.data.correctAnswers + (isGood ? 1 : 0);

    this.setData({
      answers: newAnswers,
      feedbacks: newFeedbacks,
      currentFeedback: feedback,
      correctAnswers: newCorrect,
      userAnswer: ''
    });
  },

  generateFeedback(question, answer) {
    const len = answer.length;
    if (len < 15) {
      return '回答较为简短，建议展开说明具体经历和思考过程，增加回答的深度和说服力。';
    } else if (len < 50) {
      return '回答思路正确，内容有一定展开。可以补充具体的案例或数据来支撑观点，使回答更有说服力。';
    } else if (len < 100) {
      return '回答内容充实，结构清晰，能够很好地回应问题。建议适当提及自己的反思和收获。';
    } else {
      return '非常出色的回答！内容详实，逻辑严密，有具体案例支撑，展现出了专业的素养和深入的思考。';
    }
  },

  nextQuestion() {
    const nextIndex = this.data.currentQuestionIndex + 1;

    if (nextIndex < this.data.questions.length) {
      this.setData({
        currentQuestionIndex: nextIndex,
        currentQuestion: this.data.questions[nextIndex],
        userAnswer: '',
        currentFeedback: '',
        isLastQuestion: nextIndex === this.data.questions.length - 1
      });
    } else {
      const rate = this.data.totalQuestions > 0 
        ? Math.round(this.data.correctAnswers / this.data.totalQuestions * 100) 
        : 0;
      this.setData({
        isDefenseEnded: true,
        currentQuestion: '',
        currentFeedback: '',
        passRate: rate
      });
      this.saveDefenseHistory();
    }
  },

  resetDefense() {
    this.setData({
      paperTitle: '',
      paperContent: '',
      isDefenseStarted: false,
      isDefenseEnded: false,
      currentQuestion: '',
      currentQuestionIndex: 0,
      userAnswer: '',
      currentFeedback: '',
      questions: [],
      answers: [],
      feedbacks: [],
      correctAnswers: 0,
      isLastQuestion: false,
      passRate: 0
    });
  },

  saveDefenseHistory() {
    const record = {
      paperTitle: this.data.paperTitle,
      date: new Date().toLocaleString(),
      questions: this.data.questions,
      answers: this.data.answers,
      feedbacks: this.data.feedbacks,
      correctAnswers: this.data.correctAnswers,
      totalQuestions: this.data.totalQuestions
    };

    const history = wx.getStorageSync('defenseHistory') || [];
    history.unshift(record);
    if (history.length > 10) history.splice(10);

    wx.setStorageSync('defenseHistory', history);
    this.setData({ defenseHistory: history });
  },

  loadDefenseHistory() {
    const history = wx.getStorageSync('defenseHistory') || [];
    this.setData({ defenseHistory: history });
  },

  importFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['.txt'],
      success: (res) => {
        const file = res.tempFiles[0];
        if (file.name.endsWith('.txt')) {
          wx.getFileSystemManager().readFile({
            filePath: file.path,
            encoding: 'utf8',
            success: (fileRes) => {
              this.parseFileContent(fileRes.data);
            },
            fail: () => {
              wx.showToast({ title: '文件读取失败，请手动粘贴内容', icon: 'none' });
            }
          });
        } else {
          wx.showToast({ title: '仅支持 .txt 格式', icon: 'none' });
        }
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '无法选择文件，请在微信聊天中打开小程序', icon: 'none', duration: 3000 });
        }
      }
    });
  },

  parseFileContent(content) {
    const body = content.trim().substring(0, 300);
    this.setData({ paperContent: body });
  }
});
