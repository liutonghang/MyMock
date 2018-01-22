package grp.pb.branch.gxboc.web;

import grp.pt.bill.ConditionObj;
import grp.pt.bill.Paging;
import grp.pt.bill.ReturnPage;
import grp.pt.common.model.Role;
import grp.pt.common.model.UserRoleRule;
import grp.pt.pb.common.IFinService;
import grp.pt.pb.common.IPbUserService;
import grp.pt.pb.common.model.OperatorDTO;
import grp.pt.pb.common.model.PbUser;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.util.ConditionObjUtils;
import grp.pt.pb.util.JsonUtil;
import grp.pt.pb.util.PbParaConstant;
import grp.pt.pb.util.PbParameters;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.axis.utils.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 广西加载操作员个性化
 * @author LY 2013-7-16
 *
 */
@Controller
public class RoleAuthorizationForGXZHController {

	private static Logger log = Logger.getLogger(RoleAuthorizationForGXZHController.class);
	
	@Autowired
	private IPbUserService pbUserService; 
	
	@Autowired
	private IFinService finService;
	
	
	
	
	
	
	
	
	
	
	/**
	 * @param request
	 * @param response
	 * @param bankId
	 */
	public void loadOperatorBycode(HttpServletRequest request,
			HttpServletResponse response,long bankId ){
		response.setContentType("text/html;charset=UTF-8");
		PrintWriter writer = null;
		// 获取当前session对应的用户列表
		Session session = (Session) request.getSession().getAttribute("session");
		Session sc = (Session)session.clone();
		
		ConditionObj obj = ConditionObjUtils.getConditionObj(sc, request.getParameter("jsonMap"));
		Paging page = new Paging();
		page.setStartIndex(Integer.parseInt(request.getParameter("start")));
		page.setNowPage(Integer.parseInt(request.getParameter("page")));
		page.setNowPageNo(Integer.parseInt(request.getParameter("limit")));	
		page.setLoadDataCount(true);
		
		String[] fileds = JsonUtil.getStringArray4Json(request.getParameter("filedNames"));
		List<String> filedNames = Arrays.asList(fileds);

		try {
			writer = response.getWriter();
			
			//是否是主办网点
			boolean isHost = false;
			if( bankId==1 || sc.getUserType() == 4 ){  //超级管理员
				isHost = true;
			}else{
				// 当前网点否属于主办行网点
				int count = finService.countAdmdiv(bankId);
				if(count >= 1){
					isHost = true;
				}
			}
			
			String majorRoles = PbParameters.getStringParameter( PbParaConstant.MAJORBANKKNETZ_ROLES );
			String assistRoles = PbParameters.getStringParameter( PbParaConstant.ASSISTBANKKNETZ_ROLES );
			String roleIds = "";
			if (isHost) {// 当前为主办网点
				roleIds = majorRoles;// 主办网点角色
			}else{// 当前为主办网点
				roleIds = assistRoles;// 辅助网点角色
			}

			String bankCode = request.getParameter("bankCode");
			String roleids = assistRoles + "," + majorRoles;//授权角色 --王文军添加
			String targetRoles = assistRoles;
			List<PbUser> userList =null;
			if (StringUtils.isEmpty(bankCode)) {  // 全部网点
				//全部网点时，只能设置targetRoles为辅办角色，用户列表显示辅办、主办所有人员
				/**
				 * 实际上加载1、2、3级用户的全部网点
				 * 一级与超级管理员时，加载所有人员，二级网点时，需要加载下级，三级时加载本级
				 * lfj 2015-09-17
				 */
				ReturnPage r = pbUserService.loadPbUsers(sc, obj, page);
				if(r != null && !CollectionUtils.isEmpty(r.getPageData())) {
					userList = (List<PbUser>)r.getPageData();
				} else {
					userList = new ArrayList<PbUser>();
				}
			} else {  // 指定网点
				userList = pbUserService.loadpbUsersByBankCode(sc, obj, bankCode, page);
				//指定了网点，当前网点为主办行，则角色列表应该为主办行角色+辅办行角色
				if(isHost) {
					targetRoles = assistRoles + "," + majorRoles;
				}
			}
			
			List<String> userIds = new ArrayList<String>();
			for(int i=0;i<userList.size();i++){
				userIds.add(String.valueOf(userList.get(i).getUser_id()));
			}
			if(userIds.size()==0){
				return ;
			}
			
			//当前网点用户对应的角色
			List<UserRoleRule> userRoleList = pbUserService.loadUserRole(roleIds.split(","), userIds);
			// 初始化操作员角色
			List<Role> roleList = pbUserService.getRoleByIds(roleids.split(","));
			
			List<OperatorDTO> oList = this.getOperators(userList, userRoleList, roleList, targetRoles);
			ReturnPage returnPage = new ReturnPage(oList, page);
			String jsonArray = JsonUtil.getListViewPaging(returnPage, filedNames);
			writer.write(jsonArray);
			
		} catch (Exception e1) {
			log.error("加载操作员信息失败", e1);
			response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);     //设置失败标识   
			writer.write("加载操作员失败,原因:" + e1.getMessage() + "'}");   
		}
	}
	
	
	List<OperatorDTO> getOperators(List<PbUser> userList, List<UserRoleRule> userRoleList,List<Role> roleList,String roleids){
		HashMap<Long,ArrayList<Long>> typeMap = new HashMap<Long,ArrayList<Long>>();
		List<OperatorDTO> operatorList = new ArrayList<OperatorDTO>();
		for(PbUser user : userList){
			ArrayList<Long> aa = new ArrayList<Long>();
			for(UserRoleRule userRole : userRoleList){
				if(user.getUser_id() == userRole.getUser_id()){
					aa.add(userRole.getRole_id());
				}
			}
			typeMap.put(user.getId(), aa);
		}
		OperatorDTO o = null;
		for (PbUser pbUser : userList) {
			o = new OperatorDTO();
			o.setUser_code(pbUser.getUser_code());
			o.setUser_name(pbUser.getUser_name());
			o.setUserRoleOp_id(pbUser.getUser_id());
			long [] roleIds = new long[roleList.size()];
			StringBuffer typeBuffer = new StringBuffer();
			ArrayList<Long> aa = typeMap.get(pbUser.getId());
			int i = 0;
			for (Role r : roleList) {
				typeBuffer.append("<input name='" + o.getUser_code()+ "' type='checkbox' value='" + r.getId() + "' ");
				if(aa.size()>0 && aa.contains(r.getId())){
					typeBuffer.append("checked='true'");
				}
				//清算行网点				
//				Long bank_id = PbParameters.getIntParameter("pb.clearBank") ;	
				//ztl 2016年9月18日18:03:16   清算网点判断需要考虑市县级网点为清算网点，或同级其他网点因资金性质不同也有可能为清算网点，此处需要支持多个网点配置。
				String bank_ids = PbParameters.getStringParameter("pb.clearBank") ;	
				if(StringUtil.isTrimEmpty(bank_ids)){
					throw new PbException("未获取到清算网点配置信息，请联系管理员");
				}
				String[] bankIds  = bank_ids.split(",");
				if(!roleids.contains(r.getId()+"")){
					typeBuffer.append(" disabled ");
				}
				else{
					String clearBanlRoleids = PbParameters.getStringParameter("operator.clearbank.role");
					// 加载清算角色
					List<Role> clearBanlRoleList = pbUserService.getRoleByIds(clearBanlRoleids.split(","));
					for (Role role : clearBanlRoleList) {
						//1206.1207角色不是清算网点 也不能显示
						//ztl 2016年9月18日18:03:16   清算网点判断需要考虑市县级网点为清算网点，或同级其他网点因资金性质不同也有可能为清算网点，此处需要支持多个网点配置。
						for(String id:bankIds){
							if(r.getId() == role.getId()&& pbUser.getBank_id() != Long.parseLong(id)){
								typeBuffer.append(" disabled ");
							}
						}
					}
				}
				typeBuffer.append(">"+r.getName()+"</input>");
				roleIds[i] = r.getId();
				i++;
			}
			o.setUser_role(typeBuffer.toString());
			o.setRoleIds(roleIds);
			operatorList.add(o);
		}
		return operatorList;
	}
	
	
	/**
	 * 广西中行加载某个网点下的操作员
	 * @return json
	 */
	@RequestMapping(value = "/loadOperatorGXZH.do")
	public Object loadOperatorGXZH(HttpServletRequest request,
			HttpServletResponse response) {
		Session session = (Session) request.getSession().getAttribute("session");
		Session sc = (Session)session.clone();
		String bankStr = request.getParameter("bankId");
		long bankId;
		if(!StringUtils.isEmpty(bankStr)){
			bankId = Long.parseLong(bankStr);
		}else{
			bankId=sc.getBelongOrgId();
		}
		this.loadOperatorBycode(request, response, bankId);
		return null;
	}
	
	
}
