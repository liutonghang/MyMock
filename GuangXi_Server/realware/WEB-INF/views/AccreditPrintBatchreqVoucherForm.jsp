<%@ page language="java" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<base href="<%=basePath%>">

		<title>授权已请款打印(GX)</title>

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
        <script type="text/javascript" src="<%=path%>/resources/js/PrintBatchreqVoucherForInstant.js"></script>
        <script type="text/javascript" src="<%=path%>/resources/js/GridReportPrintOrView.js"></script>
        <script type="text/javascript" src="<%=path%>/resources/js/Report.js"></script>
	</head>
	<script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		var loadUrl = "<%=path%>/loadBatchReqVoucher.do";
		var loadGrfURL = "<%=path%>/loadReportByCode.do";
		var loadDataURL="<%=path%>/loadReportData.do";
		
		var loadFlowGrfURL="<%=path%>/resources/grf/PayFlowQuery.grf";
		var loadFlowDataURL="<%=path%>/loadFlowData.do";
		var loadBatchGrfURL="<%=path%>/resources/grf/BatchReqVoucher.grf";
		var loadBatchDataURL="<%=path%>/loadBatchData.do";
		var printSucURL="<%=path%>/doBatchreqPrint.do";
		var deleteURL="<%=path%>/deleteBatchreqVourcher.do";
		var vtCode='8202';
		//生成请款方式：createDaily日终生成一次；createInstant可即时生成
		var createReqMethod = 'createInstant';
   </script>
	<body></body>
</html>
