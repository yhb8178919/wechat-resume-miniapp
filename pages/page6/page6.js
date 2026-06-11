const api = require('../../utils/api');

Page({
  data: {
    questions: [],
    searching: false,
    selectedIndex: -1
  },

  onLoad() {
    this.setData({ questions: this.buildQuestions() });
  },

  buildQuestions() {
    const pool = [
      { q: '请做一下自我介绍', cat: '自我介绍', diff: '基础' },
      { q: '你最大的优点是什么', cat: '自我认知', diff: '基础' },
      { q: '你最大的缺点是什么', cat: '自我认知', diff: '基础' },
      { q: '你为什么选择我们公司', cat: '求职动机', diff: '中等' },
      { q: '你对未来3-5年的职业规划', cat: '职业规划', diff: '中等' },
      { q: '请描述一次你解决复杂问题的经历', cat: '解决问题', diff: '中等' },
      { q: '你是如何与难相处的同事合作的', cat: '团队协作', diff: '中等' },
      { q: '如果你的工作出现失误，你会怎么做', cat: '情境应对', diff: '中等' },
      { q: '请介绍一个你主导的成功项目', cat: '项目管理', diff: '中等' },
      { q: '你如何管理时间和优先级', cat: '工作方法', diff: '中等' },
      { q: '你如何应对工作中的压力', cat: '抗压能力', diff: '基础' },
      { q: '你离开上一家公司的原因', cat: '求职动机', diff: '基础' },
      { q: '你对薪资的期望是多少', cat: '薪资谈判', diff: '中等' },
      { q: '请描述你的领导风格', cat: '领导力', diff: '困难' },
      { q: '你做过的最困难的决定是什么', cat: '决策能力', diff: '困难' },
      { q: '如果一个项目进度滞后，你会怎么办', cat: '情境应对', diff: '困难' },
      { q: '你有什么问题要问我吗', cat: '反问环节', diff: '基础' },
      { q: '假如客户对方案不满意，你如何处理', cat: '客户管理', diff: '中等' },
      { q: '你最近学了什么新技能', cat: '学习能力', diff: '基础' },
      { q: '如果给你一个全新领域的工作，你怎么上手', cat: '适应能力', diff: '困难' },
    ];
    return pool.sort(() => Math.random() - 0.5).slice(0, 20);
  },

  onQuestionTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.questions[index];
    this.setData({ selectedIndex: index, searching: true });

    const prompt = `面试问题：${item.q}
问题分类：${item.cat}
难度等级：${item.diff}

请以专业面试官的视角，给出以下内容的回答：
1. 【回答思路】：分析这道题的考察点（2-3句话）
2. 【高分回答示例】：提供一段150字左右的优秀回答
3. 【加分技巧】：1-2个让回答更出彩的小技巧
4. 【避坑提醒】：回答时需要注意避免的雷区`;

    api.callAIService(prompt, (response) => {
      this.setData({ searching: false });
      const history = wx.getStorageSync('evaluationHistory') || [];
      history.push({
        fileName: item.q,
        type: '面试答题',
        content: response,
        time: new Date().toLocaleString()
      });
      wx.setStorageSync('evaluationHistory', history);
      const th = wx.getStorageSync('toolHistory') || [];
      th.push({ source:'面试题库', topic:item.q, content:response, type:'面试答题', time:new Date().toLocaleString() });
      wx.setStorageSync('toolHistory', th);
      wx.setStorageSync('tempResult', {
        content: response,
        type: '面试答题',
        topic: item.q,
        time: new Date().toLocaleString()
      });
      wx.navigateTo({ url: '/pages/result/result' });
    }, () => {
      this.setData({ searching: false, selectedIndex: -1 });
    });
  }
});
