<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>签收失败数据查询</title>   
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/Fail.js"></script>
  </head>
  <script type="text/javascript">
  	var loadClearUrl = "<%=path%>/loadFail.do";
  	var logUrl = "<%=path%>/loadTaskLog.do";
	var isInput = false;
	var payMount = true;
  </script>
	<body></body>
</html>

