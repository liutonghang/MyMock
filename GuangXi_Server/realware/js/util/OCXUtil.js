/***
 * OCX工具类
 * 
 */
Ext.define('Ext.OCXUtil', {
	//静态方法: 调用说明 Ext.OCXUtil.方法(参数1,参数2....)
		statics : {
			/****
			 * 
			 * @param {Object} ids 凭证主键 
			 * @param {Object} billTypeId 单据类型
			 * @param {Object} pageNo 当前联数
			 * @param {Object} type  0 show 1 print
			 * @memberOf {TypeName} 
			 */
			doOCX : function(ids,billTypeId,pageNo,type){
				var params = null;
				if (type != 1) {
					type = 0;
					params = {
						id : ids,
						menu_id :  Ext.PageUtil.getMenuId(),
						billTypeId : billTypeId
					};
				} else {
					params = {
						ids : ids,
						menu_id :  Ext.PageUtil.getMenuId(),
						billTypeId : billTypeId
					};
				}
				var me = this;
				var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
				});
				var initOCX = false;
				myMask.show();
				// 提交到服务器操作
				Ext.Ajax.request({
					url : '/realware/ocxVoucher.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : params,
					// 提交成功的回调函数
					success : function(response, options) {
						myMask.hide();
						var obj = new Function('return' + response.responseText)();
						if (!initOCX) {
							me.setUrl(obj.evoucherUrl, obj.esatmpUrl);
							initOCX = true;
						}
						if(type==0){
							me.init(obj.certID, obj.admivCode, obj.year, obj.vtCode);
							me.addVoucher(obj.vouNos);
							me.setCurrentVoucher(obj.vouNos);
						}else{
							me.printVoucher(obj.certID, obj.admivCode,obj.year, obj.vtCode, obj.vouNos,pageNo);
						}
					},
					// 提交失败的回调函数
					failure : function(response, options) {
						myMask.hide();
						if (response.status == -1) {
							alert('查看凭证超时，可能存在网络异常，检查后请重试...');
						} else {
							alert('失败原因:' + response.responseText);
						}
					}
				});
			},
			/***
			 * 设置地址
			 * @param {Object} evoucherUrl 凭证库地址
			 * @param {Object} estampUrl  印章地址
			 */
			setUrl : function(evoucherUrl, estampUrl) {
				try {
					var ActiveX = document.getElementById('CTJEstampOcx');
					if (ActiveX) {
						var ret = ActiveX.SetEvoucherServiceUrl(evoucherUrl);
						var ret = ActiveX.SetEstampServiceUrl(estampUrl);
						if (ret != 0) {
							alert(ActiveX.GetLastErr());
						}
					} else {
						alert('get ActiveX failure\n');
					}
				} catch (e) {
				}
			},
			/***
			 * 初始化
			 * @param {Object} certId 
			 * @param {Object} admivCode 行政区划
			 * @param {Object} year 年度
			 * @param {Object} vtCode 凭证类型
			 */
			init : function(certId, admivCode, year, vtCode) {
				try {
					var ActiveX = document.getElementById('CTJEstampOcx');
					if (ActiveX) {
						var ret = ActiveX.Initialize(
								certId == undefined ? "123" : certId,
								admivCode, year, vtCode, '0', 0, 0, 0);
						if (ret != 0) {
							alert(ActiveX.GetLastErr());
						}
					} else {
						alert('get ActiveX failure\n');
					}
				} catch (e) {
				}
			},
			/***
			 * 添加凭证
			 * @param {Object} vouNo 凭证号
			 */
			addVoucher : function(vouNo) {
				try {
					var ActiveX = document.getElementById('CTJEstampOcx');
					if (ActiveX) {
						var ret = ActiveX.AddVoucherfromServer(vouNo);
						if (ret != 0) {
							alert(ActiveX.GetLastErr());
						}
					} else {
						alert('get ActiveX failure\n');
					}
				} catch (e) {
				}
			},
			/***
			 * 显示凭证
			 * @param {Object} vouNo 凭证号
			 */
			setCurrentVoucher : function(vouNo) {
				try {
					var ActiveX = document.getElementById('CTJEstampOcx');
					if (ActiveX) {
						var ret = ActiveX.SetCurrentVoucher(vouNo);
						if (ret != 0) {
							alert(ActiveX.GetLastErr());
						}
						// 自适应大小
						var ret = ActiveX.ZoomToFit();
					} else {
						alert('get ActiveX failure\n');
					}
				} catch (e) {
				}
			},
			/***
			 * 上一联
			 * @memberOf {TypeName} 
			 */
			pageUp : function() {
				try {
					var ActiveX = document.getElementById("CTJEstampOcx");
					if (ActiveX) {
						var ret = ActiveX.PageUp();
						if (ret != 0) {
							alert(ActiveX.GetLastErr());
						}
					} else {
						alert("get ActiveX failure\n");
					}

				} catch (e) {
				}
			},
			/***
			 * 下一联
			 * @memberOf {TypeName} 
			 */
			pageDown : function() {
				try {
					var ActiveX = document.getElementById("CTJEstampOcx");
					if (ActiveX) {
						var ret = ActiveX.PageDown();
						if (ret != 0) {
							alert(ActiveX.GetLastErr());
						}
					} else {
						alert("get ActiveX failure\n");
					}
				} catch (e) {
				}
			},
			/***
			 * 放大
			 * @memberOf {TypeName} 
			 */
			zoomIn : function() {
				try {
					var ActiveX = document.getElementById("CTJEstampOcx");
					if (ActiveX) {
						var ret = ActiveX.ZoomIn();
					} else {
						alert("get ActiveX failure\n");
					}

				} catch (e) {
				}
			},
			/***
			 * 缩小
			 * @memberOf {TypeName} 
			 */
			zoomOut : function() {
				try {
					var ActiveX = document.getElementById("CTJEstampOcx");
					if (ActiveX) {
						var ret = ActiveX.ZoomOut();
					} else {
						alert("get ActiveX failure\n");
					}

				} catch (e) {
				}
			},
			/***
			 * 打印多条凭证
			 * @param {Object} certId
			 * @param {Object} admivCode 行政区划
			 * @param {Object} year  年度
			 * @param {Object} vtCode 凭证类型
			 * @param {Object} voucherNos 凭证号 数组
			 * @param {Object} pageNo 当前联
			 */
			printVoucher : function(certId, admivCode, year, vtCode, voucherNos, pageNo) {
				try {
					var ActiveX = document.getElementById('CTJEstampOcx');
					if (ActiveX) {
						var ret = ActiveX.PrintAllVoucher(certId, admivCode, year, vtCode,pageNo, voucherNos);
						if (ret != 0) {
							alert(ActiveX.GetLastErr());
						}
					} else {
						alert('get ActiveX failure\n');
					}
				} catch (e) {
				}
			}
		}
	});