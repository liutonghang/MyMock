/***
 * 工资卡变更签章发送
 * @memberOf {TypeName} 
 */
 
Ext.define('pb.controller.pay.PrCardChangeSendController',{
	extend : 'Ext.app.Controller',
	// 数据集列表：
	stores : [ 'pay.PrSendRightStore'],
	models : [ 'pay.PrSendRightModel'],
	//当创建一个控件的时候需要在此引入
	requires : [ 'pb.view.pay.PrCardChangeSendList','pb.view.pay.PrCardChangeSendView','pb.view.pay.PrCardChangeSendPanel'],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
		ref : 'list',  //当前控制层引用
			selector : 'prCardChangeSendList' // 控件的别名
		}, {
			ref : 'query',
			selector : 'prCardChangeSendView'
		}, {
			ref : 'panel',
			selector : 'prCardChangeSendPanel'
		}],
		onLaunch : function() {
			// 当前控制层
			var me = this;
			// 刷新数据前事件
			var queryView = Ext.ComponentQuery.query("panel[title='查询区']")[0];
			me.getStore('pay.PrSendRightStore').on('beforeload', function(thiz, options) {
						// 查询区
							if (isExistStatus) {
								// 当前状态控件
							var taskState = Ext.getCmp('taskState');
							// 当前状态对应的查询条件
							var condition = taskState.valueModels[0].raw.conditions;
							// 查询条件拼装至后台
							Ext.PageUtil.onBeforeLoad(condition,queryView,me.getModel('pay.PrSendRightModel'),options);
						} else {
							Ext.PageUtil.onBeforeLoad(null,queryView,me.getModel('pay.PrSendRightModel'),options);
						}
					});
			var panel = Ext.ComponentQuery.query('viewport > panel')[0];
			if (!isExistStatus) {
				Ext.PageUtil.onInitList(panel,'pay.PrSendRightStore');
				if (initialLoad) {
					me.getStore('pay.PrSendRightStore').load();
				}
			} else {
				/**
				 * 初始化切换列表使用的store
				 */
				Ext.PageUtil.onInitPage(panel, _menu.statusList,'pay.PrSendRightStore');
				/**
				 * 初始化页面
				 */
				Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"),
						Ext.getCmp("taskState"), true);
				Ext.getCmp("taskState").setValue(
						_menu.statusList[0].status_code);
			}

		},
	oneSelect : true,
	isExistStatus : true, //是否有状态
	//事件的定义
	init : function() {
		this.control( {
			//查询区 
			'combo[id=taskState]' : {
				//状态选中
				change : function(combo, newValue, oldValue, eOpts) {
					try {
						this.selectState(combo.valueModels[0].raw.status_code);
					} catch(e) {}
				}
			},
			//////////////////////////按钮区///////////////////////////
			//查询
			'button[id=refresh]' : {
				click : this.refreshData
			},
			//生成回单
//			'button[id=make]' : { 
//				click : this.makeData
//			},
			//签章发送
			'button[id=send]' : { 
				click : this.signAndSend
			},
			//重发
			'button[id=resend]' : { 
				click : this.resendData
			},
			//打印
			'button[id=print]' : { 
				click : this.printdata
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
		if ('000' == status_code) { //未发送
			Ext.getCmp("send").setDisabled(false);
			Ext.getCmp("resend").setDisabled(true);
		} else if('001'==status_code){//已发送
			Ext.getCmp("send").setDisabled(true);
			Ext.getCmp("resend").setDisabled(false);
		}
		Ext.getCmp(Ext.getCmp('taskState').getValue())
		.getStore().loadPage(1);	},	
					
	/**
	  * 刷新
	  * @memberOf {TypeName} 
	 */
	refreshData : function() {
		this.getStore('pay.PrSendRightStore').loadPage(1);
	},	
					
	
	/**
	  * 签章发送
	  * @memberOf {TypeName} 
	 */
	signAndSend : function() {
//		var vVtCode="";
//		if(jspName=='PrCardChangeSend'){
//			vVtCode="2254";
//		}else if(jspName=='OffiCardChangeSend'){
			vVtCode="2222";
//		}
		Ext.Msg.confirm("系统提示","是否将所有已变更数据生成回单并发送？",function(e) {
			if (e == "no") {
				return;
			}
			var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true // 完成后移除
			});
			myMask.show();
			Ext.Ajax.request({
				//OfficialInfoController.java
				url : '/realware/PrChangeSignInfo.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					vtCode : vVtCode
				},
				//提交成功的回调函数
				success : function(response, options) {
					//隐藏加载框
					myMask.hide();
					//成功提示
					Ext.Msg.show({
						title : '成功提示',
						msg : response.responseText,
						buttons : Ext.Msg.OK,
						icon : Ext.MessageBox.INFO
					});
					Ext.getCmp(Ext.getCmp('taskState').getValue()).getStore().load();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					//隐藏加载框
					myMask.hide();
					//失败提示
					Ext.Msg.show({
						title : '失败提示',
						msg : response.responseText,
						buttons : Ext.Msg.OK,
						icon : Ext.MessageBox.ERROR
					});
				}
			});
		});
	},
	
	/**
	  * 重发
	  * @memberOf {TypeName} 
	 */
	resendData : function() {
		var vVtCode="";
		if(jspName=='PrCardChangeSend'){
			vVtCode="2254";
		}else if(jspName=='OffiCardChangeSend'){
			vVtCode="2222";
		}
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.getCmp('taskState').getValue()));
		if (records != null) {
			var ids = []; // 凭证主键字符串
			Ext.Array.each(records, function(model) {
				ids.push(model.get("id"));
			});
			var params = {
				vtCode : vVtCode,
				billIds : Ext.encode(ids)
			};
			Ext.PageUtil.doRequestAjax(me, '/realware/PrChangeResendVoucher.do', params);
		}
	}
});

