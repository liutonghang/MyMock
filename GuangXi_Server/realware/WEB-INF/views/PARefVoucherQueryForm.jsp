﻿﻿<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>授权支付退款支付凭证查询</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
		var menuStatusCash =  Ext.create('Ext.data.Store', {
			fields : ['status_code_cash', 'status_name_cash'],
			data : [
			{status_name_cash : '全部', status_code_cash: ''},
			{status_name_cash: '银行未发送', status_code_cash: '13'},
			{status_name_cash : '财政未接收', status_code_cash: '0'}, //发送的时候voucher_status设置值为0
			{status_name_cash : '财政接收成功', status_code_cash: '1'},
			{status_name_cash : '财政接收失败', status_code_cash: '2'},
			{status_name_cash : '财政签收成功', status_code_cash: '3'},
			{status_name_cash : '财政签收失败', status_code_cash: '4'},
			{status_name_cash : '财政已退回', status_code_cash: '5'}
			
			]
		});
		var  controllers = [ 'pay.PayVouchers','pay.RefundQueryVouchers' ];
		var mainView = {
					xtype : 'refundQueryVoucherList',
					hiddenvoustatus : true,
					hiddenstate : false,
					hiddenstateCash : false,
					valuename :'全部',
					valuenameCash : '全部'			
			};
   </script>
	<body></body>
</html>
