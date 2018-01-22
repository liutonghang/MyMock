
Ext.define('pb.controller.common.UserMessageController', {
	extend : 'Ext.app.Controller',
	// 数据集列表：
	stores : [ 'common.UserMessageStore'],
	//对象模型 UserMessageModel
	models : [ 'common.UserMessageModel' ],
	//当创建一个控件的时候需要在此引入
	requires : [ 'pb.view.common.UserMessageList','pb.view.common.UserMsgWindow'],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
			ref : 'list', //当前控制层引用
			selector : 'userMsgList' // 控件的别名
	} ],
	onLaunch: function() {
		//当前控制层
		var me = this;
		//刷新数据前事件
		var queryView = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		me.getStore('common.UserMessageStore').on('beforeload',function(thiz, options) {
				//当前状态控件
				var taskState = Ext.getCmp('taskState');
				//当前状态对应的查询条件
				var condition = taskState.valueModels[0].raw.conditions;
				//查询条件拼装至后台
				Ext.PageUtil.onBeforeLoad(condition, queryView, me.getModel('common.UserMessageModel'), options);
		});
		var panel = Ext.ComponentQuery.query('viewport > panel')[0];

			Ext.PageUtil.onInitList(panel, 'common.UserMessageStore');
		
			Ext.PageUtil.onInitPage(panel, _menu.statusList, 'common.UserMessageStore');
		
			Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"), Ext.getCmp("taskState"), true);
			
			Ext.getCmp("taskState").setValue(_menu.statusList[0].status_code);
		
	},
	init : function() {
			this.control( {
					'userMsgList combo[id=taskState]' : {
							//状态选中
							change : function(combo, newValue, oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
								} catch(e) {}
							},
							select : this.refreshData
					},
					//录入
					'userMsgList button[id=addUserMsg]' : {
							click : this.addUserMsg
					},
					//变更
					'userMsgList button[id=editUsermsg]' : {
						    click : this.editUsermsg
					},
					//注销
					'userMsgList button[id=logOff]' : {
						   click : this.logOff
					},
					//刷新
					'userMsgList button[id=refresh]' : {
						   click : this.refreshData
					}
				})
},
/**************************被调用的方法*********************************/			
/**
* 录入
*/			
addUserMsg : function(){
		var me = this;
		//建立窗口对象
	    var window = Ext.create('pb.view.common.UserMsgWindow',{
			title:'签约用户信息录入'
	    });
	    window.show();
	    //确定按钮事件
		Ext.ComponentQuery.query('button[id=confirm]',window)[0].on('click',function(){
				var form = window.getForm();
				//表单校验后提交
				if (form.isValid()) {
					form.submit( {
							url : '/realware/saveUserSignZero.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							waitTitle : '提示',
							waitMsg : '后台正在处理中，请您耐心等候...',
							success : function(form,action) {
								Ext.PageUtil.succForm(form,action);
								window.close();
								me.refreshData ();
							},
							failure : function(form,action) {
								var respTxt =action.response.responseText;
								Ext.Msg.alert("失败提示",respTxt);
//								window.close();
							}
					});
				}
		});
},

/**
* 变更
*/
editUsermsg : function(){
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
		if(!records){
			return;
		}
		//建立窗口对象
		 var window2 = Ext.create('pb.view.common.UserMsgWindow',{
			title:'签约用户信息变更'
	    });
	    window2.show();
	    //获取panel当中的列表数据
		//将列表数据加载到窗口对象中
		window2.setRecord(records[0]),
		//设置只读
		window2.setReadOnly(),
		//确定按钮事件
		Ext.ComponentQuery.query('button[id=confirm]',window2)[0].on('click',function(){
				var form = window2.getForm();
				if(!window2.checkChange()){
					window2.close();
					return;
				}
				//表单校验后提交
				if (form.isValid()) {
					form.submit( {
							url : '/realware/editUserSignZero.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							waitTitle : '提示',
							waitMsg : '后台正在处理中，请您耐心等候...',
							success : function(form,action) {
								Ext.PageUtil.succForm(form,action);
								window2.close();
								me.refreshData ();
							},
							failure : function(form,action) {
								var respTxt =action.response.responseText;
								Ext.Msg.alert("失败提示",respTxt);
//								window2.close();
							}
					});
				}
		});


},
/**
* 注销
*/
logOff : function(){
	var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
	if(!records){
		return;
	}
	var me = this;
	var sign_id=records[0].get("sign_id");
	Ext.MessageBox.confirm('删除提示', '是否确定注销此用户？', function(id){
	   if(id=="yes"){
	   			var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true
				});
				myMask.show();
				Ext.Ajax.request( {
					url : "/realware/disableUserSignZero.do",
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						sign_id : sign_id
					},
					success : function(response, options) {
							Ext.PageUtil.succAjax(response, myMask);
							me.refreshData ();
					},
					failure : function(response, options) {
							Ext.PageUtil.failAjax(response, myMask);
					}
				});
	   
	   }
		
	});
},
	
					
/**
* 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
* @param {Object} status_code  状态code
*/
selectState : function(status_code) {
		if ('001' == status_code) { //未注销
				Ext.StatusUtil.batchEnable("addUserMsg,editUsermsg,logOff,refresh");
		} else if ('002' == status_code) { //已注销
				Ext.StatusUtil.batchDisable("addUserMsg,editUsermsg,logOff");
				Ext.StatusUtil.batchEnable("refresh");
		}
},
					
	
/**
* 刷新
*/
refreshData : function() {
		var panel = this.getList();
		var grid = panel.down("gridpanel");
		var selModel = grid.getSelectionModel();
			selModel.clearSelections()
		this.getStore('common.UserMessageStore').loadPage(1);
},

refresh : function() {
			this.getStore('common.UserMessageStore').loadPage(1);
		
	
}
});