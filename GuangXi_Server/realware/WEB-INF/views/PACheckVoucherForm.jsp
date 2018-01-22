﻿<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>授权支付凭证初审（行号补录）</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/json2String.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var loadVoucherWithBankNoUrl = "<%=path%>/loadPayVoucherWithBankNo.do";
		var backUrl = "<%=path%>/returnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var vtCode = "8202";   //授权支付凭证类型
		var account_type_right = "12";
		var is_onlyreq = 0;
		//控制器数组，用以创建viewport时的控制器     lfj 2015-05-15
		var controllers = [ 'pay.PayVouchers','pay.CheckVouchers','common.TaskLog' ];
		//主视图属性对象，xtype为必要属性，可在对象中增加其它 属性用以向页面或控制器中传递 lfj 2015-05-15
		var mainView = {
				xtype : 'checkVoucherList',
				myProperty : 'myProperty'
			};
   </script>
	<body id="body"></body>
</html>
