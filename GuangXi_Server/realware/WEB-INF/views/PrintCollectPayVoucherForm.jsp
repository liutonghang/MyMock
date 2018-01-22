<%@ page language="java" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<base href="<%=basePath%>">

		<title>直接支付凭证汇总打印</title>

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
        <script type="text/javascript" src="<%=path%>/resources/js/PrintCollectVoucher.js"></script>
	</head>
	<script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		var loadGrfURL = "<%=path%>/loadReportByCode.do";
		var loadDataURL="<%=path%>/loadReportData.do";
		
		
		var loadUrl = "<%=path%>/loadBatchReqVoucher.do";
		var loadCollectGrfURL="<%=path%>/resources/grf/CollectPayVoucher.grf";
		var loadCollectDataURL="<%=path%>/loadCollectVoucherData.do";
		var printSucURL="<%=path%>/doBatchreqPrint.do";
		var vtCode ='5201';
   </script>
	<body></body>
</html>
