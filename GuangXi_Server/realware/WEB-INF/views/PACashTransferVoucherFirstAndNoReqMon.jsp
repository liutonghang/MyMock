﻿<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>授权支付凭证转账确认(现金)</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
		var controllers = [ 'pay.PayVouchers','pay.ConfirmCashVouchers', 'common.TaskLog' ];
		var mainView = {
				xtype : 'cashVoucherList'
			};
	</script>
	<body></body>
</html>
