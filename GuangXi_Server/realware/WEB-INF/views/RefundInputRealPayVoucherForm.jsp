<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		

		<title>实拨凭证退款录入</title>

	   <%@ include file="common/meta.jsp"%>
	   <%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/RefundCheckRealPayVoucher.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/gridPanel.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/menuBtnStatus.js"></script>
		</head>
	   <script type="text/javascript">
		var logUrl = "<%=path%>/loadTaskLog.do";
		//var vtCode = "5207";   //原直接支付凭证类型 
		var account_type_right='5';	//实拨账户
       </script>
	<body>
	</body>
</html>
