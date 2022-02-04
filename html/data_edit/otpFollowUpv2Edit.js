const knex = require('../../mainfunc/db');


module.exports.initOtpFollowUpEdit = function () {
  function DecimalField(config) {
    jsGrid.fields.number.call(this, config);
  }

  DecimalField.prototype = new jsGrid.fields.number({

    filterValue: function () {
      return this.filterControl.val() ?
        parseFloat(this.filterControl.val() || 0, 10) :
        undefined;
    },

    insertValue: function () {
      return this.insertControl.val() ?
        parseFloat(this.insertControl.val() || 0, 10) :
        undefined;
    },

    editValue: function () {
      return this.editControl.val() ?
        parseFloat(this.editControl.val() || 0, 10) :
        undefined;
    }
  });

  jsGrid.fields.decimal = jsGrid.DecimalField = DecimalField;

  // $(function () {
  //   var datePickerId = document.getElementById('followup_date');
  //   datePickerId.max = new Date().toISOString().split("T")[0];
  // });

  $( async function () {
    await setFormDefualts(false,'ddProvince','ddDistrict','ddTehsil')
    // await appendItems('ddProvince','provinceList',false,'id','provinceName');
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse' )
  $('#ddHealthHouse').on('change', function () {
      // var ucs = $('#ddUC').val();
      var h_id = $(this).val();
      ipc.send('getHealthHouseType', h_id)
      ipc.on('hhType', function (evt, hh) {

        hhTypeListener(h_id, hh);

      })
    })
  })
  $('#ddHealthHouse').on('change', function () {
    // var ucs = $('#ddUC').val();
    var h_id = $(this).val();
    ipc.send("getVillage", h_id);
    ipc.on("haveVillage", (evt, _villages) => {
      $("#ddVillageName")
        .children("option:not(:first)")
        .remove();
      villListener(_villages);

    });
  });



  let _com = async () => {
    var x = await knex('tblCommodity').select('item_name', 'id').where({
      prog_type: 'otp'
    })
    // console.log(x)
    return x;
  }
  let _followup = async (data) => {
    try {
      var x = await knex('v_otpFollowupUpdate').where({
        is_deleted: 0
      }).where({
        site_id: data.site_id,
        reg_id: data.reg_id
      }).where('site_village', 'like', `%${data.site_village}%`)
      console.log(x)
      return x;
    } catch (error) {
      console.log(error)
      return error
    }

  }
  let _delFollowUp = async (id) => {
    var x = await knex('tblOtpFollowup').where({
      followup_id: id
    }).update({
      is_deleted: 1
    })
    return ''
  }
  let _editFollowUp = async (item) => {
    // console.log(item)
    delete item.site_village;
    delete item.reg_id;
    delete item.p_name;
    delete item.f_or_h_name;
    delete item.province_id
    delete item.district_id
    delete item.tehsil_id
    delete item.uc_id
    delete item.site_id
    var date_ = new Date(item.next_followup)
    date_.setDate(date_.getDate() + 1);
    // date_.toISOString();
    // date_.toJSON().split('T')[0];
    date_ = date_.toJSON().split('T')[0]
    item.next_followup = date_;
    var x = await knex('tblOtpFollowup').update(item).where({
      followup_id: item.followup_id
    })
    console.log({
      x
    });
    var y = await knex('v_otpFollowupUpdate').where({
      followup_id: item.followup_id
    })
    console.log({
      y
    })
    return y[0];

  }

  let _grid = async (id) => {
    var commodities = await _com();
    console.log(id)
    $("#jsGrid").jsGrid({
      height: "500px",
      width: "100%",
      // filtering: true,
      // inserting: true,
      editing: true,
      // sorting: true,
      // paging: true,
      autoload: true,
      pageLoading: false, // this is the clue
      pageSize: 10,
      pageButtonCount: 5,
      deleteConfirm: "Do you really want to delete client?",
      controller: {
        loadData: async (filter) => {
          console.log(id);
          return await _followup(id);
        },
        updateItem: async (item) => {
          console.log(item)
          // console.log("update");
          // item.followup_date = $('#followup_date').val();
          // console.log(item);
          return await _editFollowUp(item);
        },
        deleteItem: async (item) => {
          followup_id = item.followup_id
          return await _delFollowUp(followup_id);
        }
      },
      fields: [
        // {
        //   name: "otp_id",
        //   title: "ID",
        //   type: "number",
        //   width: 30,
        //   editing: false
        // },
        {
          name: "reg_id",
          title: "Reg #",
          type: "text",
          width: 50,
          editing: false
        },
        {
          name: "p_name",
          title: "Name",
          type: "text",
          width: 100,
          editing: false
        },
        {
          name: "f_or_h_name",
          title: "Father/Husb: Name",
          type: "text",
          width: 100,
          editing: false
        },
        {
          name: "site_village",
          title: "Village",
          type: "text",
          width: 100,
          editing: false
        },
        {
          name: "weight",
          title: "Weight",
          type: "decimal",
          width: 50,
          editing: true,
          validate: "required"
        },
        {
          name: "muac",
          title: "MUAC",
          type: "decimal",
          width: 50,
          editing: true,
          validate: "required"
        },
        {
          name: "ration1",
          title: "Ration-1",
          type: "select",
          items: commodities,
          valueField: "item_name",
          textField: "item_name",
          width: 80,
          validate: "required"
        },
        {
          name: "quantity1",
          title: "Qty-1",
          type: "number",
          width: 40,
          validate: {
            validator: "min",
            param: 0
          }
        },
        {
          name: "ration2",
          title: "Ration-2",
          type: "select",
          items: commodities,
          valueField: "item_name",
          textField: "item_name",
          width: 80
        },
        {
          name: "quantity2",
          title: "Qty-2",
          type: "number",
          width: 40
        },
        {
          name: "ration3",
          title: "Ration-3",
          type: "select",
          items: commodities,
          valueField: "item_name",
          textField: "item_name",
          width: 80
        },
        {
          name: "quantity3",
          title: "Qty-3",
          type: "number",
          width: 50
        },
        {
          name: "other_com_name",
          title: "Other Com: Name",
          type: "text",
          width: 50
        },
        {
          name: "other_com_qty",
          title: "Other Com: Qty",
          type: "number",
          width: 50
        },
        {
          width: 80,
          align: 'center',
          headerTemplate: function () {
            return "<th class='jsgrid-header-cell'>Last Followup in days</th>";
          },
          itemTemplate: function (value, item) {
            console.log(item)
            var date1 = new Date(item.curr_date);
            var date2 = new Date();
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            // alert(diffDays);
            return diffDays;
          }
        },
        {
          name: "next_followup",
          type: "date",
          title: "Next Follow Up",
          // editing: false,
          align: "right",
          validate: {
            validator: "range",
            message: function (value, item) {
              return "Please check next next followup date"
            },
            param: ['2019-01-01', '2025-12-31']
          },
        },
        {
          name: 'upload_status',
          title: 'Upload Status',
          width: 50,
          type: 'select',
          valueType: 'number',
          items: [{
            Name: '',
            value: ''
          }, {
            Name: 'Uploaded',
            value: 1
          }, {
            Name: 'Not Uploaded',
            value: 0
          }, {
            Name: 'Edited',
            value: 2
          }],
          readOnly: true,
          valueField: "value",
          textField: "Name",
          editing: false,
          inserting: false,
          filtering: false,

        }, {
          name: "upload_date",
          title: "Upload Date",
          type: "number",
          filtering: false,
        },
        {
          align: 'center',
          headerTemplate: function () {
            return "<th class='jsgrid-header-cell'>Days since uploaded </th>";
          },
          itemTemplate: function (value, item) {
            // console.log(item)
            var date1 = new Date(item.upload_date);
            var date2 = new Date();
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            diffDays = (item.upload_status == 1) ? diffDays : 0;
            // alert(diffDays);
            return diffDays;
          }
        },

        {
          type: "control",
          deleteButton: true,
          eidtButton: true
        }
      ],
      rowClass: function (item, itemIndex) {
        var date1 = new Date(item.curr_date);
        var date2 = new Date();
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        console.log(diffDays)
        return diffDays > 21 ? 'bg-red' : '';
        // itemIndex%2==0 ? 'bg-red' : 'bg-green';
      },
      rowClick: async function (args) {
        var date1 = new Date(args.item.upload_date);
        var date2 = new Date();
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        diffDays = (args.item.upload_status == 1) ? diffDays : 0;
        if (1 == 1) {
          var exit_check = await knex('tblOtpExit').where({
            otp_id: args.item.otp_id,
            is_deleted: 0
          })
          if (exit_check.length > 0) {
            alert('This could not be edited b/c patient is already exited')

          } else {

            this.editItem(args.item);
          }
        } else {
          alert('This could not be edited b/c its been more than 5 days since uploaded')

        }
      }
    });
  }

  $('#editFollowupForm').on('submit', async function (e) {
    e.preventDefault();
    $(this).validate();
    if ($(this).valid()) {
      var formData = $(this).serializeFormJSON();
      console.log(formData)
      await _grid(formData);
    }

    var id = $('#reg_id').val();

    if (id == '') {
      alert('Registration id is required')
    } else {}

  })

}