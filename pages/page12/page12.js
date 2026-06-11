const api = require('../../utils/api');

Page({
  data: { list: [], loading: false, selectedIndex: -1 },
  onLoad() { this.setData({ list: this.build() }); },
  build() {
    const pool = [
      { title:'腾讯', desc:'互联网巨头，社交/游戏/云服务多元业务', cat:'互联网', color:'#2196F3' },
      { title:'阿里巴巴', desc:'电商/云计算/金融科技全面布局', cat:'互联网', color:'#FF9800' },
      { title:'字节跳动', desc:'抖音/TikTok/飞书，全球化内容平台', cat:'互联网', color:'#F44336' },
      { title:'华为', desc:'通信/ICT/智能汽车，研发驱动型企业', cat:'科技', color:'#2196F3' },
      { title:'比亚迪', desc:'新能源车+电池全球领军企业', cat:'制造', color:'#4CAF50' },
      { title:'美团', desc:'本地生活服务平台，零售+科技战略', cat:'互联网', color:'#FF9800' },
      { title:'拼多多/Temu', desc:'社交电商+跨境电商双轮驱动', cat:'电商', color:'#F44336' },
      { title:'京东', desc:'自营电商+供应链物流基础设施', cat:'电商', color:'#2196F3' },
      { title:'小米', desc:'手机+AIoT+汽车生态链布局', cat:'科技', color:'#FF9800' },
      { title:'宁德时代', desc:'全球动力电池龙头，新能源核心供应商', cat:'能源', color:'#4CAF50' },
      { title:'百度', desc:'AI/自动驾驶先行者，文心大模型', cat:'科技', color:'#2196F3' },
      { title:'网易', desc:'游戏+音乐+教育多元业务矩阵', cat:'互联网', color:'#F44336' },
      { title:'大疆创新', desc:'全球无人机领导者，硬科技创新代表', cat:'科技', color:'#9C27B0' },
      { title:'小红书', desc:'生活方式社区，种草经济与品牌营销', cat:'互联网', color:'#FF9800' },
      { title:'中国平安', desc:'综合金融服务集团，科技赋能金融', cat:'金融', color:'#795548' },
    ];
    return pool.sort(()=>Math.random()-0.5).slice(0,15);
  },
  onTap(e) {
    const i=e.currentTarget.dataset.index,it=this.data.list[i];
    this.setData({selectedIndex:i,loading:true});
    const prompt=`名企介绍主题：${it.title}
分类：${it.cat}
描述：${it.desc}

请以企业招聘专家的视角进行介绍：
1.【企业概况】：公司规模、主营业务与市场地位
2.【企业文化】：核心价值观、工作氛围与团队风格
3.【校招/社招特点】：招聘时间线、目标院校、岗位分布
4.【面试流程】：常见面试轮次与考察重点
5.【薪资福利】：薪酬水平、福利特色与晋升通道
6.【面试准备建议】：针对该企业的3条具体备战策略
7.【员工评价】：内部员工普遍反馈的工作体验`;
    api.callAIService(prompt,(r)=>{this.setData({loading:false});wx.setStorageSync('tempResult',{content:r,type:'名企介绍',topic:it.title,time:new Date().toLocaleString()});const th=wx.getStorageSync('toolHistory')||[];th.push({source:'名企直通车',topic:it.title,content:r,type:'名企介绍',time:new Date().toLocaleString()});wx.setStorageSync('toolHistory',th);wx.navigateTo({url:'/pages/result/result'})},()=>{this.setData({loading:false,selectedIndex:-1})});
  }
});
