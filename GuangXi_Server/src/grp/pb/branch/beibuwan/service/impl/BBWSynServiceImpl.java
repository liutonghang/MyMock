package grp.pb.branch.beibuwan.service.impl;



import grp.pb.branch.beibuwan.service.BBWSynService;
import grp.pt.common.model.User;
import grp.pt.idgen.IdGen;
import grp.pt.pb.common.INetworkService;
import grp.pt.pb.common.IPbLogService;
import grp.pt.pb.common.IPbUserService;
import grp.pt.pb.common.dao.PbUserDAO;
import grp.pt.pb.common.model.Network;
import grp.pt.pb.common.model.PbUser;
import grp.pt.pb.exception.PbException;
import grp.pt.util.BaseDAO;
import grp.pt.util.CollectionUtils;
import grp.pt.util.MD5;
import grp.pt.util.model.Session;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
/**
 * 自动更新柜员和网点专用
 * 
 * @author lth
 * 
 */
public class BBWSynServiceImpl implements BBWSynService{
	private final static String UPDATE_SQL_NETWORK = "name#id";

	private static Logger log = Logger.getLogger(BBWSynServiceImpl.class);
	
	/**
	 * 更新柜员接口
	 */
	private  IPbUserService pbUserService;
	/**
	 * 更新网点接口
	 */
	private INetworkService netWorkService;
	/**
	 * 数据访问基类
	 */
	private BaseDAO baseDao;
	
	private IPbLogService logService;
	
	private PbUserDAO pbUserDao = null;
	
	public void synPbUserAndNetwork(List<PbUser> pbUserList_remote,List<Network> netWorkList_remote) throws Exception {

		Session sc = new Session();
		sc.setUserType(User.USER_TYPE_SUPPER);
		
		//1.网点
		List<Network> netWorks_Local = netWorkService.loadAllNetwork("");
		Object[] lists = checkNetWork(netWorks_Local,netWorkList_remote);
		List<Network> delList = (List<Network>) lists[0];
		List<Network> addList = (List<Network>) lists[1];
		List<Network> updList = (List<Network>) lists[2];
		
		
		
		if(!CollectionUtils.isListEmpty(updList)){
			//1.1更新网点
			baseDao.batchUpdate("gap_organize", UPDATE_SQL_NETWORK, updList);
		}
		//1.2新增网点
		if(!CollectionUtils.isListEmpty(addList)){
			
		    netWorkService.saveNetworks(sc, addList);
		}
		//1.3物理删除网点
		if(!CollectionUtils.isListEmpty(delList)){
			
		    baseDao.batchDeleteData("gap_organize", "id", delList);
		}
	    log.info("更新网点完毕");
		//2.柜员
		List<PbUser> pbUsers_local = pbUserService.loadpbUsersWithOutAdmin(null, null);
	    
	    Object[] userLists = checkPbUser(pbUsers_local,pbUserList_remote);
	    List<PbUser> delUserList = (List<PbUser>) userLists[0];
	    List<PbUser> addUserList = (List<PbUser>) userLists[1]; 
		List<PbUser> updUserList = (List<PbUser>) userLists[2]; 
	    
	    List<PbUser> allUserList = new ArrayList<PbUser>();
	    allUserList.addAll(updUserList);
	    allUserList.addAll(addUserList);
	    setBankId4PbUser(allUserList);
	    if(!CollectionUtils.isListEmpty(updUserList)){
	    	//2.1更新柜员 
	    	for(PbUser pbUser : updUserList){
			    pbUserService.editUser(sc,pbUser);
	    	}
	    }
	    if(!CollectionUtils.isListEmpty(addUserList)){
	    	//2.2新增柜员
		    addUsers(sc, addUserList);
	    }
	    if(!CollectionUtils.isListEmpty(delUserList)){
	    	//2.3删除柜员
		    pbUserService.delPbUsers(sc, delUserList);		    
	    }
	    log.info("更新柜员完毕");
	    
	}


	private void addUsers(Session sc, List<PbUser> pbUsers) {
		for (PbUser user : pbUsers) {	
			// 赋值
			setValue(sc, user);
			
		}
		baseDao.batchInsert("gap_user", pbUsers);
		
	}
	/**
	 * 添加PbUser时给PbUser 赋值
	 * 
	 * @param sc
	 * @param pbUser
	 */
	@SuppressWarnings("unused")
	private void setValue(Session sc, PbUser pbUser) {
		Timestamp curTime = pbUserDao.getBaseDao().getCurrentDateTime();
		pbUser.setEnabled(1);
		pbUser.setUser_id(getNextOrgVal());
		pbUser.setCreate_date(curTime);
		pbUser.setStart_date(curTime);
		pbUser.setLatest_op_date(curTime);
		pbUser.setPassword(MD5.createPassword("123456"));
	}

	/**
	 * 获得id
	 * 
	 * @return
	 */
	public long getNextOrgVal() {
		return IdGen.getInstance().getNumId("SEQ_GAP_USER_ID");
	}
	/**
	 * 给每一个新增柜员添加 bankId属性
	 */
	private void setBankId4PbUser(List<PbUser> userList) throws Exception{
		List<Network> allNetWorks = netWorkService.loadAllNetwork("");
		Map<String,Network> allNetWorksMap = new HashMap<String, Network>();
		for(Network network : allNetWorks){
			allNetWorksMap.put(network.getCode(), network);
		}
		for(PbUser pbUser : userList){
			Network network = allNetWorksMap.get(pbUser.getBank_code());
			if(network == null){
				throw new PbException("未找到柜员"+pbUser.getUser_code()+"对应的网点");
			}
			pbUser.setBank_id(network.getId());
			pbUser.setBank_name(network.getName());
			pbUser.setBelong_org((int) network.getId());

		}
	}



	/**
	 * 将远程的柜员列表和本地的柜员列表进行对比。
	 * return 本地的柜员列表:需要删除 ； 远程的柜员列表：需要新增 ；  changedPbUserList 需要改变
	 */
	private Object[] checkPbUser(List<PbUser> pbUsers_local,
			List<PbUser> pbUsers_remote) {
		
		
		List<PbUser> addList = new ArrayList<PbUser>();
		List<PbUser> updList = new ArrayList<PbUser>();
		List<PbUser> delList = new ArrayList<PbUser>();
		
		Map<String, PbUser> localMap = new HashMap<String, PbUser>();
		for(PbUser user : pbUsers_local){
			localMap.put(user.getUser_code(), user);
		}
		
		for(PbUser remoteUser : pbUsers_remote){
			PbUser localUser = localMap.get(remoteUser.getCode());
			if( localUser == null ){
				//远程有  本地没有
				addList.add(remoteUser);
			} else if(!checkPbUserDifference(remoteUser, localUser)){
				//远程有 本地也有  且不相同  需要更新
				localUser.setUser_name(remoteUser.getUser_name());
				localUser.setBank_code(remoteUser.getBank_code());
				
				updList.add(localUser);
			}
		}
		
		
		
		Map<String, PbUser> remoteMap = new HashMap<String, PbUser>();
		for(PbUser user2 : pbUsers_remote){
			remoteMap.put(user2.getUser_code(), user2);
		}
		
		for(PbUser localUser : pbUsers_local){
			PbUser remoteUser = remoteMap.get(localUser.getUser_code());
			if(remoteUser == null){
				//本地有  远程没有  需要删除
				delList.add(localUser);
			}
		}
		Object[] obj = {delList,addList,updList};
		return obj;
		
	}

	/**
	 * 将远程的柜员和本地的柜员进行对比。
	 * return 完全相同返回true ， 不相同返回false
	 */
	private boolean checkPbUserDifference(PbUser pbUser_remote, PbUser netWork_local) {
		if(pbUser_remote.getUser_code().equals(netWork_local.getUser_code()) &&
				pbUser_remote.getUser_name().equals(netWork_local.getUser_name()) &&
				pbUser_remote.getBank_code().equals(netWork_local.getBank_code()) &&
				pbUser_remote.getTellercode().equals(netWork_local.getTellercode())){
			return true;
		}
		return false;
	}

	/**
	 * 将远程的网点列表和本地的网点列表进行对比。
	 * return 本地的网点List:需要删除 ； 远程的网点Map：需要新增 ；  changedNetworkList 需要改变
	 */
	private Object[] checkNetWork(List<Network> netWorks_Local,
			List<Network> netWorkList_remote) {
		List<Network> addList = new ArrayList<Network>();
		List<Network> delList = new ArrayList<Network>();
		List<Network> updList = new ArrayList<Network>();
		Map<String, Network> localMap = new HashMap<String, Network>();
		for(Network net : netWorks_Local){
			localMap.put(net.getCode(), net);
		}
		
		for(Network net : netWorkList_remote){
			Network local = localMap.get(net.getCode());
			if(local == null){
				//远程有   本地没有  新增
				addList.add(net);
			}else if(!net.getName().equals(local.getName())){
				//远程有，本地也有，且不相同
				local.setName(net.getName());
				updList.add(local);
			}
		}
		
		Map<String, Network> remoeteMap = new HashMap<String, Network>();
		for(Network net2 : netWorkList_remote){
			remoeteMap.put(net2.getCode(), net2);
		}
		for(Network net2 : netWorks_Local){
			Network remote = remoeteMap.get(net2.getCode());
			if(remote == null){
				//本地有远程没有，则删除
				delList.add(net2);
			}
		
		}
		Object[] obj = {delList,addList,updList};
		return obj;
		
		
	}

	public IPbUserService getPbUserService() {
		return pbUserService;
	}

	public void setPbUserService(IPbUserService pbUserService) {
		this.pbUserService = pbUserService;
	}

	public INetworkService getNetWorkService() {
		return netWorkService;
	}

	public void setNetWorkService(INetworkService netWorkService) {
		this.netWorkService = netWorkService;
	}

	public BaseDAO getBaseDao() {
		return baseDao;
	}

	public void setBaseDao(BaseDAO baseDao) {
		this.baseDao = baseDao;
	}


	public IPbLogService getLogService() {
		return logService;
	}


	public void setLogService(IPbLogService logService) {
		this.logService = logService;
	}

	public PbUserDAO getPbUserDao() {
		return pbUserDao;
	}

	public void setPbUserDao(PbUserDAO pbUserDao) {
		this.pbUserDao = pbUserDao;
	}
	
	
	
}

