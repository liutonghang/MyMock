/***
 * 支付凭证初审（行号补录）界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.OfficalCardQueryController',{
	  
		extend : 'Ext.app.Controller',
		// 数据集列表：
		
		stores : [ 'pay.OfficalCardStore','common.TaskLog'],
		//对象模型 OfficalCardModel 公务卡
		models : [ 'pay.OfficalCardModel' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.OfficalCardQueryList','pb.view.pay.OfficialCardQuery'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'officalCardQueryList' // 控件的别名
		}, {
			ref : 'query',
			selector : 'officialCardQuery'
		}],
		//事件的定义
		init : function() {
	     
			this.control( {
					//查询区 
					'officialCardQuery combo[id=taskState]' : {
							//状态选中
							change : function(combo, newValue, oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
								} catch(e) {}
							}
					},
					'officialCardQuery combo[id=cardtype]' : {
						//状态选中
						change : function(combo, newValue, oldValue, eOpts) {
							try {
								this.selectState(combo.valueModels[0].raw.status_code);
							} catch(e) {}
						}
				},
					//////////////////////////按钮区///////////////////////////
					//刷新
					'officalCardQueryList button[id=refresh]' : {
							click : function(){
								this.refreshData()
							}
							//注 : 当该方法没有参数的时候可以直接这样写
					},
						//导入功能
					'officalCardQueryList button[id=importCard]' : {
						click : this.impCardInfo
					},
					//人工推送公务卡
					'officalCardQueryList button[id=impConsumerInfo]' : {
						click : this.impConsumerInfo
					},
					
					//导出
					'officalCardQueryList button[id=export]' : { 
							click : function() {
								alert()
								
							}
					},
					//打印
					'officalCardQueryList button[id=print]' : {
						    click : function() {
								alert()
							}
					} 
					
					////////////////////////END///////////////////////
				})
			},
			/////////////////////被调用的方法/////////////////////////
					
					/**
					 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
					 * @param {Object} status_code  状态code
					 */
					selectState : function(status_code) {
						if ('1' == status_code) { //未初审
						} else if ('2' == status_code) { //已初审
						} else if ('3' == status_code) { //被退回
						}
						//this.refreshData();
					},
					/**
	 * 
	 * 导入卡信息
	 */
	impCardInfo:function(){
		var me = this;
		//这里是把该功能定义了一个控件调用的时候直接创建控件调用init方法show就完成了控件的显示
		var admdivCode = Ext.getCmp('admdivCode').getValue()
		var importwindow = Ext.create('pb.view.common.ImportFileWindow');
		importwindow.init("/realware/impCardInfo.do",me,'xls');
		importwindow.show();
	},
	/**
	 * 
	 * 人工推送公务卡
	 */
	impConsumerInfo:function(){
		var me = this;
			 Ext.widget('window', {
					id : 'payFlow',
						title : '选择推送明细时间',
						width : 380,
						height : 110,
						layout : 'fit',
						resizable : true,
						draggable : true,
						modal : true,
						items : [Ext.widget('form', {
							renderTo : Ext.getBody(),
							layout : {
								type : 'hbox',
								padding : '10 0 60 40'
							},
							resizable : false,
							modal : true,
							items : [ {
								id:'consumer_date',
								fieldLabel : '消费明细推送日期',
								xtype : 'datefield',
								dataIndex : 'vou_date',
								format : 'Ymd',
								style : 'margin-left:5px;margin-right:5px;'
							} ],
							buttons : [{
								text : '确定',
								handler : function() {
								 var consumer_date=Ext.getCmp('consumer_date').getValue();
								 if (consumer_date == "" ||  null == consumer_date){
										Ext.Msg.alert("系统提示", "请选择推送明细时间！");
										return ;
									}
								 var consumerDate= Ext.PageUtil.Todate(consumer_date,'Ymd');
								 Ext.widget('window', {
									    title: '再次确认推送时间',
									    height: 90,
									    width: 380,
									    layout: 'fit',
									    resizable : false,
										modal : true,
										renderTo : Ext.getBody(),
										items : [ {
											fieldLabel : '&nbsp&nbsp您的选择',
											xtype : 'textfield',
											readOnly:true,
											value:'gwk'+consumerDate+'.txt'	
										} ],
										buttons : [{
											text : '确定',
											handler : function() {
											var params = {
													consumerDate : consumerDate
												};
												Ext.PageUtil.doRequestAjax(me,'/realware/impCardConsumerInfo.do',params);
												this.up('window').close();
												Ext.getCmp('payFlow').close();
												}
											}, {
													text : '重选',
													handler : function() {
														this.up('window').close();
													}
											}]
								 }).show();

						}}, {
							text : '取消',
							handler : function() {
								this.up('window').close();
							}
						}]
					})]
			 }).show();
	},
					/**
					 * 刷新
					 * @memberOf {TypeName} 
					 */
					refreshData : function() {
						this.getStore('pay.OfficalCardStore').loadPage(1);
					}
});
