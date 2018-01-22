<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>


<html>
	<head>
		<title>零余额转发账户维护</title>
		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/js/AccountForm.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/json2String.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/Common_Validate.js"></script>
	</head>
	<script type="text/javascript">
		
		var loadUrl = "<%=path%>/loadAgencyZeroAccount.do";
		var synUrl = "<%=path%>/accountSyn.do";
		var importUrl="<%=path%>/importAccountOfAgencyZero.do";

		var account_type_code=120;
   </script>
	<body></body>
</html>
