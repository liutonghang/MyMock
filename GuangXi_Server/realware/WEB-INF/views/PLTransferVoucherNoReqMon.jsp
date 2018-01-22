﻿<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>直接支付凭证复核转账（不用请款）</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";    //加载支付凭证
		var backUrl = "<%=path%>/returnVoucher.do";		//退回财政
		var logUrl = "<%=path%>/loadTaskLog.do";      //操作日志路径
		var backPrePostUrl = "<%=path%>/unsubmitVoucher.do";		//退回初审
		var vtCode = "5201";   //直接支付凭证类型
		var account_type_right = "11";   //财政零余额账户类型
		var accountType = "21";
		var first = false;   //是否第一岗
		var specialFundsNo= '${specialFundsNo}';//专项资金账号
		var controllers = [ 'pay.PayVouchers','pay.TransferVouchers','common.TaskLog' ];
		var mainView = {
				xtype : 'transferVoucherList'
			};
   </script>
	<body id="body"></body>
</html>