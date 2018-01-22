<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>财政凭证对账单生成</title>
		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
       <script type="text/javascript" src="<%=path%>/resources/js/CheckAmtVoucherForAgency.js"></script>
	</head>
	<script type="text/javascript">
		var loadMainUrl = "<%=path%>/loadCheckVoucherAgency.do";
		var loadListUrl = "<%=path%>/loadCheckDetail.do";
		var deleteURL="<%=path%>/deleteCheckAmtVourcher.do";
   </script>
	<body></body>
</html>