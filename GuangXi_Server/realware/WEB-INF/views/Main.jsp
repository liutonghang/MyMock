<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>首页</title>
		<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
		<meta http-equiv="description" content="this is my page">
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/admin.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<style type="text/css">
a:: {
	COLOR: #0000C6
}

a:LINK {
	COLOR: #0000C6
}

a:VISITED {
	COLOR: #0000C6
}

a:HOVER {
	COLOR: #FF0000
}
</style>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/main.js"></script>
	</head>
	<body onload="startclock()"> 
		<TABLE cellSpacing=0 cellPadding=0 width="100%" align=center border=0>
			<TR height=58>
				<TD></TD>
			</TR>
		</TABLE>
		<TABLE cellSpacing=0 cellPadding=0 width="90%" align=center border=0>
			<TR height=100>
				<TD align=center width=100>
					<IMG height=100 src="<%=path%>/resources/images/admin_p.gif"
						width=90>
				</TD>
				<TD width=60>
					&nbsp;
				</TD>
				<TD>
					<TABLE height=100 cellSpacing=0 cellPadding=0 width="100%" border=0>

						<TR>
							<TD style="FONT-WEIGHT: bold; FONT-SIZE: 9pt;">
								当前时间&nbsp;:&nbsp;<%=new java.text.SimpleDateFormat("yyyy年MM月dd日").format(new Date())%>
								<input id="thetime" name="thetime"
									style="FONT-WEIGHT: bold;font-size: 9pt; color: #000000; border: 0px none;" size=18>
							</TD>
						</TR>
						<TR>
							<TD style="FONT-WEIGHT: bold; FONT-SIZE: 9pt;">
							     用户编码&nbsp;:&nbsp;${userInfo.user_code}
							</TD>
						</TR>
						<TR>
							<TD style="FONT-WEIGHT: bold; FONT-SIZE: 9pt;">
							     用户名称&nbsp;:&nbsp;${userInfo.user_name}
							</TD>
						</TR>
						<TR>
						     <TD style="FONT-WEIGHT: bold; FONT-SIZE: 9pt;">
							     网点名称&nbsp;:&nbsp;${userInfo.bank_name}
							</TD>
						</TR>
						<TR>
						     <TD style="FONT-WEIGHT: bold; FONT-SIZE: 9pt;">
							     网点编码&nbsp;:&nbsp;${userInfo.bank_code}
							</TD>
						</TR>
						<TR>
						     <TD style="FONT-WEIGHT: bold; FONT-SIZE: 9pt" id="usertype">
							</TD>
						</TR>
						<TR>
							<TD  style="FONT-WEIGHT: bold; FONT-SIZE: 9pt">
								欢迎进入财政国库资金电子化管理系统！
							</TD>
						</TR>
					</TABLE>
				</TD>
			</TR>
			<TR>
				<TD colSpan=3 height=10></TD>
			</TR>
		</TABLE>
		<TABLE cellSpacing=0 cellPadding=0 width="95%" align=center border=0>
			<TR height=20>
				<TD></TD>
			</TR>
			<TR height=22>
				<TD style="PADDING-LEFT: 20px; FONT-WEIGHT: bold"
					align=center>
					您的待办事项【<a href="javascript:queryRemindInfos()">刷新</a>】
				</TD>
			</TR>
			<TR bgColor=#ecf4fc height=12>
				<TD></TD>
			</TR>
			<TR height=20>
				<TD></TD>
			</TR>
		</TABLE>
		<div  id="REMIND">
		<TABLE cellSpacing=0 cellPadding=2 width="95%" align=center border=0>
		</TABLE>
		</div>
	</body>
</html>
