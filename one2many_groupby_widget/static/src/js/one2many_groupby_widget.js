odoo.define("one2many_groupby_widget.group", function(require) {
    "use strict";

    //Variables
    var FieldOne2Many = require('web.relational_fields').FieldOne2Many;
    var ListRenderer = require('web.ListRenderer');
    var field_registry = require('web.field_registry');
    var core = require('web.core');
    var qweb = core.qweb;
    var _t = core._t;
    var utils = require('web.utils');
    var rpc = require('web.rpc');

    var GroupedOne2manyListRenderer = ListRenderer.extend({
        groupBy: '',
        groupTitleTemplate: 'hr_default_group_row',
        // dataRowTemplate: '',

        _renderGroup: function(group) {
            var result = this._super.apply(this, arguments);
            console.log("Dentro de la funcion")
            this.addCreateLineInGroups = true
            if (this.addCreateLineInGroups) {
                var $groupBody = result[0];
                var $a = $('<a href="#" role="button">')
                    .text(_t("Add a line"))
                    .attr('data-group-id', group.id);
                var $td = $('<td>')
                    .attr('colspan', this._getNumberOfCols())
                    .addClass('o_group_field_row_add')
                    .attr('tabindex', -1)
                    .append($a);
                var $tr = $('<tr>', { class: 'o_add_record_row' })
                    .attr('data-group-id', group.id)
                    .append($td);
                $groupBody.append($tr.prepend($('<td>').html('&nbsp;')));
            }
            return result;
        },

        _renderGroupRow: function(display_name) {
            console.log(this)
            return qweb.render(this.groupTitleTemplate, { display_name: display_name });
        },


        _formatData: function(data) {
            return data;
        },

        // _renderRow: function(record, isLast) {
        //     return $(qweb.render(this.dataRowTemplate, {
        //         id: record.id,
        //         data: this._formatData(record.data),
        //         is_last: isLast,
        //     }));
        // },

        /**
         * This method is meant to be overridden by concrete renderers.
         * Returns a context used for the 'Add a line' button.
         * It's useful to set default values.
         * An 'Add a line' button is added after each group of records.
         * The group passed as parameters allow to set a different context based on the group.
         * If no records exist, group is undefined.
         *
         * @private
         */
        // _getCreateLineContext: function(group) {
        //     return {};
        // },

        // // _renderTrashIcon: function() {
        // //     return qweb.render('hr_trash_button');
        // // },

        // _renderAddItemButton: function(group) {
        //     return qweb.render({
        //         context: JSON.stringify(this._getCreateLineContext(group)),
        //     });
        // },

        _renderBody: function() {
            var self = this;


            var grouped_by = _.groupBy(this.state.data, function(record) {
                return record.data[self.groupBy].res_id;
            });


            var groupTitle;
            var $body = $('<tbody>');
            for (var key in grouped_by) {
                var group = grouped_by[key];
                if (key === 'undefined') {
                    groupTitle = _t("Other");
                } else {
                    groupTitle = group[0].data[self.groupBy].data.display_name;
                }
                var $title_row = $(self._renderGroupRow(groupTitle));
                $body.append($title_row);

                // Render each rows
                console.log(group)
                group.forEach(function(record, index) {
                    var isLast = (index + 1 === group.length);
                    var $row = self._renderRow(record, isLast);
                    // if (self.addTrashIcon) $row.append(self._renderTrashIcon());
                    $body.append($row);
                });

                // if (self.addCreateLine) {
                //     $title_row.find('.o_group_name').append(self._renderAddItemButton(group));
                // }
            }

            // if ($body.is(':empty') && self.addCreateLine) {
            //     $body.append(this._renderAddItemButton());
            // }
            return $body;
        },

        _onToggleGroup: function(ev) {
            ev.preventDefault();
            // var group = $(ev.currentTarget).closest('tr').data('group');
            // if (group.count) {
            //     this.trigger_up('toggle_group', {
            //         group: group,
            //         onSuccess: () => {
            //             this._updateSelection();
            //             // Refocus the header after re-render unless the user
            //             // already focused something else by now
            //             if (document.activeElement.tagName === 'BODY') {
            //                 var groupHeaders = $('tr.o_group_header:data("group")');
            //                 var header = groupHeaders.filter(function() {
            //                     return $(this).data('group').id === group.id;
            //                 });
            //                 header.find('.o_group_name').focus();
            //             }
            //         },
            //     });
            // }
        },
    });

    var GroupedOne2manyWidget = GroupedOne2manyListRenderer.extend({
        groupBy: '',
        // dataRowTemplate: 'hr_skill_data_row',

        start: function() {
            if (this.__parentedParent.nodeOptions.groupby) {
                this.groupBy = this.__parentedParent.nodeOptions.groupby;
                this.groupbys = this.groupBy
            }
            return this._super.apply(this, arguments);
        },

        _renderRow: function(record) {
            var $row = this._super(record);
            // Add progress bar widget at the end of rows
            var $td = $('<td/>', { class: 'o_data_cell o_skill_cell' });
            return $row.append($td);
        },

        // _getCreateLineContext: function(group) {
        //     var ctx = this._super(group);
        //     return group ? _.extend({ default_skill_type_id: group[0].data[groupby].data.id }, ctx) : ctx;
        // },

        _render: function() {
            var self = this;
            return this._super().then(function() {
                self.$el.find('table').toggleClass('table-striped');
            });
        },
    });

    var FieldSkills = FieldOne2Many.extend({

        /**
         * @override
         * @private
         */
        _getRenderer: function() {
            return GroupedOne2manyWidget;
        },
    });

    field_registry.add("one2many_grouped", FieldSkills);
    return FieldSkills;
})