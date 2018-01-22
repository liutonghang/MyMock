/*******************************************************************************
 * 公务卡变更
 * 
 * @memberOf {TypeName}
 */
Ext.define('pb.controller.pay.OfficialInfoChangeController', {
	extend : 'Ext.app.Controller',
	// 数据集列表：
	stores : ['pay.PrChangeRightStore'],
	// 对象模型 pay.PayVoucher 支付凭证
	models : ['pay.PrChangeRightModel'],
	// 当创建一个控件的时候需要在此引入
	requires : ['pb.view.pay.OfficialInfoChangeList','pb.view.pay.OfficialInfoChangePanel'
			   ,'pb.view.pay.OfficialInfoChangeView','pb.view.pay.OffiChangeWindow'
			   ,'pb.view.pay.PrAgencyWindow','pb.view.pay.PrStatusWindow'],
	// 创建后获取当前控件，应用于当前控制层
	refs : [{
				ref : 'query', // 当前查询区
				selector : 'officialInfoChangeView'// 控件的别名
			}, {
				ref : 'view', // 当前按钮区
				selector : 'officialInfoChangeList' // 控件的别名
			}, {
				ref : 'panel', // 当前按钮区
				selector : 'officialInfoChangePanel' // 控件的别名
			}, {
				ref : 'offiChangeWindow', // 卡号变更
				selector : 'offiChangeWindow' // 控件的别名
			}, {
				ref : 'prStatusWindow', // 卡状态变更
				selector : 'prStatusWindow' // 控件的别名
			}, {
				ref : 'prAgencyWindow', // 单位变更
				selector : 'prAgencyWindow' // 控件的别名
			}],
			onLaunch : function() {
				// 当前控制层
				var me = this;
				// 刷新数据前事件
				var queryView = Ext.ComponentQuery.query("panel[title='查询区']")[0];
				me.getStore('pay.PrChangeRightStore').on('beforeload', function(thiz, options) {
							// 查询区
								if (isExistStatus) {
									// 当前状态控件
								var taskState = Ext.getCmp('taskState');
								// 当前状态对应的查询条件
								var condition = taskState.valueModels[0].raw.conditions;
								// 查询条件拼装至后台
								Ext.PageUtil.onBeforeLoad(condition,queryView,me.getModel('pay.PrChangeRightModel'),options);
							} else {
								Ext.PageUtil.onBeforeLoad(null,queryView,me.getModel('pay.PrChangeRightModel'),options);
							}
						});
				var panel = Ext.ComponentQuery.query('viewport > panel')[0];
				if (!isExistStatus) {
					Ext.PageUtil.onInitList(panel,'pay.PrChangeRightStore');
					if (initialLoad) {
						me.getStore('pay.PrChangeRightStore').load();
					}
				} else {
					/**
					 * 初始化切换列表使用的store
					 */
					Ext.PageUtil.onInitPage(panel, _menu.statusList,'pay.PrChangeRightStore');
					/**
					 * 初始化页面
					 */
					Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"),
							Ext.getCmp("taskState"), true);
					Ext.getCmp("taskState").setValue(
							_menu.statusList[0].status_code);
				}

			},
	isExistStatus : true, // 是否有状态
	// 初始化
	init : function() {
		// 事件的定义
		this.control({
			//查询区 
			'officialInfoChangeView combo[id=taskState]' : {
				//状态选中
				change : function(combo, newValue, oldValue, eOpts) {
					try {
						this.selectState(combo.valueModels[0].raw.status_code);
					} catch(e) {}
				}
			},
			// **********顶部按钮绑定事件*******************
			// 查询按钮
			'officialInfoChangeList button[id=refresh]' : {
				click : this.refreshData
			},
			//录入公务卡信息
			'officialInfoChangeList button[id=input]' : {
				click : this.input
			},
			//导入公务卡信息
			'officialInfoChangeList button[id=import]' : {
				click : this.importCard
			},
			//删除公务卡信息
			'officialInfoChangeList button[id=delete]' : {
				click : this.del
			},
			//卡号变更
			'officialInfoChangeList button[id=cardNoChange]' : {
				click : this.cardNoChange
			},
			//卡状态变更
			'officialInfoChangeList button[id=statusChange]' : {
				click : this.statusChange
			},
			//单位变更
			'officialInfoChangeList button[id=agencyChange]' : {
				click : this.agencyChange
			},
			//打印
			'officialInfoChangeList button[id=print]' : {
				click : this.printData
			},
			//卡号变更确认
			'offiChangeWindow button[id=parentSave]' : {
				click : this.cardNoSave
			},
			//卡号变更取消
			'offiChangeWindow button[id=parentClose]' : {
				click : function(){
					this.getOffiChangeWindow().close();
				}
			},
			//卡状态变更确认
			'prStatusWindow button[id=parentSave]' : {
				click : this.statusSave
			},
			//卡状态变更取消
			'prStatusWindow button[id=statusClose]' : {
				click : function(){
					this.getPrStatusWindow().close();
				}
			},
			//单位变更确认
			'prAgencyWindow button[id=parentSave]' : {
				click : this.agencySave
			},
			//单位变更取消
			'prAgencyWindow button[id=agencyClose]' : {
				click : function(){
					this.getPrAgencyWindow().close();
				}
			}
		});
	},
	
	/**
	  * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
	  * @param {Object} status_code  状态code
	*/
	selectState : function(status_code) {
		if(status_code == '001'){
			Ext.StatusUtil.batchEnable("input,cardNoChange,statusChange,agencyChange,import,delete");
		}else if(status_code == '002'){
			Ext.StatusUtil.batchDisable("input,cardNoChange,statusChange,agencyChange,import,delete");
		}else if(status_code == '003'){
			Ext.StatusUtil.batchDisable("input,cardNoChange,statusChange,agencyChange,import,delete");
		}
		Ext.getCmp(Ext.getCmp('taskState').getValue()).getStore().loadPage(1);
	},	
	
	//录入公务卡
	input : function(){
		var me = this;
		var inputWindow = Ext.widget('window', {
			title : '公务卡信息录入界面',
			width : 350,
			autoHeight:true,
			layout : 'fit',
			resizable : false,
			modal : true,
			items : [{ 
			          id : 'gwkForm',
			          xtype : 'form',
			          bodyStyle:'padding:5px 5px 0 5px',
			  		  defaultType: 'textfield',
			  		  frame : false,
			  		  defaults : {
			  			allowBlank : false,
			  			allowOnlyWhitespace : false 
			  		  },
			  		  items : [
			  		           	{
			  		           		id: 'CardHolder',
			  		           		name : 'CardHolder',
			  		           		fieldLabel: '持卡人姓名'
			  		           	}, {
			  		           		id: 'CardHolderRank',
			  		           		name : 'CardHolderRank',
			  		           		fieldLabel: '持卡人职级'
			  		           	}, {
			  		           		id: 'CardHolderNo',
			  		           		name : 'CardHolderNo',
			  		           		fieldLabel: '身份证号码',
			  		           		maxLength:18,
			  		           		enforceMaxLength:true,
			  		           		regex : /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
			  		           		regexText: "格式错误：15位号码应全为数字，18位号码末位可以为数字或X"
			  		           	},{
			  		           		id : 'AgencyCode',
			  		           		name : 'AgencyCode',
			  		           		fieldLabel: '预算单位编码'
			  		           	},{
			  		           		id : 'AgencyName',
			  		           		name : 'AgencyName',
			  		           		fieldLabel: '预算单位名称'
			  		           	},{
			  		           		id : 'CardNo',
			  		           		name : 'CardNo',
			  		           		fieldLabel: '公务卡卡号'
			  		           	},{
			  		           		id : 'CardType',
			  		           		name : 'CardType',
			  		           		fieldLabel: '公务卡类型',
			  		           		xtype : 'combo',
			  		           		dataIndex : 'value',
			  		           		displayField : 'name',
			  		           		emptyText : '请选择',
			  		           		editable : false,
			  		           		valueField : 'value',
			  		           		allowBlank : false,
			  		           		store : Ext.create('Ext.data.Store', {
			  		           			fields : ['name', 'value'],
			  		           			data : [{
			  		           						"name" : "个人卡",
			  		           						"value" : "1"
			  		           					}, {
			  		           						"name" : "单位卡",
			  		           						"value" : "2"
			  		           					}]
			  		           		})
			  		           	},{
			  		           		id : 'CardBankCode',
			  		           		name : 'CardBankCode',
			  		           		fieldLabel: '发卡行编码'
			  		           	},{
			  		           		id : 'CardBankName',
			  		           		name : 'CardBankName',
			  		           		fieldLabel: '发卡行名称'
			  		           	},{
			  		           		id : 'CardBeginDate',
			  		           		name : 'CardBeginDate',
			  		           		xtype : 'datefield',
			  		           		fieldLabel : '开卡日期',
			  		           		format : 'Y-m-d',
			  		           		value : new Date()
			  		           	},{
			  		           		id : 'CardEndDate',
			  		           		name : 'CardEndDate',
			  		           		xtype : 'datefield',
			  		           		fieldLabel : '停用日期',
			  		           		format : 'Y-m-d'
			  		           	}
							]}],
			  		         buttons : [{
			 					text : '确定',
			 					handler : function() {
			 					var win = this.up('window');
			 					var form = win.down("form");
			 					if(!form.getForm().isValid()) {
			 						var fields = Ext.ComponentQuery.query("textfield", form);
				 					var flag = false;
				 					Ext.each(fields, function(field) {
				 						if(field.isValid()) {
					 						return true;
					 					}
				 						if(Ext.isEmpty(field.getValue())
				 								|| Ext.isEmpty(Ext.String.trim(field.getValue()))) {
				 							Ext.Msg.alert('系统提示',  field.fieldLabel + '不能为空！');
				 							return false;
				 						} else {
				 							if(!Ext.isEmpty(field.regex)) {
				 								Ext.Msg.alert('系统提示',  field.fieldLabel + field.regexText);
				 								return false;
				 							}
				 						}
				 					});
				 					return ;
			 					}
			 					var params = form.getForm().getValues();
			 					params.admdiv_code = Ext.getCmp('admdivCode').getValue();
			 					params.CardBeginDate = Ext.getCmp("CardBeginDate").getRawValue().replace(/-/gi, "");
			 					params.CardEndDate = Ext.getCmp("CardEndDate").getRawValue().replace(/-/gi, "");
		 						var myMask = new Ext.LoadMask(Ext.getBody(), {
		 							msg : '后台正在处理中，请稍后....',
		 							removeMask : true
		 								// 完成后移除
		 							});
		 						myMask.show();
		 						// 提交到服务器操作
		 						Ext.Ajax.request({
		 									url : '/realware/addofficialCard.do',
		 									method : 'POST',
		 									timeout : 180000, // 设置为3分钟
		 									params : params,
		 									// 提交成功的回调函数
		 									success : function(response, options) {
		 										Ext.PageUtil.succAjax(response, myMask);
		 										form.getForm().reset();
		 										inputWindow.close();		
		 										me.refreshData();
		 									},
		 									// 提交失败的回调函数
		 									failure : function(response, options) {
		 										Ext.PageUtil.failAjax(response, myMask);
		 									}
		 								});
			 					}
			 				}, {
			 					text : '取消',
			 					handler : function() {
			 						this.up('window').close();
			 					}
			 				}]
		}).show();
		
	},
	
	
	//导入
	importCard : function(){
		var me = this;
		//这里是把该功能定义了一个控件调用的时候直接创建控件调用init方法show就完成了控件的显示
		var admdivCode = Ext.getCmp('admdivCode').getValue()
		var importwindow = Ext.create('pb.view.common.ImportFileWindow');
		importwindow.init("/realware/importCardInfo.do",me,'xls');
		importwindow.show();
	},
	
	//删除
	del : function(){
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(Ext.isEmpty(records)){
			Ext.Msg.alert('系统提示','请选择需要删除的信息！');
			return;
		}
		var reqIds = [];
		for(var i = 0 ; i < records.length ; i ++){
			reqIds.push(records[i].get("card_info_id"));
		}
		Ext.Msg.confirm("系统提示","确定要删除选中的公务卡信息？",function(e) {
			if (e == "yes") {
				var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
						// 完成后移除
					});
				myMask.show();
				// 提交到服务器操作
				Ext.Ajax.request({
							url : '/realware/delOfficialCard.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								billIds : Ext.encode(reqIds)
							},
							// 提交成功的回调函数
							success : function(response, options) {
								Ext.PageUtil.succAjax(response, myMask);		
								me.refreshData();
							},
							// 提交失败的回调函数
							failure : function(response, options) {
								Ext.PageUtil.failAjax(response, myMask);
							}
						});
			}
		});
	},
	//刷新       
	refreshData : function() {
		this.getStore('pay.PrChangeRightStore').loadPage(1);
	},
	
	//卡号变更
	cardNoChange : function() {
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records!=null){
			if(records.length == 0){
				Ext.Msg.alert('系统提示','请选择需要修改的信息！');
				return;
			}else if(records.length!=1){
				Ext.Msg.alert('系统提示','只可选择一条公务卡明细进行变更，请重选！');
			}else{
				Ext.create('pb.view.pay.OffiChangeWindow').show();
				this.setValues(records[0],'cardNoChange');
			}
		}
	},
	
	//卡状态变更
	statusChange : function() {
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records!=null){
			if(records.length == 0){
				Ext.Msg.alert('系统提示','请选择需要修改的信息！');
				return;
			}
			if(records.length!=1){
				Ext.Msg.alert('系统提示','只可选择一条公务卡明细进行变更，请重选！');
				return;
			}
			Ext.create('pb.view.pay.PrStatusWindow').show();
			this.setValues(records[0],'statusChange');
		}
	},
	
	//单位变更
	agencyChange : function() {
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records!=null){
			if(records.length == 0){
				Ext.Msg.alert('系统提示','请选择需要修改的信息！');
				return;
			}
			if(records.length!=1){
				Ext.Msg.alert('系统提示','只可选择一条公务卡明细进行变更，请重选！');
			}else{
				Ext.create('pb.view.pay.PrAgencyWindow').show();
				this.setValues(records[0],'agencyChange');
			}
		}
	},
	
	//卡号变更保存
	cardNoSave : function() {
		var me = this;
		var w = this.getOffiChangeWindow();
		//获取单笔开卡的表单
		var form = w.getForm();	
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		var vCardNo=Ext.ComponentQuery.query('textfield[id=card_no]',w)[0].getValue();
		var vAffirmCardNo=Ext.ComponentQuery.query('textfield[id=affirm_card_no]',w)[0].getValue();
		var vOldCardNo=records[0].get("card_no");
		if(!vCardNo||!vAffirmCardNo){
			Ext.Msg.alert('系统提示','请输入卡号和确认卡号！');
		}else if(vCardNo!=vAffirmCardNo){
			Ext.Msg.alert('系统提示','两次输入结果不一致，请确认！');
		}
//		else if(isNaN(vCardNo)||isNaN(vAffirmCardNo)){
//			Ext.Msg.alert('系统提示','卡号必须为纯数字！');
//		}
		else if(vOldCardNo==vAffirmCardNo){
			Ext.Msg.alert('系统提示','卡号需与原卡号不同，请确认！');
		}else{
			// 凭证主键字符串
			var ids = []; // 凭证主键字符串
			Ext.Array.each(records, function(model) {
				ids.push(model.get("id"));
			});
			var params = {
				billIds : Ext.encode(ids),
				flag : "CardNo",
				vou : vAffirmCardNo
			};
			Ext.PageUtil.doRequestAjax(this, '/realware/OfficialChange.do', params);
			form.reset();
			w.close();
			me.refreshData();
		}
	},
	
	//卡状态变更保存
	statusSave : function() {
		var w = this.getPrStatusWindow();
		//获取窗口的表单
		var form = w.getForm();	
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		var vCardStatus=Ext.ComponentQuery.query('combo[id=card_status]',w)[0].getValue();
		var vAffirmCardStatus=Ext.ComponentQuery.query('combo[id=affirm_card_status]',w)[0].getValue();
		if(!vCardStatus||!vAffirmCardStatus){
			Ext.Msg.alert('系统提示','请选择卡状态和确认卡状态！');
		}else if(vCardStatus!=vAffirmCardStatus){
			Ext.Msg.alert('系统提示','两次选择结果不一致，请确认！');
			
		}else if(vAffirmCardStatus == records[0].get('card_status')){
			Ext.Msg.alert('系统提示','更新状态和原状态一致，请确认！');
		}else{
			// 凭证主键字符串
			var ids = []; // 凭证主键字符串
			Ext.Array.each(records, function(model) {
				ids.push(model.get("id"));
			});
			var params = {
				billIds : Ext.encode(ids),
				flag : "status",
				vou : vAffirmCardStatus
			};
			Ext.PageUtil.doRequestAjax(this, '/realware/OfficialChange.do', params);
			form.reset();
			w.close();
			Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()).getStore().removeAll();
			Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()).getStore().loadPage(1);
		}
	},
	
	//单位变更保存
	agencySave : function() {
		var w = this.getPrAgencyWindow();
		//获取窗口的表单
		var form = w.getForm();	
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		var vAgencyCode=Ext.ComponentQuery.query('textfield[id=pr_agency_code]',w)[0].getValue();
		var vAgencyName=Ext.ComponentQuery.query('textfield[id=pr_agency_name]',w)[0].getValue();
		var vAffirmAgencyCode=Ext.ComponentQuery.query('textfield[id=affirm_agency_code]',w)[0].getValue();
		var vAffirmAgencyName=Ext.ComponentQuery.query('textfield[id=affirm_agency_name]',w)[0].getValue();
		if(!vAgencyCode||!vAgencyName||!vAffirmAgencyCode||!vAffirmAgencyName){
			Ext.Msg.alert('系统提示','请输入单位信息并确认输入！');
		}else if(vAgencyCode!=vAffirmAgencyCode||vAgencyName!=vAffirmAgencyName){
			Ext.Msg.alert('系统提示','两次输入结果不一致，请确认！');
		}else{
			// 凭证主键字符串
			var ids = []; // 凭证主键字符串
			Ext.Array.each(records, function(model) {
				ids.push(model.get("id"));
			});
			var params = {
				billIds : Ext.encode(ids),
				flag : "agencySave",
				vou : vAffirmAgencyCode,
				vou1 : vAffirmAgencyName
			};
			Ext.PageUtil.doRequestAjax(this, '/realware/OfficialChange.do', params);
			form.reset();
			w.close();
//			this.getStore('pay.PrChangeRightStore').removeAll();
			Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()).getStore().loadPage(1);
		}
	},
	
	//打印
	printData : function() {
		
	},
	setValues : function(record,funName){
		if(funName == 'cardNoChange'){
			Ext.getCmp("OriCardNo").setValue(record.get('card_no'));
		}else if(funName == 'statusChange'){
			if(record.get('card_status') == 1){
				Ext.getCmp("OriStatus").setValue("正常");
			}else if(record.get('card_status') == 2){
				Ext.getCmp("OriStatus").setValue("停用");
			}else if(record.get('card_status') == 3){
				Ext.getCmp("OriStatus").setValue("注销");
			}
			Ext.getCmp("CardNo").setValue(record.get('card_no'));
		}else if(funName == 'agencyChange'){
			Ext.getCmp("CardNo").setValue(record.get('card_no'));
		}
		Ext.getCmp("AgencyCode").setValue(record.get('agency_code'));
		Ext.getCmp("AgencyName").setValue(record.get('agency_name'));
		Ext.getCmp("CardHolder").setValue(record.get('card_holder'));
		Ext.getCmp("CardHolderNo").setValue(record.get('card_holder_no'));
		if(record.get('card_type')==1){
			Ext.getCmp("CardType").setValue("个人卡");
		}else if(record.get('card_type')==2){
			Ext.getCmp("CardType").setValue("公用卡");
		}
	}
});