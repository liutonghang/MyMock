<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>授权支付退款划款生成</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/CreateClearVoucher.js"></script>
	</head>
	 <script type="text/javascript">
		//黑龙江凭证导入vt_code，为避免与河北两种vt_code发生冲突，特殊处理vt_code
	 	var _vtCode = "2204";
	 	//1-逆向
	 	var flowType = 1;
     </script>
	<body></body>
</html>
