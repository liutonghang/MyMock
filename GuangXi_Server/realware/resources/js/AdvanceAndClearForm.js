/**
 * @author liHongbiao
 * @date 2015-05-12
 */
Ext.define("pb.AdvanceAndClearForm",{
	extend:"pb.QueryPanel",
	tbar:[{
		id : 'clear',
		text : '清算',
		iconCls : 'sign',
		scale : 'small',
		handler:function(){
			this.advanceClear();
		}
	},{
		id : 'editAccount',
		text : '账户维护',
		iconCls : 'edit',
		scale : 'small',
		handler:function(){
			this.checkAccountNoEditable();
		}
	},{
		id : 'query',
		text : '明细查询',
		iconCls : 'look',
		scale : 'small',
		handler:function(){
			this.queryDetail();
		}
	},{
		id : 'refresh',
		text : '刷新',
		iconCls : 'refresh',
		scale : 'small',
		handler:function(){
			this.refreshData();
		}
	}],
	constructor:function(options){
		/*
		 options={
		 	 comboAdmdiv:comboAdmdiv
		 }
		 */
		var me = this;
		this.filterCfg = {
			height:65, 
			items:[{
				id : 'taskState',
				fieldLabel : '当前状态',
				xtype : 'combo',
				displayField : 'status_name',
				dataIndex : 'task_status',
				emptyText : '请选择',
				valueField : 'status_code',
				labelWidth : 60,
				value:"001",
				editable : false,
				store:{
					fields : ['status_name', 'status_code'],
					data:[{
						status_name:"未垫款",
						status_code:"001"
					},{
						status_name:"已垫款",
						status_code:"002"
					}]
				},
				listeners : {
					'change' : function(sender,value){
						me.changeState(value);
						me.refreshData();
					}
				}
			}, {
				id : 'admdiv',
				fieldLabel : '所属财政',
				xtype : 'combo',
				dataIndex : 'admdiv_code',
				displayField : 'admdiv_name',
				emptyText : '请选择',
				valueField : 'admdiv_code',
				editable : false,
				labelWidth : 60,
				symbol:"=",
				value:options.comboAdmdiv.getAt(0).get("admdiv_code"),
				store : options.comboAdmdiv,
				listeners:{
					change:function(){
						me.refreshData();
					}
				}
			},{
				id : 'code',
				fieldLabel : '凭证号',
				xtype : 'textfield',
				symbol : '>=',
				labelWidth : 60,
				width : 200,
				dataIndex : 'pay_clear_voucher_code '
			}, {
				id : 'codeEnd',
				fieldLabel : '至',
				xtype : 'textfield',
				labelWidth : 60,
				width : 200,
				symbol : '<=',
				dataIndex : 'pay_clear_voucher_code'
			}]
		};
		
		this.callParent(arguments);
		this.getStore().on("beforeload",function(sender,options){
			beforeload(me.getFilterPanel(), options, Ext.encode(me.gridCfg.fields));
		});
		this.refreshData(); 
	},
	gridCfg:{
		title:"凭证列表",
		fields:["pay_clear_voucher_code", "pay_amount", "advance_amount","agent_account_no",
				"agent_account_name", "agent_bank_name", "clear_account_no",
				"clear_account_name", "clear_bank_name", "fund_type_code",
				"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_code",
				"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
				"bgt_type_name", "task_id", "pay_clear_voucher_id", "bill_type_id",
				"last_ver","is_samebank_clear"],
		header:"凭证号|pay_clear_voucher_code|200,划款金额|pay_amount|100,垫款金额|advance_amount|100,清算方式|is_samebank_clear|100,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
			+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
			+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行名称|pay_bank_name,清算日期|clear_date"
	},
	changeState:function(state){
		if(state=="001"){
			this.setDisabled("clear",false);
		}else{
			this.setDisabled("clear");
		}
	},
	queryDetail:function(){
		this.validSelectOne(function(rec){
			var requestFields=["pay_amount", "pay_date", "adjust_type_code", "adjust_type_name", "payee_account_no", "payee_account_name", "pay_account_no", "pay_account_name", "pay_kind_name", "exp_eco_name"];
			var requestHeader="支付金额|pay_amount|100,支付日期|pay_date|140,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,付款人账号|pay_account_no|140,付款人名称|pay_account_name|140,支出类型名称|pay_kind_name|140,经济分类名称|exp_eco_name|140";
			var requestWin = new Ext.Window({
				title:"明细信息",
				modal:true,
				frame:true,
				width:700,
				height:350,
				layout:"fit",
				listeners:{
					beforerender:function(){
						var requestGrid = getGrid("/realware/loadPayRequest.do", requestHeader, requestFields, true, true,"win");
						requestGrid.getStore().on("beforeload",function(sender,operation ){
							operation.params =operation.params ||{}; 
							operation.params.menu_id = Ext.PageUtil.getMenuId(); 
							operation.params.filedNames = Ext.encode(requestFields);
							operation.params.conditionObj ='[{"operation":"and","attr_code":"pay_clear_voucher_id","relation":"=","value":"'+rec.get("pay_clear_voucher_id")+'","datatype":1}]';
						});
						this.add(requestGrid); 
						requestGrid.getStore().reload();
					}
				}
			}).show();
		});
	},
	advanceClear:function(){
	    var me =this;
		var records = this.validSelects();
		if(records.length!=1 ){
			me.info("请勾选一条数据进行清算！"); 
			return;
		};
		var record = records[0];
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
		//跨行清算
		if (record.get("is_samebank_clear") == "跨行清算") {
			 Ext.Msg.show({
			     title:'确认',
			     msg: '确定要清算吗？',
			     buttons: Ext.Msg.OKCANCEL,
			     icon: Ext.Msg.QUESTION,
			     fn : function(buttonId, text) {
			    	 if(buttonId == 'ok') {
			 			var reqIds = [];
			 		    var reqVers=[];
			 		    reqIds.push(record.get("pay_clear_voucher_id"));
			 	    	reqVers.push(record.get("last_ver"));
			 	    	 myMask.show();
			 	 	    Ext.Ajax.request({
			 	 	        method: 'POST',
			 	 			timeout:180000,  //设置为3分钟
			 	 	        url: "/realware/transAdvanceToZeroClear.do",
			 	 	        params: {
			 	 	            // 单据类型id
			 					billTypeId: record.get("bill_type_id"),
			 					billIds: Ext.encode(reqIds),
			 			        last_vers: Ext.encode(reqVers),
			 			        advance_amount : record.get("pay_amount"),
			 					menu_id :  Ext.PageUtil.getMenuId()
			 	 	        },
			 	 	        success : function(response, options) {
			 	 	        	myMask.hide();
			 	 	        	me.alert("清算成功！"); 
			 	 				me.refreshData(); 
			 	 			},
			 	 			failure : function(response, options) {
			 	 				myMask.hide();
			 	 				me.alert(response.responseText); 
			 	 			}
			 	 	    });
			    	 }
			     }
			});
	 	    return;
		}
		
		//同行清算
		if (record.get("is_samebank_clear") == "同行清算") {
			Ext.Ajax.request({
				url:"/realware/loadAccount.do",
				type:"json",
				params:{
					accountType:"29",
					start:0,
					limit:1,
					page:1,
					filedNames:"['account_no','account_name','account_id']",
					menu_id : Ext.PageUtil.getMenuId()
				},
				success:function(response,options){
					var result = Ext.decode(response.responseText);
					if(result.root.length == 0){
						Ext.Msg.alert("系统提示","请先进行账户维护！");
						return;
					}
					var data = result.root[0];
					var voucherWin = new Ext.Window({
						modal:true,
						width:350,
						height:220,
						title:"金额确认",
						layout:"fit",
						resizable:false,
						items:[{
							xtype:"form",
							bodyStyle:'padding:15px 5px 0 15px',
							items:[{
								xtype:"textfield",
								fieldLabel:"付款银行账号",
								name:"clear_account_no",
								width:300,
								readOnly:true,
								disabled:true,
								value : data.account_no
							},{
								xtype:"textfield",
								fieldLabel:"付款银行账户名称",
								name:"clear_account_name",
								width:300,
								readOnly:true,
								disabled:true,
								value : data.account_name
							},{
								xtype:"textfield",
								fieldLabel:"收款银行账号",
								name:"agent_account_no",
								width:300,
								readOnly:true,
								disabled:true,
								value : record.get("agent_account_no")
							},{
								xtype:"textfield",
								fieldLabel:"收款银行账户名称",
								name:"agent_account_name",
								width:300,
								readOnly:true,
								disabled:true,
								value : record.get("agent_account_name")
							},{
								id : "amount",
								xtype:"textfield",
								fieldLabel:"垫款金额(可设置)",
								name:"advance_amount",
								width:300,
								value : record.get("pay_amount")
							}]				
						}],
						bbar:new Ext.Toolbar({
							items:[
							    "->",{
								text:"清算",
								iconCls:"save",
								handler:function(){
									myMask.show();
									var advance_amount = Ext.getCmp("amount").getValue();
									var reqIds = [];
								    var reqVers=[];
								    reqIds.push(record.get("pay_clear_voucher_id"));
							    	reqVers.push(record.get("last_ver"));
									Ext.Ajax.request({
										method: 'POST',
										timeout:180000,  //设置为3分钟
										url: "/realware/transAdvanceToZeroClear.do",
										params: {
											// 单据类型id
											billTypeId: record.get("bill_type_id"),
											billIds: Ext.encode(reqIds),
									        last_vers: Ext.encode(reqVers),
											menu_id :  Ext.PageUtil.getMenuId(),
											advance_amount : advance_amount
										},
										success : function(response, options) {
											myMask.hide();
											voucherWin.close();
											me.alert("清算成功！"); 
											me.refreshData(); 
										},
										failure : function(response, options) {
											myMask.hide();
											me.alert(response.responseText); 
										}
									});	
								}
							},{
								text:"取消",
								iconCls:"close",
								handler:function(){
									 this.up('window').close();
								}
							}]
						})
					}).show();
					
				},
				failure:function(response,options){
					me.alert(response.responseText);
				}
			});
		}
	},
	checkAccountNoEditable:function(){
		var me = this;
		Ext.Ajax.request({
			url:"/realware/loadClearPayVoucher.do",
			method: 'POST',
			params:{
				start:0,
				limit:1,
				page:1,
				jsonMap:'[{"task_status":["=","002"]}]',
			    filedNames:'["pay_clear_voucher_code"]',
			    menu_id :  Ext.PageUtil.getMenuId()
			},
	        success : function(response, options) {
	        	var a = response.responseText;
	        	var result = Ext.decode(a);
	        	me.editAccount(result.pageCount>0);
			},
			failure : function(response, options) {
				me.alert("修改账户信息失败:"+response.responseText);
			}
		});
	},
	editAccount:function(accountNoEditable){
		var me =this;
		var accountWin = new Ext.Window({
			modal:true,
			width:400,
			height:160,
			title:"垫款户信息",
			layout:"fit",
			resizable:false,
			items:[{
				xtype:"form",
				bodyStyle:'padding:15px 5px 0 15px',
				items:[{
					xtype:"textfield",
					name:"account_id",
					hidden:true
				},{
					xtype:"textfield",
					fieldLabel:"账户名称",
					name:"account_name",
					disabled:accountNoEditable,
					width:300,
					allowBlank:false,
					regex: /^([\w-_()（）\u4e00-\u9fa5]{1,60})$/
				},{
					xtype:"textfield",
					fieldLabel:"账号",
					width:300,
					name:"account_no",
					allowBlank:false, 
					disabled:accountNoEditable,
					regex:/^[\d]{1,30}$/
				},{
					xtype:"textfield",
					fieldLabel:"区划",
					width:300,
					name:"admdiv_code",
					value:comboAdmdiv.data.length > 0? comboAdmdiv.data.getAt(0).get("admdiv_code"): "",
					hidden:true
				},{
					xtype:"label",
					html:"<font color='red'>　　　*垫款账户已经垫款但没有返还不能修改</font>",
					hidden:!accountNoEditable
				}]				
			}],
			listeners:{
				beforerender:function(sender){
					this.loadAccount();
				}
			},
			bbar:new Ext.Toolbar({
				items:[
				    "->",{
					text:"保存",
					iconCls:"save",
					disabled:accountNoEditable,
					handler:function(){
						accountWin.saveAccount();
					}
				},{
					text:"取消",
					iconCls:"close",
					handler:function(){
						accountWin.close();
					}
				}]
			}),
			loadAccount:function(){
				this.getAccount(function(data){
					accountWin.down("form").getForm().setValues(data);
				});
			},
			getAccount:function(fAfter){
				var jsonStr = [];
				jsonStr[0] = "=";
				jsonStr[1] = comboAdmdiv.data.getAt(0).get("admdiv_code");
				Ext.Ajax.request({
					url:"/realware/loadAccount.do",
					type:"json",
					params:{
						accountType:"29",
						jsonMap:"[{\"admdiv_code\":" + Ext.encode(jsonStr)+"}]",
						start:0,
						limit:1,
						page:1,
						filedNames:"['account_no','account_name','account_id']",
						menu_id : Ext.PageUtil.getMenuId()
					},
					success:function(response,options){
						var result = Ext.decode(response.responseText);
						var data = result.root[0];
						if(data ){
							fAfter(data);
						}
					},
					failure:function(response,options){
						me.alert(response.responseText);
					}
				});
			},
			saveAccount:function(){
				var win = this;
				this.down("form").getForm().submit({
					url:"/realware/saveOneAdvanceAccount.do",
					success:function(form, action){
						me.info("保存垫款户信息成功"); 
						win.close();
					},
					failure:function(form, action){
						me.alert(action.response.responseText); 
					}
				});
			}
		}).show();
	},
	doClear:function(config){
		var me =this;
		var records = this.validSelects();
		if(!records ){
			return;
		};
		var reqIds = [];
	    var reqVers=[];
	    Ext.Array.each(records,function(model){
	    	 reqIds.push(model.get("pay_clear_voucher_id"));
	    	 reqVers.push(model.get("last_ver"));
	    });
	    var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true 
		});
	    myMask.show();
	    Ext.Ajax.request({
	        method: 'POST',
			timeout:180000, 
	        url: config.url,
	        params: {
	            billTypeId: records[0].get("bill_type_id"),
	            billIds: Ext.encode(reqIds),
	            last_vers: Ext.encode(reqVers),
	            menu_id :  Ext.PageUtil.getMenuId()
	        },
	        success : function(response, options) {
	        	myMask.hide();
				me.refreshData(); 
				if(typeof options.success==="function"){
					config.success(response, options);
				}
			},
			failure : function(response, options) {
				myMask.hide();
				me.alert(response.responseText); 
				if(typeof options.failure==="function"){
					config.failure(response, options); 
				} 
			}
	    });
	}
});
