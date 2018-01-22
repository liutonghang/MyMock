/***
 * 功能维护主界面
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.ModuleList', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.modulelist',
	frame : true,
	layout : 'border',
	items : [ {
		region : 'west',
		xtype : 'treepanel',
		rootVisible : false,
		split : true,
		collapsible : true,
		collapsed : false,
		width : 300,
		store : 'common.ModuleTree',
		viewConfig: {
            plugins: {
               ptype: 'treeviewdragdrop',
               enableDrag: true,
               enableDrop: true,
               enableDD : false,
               containerScroll : true
            },
            listeners: {
                beforedrop : function( node, data, overModel, dropPosition, dropHandlers) {
                	var realValue = function(value) {
                		return isNaN(value) ? 0 : value;
                	};
                	var target = this.getRecord(node).data;
                	var source = data.records[0].data;
                	//同为目录或类型相同，NaN判断必须优先
                	if((realValue(target.parentId) == 0 && realValue(source.parentId) == 0)
                			|| (realValue(target.parentId) != 0 && realValue(source.parentId) != 0)) {
                		if(dropPosition == 'append') {
                			return false;
                		}
                		return true;
                	} else {
                		if(realValue(target.parentId) == 0) {
                			if(dropPosition == 'before' || dropPosition == 'after') {
                				return false;
                			} else {
                				return true;
                			}
                		} else if(realValue(source.parentId) == 0) {
                			return false;
                		} else {
                			return false;
                		}
                	}
                }
            }
        },
		columns: [{   
	        xtype: 'treecolumn',
	        text : '模块功能列表',
	        dataIndex : 'codename',
	        width : 300
	    }],
		border : 0
	}, {
		region : 'center',
		scroll : false,
		border : false,
		layout : 'fit',
		items : [ 
		         {
		        	xtype : 'tabpanel',
		        	border : false,
		        	layout : 'fit',
		        	defaults : {
	    				style : 'padding:2px;'
	    			},
		        	items : [{
		    			title : '基本信息',
		    			scroll : true,
		    			border : false,
		    			split : false,
		    			collapsible : false,
		    			collapsed : false,
		    			layout : {
		    				type : 'table',
		    				columns : 2
		    			},
		    			defaults : {
		    				labelWidth : 80,
		    				width : 300,
		    				readOnly : true,
		    				style : 'margin-left:10px;margin-right:5px;margin-top:10px;margin-bottom:10px;',
		    				xtype : 'textfield'
		    			},
		    			items : [ {
		    				id : 'parentCode',
		    				fieldLabel : '模块编码'
		    			}, {
		    				id : 'parentName',
		    				fieldLabel : '模块名称'
		    			}, {
		    				id : 'moduleCode',
		    				fieldLabel : '功能编码'
		    			}, {
		    				id : 'moduleName',
		    				fieldLabel : '功能名称'
		    			}, {
		    				id : 'className',
		    				fieldLabel : 'JSP名称'
		    			}, {
		    				id : 'dllPath',
		    				fieldLabel : '功能权限',
		    				xtype : 'combo',
		    				displayField : 'name',
		    				valueField : 'value',
		    				readOnly : true,
		    				store : new Ext.data.Store( {
		    					fields : [ 'name', 'value' ],
		    					data : [ {
		    						'name' : '无',
		    						'value' : ''
		    					}, {
									'name' : '1-辅办网点',
									'value' : '1'
								}, {
									'name' : '2-主办网点',
									'value' : '2'
								}, {
									'name' : '3-无（配置功能）',
									'value' : '3'
								}, {
									'name' : '4-主办行办理网点',
									'value' : '4'
								}, {
									'name' : '5-财政零余额',
									'value' : '5'
								} , {
									'name' : '6-专户',
									'value' : '6'
								} , {
									'name' : '7-划款户',
									'value' : '7'
								} , {
									'name' : '10-自助柜面收入流水使用',
									'value' : '10'
								},  {
									'name' : '41-主办行可以查看直接支付的数据',
									'value' : '41'
								},  {
									'name' : '20-非税财政专户',
									'value' : '20'
								}]
		    				})
		    			}, {
		    				id : 'ref_js',
		    				width : 620,
		    				colspan: 2,
		    				fieldLabel : '个性化脚本',
		    				xtype : 'textfield'
		    			}, {
		    				id : 'remark',
		    				width : 620,
		    				colspan: 2,
		    				fieldLabel : '功能说明',
		    				xtype : 'textareafield'
		    			}]
		    		}, {
		    			title : '按钮信息',
		    			scroll : true,
		    			border : false,
		    			split : false,
		    			collapsible : false,
		    			collapsed : false,
		    			items : [ {
		    				id :'buttons',
		    				xtype : 'checkboxgroup',
		    				layout : {
			    				type : 'table',
			    				columns : 4
			    			},
		    				defaults : {
			    				readOnly : true,
			    				style : 'margin:5px 5px 5px 10px;'
			    			}
		    			} ]
		    		},{
		    			scroll : true,
		    			border : false,
		    			split : false,
		    			collapsible : false,
		    			collapsed : false,
		    			layout : 'fit',
		    			title : '状态信息',
		    			xtype : 'gridpanel',
		    			columns : [ {
		    				text : '状态编码',
		    				dataIndex : 'status_code',
		    				width : 100
		    			}, {
		    				text : '状态名称',
		    				dataIndex : 'status_name',
		    				width : 200
		    			}, {
		    				text : '是否启用',
		    				dataIndex : 'is_enabled',
		    				width : 80,
		    				renderer : function(value) {
		    					if (value == 1) {
		    						return '是';
		    					} else {
		    						return '否';
		    					}
		    				}
		    			}, {
		    				text : '过滤条件',
		    				dataIndex : 'conditionStr',
		    				width : 500
		    			} ],
		    			store : 'common.Status'
		    		}]
		         }
		        ]
	} ],
	initComponent : function() {
		this.dockedItems = [ {
			xtype : 'toolbar',
			items : {
				xtype : 'buttongroup',
				items : [ {
					id : 'addModuleParent',
					text : '新增模块',
					iconCls : 'add',
					scale : 'small'
				}, {
					id : 'deleteModule',
					text : '删除',
					iconCls : 'delete',
					scale : 'small'
				}, {
					id : 'addModule',
					text : '新增功能',
					iconCls : 'add',
					scale : 'small'
				}, {
					id : 'copyModule',
					text : '复制功能',
					iconCls : 'add',
					scale : 'small'
				}, {
					id : 'editModule',
					text : '修改功能',
					iconCls : 'edit',
					scale : 'small'
				}, {
					id : 'refreshModule',
					text : '刷新',
					iconCls : 'refresh',
					scale : 'small'
				} ]
			}
		} ];
		this.callParent(arguments);
	},
	setValue:function(record,statusstore){
		statusstore.removeAll();
		if(record==null || record.data.leaf == false){
			Ext.getCmp('parentCode').setValue('');
			Ext.getCmp('parentName').setValue('');
			Ext.getCmp('moduleCode').setValue('');
			Ext.getCmp('moduleName').setValue('');
			Ext.getCmp('className').setValue('');
			Ext.getCmp('dllPath').setValue('');
			Ext.getCmp('remark').setValue('');
			Ext.getCmp('ref_js').setValue('');
			Ext.getCmp('buttons').removeAll();
		}else{
			Ext.getCmp('parentCode').setValue(record.parentNode.raw.code);
			Ext.getCmp('parentName').setValue(record.parentNode.raw.name);
			Ext.getCmp('moduleCode').setValue(record.raw.code);
			Ext.getCmp('moduleName').setValue(record.raw.name);
			Ext.getCmp('className').setValue(record.raw.class_name);
			Ext.getCmp('dllPath').setValue(record.raw.dll_path);
			Ext.getCmp('remark').setValue(record.raw.remark);
			Ext.getCmp('ref_js').setValue(record.raw.ref_js);
			var buttons = record.raw.buttons;
			Ext.getCmp('buttons').removeAll();
			if (buttons.length > 0) {
				for ( var i = 0; i < buttons.length; i++) {
					Ext.getCmp('buttons').add({
						boxLabel : buttons[i].button_name,
						name : 'rbtns',
						inputValue : buttons[i].button_id,
						checked: buttons[i].visible==1?true:false,
						status_codes : buttons[i].status_codes,
						enable_admdivs : buttons[i].enable_admdivs,
						disable_admdivs : buttons[i].disable_admdivs,	
						readOnly : true
					});
				}
			}
			var status = record.raw.statusList;
//			if (status.length > 0) {
//				Ext.Array.each(status,function(s){
//					s.conditionStr = s.conditionStr.replace(/#/g,'\''); //全部替换#为'
//				});
				statusstore.insert(0,status);
//			}
		}
	}
});
