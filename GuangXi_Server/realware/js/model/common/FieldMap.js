/**
 * 字段映射对象
 */
Ext.define('pb.model.common.FieldMap', {
	extend : 'Ext.data.Model',
		fields : [ {
		name : 'reflect_id',
		type : 'string'
	}, {
		name : 'reflect_name',
		type : 'string'
	}, {
		name : 'class_name',
		type : 'string'
	}, {
		name : 'biz_type_id',
		type : 'int'
	}, {
		name : 'is_enabled',
		type : 'int'
	}, {
		name : 'evoucher_num',
		type : 'int'
	}, {
		name : 'reflect_code',
		type : 'string'
	}, {
		name : 'print_default_page',
		type : 'int'
	}, {
		name : 'admdiv_code',
		type : 'string'
	}],
	hasMany : [ {
		model : 'pb.model.common.ReflectField',
		name : 'refList'
	}, {
		model : 'pb.model.common.ReflectField',
		name : 'list'
	}]
});
