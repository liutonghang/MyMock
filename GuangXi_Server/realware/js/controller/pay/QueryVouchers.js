/***
 * 支付凭证查询界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.QueryVouchers', {
	extend : 'Ext.app.Controller',
	stores : [ 'pay.PayVouchers','pay.BankSetMode','pay.VoucherStatus'],
	models : [ 'pay.PayVoucher' ],
	//当创建一个控件的时候需要在此引入
	requires : [ 'pb.view.pay.QueryVoucherList'],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
		ref : 'list', //当前控制层引用
		selector : 'queryVoucherList' // 控件的别名
	} ],
	oneSelect : true,
	//事件的定义
	init : function() {
		this.control( {
			//查询区 
				'queryVoucherList combo[id=taskStateCash]' : {
					//状态选中
					select : function(combo, records, eOpts) {
						this.selectState(records[0].get('status_code_cash'));
						var grid = Ext.ComponentQuery.query("viewport > panel:first > gridpanel")[0];
						if(grid) {
							var _store = grid.getStore();
							_store.removeAll();
						}
					}
				},
				'queryVoucherList combo[id=taskState]' : {
					//状态选中
					change : function(combo, newValue, oldValue, eOpts) {
						try {
							this.selectState(combo.valueModels[0].raw.status_code);
						} catch(e) {}
					}
				},
				'queryVoucherList combo[id=admdivCode]' : {
					select: this.refreshData
				},
				//发送
				'queryVoucherList button[id=againSend]' : {
					click : this.sendVoucher
				},
				'queryVoucherList button[id=look]' : {
					click : this.lookVoucher
				},
				'queryVoucherList button[id=log]' : {
					click : this.logVoucher
				},
				'queryVoucherList button[id=refresh]' : {
					click : this.refreshData
				},
				//预至列表视图
				'queryVoucherList button[id=view1]' : {
					click : function(o) {
						var grid = Ext.ComponentQuery.query('gridpanel',this.getList())[0]; 
						Ext.PageUtil.onAddColumns(grid,this.getList().xtype);
					}
				}
			})
	},
	onLaunch: function() {
		
	},
	/***
	 * 凭证状态切换(签收失败活着对方已退回方可显示发送按钮)
	 * @param {Object} combo
	 * @param {Object} records
	 * @param {Object} eOpts
	 */
	selectState : function(status_code) {
		Ext.StatusUtil.batchDisable("back");
		Ext.StatusUtil.batchEnable("look");
		//未发送|未支付001、009 
		if(status_code=='009'||status_code=='001'){
			//Ext.StatusUtil.batchEnable("againSend");
			Ext.StatusUtil.batchDisable("taskStateCash,againSend,look");
			if(Ext.getCmp('taskStateCash')){
				Ext.getCmp('taskStateCash').setValue('');
			}
			if(status_code == '001'){
				Ext.StatusUtil.batchEnable("back,look");
			}
		//接收、签收失败，对方已退回发送按钮可用
		}else if(status_code=='4'||status_code=='5' ||status_code=='2' || status_code=='0'){
			Ext.StatusUtil.batchEnable("taskStateCash,againSend");
		//接收、签收失败，对方已退回007、006、004(直接、授权支付查询)，接收、签收失败，对方已退回8、10、11 
		}else if(status_code=='007'||status_code== '006'||status_code== '004'||status_code== '002'
			||status_code== '8'||status_code== '10'||status_code== '11'){
			Ext.StatusUtil.batchEnable("againSend");
		//其他状态
		}else{
			Ext.StatusUtil.batchDisable("againSend");
			Ext.StatusUtil.batchEnable("taskStateCash");
			
		}
	},
	/***
	 * 发送
	 */
	sendVoucher : function() {
		var me = this;
		var records = null;
		if (Ext.getCmp('taskState').hidden) {
			records = Ext.PageUtil.validSelect(Ext.ComponentQuery.query('gridpanel', me.getList())[0]);	
		}else{
			records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		}
		if(records !=null) {
			if (records.length > 1) {//授权支付包括8202和8209，目前不支持同时发不同类型的凭证
				Ext.Msg.alert("系统提示", "只支持单笔签章发送！");
				return;
			}
			var ids = []; // 凭证主键字符串
			var lastVers = []; // 凭证lastVer字符串
			Ext.Array.each(records, function(model) {
					ids.push(model.get("pay_voucher_id"));
					lastVers.push(model.get("last_ver"));
			});
			var params = {
				billTypeId : records[0].get("bill_type_id"),
				billIds : Ext.encode(ids),
				last_vers : Ext.encode(lastVers)
			};
			/**
			 * 这里我对以前的逻辑做了一些调整：
			 *   1）说明：以前是将现金和非现金放在了一起，但是没有将状态分开，比如非现金的状态是004，但是现金的状态也可能是004，这样在现金业务中
			 *         使用该js的时候就会出现非现金和现金的状态都会出现而且都是004，这样两个ajax都会发出请求
			 *   2）所有我在原有的逻辑中加入了一些判断，用来区分非现金和现金
			 *      （1）将数据库中页面为"PACashPayVoucherQueryForm"的两个状态码由原来的"001"和"004"改为"020"和"030"
			 *          即：未支付和已支付分别对应"020"和"030"
			 *   3）在非现金用到该js的时候Ext.getCmp("taskStateCash")为undefined这样在非现金用到该js的时候，就会走到else里
			 *     而在现金和非现金的页面中引用该js的时候'Ext.getCmp("taskStateCash")'和'Ext.getCmp("taskState")'都不是
			 *     undefined，这样通过我如下的区分现金与非现金的方式，就可以让非现金和现金都引用该js
			 */
			//区分现金和退款通知书字段
//			var taskStatus = Ext.getCmp('taskState').getValue();
			if(Ext.getCmp("taskStateCash")){
				var taskStateCash = Ext.getCmp('taskStateCash').lastSelection[0].get('status_code_cash');
				if(taskStateCash=='8' || taskStateCash=='2'){
					Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucher.do',params);
				}else{
					Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucherAgain.do',params);
				}
				
			}else{
				var taskState = Ext.getCmp("taskState").lastSelection[0].get('status_code');
				if( "004" == taskState || "002" == taskState){
					Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucher.do',params);
				}else{
					Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucherAgain.do',params);
				}
			}
//			if(Ext.getCmp("taskStateCash") != undefined && taskStatus=='002' ){//如果是现金
//				var taskStateCash = Ext.getCmp('taskStateCash').lastSelection[0].get('status_code_cash')//Ext.getCmp(Ext.getCmp('taskStateCash').getValue());
//				if((taskState!= undefined && taskState=='030')||(taskStateCash!= undefined && taskStateCash=='8')){
//					Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucher.do',params);
//				}else{
//					if((taskState!= undefined && taskState=='030') && (taskStateCash!= undefined && (taskStateCash=='10' || taskStateCash=='11')))
//					Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucherAgain.do',params);
//				}
//			}else{ //如果不是现金
//				var taskState = Ext.getCmp("taskState").lastSelection[0].get('status_code')
//				if(taskState != undefined && Ext.getCmp('taskStateCash') == undefined && ("004" == taskState || Ext.getCmp('taskStateCash').getValue()=='2' )){
//					Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucher.do',params);
//				}else{
//					Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucherAgain.do',params);
//				}
//			}
		}
	},
	/***
	 * 凭证查看
	 */
	lookVoucher : function() {
		var me = this;
		var records = null;
		if (Ext.getCmp('taskState').hidden) {
			records = Ext.PageUtil.validSelect(Ext.ComponentQuery.query('gridpanel', me.getList())[0]);	
		}else{
			records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		}
		if (records != null) {
			var maps = Ext.create('Ext.util.HashMap');
			maps.add('pay_voucher_code', '凭证号');
			maps.add('pay_amount', '金额');
			var store = Ext.create('Ext.data.Store', {
				model : me.getModel('pay.PayVoucher'),
				data : records
			});
			var lookocxwindow = Ext.create('pb.view.common.LookOCXWindow', {
				colMaps : maps,
				listStore : store,
				width : me.getList().getWidth() - 30,
				height : me.getList().getHeight() - 30
			});
			//加入左边点击凭证号触发显示凭证的事件（控件在创建后-在显示之前加入该事件）
			Ext.ComponentQuery.query('gridpanel', lookocxwindow)[0].on(
					'selectionchange', function(view, selected, e) {
						Ext.OCXUtil.doOCX(selected[0].get('pay_voucher_id'),selected[0].get('bill_type_id'));
					});
			Ext.OCXUtil.doOCX(records[0].get('pay_voucher_id'), records[0].get('bill_type_id'));
			lookocxwindow.show();
		}
	},
	/***
	 * 操作日志
	 */
	logVoucher : function() {
		var me = this;
		var records = null;
		if (Ext.getCmp('taskState').hidden) {
			records = Ext.PageUtil.validSelect(Ext.ComponentQuery.query('gridpanel', me.getList())[0],1);	

		}else{
			records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
		}
		// 数据项
		var logFileds = [ "nodeName", "taskUserName", "taskOpinion",
				"taskRemark", "start_date", "end_date", "taskId" ];
		//数据集
		var logstore = this.getStore('common.TaskLog');
		if (records != null) {
			logstore.load( {
				params : {
					rowid : records[0].get("pay_voucher_id"),
					task_id : records[0].get("task_id"),
					filedNames : Ext.encode(logFileds)
				}
			});
			//显示列
			var maps = Ext.create('Ext.util.HashMap');
			maps.add('nodeName', '岗位名称');
			maps.add('taskOpinion', '操作类型');
			maps.add('taskUserName', '操作用户');
			maps.add('end_date', '审核日期');
			maps.add('taskRemark', '意见');
			//此处调用的是一个公用的selectWindow这个方法 saveHidden:true,closeHidden:true设置确定、取消按钮不显示
			Ext.create('pb.view.common.SelectWindow', {
				saveHidden : true,
				closeHidden : true,
				title : '操作日志列表信息',
				listStore : logstore,
				colMaps : maps,
				width : 600,
				height : 400,
				x : 10, 
				y : 10
			}).show();
		}
	},
	
	/****
	 * 刷新
	 * @memberOf {TypeName} 
	 */
	refreshData : function(){
		this.getStore('pay.PayVouchers').loadPage(1);
	}
});
