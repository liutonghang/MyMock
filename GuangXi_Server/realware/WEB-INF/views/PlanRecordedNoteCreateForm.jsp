<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    
    <title>授权额度到账通知单生成</title>

	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/PlanRecordedNoteCreate.js"></script>

  </head>
  
  <body>
    <script type="text/javascript">
	
	var loadBudgetNoteUrl = "<%=path%>/loadBudgetNote.do";
	var loadPlanRecordedNoteUrl="<%=path%>/loadPlanRecordedNotes.do";
	var backUrl = "<%=path%>/backPlanAgentNoteVouches.do";
	//var account_type_right=12;
   </script>
  </body>
</html>