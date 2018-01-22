Ext.define('pb.controller.common.Parameters', {
	extend : 'Ext.app.Controller',
	models : [ 'common.Parameter' ],
	stores : [ 'common.Parameters' ],
	requires : [ 'pb.view.common.ParameterList','pb.view.common.ParaWindow'],
	refs : [ {
		ref : 'list',
		selector : 'parameterlist'
	} ],
	init : function() {
		this.control( {
			'parameterlist combo[id=admdivCode]' : {
				/***
				 * 区划选中事件
				 * @param {Object} o
				 * @memberOf {TypeName} 
				 */
				select : this.refreshData
			},
			'parameterlist combo[id=isPublic]' : {
				/***
				 * 类型选中事件
				 * @param {Object} o
				 * @memberOf {TypeName} 
				 */
				select : function(o) {
					this.showAdmdivCode(o.getValue());
					this.refreshData();
				}
			},
			/***
			 * 修改按钮
			 * @memberOf {TypeName} 
			 * @return {TypeName} 
			 */
			'parameterlist button[id=paraEdit]':{
				click : function() {
					var me = this;
					var tree = Ext.ComponentQuery.query('treepanel',this.getList())[0];
					var records = tree.getSelectionModel().getSelection();
					if (records.length != 1) {
						Ext.Msg.alert("系统提示", "请选择一条数据！");
						return;
					}
					if(records[0].get("parent_id")==0){
						Ext.Msg.alert("系统提示", "根节点不允许修改！");
						return;
					}
					var path = records[0].data.parentId;
					var ispublic =Ext.ComponentQuery.query('combo[id=isPublic]',this.getList())[0].getValue();
					var window = Ext.create('pb.view.common.ParaWindow',{
						isPublic : ispublic,
						nullable : records[0].get("nullable")
					});
					
					Ext.ComponentQuery.query('button[id=paraSave]',window)[0].on('click',function(){
						if(window.getForm().isValid()){
							window.getForm().submit( {
								url : '/realware/editPara.do',
								method : 'POST',
								timeout : 180000, 
								waitTitle : '提示',
								waitMsg : '后台正在处理，请您耐心等候...',
								success : function(form, action) {
									Ext.PageUtil.succForm(form, action);
									window.close();
									tree.getSelectionModel().select(0);
									var treeStore =  Ext.getStore('common.Parameters');
									treeStore.load({
									    scope   : this,
									    callback: function(records,oldnode, operation, success) {
										if(records.length!= 0){  
	                                        if(records[0].parentNode.get('id')=='root'){  
		                                        Ext.Array.each(records, function(model) {
		                                        	if(model.data.id==path){
														tree.expandPath(model.getPath('id'));
														}
													});
											    }
											}
										 }
									});
								},
								failure : function(form, action) {
									Ext.PageUtil.failForm(form, action);
								}
							});
						}
					});
					window.setRecord(records[0]);
					window.show();
				}
			},
			/***
			 * 同步按钮
			 * @memberOf {TypeName} 
			 */
			'parameterlist button[id=paraSync]':{
				click : function() {
					var me = this;
					var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true // 完成后移除
					});
					myMask.show();
					Ext.Ajax.request( {
						url : '/realware/synchronise.do',
						method : 'POST',
						timeout : 180000, // 设置为3分钟
						// 提交成功的回调函数
						success : function(response, options) {
							Ext.PageUtil.succAjax(response,myMask,me);
						},
						// 提交失败的回调函数
						failure : function(response, options) {
							Ext.PageUtil.failAjax(response, myMask,me);
						}
					});
				}
			},
			/****
			 * 刷新按钮
			 * @memberOf {TypeName} 
			 */
			'parameterlist button[id=paraRefresh]':{
				click : this.refreshData
			}
		});
	},
	onLaunch : function(){
		var me = this;
		var parameter = this.getModel('common.Parameter');
		var queryView = Ext.ComponentQuery.query('panel[name=queryView]',this.getList())[0];
		var filedNames = [];
		Ext.Array.each(parameter.getFields(), function(field) {
			if(field.convert==undefined){
				return;
			}
			filedNames.push(field.name);
		});				
		this.getStore('common.Parameters').on('beforeload',function(thiz, options) {
			if (null == options.params || options.params == undefined) {
					options.params = [];
			}
			options.params["is_public"] = Ext.ComponentQuery.query('combo[id=isPublic]',me.getList())[0].getValue();
			options.params["admdiv_code"] = Ext.ComponentQuery.query('combo[id=admdivCode]',me.getList())[0].getValue();
			options.params["filedNames"] = Ext.encode(filedNames);
		});
		this.getStore('common.Parameters').tree.root.set('expanded',true); //加载
		this.showAdmdivCode(1);
		this.refreshData();
	},
	/***
	 * 设置可见
	 * @param {Object} value
	 * @memberOf {TypeName} 
	 */
	showAdmdivCode:function(value){
		if (value == 1) {
			Ext.ComponentQuery.query('combo[id=admdivCode]',this.getList())[0].setDisabled(true);
			Ext.ComponentQuery.query('combo[id=admdivCode]',this.getList())[0].dataIndex = undefined;
			Ext.ComponentQuery.query('treepanel',this.getList())[0].down('#para_value').hide();
			Ext.ComponentQuery.query('treepanel',this.getList())[0].down('#default_value').show();
		} else {
			Ext.ComponentQuery.query('combo[id=admdivCode]',this.getList())[0].setDisabled(false);
			Ext.ComponentQuery.query('combo[id=admdivCode]',this.getList())[0].dataIndex = 'admdiv_code';
			Ext.ComponentQuery.query('treepanel',this.getList())[0].down('#para_value').show();
			Ext.ComponentQuery.query('treepanel',this.getList())[0].down('#default_value').hide();
		}
	},
	/***
	 * 刷新
	 * @memberOf {TypeName} 
	 */
	refreshData : function(){
		this.getStore('common.Parameters').load();
	}
});
