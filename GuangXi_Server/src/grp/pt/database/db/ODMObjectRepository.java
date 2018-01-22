package grp.pt.database.db;

import grp.pt.borm.IObjectRunService;
import grp.pt.borm.model.ObjectAttrDTO;
import grp.pt.borm.model.ObjectDTO;
import grp.pt.borm.model.ObjectRelationDTO;
import grp.pt.database.ConcurrencyException;
import grp.pt.database.DaoSupport;
import grp.pt.database.DataAccessorException;
import grp.pt.database.Initable;
import grp.pt.database.ObjectRepository;
import grp.pt.database.ObjectUtil;
import grp.pt.database.PageCountHelper;
import grp.pt.database.SimpleObjectUtils;
import grp.pt.database.sql.Delete;
import grp.pt.database.sql.Eq;
import grp.pt.database.sql.Expression;
import grp.pt.database.sql.From;
import grp.pt.database.sql.In;
import grp.pt.database.sql.NativeSQL;
import grp.pt.database.sql.OrderBy;
import grp.pt.database.sql.SQLDefinition;
import grp.pt.database.sql.Select;
import grp.pt.database.sql.Set;
import grp.pt.database.sql.SimplePage;
import grp.pt.database.sql.SqlGenerator;
import grp.pt.database.sql.Table;
import grp.pt.database.sql.Update;
import grp.pt.database.sql.Where;
import grp.pt.database.sql.WhereExpression;
import grp.pt.pb.exception.PbConCurrencyException;
import grp.pt.util.BeanFactoryUtil;
import grp.pt.util.DatabaseUtils;
import grp.pt.util.DateTimeUtils;
import grp.pt.util.PropertyUtil;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;


/**
 * 数据库表访问类，使用注意：默认属性名与数据库字段一致才能正确保存
 * @author hlf
 *
 */
public class ODMObjectRepository implements ObjectRepository, ObjectStateDefinition, SessionTransactionDefinition {
	
	
	private static final Object NULL_OBJECT_IDENTITY = new Object();

	/**
	 * 管理多年度、多组织机构的缓存
	 */
	private static OrgYearObjectContext orgYearObjectContext = new OrgYearObjectContext();

	////////暂时先将缓存注册放在此处，日后需要将这层配置扩展到ODM上做一个是否缓存的属性
	/**
	 * 锁集合
	 * 类名-锁对象
	 */
	private static Map<String, Object> objectTypeNeedsCache = new HashMap<String, Object>();
	
	public static void registerCache(Class<?> clz){
		if (!objectTypeNeedsCache.containsKey(clz)){
			objectTypeNeedsCache.put(clz.getName(), new Object());
		}
	}
	////////////////////
	
	private DaoSupport daoSupport = null;
	
	private IObjectRunService opService = null;
	
	private PageCountHelper dbHelper = null;
	
	public ODMObjectRepository(){
		this(null);
	}
	
	public ODMObjectRepository(DaoSupport daoSupport){
		this(daoSupport, null);
	}
	
	public ODMObjectRepository(DaoSupport daoSupport, IObjectRunService opService){
		
		if (daoSupport == null){
			this.daoSupport = (DaoSupport) BeanFactoryUtil.getBean("bill.daosupport.daosupportimpl");
		}else{
			this.daoSupport = daoSupport;
		}
		
		if (opService == null){
			this.opService = (IObjectRunService) BeanFactoryUtil.getBean("borm.objectRunService");
		}else{
			this.opService = opService;
		}
		
		dbHelper = new PageCountHelper(daoSupport);
	}

	public void setDaoSupport(DaoSupport daoSupport){
		this.daoSupport = daoSupport;
		dbHelper = new PageCountHelper(daoSupport);
	}
	
	public void setOpService(IObjectRunService op){
		this.opService = op;
	}
	
	/**
	 * 打开一个Session事务
	 */
	public SessionTransaction openSessionTransaction(Session session){
		return SessionTransaction.openTransaction(session);
	}
	
	public <T> void delete(Session sc, Class<T> clz, WhereExpression where){
		ObjectDTO objectDescriptor = getObjectDescriptorIfNullError(clz);
		
		Delete delete = generateDelete(sc, objectDescriptor, where);
		daoSupport.executeUpdate(SqlGenerator.generateSql(delete));
		
		this.clearSessionIfRequire(sc, objectDescriptor);
		this.clearCacheIfRequire(objectDescriptor);
	}
	
	public <T> void delete(Session sc, List<T> objects){
		if (objects == null || objects.size() == 0){
			return;
		}
		
		ObjectDTO objectDescriptor = getObjectDescriptorIfNullError(objects);
		
		if (this.isSessionTransactionOpened(sc)){
			invalidateListOfSessionIfRequire(sc, objectDescriptor, objects);
		}else{
			
			ODMJdbcDeleteHelper helper = new ODMJdbcDeleteHelper(objectDescriptor, objects);
			String sql = SqlGenerator.generateSql(helper.getSqlObject());
			daoSupport.excuteUpdateBatch(sql, helper, false);
			removeListFromCacheIfRequire(sc, objectDescriptor, objects);
		}
	}
	
	public void delete(Session sc, Object object){
		if (object == null){
			return;
		}
		List<Object> objs = new ArrayList<Object>(1);
		objs.add(object);
		delete(sc, objs);
	}
	
	public <T> void deleteByKey(Session sc, Class<T> clz, Object key){
		if (key == null){
			return;
		}
		
		List<Object> idList = new ArrayList<Object>(1);
		idList.add(key);
		this.deleteByKeys(sc, clz, idList);
	}
	
	public <T> void deleteByKeys(Session sc, Class<T> clz, List<? extends Object> keys){
		if (keys == null || keys.isEmpty()){
			return;
		}
		ObjectDTO objectDesc = ObjectUtil.getObjectDesc(clz);
		
		if (isSessionTransactionOpened(sc)){
			
			for(Object identity : keys){
				invalidateObjectOfSessionIfRequire(sc, objectDesc, identity);
			}
			
		}else{
			ObjectAttrDTO idDesc = ObjectUtil.getIdPrimaryField(objectDesc);
			Where where = new Where();
			where.add(new In(null, idDesc.getField_name(), keys));
			String sql = SqlGenerator.generateSql(generateDelete(sc, objectDesc, where));
			daoSupport.executeUpdate(sql);
		}
	}
	
	/**
	 * 生成删除语句，Delete from xxx_table支持集中式部署
	 * @param table 删除对象
	 * @param where 条件语句
	 * @param genIdCond 是否根据ID字段生成删除语句Where id=#id#
	 * @return 返回删除对象
	 */
	private Delete generateDelete(Session sc, ObjectDTO table, WhereExpression where){
		Delete delete = new Delete();
		delete.from(new Table(table.getObj_source()));
		if (where == null){
			where = new Where();
			where.addLogic(SQLDefinition.ONE_EQUALS_ONE);
		}
		/*
		 * 大集中，是否生成根据ID的删除语句由参数决定
		 * modify by hlf 2012/03/29
		 */
		addOrgAndYearCondition(sc, where, table, null);
		delete.where(where);
		return delete;
	}
	
	/**
	 * 生成查询方法
	 * @param sc
	 * @param table
	 * @param fieldNames
	 * @param where
	 * @return
	 */
	private Select generateSelect(Session sc, ObjectDTO table, List<String> fieldNames, WhereExpression where){
		
		Select select = new Select();
		if (where == null){
			where = new Where().addLogic(SQLDefinition.ONE_EQUALS_ONE);
		}
		select.from(new Table(table.getObj_source(), getQueryTableAlias(table.getObj_id())));
		select.where(where);
		
		addOrgAndYearCondition(sc, where, table, getQueryTableAlias(table.getObj_id()));
		
		List<ObjectAttrDTO> attrs = ObjectUtil.getMatchFields(table, fieldNames);
		java.util.Set<Long> reladtedObjIdToUse = new HashSet<Long>();
		for(ObjectAttrDTO objAttr : attrs){
			long ref_obj_id = objAttr.getRef_obj_id();
			if(ref_obj_id > 0){
				reladtedObjIdToUse.add(ref_obj_id);
				addSelectField(select, ref_obj_id, objAttr);
			}else if (ref_obj_id < 0 || StringUtil.isEmpty(objAttr.getField_name())){
				//modify by hlf 2012/04/17非查询字段不查询
				continue;
			}else {
				long obj_id = objAttr.getObj_id();
				addSelectField(select, obj_id, objAttr);
			}
		}
		addVisualFieldIfExists(select, fieldNames);

		if (!reladtedObjIdToUse.isEmpty()){
			addRelatedFrom(sc, select, table, reladtedObjIdToUse);
			addRelatedWhere(sc, select, table, reladtedObjIdToUse);
		}

		return select;
	}
	
	/**
	 * 用于单条数据查询，不带排序与分页
	 * @param sc
	 * @param table
	 * @param fieldNames
	 * @param where
	 * @param orderby
	 * @param page
	 * @return
	 */
	private String generateSelectSql(Session sc, ObjectDTO table, List<String> fieldNames, WhereExpression where){
		return SqlGenerator.generateSql(table, generateSelect(sc, table, fieldNames, where));
	}

	private String getQueryTableAlias(long objId){
		return QUERY_RELATION_ALIAS +"_"+ objId;
	}
	
	/**
	 * 读取对象定义
	 * @param clz 类
	 * @return 根据类名找到的对象定义
	 * @throws DataAccessorException
	 */
	private ObjectDTO getObjectDescriptorIfNullError(Class<?> clz){
		ObjectDTO result = ObjectUtil.getObjectDesc(clz);
		if (result == null){
			throw new DataAccessorException(clz.getName()+"缺少对象定义");
		}
		
		return result;
	}
	
	private ObjectDTO getObjectDescriptorIfNullError(List<?> list){
		Class<?> clz = list.get(0).getClass();
		return getObjectDescriptorIfNullError(clz);
	}
	
	/**
	 * 
	 * @param objectDescriptor
	 * @return
	 */
	private ObjectAttrDTO getPrimaryAttribute(ObjectDTO objectDescriptor){
		ObjectAttrDTO primaryAttrbuite = ObjectUtil.getIdPrimaryField(objectDescriptor);
		if (primaryAttrbuite == null){
			throw new DataAccessorException(objectDescriptor.getClass_name()+"缺少主键定义");
		}
		
		return primaryAttrbuite;
	}

	public <T> void insert(Session sc, List<T> dataToInsert){
		if (dataToInsert == null || dataToInsert.size() == 0){
			return;
		}
		
		ObjectDTO objectDescriptor = getObjectDescriptorIfNullError(dataToInsert);
		
		if (!isSessionTransactionOpened(sc)){
			
			ODMJdbcInsertHelper helper = new ODMJdbcInsertHelper(objectDescriptor, dataToInsert);
			daoSupport.excuteUpdateBatch(SqlGenerator.generateSql(helper.getSqlObject()), helper, true);
			
		}else{
			
			for(Object object : dataToInsert){
				addObjectToSessionIfRequire(sc, objectDescriptor, object, NEW);
			}
			
			SessionTransaction trx = SessionTransaction.getCurrentSessionTransaction(sc);
			trx.commitImmediate(objectDescriptor);//会马上提交一次事物
		}
		
		clearCacheIfRequire(objectDescriptor);
	}

	public void insert(Session sc, Object object){
		if (object == null){
			return;
		}

		List<Object> objects = new ArrayList<Object>(1);
		objects.add(object);
		insert(sc, objects);
	}

	public <T> List<T> select(Session sc, Class<T> clz, WhereExpression where, OrderBy order){
		return select(sc, clz, null, where, order, null);
	}
	
	public <T> List<T> select(Session sc, Class<T> clz, List<String> fields,  
			WhereExpression where, OrderBy order, SimplePage paging){
		ObjectDTO objDesc = this.getObjectDescriptorIfNullError(clz);
		//add by liutianlong 2015-03-02 对应模型对应的表为空时，不进行查询。
		if(StringUtil.isEmpty(objDesc.getObj_source())){
			return null;
		}
		//end add
		return select(sc, objDesc, fields, where, order, paging);
	}

	@SuppressWarnings("unchecked")
	public <T> List<T> select(Session sc, ObjectDTO objectDescriptor, List<String> fields,  
			WhereExpression where, OrderBy order, SimplePage paging){

		Select select = generateSelect(sc, objectDescriptor, fields, where);
		if (objectDescriptor.hasObjAttr("last_ver")) {
			select.orderBy(DateTimeUtils.addLastVerOrder(order));//按last_ver排序
		}
		
		dbHelper.setPageTotleCount(objectDescriptor, paging, select);
		String selectsql = null;//避免KEY为NULL
		if (paging == null){//不分页
			selectsql = SqlGenerator.generateSql(objectDescriptor, select);
		}else if (paging.isLoadData()){//查数据
		    if(paging.getDataCount() == 0 && paging.isLoadDataCount()){//2016-6-6 10:09:22 sh 查询总个数为0,不再进行分页查询
                //return Collections.EMPTY_LIST;
            }
			Expression pageSelect = SimpleObjectUtils.createPageSelect(select, paging);
			selectsql = SqlGenerator.generateSql(objectDescriptor, pageSelect);
		}else{//不查数据
			//return Collections.EMPTY_LIST;
		}
		System.out.println(selectsql);
		int nowPageNo = 0;
		int nowPage = 0;
		if(paging!=null){
			nowPageNo = paging.getNowPageNo();
			nowPage = paging.getNowPage();
		}
		List<T> result = loadFromDatabase(sc, objectDescriptor, selectsql,nowPageNo,nowPage);
		return result;
	}

	/**
	 * 
	 */
	@SuppressWarnings("unchecked")
	public <T> T selectByKey(Session sc, Class<T> clz, Object keyValue) {
		
		ObjectDTO objectDescriptor = getObjectDescriptorIfNullError(clz);
		ObjectAttrDTO primaryAttribute = getPrimaryAttribute(objectDescriptor);
		
		T result = (T) loadFromSession(sc, objectDescriptor, keyValue);
		
		if (result == null){
			result = (T) loadFromCache(sc, objectDescriptor, keyValue);
		}
		
		if (result == null){
			Where where = new Where();
			where.add(new Eq(primaryAttribute.getField_name(), keyValue));
			String insertSql = generateSelectSql(sc, objectDescriptor, null, where);
			result = daoSupport.queryForObject(insertSql, clz);
			if (result != null){
				addObjectToSessionIfRequire(sc, objectDescriptor, result, NONE);
				addObjectToCacheIfRequire(sc, objectDescriptor, result);
				if (Initable.class.isAssignableFrom(result.getClass())){
					((Initable)result).init();
				}
			}
		}
		
		return result;
	}

	@SuppressWarnings("unchecked")
	public <T> List<T> selectByKey(Session sc, Class<T> cz, List<? extends Object> keys) {
		
		if (keys == null){
			return null;
		}
		
		ObjectDTO objectDescriptor = getObjectDescriptorIfNullError(cz);
		ObjectAttrDTO primaryAttribute = getPrimaryAttribute(objectDescriptor);
		
		List<T> valueToReturn = new ArrayList<T>();
		List<Object> keysNeedLoadFromDatabase = new ArrayList<Object>(keys.size());
		for(Object identity : keys){
			Object object = loadFromSession(sc, objectDescriptor, identity);
			
			if (object == null){
				object = loadFromCache(sc, objectDescriptor, identity);
			}
			
			if (object == null){
				keysNeedLoadFromDatabase.add(identity);
			}else{
				valueToReturn.add((T) object);
			}
		}
		
		if (keysNeedLoadFromDatabase.size() > 0){
			Where where = new Where();
			In in = new In(null, primaryAttribute.getField_name(), keysNeedLoadFromDatabase);
			where.add(in);
			Select select = generateSelect(sc, objectDescriptor, null, where);
			List<T> queryResult = daoSupport.query(SqlGenerator.generateSql(select), cz);
			for(T ret : queryResult){
				if (ret != null && Initable.class.isAssignableFrom(ret.getClass())){
					((Initable)ret).init();
				}
			}
			this.addListToSessionIfRequire(sc, objectDescriptor, null, queryResult, NONE);
			this.addListToCacheIfRequire(sc, objectDescriptor, null, queryResult);
			valueToReturn.addAll(queryResult);
		}
		return valueToReturn;
	}

	public <T> void update(Session sc, Class<T> clz, Set set, Where condition){
		ObjectDTO objectDescriptor = getObjectDescriptorIfNullError(clz);
		Update update = new Update();
		update.table(objectDescriptor.getObj_source());
		update.set(set);
		update.where(condition);
		daoSupport.executeUpdate(SqlGenerator.generateSql(update));
		
		clearSessionIfRequire(sc, objectDescriptor);
		clearCacheIfRequire( objectDescriptor);
	}

	public <T> void update(Session sc, List<String> fieldNames, List<T> objects, boolean ignoreUpdates){
		update(sc, fieldNames, null, objects, ignoreUpdates);
	}
		
	public <T> void update(Session sc, List<String> fieldNames, Where where, 
			List<T> objects, boolean ignoreUpdates) {
		if (objects == null || objects.isEmpty()){
			return;
		}
		
		ObjectDTO objectDescriptor = getObjectDescriptorIfNullError(objects);
		ODMJdbcUpdateHelper helper = new ODMJdbcUpdateHelper(objectDescriptor, fieldNames, objects, where);
		
		if (sc!=null&&this.isSessionTransactionOpened(sc)){
			if (helper.isFullFiledUpdate()){
				addListToSessionIfRequire(sc, objectDescriptor, null, objects, UPDATE);
				return;
			}else{
				this.removeListFromSessionIfRequire(sc, objectDescriptor, objects);
			}
		}

		Update update = helper.getUpdate();
		ObjectAttrDTO lastVerAttr = helper.getLastVerAttr();
		//加入查询的where条件 last_ver=last_ver;
		int ret[] = daoSupport.excuteUpdateBatch(SqlGenerator.generateSql(update), helper, ignoreUpdates);
		if (lastVerAttr != null){
			long lastVer = helper.getLastVer();
			for(Object o : objects){
				PropertyUtil.setProperty(o, lastVerAttr.getAttr_code(), lastVer);
			}
		}
		
		if (ret.length != objects.size()){
			throw new ConcurrencyException("并发异常，请重新加载数据进行操作！");
		}
		
		if(!ignoreUpdates) {
			for(int i : ret){
				if(i == PreparedStatement.SUCCESS_NO_INFO ){
					//执行成功
				}else if (i == PreparedStatement.EXECUTE_FAILED){
					throw new ConcurrencyException("并发异常，请重新加载数据进行操作！");
				}else if (i ==0 ){
					throw new PbConCurrencyException("并发异常，未更新到数据！");
				}else if (i != 1){
					throw new RuntimeException("数据更新执行异常，更新数据比预期多！");
				}
			}
		}
		
		//正式提交时刷新缓存
		clearCacheIfRequire(objectDescriptor);
	}

	public <T> void update(Session sc, List<T> objects){
		update(sc, null, objects);
	}
	
	public void update(Session sc, Object obj){
		List<Object> objs = new ArrayList<Object>(1);
		objs.add(obj);
		update(sc, objs);
	}
	
	public int selectCount(Session sc, ObjectDTO table, WhereExpression where){
		Select select = this.generateSelect(sc, table, null, where);
		//查询个数时不需要查询所有的字段值
		select.fields(new ArrayList<Expression>()).addField(null, "1");
		Select selectCount = new Select();
		selectCount.addField(null, " count(1)", "count_").from(new From().addSelect(select, "p"));
		select.orderBy((OrderBy)null);//优化SQL，去掉ORDER BY
		int count = daoSupport.queryForInt(SqlGenerator.generateSql(table, selectCount));
		return count;
	}
	
	//查询加缓存
	@SuppressWarnings("unchecked")
	private <T> List<T> loadFromDatabaseAndCache(Session sc, ObjectDTO objectDescriptor, String selectsql,int pageNo, int pageNum){
		Class<?> objectClass = ObjectUtil.getObjectClass(objectDescriptor);
		ObjectAttrDTO primaryAttribute = getPrimaryAttribute(objectDescriptor);
		List<T> objectFromDatabase =null;
		if(DatabaseUtils.SYSBASE_DB == DatabaseUtils.findLocalDB() && pageNum>0) {
			objectFromDatabase = (List<T>) daoSupport.query(selectsql, objectClass,pageNo,pageNum);
		}else{
			objectFromDatabase = (List<T>) daoSupport.query(selectsql, objectClass);
		}
		List<T> resultWithCache = new ArrayList<T>(objectFromDatabase.size());
		boolean needInit = Initable.class.isAssignableFrom(objectClass);
		
		for(T databaseObject : objectFromDatabase){
			Object identity = PropertyUtil.getProperty(databaseObject, primaryAttribute.getAttr_code());

			//先在缓存中查找，如果查询不到则到Session中查
			Object cacheObject = loadFromCache(sc, objectDescriptor, identity);
			if (cacheObject != null){
				resultWithCache.add((T) cacheObject);
			}

			Object sessionObject = loadFromSession(sc, objectDescriptor, identity);
			if (sessionObject != null && cacheObject == null){
				resultWithCache.add((T) sessionObject);
			}else if (sessionObject == null && cacheObject == null){
				resultWithCache.add(databaseObject);

				//对象进行初始化，必须将其先放入缓存，避免出现死循环的情况
				if (needInit){
					addObjectToCacheIfRequire(sc, objectDescriptor, databaseObject);
					addObjectToSessionIfRequire(sc, objectDescriptor, databaseObject, NONE);
					((Initable) databaseObject).init();
				}
			}
		}
		addListToCacheIfRequire(sc, objectDescriptor, selectsql, resultWithCache);
		addListToSessionIfRequire(sc, objectDescriptor, selectsql, resultWithCache, NONE);
//		if(resultWithCache.size()==0){
//			resultWithCache = null;
//		}
		return resultWithCache;
	}
	
	private <T> List<T> loadFromDatabase(Session sc, ObjectDTO objectDescriptor, String selectsql,int pageNo, int pageNum){
		Class<?> objectClass = ObjectUtil.getObjectClass(objectDescriptor);
		return loadFromDatabase(sc, objectClass, selectsql, pageNo, pageNum);
	}
	
	@SuppressWarnings("unchecked")
	private <T> List<T> loadFromDatabase(Session sc, Class<?> objectClass, String selectsql,int pageNo, int pageNum){
		if(DatabaseUtils.SYSBASE_DB == DatabaseUtils.findLocalDB() && pageNum>0) {
			return (List<T>) daoSupport.query(selectsql, objectClass,pageNo,pageNum);
		}else{
			return (List<T>) daoSupport.query(selectsql, objectClass);
		}
	}

	//缓存处理
	private void removeListFromCacheIfRequire(Session session, ObjectDTO objectDescriptor, List<?> objects){
		if (!objectTypeNeedsCache.containsKey(objectDescriptor.getClass_name())){
			return;
		}
		
		synchronized (objectTypeNeedsCache.get(objectDescriptor.getClass_name())) {
			
			ObjectAttrDTO primaryAttribute = getPrimaryAttribute(objectDescriptor);
			for(Object object : objects){
				Object identity = PropertyUtil.getProperty(object, primaryAttribute.getAttr_code());
				OrgYearKey key = new OrgYearKey(session, objectDescriptor, identity);
				orgYearObjectContext.removeObject(key);
			}
		}
	}
	
	private void addObjectToCacheIfRequire(Session session, ObjectDTO objectDescriptor, Object object){
		if (!objectTypeNeedsCache.containsKey(objectDescriptor.getClass_name())){
			return;
		}
		
		synchronized (objectTypeNeedsCache.get(objectDescriptor.getClass_name())) {
			ObjectAttrDTO primaryAttribute = getPrimaryAttribute(objectDescriptor);
			Object identity = PropertyUtil.getProperty(object, primaryAttribute.getAttr_code());
			OrgYearKey key = new OrgYearKey(session, objectDescriptor, identity);
			orgYearObjectContext.addObject(key, object, NONE);
		}
	}
	
	private Object loadFromCache(Session session, ObjectDTO objectDescriptor, Object identity){
		if (!objectTypeNeedsCache.containsKey(objectDescriptor.getClass_name())){
			return null;
		}
		
		OrgYearKey key = new OrgYearKey(session, objectDescriptor, getIdentityNotNull(identity));
		return orgYearObjectContext.getObject(key);
	}
	
	private <T> List<T> loadListFromCache(Session session, ObjectDTO objectDescriptor, Object identity){
		if (!objectTypeNeedsCache.containsKey(objectDescriptor.getClass_name())){
			return null;
		}
		
		OrgYearKey key = new OrgYearKey(session, objectDescriptor, getIdentityNotNull(identity));
		
		return orgYearObjectContext.getList(key);
	}

	private void clearCacheIfRequire( ObjectDTO objectDescriptor) {
		if (!objectTypeNeedsCache.containsKey(objectDescriptor.getClass_name())){
			return;
		}
		
		orgYearObjectContext.clear();
	}
	
	private void addListToCacheIfRequire(Session session, ObjectDTO objectDescriptor, Object identity, List<?> objects){
		if (!objectTypeNeedsCache.containsKey(objectDescriptor.getClass_name())){
			return;
		}
		
		OrgYearKey key = new OrgYearKey(session, objectDescriptor, getIdentityNotNull(identity));
		orgYearObjectContext.addList(objectDescriptor, key, objects, NONE);
	}
	
	//Session处理
	
	private boolean isSessionTransactionOpened(Session session){
		return getSessionObjectContext(session) != null;
	}
	
	private ObjectContext getSessionObjectContext(Session session){
		return (ObjectContext) session.getCustomParam().get(SESSION_OBJECT_CONTEXT);
	}
	
	private void invalidateListOfSessionIfRequire(Session session, ObjectDTO objectDescriptor, List<?> objects){
		ObjectContext sessionObjectContext = getSessionObjectContext(session);
		ObjectAttrDTO primaryAttribute = getPrimaryAttribute(objectDescriptor);
		
		if (sessionObjectContext != null){
			for(Object object : objects){
				Object identity = PropertyUtil.getProperty(object, primaryAttribute.getAttr_code());
				ObjectKey objectKey = new ObjectKey(objectDescriptor, identity);
				sessionObjectContext.setObjectDeleted(objectKey);
			}
		}
	}
	
	private void invalidateObjectOfSessionIfRequire(Session session, ObjectDTO objectDescriptor, Object identity){
		ObjectContext sessionObjectContext = getSessionObjectContext(session);
		
		if (sessionObjectContext != null){
			ObjectKey objectKey = new ObjectKey(objectDescriptor, identity);
			sessionObjectContext.setObjectDeleted(objectKey);
		}
	}
	
	private Object loadFromSession(Session session, ObjectDTO objectDescriptor, Object identity){
		ObjectContext sessionObjectContext = getSessionObjectContext(session);
		
		Object result = null;
		if (sessionObjectContext != null){
			Key objectKey = new ObjectKey(objectDescriptor, getIdentityNotNull(identity));
			result = sessionObjectContext.getObject(objectKey);
		}
		
		return result;
	}
	
	private <T> List<T> loadListFromSession(Session session, ObjectDTO objectDescriptor, Object identity){
		ObjectContext sessionObjectContext = getSessionObjectContext(session);
		
		List<T> result = null;
		if (sessionObjectContext != null){
			Key objectKey = new ObjectKey(objectDescriptor, getIdentityNotNull(identity));
			result = sessionObjectContext.getList(objectKey);
		}
		
		return result;
	}
	
	private void addListToSessionIfRequire(Session session, ObjectDTO objectDescriptor, Object identity, List<?> objects, int state){
		ObjectContext sessionObjectContext = getSessionObjectContext(session);
		
		if (sessionObjectContext != null){
			ObjectKey objectKey = new ObjectKey(objectDescriptor, getIdentityNotNull(identity));
			sessionObjectContext.addList(objectDescriptor, objectKey, objects, state);
		}
	}

	private void addObjectToSessionIfRequire(Session session, ObjectDTO objectDescriptor, Object object, int state){
		ObjectContext sessionObjectContext = getSessionObjectContext(session);
		
		if (sessionObjectContext != null){
			ObjectAttrDTO primaryAttribute = getPrimaryAttribute(objectDescriptor);
			Object identity = PropertyUtil.getProperty(object, primaryAttribute.getAttr_code());
			ObjectKey objectKey = new ObjectKey(objectDescriptor, identity);
			sessionObjectContext.addObject(objectKey, object, state);
		}
	}
	
	private void clearSessionIfRequire(Session session, ObjectDTO objectDescriptor) {
		ObjectContext sessionObjectContext = getSessionObjectContext(session);
		
		if (sessionObjectContext != null){
			sessionObjectContext.clear();
		}
	}
	
	private void removeListFromSessionIfRequire(Session session, ObjectDTO objectDescriptor, List<?> objects){
		ObjectContext sessionObjectContext = getSessionObjectContext(session);
		
		if (sessionObjectContext != null){
			ObjectAttrDTO primaryAttribute = ObjectUtil.getIdPrimaryFieldQuiet(objectDescriptor);
			for(Object object : objects){
				Object identity = PropertyUtil.getProperty(object, primaryAttribute.getAttr_code());
				sessionObjectContext.removeObject(new ObjectKey(objectDescriptor, identity));
			}
		}
	}
	
	private Object getIdentityNotNull(Object identity){
		return identity == null ? NULL_OBJECT_IDENTITY : identity;
	}
	
	//查询处理
	
	/**
	 * 添加关联表语句
	 * @param sc 会话对象
	 * @param select 被添加的查询对象
	 * @param queryObj 待查询对象
	 * @param objIds 关联对象ID
	 */
	private void addRelatedFrom(Session sc, Select select, ObjectDTO queryObj, java.util.Set<Long> objIds){
		for(Long id : objIds){
			ObjectDTO relatedObjDesc = this.opService.getObjectById(sc, id);
			String tableAlias = getQueryTableAlias(relatedObjDesc.getObj_id());
			Table relatedTable = new Table(relatedObjDesc.getObj_source(), tableAlias);
			select.from(relatedTable);
		}
	}

	/**
	 * 添加关联条件语句
	 * @param sc 会话对象
	 * @param select 被添加的查询对象
	 * @param queryObj 待查询对象
	 * @param objIds 关联对象ID
	 */
	private void addRelatedWhere(Session sc, Select select, ObjectDTO queryObj, java.util.Set<Long> objIds){
		List<ObjectRelationDTO> relationAll = queryObj.getObjRelations();
		for(ObjectRelationDTO relation : relationAll){
			long refObjId = relation.getRef_obj_id();
			if(!objIds.contains(refObjId)){
				continue;
			}
			ObjectDTO relatedObjDesc = opService.getObjectById(sc, refObjId);
			ObjectAttrDTO relatedAttr = queryObj.getObjAttribute(relation.getAttr_code());
			ObjectAttrDTO relatedAttr2 = relatedObjDesc.getObjAttribute(relation.getRef_attr_code());
			String tableAlias = getQueryTableAlias(queryObj.getObj_id());
			String tableAlias2 = getQueryTableAlias(relatedObjDesc.getObj_id());
			select.where(new Eq(tableAlias, relatedAttr.getField_name(), tableAlias2+"."+relatedAttr2.getField_name()));
			addOrgAndYearCondition(sc, select.where(), relatedObjDesc, tableAlias2);
		}
	}
	
	/**
	 * 添加org与year过滤语句
	 * @param sc
	 * @param where
	 * @param relatedObjDesc
	 * @param tableAlias
	 */
	private void addOrgAndYearCondition(Session sc, WhereExpression where, ObjectDTO relatedObjDesc, String tableAlias){
		//TODO 去掉年度及top_org_id的过滤条件
//		if (relatedObjDesc.hasObjAttr("top_org_id")){
//			where.and(new Eq(tableAlias, "top_org_id", sc.getTop_org()));
//		}
//		if (relatedObjDesc.hasObjAttr("year")){
//			where.and(new Eq(tableAlias, "year", sc.getBusiYear()));
//		}
	}

	/**
	 * 拼查询字段
	 * @param select
	 * @param objId
	 * @param objAttr
	 */
	private void addSelectField(Select select, long objId, ObjectAttrDTO objAttr){
		select.addField(getQueryTableAlias(objId), objAttr.getField_name(), objAttr.getAttr_code());
	}

	/**
	 * 拼特殊虚拟子查询字段到Select对象上
	 */
	private void addVisualFieldIfExists(Select select, List<String> inputFields){
		if (inputFields == null || inputFields.size() == 0){
			return;
		}
		
		for(String field : inputFields){
			if(field != null && field.startsWith("visual:") && field.length() > 6){
				select.addField(new NativeSQL(field.substring(7)));
			}
		}
	}

	public <T> void update(Session sc, List<String> fieldNames, List<T> objects){
		update(sc, fieldNames, objects, false);
	}
}
