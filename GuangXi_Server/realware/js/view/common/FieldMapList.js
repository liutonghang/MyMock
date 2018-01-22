/***
 * 支付凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.FieldMapList', {
	extend: "Ext.grid.Panel",
    alias: 'widget.fieldlist',
  	frame : false,
	layout : 'fit',
	store: 'common.FieldMap',
	selType : 'rowmodel',
	plugins : Ext.create('Ext.grid.plugin.RowEditing', {
		clicksToEdit : 2,
		autoCancel : false,
        saveBtnText:'确定',
        cancelBtnText:'取消',
        errorsText:'错误',
        dirtyText:'你要确认或取消更改',
        errorSummary : false,
        // 添加监听事件点击保存则将数据保存到数据库中
        listeners:{
            edit:function(e){
				var record = e.grid.getSelectionModel().getSelection()[0];
				var ss = [];
				var reflect_id = record.get('admdiv_code')+record.get('reflect_code');
				var option = "edit";
				if(record.get('reflect_id')==''){
					record.set('reflect_id',reflect_id);
					option = "add";
				}
				ss.push(record.data);
				var params = {
					status : Ext.encode(ss),
					option : option
				};
				Ext.PageUtil.doRequestAjax(this,'/realware/updateReflectObject.do',params);
				
  		 },
  		canceledit : function( editor, context, eOpts ) {
  			var record = context.record;
  			var store = context.store;
  			var index = context.rowIdx;
  			if(Ext.isEmpty(record.get("reflect_id"))) {
  				store.removeAt(index);
  			}
  		}
	}
                    	
	}),
	tbar : [{ 
				id : 'admdivCode',
				fieldLabel : '所属财政',
				xtype : 'combo',
				dataIndex : 'admdiv_code',
				displayField : 'admdiv_name',
				emptyText : '请选择',
				valueField : 'admdiv_code',
				editable : false,
				store : comboAdmdiv,
				value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data.getAt(0).get('admdiv_code') : '',
				style : 'margin-left:5px;margin-right:5px;'
			}, 
		{
				id : 'add',
				text : '新增',
				iconCls : 'add',
				scale : 'small'
			}, {
				id : 'delete',
				text : '删除',
				iconCls : 'delete',
				scale : 'small'
			},  {
				id : 'modify',
				text : '编辑主单及明细',
				iconCls : 'edit',
				scale : 'small'
			},  {
				id : 'refresh',
				text : '刷新',
				iconCls : 'refresh',
				scale : 'small'
			}
		],

	       
	       
	columns : [ {
					text : 'reflect_id',
					dataIndex: 'reflect_id',
					width : 110,
					hidden : true,
					field : {
						xtype : 'textfield',
						allowBlank : true,
						blankText : '主键为必输项'
					}
			},{
					text : '字段映射名称',
					dataIndex : 'reflect_name',
					width : 190,
					field : {
						xtype : 'textfield',
						allowBlank : false,
						blankText : '字段映射名称为必输项',
						msgTarget:'side'
					}
			},{
					text : '类名',
					dataIndex : 'class_name',
					width : 360,
					field : {
						xtype : 'textfield',
						allowBlank : true,
						blankText : '类名为必输项'
					}
					
			},{
					text : '凭证类型',
					dataIndex : 'biz_type_id',
					width : 110,
					field : {
						xtype : 'textfield',
						allowBlank : false,
						blankText : '凭证类型为必输项',
						msgTarget:'side'
					}
					
			},{
					text : '是否启用',
					width : 100,
					dataIndex : 'is_enabled',
					allowBlank : false,
					value : 0,
					renderer : function(value) {
						if(value==1){
							return '是';
						}else{
							return '否';
						}
					},
					field : {
						xtype : 'combo',
						editable : false,
						displayField : 'name',
						valueField : 'value',
						store : new Ext.data.Store( {
							fields : [ 'name', 'value' ],
							data : [ {
								'name' : '是',
								'value' : 1
							}, {
								'name' : '否',
								'value' : 0
							} ]
						})
					}
			},{
					text : '下载条数',
					dataIndex : 'evoucher_num',
					width : 80,
					field : {
						xtype : 'textfield',
						disabled :false,
						blankText : '下载条数为必输项'
					}
					
			},{
					text : '凭证编码',
					dataIndex : 'reflect_code',
					width : 80,
					field : {
						xtype : 'textfield',
						allowBlank : false,
						blankText : '凭证编码为必输项',
						msgTarget:'side'
					}
					
			},{
					text : '凭证默认打印联数',
					dataIndex : 'print_default_page',
					width : 100,
					field : {
						xtype : 'textfield',
						disabled :true,
						blankText : '凭证默认打印联数为必输项'
					}
					
			},{
					text : '财政区划',
					dataIndex : 'admdiv_code',
					width : 150,
					field : {
						xtype : 'textfield',
						disabled :true,
						blankText : '财政区划为必输项'
					}
					
			}]

  
});
