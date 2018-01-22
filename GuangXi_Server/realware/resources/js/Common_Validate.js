/**
 * @增加了常用的表单内容校验格式
 * @lihongbiao
 */
Ext.apply(Ext.form.field.VTypes,{
	commonId:function(v){
		return /^[\d\w_-]{1,32}$/.test(v);
	},
	commonIdText:"录入内容只能包含数字字母下划线和横线，长度不超过32",
	commonName:function(v){
		return /^([\w\d\u4e00-\u9fa5]{1,60})$/.test(v);
	},
	commonNameText:"录入内容只能是数字字母和汉字，长度不超过60",
	/**
	 * 账号
	 */
	accountId:function(v){
		return /^[\d\w_-]{1,32}$/.test(v);
	},
	accountIdText:"账号只能包含数字字母下划线和横线，长度不超过32",
	/**
	 * 账户名称
	 */
	accountName:function(v){
		return /^([\w-·\d\u4e00-\u9fa5（()）（）（）]{1,60})$/.test(v);
	},
	accountNameText:"账户名称只能是数字字母和汉字，长度不超过60",
	/**
	 * 电话号码
	 */
	commonPhone:function(v){
		return /^((\d{11})|(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/.test(v);
	},
	commonPhoneText:"支持手机号码，3-4位区号，7-8位直播号码，1－4位分机号"
	
});
