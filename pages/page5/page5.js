const api = require('../../utils/api');

Page({
  data: {
    templates: [],
    aiGenerating: false,
    selectedIndex: -1
  },

  onLoad() {
    this.setData({ templates: this.buildTemplates() });
  },

  buildTemplates() {
    const pool = [
      { name: '通用标准模板', desc: '简洁大气的标准简历布局', tags: ['通用', '经典'] },
      { name: '技术研发模板', desc: '突出项目经验与技术栈', tags: ['技术', '项目'] },
      { name: '市场营销模板', desc: '强调业绩数据与案例', tags: ['市场', '营销'] },
      { name: '财务会计模板', desc: '展现专业资质与合规能力', tags: ['财务', '专业'] },
      { name: '人力资源模板', desc: '突出沟通协调与招聘成果', tags: ['HR', '管理'] },
      { name: '应届生模板', desc: '聚焦教育背景与实习经历', tags: ['应届', '实习'] },
      { name: '产品经理模板', desc: '产品规划、需求分析与数据驱动', tags: ['产品', '管理'] },
      { name: 'UI/UX设计模板', desc: '作品集+设计方法论展示', tags: ['设计', '创意'] },
      { name: '项目管理模板', desc: 'PMP、敏捷、项目成果量化', tags: ['管理', 'PM'] },
      { name: '运营推广模板', desc: '增长数据、活动策划、用户运营', tags: ['运营', '数据'] },
      { name: '人工智能/算法模板', desc: '论文、竞赛、模型成果展示', tags: ['AI', '算法'] },
      { name: '金融行业模板', desc: '投资分析、风控、从业资格', tags: ['金融', '分析'] },
      { name: '教育培训模板', desc: '教学成果、课程设计、证书', tags: ['教育', '培训'] },
      { name: '医药健康模板', desc: '临床经验、科研成果、执照', tags: ['医疗', '专业'] },
      { name: '海外求职模板', desc: '中英双语、国际化经验展示', tags: ['双语', '国际'] },
    ];
    return pool.sort(() => Math.random() - 0.5).slice(0, 15);
  },

  onTemplateTap(e) {
    const index = e.currentTarget.dataset.index;
    const tpl = this.data.templates[index];
    this.setData({ selectedIndex: index, aiGenerating: true });

    const prompt = `请为我生成一份${tpl.name}的完整简历模板框架。
模板描述：${tpl.desc}
标签：${tpl.tags.join('、')}

请按标准简历格式输出，包含以下板块（用占位符标注需填写的内容）：
1. 个人信息区
2. 求职意向
3. 教育背景
4. 工作/实习经历
5. 项目经验
6. 专业技能
7. 证书与荣誉
8. 自我评价

每个板块给出2-3句简要填写提示，帮助用户写出亮眼内容。`;

    api.callAIService(prompt, (response) => {
      this.setData({ aiGenerating: false });
      wx.setStorageSync('tempResult', {
        content: response,
        type: tpl.name,
        topic: '简历模板',
        time: new Date().toLocaleString()
      });
      const th = wx.getStorageSync('toolHistory') || [];
      th.push({ source:'简历模板', topic:tpl.name, content:response, type:tpl.name, time:new Date().toLocaleString() });
      wx.setStorageSync('toolHistory', th);
      wx.navigateTo({ url: '/pages/result/result' });
    }, () => {
      this.setData({ aiGenerating: false, selectedIndex: -1 });
    });
  }
});
