<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>划款单打印</title>
		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/PrintClearVoucher.js"></script>
	</head>
	 <script type="text/javascript">
		
		var serverPrint = "<%=path%>/printClearVoucherForDB.do";
		
		var loadGrfURL = "<%=path%>/loadReportByCode.do";
		var loadDataURL="<%=path%>/loadReportData.do";
		var vt_code=2301;
  </script>
	<body>
		<!--<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="width: '1000px'; height: '600px'" ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>-->
	</body>
</html>
