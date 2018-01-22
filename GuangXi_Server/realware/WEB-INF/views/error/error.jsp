<%@ page language="java" pageEncoding="UTF-8"%>
<%@page isErrorPage="true" %>
<%@page import="java.text.SimpleDateFormat"%>
<%@ page import="java.io.*"%>
<%@ page import="java.util.Enumeration"%>
<%@ page import="grp.pt.pb.common.model.PbUser"%>
<%@ include file="../common/taglibs.jsp"%>
<head>
<title>错误页面</title>
</head>
<body>
<table width="100%">
    <tr>
        <td style="border-bottom:dotted 1px Gray;" colspan="2" >
            <img src="resources/images/Error_32px.png" id="img1" />&nbsp;&nbsp;错误提示                               
        </td>
        <td></td>
    </tr>
    <tr>
        <td style="width: 45px" >
        </td>
        <td>尊敬的用户：<br />系统出现了异常，请重试。
            <br />如果问题重复出现，请向系统管理员反馈。<br /><br />
        </td>
    </tr>
</table>
<div id="errorMessageDiv" >
    <pre>
        <%
        	Exception ex1 = (Exception)request.getAttribute("exception"); 
            try {
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                PrintStream printStream = new PrintStream(byteArrayOutputStream);

                printStream.println();
                printStream.println("用户信息");
                printStream.print("账号：");
                PbUser user = (PbUser)request.getSession().getAttribute("userInfo");
                if(user != null) {
                	printStream.println(user.getUser_name());
                }
                printStream.println("访问的路径: " + request.getAttribute("javax.servlet.forward.request_uri"));
                printStream.println();

                printStream.println("异常信息");
                printStream.println(ex1.getClass() + " : " + ex1.getMessage());
                printStream.println();

                Enumeration<String> e = request.getParameterNames();
                if (e.hasMoreElements()) {
                    printStream.println("请求中的参数包括：");
                    while (e.hasMoreElements()) {
                        String key = e.nextElement();
                        printStream.println(key + "=" + request.getParameter(key));
                    }
                    printStream.println();
                }

                printStream.println("堆栈信息");
                ex1.printStackTrace(printStream);
                printStream.println();

                out.print(byteArrayOutputStream);    //输出到网页

            } catch (Exception ex) {
            }
        %>
    </pre>
</div>
</body>
</html>
