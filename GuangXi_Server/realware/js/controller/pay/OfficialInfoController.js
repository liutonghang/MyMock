/*******************************************************************************
 * 公务卡开卡核实界面事件处理器
 * 
 * @memberOf {TypeName}
 */

Ext.define('pb.controller.pay.OfficialInfoController',{
		extend : 'Ext.app.Controller',
		stores : [ 'pay.PrCheckRightStore' ],
		models : [ 'pay.PrCheckRightModel' ],
		requires : [ 'pb.view.pay.QueryOfficialInfoForSRCB','pb.view.pay.OfficialInfoQueryView','pb.view.pay.OffiMadeWindow' ],
		refs : [ {
			ref : 'list', // 当前控制层引用
			selector : 'queryOfficialInfoForSRCB' // 控件的别名
		}, {
			ref : 'offiMadeWindow', // 单笔开卡
			selector : 'offiMadeWindow'
		}, {
			ref : 'query',
			selector : 'officialInfoQueryView'
		} ],
		onLaunch : function() {
			// 当前控制层
			var me = this;
			// 刷新数据前事件
			var queryView = Ext.ComponentQuery.query("panel[title='查询区']")[0];
			me.getStore('pay.PrCheckRightStore').on('beforeload', function(thiz, options) {
						// 查询区
							if (isExistStatus) {
								// 当前状态控件
							var taskState = Ext.getCmp('taskState');
							// 当前状态对应的查询条件
							var condition = taskState.valueModels[0].raw.conditions;
							// 查询条件拼装至后台
							Ext.PageUtil.onBeforeLoad(condition,queryView,me.getModel('pay.PrCheckRightModel'),options);
						} else {
							Ext.PageUtil.onBeforeLoad(null,queryView,me.getModel('pay.PrCheckRightModel'),options);
						}
					});
			var panel = Ext.ComponentQuery.query('viewport > panel')[0];
			if (!isExistStatus) {
				Ext.PageUtil.onInitList(panel,'pay.PrCheckRightStore');
				if (initialLoad) {
					me.getStore('pay.PrCheckRightStore').load();
				}
			} else {
				/**
				 * 初始化切换列表使用的store
				 */
				Ext.PageUtil.onInitPage(panel, _menu.statusList,'pay.PrCheckRightStore');
				/**
				 * 初始化页面
				 */
				Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"),
						Ext.getCmp("taskState"), true);
				Ext.getCmp("taskState").setValue(
						_menu.statusList[0].status_code);
			}

		},
		oneSelect : true,
		isExistStatus : true, // 是否有状态
		// 事件的定义
		init : function() {
			this.control( {
						// 查询区
						'queryOfficialInfoForSRCB combo[id=taskState]' : {
							// 状态选中 edit by wangtongbo
							change : function(combo, newValue,oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
								} catch (e) {
								}
							}
						},
						// ////////////////////////按钮区///////////////////////////
						// 刷新
						'queryOfficialInfoForSRCB button[id=refresh]' : {
							click : this.refreshDa
						// 注 : 当该方法没有参数的时候可以直接这样写
						},
						// 核实相符
						'queryOfficialInfoForSRCB button[id=auditRight]' : {
							click : this.auditRight
						},
						// 核实不符
						'queryOfficialInfoForSRCB button[id=auditError]' : {
							click : this.auditError
						},
						// 人工入库
						'queryOfficialInfoForSRCB button[id=import]' : {
							click : this.importData
						},
						// 人工匹配
						'queryOfficialInfoForSRCB button[id=match]' : {
							click : this.matchData
						},
						// 单笔开卡
						'queryOfficialInfoForSRCB button[id=made]' : {
							click : this.madeData
						},
						// 打印
						'queryOfficialInfoForSRCB button[id=print]' : {
							click : this.printdata
						},
						// 单笔开卡
						'offiMadeWindow button[id=parentSave]' : {
							click : this.parentSave
						},
						// 关闭单笔开卡界面
						'offiMadeWindow button[id=parentClose]' : {
							click : function() {
								this.getOffiMadeWindow().close();
							}
						}
					// //////////////////////END///////////////////////
					})
		},

		
		/**
		 * 切换状态 注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
		 * 
		 * @param {Object}
		 *            status_code 状态code
		 */
		selectState : function(status_code) {
			if ('001' == status_code) { // 未核实
				Ext.getCmp('auditRight').setDisabled(false);
				Ext.getCmp('auditError').setDisabled(false);
				Ext.getCmp('import').setDisabled(false);
				Ext.getCmp('match').setDisabled(false);
				Ext.getCmp('made').setDisabled(true);
			} else if ('002' == status_code) { // 核实相符
				Ext.getCmp('auditRight').setDisabled(false);
				Ext.getCmp('auditError').setDisabled(false);
				Ext.getCmp('import').setDisabled(false);
				Ext.getCmp('match').setDisabled(false);
				Ext.getCmp('made').setDisabled(false);
			} else if ('003' == status_code) { // 核实不符
				Ext.getCmp('auditRight').setDisabled(false);
				Ext.getCmp('auditError').setDisabled(false);
				Ext.getCmp('import').setDisabled(false);
				Ext.getCmp('match').setDisabled(false);
				Ext.getCmp('made').setDisabled(true);
			} else if ('004' == status_code) { // 已开卡
				Ext.getCmp('auditRight').setDisabled(true);
				Ext.getCmp('auditError').setDisabled(true);
				Ext.getCmp('import').setDisabled(false);
				Ext.getCmp('match').setDisabled(false);
				Ext.getCmp('made').setDisabled(true);
			} else if ('005' == status_code) { // 已签章发送
				Ext.getCmp('auditRight').setDisabled(true);
				Ext.getCmp('auditError').setDisabled(true);
				Ext.getCmp('import').setDisabled(false);
				Ext.getCmp('match').setDisabled(false);
				Ext.getCmp('made').setDisabled(true);
			}
			Ext.getCmp(Ext.getCmp('taskState').getValue())
					.getStore().loadPage(1);
		},

		/**
		 * 刷新按钮
		 * 
		 * @memberOf {TypeName}
		 */
		refreshDa : function() {
			if (Ext.getCmp("agency_code").getValue().length == 0
					&& Ext.getCmp("card_holder_no").getValue().length == 0) {
				Ext.Msg.alert('系统提示', '请输入身份证号或单位编码查询！');
			} else {
				this.getStore('pay.PrCheckRightStore').loadPage(1);
			}
		},

		/**
		 * 刷新
		 * 
		 * @memberOf {TypeName}
		 */
		refreshData : function() {
			if (Ext.getCmp("agency_code").getValue().length == 0
					&& Ext.getCmp("card_holder_no").getValue().length == 0) {
				// Ext.Msg.alert('系统提示','请输入身份证号或单位编码查询！');
			} else {
				this.getStore('pay.PrCheckRightStore').loadPage(1);
			}
		},

		// 核实相符
		auditRight : function() {
			if (Ext.getCmp("agency_code").getValue().length == 0
					|| Ext.getCmp("card_holder_no").getValue().length == 0) {
				Ext.Msg.alert('系统提示', '请先输入身份证号和单位编码查询后再进行操作！');
			} else {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				if (records != null) {
					if (records.length != 1) {
						Ext.Msg.alert('系统提示',
								'只可选择一条公务卡明细进行核实，请重选！');
					} else {
						var ids = []; // 凭证主键字符串
						var vHolderNo = "";
						var vAgencyCode = "";
						Ext.Array.each(records,
								function(model) {
									ids.push(model.get("id"));
									vAgencyCode = model
											.get("agency_code");
									vHolderNo = model
											.get("card_holder_no");
								});
						if (Ext.getCmp("card_holder_no").getValue() != vHolderNo
								|| Ext.getCmp("agency_code")
										.getValue() != vAgencyCode) {
							Ext.Msg
									.alert('系统提示',
											'请按条件查询后再选择核实数据！');
						} else {
							var params = {
								billIds : Ext.encode(ids),
								flag : "auditRight"
							};
							// OfficialInfoController.java
							Ext.PageUtil.doRequestAjax(me,
									'/realware/PrCardInfoAudit.do',
									params);
						}
					}
				}
			}
		},

		// 核实不符
		auditError : function() {
			if (Ext.getCmp("agency_code").getValue().length == 0
					|| Ext.getCmp("card_holder_no").getValue().length == 0) {
				Ext.Msg.alert('系统提示', '请先输入身份证号和单位编码查询后再进行操作！');
			} else {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));

				if (records != null) {
					if (records.length != 1) {
						Ext.Msg.alert('系统提示',
								'只可选择一条公务卡明细进行核实，请重选！');
					} else {
						var ids = []; // 凭证主键字符串
						var vHolderNo = "";
						var vAgencyCode = "";
						Ext.Array.each(records,
								function(model) {
									ids.push(model.get("id"));
									vAgencyCode = model
											.get("agency_code");
									vHolderNo = model
											.get("card_holder_no");
								});
						if (Ext.getCmp("card_holder_no").getValue() != vHolderNo
								|| Ext.getCmp("agency_code")
										.getValue() != vAgencyCode) {
							Ext.Msg
									.alert('系统提示',
											'请按条件查询后再选择核实数据！');
						} else {
							var params = {
								billIds : Ext.encode(ids),
								flag : "auditError"
							};
							// OfficialInfoController.java
							Ext.PageUtil.doRequestAjax(me,
									'/realware/PrCardInfoAudit.do',
									params);
						}
					}
				}
			}
		},

		// 人工入库
		importData : function() {
			Ext.PageUtil.doRequestAjax(this,
					'/realware/OffiCardFileImport.do', null);
		},

		// 人工匹配
		matchData : function() {
			Ext.PageUtil.doRequestAjax(this,
					'/realware/OffCardMatch.do', null);
		},

		// 单笔开卡
		madeData : function() {
			var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
			var vFlag = 0;
			if (records != null) {
				if (records.length != 1) {
					Ext.Msg.alert('系统提示', '只可选择一条公务卡明细进行开卡，请重选！');
				} else {
					Ext.Array.each(records, function(model) {
						if (model.get("deal_status") == "502") {
							Ext.Msg.alert('系统提示', '核实不符的卡信息不可开卡！');
							vFlag = 1;
						}
					});
					if (vFlag == 0) {
						Ext.create('pb.view.pay.OffiMadeWindow')
								.show();
					}
				}
			}
		},

		// 单笔开卡保存
		parentSave : function() {
			var w = this.getOffiMadeWindow();
			// 获取单笔开卡的表单
			var form = w.getForm();
			var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext
					.getCmp('taskState').getValue()));
			var vCardNo = Ext.ComponentQuery.query(
					'textfield[id=card_no]', w)[0].getValue();
			var vAffirmCardNo = Ext.ComponentQuery.query(
					'textfield[id=affirm_card_no]', w)[0]
					.getValue();
			var vCardMadeDate = Ext.util.Format.date(
					Ext.ComponentQuery.query(
							'textfield[id=card_made_date]', w)[0]
							.getValue(), 'Y-m-d');
			if (!vCardNo || !vAffirmCardNo) {
				Ext.Msg.alert('系统提示', '请输入卡号和确认卡号！');
			} else if (vCardNo != vAffirmCardNo) {
				Ext.Msg.alert('系统提示', '两次输入结果不一致，请确认！');
			} else if (isNaN(vCardNo) || isNaN(vAffirmCardNo)) {
				Ext.Msg.alert('系统提示', '卡号必须为纯数字！');
			} else if (vCardNo.length != 16
					|| vAffirmCardNo.length != 16) {
				Ext.Msg.alert('系统提示', '卡号长度需为16位，请确认！');
			} else if (vCardNo.substr(0, 3) != "628"
					&& vCardNo.substr(0, 3) != "622") {
				Ext.Msg.alert('系统提示', '卡号需以628或622开头，请确认！');
			} else {
				// 凭证主键字符串
				var ids = []; // 凭证主键字符串
				Ext.Array.each(records, function(model) {
					ids.push(model.get("id"));
				});
				var params = {
					billIds : Ext.encode(ids),
					flag : "offiCardNo",
					vou : vAffirmCardNo,
					date : vCardMadeDate
				};
				Ext.PageUtil.doRequestAjax(this,
						'/realware/OffiCardInfoCardMatch.do',
						params);
				form.reset();
				w.close();
			}
		},

		// 打印
		printdata : function() {

		}
	});
