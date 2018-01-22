/***
 * 授权支付特殊指令界面事件处理器
 * @memberOf {TypeName} 
 */
var auth = false; // 转账是否需要授权 true: 需要   false:不需要
var pbPayUpperLimittore =null;
//自定义 数字数组 排序函数
function sortNumber(a, b){
	return a - b;
}
Ext.define('pb.controller.pay.ConfirmCashVouchers', {
	extend : 'Ext.app.Controller',
	// 数据集列表
	stores : [ 'pay.PayVouchers', 'pay.BankSetMode'],

	//对象模型 pay.PayVoucher 支付凭证
	models : [ 'pay.PayVoucher' ],
	//当创建一个控件的时候需要在此引入
	requires : [ 'pb.view.pay.ConfirmCashVoucherList','pb.view.pay.PayVoucherQuery','pb.view.pay.ConfirmCashPayVoucherWindow','Ext.ReportUtil'],
	
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
		ref : 'list',  //当前控制层引用
		selector : 'cashVoucherList' // 控件的别名
	}, {
		ref : 'query',
		selector : 'payVoucherQuery'
	}, {
		ref : 'window',
		selector : 'cashpayvoucherindow'
	} ],
	oneSelect : true,
	//事件的定义
	init : function() {
		pbPayUpperLimittore = this.getStore('common.PbPayUpperLimit').load();
		this.control( {
			//查询区 
			'payVoucherQuery combo[id=taskState]' : {
				//状态选中
				change : function(combo, newValue, oldValue, eOpts) {
					var me = this;
					if (me.oneSelect) {
						me.oneSelect = false;
						me.getStore('pay.PayVouchers').on('load',function(thiz, rs, successful, eOpts){
							if(successful &&  newValue != '004' && rs.length>0){
								Ext.Array.each(rs, function(record){
									record.set('pay_amount', 0.00);
								});
							}
						});
					}
					this.selectState(combo.valueModels[0].raw.status_code);
				}
			},
			//////////////////////////按钮区///////////////////////////
			'cashVoucherList button[id=pay]':{
				click : this.cashTransferVoucher
			},
			'cashVoucherList button[id=writeoff]':{
				click : this.cashWriteOffVoucher
			},
			'cashVoucherList button[id=back]':{
				click : this.cashBackVoucher
			},
			'cashVoucherList button[id=payABCPass]':{
				click : function(){
					this.cashTransferVoucherOther('Password');
				}
			},
			'cashVoucherList button[id=payABCPassNoPwd]':{
				click : function(){
					this.cashTransferVoucherOther('Password', true);
				}
			},
			'cashVoucherList button[id=payABCFingerprint]':{
				click : function(){
					this.cashTransferVoucherOther('Fingerprint');
				}
			},
			'cashVoucherList button[id=print]':{
				click : this.printVoucher
			},
			//刷新
			'cashVoucherList button[id=refresh]' : {
				click : this.refreshData
			},
			//查看凭证   
			'cashVoucherList button[id=look]' : {
				click : this.lookVoucher
			},
			//作废退回
			'cashpayvoucherindow button[id=back]':{
				click:  this.backVoucher
			},
			//请款确认
			'cashpayvoucherindow button[id=advanceConfrim]':{
				click: function(){
					if(this.getWindow().isValid()){
						this.transVoucher(1);
					}
				}
			},
			//支付确认
			'cashpayvoucherindow button[id=payConfrim]':{
				click: function(){
					if(this.getWindow().isValid()){
						this.transVoucher(2);
					}
				}
			},
			//农行支付确认
			'cashpayvoucherindow button[id=payConfrimABC]':{
				click: function(){
					if(this.getWindow().isValid()){
						this.transVoucher(4);
					}
				}
			},
			//人工支付确认
			'cashpayvoucherindow button[id=rengongCfrim]':{
				click: function(){
					var me = this;
					if(me.getWindow().isValid()){
						var transnowindow = Ext.create('pb.view.common.TextareaWindow',{
							title : '补录人工确认支付信息【银行交易流水号】'
						});
						transnowindow.on('confirmclick',function(o, textarea) {
							me.transVoucher(3,textarea);
						});
						transnowindow.show();
					}
				}
			},
			//关闭
			'cashpayvoucherindow' : {
				queryButtonclick : this.queryCashVoucher
			}
		})
	},
	/////////////////////被调用的方法/////////////////////////
	/**
	 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
	 * @param {Object} status_code  状态code
	 */
	selectState : function(status_code) {
		if ('004' == status_code) { //已支取
			Ext.StatusUtil.batchEnable("pay,look,log,refresh");
		} else if ('003' == status_code) { //已退回
			Ext.StatusUtil.batchEnable("look,log,refresh");
			Ext.StatusUtil.batchDisable("pay");
		}
	},
	vouDTO : null, //支付凭证对象
	/***
	 * 支取
	 * @memberOf {TypeName} 
	 */
	cashTransferVoucher : function(){
		var me = this;
		Ext.create('pb.view.pay.ConfirmCashPayVoucherWindow',{
			height : me.getList().getHeight()-80
		}).show();
	},
	/***
	 * 支取确认（指纹授权）
	 * @memberOf {TypeName} 
	 */
	cashTransferVoucherOther : function(bussinessType, isHiddenPwd){
		var me = this;
		Ext.Ajax.request({
			url : '/realware/queryLimitOfAmount.do',
			method : 'POST',
			params : {
				admDivCode : Ext.getCmp('admdivCode').getValue()
			},
			// 提交成功的回调函数
			success : function(response) {
				
				var object = Ext.decode(response.responseText);
				
				var limitOfAmount = object.limitOfAmount;
				
				var vouType = object.vouType;
				
				var vouTypeStroe = Ext.create('Ext.data.Store',{
					fields : ['name','value' ],
					data : vouType
				});
				
				if(Ext.isEmpty(limitOfAmount)){
					Ext.Msg.alert('系统提示', '未配置当前区划对应的取现额度！');
					return ;
				}
				Ext.create('pb.view.pay.ConfirmCashPayVoucherWindow',{
					height : me.getList().getHeight()-5,
					advanceConfrimButtonHidden : true, //有请款确认按钮
					bussinessType : bussinessType,
					limitOfAmount : limitOfAmount,
					isHiddenPwd : isHiddenPwd,
					vouTypeStroe : vouTypeStroe
				}).show();
			}
		});
	},
	/***
	 * 打印记账凭证
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
	 * 查看凭证
	 * @memberOf {TypeName} 
	 */
	lookVoucher : function() {
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp(
				'taskState').getValue()));
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
						Ext.OCXUtil.doOCX(selected[0].get('pay_voucher_id'),
								selected[0].get('bill_type_id'));
					});
			Ext.OCXUtil.doOCX(records[0].get('pay_voucher_id'), records[0]
					.get('bill_type_id'));
			lookocxwindow.show();
		}
	},
	/***
	 * 退回财政
	 * @memberOf {TypeName} 
	 */
	backVoucher : function(){
		var me = this;
		if( Ext.isEmpty(me.vouDTO) ){
			Ext.Msg.alert('系统提示', '请先查询凭证！');
			return;
		}
		if(me.vouDTO !=null) {
			var ids = [];
			var lastVers = [];
			ids.push(me.vouDTO.pay_voucher_id);
			lastVers.push(me.vouDTO.last_ver);
			var backvoucherwindow = Ext.create('pb.view.common.TextareaWindow',{
				title : '退回财政'
			});
			backvoucherwindow.on('confirmclick',function(o,textarea){
					var params = {
						returnRes : textarea,
						billIds : Ext.encode(ids),
						last_vers : Ext.encode(lastVers),
						billTypeId : me.vouDTO.bill_type_id
					};
					Ext.PageUtil.doRequestAjax(me,'/realware/returnVoucher.do',params,'POST',me.getWindow());
			});
			backvoucherwindow.show();
		}
	},
	/***
	 * 现金冲销
	 * @memberOf {TypeName} 
	 */
	cashWriteOffVoucher : function(){
		var me = this;
		var ids = [];
		var lastVers = [];
		if(me.vouDTO !=null) {
			ids.push(me.vouDTO.pay_voucher_id);
			lastVers.push(me.vouDTO.last_ver);
		}else{
			Ext.Msg.alert('系统提示', '请选择要冲销的凭证！');
			return;
		}
		var params = {
			billTypeId : me.vouDTO.bill_type_id,
			billIds : Ext.encode(ids),
			last_vers : Ext.encode(lastVers)
		};
		Ext.PageUtil.doRequestAjax(me,'/realware/writeoffVoucherCash.do',params);
	},
	/***
	 * 退回财政
	 * @memberOf {TypeName} 
	 */
	cashBackVoucher : function(){
		var me = this;
		if( Ext.isEmpty(me.vouDTO) ){
			Ext.Msg.alert('系统提示', '请先选择要退回财政的凭证！');
			return;
		}
		if(me.vouDTO !=null) {
			var ids = [];
			var lastVers = [];
			ids.push(me.vouDTO.pay_voucher_id);
			lastVers.push(me.vouDTO.last_ver);
			var backvoucherwindow = Ext.create('pb.view.common.TextareaWindow',{
				title : '退回财政'
			});
			backvoucherwindow.on('confirmclick',function(o,textarea){
					var params = {
						returnRes : textarea,
						billIds : Ext.encode(ids),
						last_vers : Ext.encode(lastVers),
						billTypeId : me.vouDTO.bill_type_id
					};
					Ext.PageUtil.doRequestAjax(me,'/realware/returnVoucher.do',params,'POST',me.getWindow());
			});
			backvoucherwindow.show();
		}
	},
	/***
	 * 转账
	 * @param {Object} transType 转账类型   1请款  2转账 3人工
	 * @param {Object} bankTransNo  银行交易流水号
	 */
	transVoucher : function(transType, bankTransNo) {
		if(Ext.isEmpty(bankTransNo)) {
			bankTransNo = null;
		}
		var me = this;
		if( Ext.isEmpty(me.vouDTO) ){
			Ext.Msg.alert('系统提示', '请先查询凭证！');
			return;
		}
		//主键
		var ids = [];
		var reqVers = [];
		ids.push(me.vouDTO.pay_voucher_id);
		reqVers.push(me.vouDTO.last_ver);
		
		//实际支付情况
		var forms = Ext.ComponentQuery.query('form',me.getWindow());
		var form = forms[3].getForm();
		//支付金额
		var amt = form.findField('Amt').getValue();
		//补录信息
		var form1 = forms[1].getForm();
		//传至后台的参数
		var params = {
			type : transType,
			billTypeId : me.vouDTO.bill_type_id,
			billIds : Ext.encode(ids),
			last_vers : Ext.encode(reqVers),
			accountType : '22',
			bankTransNo : bankTransNo,
			amt :  amt,
			payeeAcctname : form.findField('payeeAcctname').getValue(),
			payeeAcctno : form.findField('payeeAcctno').getValue(),
			payeeBankname : form.findField('payeeBankname').getValue(),
			payeeBankno : form.findField('payeeBankno').getValue(),
			vochType : form1.findField('vou_type').getValue(),
			vochBatchNo : form1.findField('vou_batchno').getValue(),
			vochSeqNo : form1.findField('vou_seqno').getValue(),
			payPwd : form1.findField('vou_paypwd').getValue(),
			billissuedate : form1.findField('billissuedate').getRawValue(),
			city_code : form1.findField('city_code').getValue()
		};
		if(me.getWindow().limitOfAmount>0 && amt >= me.getWindow().limitOfAmount){
			//主管授权(密码)
			if(me.getWindow().bussinessType=='Password'){
				var window = Ext.create('Ext.window.Window', {
					title : '主管授权',
					width : 300,
					height : 130,
					layout : 'fit',
					items : [{
						xtype : 'form',
						layout : 'absolute',
						defaultType : 'textfield',
						border : false,
						bodyStyle : "background:#DFE9F6",
						items : [{
								fieldLabel : '主管代码',
								id : "majorUserCode",
								fieldWidth : 40,
								labelWidth : 60,
								msgTarget : 'side',
								allowBlank : false,
								x : 5,
								y : 5,
								anchor : '-5' 
							}, {
								fieldLabel : '主管密码',
								id : "majorUserCodePwd",
								fieldWidth : 40,
								labelWidth : 60,
								inputType : 'password',
								msgTarget : 'side',
								minLength : 6,
								maxLength : 6,
								allowBlank : false,
								x : 5,
								y : 35,
								anchor : '-5' 
							}],
						dockedItems : [{
								xtype : 'toolbar',
								dock : 'bottom',
								ui : 'footer',
								layout : {
									pack : "end"
								},
								items : [{
											text : '确定',
											width : 80,
											disabled : true,
											formBind : true,
											handler : function(){
												var form = this.up('form').getForm();
												if(form.isValid()){
													params.majorUserCode = form.findField('majorUserCode').getValue();
													params.majorUserCodePwd = form.findField('majorUserCodePwd').getValue();
													//提交后台
													me.ajaxPrint(me,'/realware/cashTransPayVoucher.do',params,'POST',window);
												}
											}
										}, {
											text : "取消",
											width : 80,
											handler : function(){
												Ext.ComponentQuery.query('form',window)[0].getForm().reset();
												window.close();
											}
										}]
							}]
					}]
				});
				window.show();
			//主管授权(指纹)
			}else if(me.getWindow().bussinessType=='Fingerprint'){
				//农行指纹录入控件初始化
				if("undefined" == typeof ABC_FingerReaderActiveXCtl) {
					var html = '<OBJECT CLASSID="clsid:1C46791B-9C87-4497-8662-EC3C6AE931B9" ' +
						'id="ABC_FingerReaderActiveXCtl" height=0 width=0  CODEBASE="Finger.CAB">' +
						'</OBJECT>';
					Ext.DomHelper.createDom({
						html : html
					}, Ext.getBody());
				}
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
					//提交后台
					me.ajaxPrint(me,'/realware/cashTransPayVoucher.do', params, 'POST',authorwindow);
				});
				authorwindow.show();
			}
		}else{
			var parameters = this.getAuthorizeAmount(amt);
			
			var inputUser = parameters[0];
			var payMaxAmount = parameters[1];
			var userType = parameters[2];
			
			// 转账不需授权
			if(auth == false || inputUser == false){
				var url = '/realware/cashPay.do';
				if (me.getWindow().bussinessType != 'PUBLIC') {
					url = '/realware/cashTransPayVoucher.do';
				}
				params.type = transType;
				//提交后台
				Ext.PageUtil.doRequestAjax(me,url,params,'POST',me.getWindow());
			// 转账需要授权
			}else if(auth== true && inputUser == true){
				var userType_str;
				if(userType == 1){
					userType_str='网点管理员';
				}else if(userType == 2){
					userType_str='业务人员';
				}else if(userType == 3){
					userType_str='行长';
				}
				var authorizeRemark='存在需要授权的金额，最大金额为：'+payMaxAmount;
				Ext.widget('window', {
				id : 'authorizeWindow',
					title : '授权主管复核对话框',
					width : 300,
					height : 170,
					layout : 'fit',
					resizable : true,
					draggable : true,
					modal : true,
					items : [Ext.widget('form', {
						renderTo : Ext.getBody(),
						layout : {
							padding : '10'
						},
						resizable : false,
						modal : true,
						items : [ {
									xtype: 'label',
									id: 'authorizeRemark',
									text: authorizeRemark,
									height : 20,
									width : 170,
									style:'color:red;'
								},{
									xtype: 'hiddenfield',
							        id: 'userType',
							        value: userType
								},{
									id:'userType_str',
									fieldLabel : '用户类型',
									xtype : 'textfield',
									dataIndex : 'userType',
								    emptyText : userType_str,
									editable : false,
									labelWidth: 60,
									height : 20,
									width : 200
								},{
									id : 'userCode',
									fieldLabel : '&nbsp;&nbsp;&nbsp;用户名',
									xtype : 'textfield',
									labelWidth: 60,
									height : 20,
									width : 200,
									allowBlank:false,
									blankText: '用户名是必填项'
								}, {
									id : 'userPass',
									fieldLabel : '&nbsp;&nbsp;&nbsp;密&nbsp;&nbsp;&nbsp;码',
									xtype : 'textfield',
									labelWidth : 60,
									inputType: 'password',
									height : 20,
									width : 200,
									allowBlank:false,
									blankText: '密码是必填项'
								}],
						buttons : [{
							text : '确定',
							handler : function() {
									//用户级别
									var userT = Ext.getCmp('userType').getValue();
									//用户编码
									var userCode = Ext.getCmp('userCode').getValue();
									//密码
									var userPass = Ext.getCmp('userPass').getValue();
									
									
									if (userCode == "" ||  null == userCode){
										Ext.Msg.alert("系统提示", "用户名不能为空！");
										return ;
									}
									if (userPass == "" ||  null == userPass){
										Ext.Msg.alert("系统提示", "密码不能为空！");
										return ;
									}
									
									//    授权判断 ******************
									Ext.Ajax.request({
										url : '/realware/transAuthorize.do',
										method : 'POST',
										async : false,
										params : {
											userCode :  userCode,
											userPassWord :userPass,
											userType:userT,
											code : me.vouDTO.pay_voucher_code,
											optionType : "特殊指令支付"
										},
										success : function(response, options) {
											Ext.getCmp("authorizeWindow").close();
											var url = '/realware/cashPay.do';
											if (me.getWindow().bussinessType != 'PUBLIC') {
												url = '/realware/cashTransPayVoucher.do';
											}
											params.type = transType;
											//提交后台
											Ext.PageUtil.doRequestAjax(me,url,params,'POST',me.getWindow());
												
										},
										failure : function(response, options) {
											Ext.Msg.show( {
												title : '失败提示',
												msg : response.responseText,
												buttons : Ext.Msg.OK,
												icon : Ext.MessageBox.ERROR
											});
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
			}
		}
	},
	/***
	 * 提交后台并打印
	 * @param {Object} me 当前控制层
	 * @param {Object} url 路径
	 * @param {Object} params 参数
	 * @param {Object} method 提交方式
	 */
	ajaxPrint : function(me,url,params,method,window) {
		params = params || {};
		params.menu_id = Ext.PageUtil.getMenuId();
		//提交后台
		var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
		});
		myMask.show();
		Ext.Ajax.request( {
			method : method,
			timeout : 180000,
			url : url,
			params : params,
			success : function(response, options) {
				myMask.hide();
				//关闭二级确认框
				if(!Ext.isEmpty(window)){
					window.close();
				}
				//关闭现金支付主窗体
				var condition = '[{\'pay_voucher_code\':[\'' + me.vouDTO.pay_voucher_code + '\'],\'pay_voucher_id\':[\''+me.vouDTO.pay_voucher_id +'\']}]';
				me.getWindow().close();
				Ext.MessageBox.confirm('打印提示',response.responseText + '，请打印记账凭证',function(yesOrno) {
						if (yesOrno == 'yes') {
							Ext.ReportUtil.showPrintWindow(me,'/realware/loadReportByCode.do','/realware/loadReportData.do','guimian',condition);
						}
				});
				me.getStore('pay.PayVouchers').load();
			},
			failure : function(response, options) {
				//关闭二级确认框
				if(!Ext.isEmpty(window)){
					window.close();
				}
				//关闭现金支付主窗体
				me.getWindow().close();
				Ext.PageUtil.failAjax(response, myMask,me);
			}
		});
	},
	/***
	 * 查询待支取的授权支付信息
	 * @param {Object} form
	 * @memberOf {TypeName} 
	 * @return {TypeName} 
	 */
	queryCashVoucher : function(form) {
		alert('old');
		var me = this;
		if(form.getForm().isValid()){
				//数据项
				var model = me.getModel('pay.PayVoucher');
				var filedNames = [];
				Ext.Array.each(model.getFields(), function(field) {
					filedNames.push(field.name);
				});
				var queryField = form.getForm().findField('billNo');
				var conditionObjs = [ {
					operation : 'and',
					attr_code : 'admdiv_code',
					relation : '=',
					value : Ext.getCmp('admdivCode').getValue(),
					type : 0
				}, {
					operation : 'and',
					attr_code : queryField.attr_code,
					relation : '=',
					value : queryField.getValue(),
					type : 0
				}, {
					operation : 'and',
					attr_code : 'pay_amount',
					relation : '=',
					value : form.getForm().findField('oriPayAmt').getValue(),
					datatype : 1,
					type : 0
				}, {
					operation : 'and',
					attr_code : 'task_id',
					relation : '=',
					value : 0,
					datatype : 1,
					type : 0
				}];
				Ext.Ajax.request( {
					url: '/realware/loadCashPay.do',
					method : 'POST',
					params : {
						filedNames :  Ext.encode(filedNames),
						conditionObj :  Ext.encode(conditionObjs),
						menu_id : Ext.PageUtil.getMenuId(),
						start : 0,
						page : 1,
						limit : 1
					 },
					 success : function(response, options) {
						 var dto = Ext.decode(response.responseText);
						 if (dto.pageCount == 0) {
							Ext.Msg.alert('系统提示', '根据凭证号和金额没有查询到授权支付特殊数据,请查看是否存在或已退回！');
							return;
						 }
						 if (dto.root[0].business_type == 1) {
							Ext.Msg.alert('系统提示', '当前凭证已支取确认！');
							return;
						 }
						 me.vouDTO = dto.root[0];
						 me.getWindow().setValue(me.vouDTO);
					 },
					 failure : function(response, options) {
						 Ext.Msg.alert('系统提示', '根据凭证号和金额后台查询授权支付特殊业务失败！');
					 }
				});
			}
	},
	/**
	 * 刷新
	 * @memberOf {TypeName} 
	 */
	refreshData : function() {
		this.getStore('pay.PayVouchers').loadPage(1);
	},
	getAuthorizeAmount : function(amt){
		
		// 凭证原支票金额
		if(amt == null){
			return;
		}
		// 数据库 支付上限数据
		var items = pbPayUpperLimittore.data.items;
		
		// 数据库现金最小金额
		var cashlimitAmount=0 ;
				
		var payMaxAmount;
		
		var inputUser = false ;
		
		var userType;
		
		var array_xian = new Array(3); //  现金 金额数组
		
		
		for(var i=0;i<items.length;i++){
			array_xian[i] = items[i].data.cashpay_amount;
			// 现金最低控制金额
			if(cashlimitAmount == 0){
				cashlimitAmount = parseFloat(items[i].data.cashpay_amount);
			}else if(parseFloat(items[i].data.cashpay_amount)<cashlimitAmount){
				cashlimitAmount = parseFloat(items[i].data.cashpay_amount);
			}
			
		}
		array_xian.sort(sortNumber); // 排序
		
		var payMaxAmount_t;
		// 如果  大于 现金最低控制金额，需要授权
		if (amt > cashlimitAmount) {
			payMaxAmount = amt;  // 授权金额
			inputUser = true;// 需要授权
			
			//  取 数据库中  比  业务金额 高的  第一个 级别 (跳过最低控制金额)
			for(var i=1;i<array_xian.length ; i++){  
				if(parseFloat(cashlimitAmount) < parseFloat(array_xian[i])){
					payMaxAmount_t = array_xian[i];
					break;
				}	
			}
			// 查出  这一级别 的 用户类型
			for(var i=0;i<items.length;i++ ){
				if(parseFloat(payMaxAmount_t) == items[i].data.cashpay_amount){
					userType = items[i].data.user_type;
					break;
				}
			}
		}
		
		return new Array(inputUser,payMaxAmount,userType);
	}
});
