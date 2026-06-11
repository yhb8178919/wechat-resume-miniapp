const api = require('../../utils/api');

Page({
  data: {
    salaryList: [],
    analyzing: false,
    selectedIndex: -1
  },

  onLoad() {
    this.setData({ salaryList: this.buildSalaryData() });
  },

  buildSalaryData() {
    const pool = [
      { pos: 'Java开发工程师', ind: '互联网/IT', sal: '15K-35K', exp: '1-5年' },
      { pos: '前端开发工程师', ind: '互联网/IT', sal: '12K-30K', exp: '1-5年' },
      { pos: 'Python开发工程师', ind: '互联网/IT', sal: '15K-38K', exp: '1-5年' },
      { pos: '算法工程师', ind: '人工智能', sal: '25K-60K', exp: '2-5年' },
      { pos: '数据分析师', ind: '数据/分析', sal: '12K-28K', exp: '1-5年' },
      { pos: '产品经理', ind: '互联网/IT', sal: '15K-35K', exp: '2-5年' },
      { pos: 'UI/UX设计师', ind: '设计/创意', sal: '10K-25K', exp: '1-5年' },
      { pos: '软件测试工程师', ind: '互联网/IT', sal: '10K-22K', exp: '1-5年' },
      { pos: '运营经理', ind: '互联网/IT', sal: '12K-28K', exp: '2-5年' },
      { pos: '人力资源经理', ind: '人力资源', sal: '12K-25K', exp: '3-5年' },
      { pos: '财务经理', ind: '金融/财务', sal: '12K-30K', exp: '3-5年' },
      { pos: '市场营销总监', ind: '市场/营销', sal: '20K-45K', exp: '5年+' },
      { pos: '网络运维工程师', ind: '互联网/IT', sal: '8K-20K', exp: '1-5年' },
      { pos: '项目经理（IT）', ind: '互联网/IT', sal: '18K-35K', exp: '3-5年' },
      { pos: '销售工程师', ind: '销售/商务', sal: '8K-20K', exp: '1-3年' },
      { pos: '架构师', ind: '互联网/IT', sal: '30K-60K', exp: '5年+' },
      { pos: '新媒体运营', ind: '传媒/内容', sal: '8K-18K', exp: '1-3年' },
      { pos: '机械工程师', ind: '制造业', sal: '10K-22K', exp: '1-5年' },
      { pos: '公务员/事业编', ind: '政府/公共', sal: '6K-15K', exp: '不限' },
      { pos: '律师/法务', ind: '法律/咨询', sal: '15K-40K', exp: '2-5年' },
    ];
    return pool.sort(() => Math.random() - 0.5).slice(0, 18);
  },

  onSalaryTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.salaryList[index];
    this.setData({ selectedIndex: index, analyzing: true });

    const prompt = `职位薪资分析：
岗位：${item.pos}
行业：${item.ind}  
参考薪资范围：${item.sal}
经验要求：${item.exp}

请从以下维度进行薪资分析：
1. 【市场行情】：当前市场该岗位的薪资水平与竞争力分析
2. 【薪资结构】：常见的薪资构成（底薪、绩效、年终等）
3. 【成长空间】：该岗位未来3-5年的薪资涨幅预期
4. 【区域差异】：一线/二线城市的薪资差异说明
5. 【谈判建议】：面试谈薪资的实用策略（2-3条）`;

    api.callAIService(prompt, (response) => {
      this.setData({ analyzing: false });
      wx.setStorageSync('tempResult', {
        content: response,
        type: '薪资分析',
        topic: item.pos,
        time: new Date().toLocaleString()
      });
      const th = wx.getStorageSync('toolHistory') || [];
      th.push({ source:'薪资查询', topic:item.pos, content:response, type:'薪资分析', time:new Date().toLocaleString() });
      wx.setStorageSync('toolHistory', th);
      wx.navigateTo({ url: '/pages/result/result' });
    }, () => {
      this.setData({ analyzing: false, selectedIndex: -1 });
    });
  }
});
