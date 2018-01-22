﻿<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>直接支付凭证复核转账（需要请款）</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var backUrl = "<%=path%>/returnVoucherAfterReq.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var vtCode = "5201";   //直接支付凭证类型
		var account_type_right = "11";
		var accountType = "21";
		var is_onlyreq = 0;
		var specialFundsNo= '${specialFundsNo}';//专项资金账号		
		var controllers = [ 'pay.PayVouchers','pay.TransferVouchers', 'common.TaskLog' ];
		var mainView = {
				xtype : 'transferVoucherList'
			};
   </script>
   
	<body></body>
</html>
