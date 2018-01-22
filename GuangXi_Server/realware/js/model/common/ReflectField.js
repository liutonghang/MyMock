/***
 * 字段映射明细
 */
Ext.define('pb.model.common.ReflectField', {
	extend : 'Ext.data.Model',
		fields : [ {
		name : 'field_id',
		type : 'string'
	}, {
		name : 'reflect_id',
		type : 'string'
	}, {
		name : 'field_yname',
		type : 'string'
	}, {
		name : 'dto_name',
		type : 'string'
	}, {
		name : 'field_order',
		type : 'int'
	}, {
		name : 'field_length',
		type : 'string'
	}, {
		name : 'field_type',
		type : 'string'
	}, {
		name : 'field_zname',
		type : 'string'
	}, {
		name : 'default_value',
		type : 'string'
	}, {
		name : 'nullable',
		type : 'int'
	}, {
		name : 'format_value',
		type : 'string'
	}, {
		name : 'is_bill',
		type : 'int'
	}]
});
