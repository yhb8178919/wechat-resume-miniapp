const api = require('../../utils/api');

Page({
  data: {
    tests: [],
    evaluating: false,
    selectedIndex: -1
  },

  onLoad() {
    this.setData({ tests: this.buildTests() });
  },

  buildTests() {
    const pool = [
      { title: '逻辑推理能力', desc: '数列推理、图形推理、演绎逻辑', time: '15分钟', level: '中级' },
      { title: '数据分析能力', desc: '数据解读、图表分析、趋势判断', time: '20分钟', level: '中级' },
      { title: '沟通表达能力', desc: '情景对话、邮件撰写、汇报总结', time: '10分钟', level: '基础' },
      { title: '团队协作能力', desc: '冲突处理、角色分配、目标协同', time: '10分钟', level: '基础' },
      { title: '项目管理能力', desc: '进度控制、风险识别、资源分配', time: '15分钟', level: '高级' },
      { title: '编程基础测试', desc: '数据结构、算法思维、代码理解', time: '20分钟', level: '高级' },
      { title: 'SQL与数据库', desc: '查询优化、表设计、索引理解', time: '15分钟', level: '中级' },
      { title: '产品思维测试', desc: '需求分析、用户调研、MVP设计', time: '15分钟', level: '中级' },
      { title: '英语能力测试', desc: '阅读理解、商务写作、邮件交流', time: '15分钟', level: '中级' },
      { title: 'Office办公技能', desc: 'Excel公式、PPT设计、Word排版', time: '10分钟', level: '基础' },
      { title: '领导力评估', desc: '决策风格、激励方法、授权管理', time: '15分钟', level: '高级' },
      { title: '抗压能力测试', desc: '压力场景判断、情绪管理策略', time: '10分钟', level: '基础' },
      { title: '创新思维能力', desc: '头脑风暴、逆向思维、联想能力', time: '10分钟', level: '中级' },
      { title: '销售能力测评', desc: '谈判技巧、客户心理、成交策略', time: '15分钟', level: '中级' },
      { title: '写作能力测试', desc: '文案撰写、报告结构、观点表达', time: '15分钟', level: '中级' },
    ];
    return pool.sort(() => Math.random() - 0.5).slice(0, 12);
  },

  onTestTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.tests[index];
    this.setData({ selectedIndex: index, evaluating: true });

    const prompt = `技能测评主题：${item.title}
描述：${item.desc}
推荐用时：${item.time}
难度等级：${item.level}

请以专业测评师的身份，完成以下内容：
1. 【测评说明】：该技能的重要性及测评目的（2-3句）
2. 【自我评估清单】：列出5个关键评估点，用户可逐条自检
3. 【评分标准】：给出1-10分的量化评分参考
4. 【提升建议】：针对该技能，给出3条具体可操作的提升方法
5. 【推荐资源】：推荐2-3个学习资源（书籍/课程/工具）`;

    api.callAIService(prompt, (response) => {
      this.setData({ evaluating: false });
      wx.setStorageSync('tempResult', {
        content: response,
        type: '技能测评',
        topic: item.title,
        time: new Date().toLocaleString()
      });
      const th = wx.getStorageSync('toolHistory') || [];
      th.push({ source:'技能测评', topic:item.title, content:response, type:'技能测评', time:new Date().toLocaleString() });
      wx.setStorageSync('toolHistory', th);
      wx.navigateTo({ url: '/pages/result/result' });
    }, () => {
      this.setData({ evaluating: false, selectedIndex: -1 });
    });
  }
});
