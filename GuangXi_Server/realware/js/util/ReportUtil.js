/***
 * 报表打印
 */
var _gr_agent = navigator.userAgent.toLowerCase();
var _gr_isIE = (_gr_agent.indexOf("msie") > 0) ? true : false;
var typeid;
if (_gr_isIE)
	typeid = 'classid="CLSID:ABB64AAC-D7E8-4733-B052-1B141C92F3CE" ';
else
	typeid = 'type="application/x-grplugin6-printviewer"';
Ext.define('Ext.ReportUtil', {
	//静态方法: 调用说明 Ext.ReportUtil.方法(参数1,参数2....)
		statics : {
			// 变量 GridReportCodeBase 指定了报表插件的下载位置与版本号，当客户端初次访问报表
			// 时或插件版本升级后访问，将自动下载并安装 Grid++Report 报表插件。应将变量
			// GridReportCodeBase 的值调整为与实际相符。
			GridReportCodeBase : 'codebase="/realware/grbsctl6.cab#Version=\'6,0,15,0331\'"',
			UserName : 'zhongkejiangnan_ctjsoft_1710',
			SerialNo : 'PVWZ6LXXX4TJSG6GGUA9AYF68A0FC6APH6998SW63AFC6P8FH3BNRW6YV5D6BPVX90U4G51INK5',
			reportPanel :　null,
			/***
			 * 显示打印框
			 * @param {Object} thiz  控制层
			 * @param {Object} reportURL  报表模板路径
			 * @param {Object} dataURL    报表数据路径
			 * @param {Object} reportName 报表名称
			 * @param {Object} conditions 查询条件
			 * @param {Object} printSuccessURL  打印成功路径
			 * @param {Object} billNo   单号
			 * @memberOf {TypeName} 
			 */
			showPrintWindow : function(thiz,reportURL,dataURL,reportName,conditions,printSuccessURL,billNo){
				Ext.widget('window',{
					title : '打印',
					layout : 'fit',
					resizable : false,
					modal : true,
					width : 380,
					height : 120,
					items : [ {
						xtype : 'form',
						frame : true,
						bodyPadding : 5,
						layout : {
							type : 'absolute',
							padding : 20
						},
						items:[ {
							xtype: 'button',
							text : '打印',
							height: 25,
							width: 60,
							x:50,
							y:20,
							handler : function(){
								Ext.ReportUtil.print(reportURL,dataURL,reportName,conditions,false);
							}
						}, {
//							xtype:'button',
//							text : '打印成功',
//							height: 25,
//							width: 60,
//							x: 50,
//							y:75,
//							disabled : printSuccessURL==undefined?true:false,
//							handler : function(){
//								var params = {
//									billnos : billNo
//								};
//								Ext.PageUtil.doRequestAjax(thiz,printSuccessURL,params);
//							}
						}, {
							xtype: 'button',
							text : '预览',
							height: 25,
							width: 60,
							x:150,
							y:20,
							handler : function(){
								Ext.ReportUtil.print(reportURL,dataURL,reportName,conditions,true);
							}
						}, {
							xtype: 'button',
							text : '取消',
							height: 25,
							width: 60,
							x:250,
							y:20,
							handler : function(){
								this.up('window').close();
							}
						} ]
					} ]
				}).show();
			},
			/***
			 * GRID++ 打印报表
			 * @param {Object} reportURL 报表模板路径
			 * @param {Object} dataURL   报表数据加载路径
			 * @param {Object} reportName 报表名称
			 * @param {Object} conditions 查询条件
			 * @param {Object} printView  是否预览打印
			 */
			print : function(reportURL,dataURL,reportName,conditions,printView){
				var me = this;
				var params = {
					reportCode : reportName
				};
				var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
				});
				myMask.show();
				if(me.reportPanel == null){
					Ext.Ajax.request({
						url : reportURL,
						method : 'POST',
						timeout : 180000,
						asyn : false,
						params : {
							reportCode : reportName
						},
						success : function(response, options) {
							myMask.hide();
							Report.Report.LoadFromStr(response.responseText);
						},
						failure : function(response, options) {
							Ext.PageUtil.failAjax(response,myMask);
						}
					});
					me.create("Report");
				}
				var params = {
						reportCode : reportName
				};
				if (!Ext.isEmpty(conditions)) {
					params.jsonMap = conditions;
				}
				myMask.hide();
				Report.Stop();
				Ext.Ajax.request({
					url : dataURL,
					method : 'POST',
					params : params,
					success : function(response, options) {
						Report.Report.LoadDataFromXML(response.responseText); //加载报表数据
						if(printView){
							Report.Report.PrintPreview(true);
						}else{
							Report.Report.Print(true);
						}
						Report.Start();
					},
					failure : function(response, options) {
						Ext.Msg.show({
							title : '失败提示',
							msg : response.responseText,
							buttons : Ext.Msg.OK,
							icon : Ext.MessageBox.ERROR
						});
					}
				});
			},
			/**
			 * 创建
			 * @param {Object} Name
			 */
			create : function(Name){
				var me = this;
				if(me.reportPanel == null){
					me.reportPanel = Ext.widget('form', {
						layout : 'fit',
						renderTo : Ext.getBody(),
						html : '<OBJECT id="' + Name + '" ' + typeid + " "+ me.GridReportCodeBase + ' VIEWASTEXT>'
						+ '<param name="AutoRun" value=false>'
						+ '<param name="SerialNo" value="' + me.SerialNo + '">'
						+ '<param name="UserName" value="' + me.UserName + '">'
						+ '</OBJECT>'
					});
				}
			}
		}
	});