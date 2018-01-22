<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>授权支付凭证初审（行号补录）退票初审</title>
		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
	var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var loadVoucherWithBankNoUrl = "<%=path%>/loadPayVoucherWithBankNo.do";
		var backUrl = "<%=path%>/auditReturnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var vtCode = "8202";   //授权支付凭证类型
		var account_type_right = "12";
		var bank_type=${bank_type};
		var controllers = ['pay.APayVouchers','pay.CheckVoucher4HunanBOC' ];
		var mainView = {
			xtype: 'checkVouchers4HunanBocList'
		};
   </script>
	<body id="body"></body>
</html>
