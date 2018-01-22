<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
	<title>公务卡变更查询</title>
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/js/VoucherForm.js"></script>
		
	</head>
	<script type="text/javascript">
		var controllers = [ 'pay.OfficialInfoChangeController' ];
		var mainView = {
				xtype : 'officialInfoChangeList'
			};
   </script>
	<body id="body"></body>
</html>
