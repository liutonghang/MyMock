<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>   
    <title>用户维护界面</title>
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
<!--  	<script type="text/javascript" src="<%=path%>/js/pbUserManagerForm.js"></script> -->
	<script type="text/javascript" src="<%=path%>/resources/js/UserManager.js"></script>
	<script type="text/javascript" src="<%=path%>/resources/js/addUser.js"></script> 
	<script type="text/javascript" src="<%=path%>/resources/js/editUser.js"></script>
	
	
  </head>
  <body>
    <script type="text/javascript">
	var heights = document.body.clientHeight;	
	var importUserUrl="<%=path%>/importUsers.do";
   </script>
  </body>
</html>
