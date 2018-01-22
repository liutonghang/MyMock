/****
 * 加载视图配置
 * @param {Object} parakey
 * @param {Object} gridPanel
 * @return {TypeName} 
 */
function loadListView(parakey,gridPanel) {
	var listView;
	Ext.Ajax.request({
				url : '/realware/loadListViewConfig.do',
				method : 'POST',
				timeout : 10000, // 设置为10秒
				params : {
					paraKey:parakey
				},
				success : function(response, options) {
					listView = (new Function("return " + response.responseText))();
					changUi(listView,gridPanel);				
				},
				failure : function() {
					Ext.Msg.alert("提示信息", "加载列表视图配置异常！");
				}
			});
	return listView;
}
/***
 * 改变列表视图显示
 * @param {Object} listView
 * @param {Object} gridPanel
 * @return {TypeName} 
 */
function changUi(listView,gridPanel){
	if(Ext.isEmpty(listView)){
		return ;
	}
	//修改列显示顺序
	for (var i = 0; i <listView.length ; i++) {
		var cs= gridPanel.getView().getGridColumns();
		if( cs[i+2].id != listView[i].column_id){
			var temp_ColCmp =  Ext.getCmp(listView[i].column_id);
			//表示插入的位置，i表示放在第i位置的后一列
			temp_ColCmp.ownerCt.insert(i,temp_ColCmp);
		}				
	}
	//修改列显示的宽度及是否显示
	for(var i=0 ;i<listView.length;i++){
		gridPanel.getView().getGridColumns()[i+2].width = listView[i].column_width;
		if(listView[i].is_visible == 1){
			gridPanel.getView().getGridColumns()[i+2].hidden = false;
		}else{
			gridPanel.getView().getGridColumns()[i+2].hidden = true;
		}	
	}
	gridPanel.getView().refresh()
}
/***
 * 保存视图配置
 * @param {Object} gridPanel
 */
function saveListView(gridPanel){
	var list = gridPanel;
	var culomn = gridPanel.getView().getGridColumns();
	var config = "";
	for(var i = 2;i<culomn.length;i++){
			config = config + culomn[i].id+","+culomn[i].dataIndex +","+culomn[i].text+","+culomn[i].hidden+","+culomn[i].width+"|";
	}
	config = config.substring(0, config.length - 1)
	saveListViewConfig(config);
}
/***
 * 
 * @param {Object} config
 */
function saveListViewConfig(config){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'saveListViewConfig.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			disp_key : Ext.getCmp('taskState').getValue(),
			viewConfig:config
		},
		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response,myMask);
			//refreshData();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response,myMask);
			//refreshData();
		}
	});
}