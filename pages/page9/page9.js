const api = require('../../utils/api');

Page({
  data: { list: [], loading: false, selectedIndex: -1 },
  onLoad() { this.setData({ list: this.build() }); },
  build() {
    const pool = [
      { title:'简历投递黄金法则', desc:'投递时间、渠道、频率最佳实践', cat:'投递策略', color:'#4CAF50' },
      { title:'如何写出吸引HR的求职信', desc:'求职信的结构、语气与亮点挖掘', cat:'求职信', color:'#2196F3' },
      { title:'面试前的准备工作清单', desc:'从公司调研到着装礼仪全面准备', cat:'面试准备', color:'#FF9800' },
      { title:'群面/无领导小组讨论攻略', desc:'角色选择、发言时机与协作技巧', cat:'群面', color:'#9C27B0' },
      { title:'技术面试通关秘籍', desc:'白板编程、系统设计、项目展示', cat:'技术面试', color:'#F44336' },
      { title:'行为面试STAR法则详解', desc:'用STAR模型讲好你的故事', cat:'行为面试', color:'#2196F3' },
      { title:'薪资谈判的策略与话术', desc:'报价时机、锚定技巧与底线保护', cat:'谈判', color:'#FF9800' },
      { title:'如何应对压力面试', desc:'施压类型识别与情绪管理方法', cat:'压力面试', color:'#F44336' },
      { title:'面试后的跟进与感谢信', desc:'感谢信模板、跟进节奏与加分项', cat:'跟进', color:'#4CAF50' },
      { title:'违约/毁约的正确处理方式', desc:'三方协议、违约金与沟通策略', cat:'合同', color:'#795548' },
      { title:'简历关键词AATS优化', desc:'通过ATS筛选系统的关键词技巧', cat:'简历', color:'#2196F3' },
      { title:'跨行业求职转型指南', desc:'技能迁移、经验包装与行业切入', cat:'转型', color:'#9C27B0' },
      { title:'职场人际关系建立技巧', desc:'导师寻找、团队融入与人脉拓展', cat:'关系', color:'#4CAF50' },
      { title:'试用期生存与展示策略', desc:'90天快速建立信任与展示价值', cat:'入职', color:'#FF9800' },
      { title:'远程面试的注意事项', desc:'设备调试、环境布置与镜头表现', cat:'远程', color:'#2196F3' },
    ];
    return pool.sort(()=>Math.random()-0.5).slice(0,15);
  },
  onTap(e) {
    const i=e.currentTarget.dataset.index,it=this.data.list[i];
    this.setData({selectedIndex:i,loading:true});
    const prompt=`求职攻略主题：${it.title}
分类：${it.cat}
描述：${it.desc}

请以资深职业规划师的视角，提供以下内容：
1.【核心要点】：该主题最重要的3个关键点
2.【详细操作】：每个关键点具体怎么做（含可执行的步骤）
3.【真实案例】：1-2个正面/反面案例
4.【避坑指南】：常见错误与注意事项
5.【进阶建议】：针对不同经验的求职者给出差异化建议`;
    api.callAIService(prompt,(r)=>{this.setData({loading:false});wx.setStorageSync('tempResult',{content:r,type:'求职攻略',topic:it.title,time:new Date().toLocaleString()});const th=wx.getStorageSync('toolHistory')||[];th.push({source:'求职攻略',topic:it.title,content:r,type:'求职攻略',time:new Date().toLocaleString()});wx.setStorageSync('toolHistory',th);wx.navigateTo({url:'/pages/result/result'})},()=>{this.setData({loading:false,selectedIndex:-1})});
  }
});
