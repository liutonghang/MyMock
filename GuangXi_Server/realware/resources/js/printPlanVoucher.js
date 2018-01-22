/**
 * 计划打印
 * @param {Object} selIds
 * @param {Object} isPrintFlow
 * @param {Object} billTypeId
 */
function printVoucherDialog(selIds,isPrintFlow,billTypeId,url){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	Ext.widget('window',{
		id : 'printDialog',
		title : '打印功能提示框',
		width : 280,
		height : 90,
		layout : 'fit',
		resizable : false,
		modal : true,
		items :[Ext.widget('form', {
				renderTo : Ext.getBody(),
				layout : {
					type : 'absolute',
					padding : 20
				},
				html:'<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="display:none" ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>',
				resizable : false,
				modal : true,
				bodyPadding: 10,
				items:[
				{	
					xtype: 'button',
					id :'print1',
					text : '打印',
					disabled:false,
					height: 25,
					width: 60,
					x:50,
					y:16,
					handler : function(){
						myMask.show();
						// 提交到服务器操作
                        Ext.Ajax.request({
                            url:'/realware/ocxPrintPayVoucher.do',
        					method: 'POST',
							timeout:180000,  //设置为3分钟
                            params: {
                                billIds: selIds,
								billTypeId:billTypeId,
								menu_id :  Ext.PageUtil.getMenuId()
                            },
                            // 提交成功的回调函数
                            success: function(response, options){
                            	myMask.hide();
								//后台传到前台的参数
								var obj = new Function("return" + response.responseText)();
								var evoucherUrl=obj.evoucherUrl;
								var estampUrl=obj.esatmpUrl;
								var certId=obj.certId;
								var admivCode=obj.admivCode;
								var year=obj.year;
								var vtCode=obj.vtCode;
								var voucherNos=obj.ocxNos;
								//调用ocx打印
								var ActiveX = setUrlByPlanVoucher(evoucherUrl,estampUrl);
								if (ActiveX) {
									var ret = ActiveX.PrintAllVoucher(certId,admivCode,year,vtCode,0,voucherNos);
									if(ret!=0){
										alert("打印失败，原因："+ActiveX.GetLastErr());
									}else{
										Ext.getCmp('print1').disable(true);
										//Ext.getCmp('sucess1').enable(false);
									}
								}else{
									alert("get ActiveX failure\n");
								}
                            },
                            // 提交失败的回调函数
                            failure: function(response, options){
                            	myMask.hide();
                                var msg = (new Function("return " + response.responseText))();
								Ext.Msg.show({
									title : '失败提示',
									msg : msg.error,
									buttons : Ext.Msg.OK,
									icon : Ext.MessageBox.ERROR
								});
                            }
                        });
					}
				},				
				{
					xtype:'button',
					id:'sucess1',
					text : '打印成功',
					height: 25,
					width: 60,
					//disabled:true,
					x: 150,
					y:16,
					handler : function(){
						myMask.show();
                        // 提交到服务器操作
                        Ext.Ajax.request({
                            url:url,
        					method: 'POST',
							timeout:180000,  //设置为3分钟
                            params: {
                                billIds: selIds,
								rePrint:isPrintFlow,//是否重复打印
								billTypeId:billTypeId,
								menu_id :  Ext.PageUtil.getMenuId()
                            },
                            // 提交成功的回调函数
                            success: function(response, options){
                            	myMask.hide();
                                Ext.Msg.alert("系统提示", "打印成功！");
                                Ext.getCmp('printDialog').close();
                                // 退回后根据查询区刷新列表
                                refreshData();
                            },
                            // 提交失败的回调函数
                            failure: function(response, options){
                            	myMask.hide();
                                var msg = (new Function("return " + response.responseText))();
								Ext.Msg.show({
									title : '失败提示',
									msg : msg.error,
									buttons : Ext.Msg.OK,
									icon : Ext.MessageBox.ERROR
								});
                            }
                        });
					}
				}]})	
				]	
	}).show();
	
}


//设置OCX凭证库、印章URL
function setUrlByPlanVoucher(evoucherUrl,estampUrl)
{
	try
	{    
		var ActiveX = document.getElementById("CTJEstampOcx");
		if (ActiveX) 
		{
			var ret = ActiveX.SetEvoucherServiceUrl(evoucherUrl);
			var ret = ActiveX.SetEstampServiceUrl(estampUrl);
		}
		else
		{
			alert("get ActiveX failure\n");
		}

	}
  catch(e){}
  return ActiveX;
}
