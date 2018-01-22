/***
 * 支付凭证签章发送界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.SignSendVouchers',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchers 支付凭证
		// pay.PayeeBankNos 收款行行号
		// common.PageStatus  初始化业务界面配置
		// pay.BankSetMode 银行结算方式
		stores : [ 'pay.PayVouchers','pay.BankSetMode','pay.VoucherStatus'],
		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.SignSendVoucherList','pb.view.pay.PayVoucherQuery'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'signSendVoucherList' // 控件的别名
		}, {
			ref : 'query',
			selector : 'payVoucherQuery'
		}],
		//事件的定义
		init : function() {
			this.control( {
					//查询区 
					'payVoucherQuery combo[id=taskState]' : {
							//状态选中
							change : this.selectState
							
					},
					'payVoucherQuery combo[id=voucherStatus]' : {
						//凭证状态选中
							change : this.selectVoucherState
					},
					//////////////////////////按钮区///////////////////////////
					//刷新
					'signSendVoucherList button[id=refresh]' : {
							click : this.refreshData
							//注 : 当该方法没有参数的时候可以直接这样写
					},
					//签章发送
					'signSendVoucherList button[id=signsend]' : { 
							click : function() {
								this.sendVoucher(false,'/realware/signAndSendPayVoucher.do');
							}
					},
					//全部签章发送
					'signSendVoucherList button[id=signsendall]' : { 
							click : function() {
								this.sendAllVoucher('/realware/signAndSendAllPayVoucher.do');
							}
					},
					//签章发送
					'signSendVoucherList button[id=signsendQH]' : { 
							click : function() {
								this.sendVoucher(true,'/realware/signAndSendVoucherOfTheStamp.do');
							}
					},
					//退回上岗
					'signSendVoucherList button[id=back]':{
						click : this.backVoucher
					},
					//重新发送
					'signSendVoucherList button[id=sendagain]' : { 
						click : this.sendVoucherAgain
					},
					 //查看凭证   
					'signSendVoucherList button[id=look]' : {
							click : this.lookVoucher
					}
					////////////////////////END///////////////////////
				})
			},
			/////////////////////被调用的方法/////////////////////////
					/**
					 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
					 * @param {Object} status_code  状态code
					 */
					selectState : function() {
						var  status_code = Ext.getCmp('taskState').getValue();
						if ('009' == status_code) { //未发送
							Ext.getCmp('signsend').setDisabled(false);
							if(Ext.getCmp('back')!=undefined){
								Ext.getCmp('back').setDisabled(false);
							}
							if(Ext.getCmp('sendagain')!=undefined){    
							 Ext.getCmp('sendagain').setDisabled(true);
							}
							if(Ext.getCmp('signsendall')!=undefined){	
								Ext.getCmp('signsendall').setDisabled(false);
							}
							if(Ext.getCmp('voucherStatus')!=undefined){
								Ext.getCmp('voucherStatus').setVisible(false);
								Ext.getCmp('voucherStatus').setValue("");
							}
							if(flowType == 1) {
								if(Ext.getCmp('look')!=undefined){
									Ext.getCmp('look').setDisabled(true);
								}
							}
						} else if ('010' == status_code) { //已发送
							Ext.getCmp('signsend').setDisabled(true);
							if(Ext.getCmp('back')!=undefined){
								Ext.getCmp('back').setDisabled(true);
							}
							if(Ext.getCmp('sendagain')!=undefined){    
                             Ext.getCmp('sendagain').setDisabled(true);
                            }
							
							if(Ext.getCmp('signsendall')!=undefined){	
								Ext.getCmp('signsendall').setDisabled(true);
							}
							if(Ext.getCmp('voucherStatus')!=undefined){
								Ext.getCmp('voucherStatus').setVisible(true);
							}
							if(flowType == 1) {
								if(Ext.getCmp('look')!=undefined){
									Ext.getCmp('look').setDisabled(false);
								}
							}
						}else{
							Ext.getCmp('signsend').setDisabled(true);
							if(Ext.getCmp('back')!=undefined){
								Ext.getCmp('back').setDisabled(true);
							}
							if(Ext.getCmp('sendagain')!=undefined){    
                             Ext.getCmp('sendagain').setDisabled(true);
                            }
							if(Ext.getCmp('signsendall')!=undefined){	
								Ext.getCmp('signsendall').setDisabled(true);
							}
							if(Ext.getCmp('voucherStatus')!=undefined){
								Ext.getCmp('voucherStatus').setVisible(true);
							}
							if(flowType == 1) {
								if(Ext.getCmp('look')!=undefined){
									Ext.getCmp('look').setDisabled(false);
								}
							}
						}
					},
					/**
					 * 凭证状态切换
					 * 
					 */
					selectVoucherState:function (){
						var  voucherStatus = Ext.getCmp('voucherStatus').getValue();
						var  taskState = Ext.getCmp('taskState').getValue();
						if(voucherStatus=='2'||voucherStatus=='4'||voucherStatus=='5'){
							Ext.StatusUtil.batchEnable("sendagain");
						}else{
							Ext.StatusUtil.batchDisable("sendagain");
						}
						if(taskState !='009'){
							this.refreshData();
						}
					},
					/**
					 * 签章发送 true  || 重新发送 false(暂时没加)
					 * @param {Object} isFlow
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					sendVoucher : function(isFlow,url) {
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
								isFlow : isFlow
							};
							Ext.PageUtil.doRequestAjax(me,url,params);
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
					/**
					 * 全部签章发送(多线程) 注：该方法执行指定符合查询条件的数据进行批量发送
					 * @param {Object} url 请求的url
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					sendAllVoucher : function(url) {
						var me = this;	
						var admdiv = Ext.getCmp('admdivCode').getValue();
							if (admdiv == null || admdiv == ""){
								return;
							}
							var options = {};
							//当前状态控件
							var taskState = Ext.getCmp('taskState').value;
							var data = [{
								operation : 'and',
								attr_code : 'task_status',
								relation : '=',
								value : taskState ,
								datatype : 0
							},{
								operation : 'and',
								attr_code : 'admdiv_code',
								relation : '=',
								value : admdiv,
								datatype : 0
							}]
							//4、赋值参数
							options["condition"] = Ext.encode(data);
							//把条件传到后台
							Ext.PageUtil.doRequestAjax(me,url,options);
					},
					/**
					 * 重新发送
					 */
					sendVoucherAgain:function(){
						var me = this;
						var records = null;
						records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
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
								last_vers : Ext.encode(lastVers)
							};
							var voucherStatus = Ext.getCmp('voucherStatus').getValue();
							if("2" == voucherStatus){
								Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucher.do',params);
							}else{
								Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucherAgain.do',params);
							}
						}
					
					},
					/***
					 * 查看凭证
					 * @memberOf {TypeName} 
					 */
					lookVoucher:function(){
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						if(records !=null) {
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
							Ext.ComponentQuery.query('gridpanel', lookocxwindow)[0].on(
									'selectionchange',function(view,selected, e) {
											Ext.OCXUtil.doOCX(selected[0].get('pay_voucher_id'),selected[0].get('bill_type_id'));
									});
							Ext.OCXUtil.doOCX(records[0].get('pay_voucher_id'),records[0].get('bill_type_id'));
							lookocxwindow.show();
						}
					},
					/**
					 * 刷新
					 * @memberOf {TypeName} 
					 */
					refreshData : function() {
						this.getStore('pay.PayVouchers').loadPage(1);
					}
});
