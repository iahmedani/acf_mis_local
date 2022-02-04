const knex = require('../../mainfunc/db');
var uuid = require('uuid/v4')

module.exports.initOtpFollowUp = function () {
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

  $(function () {
    var datePickerId = document.getElementById('followup_date');
    datePickerId.max = new Date().toISOString().split("T")[0];
  });

  $( async function () {
    await setFormDefualts(false,'ddProvince','ddDistrict','ddTehsil')
    await appendItems('ddProvince','provinceList',false,'id','provinceName');
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse' )
  })

  let getInterimData = (filter) => {
    return new Promise((resolve, reject) => {
      ipc.send('getInterim', filter);
      ipc.on('getInterim', (e, result) => {
        var s = {
          data: result.result,
          itemsCount: result.totalCount[0].total
        }
        if (result.err) {
          reject(result.err)
          ipc.removeAllListeners('getInterim')
        } else {
          console.log(s)
          resolve(s)
          ipc.removeAllListeners('getInterim')
        }
      })
    })
  }

  let addFollowup = (item) => {
    return new Promise((resolve, reject) => {
      $('#addFollowupForm').validate();
      if ($('#addFollowupForm').valid()) {
        item.followup_date = $('#followup_date').val();
        item.followup_id = uuid();
        // delete item.next_followup;
        ipc.send('addFollowup', item);
        ipc.on('addFollowup', (e, result) => {
          if (result.err) {
            reject(result.err)
            ipc.removeAllListeners('addFollowup')
          } else {
            resolve(result.result[0])
            ipc.removeAllListeners('addFollowup')
          }
        })
      } else {
        reject();
      }
    })
  }
  $('#ddHealthHouse').on('change', function () {
    var site_id = $(this).val();
    console.log('site_id', site_id);
    ipc.send("getCommodityAll");

    ipc.on('commodityAll', (evt, com) => {
      var commodities = [{
        Name: 'Choose',
        value: 'none'
      }]
      com.commodity.forEach((el, i) => {
        commodities.push({
          Name: el.item_name,
          value: el.item_name
        });
        if (com.commodity.length - 1 == i) {
          grid(commodities);
        }
      })
    })

    function grid(commodities) {
      $("#jsGridFollowUpEntry").jsGrid({
        height: "570px",
        width: "100%",
        filtering: true,
        // inserting: true,
        editing: true,
        // sorting: true,
        paging: true,
        autoload: true,
        pageLoading: true, // this is the clue
        pageSize: 10,
        pageButtonCount: 5,
        deleteConfirm: "Do you really want to delete client?",
        controller: {
          loadData: function (filter) {
            console.log(site_id);
            filter.site_id = site_id;
            return getInterimData(filter);
          },
          updateItem: function (item) {
            console.log("update");
            // item.followup_date = $('#followup_date').val();
            console.log(item);
            return addFollowup(item);
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
            editing: false,
            filtering: true,
          },
          {
            name: "p_name",
            title: "Name",
            type: "text",
            width: 100,
            editing: false,
            filtering: true,
          },
          {
            name: "f_or_h_name",
            title: "Father/Husb: Name",
            type: "text",
            width: 100,
            editing: false,
            filtering: true
          },
          {
            name: 'gender',
            title: 'Gender',
            type: "text",
            width: 50,
            editing: false,
          },
          {
            name: "site_village",
            title: "Village",
            type: "text",
            width: 100,
            editing: false,
            filtering: true
          },
          {
            name: "weight",
            title: "Weight",
            type: "decimal",
            width: 50,
            editing: true,
            validate: "required",
            filtering: false

          },
          {
            name: "muac",
            title: "MUAC",
            type: "decimal",
            width: 50,
            editing: true,
            validate: "required",
            filtering: false

          },
          {
            name: "ration1",
            title: "Ration-1",
            type: "select",
            items: commodities,
            valueField: "value",
            textField: "Name",
            width: 80,
            validate: "required",
            filtering: false

          },
          {
            name: "quantity1",
            title: "Qty-1",
            type: "number",
            filtering: false,
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
            filtering: false,
            items: commodities,
            valueField: "value",
            textField: "Name",
            width: 80
          },
          {
            name: "quantity2",
            title: "Qty-2",
            type: "number",
            width: 40,
            filtering: false

          },
          {
            name: "ration3",
            title: "Ration-3",
            type: "select",
            items: commodities,
            valueField: "value",
            textField: "Name",
            filtering: false,

            width: 80
          },
          {
            name: "quantity3",
            title: "Qty-3",
            type: "number",
            filtering: false,

            width: 50
          },
          {
            name: "other_com_name",
            title: "Other Com: Name",
            type: "text",
            filtering: false,

            width: 50
          },
          {
            name: "other_com_qty",
            title: "Other Com: Qty",
            type: "number",
            filtering: false,
            width: 50
          },
          {
            width: 80,
            align: 'center',
            headerTemplate: function () {
              return "<th class='jsgrid-header-cell'>Last Followup in days</th>";
            },
            itemTemplate: async function (value, item) {
              console.log(item)
              var date1 = new Date(item.curr_date);
              // var 
              var date2 = new Date();

              // var date2 = await getLastFollowUpDate(item.otp_id);
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
            type: "control",
            deleteButton: false,
            editButtonTooltip: 'Add Followup',
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
      });
    }


  })

  let getLastFollowUpDate = async (otp_id) => {
    try {
      const lastFollowUp = await knex.select('curr_date').from('tblOtpFollowup').where({
        otp_id
      }).limit(1).orderBy('followup_id', 'desc').where({
        is_deleted: 0
      });
      if (lastFollowUp.length > 0) {
        console.log(lastFollowUp[0].curr_date)

        return new Date(lastFollowUp[0].curr_date);
      } else {
        const lastFollowUpOtpAdd = await knex.select('reg_date').from('tblOtpAdd').where({
          otp_id
        });
        console.log(lastFollowUpOtpAdd[0].reg_date)

        return new Date(lastFollowUpOtpAdd[0].reg_date);
      }
    } catch (error) {
      console.log(error)
      return new Date();
    }

  }

}