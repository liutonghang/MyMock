<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>直接支付汇总清算额度通知单签章发送</title>
		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/SignAndSendPayClearNote.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayClearNote.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var signAndSendUrl = "<%=path%>/signAndSendPayClearNote.do";
		var sendAgainUrl = "<%=path%>/sendPayClearNoteAgain.do";
		var vtCode = "5108";  
   </script>
	<body></body>
</html>
