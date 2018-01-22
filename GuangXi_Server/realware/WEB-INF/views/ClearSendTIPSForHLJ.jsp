<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <base href="<%=basePath%>">
    
    <title>划款单发送(tips)</title>
    
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<!-- ExtJS -->
	<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
	<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
	<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/json2.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/paging.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/ClearSendTIPSHLJ.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/tasklog.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/showvoucher.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/date.js"></script>
  </head>
  <script type="text/javascript">
  	var loadClearUrl = "<%=path%>/loadClearPayVoucher.do";
  	var logUrl = "<%=path%>/loadTaskLog.do";
  	var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
	var isback =  false;
	var payMount = false;
	var bank_type=${bank_type};
	var clearpay_trans=${DifBankclearTrans};
	var unCreateUrl="<%=path%>/unCreateClearVoucher.do";
  </script>
	<body></body>
</html>
