/**
 * 退回财政（退票）/退回上一岗
 * @param {Object} backUrl    请求url
 * @param {Object} opereteName   退票/退回
 * @param {Object} records    凭证列表
 * @param {Object} idName     主键
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
function backVoucher(backUrl,records, idName,opereteName) {
	if (records.length == 0) {
		parent.Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
	}
	if(opereteName==undefined){
		opereteName = "退回财政";
	}
	var ids = [];
	var lastVers = [];
	Ext.Array.each(records,function(model) {
				ids.push(model.get(idName));
				lastVers.push(model.get("last_ver"));
			});
	var bill_type_id = records[0].get("bill_type_id");
	Ext.widget('window', {
		id : 'backWin',
		title : opereteName+'原因',
		width : 380,
		height : 150,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [Ext.widget('form', {
					renderTo : Ext.getBody(),
					layout : {
						type : 'hbox',
						padding : '10'
					},
					resizable : false,
					modal : true,
					items : [{
								xtype : 'textareafield',
								height : 70,
								width : 345,
								id : 'beaText'
							}],
					buttons : [{
						text : '确定',
						handler : function() {
							// 退票/退回原因
							var backRes = Ext.getCmp('beaText').getValue();
							if (backRes == ""){
								Ext.Msg.alert("系统提示", opereteName+"原因不能为空！");
								return ;
							};
							if (backRes.length > 40) {
								Ext.Msg.alert("系统提示", opereteName+"原因长度不能超过40个字！");
								return;
							};
							
							var myMask = new Ext.LoadMask('backWin', {
									msg : '后台正在处理中，请稍后....',
									removeMask : true   // 完成后移除
									});

							myMask.show();
							// 提交到服务器操作
								Ext.Ajax.request({
											url : backUrl,
											method : 'POST',
											timeout : 180000, // 设置为3分钟
											params : {
												returnRes : backRes,
												billIds : Ext.encode(ids),
												last_vers : Ext.encode(lastVers),
												billTypeId : bill_type_id,
												menu_id : Ext.PageUtil.getMenuId()
											},
											// 提交成功的回调函数
											success : function(response,options) {
												succAjax(response,myMask);
												Ext.getCmp('backWin').close();
												refreshData();
											},
											// 提交失败的回调函数
											failure : function(response,options) {
												failAjax(response,myMask);
											}
										});
							}
					}, {
						text : '取消',
						handler : function() {
							this.up('window').close();
						}
					}]

				})]
	}).show();
//	Ext.getCmp('backWin').setTitle('凭证'+opereteName+'原因');
}
