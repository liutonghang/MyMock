<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>授权支付冲销凭证打印</title>
		<!-- 山东、广西使用 -->
		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/share/menuBtnStatus.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/gridPanel.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/json2String.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/createReport.js"></script>
        <script type="text/javascript" src="<%=path%>/resources/js/PrintWriteoffVoucher.js"></script>
	</head>
	<script type="text/javascript">
		var loadGrfURL = "<%=path%>/loadReportByCode.do";
		var loadDataURL="<%=path%>/loadReportData.do";
		
		var loadWGrfURL="<%=path%>/resources/grf/WriteoffVoucher.grf"; 
		var loadQGrfURL="<%=path%>/resources/grf/WriteoffVoucher2.grf";
		var loadWriteoffVoucherDataURL="<%=path%>/loadWriteoffVoucherData.do";
		var printSucURL="<%=path%>/doWriteoffVoucherPrint.do";
		var account_type_right = "12";
		var reportName = "PAWriteoff";
		var reportName2 = "PAWriteoff2";
   </script>
	<body></body>
</html>
