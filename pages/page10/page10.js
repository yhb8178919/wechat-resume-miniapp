const api = require('../../utils/api');

Page({
  data: { list: [], loading: false, selectedIndex: -1 },
  onLoad() { this.setData({ list: this.build() }); },
  build() {
    const pool = [
      { title:'人工智能/大模型行业', desc:'ChatGPT浪潮下的AI产业格局与就业机会', cat:'科技', color:'#2196F3' },
      { title:'新能源/电动汽车行业', desc:'碳中和驱动下的产业链条与人才缺口', cat:'能源', color:'#4CAF50' },
      { title:'半导体/芯片行业', desc:'国产替代趋势与IC设计/制造岗位分析', cat:'科技', color:'#FF9800' },
      { title:'数字经济/云计算行业', desc:'企业数字化转型中的云计算与SaaS机会', cat:'科技', color:'#9C27B0' },
      { title:'生物医药/大健康行业', desc:'创新药、医疗器械与互联网医疗发展', cat:'医药', color:'#F44336' },
      { title:'直播电商/短视频行业', desc:'内容消费升级下的新零售与MCN机构', cat:'电商', color:'#FF9800' },
      { title:'金融科技/区块链行业', desc:'数字金融、量化交易与Web3就业方向', cat:'金融', color:'#2196F3' },
      { title:'教育培训/知识付费行业', desc:'双减后的教培转型与职业教育新机遇', cat:'教育', color:'#4CAF50' },
      { title:'智慧物流/供应链行业', desc:'无人配送、跨境物流与供应链优化', cat:'物流', color:'#795548' },
      { title:'游戏/元宇宙行业', desc:'游戏出海、VR/AR与虚拟内容经济', cat:'娱乐', color:'#9C27B0' },
      { title:'网络安全/数据合规行业', desc:'数据安全法与GDPR驱动的合规人才需求', cat:'安全', color:'#F44336' },
      { title:'智能制造/工业互联网', desc:'工业4.0下的自动化、IoT与数字孪生', cat:'制造', color:'#2196F3' },
      { title:'碳中和/环保产业', desc:'碳交易、ESG投资与绿色科技人才', cat:'环保', color:'#4CAF50' },
      { title:'跨境出海/全球化', desc:'中国企业出海浪潮中的国际化岗位', cat:'贸易', color:'#FF9800' },
    ];
    return pool.sort(()=>Math.random()-0.5).slice(0,12);
  },
  onTap(e) {
    const i=e.currentTarget.dataset.index,it=this.data.list[i];
    this.setData({selectedIndex:i,loading:true});
    const prompt=`行业分析主题：${it.title}
分类：${it.cat}
描述：${it.desc}

请从专业分析师的角度提供以下内容：
1.【行业概览】：市场规模、增速与产业链结构
2.【主要玩家】：该行业TOP5企业的竞争格局
3.【职位地图】：该行业主要职能岗位与薪资范围
4.【技能要求】：进入该行业需要的硬技能与软实力
5.【发展前景】：未来3-5年趋势预判与机会点
6.【入行建议】：应届生/转行者如何切入该行业`;
    api.callAIService(prompt,(r)=>{this.setData({loading:false});wx.setStorageSync('tempResult',{content:r,type:'行业分析',topic:it.title,time:new Date().toLocaleString()});const th=wx.getStorageSync('toolHistory')||[];th.push({source:'行业分析',topic:it.title,content:r,type:'行业分析',time:new Date().toLocaleString()});wx.setStorageSync('toolHistory',th);wx.navigateTo({url:'/pages/result/result'})},()=>{this.setData({loading:false,selectedIndex:-1})});
  }
});
