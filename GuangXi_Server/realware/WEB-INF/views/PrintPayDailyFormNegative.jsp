<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		

		<title>授权支付退款日报打印</title>

	 <%@ include file="common/meta.jsp"%>
	 <%@ include file="common/scripts.jsp"%>
     <script type="text/javascript" src="<%=path%>/resources/js/PrintPayDaily.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayDaily.do";
		var serverPrint = "<%=path%>/printVoucherForDB.do";
   </script>
</html>
