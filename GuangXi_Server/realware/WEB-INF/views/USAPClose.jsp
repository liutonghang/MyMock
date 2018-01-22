<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <base href="<%=basePath%>">
    
    <title>农行统一页面注销关闭页面</title>
    
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<!--
	<link rel="stylesheet" type="text/css" href="styles.css">
	-->
	<script type="text/javascript">
	
	if (navigator.userAgent.indexOf("MSIE") > 0) {
		   if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
		    window.opener = null;
		    window.close();
		   } else {
		    window.open('', '_top');
		    window.top.close();
		   }
		  }
		  else if (navigator.userAgent.indexOf("Firefox") > 0) {
		   window.location.href = 'about:blank ';
		  } else {
		   window.opener = null;
		   window.open('', '_self', '');
		   window.close();
		  }
	</script>
  </head>
  
  <body>
    
  </body>
</html>
