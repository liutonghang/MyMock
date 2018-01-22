<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>

		<title>入账通知单查询打印</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/PAAccountNoteHis.js"></script>
	</head>
	<script type="text/javascript">
		var loadPayAccountNoteHisUrl= "<%=path%>/loadPayAccountNoteHis.do";
		var serverPrint = "<%=path%>/printPayAccountNoteForDB.do";
		var billTypeId = 20;
   </script>
	<body></body>
</html>
