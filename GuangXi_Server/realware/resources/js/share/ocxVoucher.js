/*******************************************************************************
 * 调OCX相关方法
 */


/**
 * 为保证自定义报表能够使用，
 * add by liutianlong 2016年7月13日<br>
 */
document.write('<script type="text/javascript" src="/realware/resources/js/share/createReport.js"></script>');

var initOCX = false;

/*******************************************************************************
 * 凭证查看
 * 
 * @param {}
 *            records
 */
function lookOCX(records, idName, vt_code) {
	if (records.length == 0) {
		parent.Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
	}
	
	if(records.length > 0){
	      for(var i = 0 ; i<records.length;i++){
	    	if(records[i].data.plan_amount == undefined){
	    		break;
	    	}else{
	    		records[i].data.pay_amount = records[i].data.plan_amount;
	    	}
	      }
	}
	// 列表
	var gridStore = Ext.create('Ext.data.Store', {
				fields : [{
							name : idName.substring(0, idName.length - 2)
									+ 'code'
						}, {
							name : 'pay_amount'
						}, {
							name : idName
						}, {
							name : 'bill_type_id'
						}, {
							name : 'last_ver'
						}],
				data : records
			});
	var tempSize=parent.Ext.getBody().getSize();
	var width = tempSize.width*0.8;
	var height =tempSize.height*0.8;
	var w1 = new parent.Ext.Window({
		title : '凭证查看对话框',
		resizable : false, // 不可调整大小
		draggable : false, // 不可拖拽
		layout : 'fit',
		maximized :false,
		modal : true,
		width : width,
		height : height,
		items : [{
			layout : {
				type : 'border',
				padding : 5
			},
			items : [{
				region : 'west',
				width : '20%',
				items : [{
					xtype : 'gridpanel',
					height : 550,
					store : gridStore,
					columns : [{
						text : '凭证号',
						dataIndex : idName.substring(0, idName.length - 2)+ 'code',
						width : 120
					}, {
						text : '金额',
						dataIndex : 'pay_amount',
						width : 100
					}],
					listeners : {
						'selectionchange' : function(view, selected, e) {
							showOCX(selected[0].get(idName), selected[0].get('bill_type_id'), vt_code);
						}
					}
				}]
			}, {
				region : 'center',
				html : '<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="width:100%;height:100%"  ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>',
				tbar : [{
							id : 'topPage',
							text : '上一联',
							scale : 'small',
							iconCls : 'top',
							handler : function() {
								pageUp();
							}
						}, {
							id : 'lowPage',
							text : '下一联',
							scale : 'small',
							iconCls : 'low',
							handler : function() {
								pageDown();
							}

						}, {
							id : 'zoomIn',
							text : '放大',
							scale : 'small',
							iconCls : 'low',
							handler : function() {
								zoomIn();
							}

						}, {
							id : 'zoomOut',
							text : '缩小',
							scale : 'small',
							iconCls : 'low',
							handler : function() {
								zoomOut();
							}

						},{
							id : 'close',
							text : '退出',
							scale : 'small',
							iconCls : 'low',
							handler : function() {
								this.up('window').close();
							}
						}]
			}]
		}]
	});
	showOCX(records[0].get(idName), records[0].get('bill_type_id'),vt_code);
	w1.show();
}


/*******************************************************************************
 * 凭证查看
 * 
 * @param {}
 *            records
 */
function lookOCXByPageNo(records, idName,pageNo) {
	var w1 = new parent.Ext.Window({
		title : '凭证查看对话框',
		resizable : false, // 不可调整大小
		draggable : false, // 不可拖拽
		layout : 'fit',
		width : 820,
		height : document.documentElement.scrollHeight - 15
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/ocxVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					id : records[0].get(idName), 
					billTypeId : records[0].get('bill_type_id'),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				// 提交成功的回调函数
				success : function(response, options) {
					myMask.hide();
					var obj = new Function('return' + response.responseText)();
					if (!initOCX) {
						setUrl(obj.evoucherUrl, obj.esatmpUrl);
						initOCX = true;

					}
					init(obj.certID, obj.admivCode, obj.year, obj.vtCode);
					addVoucher(obj.vouNos);
					setCurrentVoucher(obj.vouNos);
					GotoPage(pageNo);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
				}
			});
	w1.show();
}

/*******************************************************************************
 * 凭证打印
 * 
 * @param {}
 *            records
 * @param {}
 *            isFlow
 */
function printVoucher(records,idName,isFlow) {
	if (records.length == 0) {
		parent.Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
	}
	var ids = [];
	Ext.Array.each(records, function(model) {
				ids.push(model.get(idName))
			});
	new Ext.widget('window', {
		id : 'ocxPrint',
		title : '打印功能提示框',
		width : 350,
		height : 90,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [Ext.widget('form', {
			renderTo : Ext.getBody(),
			layout : {
				type : 'absolute',
				padding : 20
			},
			html : '<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="position:absolute; visibility:hidden"  ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>',
			resizable : false,
			modal : true,
			bodyPadding : 10,
			items : [{
						xtype : 'button',
						text : '打印凭证',
						height : 25,
						width : 60,
						x : 20,
						y : 16,
						handler : function() {
							printOCX(Ext.encode(ids), records[0].get("bill_type_id"),0);
						}
					},{
						xtype : 'button',
						text : '打印明细',
						height : 25,
						width : 60,
						x : 120,
						y : 16,
						handler : function() {
							printOCX(Ext.encode(ids), records[0].get("bill_type_id"),1);
						}
					},{
						xtype : 'button',
						text : '打印成功',
						height : 25,
						width : 60,
						x : 220,
						y : 16,
						handler : function() {
							var myMask = new Ext.LoadMask(Ext.getBody(), {
										msg : '后台正在处理中，请稍后....',
										removeMask : true
									});
							myMask.show();
							Ext.Ajax.request({
								url : serverPrint,
								method : 'POST',
								timeout : 180000,
								params : {
									billIds : Ext.encode(ids),
									rePrint : isFlow,// 是否重复打印
									billTypeId : records[0].get("bill_type_id"),
									menu_id :  Ext.PageUtil.getMenuId(),
									idName : idName
								},
								success : function(response, options) {
									succAjax(response,myMask);
									Ext.getCmp('ocxPrint').close();
									refreshData();
								},
								failure : function(response, options) {
									failAjax(response,myMask);
								}
							})
						}
					}]
		})]
	}).show();
}

/*******************************************************************************
 * 凭证打印,动态生成按钮
 * 
 * @param {}
 *            records
 * @param {}
 *            isFlow
 *            
 *    添加hidden参数，是为了 历史数据模块下 入账通知书查询打印以及 额度到账通知单查询打印 2个页面 隐藏掉 打印成功 按钮       
 */
function printVoucherAUTO(records,idName,isFlow,vt_code,serverPrint,gridPanel,data,hidden) {
	if (records.length == 0) {
		parent.Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
	}
	if(Ext.isEmpty(vt_code)){
		vt_code = records[0].get("vt_code");
	}
	Ext.Ajax.request({
				url : '/realware/initPrint.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					vt_code : vt_code,
					menu_id :  Ext.PageUtil.getMenuId(),
					admdiv : records[0].get("admdiv_code")
				},
				success : function(response, options) {
					var msg = response.responseText;
					var reports=Ext.decode(msg);
					initPrintView(records,idName,isFlow,reports,serverPrint,gridPanel,data,hidden);
				},
				failure : function(response, options) {
					if (response.status == -1) {
						Ext.Msg.alert("系统提示", "划款生成超时，可能存在网络异常，检查后请重试...");
					} else {
					Ext.Msg.show({
						title : '失败提示',
						msg : response.responseText,
						buttons : Ext.Msg.OK,
						icon : Ext.MessageBox.ERROR
					});
					}
				}
			});
	
}

//--------------------------------------------新添加代码-----------------------------------------

function printVoucherByXml(records,idName,vt_code) {
	if (records.length == 0) {
		parent.Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
	}
	
	Ext.Ajax.request({
				url : '/realware/initPrint.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					vt_code : vt_code,
					menu_id :  Ext.PageUtil.getMenuId(),
					admdiv : records[0].get("admdiv_code")
				},
				
				success : function(response, options) {
					var msg = response.responseText;
					var reports=Ext.decode(msg);
					initPrintViewByXml(records,idName,reports);
					
				},
				failure : function(response, options) {
					if (response.status == -1) {
						Ext.Msg.alert("系统提示", "划款生成超时，可能存在网络异常，检查后请重试...");
					} else {
					Ext.Msg.show({
						title : '失败提示',
						msg : response.responseText,
						buttons : Ext.Msg.OK,
						icon : Ext.MessageBox.ERROR
					});
					}
				}
			});
	
}


function initPrintViewByXml(records,idName,reports){
	var ids = [];
	var voucherNos = [];
	//遍历选中的数据，将每一个idName取出
	Ext.Array.each(records, function(model) {
				ids.push(model.get(idName))
			});
	
	//遍历选中的数据，将每一个voucherNo取出来
	Ext.Array.each(records, function(model) {
		voucherNos.push(model.get(idName.replace('_id', "_code")))
	});
	var panel=Ext.create('Ext.form.Panel',{
		id : 'btnpanel',
		bodyPadding: 5,
		layout:'absolute'
	});
	//初始化按钮	
	var y;
//	var x;
//	var b,b2,b3;
	for (var i = 0; i < reports.length; i++) {
		
//		var x= num?num%2?"奇数":"偶数":"0"		
//		x= 10+(i?i%2?1:0:0)*80;		
		y= 10 + i * 30;
		var b=new Ext.Button({
				id : 'OCXPRINT'+reports[i]['report_id'],
				text : reports[i]['report_name'],
				scale : 'small',
				width : 70,
				handler:function(){
					var id=this.getId();	
					var pageno=Number(id.substring(8,id.length));
					printOCXByXml(Ext.encode(ids), records[0].get("bill_type_id"),pageno);	
					
				}
			});
		b.setPosition(10,y);
		panel.add(b);
		var b2=new Ext.Button({
				id : 'OCXSHOW'+reports[i]['report_id'],
				text : '预览',
				scale : 'small',
				width : 70,
				handler:function(){
					var id=this.getId();	
					var pageno=Number(id.substring(7,id.length));
					
					printPreViewOCX(records,ids, records[0].get("bill_type_id"),1);
				}
			});
		b2.setPosition(90,y);
		panel.add(b2);
//		panel.doLayout();
	}
	panel.doLayout();
	var win=new Ext.widget('window', {
		id : 'ocxPrint',
		title : '打印功能提示框',
		width : 206,
		height : 100+30*reports.length,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [Ext.widget('form', {
			renderTo : Ext.getBody(),
			layout : {
				type : 'absolute',
				padding : 20
			},
			html : '<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="position:absolute; visibility:hidden"  ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>',
//			html : '<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="position:absolute; visibility:hidden"  ID="CTJEstampOcx" CODEBASE="../realware/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>',
			resizable : false,
			modal : true,
			bodyPadding : 10,			
			items : panel,
			buttons: [{
					text : '打印成功',
					scale : 'small',
					width : 70,
					handler:function(){
						var myMask = new Ext.LoadMask(Ext.getBody(), {
										msg : '后台正在处理中，请稍后....',
										removeMask : true
							});
						myMask.show();
						Ext.Ajax.request({
							url : serverPrint,
							method : 'POST',
							timeout : 180000,
							params : {
								billIds : Ext.encode(ids),
								rePrint : isFlow,// 是否重复打印				
								billTypeId : records[0].get("bill_type_id"),
								menu_id :  Ext.PageUtil.getMenuId(),
								idName : idName
							},
							success : function(response, options) {
								succAjax(response,myMask);
								Ext.getCmp('ocxPrint').close();
								refreshData();
							},
							failure : function(response, options) {
								failAjax(response,myMask);
							}
						})
					}
				},{
	                 text: '取消',
	                 handler: function() {
	                  	 this.up('window').close();
	                 }
	            }]
		})]
	}).show();
}

//---------------------在凭证没有签章发送之前打印或预览，数据从页面传递过来，该方法是入口函数-----------------------------------------
function printPageVoucherByXml(records,idName,voucherName,vt_code) {
	if (records.length == 0) {
		parent.Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
	}
	
	Ext.Ajax.request({
				url : '/realware/initPrint.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					vt_code : vt_code,
					menu_id :  Ext.PageUtil.getMenuId(),
					admdiv : records[0].get("admdiv_code")
					
				},
				
				success : function(response, options) {
					var msg = response.responseText;
					var reports=Ext.decode(msg);
					initPagePrintViewByXml(records,idName,voucherName,reports);
					
				},
				failure : function(response, options) {
					if (response.status == -1) {
						Ext.Msg.alert("系统提示", "划款生成超时，可能存在网络异常，检查后请重试...");
					} else {
					Ext.Msg.show({
						title : '失败提示',
						msg : response.responseText,
						buttons : Ext.Msg.OK,
						icon : Ext.MessageBox.ERROR
					});
					}
				}
			});
}


//-------------------------初始化数据，因为数据是从页面获取，所有多加一个参数，用于获取凭证号---------------------
function initPagePrintViewByXml(records,idName,voucherName,reports){
	var ids = [];
	var voucherNos = [];
	//遍历选中的数据，将每一个idName取出
	Ext.Array.each(records, function(model) {
				ids.push(model.get(idName));
			});
	
	//遍历选中的数据，将每一个voucherNo取出来
	Ext.Array.each(records, function(model) {
		voucherNos.push(model.get(voucherName));
	});
	var panel=Ext.create('Ext.form.Panel',{
		id : 'btnpanel',
		bodyPadding: 5,
		layout:'absolute'
	});
	
	var _config = {
			ids : ids,
			voucherName : voucherName,
			voucherNos : voucherNos,
			records : records
	};
	
	var initPreWin = function() {
		var win = null;
		var _ID = '_PREVIEW_WIN';
		if(Ext.isEmpty(Ext.getCmp(_ID))) {
			win = Ext.widget('window', {
				id : _ID,
				title : '预览',
				width : 800,
				height : 500,
				layout : 'fit',
				closeAction : 'hide',
				resizable : false,
				renderTo : Ext.getBody(),
				modal : true,
				html : '<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="width:100%;height:100%" ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>'
			});
		} else {
			win = Ext.getCmp(_ID);
		}
		return win;
	};
	//初始化按钮	
	var y;
	for (var i = 0; i < reports.length; i++) {
		y= 10 + i * 30;
		var b=new Ext.Button({
				id : 'OCXPRINT'+reports[i]['report_id'],
				text : reports[i]['report_name'],
				scale : 'small',
				width : 70,
				handler:function(){
					var id=this.getId();	
					var pageno=Number(id.substring(8,id.length));
					initPreWin();
					var _config = this.up("window")._config;
					printOCXByXml(Ext.encode(_config.ids), _config.records[0].get("bill_type_id"),pageno);	
				}
			});
		b.setPosition(10,y);
		panel.add(b);
		var b2=new Ext.Button({
				id : 'OCXSHOW'+reports[i]['report_id'],
				text : '预览',
				scale : 'small',
				width : 70,
				handler:function(){
					var id=this.getId();	
					var pageno=Number(id.substring(7,id.length));
					initPreWin().show();
					var _config = this.up("window")._config;
					printPreViewOCXPage(_config.records, _config.ids, _config.voucherName, _config.records[0].get("bill_type_id"), pageno);
				}
			});
		b2.setPosition(90,y);
		panel.add(b2);
	}
	panel.doLayout();
	var win=new Ext.widget('window', {
		id : 'ocxPrint',
		title : '打印功能提示框',
		width : 206,
		height : 60+30*reports.length,
		layout : 'fit',
		resizable : false,
		modal : true,
		_config : _config,
		items : [Ext.widget('form', {
			layout : {
				type : 'absolute',
				padding : 20
			},
			resizable : false,
			modal : true,
			bodyPadding : 10,			
			items : panel
		})]
	}).show();
}


//---------------------------打印凭证，没有签章发送前------------------------------------------------------
/*
* 打印OCX,该方法是打印本地数据,数据从页面获取
*/
function printOCXByXml(ids, billTypeId,pageNo) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/ocxVoucherByXml.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					ids : ids,
					menu_id :  Ext.PageUtil.getMenuId(),
					billTypeId : billTypeId
				},
				// 提交成功的回调函数
				success : function(response, options) {
					myMask.hide();
					var obj = new Function('return' + response.responseText)();
					if (!initOCX) {
						setUrl(obj.evoucherUrl, obj.esatmpUrl);
						initOCX = true;
					}
					PrintAllVoucherByXml(obj.certID, obj.admivCode, obj.year,
							obj.vtCode, obj.vouNos,obj.xmls,pageNo);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
				}
			});
}


/*******************************************************************************
* 打印
* 
* @param {}
*            certId
* @param {}
*            admivCode
* @param {}
*            year
* @param {}
*            vtCode
* @param {}
*            voucherNos
*/

function PrintAllVoucherByXml(certId, admivCode, year, vtCode, voucherNos ,xmls,pageNo) {

	try {
		var ActiveX = parent.document.getElementById('CTJEstampOcx');
		if(ActiveX==null){
			ActiveX = document.getElementById('CTJEstampOcx');
		}
		if (ActiveX) {
			var ret = ActiveX.Initialize(certId == undefined ? "123" : certId,admivCode, year, vtCode, '0', 0, 0, pageNo);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
			var voucherNOStr = "";
			/**
			 * 清空控件中的凭证
			 * lfj 2015-09-10
			 */
			ActiveX.ResetContent();
			for( var i = 0; i < voucherNos.length; i++ ){
				ActiveX.AddVoucher(voucherNos[i],xmls[i]  );
				if( i != voucherNos.length-1 ){
					voucherNOStr += voucherNos[i] + ',';
				}else{
					voucherNOStr += voucherNos[i];
				}
			}
			var ret = ActiveX.PrintVoucherByIndexRange(0,voucherNos.length-1,pageNo);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
		} else {
			alert('get ActiveX failure\n');
		}

	} catch (e) {
		alert(e);
	}
	
}

//-------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------

function initPrintView(records,idName,isFlow,reports,serverPrint,gridPanel,data,hidden){
	var ids = [];
	Ext.Array.each(records, function(model) {
				ids.push(model.get(idName))
			});
	var panel=Ext.create('Ext.form.Panel',{
		id : 'btnpanel',
		bodyPadding: 5,
		layout:'absolute'
	});
	var bill_type_id = records[0].get("bill_type_id");
	if(!("undefined" == typeof billTypeId)){
		bill_type_id = billTypeId;
	}
	//初始化按钮	
	var y;
//	var x;
//	var b,b2,b3;
	for (var i = 0; i < reports.length; i++) {
		
//		var x= num?num%2?"奇数":"偶数":"0"		
//		x= 10+(i?i%2?1:0:0)*80;		
		y= 10 + i * 30;
		var b=new Ext.Button({
				id : 'OCXPRINT'+reports[i]['report_id'],
				text : reports[i]['report_name'],
				scale : 'small',
				width : 70,
				handler:function(){
					var id=this.getId();	
					var pageno=0;
//					alert(pageno);
					//判断报表ID是纯数字还是带英文，如果是纯数字则调用凭证库模板打印，否则调用柜面自身模板打印
					var regx=/^[0-9]\d*$/;
					var rs=regx.test(id.substring(8,id.length));
					if(rs){
						pageno = Number(id.substring(8,id.length))
						printOCX(Ext.encode(ids), bill_type_id,pageno,hidden);	
					}
					else{
						if (Ext.isEmpty(data)) {
							var bill_no=records[0].get( idName );
							data="[{\""+idName+"\":[\""+ids.toString()+"\"]}]";
						}
						reportView("/realware/loadReportByCode.do", "/realware/loadReportData.do", id.substring(8,id.length), data, false);
					}
					
				}
			});
		b.setPosition(10,y);
		panel.add(b);
//		panel.doLayout();
		var b2=new Ext.Button({
				id : 'OCXSHOW'+reports[i]['report_id'],
				text : '预览',
				scale : 'small',
				width : 70,
				handler:function(){
					var id=this.getId();	
					var pageno=Number(id.substring(7,id.length));
					var regx=/^[0-9]\d*$/;
					var rs=regx.test(id.substring(7,id.length));
					if(rs){
						printPreViewOCX(records[0].get(idName), bill_type_id,pageno,hidden);
					}
					else{
						if (Ext.isEmpty(data)) {
							var bill_no=records[0].get( idName );
							data="[{\""+idName+"\":[\""+ids.toString()+"\"]}]";
						}
						reportView("/realware/loadReportByCode.do", "/realware/loadReportData.do", id.substring(7,id.length), data, true);
					}
				}
			});
		b2.setPosition(90,y);
		panel.add(b2);
//		panel.doLayout();
	}
	panel.doLayout();
	var win=new Ext.widget('window', {
		id : 'ocxPrint',
		title : '打印功能提示框',
		width : 206,
		height : 100+30*reports.length,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [Ext.widget('form', {
			renderTo : Ext.getBody(),
			layout : {
				type : 'absolute',
				padding : 20
			},
			html : '<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="position:absolute; visibility:hidden"  ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>',
			resizable : false,
			modal : true,
			bodyPadding : 10,			
			items : panel,
			buttons: [{
					text : '打印成功',
					scale : 'small',
					width : 70,
					hidden : hidden,
					handler:function(){
						var myMask = new Ext.LoadMask(Ext.getBody(), {
										msg : '后台正在处理中，请稍后....',
										removeMask : true
							});
						myMask.show();
						Ext.Ajax.request({
							url : serverPrint,
							method : 'POST',
							timeout : 180000,
							params : {
								billIds : Ext.encode(ids),
								rePrint : isFlow,// 是否重复打印				
								billTypeId : records[0].get("bill_type_id"),
								menu_id :  Ext.PageUtil.getMenuId(),
								idName : idName
							},
							success : function(response, options) {
								succAjax(response,myMask);
								Ext.getCmp('ocxPrint').close();
								gridPanel.store.reload();
							},
							failure : function(response, options) {
								failAjax(response,myMask);
							}
						})
					}
				},{
	                 text: '取消',
	                 handler: function() {
	                  	 this.up('window').close();
	                 }
	            }]
		})]
	}).show();
}

/*******************************************************************************
 * 显示OCX
 * 
 * @param {}
 *            id
 * @param {}
 *            billTypeId
 */
function showOCX(ids, billTypeId, vt_code) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/ocxVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					id : ids,
					menu_id :  Ext.PageUtil.getMenuId(),
					billTypeId : billTypeId
				},
				// 提交成功的回调函数
				success : function(response, options) {
					myMask.hide();
					var obj = new Function('return' + response.responseText)();
					if (!initOCX) {
						setUrl(obj.evoucherUrl, obj.esatmpUrl);
						initOCX = true;

					}
					if(Ext.isEmpty(vt_code))
						vt_code = obj.vtCode;
					init(obj.certID, obj.admivCode, obj.year, vt_code);
					addVoucher(obj.vouNos);
					setCurrentVoucher(obj.vouNos);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
				}
			});

}

/*******************************************************************************
 * 打印OCX
 */
function printOCX(ids, billTypeId,pageNo,hidden) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/ocxVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					ids : ids,
					flag: hidden,
					menu_id :  Ext.PageUtil.getMenuId(),
					billTypeId : billTypeId
				},
				// 提交成功的回调函数
				success : function(response, options) {
					myMask.hide();
					var obj = new Function('return' + response.responseText)();
					if (!initOCX) {
						setUrl(obj.evoucherUrl, obj.esatmpUrl);
						initOCX = true;
					}
					PrintAllVoucher(obj.certID, obj.admivCode, obj.year,
							obj.vtCode, obj.vouNos,pageNo);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
				}
			});
}

/*******************************************************************************
 * 预览OCX
 */
function printPreViewOCX(id, billTypeId,pageNo,hidden) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/ocxVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					id : id,
					flag :hidden,
					menu_id :  Ext.PageUtil.getMenuId(),
					billTypeId : billTypeId
				},
				// 提交成功的回调函数
				success : function(response, options) {
					myMask.hide();
					var obj = new Function('return' + response.responseText)();
					if (!initOCX) {
						setUrl(obj.evoucherUrl, obj.esatmpUrl);
						initOCX = true;
					}
					PrintPreView(obj.certID, obj.admivCode, obj.year,
							obj.vtCode, obj.vouNos,pageNo);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
				}
			});
}

//预览OCX，数据从页面传过来
function printPreViewOCXPage(records,id, voucherName, billTypeId, pageNo) {
	var voucherNos = [];
	//遍历选中的数据，将每一个voucherNo取出来
	Ext.Array.each(records, function(model) {
	voucherNos.push(model.get(voucherName))
	});
	
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/ocxVoucherByXml.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					ids : Ext.encode(id),
					menu_id :  Ext.PageUtil.getMenuId(),
					billTypeId : billTypeId
				},
				// 提交成功的回调函数
				success : function(response, options) {
					myMask.hide();
					var obj = new Function('return' + response.responseText)();
					if (!initOCX) {
						setUrl(obj.evoucherUrl, obj.esatmpUrl);
						initOCX = true;
					}
					printviewOCXByXml('123', records[0].get('admdiv_code'), records[0].get('year'), records[0].get("vt_code"), voucherNos, obj.xmls, 0);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
				}
			});
}

function printviewOCXByXml(certId, admivCode, year, vtCode, voucherNos ,xmls, pageNo) {
	//debugger;
	try {
		var ActiveX = parent.document.getElementById('CTJEstampOcx');
		if(ActiveX==null){
			ActiveX = document.getElementById('CTJEstampOcx');
		}
		if (ActiveX) {
			var ret = ActiveX.Initialize(certId == undefined ? "123" : certId,admivCode, year, vtCode, '0', 0, 0, pageNo);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
			var voucherNOStr = "";
			/**
			 * 清空控件中的凭证
			 * lfj 2015-09-10
			 */
			ActiveX.ResetContent();
			for( var i = 0; i < voucherNos.length; i++ ){
				var res = ActiveX.AddVoucher(voucherNos[i],xmls[i]);
				
				if( i != voucherNos.length-1 ){
					voucherNOStr += voucherNos[i] + ',';
				}else{
					voucherNOStr += voucherNos[i];
				}
			}
			//debugger;
			var ret = ActiveX.SetCurrentVoucher(voucherNOStr);
//			var ret = ActiveX.PrintPreView(certId,admivCode,year,vtCode,pageNo,voucherNOStr);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
		} else {
			alert('get ActiveX failure\n');
		}
			
		}catch (e){}
}

//-------------------------------------------------------------------------------------------------------------

/*******************************************************************************
 * 
 * @param {}
 *            evoucherUrl 凭证库地址
 * @param {}
 *            estampUrl 印章地址
 */
function setUrl(evoucherUrl, estampUrl) {
	
	try {
		var ActiveX = parent.document.getElementById('CTJEstampOcx');
		if(ActiveX==null){
			ActiveX = document.getElementById('CTJEstampOcx');
		}
		//debugger;
		if (ActiveX) {
			var ret = ActiveX.SetEvoucherServiceUrl(evoucherUrl);
			var ret = ActiveX.SetEstampServiceUrl(estampUrl);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
		} else {
			alert('get ActiveX failure\n');
		}

	} catch (e) {
	}
}

/*******************************************************************************
 * 
 * @param {}
 *            certId 证书ID
 * @param {}
 *            admivCode 行政区划
 * @param {}
 *            year 年度
 * @param {}
 *            vtCode 凭证类型
 */
function init(certId, admivCode, year, vtCode) {
	try {
		var ActiveX = parent.document.getElementById('CTJEstampOcx');
		if (ActiveX) {
			
			
			var ret = ActiveX.Initialize(certId == undefined ? "123" : certId,
					admivCode, year, vtCode, '0', 0, 0, 0);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
		} else {
			alert('get ActiveX failure\n');
		}

	} catch (e) {
	}
}

/*******************************************************************************
 * 
 * @param {}
 *            vouNo 凭证号
 */
function addVoucher(vouNo) {
	try {
		var ActiveX = parent.document.getElementById('CTJEstampOcx');
		if (ActiveX) {
			var ret = ActiveX.AddVoucherfromServer(vouNo);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
		} else {
			alert('get ActiveX failure\n');
		}

	} catch (e) {
	}
}

function setCurrentVoucher(vouNo) {
	try {
		var ActiveX = parent.document.getElementById('CTJEstampOcx');
		if (ActiveX) {
			var ret = ActiveX.SetCurrentVoucher(vouNo);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
			// 自适应大小
			var ret = ActiveX.ZoomToFit();
		} else {
			alert('get ActiveX failure\n');
		}

	} catch (e) {
	}
}

/**
 * 显示指定联号凭证
 * @param {}
 *            vouNo 凭证号
 */
function GotoPage(pageNo) {
	try {
		var ActiveX = parent.document.getElementById('CTJEstampOcx');
		if (ActiveX) {
			var ret = ActiveX.GotoPage(pageNo);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
		} else {
			alert('get ActiveX failure\n');
		}

	} catch (e) {
	}
}

// 上一联
function pageUp() {
	try {
		var ActiveX = parent.document.getElementById("CTJEstampOcx");
		if (ActiveX) {
			var ret = ActiveX.PageUp();
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
		} else {
			alert("get ActiveX failure\n");
		}

	} catch (e) {
	}
}
// 下一联
function pageDown() {
	try {
		var ActiveX = parent.document.getElementById("CTJEstampOcx");
		if (ActiveX) {
			var ret = ActiveX.PageDown();
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
		} else {
			alert("get ActiveX failure\n");
		}

	} catch (e) {
	}
}
// 放大
function zoomIn() {
	try {
		var ActiveX = parent.document.getElementById("CTJEstampOcx");
		if (ActiveX) {
			var ret = ActiveX.ZoomIn();
		} else {
			alert("get ActiveX failure\n");
		}
		
	} catch (e) {
	}
}
// 缩小
function zoomOut() {
	try {
		var ActiveX = parent.document.getElementById("CTJEstampOcx");
		if (ActiveX) {
			var ret = ActiveX.ZoomOut();
		} else {
			alert("get ActiveX failure\n");
		}
		
	} catch (e) {
	}
}

/*******************************************************************************
 * 打印
 * 
 * @param {}
 *            certId
 * @param {}
 *            admivCode
 * @param {}
 *            year
 * @param {}
 *            vtCode
 * @param {}
 *            voucherNos
 */
function PrintAllVoucher(certId, admivCode, year, vtCode, voucherNos ,pageNo) {
	try {
		var ActiveX = parent.document.getElementById('CTJEstampOcx');
		if(ActiveX==null){
			ActiveX = document.getElementById('CTJEstampOcx');
		}
		if (ActiveX) {
			var ret = ActiveX.PrintAllVoucher(certId, admivCode, year, vtCode,
					pageNo, voucherNos);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
		} else {
			alert('get ActiveX failure\n');
		}

	} catch (e) {
	}
}

/*******************************************************************************
 * 预览
 * 
 * @param {}
 *            certId
 * @param {}
 *            admivCode
 * @param {}
 *            year
 * @param {}
 *            vtCode
 * @param {}
 *            voucherNos
 */
function PrintPreView(certId, admivCode, year, vtCode, voucherNos ,pageNo) {
	try {
		var ActiveX = parent.document.getElementById('CTJEstampOcx');
		if(ActiveX==null){
			ActiveX = document.getElementById('CTJEstampOcx');
		}
		if (ActiveX) {
			var ret = ActiveX.PrintPreView(certId, admivCode, year, vtCode,
					pageNo, voucherNos);
			if (ret != 0) {
				alert(ActiveX.GetLastErr());
			}
		} else {
			alert('get ActiveX failure\n');
		}

	} catch (e) {
	}
}
/*******************************************************************************
 * 凭证查看，山东建行请款凭证
 * chengkai 2014-7-11 15:23:11
 * @param {}
 *            records
 */
function lookOCX4SDCCB(records, idName, vt_code) {
	if (records.length == 0) {
		parent.Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
	}
	// 列表
	var gridStore = Ext.create('Ext.data.Store', {
				fields : [{
							name : idName.substring(0, idName.length - 2)
									+ 'code'
						}, {
							name : 'pay_amount'
						}, {
							name : idName
						}, {
							name : 'bill_type_id'
						}, {
							name : 'last_ver'
						}],
				data : records
			});
	var width = (this.screen.availWidth - 80) * 0.78;
	var height = this.screen.availHeight - 250;
	var w1 = new parent.Ext.Window({
		title : '凭证查看对话框',
		resizable : false, // 不可调整大小
		draggable : false, // 不可拖拽
		layout : 'fit',
		width : this.screen.availWidth - 80,
		height : this.screen.availHeight - 180,
		listeners:{
			afterrender:function(sender){
				alert(sender.getSize());
				
			}
		},  
		items : [{
			layout : {
				type : 'border',
				padding : 5
			},
			items : [{
				region : 'west',
				width : '20%',
				items : [{
					xtype : 'gridpanel',
					height : 550,
					store : gridStore,
					columns : [{
						text : '凭证号',
						dataIndex : idName.substring(0, idName.length - 2)+ 'code',
						width : 120
					}, {
						text : '金额',
						dataIndex : 'pay_amount',
						width : 100
					}],
					listeners : {
						'selectionchange' : function(view, selected, e) {
							showOCX(selected[0].get(idName), selected[0].get('bill_type_id'), vt_code);
						}
					}
				}]
			}, {
				region : 'center',
				html : '<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="width:'+width+';height:'+height+'"  ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>',
				tbar : [{
							id : 'topPage',
							text : '上一联',
							scale : 'small',
							iconCls : 'top',
							handler : function() {
								pageUp();
							}
						}, {
							id : 'lowPage',
							text : '下一联',
							scale : 'small',
							iconCls : 'low',
							handler : function() {
								pageDown();
							}

						}]
			}]
		}]
	});
	showOCX4SDCCB(records[0].get('admdiv_code'), records[0].get('batchreq_date'),"9999",records[0].get('bill_no'));
	w1.show();
}

/*******************************************************************************
 * 显示OCX，山东建行显示请款凭证
 * chengkai 2014-7-11 15:26:56
 * @param {}
 *            id
 * @param {}
 *            billTypeId
 */
function showOCX4SDCCB(admdiv_code, batchreq_date, vt_code, bill_no) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/ocxVoucher4SDCCB.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					admdiv_code : admdiv_code,
					batchreq_date : batchreq_date,
					vt_code : vt_code,
					menu_id :  Ext.PageUtil.getMenuId(),
					bill_no : bill_no
				},
				// 提交成功的回调函数
				success : function(response, options) {
					myMask.hide();
					var obj = new Function('return' + response.responseText)();
					if (!initOCX) {
						setUrl(obj.evoucherUrl, obj.esatmpUrl);
						initOCX = true;

					}
					if(Ext.isEmpty(vt_code))
						vt_code = obj.vtCode;
					init(obj.certID, obj.admivCode, obj.year, vt_code);
					addVoucher(obj.vouNos);
					setCurrentVoucher(obj.vouNos);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
				}
			});

}

/*******************************************************************************
 * 凭证打印山东建行
 * chengkai 2014-7-15 14:12:04
 * 
 * @param {}
 *            records
 * @param {}
 *            isFlow
 */
function printVoucher4SDCCB(records,idName,isFlow) {
	if (records.length == 0) {
		parent.Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
	}
	var ids = [];
	Ext.Array.each(records, function(model) {
				ids.push(model.get(idName))
			});
	new Ext.widget('window', {
		id : 'ocxPrint',
		title : '打印功能提示框',
		width : 130,
		height : 90,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [Ext.widget('form', {
			renderTo : Ext.getBody(),
			layout : {
				type : 'absolute',
				padding : 20
			},
			html : '<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="position:absolute; visibility:hidden"  ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>',
			resizable : false,
			modal : true,
			bodyPadding : 10,
			items : [{
						xtype : 'button',
						text : '打印凭证',
						height : 25,
						width : 60,
						x : 20,
						y : 16,
						handler : function() {
							printOCX4SDCCB(records[0].get('admdiv_code'), records[0].get('batchreq_date'),"9999",records[0].get('bill_no'));
						}
					}
//			,{
//						xtype : 'button',
//						text : '打印成功',
//						height : 25,
//						width : 60,
//						x : 220,
//						y : 16,
//						handler : function() {
//							var myMask = new Ext.LoadMask(Ext.getBody(), {
//										msg : '后台正在处理中，请稍后....',
//										removeMask : true
//									});
//							myMask.show();
//							Ext.Ajax.request({
//								url : serverPrint,
//								method : 'POST',
//								timeout : 180000,
//								params : {
//									billIds : Ext.encode(ids),
//									rePrint : isFlow,// 是否重复打印
//									billTypeId : records[0].get("bill_type_id"),
//									idName : idName
//								},
//								success : function(response, options) {
//									succAjax(response,myMask);
//									Ext.getCmp('ocxPrint').close();
//									refreshData();
//								},
//								failure : function(response, options) {
//									failAjax(response,myMask);
//								}
//							})
//						}
//					}
					
					]
		})]
	}).show();
}

/*******************************************************************************
 * 打印OCX 山东建行
 * chengkai 2014-7-15 14:12:22
 */
function printOCX4SDCCB(admdiv_code, batchreq_date, vt_code, bill_no) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/ocxVoucher4SDCCB.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					admdiv_code : admdiv_code,
					batchreq_date : batchreq_date,
					vt_code : vt_code,
					menu_id :  Ext.PageUtil.getMenuId(),
					bill_no : bill_no
				},
				// 提交成功的回调函数
				success : function(response, options) {
					myMask.hide();
					var obj = new Function('return' + response.responseText)();
					if (!initOCX) {
						setUrl(obj.evoucherUrl, obj.esatmpUrl);
						initOCX = true;
					}
					PrintAllVoucher(obj.certID, obj.admivCode, obj.year,
							obj.vtCode, obj.vouNos,0);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
				}
			});
}


