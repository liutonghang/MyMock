/**
 * 要素下拉插件
 */
Ext.define('Ext.ux.MyTreePicker', {
	extend: 'Ext.ux.TreePicker',
    xtype: 'mytreepicker',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
        me.getPicker();
    }
});

Ext.define('Ext.ux.EleTreePicker', {
	extend: 'Ext.ux.TreePicker',
    xtype: 'eletreepicker',
    valueField: 'id',
	displayField: 'name',
    getEleStore : function() {
    	var me = this;
		return Ext.create('Ext.data.TreeStore', {
			root: {
				name : '',
				code : '',
			    id : '0'
			  },
			fields : ["id","code","name","parent_id"],
			proxy : {
				actionMethods : {
					read : 'POST'
				},
				type : 'ajax',
				url : 'loadEleValue.do',
				reader : 'json'
			},
			listeners : {
				beforeload : function( store, operation, eOpts){
					if(Ext.isEmpty(me.admdiv)) {
						return false;
					}
					operation.params["filedNames"] = Ext.encode(["id","code","name","parent_id"]);
					operation.params["admdivCode"] = me.admdiv;
					operation.params["eleName"] = me.eleType;
				}
			}
		});
	},
    initComponent: function() {
        var me = this;
        me.store = me.getEleStore();
        me.callParent(arguments);
        me.getPicker();
    },
    selectItem: function(record) {
        var me = this;
        me.inputValue = record.getId();
        me.setValue(record.get("code"));
        me.picker.hide();
        me.inputEl.focus();
        me.fireEvent('select', me, record);

    },
    setInputValue : function(inputValue) {
    	this.inputValue = inputValue;
    },
    findIdByCode : function(code) {
    	var find = function(nodes, target) {
			if(Ext.isEmpty(nodes)) {
				return null;
			}
			for(var i = 0; i < nodes.length; i++) {
				if(nodes[i].code == target) {
					return nodes[i].id;
				}
				var found = find(nodes[i].children, target);
				if(found) {
					return found;
				}
			}
			return null;
		};
		return find(this.treeData, code);
    },
    setValue: function(value) {
    	var me = this,
        record;

	    me.value = value;
	    
	    if (me.store.loading) {
	        // Called while the Store is loading. Ensure it is processed by the onLoad method.
	        return me;
	    }
	    var inputValue = me.findIdByCode(value);
	        
	    // try to find a record in the store that matches the value
	    record = inputValue ? me.store.getNodeById(inputValue) : me.store.getRootNode();
	    if (inputValue === undefined) {
	        record = me.store.getRootNode();
	        me.inputValue = record.getId();
	    } else {
	        record = me.store.getNodeById(inputValue);
	    }
	
	    // set the raw value to the record's display field if a record was found
	    me.setRawValue(record ? record.get(me.displayField) : '');
	    me.inputValue = record ? record.getId() : '';
	    /**
	     * to-do
	     * 下拉无法选中
	     */
	    /*if(record) {
	    	me.picker.getSelectionModel().select(record);
	    }*/
	    
	    return me;
    },
    onLoad: function(thiz, node, records, successful) {
    	this.treeData = function(nodes) {
			return (function copyNode(nodes) {
				var _nodes = [];
				for(var i = 0; i < nodes.length; i++) {
					var node = Ext.apply({}, nodes[i].raw);
					var children = copyNode(nodes[i].childNodes);
					node.children = children;
					_nodes.push(node);
				}
				return _nodes;
			} (nodes));
		} (records);
    	Ext.ux.EleTreePicker.superclass.onLoad.call(this, thiz, node, records, successful);
    },
    reset : function() {
    	this.setInputValue();
    	Ext.ux.EleTreePicker.superclass.reset.call(this);
    },
    reload : function(newValue) {
    	var picker = this;
    	var _store = picker.getStore();
		picker.admdiv = newValue;
		_store.reload();
    }
});