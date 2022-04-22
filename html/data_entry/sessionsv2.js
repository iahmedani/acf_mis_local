var uuid = require('uuid/v4');
var knex = require('../../mainfunc/db');
module.exports.initSessionsV2 = function () {
  $('#ddProgramType').change(() => {
    $('.prgChange').val("")
  })

  $( async function () {
    await setFormDefualts('ddProgramType','ddProvince','ddDistrict','ddTehsil')
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse' )
    $("#ddDistrict").on("change", function () {
      var dist = $(this).val();
      ipc.send("getTehsil", dist);
      ipc.on("tehsil", function (evt, tehsil) {
        $("#ddTehsil")
          .children("option:not(:first)")
          .remove();

        teh(tehsil);
      });
    });
    $("#ddTehsil").on("change", async function () {
      var tehs = $(this).val();
      ipc.send("getUC", tehs);
      ipc.on("uc", function (evt, uc) {
        $("#ddUC")
          .children("option:not(:first)")
          .remove();
        ucListener(uc);
      });
      if ($('#ddProgramType').val() == 'sc') {
        try {
          var _listNsc = await knex('v_geo_active').where({
            tehsil_id: tehs,
            SC: 1
          })
          // $('#nsc_old_otp_id').attr('data-inputmask', "'mask':'NSC-999999'")
          nscList(_listNsc, 'ddHealthHouse');
        } catch (error) {
          console.log(error)
        }
      }
    });
    var ucForHH;
    $('#ddUC').on('change', function () {
      var ucs = $(this).val();
      ucForHH = ucs
      ipc.send('getHealthHouse', ucs)
      ipc.on('hh', async function (evt, hh) {
        // console.log(hh)
        $('#site_one').children('option:not(:first)').remove();
        if (hh.hh.length > 1) {
          $('.secondSite').css('display', '')
          $('#site_two').children('option:not(:first)').remove();
          await asyncForEach(hh.hh, async (el) => {
            $('#site_two').append(`<option value="${el.siteName}">${el.siteName}</option>`);
          })
        } else {
          $('.secondSite').css('display', 'none')

        }
        hhListener_siteOne(hh);

      });
      ipc.send("getStaffuc", ucs);
      ipc.send("getSupsuc", ucs);

      ipc.on("haveStaffuc", function (evt, staffs) {
        $("#ddStaff_code")
          .children("option:not(:first)")
          .remove();
        staffListeneruc(staffs);
      });
      ipc.on("haveSupsuc", function (evt, _sups) {
        $("#ddSup_code")
          .children("option:not(:first)")
          .remove();
        supListeneruc(_sups);
      });
    })
    $("#ddUC").on("change", function () {
      var ucs = $(this).val();
      ucForHH = ucs;
      if ($('#ddProgramType').val() == 'otp') {

        ipc.send("getHealthHouse", ucs);
        ipc.on("hh", function (evt, hh) {
          $("#ddHealthHouse")
            .children("option:not(:first)")
            .remove();
          hhListener(hh);
        });
      }
    });
    $("#ddHealthHouse").on("change", function () {
      var siteId = $(this).val();
      // ucForHH = ucs;
      ipc.send("getStaff", siteId);
      ipc.send("getSups", siteId);

      ipc.on("haveStaff", function (evt, staffs) {
        $("#ddStaff_code")
          .children("option:not(:first)")
          .remove();
        staffListener(staffs);
      });
      ipc.on("haveSups", function (evt, _sups) {
        $("#ddSup_code")
          .children("option:not(:first)")
          .remove();
        supListener(_sups);
      });
    });
    $("#ddStaff_code").on("change", function () {
      var staff_code = $(this).val();
      $("#ddStaff_name").val(staff_code);
    });
    $("#ddStaff_name").on("change", function () {
      var staff_code = $(this).val();
      $("#ddStaff_code").val(staff_code);
    });
    $("#ddSup_code").on("change", function () {
      var sup_code = $(this).val();
      $("#ddSup_name").val(sup_code);
    });
    $("#ddSup_name").on("change", function () {
      var sup_code = $(this).val();
      $("#ddSup_code").val(sup_code);
    });
  });



  $(async () => {
    // $('.outreach').hide();
    var defProg = JSON.parse(window.localStorage.getItem('defaults'))['defProg']
    // console.log({defProg})
    // $('#ddProgramType').val(defProg);
    if (defProg == 'outreach') {
      $('.outreach').show();
      $('.outreach input').attr('required', true);
      $('.nsc').show();
      $('.nsc input').attr('required', true);
      $('#ddUC').attr('disabled', false)
      $('.noOutreach').hide();
    } else if (defProg == 'otp') {
      $('.outreach').hide();
      $('.nsc').show();
      $('.nsc input').attr('required', true);
      $('.outreach input').attr('required', false);
      $('#ddUC').attr('disabled', false)
    } else if (defProg == 'sc') {
      $('#ddUC').attr('disabled', true)
      $('.outreach').hide();
      $('.outreach input').attr('required', false);
    }
    $('#ddProgramType').on('change', async function () {
      var val = $(this).val();
      await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse',val)
      // if (data.length > 0) {
      //   data = [];
      // }
      // console.log(val)
      if (val == 'outreach') {
        $('.outreach').show();
        $('.outreach input').attr('required', true);
        $('.nsc').show();
        $('.nsc input').attr('required', true);
        $('#ddUC').attr('disabled', false)

        $('.noOutreach').hide();
      } else if (val == 'otp') {
        $('.outreach').hide();
        $('.nsc').show();
        $('.nsc input').attr('required', true);
        $('.outreach input').attr('required', false);
        $('#ddUC').attr('disabled', false)


      } else if (val == 'sc') {
        $('#ddUC').attr('disabled', true)
        $('.outreach').hide();
        $('.outreach input').attr('required', false);
      }
    })
  })
  // $(function(){
  //   ipc.send('getProvince');
  //   ipc.on('province', function(evt, province){
  //     $('#ddProvince').children('option:not(:first)').remove();   

  //     // province.province.forEach(el=>{
  //       // $('#ddProvince').append(`<option value="${el.id}">${el.provinceName}</option>`);

  //     // })
  //     prov(province);
  //     })
  //     $('#ddProvince').on('change', function(){
  //       var prov = $(this).val();
  //       ipc.send('getDistrict', prov )
  //       ipc.on('district', function(evt, district){
  //         $('#ddDistrict').children('option:not(:first)').remove();

  //       //   district.district.forEach(el=>{
  //       // $('#ddDistrict').append(`<option value="${el.id}">${el.districtName}</option>`);              
  //       //   })
  //       dist(district);
  //       })
  //     })
  //     $('#ddDistrict').on('change', function(){
  //       var dist = $(this).val();
  //       ipc.send('getTehsil', dist )
  //       ipc.on('tehsil', function(evt, tehsil){
  //         $('#ddTehsil').children('option:not(:first)').remove();

  //       //   tehsil.tehsil.forEach(el=>{
  //       // $('#ddTehsil').append(`<option value="${el.id}">${el.tehsilName}</option>`);              
  //       //   })
  //       teh(tehsil);
  //       })
  //     })
  //     $('#ddTehsil').on('change', function(){
  //       var tehs = $(this).val();
  //       ipc.send('getUC', tehs )
  //       ipc.on('uc', function(evt, uc){
  //         $('#ddUC').children('option:not(:first)').remove();

  //       //   uc.uc.forEach(el=>{
  //       // $('#ddUC').append(`<option value="${el.id}">${el.ucName}</option>`);              
  //       //   })
  //       ucListener(uc);
  //       })
  //     })
  //     var ucForHH;
  //     $('#ddUC').on('change', function(){
  //       var ucs = $(this).val();
  //       ucForHH = ucs
  //       ipc.send('getHealthHouse', ucs )
  //       ipc.on('hh', function(evt, hh){
  //         $('#ddHealthHouse').children('option:not(:first)').remove();
  //       //   hh.hh.forEach(el=>{
  //       // $('#ddHealthHouse').append(`<option value="${el.id}">${el.siteName}</option>`);              
  //       //   })
  //       hhListener(hh);
  //       })
  //     })
  //   });
  $(async function () {
    
    $('.myFilter').on('change', function () {
      console.log($(this).val())
      var x = {};
      x.province_id = ($("#ddProvince").val()) ? $("#ddProvince").val() : '';
      x.prog_type = ($("#ddProgramType").val()) ? $("#ddProgramType").val() : '';
      x.district_id = ($("#ddDistrict").val()) ? $("#ddDistrict").val() : '';
      x.tehsil_id = ($("#ddTehsil").val()) ? $("#ddTehsil").val() : '';
      x.uc_id = ($("#ddUC").val()) ? $("#ddUC").val() : '';
      x.site_id = ($("#ddHealthHouse").val()) ? $("#ddHealthHouse").val() : '';
      x.CHW_id = ($("#ddStaff_code").val()) ? $("#ddStaff_code").val() : '';
      x.CHS_id = ($("#ddSup_code").val()) ? $("#ddSup_code").val() : '';

      $("#jsGrid")
        .jsGrid("loadData", x)
        .done(function () {
          console.log("data loaded");
        });
    })
    $("#jsGrid").jsGrid({
      height: "500px",
      width: "100%",
      filtering: true,
      inserting: true,
      editing: true,
      sorting: true,
      // deleting: true,
      paging: true,
      autoload: true,
      pageLoading: true, // this is the clue
      pageSize: 20,
      pageButtonCount: 5,
      deleteConfirm: "Do you really want to delete Session?",
      controller: {
        loadData: function (filter) {
          filter.province_id = ($("#ddProvince").val()) ? $("#ddProvince").val() : '';
          filter.prog_type = ($("#ddProgramType").val()) ? $("#ddProgramType").val() : '';
          filter.district_id = ($("#ddDistrict").val()) ? $("#ddDistrict").val() : '';
          filter.tehsil_id = ($("#ddTehsil").val()) ? $("#ddTehsil").val() : '';
          filter.uc_id = ($("#ddUC").val()) ? $("#ddUC").val() : '';
          filter.site_id = ($("#ddHealthHouse").val()) ? $("#ddHealthHouse").val() : '';
          filter.CHW_id = ($("#ddStaff_code").val()) ? $("#ddStaff_code").val() : '';
          filter.CHS_id = ($("#ddSup_code").val()) ? $("#ddSup_code").val() : '';
          console.log(filter)
          return loadData(filter);
        },
        updateItem: function (item) {
          // console.log('update')
          // console.log(item);
          delete item.province;
          delete item.province_id;
          delete item.district_name;
          delete item.district_id;
          delete item.tehsil_name;
          delete item.tehsil_id;
          delete item.uc_name;
          delete item.uc_id;
          delete item.site_name;
          var date_ = new Date(item.session_date)
          date_.setDate(date_.getDate() + 1);
          // date_.toISOString();
          // date_.toJSON().split('T')[0];
          date_ = date_.toJSON().split('T')[0]
          // delete item.district_id;
          item.total_session = parseInt(item.ind_session) + parseInt(item.grp_sessions)

          // item.total_session = item.ind_session + item.grp_sessions
          return updateData(item);
        },
        insertItem: function (item) {
          console.log(item);
          var date_ = new Date(item.session_date)
          date_.setDate(date_.getDate() + 1);
          // date_.toISOString();
          // date_.toJSON().split('T')[0];
          date_ = date_.toJSON().split('T')[0]
          console.log(date_)
          item.site_id = ($("#ddHealthHouse").val()) ? $("#ddHealthHouse").val() : '';
          item.province_id = ($("#ddProvince").val()) ? $("#ddProvince").val() : '';
          item.district_id = ($("#ddDistrict").val()) ? $("#ddDistrict").val() : '';
          item.tehsil_id = ($("#ddTehsil").val()) ? $("#ddTehsil").val() : '';
          item.uc_id = ($("#ddUC").val()) ? $("#ddUC").val() : '';
          item.CHW_id = $("#ddStaff_code").val() ? $("#ddStaff_code").val() : "";
          item.CHS_id = $("#ddSup_code").val() ? $("#ddSup_code").val() : "";
          item.prog_type = $('#ddProgramType').val();
          delete item['']
          item.session_date = date_;
          item.total_session = parseInt(item.ind_session) + parseInt(item.grp_sessions)
          return insertData(item)
          // if (item.site_id != '') {
          //   $("#site_must").attr("hidden", true);
          // } else {
          //   $("#site_must").attr('hidden', false);
          // }
        },
        deleteItem: function (item) {
          console.log(item)
          deleteData(item);
        }

      },
      fields: [{
          name: 'session_date',
          title: 'Date',
          filtering: false,
          type: 'date',
          validate: {
            validator: "range",
            message: function (value, item) {
              return "Please check next session date"
            },
            param: ['2019-01-01', '2025-12-31']
          },
          width: 50,
        }, {
          name: "session_type",
          title: "Session Type",
          width: 100,
          type: "select",
          items: [{
              Name: '',
              value: ''
            },
            {
              Name: 'Nutrition, Health and Hygene',
              value: 'nut_health_hygene'
            },
            {
              Name: 'IYCF',
              value: 'iycf'
            },
            {
              Name: 'Cooking Demonstration',
              value: 'cooking'
            },
            {
              Name: '(SBCC) Identification, prevention and treatment of malnutrition',
              value: '(SBCC) Identification, prevention and treatment of malnutrition'
            },
            {
              Name: '(SBCC) Diet and healthcare of mothers during pregnancy and lactation',
              value: '(SBCC) Diet and healthcare of mothers during pregnancy and lactation'
            },
            {
              Name: '(SBCC) Mother and child care after delivery',
              value: '(SBCC) Mother and child care after delivery'
            },
            {
              Name: `(SBCC) Children’s diet`,
              value: `(SBCC) Children’s diet`
            },
            {
              Name: `(SBCC) Personal and environmental hygiene`,
              value: `(SBCC) Personal and environmental hygiene`
            },
            {
              Name: 'Other',
              value: 'other'
            },
          ],
          valueField: "value",
          textField: "Name",
          validate: 'required'
        }, {
          name: 'session_location',
          title: 'Session Location',
          width: 80,
          type: 'select',
          items: [{
              Name: '',
              value: ''
            },
            {
              Name: 'In CMAM Site',
              value: 'cmam_site'
            },
            {
              Name: 'In Community',
              value: 'community'
            }
          ],
          valueField: "value",
          textField: "Name",
          validate: 'required',
        },

        {
          name: "total_session",
          width: 50,
          title: "Total Sessions",
          type: "number",
          filtering: false,
          inserting: false,
          editing: false,
          readOnly: true,
          itemTemplate: function (value, item) {
            var x = ((item.ind_session) ? parseInt(item.ind_session) : 0) + ((item.grp_sessions) ? parseInt(item.grp_sessions) : 0) + ((item.mtmg) ? parseInt(item.mtmg) : 0) + ((item.ftfg) ? parseInt(item.ftfg) : 0)
            return x;
          }
        },
        {
          name: "mtmg",
          width: 50,
          title: "Session Given to MTM",
          type: "number",
          filtering: false,
          validate: {
            validator: 'min',
            param: 0
          }
        },
        {
          name: "ftfg",
          width: 50,
          title: "Session Given to FTF",
          type: "number",
          filtering: false,
          validate: {
            validator: 'min',
            param: 0
          }
        },

        {
          name: "grp_sessions",
          width: 50,
          title: "Group Sessions:",
          type: "number",
          filtering: false,
          validate: {
            validator: 'min',
            param: 0
          }
        },
        {
          name: "ind_session",
          width: 50,
          title: "Individual Sessions",
          type: "number",
          filtering: false,
          validate: {
            validator: 'min',
            param: 0
          }
        },

        {
          name: "male_participants",
          width: 50,
          title: "Male Part:",
          type: "number",
          filtering: false,
          validate: {
            validator: 'min',
            param: 0
          }
        },
        {
          name: "female_participants",
          title: "Female Part:",
          width: 50,
          type: "number",
          validate: {
            validator: 'min',
            param: 0
          },
          filtering: false,
        },
        {
          name: "pragnent",
          width: 50,
          title: "Pragnent",
          type: "number",
          validate: {
            validator: 'min',
            param: 0
          },
          filtering: false
        },
        {
          name: "lactating",
          title: "Lactating",
          width: 50,
          type: "number",
          validate: {
            validator: 'min',
            param: 0
          },
          filtering: false
        },
        {
          name: "plw",
          title: "PLW",
          width: 50,
          type: "number",
          validate: {
            validator: 'min',
            param: 0
          },
          filtering: false
        },
        {
          name: "new_participants",
          title: "New Part:",
          width: 50,
          type: "number",
          validate: {
            validator: 'min',
            param: 0
          },
          filtering: false,
        },
        {
          name: "old_participants",
          title: "Old Part:",
          width: 50,
          type: "number",
          validate: {
            validator: 'min',
            param: 0
          },
          filtering: false
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
          name: 'remarks',
          width: 50,
          title: 'Remarks',
          type: 'text',
          filtering: false,
        },
        {
          name: "upload_date",
          title: "Upload Date",
          width: 50,
          type: "number",
          filtering: false,
          editing: false,
          inserting: false,
        },
        {
          align: 'center',
          width: 50,
          headerTemplate: function () {
            return "<th class='jsgrid-header-cell'>Days since uploaded </th>";
          },
          itemTemplate: function (value, item) {
            // console.log(item)
            var date1 = new Date(item.upload_date);
            var date2 = new Date();
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            diffDays = (item.upload_status == 1 && item.upload_date != null) ? diffDays : 0;
            // alert(diffDays);
            return diffDays;
          }
        },
        {
          type: 'control',
          // modeSwitchButton: false,

          // deleteButton: false,
        }
      ],
      rowClick: function (args) {
        var date1 = new Date(args.item.upload_date);
        var date2 = new Date();
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        diffDays = (args.item.upload_status == 1) ? diffDays : 0;
        if (1 == 1) {
          this.editItem(args.item)
        } else {
          alert('This could not be edited b/c its been more than 5 days since uploaded')
        }
      }

      // ,
      // onDataLoaded: function (data) {
      //   console.log(data);
      // },
      // onItemUpdating: function (args) {
      //   console.log('on Updating', args)
      // }, // before controller.updateItem
      // onItemUpdated: function (args) {
      //   console.log('on Updated', args)

      // }, // on done of controller.updateItem
    });
    $('#ddHealthHouse').on('change', function () {
      var site_id = $(this).val();
      // 

    })
  })

  // var MyDateField = function(config) {
  //   jsGrid.Field.call(this, config);
  //   };

  // MyDateField.prototype = new jsGrid.Field({

  // css: "date-field",            // redefine general property 'css'
  // align: "center",              // redefine general property 'align'


  // sorter: function(date1, date2) {
  //     return new Date(date1) - new Date(date2);
  // },

  // itemTemplate: function(value) {
  //     return new Date(value).toDateString();
  // },

  // insertTemplate: function(value) {
  //     return this._insertPicker = $("<input>").datepicker({ defaultDate: new Date() });
  // },

  // editTemplate: function(value) {
  //     return this._editPicker = $("<input>").datepicker().datepicker("setDate", new Date(value));
  // },

  // insertValue: function() {
  //     return this._insertPicker.datepicker("getDate").toISOString();
  // },

  // editValue: function() {
  //     return this._editPicker.datepicker("getDate").toISOString();
  // }
  // });
  // jsGrid.fields.date = MyDateField;


  let loadData = (data) => {
    return new Promise((resolve, reject) => {
      ipc.send('getSessionsAll', data);
      ipc.on('getSessionsAll', (e, result) => {
        // console.log(result);
        var s = {
          data: result.result.data,
          itemsCount: result.result.itemsCount[0].total
        };
        if (result.err) {
          reject(result.err)
          ipc.removeAllListeners('getSessionsAll')
        } else {
          resolve(s)
          ipc.removeAllListeners('getSessionsAll')
        }
      })
    })
  }

  let insertData = (item) => {
    console.log(item)
    return new Promise((resolve, reject) => {
      $("#sessionForm").validate();
      if ($("#sessionForm").valid()) {
        item.session_id = uuid();
        ipc.send("insertSessionsSingle", item);
        ipc.on("insertSessionsSingle", (e, result) => {
          if (result.err) {
            alert(result.err)
            reject(result.err);
            ipc.removeAllListeners("insertSessionsSingle");
          } else {
            resolve(result.result[0]);
            console.log(result);
            ipc.removeAllListeners("insertSessionsSingle");
            $("#jsGrid")
              .jsGrid("render")
              .done(function () {
                console.log("rendering completed and data loaded");
              });
          }
        });
      } else {
        reject()
      }
    })
  }

  let updateData = (item) => {
    delete item["uc_id:1"]
    delete item["district_id:1"]
    delete item["tehsil_id:1"]
    delete item["province_id:1"]
    console.log(item)
    return new Promise((resolve, reject) => {
      ipc.send('updateSessionsSingle', item);
      ipc.on('updateSessionsSingle', (e, result) => {
        if (result.err) {
          reject(result.err)
          ipc.removeAllListeners('updateSessionsSingle')
        } else {
          resolve(result.result[0])
          ipc.removeAllListeners('updateSessionsSingle')
          $("#jsGrid")
            .jsGrid("render")
            .done(function () {
              console.log("rendering completed and data loaded");
            });
        }
      })
    })
  }

  let deleteData = (item) => {
    return new Promise((resolve, reject) => {
      ipc.send("deleteSessionsSingle", item.session_id);
      ipc.on('deleteSessionsSingle', (e, result) => {
        console.log(result)
        if (result.err) {
          reject(result.err)
          ipc.removeAllListeners("deleteSessionsSingle");
        } else {
          resolve(result.result)
          ipc.removeAllListeners("deleteSessionsSingle");
          $("#jsGrid")
            .jsGrid("render")
            .done(function () {
              console.log("rendering completed and data loaded");
            });
        }
      })
    })
  }

}