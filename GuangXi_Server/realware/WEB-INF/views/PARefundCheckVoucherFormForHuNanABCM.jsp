<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    
    <title>授权支付凭证退款复核转账（密码授权，测试使用，投产后可以去掉）</title>
    <%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/RefundTransferVoucherForHuNanABCM.js"></script>

  </head>
  <script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var loadGrfURL = "<%=path%>/loadReportByCode.do";
		var loadDataURL="<%=path%>/loadReportData.do";
		var backUrl = "<%=path%>/unsubmitVoucher.do";
		var loadGrfURL = "<%=path%>/loadReportByCode.do";
		var loadDataURL="<%=path%>/loadReportData.do";
		var account_type_right = "12";
		var vtCode = "2204";   //直接支付退款通知书
  </script>
  <body>
  </body>
</html>
