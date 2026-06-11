const api = require('../../utils/api');

Page({
  data: { list: [], loading: false, selectedIndex: -1 },
  onLoad() { this.setData({ list: this.build() }); },
  build() {
    const pool = [
      { title:'五险一金详解', desc:'养老保险、医保、公积金缴纳比例与权益', cat:'社保', color:'#2196F3' },
      { title:'劳动合同签订注意事项', desc:'合同类型、试用期条款、竞业限制', cat:'法律', color:'#F44336' },
      { title:'试用期权益保护', desc:'试用期时长、薪资标准与辞退补偿', cat:'法律', color:'#FF9800' },
      { title:'年终奖与绩效奖金', desc:'发放规则、计税方式与争议处理', cat:'薪酬', color:'#4CAF50' },
      { title:'加班费计算与维权', desc:'标准工时、综合工时与加班费基数', cat:'法律', color:'#F44336' },
      { title:'年假与病假规定', desc:'带薪年假天数、病假工资与请假流程', cat:'假期', color:'#2196F3' },
      { title:'公积金提取与贷款攻略', desc:'租房提取、房贷计算与异地转移', cat:'住房', color:'#795548' },
      { title:'个人所得税计算', desc:'工资个税、年终奖个税与专项附加扣除', cat:'税务', color:'#FF9800' },
      { title:'职场PUA识别与应对', desc:'识别精神操控、设立边界与求助渠道', cat:'心理', color:'#9C27B0' },
      { title:'裁员补偿与经济补偿金', desc:'N+1/N+2计算、协商策略与仲裁流程', cat:'法律', color:'#F44336' },
      { title:'竞业限制条款解读', desc:'范围、期限、补偿金标准与违约后果', cat:'法律', color:'#2196F3' },
      { title:'职场性别平等与反歧视', desc:'招聘歧视、晋升公平与孕产权益', cat:'权益', color:'#E91E63' },
      { title:'公司期权与股权激励', desc:'期权授予、行权、退出机制与税务处理', cat:'股权', color:'#4CAF50' },
      { title:'档案与组织关系转移', desc:'人事档案、党员关系与社保转移流程', cat:'人事', color:'#795548' },
      { title:'职场高效沟通方法论', desc:'向上管理、跨部门协作与非暴力沟通', cat:'沟通', color:'#2196F3' },
    ];
    return pool.sort(()=>Math.random()-0.5).slice(0,15);
  },
  onTap(e) {
    const i=e.currentTarget.dataset.index,it=this.data.list[i];
    this.setData({selectedIndex:i,loading:true});
    const prompt=`职场百科主题：${it.title}
分类：${it.cat}
描述：${it.desc}

请以资深人力资源专家/劳动法顾问的身份提供以下解答：
1.【基本概念】：通俗解释该主题的核心内容
2.【关键要点】：最重要的3-5个要点说明（含具体数字和法规依据）
3.【实操指南】：遇到相关情况的具体操作步骤
4.【维权提醒】：常见陷阱与自我保护方法
5.【问答示例】：2个常见场景问答
6.【延伸阅读】：推荐1-2个权威信息来源`;
    api.callAIService(prompt,(r)=>{this.setData({loading:false});wx.setStorageSync('tempResult',{content:r,type:'职场百科',topic:it.title,time:new Date().toLocaleString()});const th=wx.getStorageSync('toolHistory')||[];th.push({source:'职场百科',topic:it.title,content:r,type:'职场百科',time:new Date().toLocaleString()});wx.setStorageSync('toolHistory',th);wx.navigateTo({url:'/pages/result/result'})},()=>{this.setData({loading:false,selectedIndex:-1})});
  }
});
