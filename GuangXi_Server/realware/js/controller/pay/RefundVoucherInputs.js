/***
 * 财政【直接】和【授权】支付退款通知书录入界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.RefundVoucherInputs', {
	extend : 'Ext.app.Controller',
	stores : [ 'pay.OriPayVouchers','pay.PayRequests','pay.BankSetMode','common.ElementValues','pay.AbisAccountNo' ],
	models : [ 'pay.PayVoucher','pay.PayRequest' ],
	requires : [ 'pb.view.pay.RefundVoucherInputList','pb.view.pay.PayVoucherQuery','pb.view.pay.RefundVoucherInputWindow','pb.view.pay.RefundVoucherInputWindow3'],
	refs : [ {
		ref : 'list',  //当前控制层引用
		selector : 'refundVoucherInputList' // 控件的别名
	}, { 
		ref : 'inputWindow',  //当前控制层引用
		selector : 'refundVoucherInputWindow' // 控件的别名
	} ],
	//事件的定义
	payVoucherId : null,
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
				//录入134
				'refundVoucherInputList button[id=inputABIS]':{
					click : this.inputABISVoucher
					
				},
				
				'refundVoucherInputList button[id=inputHuNanABC]':{
					click : this.inputHuNanABCVoucher
				},
				'refundVoucherInputList button[id=inputHuNanCBC]':{
					click : this.inputHuNanCBCVoucher
				},
				'refundVoucherInputList button[id=audit]':{
					click : this.auditVoucher
				},
				'refundVoucherInputList button[id=unaudit]':{
					click : this.unauditVoucher
				},
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
								jsonMap = '[{\'pay_voucher_id\':[\'=\',' + records[0].get('ori_voucher_id') + ',\'number\']}]';
							}else{
								jsonMap = '[{\'pay_voucher_id\':[\'=\',\'(select pay_voucher_id from pb_pay_request where pay_request_id =' + records[0].get('ori_voucher_id') + ')\',\'number\']}]';
							}
							//数据项
							var model = me.getModel('pay.PayVoucher');
							var filedNames = [];
							Ext.Array.each(model.getFields(), function(field) {
								filedNames.push(field.name);
							});
							Ext.Ajax.request({
								url : '/realware/loadPayVoucher.do',
								method : 'POST',
								timeout : 180000, // 设置为3分钟
								params : {
									filedNames :  Ext.encode(filedNames),
									jsonMap : jsonMap,
									start : 0,
									page : 1,
									limit : 1,
									menu_id : Ext.PageUtil.getMenuId()
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
				'refundVoucherInputList button[id=refresh]':{
					click : this.refreshData
				},
			//录入窗口
				'refundVoucherInputWindow gridpanel[id=voucherpanel]':{
					itemclick : function(thiz, record, item, index, e, eOpts ){
					//凭证的退款类型
						var refundType = record.get('refund_type');
						//退款类型 2按单退款  1按明细退款
						if (refundType != 1) {
							Ext.getCmp('cbxIsBill').setValue(true);
							Ext.getCmp('refundAmt').setValue(record.get('pay_amount').toFixed(2));
							//+++++++++
							Ext.getCmp('refundAmt_confirm').setValue(record.get('pay_amount').toFixed(2));
						}else{  
							Ext.getCmp('cbxIsBill').setValue(false);
							Ext.getCmp('refundAmt').setValue(0.00);
							//+++++++++++
							Ext.getCmp('refundAmt_confirm').setValue(0.00);
						}
						//退款原因
						Ext.getCmp('refundRemark').setValue('');
						//刷新明细
						this.payVoucherId = record.get('pay_voucher_id');
						this.getStore('pay.PayRequests').loadPage(1);
					}
				},
				
				'refundVoucherInputWindow gridpanel[id=requestpanel]':{
					itemclick : function(thiz, record, item, index, e, eOpts ){
						Ext.getCmp('refundAmt').setValue((record.get('pay_amount') - record.get('pay_refund_amount')).toFixed(2));
						//+++++++++++
						Ext.getCmp('refundAmt_confirm').setValue((record.get('pay_amount') - record.get('pay_refund_amount')).toFixed(2));
					}
				},
				//湖南建行用的退款录入窗口，
				'refundVoucherInputWindow3 gridpanel[id=voucherpanel]':{
					itemclick : function(thiz, record, item, index, e, eOpts ){
						//凭证的退款类型
						var refundType = record.get('refund_type');
						//退款类型 2按单退款  1按明细退款
						if (refundType != 1) {
							Ext.getCmp('cbxIsBill').setValue(true);
							Ext.getCmp('refundAmt').setValue(record.get('pay_amount').toFixed(2));
							//+++++++++
							Ext.getCmp('refundAmt_confirm').setValue(record.get('pay_amount').toFixed(2));
						}else{  
							Ext.getCmp('cbxIsBill').setValue(false);
							Ext.getCmp('refundAmt').setValue(0.00);
							//+++++++++++
							Ext.getCmp('refundAmt_confirm').setValue(0.00);
						}
						//退款原因
						Ext.getCmp('refundRemark').setValue('');
						//刷新明细
						this.payVoucherId = record.get('pay_voucher_id');
						this.getStore('pay.PayRequests').loadPage(1);
					}
				},
				'refundVoucherInputWindow3 gridpanel[id=requestpanel]':{
					itemclick : function(thiz, record, item, index, e, eOpts ){
						Ext.getCmp('refundAmt').setValue((record.get('pay_amount') - record.get('pay_refund_amount')).toFixed(2));
						//+++++++++++
						Ext.getCmp('refundAmt_confirm').setValue((record.get('pay_amount') - record.get('pay_refund_amount')).toFixed(2));
					}
				}
				
			////////////////////////END///////////////////////
			})
	},
	onLaunch: function() {
		//当前控制层
		var me = this;
		this.getStore('pay.OriPayVouchers').on('beforeload',function(thiz, options) {
			//判断是直接还是授权
			var type = parent.Ext.getCmp('contentTabs').activeTab.title;
			Ext.PageUtil.onBeforeLoad(null,Ext.ComponentQuery.query('form', me.getInputWindow())[0], me.getModel('pay.PayVoucher'), options);
			//将区划、凭证类型以参数传入后台进行查询
			
			//一单多明细时，且可能是按明细进行转账：主单可以按明细的收款人账号进行查询
			//edit by liutianlong 2016年10月8日
			var conditionObj = Ext.decode(options.params["conditionObj"]);
			for(var i = 0 ; i < conditionObj.length ; i ++ ){
				if(conditionObj[i].attr_code.substring(0,5)=="payee"){
					conditionObj[i].type = "1";
					conditionObj[i].value = " and ("+ conditionObj[i].attr_code +" like '%" 
						+ conditionObj[i].value + "%' or exists ( select 1 from pb_pay_request a where a.pay_voucher_id = objsrc_2742.pay_voucher_id and a."
						+ conditionObj[i].attr_code+" like '%" + conditionObj[i].value + "%'))";
				}
			}
			options.params["conditionObj"] = Ext.encode(conditionObj); 
			options.params["admdiv_code"] = Ext.getCmp('admdivCode').getValue();
			options.params["vt_code"] = type.indexOf('直接')!=-1?'(\'5201\',\'5291\')':'(\'8202\',\'8209\')';
		});
		this.getStore('common.ElementValues').on('beforeload',function(thiz, options) {
			if (null == options.params || options.params == undefined) {
				options.params = [];
			}
			options.params["admdiv_code"] = Ext.getCmp('admdivCode').getValue();
			options.params["ele_code"] = 'FUND_TYPE';
		});

		this.getStore('pay.PayRequests').on('beforeload', function(thiz, options) {
			if (null == options.params || options.params == undefined) {
				options.params = {};
			}
			
			var conditionObj = {
					operation : 'and',
					attr_code : 'pay_voucher_id',
					relation : '=',
					value : me.payVoucherId,
					datatype : 1,
					type : 0
			};
			
			//一单多明细时：查询区条件同时对明细有效
			//edit by liutianlong 2016年10月8日
			Ext.PageUtil.onBeforeLoad(null,Ext.ComponentQuery.query('form', me.getInputWindow())[0], me.getModel('pay.PayRequest'), options);
			var conditionObjlast = Ext.decode(options.params["conditionObj"]);
			conditionObjlast.push(conditionObj);
			options.params["conditionObj"] =Ext.encode(conditionObjlast);
		});
		
	},
	/////////////////////被调用的方法/////////////////////////

	/**
	 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了   
	 * @param {Object} status_code  状态code
	 */
	selectState : function(status_code) {
		if ('001' == status_code) { //未送审
			Ext.StatusUtil.batchEnable("edit,inputHuNanABC,inputHuNanCBC,audit,invalid,inputABIS");
			Ext.StatusUtil.batchDisable("unaudit");
		} else if ('002' == status_code) { //已送审
			Ext.StatusUtil.batchEnable("inputHuNanABC,unaudit");
			Ext.StatusUtil.batchDisable("edit,inputHuNanCBC,audit,invalid,inputABIS");
		} else if ('007' == status_code) { //已作废
			Ext.StatusUtil.batchEnable("inputHuNanABC");
			Ext.StatusUtil.batchDisable("edit,inputHuNanCBC,audit,invalid,unaudit,inputABIS");
		} else{
			Ext.StatusUtil.batchEnable("inputHuNanABC,audit,invalid");
			Ext.StatusUtil.batchDisable("edit,inputHuNanCBC,unaudit,inputABIS");
		}
	},
	/***
	 * 录入
	 */
	inputVoucher: function() {
		var me = this;
		me.getStore('pay.OriPayVouchers').removeAll();
		me.getStore('pay.PayRequests').removeAll();
		var w = Ext.create('pb.view.pay.RefundVoucherInputWindow',{
			width : me.getList().getWidth()-20,
			height : me.getList().getHeight()-20
		});
		// 查看凭证
		w.on('queryOldVoucherclick',function(record){
			var records = [];
			records.push(record);
			me.lookVoucher(record.get('pay_voucher_id'),record.get('bill_type_id'),records);
		});
		//查询按钮单击事件
		Ext.ComponentQuery.query('button[name=queryBtn]', w)[0].on('click',function(){
			var flag="";
			Ext.Ajax.request({
				url : '/realware/loadParas.do',
				method : 'POST',
				async : false,
				params : {
					admdiv_code :  Ext.getCmp('admdivCode').getValue(),
					parakey:'pb.refund.checkquery'
				},
				success : function(response, options) {
					 flag = Ext.decode(response.responseText);
				},
				failure : function(response, options) {
					//Ext.Msg.alert('系统提示', '失败！');
				}
			});
			
			//先清空
			me.getStore('pay.OriPayVouchers').removeAll();
			me.getStore('pay.PayRequests').removeAll();
			//获取查询区所有项输入的值
			var form = Ext.ComponentQuery.query('form', w)[0];
			var values = form.getForm().getValues();
			if (flag=="1"){
				//校验全部查询条件
				var _f = false;
				for(var v in values){
					if(Ext.isEmpty(values[v])) {
						_f = true;
						break;
					}
				}
				if(_f) {
					Ext.Msg.alert('系统提示', '请输入全部查询条件！');
					return;
				}
			}else {
				//检查不为空查询条件
				var _f = false;
				for(var v in values){
					if(!Ext.isEmpty(values[v])) {
						_f = true;
						break;
					}
				}
				if(!_f) {
					Ext.Msg.alert('系统提示', '至少输入一个有效的查询条件！');
					return;
				}
			};
			
			//刷新原凭证信息
			me.getStore('pay.OriPayVouchers').load();
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
		 * 录入134
		 */
		inputABISVoucher: function() {

			var me = this;
			me.getStore('pay.OriPayVouchers').removeAll();
			me.getStore('pay.PayRequests').removeAll();
			var w = Ext.create('pb.view.pay.RefundVoucherInputWindow',{
				width : me.getList().getWidth()-20,
				height : me.getList().getHeight()-20,
				query : 'HuNanABC',
				buttonName:'录入134'
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
				me.getStore('pay.OriPayVouchers').removeAll();
				me.getStore('pay.PayRequests').removeAll();
				//获取查询区所有项输入的值
				var form = Ext.ComponentQuery.query('form', w)[0];
				var values = form.getForm().getValues();
				var flag="";
				Ext.Ajax.request({
					url : '/realware/loadParas.do',
					method : 'POST',
					async : false,
					params : {
						admdiv_code :  Ext.getCmp('admdivCode').getValue(),
						parakey:'pb.refund.checkquery'
					},
					success : function(response, options) {
						 flag = Ext.decode(response.responseText);
					},
					failure : function(response, options) {
						//Ext.Msg.alert('系统提示', '失败！');
					}
				});
				if(flag=='1'){
					if (Ext.isEmpty(values['vouNo']) && Ext.isEmpty(values['amt'])
						|| Ext.isEmpty(values['payDate'])
						|| Ext.isEmpty(values['payeeAcctNo'])
						|| Ext.isEmpty(values['payAcctNo'])
						|| Ext.isEmpty(values['FundType'])) {
					Ext.Msg.alert("系统提示", "请输入全部查询条件！");
					return;
					}
				}else{
					if (Ext.isEmpty(values['vouNo']) && Ext.isEmpty(values['amt'])
						&& Ext.isEmpty(values['payDate'])
						&& Ext.isEmpty(values['payeeAcctNo'])
						&& Ext.isEmpty(values['payAcctNo'])
						&& Ext.isEmpty(values['FundType'])) {
					Ext.Msg.alert("系统提示", "至少输入一个查询条件！");
					return;
					}
				}
				
				//刷新原凭证信息
				me.getStore('pay.OriPayVouchers').load();
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
	 * 湖南农行特殊业务
	 */
	inputHuNanABCVoucher : function(){
		var me = this;
		me.getStore('pay.OriPayVouchers').removeAll();
		me.getStore('pay.PayRequests').removeAll();
		var w = Ext.create('pb.view.pay.RefundVoucherInputWindow',{
			width : me.getList().getWidth()-20,
			height : me.getList().getHeight()-20,
			query : 'HuNanABC'
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
			me.getStore('pay.OriPayVouchers').removeAll();
			me.getStore('pay.PayRequests').removeAll();
			//获取查询区所有项输入的值
			var form = Ext.ComponentQuery.query('form', w)[0];
			var values = form.getForm().getValues();
			var flag="";
			Ext.Ajax.request({
				url : '/realware/loadParas.do',
				method : 'POST',
				async : false,
				params : {
					admdiv_code :  Ext.getCmp('admdivCode').getValue(),
					parakey:'pb.refund.checkquery'
				},
				success : function(response, options) {
					 flag = Ext.decode(response.responseText);
				},
				failure : function(response, options) {
					//Ext.Msg.alert('系统提示', '失败！');
				}
			});
			if(flag=='1'){
				if (Ext.isEmpty(values['vouNo']) && Ext.isEmpty(values['amt'])
					|| Ext.isEmpty(values['payDate'])
					|| Ext.isEmpty(values['payeeAcctNo'])
					|| Ext.isEmpty(values['payAcctNo'])
					|| Ext.isEmpty(values['FundType'])) {
				Ext.Msg.alert("系统提示", "请输入全部查询条件！");
				return;
				}
			}else{
				if (Ext.isEmpty(values['vouNo']) && Ext.isEmpty(values['amt'])
					&& Ext.isEmpty(values['payDate'])
					&& Ext.isEmpty(values['payeeAcctNo'])
					&& Ext.isEmpty(values['payAcctNo'])
					&& Ext.isEmpty(values['FundType'])) {
				Ext.Msg.alert("系统提示", "至少输入一个查询条件！");
				return;
				}
			}
			
			//刷新原凭证信息
			me.getStore('pay.OriPayVouchers').load();
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
	 * 湖南建行特殊业务
	 */
	inputHuNanCBCVoucher : function(){
		var me = this;
		me.getStore('pay.OriPayVouchers').removeAll();
		me.getStore('pay.PayRequests').removeAll();
		var w = Ext.create('pb.view.pay.RefundVoucherInputWindow3',{
			width : me.getList().getWidth()-20,
			height : me.getList().getHeight()-20
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
			me.getStore('pay.OriPayVouchers').removeAll();
			me.getStore('pay.PayRequests').removeAll();
			//获取查询区所有项输入的值
			var form = Ext.ComponentQuery.query('form', w)[0];
			var values = form.getForm().getValues();
			if (Ext.isEmpty(values['vouNo']) && Ext.isEmpty(values['amt'])
					|| Ext.isEmpty(values['payDate'])
					|| Ext.isEmpty(values['payeeAcctNo'])
					|| Ext.isEmpty(values['payAcctNo'])
					|| Ext.isEmpty(values['FundType'])) {
				Ext.Msg.alert("系统提示", "请输入全部查询条件！");
				return;
			}
			//刷新原凭证信息
			me.getStore('pay.OriPayVouchers').load();
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
	 * 退款保存入库
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
	saveRefundVoucher : function(cbxInput,id,isBillRefund,refundAmt,refundRemark,payType,payFlag,writeoffVouNo,writeoffVouseqno,writeOffuserCode,abisNo){
			var w = this;
			var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true // 完成后移除
			});
			myMask.show();
			Ext.Ajax.request({
				url : '/realware/bankSaveRefundVoucher.do',
				method : 'POST',
				timeout : 180000, 
				params : {
					payId : id,
					isBillRef : isBillRefund,
					refReason : refundRemark,
					refAmount : refundAmt,
					payType : payType,
					menu_id : Ext.PageUtil.getMenuId(),
					cashTransFlag : payFlag,
					writeoffVouNo : writeoffVouNo,
					writeoffvouseqno : writeoffVouseqno,
					txtwriteoffuserCode : writeOffuserCode,
					abisNo : abisNo,
					menu_id : Ext.PageUtil.getMenuId()
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
	 * 送审
	 * @memberOf {TypeName} 
	 */
	auditVoucher : function() {
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
				is_onlyreq : 0,
				billTypeId : records[0].get('bill_type_id'),
				billIds : Ext.encode(reqIds),
				last_vers : Ext.encode(reqVers),
				isCheck : false
			};
			Ext.PageUtil.doRequestAjax(me,'/realware/checkVoucher.do',params);
		}
	},
	/***
	 * 撤销送审
	 * @memberOf {TypeName} 
	 */
	unauditVoucher : function() {
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
			Ext.PageUtil.doRequestAjax(me,'/realware/unAuditPayVoucher.do',params);
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
			Ext.PageUtil.doRequestAjax(me,'/realware/invalidateRefundVoucher.do',params);
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
				width : me.getList().getWidth()-20,
				height : me.getList().getHeight()-20
		});
		//加入左边点击凭证号触发显示凭证的事件（控件在创建后-在显示之前加入该事件）
		Ext.ComponentQuery.query('gridpanel', lookocxwindow)[0].on('selectionchange',function(view,selected, e) {
				Ext.OCXUtil.doOCX(selected[0].get('pay_voucher_id'),selected[0].get('bill_type_id'));
		});
		Ext.OCXUtil.doOCX(id,bill_type_id);
		lookocxwindow.show();
	},
	/***
	 * 刷新
	 * @memberOf {TypeName} 
	 */
	refreshData : function(){
		this.getStore('pay.PayVouchers').loadPage(1);
	}
});