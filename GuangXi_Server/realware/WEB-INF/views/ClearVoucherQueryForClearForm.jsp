<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>划款单查询</title>
		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/QueryClearVoucherForClear.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadClearPayVoucher4ClearBank.do";
		var backUrl = "<%=path%>/returnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var loadGrfURL = "<%=path%>/loadReportByCode.do";
		var loadDataURL="<%=path%>/loadReportData.do";
		var isInput = false;
		var payMount = false;
		var sendCLearUrl = "<%=path%>/sendClearVoucher.do";
		var clearpay_trans=${DifBankclearTrans};
   </script>
	<body></body>
</html>
