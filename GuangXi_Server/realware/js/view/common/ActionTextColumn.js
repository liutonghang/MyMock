/***
 * 操作列(文本显示)
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
Ext.define('pb.view.common.ActionTextColumn', {
	extend : 'Ext.grid.column.Action',
	alias : 'widget.actiontextcolumn',
	constructor: function(config) {
        var me = this,
            cfg = Ext.apply({}, config),
            items = cfg.items || [me],
            l = items.length,
            i,
            item;
        delete cfg.items;
        me.callParent([cfg]);
        me.items = items;
        me.renderer = function(v, meta) {
            v = Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(this, arguments)||'' : '';
            meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
            for (i = 0; i < l; i++) {
                item = items[i];
                item.disable = Ext.Function.bind(me.disableAction, me, [i]);
                item.enable = Ext.Function.bind(me.enableAction, me, [i]);
                v += '<a href="javascript:void(0);"' + 
                    ' class="' + Ext.baseCSSPrefix + 'action-col-icon ' + Ext.baseCSSPrefix + 'action-col-' + String(i) + ' ' + (item.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + (item.cls || '') +
                    ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope||me.scope||me, arguments) : (me.iconCls || '')) + '"' +
                    ((item.tooltip) ? ' data-qtip="' + item.tooltip + '"' : '') + '>' + (item.tooltip) + '</a>'; 
            }
            return v;
        };
    }
});