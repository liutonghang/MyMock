package grp.pb.branch.gxboc.service;

public class TransResConfig {
	
	private String id;


	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	/***************************************************************************
	 * key
	 */
	private String code;

	/**
	 * keyname
	 */
	private String field_name;

	/**
	 * 顺序
	 */
	private int field_order;

	/***************************************************************************
	 * 长度
	 */
	private int field_length;

	/***************************************************************************
	 * 默认值
	 */
	private String defaule_value;
	
	/***
	 * 长度不够默认补值
	 */
	private String complement_value;

	/***************************************************************************
	 * 分隔符
	 */
	private String field_split;

	/***************************************************************************
	 * 备注
	 */
	private String remark;
	
	private String  field_type;
	
	private String key_name;
	
	private String dto_name;
	
	private String bill_id;
	

	public String getBill_id() {
		return bill_id;
	}

	public void setBill_id(String billId) {
		bill_id = billId;
	}

	public String getDto_name() {
		return dto_name;
	}

	public void setDto_name(String dtoName) {
		dto_name = dtoName;
	}

	public String getKey_name() {
		return key_name;
	}

	public void setKey_name(String keyName) {
		key_name = keyName;
	}

	/***
	 * 是否请求报文 0请求报文  1回执报文
	 */
	private int isrequest = 0;

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getField_name() {
		return field_name;
	}

	public void setField_name(String field_name) {
		this.field_name = field_name;
	}

	public int getField_order() {
		return field_order;
	}

	public void setField_order(int field_order) {
		this.field_order = field_order;
	}

	public int getField_length() {
		return field_length;
	}

	public void setField_length(int field_length) {
		this.field_length = field_length;
	}

	public String getDefaule_value() {
		return defaule_value;
	}

	public void setDefaule_value(String defaule_value) {
		this.defaule_value = defaule_value;
	}

	public String getField_split() {
		return field_split;
	}

	public void setField_split(String field_split) {
		this.field_split = field_split;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public int getIsrequest() {
		return isrequest;
	}

	public void setIsrequest(int isrequest) {
		this.isrequest = isrequest;
	}

	public String getComplement_value() {
		return complement_value;
	}

	public void setComplement_value(String complement_value) {
		this.complement_value = complement_value;
	}

	public String getField_type() {
		return field_type;
	}

	public void setField_type(String field_type) {
		this.field_type = field_type;
	}
}
