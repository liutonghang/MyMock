/***
 * 财政【直接】和【授权】支付退款通知书录入界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.RefundVoucherTranfers', {
	extend : 'Ext.app.Controller',
	stores : ['pay.BankSetMode'],
	requires : [ 'pb.view.pay.RefundVoucherTransferList', 'Ext.ReportUtil'],
	refs : [ {
		ref : 'list',  //当前控制层引用
		selector : 'refundVoucherTransferList' // 控件的别名
	} ],
	authWindow : null,
	//事件的定义
	init : function() {
		this.control( {
			//查询区 
				'payVoucherQuery combo[id=taskState]' : {
					//状态选中
					change :  function(combo, newValue, oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
								} catch(e) {}
					}
				},
			//按钮区
				//复核转账
				'refundVoucherTransferList button[id=checkTransfer]':{
					click : function(){
						this.checkTransferPayVoucher('/realware/checkTransferPayVoucher.do');
					}
				},
				//复核转账(用于安徽HSB退款复核转账)
				'refundVoucherTransferList button[id=checkTransferAnHuiHSB]':{
					click : function(){
						this.checkTransferPayVoucher('/realware/anhuiVoucher/checkTransferPayVoucherForHSB.do');
					}
				},
				//复核转账（主要用于湖南农行）
				'refundVoucherTransferList button[id=checkTransferHuNanABC]':{
					click : function(){
						this.checkTransferPayVoucher('/realware/bankTransferVoucher.do');
					}
				},
				//复核转账（主要用于湖南农行指纹验证）
				'refundVoucherTransferList button[id=checkTransferHuNanABCFprint]':{
					click : function(){
						this.checkTransferPayVoucher('/realware/bankTransferVoucher.do','Fingerprint');
					}
				},
				//复核转账（主要用于湖南农行密码验证）
				'refundVoucherTransferList button[id=checkTransferHuNanABCPass]':{
					click : function(){
						this.checkTransferPayVoucher('/realware/bankTransferVoucher.do','PassWord');
					}
				},
				// 复核转账（主要用于海南农行）
				'refundVoucherTransferList button[id=checkTransferHaiNanABC]':{
					click : function(){
						this.checkTransferPayVoucher('/realware/checkTransferRefPayVoucher.do');
					}
				},
				'refundVoucherTransferList button[id=print]':{
					click : this.printVoucher
				},
				'refundVoucherTransferList button[id=back]':{
					click : this.backVoucher
				},
				'refundVoucherTransferList button[id=invalid]':{
					click : this.invalidVoucher
				},
				'refundVoucherTransferList button[id=refresh]':{
					click : this.refreshData
				},
				//人工转账
				'refundVoucherTransferList button[id=refundartificialtransfer]' : { 
						click : this.RefundArtificialtransfer
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
		if ('004' == status_code) { //未复核和未转账
			Ext.StatusUtil.batchEnable("checkTransfer,checkTransferHuNanABC,checkTransferHuNanABCPass,back,invalid");
			Ext.StatusUtil.batchDisable("print");
		} else if ('005' == status_code) { //已复核
			Ext.StatusUtil.batchDisable("checkTransfer,checkTransferHuNanABC,checkTransferHuNanABCPass,back,invalid");
		} else if ('007' == status_code) { //已作废
			Ext.StatusUtil.batchDisable("checkTransfer,checkTransferHuNanABC,checkTransferHuNanABCPass,back,invalid,print");
		} else if ('008' == status_code) { //转账成功
			Ext.StatusUtil.batchDisable("checkTransfer,checkTransferHuNanABC,checkTransferHuNanABCPass,back,invalid,print");
			Ext.StatusUtil.batchEnable("print");
		} else if ('009' == status_code) { //转账失败
			Ext.getCmp('checkTransfer').setDisabled(false);
			Ext.getCmp('checkTransferHuNanABC').setDisabled(false);
			Ext.getCmp('back').setDisabled(false);
			Ext.getCmp('invalid').setDisabled(true);
			Ext.getCmp('print').setDisabled(true);
		} else if('003' == status_code){ //已退回
			Ext.StatusUtil.batchDisable("checkTransfer,checkTransferHuNanABC,checkTransferHuNanABCPass,back,invalid,print");
		}
		//刷新，默认当前为第一页
		//this.getStore('pay.PayVouchers').loadPage(1);
	},
	/**
	 * 人工转账
	 * @memberOf {TypeName} 
	 * @return {TypeName} 
	 */
	RefundArtificialtransfer : function () {
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records !=null) {
			// 凭证主键字符串
			var reqIds = [];
			var reqVers = [];
			Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
			var params = {
				billTypeId: records[0].get("bill_type_id"),
				billIds : Ext.encode(reqIds),
				last_vers : Ext.encode(reqVers),
				menu_id : Ext.PageUtil.getMenuId()
				//accountType : accountType
			};
			Ext.PageUtil.doRequestAjax(me,'/realware/artificialtransfer.do',params);
		}
	},
	
	/***
	 * 复核转账
	 * @param {Object} url 路径
	 * * @param {Object} bussinessType 业务类型
	 * @memberOf {TypeName} 
	 */
	checkTransferPayVoucher :function(url,bussinessType){
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(Ext.isEmpty(records)) {
			return ;
		}
		// 凭证主键字符串
		var reqIds = [];
		var reqVers=[];
		Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_voucher_id"));
			reqVers.push(model.get("last_ver"));
		});
		var params = {
			billTypeId : records[0].get("bill_type_id"),
			billIds : Ext.encode(reqIds),
			last_vers : Ext.encode(reqVers),
			menu_id : Ext.PageUtil.getMenuId()
		};
		if(bussinessType =='Fingerprint'){
			var authorwindow = Ext.create('pb.view.common.TextareaWindow',{
					title : '主管授权'
				});
			authorwindow.on('confirmclick',function(o,textarea){
					var proInfo = ABC_FingerReaderActiveXCtl.Func_GetProductInfo();
					if(proInfo == '-1'){
						Ext.Msg.alert('系统错误', '获取硬件设备信息失败!');
						return;
					}
					var finFeature  = ABC_FingerReaderActiveXCtl.Func_GetFingerFeature();
					if(finFeature=='-1'){
						Ext.Msg.alert('系统错误', '获取指纹数据失败!');
						return;
					}
					params.majorUserCode = textarea;
					params.fingerFeature = finFeature;
					params.productInfo = proInfo;
					me.ajaxPrint(me,records,url,params);
			});
			authorwindow.show();
		}else if(bussinessType =='PassWord'){
			
			var authForm = new Ext.FormPanel({
				id : 'authForm',
				bodyStyle:'padding:5px 5px 0 5px',
				items : [{
					id : 'majorUserCodee',
					fieldLabel : '主管代码',
					name : "majorUserCode",
					xtype : 'textfield',
					regex : /^(\S{4}$|^\S{9})$/,
					regexText:"该项只能输入4位或9位数字",
					allowBlank : false
				}, {
					id : 'majorUserCodePwdd',
					fieldLabel : '主管密码',
					name : 'majorUserCodePwd',
					inputType : 'password',
					xtype : 'textfield',
					minLength : 6,
					maxLength : 6,
					allowBlank : false
				}],
				buttons : [{
					id : 'btnOK',
					text : '确定',
					handler : function(){
						var form = this.up('form').getForm();
						if(form.isValid()){
							params.majorUserCode = form.findField('majorUserCode').getValue();
							params.majorUserCodePwd = form.findField('majorUserCodePwd').getValue();
							me.ajaxPrint(me,records,url,params);
						}
					}
				},{
					id : 'btnCanel',
					text : "取消",
					handler : function(){
						this.up('form').getForm().reset();
						this.up('window').close();
					}
				}]
			});
			
			authWindow = Ext.widget('window', {
				title : '主管授权',
				width : 300,
				autoHeight:true,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [ authForm ]
			}).show();
		}else{
			Ext.PageUtil.doRequestAjax(me,url,params);
		}
	},
	/***
	 * 提交后台并打印
	 * @param {Object} me 当前控制层
	 * @param {Object} records 当前选中行
	 * @param {Object} url 路径
	 * @param {Object} params 参数
	 */
	ajaxPrint : function(me,records,url,params) {
		//提交后台
		var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
		});
		myMask.show();
		Ext.Ajax.request( {
			method : 'POST',
			timeout : 180000,
			url : url,
			params : params,
			success : function(response, options) {
				myMask.hide();
				authWindow.close();
				Ext.MessageBox.confirm('打印提示',response.responseText + '，请打印记账凭证',function(yesOrno) {
						if (yesOrno == 'yes') {
							var condition = '[{\'pay_voucher_code\':[\'' + records[0].get('pay_voucher_code') + '\'],\'pay_voucher_id\':[\''+records[0].get('pay_voucher_id')+'\']}]';
							Ext.ReportUtil.showPrintWindow(me,'/realware/loadReportByCode.do','/realware/loadReportData.do','guimian',condition);
						}
				});
				me.refreshData();
			},
			failure : function(response, options) {
				Ext.PageUtil.failAjax(response, myMask,me);
			}
		});
	},
	/***
	 * 打印记账凭证
	 * @memberOf {TypeName} 
	 */
	printVoucher : function(){
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
		if (records != null) {
			var condition = '[{\'pay_voucher_code\':[\''+records[0].get('pay_voucher_code')+'\'],\'pay_voucher_id\':[\''+records[0].get('pay_voucher_id')+'\']}]';
			Ext.ReportUtil.showPrintWindow(me,'/realware/loadReportByCode.do','/realware/loadReportData.do','guimian',condition);
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
	 * 退回上岗
	 * @memberOf {TypeName} 
	 */
	backVoucher : function(){
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records !=null) {
			var ids = [];
			var lastVers = [];
			Ext.Array.each(records,function(model) {
				ids.push(model.get('pay_voucher_id'));
				lastVers.push(model.get("last_ver"));
			});
			var bill_type_id = records[0].get("bill_type_id");
			var backvoucherwindow = Ext.create('pb.view.common.TextareaWindow',{
						title : '退回上岗'
			});
			backvoucherwindow.on('confirmclick',function(o,textarea){
					var params = {
							returnRes : textarea,
							billIds : Ext.encode(ids),
							last_vers : Ext.encode(lastVers),
							billTypeId : bill_type_id
					};
					Ext.PageUtil.doRequestAjax(me,'/realware/unsubmitVoucher.do',params);
			});
			backvoucherwindow.show();
		}
	},
	/***
	 * 刷新
	 * @memberOf {TypeName} 
	 */
	refreshData : function(){
		this.getStore('pay.PayVouchers').loadPage(1);
	}
});
