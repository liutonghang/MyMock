<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>自助柜面异常数据的查询和处理界面</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var backUrl = "<%=path%>/returnVoucherAfterReq.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var account_type_right = "12";
		var accountType = "22";
		var is_onlyreq = 0;
		var vtCode = "8202";
		var specialFundsNo= '${specialFundsNo}';//专项资金账号
		var controllers = [ 'pay.PayVouchers','pay.ExceptionHandVouchers','common.TaskLog' ];
		var mainView = {
				xtype : 'transferVoucherList'
			};
   </script>
	<body></body>
</html>
