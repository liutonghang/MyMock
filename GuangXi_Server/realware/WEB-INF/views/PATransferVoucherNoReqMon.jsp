<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>授权支付凭证复核转账（不用请款）</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
		var backPrePostUrl = "<%=path%>/unsubmitVoucher.do";     //退回上一岗
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var backUrl = "<%=path%>/returnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var vtCode = "8202";   //授权支付凭证类型
		var account_type_right = "12";
		var accountType = "22";
		var first = false;
		var controllers = [ 'pay.PayVouchers','pay.TransferVouchers','common.TaskLog' ];
		var mainView = {
				xtype : 'transferVoucherList'
			};
   </script>
	<body id="body"></body>
</html>
