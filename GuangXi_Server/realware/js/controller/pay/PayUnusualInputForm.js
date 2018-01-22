/***
 * 支付异常信息通知书录入界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.PayUnusualInputForm', {
	extend : 'Ext.app.Controller',
	stores : [ 'pay.RefundOriVouchers','pay.PayRequests','pay.BankSetMode','common.ElementValues' ],
	models : [ 'pay.PayVoucher','pay.PayRequest' ],
	oneSelect : true,
	requires : [ 'pb.view.pay.RefundVoucherInputList','pb.view.pay.PayVoucherQuery','pb.view.pay.PayUnusualInputFormWindow'],
	refs : [ {
		ref : 'list',  //当前控制层引用
		selector : 'refundVoucherInputList' // 控件的别名
	}, { 
		ref : 'inputWindow',  //当前控制层引用
		selector : 'payUnusualInputFormWindow' // 控件的别名
	} ],
	//事件的定义
	init : function() {
		this.control( {
			//查询区 
				'payVoucherQuery combo[id=taskState]' : {
				//状态选中
					change : function(combo, newValue, oldValue, eOpts) {
						try {
							this.selectState(combo.valueModels[0].raw.status_code);
						} catch(e) {}
					}
				},
			//按钮区
				//录入
				'refundVoucherInputList button[id=edit]':{
					click : this.inputVoucher
				},
				//签章发送
				'refundVoucherInputList button[id=audit]':{
					click : this.sendVoucher
				},
				//作废
				'refundVoucherInputList button[id=invalid]':{
					click : this.invalidVoucher
				},
				'refundVoucherInputList button[id=look]':{
					click : function(){
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
						if(records !=null) {
							var jsonMap = null;
							//退款类型 2按单退款  1按明细退款
							if(records[0].get('refund_type')==2){
								jsonMap = '[{\'pay_voucher_id\':[\'=\',' + records[0].get('pay_voucher_id') + ']}]';
							}else{
								jsonMap = '[{\'pay_voucher_id\':[\'=\',\'(select pay_voucher_id from pb_pay_request where pay_request_id =' + records[0].get('pay_voucher_id') + ')\']}]';
							}
							//数据项
							var model = me.getModel('pay.PayVoucher');
							var filedNames = [];
							Ext.Array.each(model.getFields(), function(field) {
								filedNames.push(field.name);
							});
							Ext.Ajax.request({
								url : loadUrl,
								method : 'POST',
								timeout : 180000, // 设置为3分钟
								params : {
									filedNames :  Ext.encode(filedNames),
									vt_code : records[0].get('vt_code'),
									jsonMap : jsonMap,
									start : 0,
									page : 1,
									limit : 1
								},
								success : function(response, options) {
									var dto = Ext.decode(response.responseText).root[0];
									var dtos = [];
									dtos.push(dto);
									me.lookVoucher(dto.pay_voucher_id,dto.bill_type_id,dtos);
								},
								failure : function(response, options) {
									Ext.Msg.alert('系统提示', '查看原凭证失败！');
								}
							});
						}
					}
				},
				'refundVoucherInputList button[id=log]':{
					click : this.logVoucher
				},
				'refundVoucherInputList button[id=refresh]':{
					click : this.refreshData
				},
				
				'payUnusualInputFormWindow gridpanel[id=voucherpanel]':{
					itemclick : function(thiz, record, item, index, e, eOpts ){
						//凭证的退款类型
						var refundType = record.get('refund_type');
						//退款类型 2按单退款  1按明细退款
						if (refundType != 1) {
							Ext.getCmp('cbxIsBill').setValue(true);
							Ext.getCmp('refundAmt').setValue(record.get('pay_amount').toFixed(2));
						}else{  
							Ext.getCmp('cbxIsBill').setValue(false);
							Ext.getCmp('refundAmt').setValue(0.00);
						}
						//退款原因
						Ext.getCmp('refundRemark').setValue('');
						//刷新明细
						this.refleshRequest(record.get('pay_voucher_id'));
					}
				},
				'payUnusualInputFormWindow gridpanel[id=requestpanel]':{
					itemclick : function(thiz, record, item, index, e, eOpts ){
						Ext.getCmp('refundAmt').setValue((record.get('pay_amount') - record.get('pay_refund_amount')).toFixed(2));
					}
				}
				
			////////////////////////END///////////////////////
			})
	},
	onLaunch: function() {
		//当前控制层
		var me = this;
		this.getStore('pay.RefundOriVouchers').on('beforeload',function(thiz, options) {
			//判断是直接还是授权
			var type = parent.Ext.getCmp('contentTabs').activeTab.title;
			if (null == options.params || options.params == undefined) {
				options.params = [];
			}
			options.params["admdiv_code"] = Ext.getCmp('admdivCode').getValue();
			options.params["vt_code"] = "8202";
			
//			var conditions = [{
//				operation : 'and',
//				relation : '=',
//				datatype : 0,
//				type : 0,
//				attr_code : 'admdiv_code',
//				value : Ext.getCmp('admdivCode').getValue()
//			}, { 
//				operation : 'and',
//				relation : '=',
//				datatype : 0,
//				type : 0,
//				attr_code : 'vt_code',
//				value : '8202'
//			}];
			Ext.PageUtil.onBeforeLoad(null,Ext.ComponentQuery.query('form', me.getInputWindow())[0], me.getModel('pay.PayVoucher'), options);
		});
		this.getStore('common.ElementValues').on('beforeload',function(thiz, options) {
			if (null == options.params || options.params == undefined) {
				options.params = [];
			}
			options.params["admdiv_code"] = Ext.getCmp('admdivCode').getValue();
			options.params["ele_code"] = 'FUND_TYPE';
		});
	},
	/////////////////////被调用的方法/////////////////////////

	/**
	 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
	 * @param {Object} status_code  状态code
	 */
	selectState : function(status_code) {
		if ('001' == status_code) { //未发送
			Ext.getCmp('invalid').setDisabled(false);
			Ext.getCmp('audit').setDisabled(false);
		} else if ('002' == status_code) { //已发送
			Ext.getCmp('invalid').setDisabled(true);
			Ext.getCmp('audit').setDisabled(true);
		} else if('003' == status_code) { //已作废
			Ext.getCmp('invalid').setDisabled(true);
			Ext.getCmp('audit').setDisabled(true);
		}
	},
	/***
	 * 录入
	 */
	inputVoucher: function() {
		var me = this;
		me.getStore('pay.RefundOriVouchers').removeAll();
		me.getStore('pay.PayRequests').removeAll();
		var w = Ext.create('pb.view.pay.PayUnusualInputFormWindow',{
			width : me.getList().getWidth()-30,
			height : me.getList().getHeight()-30
		});
		// 查看凭证
		w.on('queryOldVoucherclick',function(record){
			var records = [];
			records.push(record);
			me.lookVoucher(record.get('pay_voucher_id'),record.get('bill_type_id'),records);
		});
		//查询按钮单击事件
		Ext.ComponentQuery.query('button[name=queryBtn]', w)[0].on('click',function(){
			//先清空
			me.getStore('pay.RefundOriVouchers').removeAll();
			me.getStore('pay.PayRequests').removeAll();
			//获取查询区所有项输入的值
			var form = Ext.ComponentQuery.query('form', w)[0];
			var values = form.getForm().getValues();
			if (Ext.isEmpty(values['vouNo']) && Ext.isEmpty(values['startDate'])
							&& Ext.isEmpty(values['endDate'])
							&& Ext.isEmpty(values['payeeAcctNo'])
							&& Ext.isEmpty(values['payAcctNo'])
							&& Ext.isEmpty(values['sAmt'])
							&& Ext.isEmpty(values['eAmt'])
							&& Ext.isEmpty(values['summaryName'])) {
				Ext.Msg.alert('系统提示', '至少输入一个查询条件！');
				return;
			}
			//刷新原凭证信息
			me.getStore('pay.RefundOriVouchers').load();
		});
		//保存事件
		w.on('saveRefundclick',me.saveRefundVoucher);
		//关闭事件（刷新）
		w.on('close',function(){
			me.refreshData();
		});
		w.show();
	},
	
	/***
	 * 2209保存入库
	 * @param {Object} cbxInput  是否连续录入
	 * @param {Object} id   主键
	 * @param {Object} isBillRefund 是否主单退款
	 * @param {Object} refundAmt   退款金额
	 * @param {Object} refundRemark  退款原因
	 * @param {Object} payType  支付类型
	 * @param {Object} payFlag  现金标志
	 * @param {Object} writeoffVouNo  核销传票号
	 * @param {Object} writeoffVouseqno 核销顺序号
	 * @param {Object} writeOffuserCode 核销柜员号
	 */
	saveRefundVoucher : function(cbxInput,id,isBillRefund,refundAmt,refundRemark,payType,payFlag,writeoffVouNo,writeoffVouseqno,writeOffuserCode){
			var w = this;
			var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true // 完成后移除
			});
			myMask.show();
			Ext.Ajax.request({
				url : '/realware/inputPayUnusualVoucher.do',
				method : 'POST',
				timeout : 180000, 
				params : {
					payId : id,
					isBillRef : isBillRefund,
					refReason : refundRemark,
					refAmount : refundAmt,
					payType : 1,
					cashTransFlag : payFlag,
					writeoffVouNo : writeoffVouNo,
					writeoffvouseqno : writeoffVouseqno,
					txtwriteoffuserCode : writeOffuserCode
				},
				success : function(response, options) {
					Ext.PageUtil.succAjax(response, myMask);
					if(!cbxInput){
						w.close();
					}else{
						w.clearItems();
					}
				},
				failure : function(response, options) {
					Ext.PageUtil.failAjax(response, myMask);
				}
			});
	},
	
	/***
	 * 签章发送
	 * @memberOf {TypeName} 
	 */
	sendVoucher : function() {
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records !=null) {
			var ids = []; // 凭证主键字符串
			var lastVers = []; // 凭证lastVer字符串
			Ext.Array.each(records, function(model) {
				ids.push(model.get("pay_voucher_id"));
				lastVers.push(model.get("last_ver"));
			});
			var params = {
				billTypeId : records[0].get("bill_type_id"),
				billIds : Ext.encode(ids),
				last_vers : Ext.encode(lastVers),
				isFlow : false
			};
			Ext.PageUtil.doRequestAjax(me,"/realware/signAndSendCZ.do",params);
		}
	},
	/***
	 * 作废
	 * @memberOf {TypeName} 
	 */
	invalidVoucher : function() {
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records !=null) {
			var reqIds = []; // 凭证主键字符串
			var reqVers = []; // 凭证lastVer字符串
			Ext.Array.each(records, function(model) {
				reqIds.push(model.get('pay_voucher_id'));
				reqVers.push(model.get('last_ver'));
			});
			var params = {
				billTypeId : records[0].get('bill_type_id'),
				billIds : Ext.encode(reqIds),
				last_vers : Ext.encode(reqVers)
			};
			Ext.PageUtil.doRequestAjax(me,'/realware/invalidatePayUnusualVoucher.do',params);
		}
	},
	/***
	 *  查看原凭证
	 * @param {Object} id  主键
	 * @param {Object} bill_type_id 单据类型
	 * @param {Object} records  显示集合
	 * @memberOf {TypeName} 
	 */
	lookVoucher : function(id,bill_type_id,records) {
		var me = this;
		var maps = Ext.create('Ext.util.HashMap');
		maps.add('pay_voucher_code','凭证号');
		maps.add('pay_amount','金额');
		var store = Ext.create('Ext.data.Store', {
			model: me.getModel('pay.PayVoucher'),
			data : records
		});
		var lookocxwindow = Ext.create('pb.view.common.LookOCXWindow',{
				colMaps : maps,
				listStore : store,
				width : me.getList().getWidth()-30,
				height : me.getList().getHeight()-30
		});
		//加入左边点击凭证号触发显示凭证的事件（控件在创建后-在显示之前加入该事件）
		Ext.ComponentQuery.query('gridpanel', lookocxwindow)[0].on('selectionchange',function(view,selected, e) {
				Ext.OCXUtil.doOCX(selected[0].get('pay_voucher_id'),selected[0].get('bill_type_id'));
		});
		Ext.OCXUtil.doOCX(id,bill_type_id);
		lookocxwindow.show();
	},
	/***
	 * 查看操作日志
	 * @memberOf {TypeName} 
	 */
	logVoucher : function() {
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
		// 数据项
		var logFileds = [ 'nodeName','taskUserName','taskOpinion','taskRemark', 'start_date','end_date', 'taskId' ]; 
		//数据集
		var logstore = this.getStore('common.TaskLog');
		if(records !=null){
			logstore.load( {
				params : {
					rowid : records[0].get('pay_voucher_id'),
					task_id : records[0].get('task_id'),
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
			Ext.create('pb.view.common.SelectWindow',{
					saveHidden : true,
					closeHidden : true,
					title : '操作日志列表信息',
					listStore : logstore,
					colMaps : maps
			}).show();
		}
	},
	/***
	 * 刷新
	 * @memberOf {TypeName} 
	 */
	refreshData : function(){
		this.getStore('pay.PayVouchers').loadPage(1);
	},
	/***
	 * 查询明细
	 * @param {Object} payVoucherId
	 * @memberOf {TypeName} 
	 */
	refleshRequest : function(payVoucherId){
		var models = this.getModel('pay.PayRequest');
		//数据项
		var filedNames = [];
		Ext.Array.each(models.getFields(), function(field) {
				filedNames.push(field.name);
		});
		var conditionObj = [{
				operation : 'and',
				attr_code : 'pay_voucher_id',
				relation : '=',
				value : payVoucherId,
				datatype : 1,
				type : 0
		}];
		this.getStore('pay.PayRequests').load({
			params : {
				start : 0,
				page : 1,
				limit : 200,
				filedNames : Ext.encode(filedNames),
				conditionObj : Ext.encode(conditionObj)
			}
		});
	}
});
