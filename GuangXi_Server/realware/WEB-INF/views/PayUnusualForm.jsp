<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<%
grp.pt.util.model.Session sc = (grp.pt.util.model.Session)request.getSession().getAttribute("session");
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>支付异常信息通知单</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/PayUnusualInputForm.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var bank_id = <%=sc.getBelongOrgId()%>;
		var payType= 1;
   </script>
	<body>
	</body>
</html>
