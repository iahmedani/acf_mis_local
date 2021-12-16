const knex = require('../../mainfunc/db');

module.exports.initOtpAddUpdV2 = function () {
  $(":input").inputmask();

  function updateProvinceDD() {

    ipc.send("getProvince");
    ipc.on("province", function (evt, province) {
      $("#ddProvince")
        .children("option:not(:first)")
        .remove();

      // province.province.forEach(el=>{
      // $('#ddProvince').append(`<option value="${el.id}">${el.provinceName}</option>`);

      // })
      prov(province);
    });
  }
  // (function ($) {
  //   $.fn.serializeFormJSON = function () {
  //     var o = {};
  //     var a = this.serializeArray();
  //     $.each(a, function () {
  //       if (o[this.name]) {
  //         if (!o[this.name].push) {
  //           o[this.name] = [o[this.name]];
  //         }
  //         o[this.name].push(this.value || "");
  //       } else {
  //         o[this.name] = this.value || "";
  //       }
  //     });
  //     return o;
  //   };
  // })(jQuery);
  $(async function () {
    // ipc.send('getCommodity');
    // ipc.on('commodity', function (evt, com) {
    //   $('#ration1').children('option:not(:first)').remove();
    //   $('#ration2').children('option:not(:first)').remove();
    //   $('#ration3').children('option:not(:first)').remove();
    //   commodity(com, 'ration1');
    //   commodity(com, 'ration2');
    //   commodity(com, 'ration3');
    // })

    updateProvinceDD();
    $("#ddProvince").on("change", function () {
      var prov = $(this).val();
      ipc.send("getDistrict", prov);
      ipc.on("district", function (evt, district) {
        $("#ddDistrict")
          .children("option:not(:first)")
          .remove();

        //   district.district.forEach(el=>{
        // $('#ddDistrict').append(`<option value="${el.id}">${el.districtName}</option>`);
        //   })
        dist(district);
      });
    });
    $("#ddDistrict").on("change", function () {
      var dist = $(this).val();
      ipc.send("getTehsil", dist);
      ipc.on("tehsil", function (evt, tehsil) {
        $("#ddTehsil")
          .children("option:not(:first)")
          .remove();

        //   tehsil.tehsil.forEach(el=>{
        // $('#ddTehsil').append(`<option value="${el.id}">${el.tehsilName}</option>`);
        //   })
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


        //   uc.uc.forEach(el=>{
        // $('#ddUC').append(`<option value="${el.id}">${el.ucName}</option>`);
        //   })
        ucListener(uc);
        // $("#ddUC").val('');
      });
      if ($('#ddProgramType').val() == 'sc') {
        try {
          var _listNsc = await knex('v_geo_active').where({
            tehsil_id: tehs,
            SC: 1
          })
          nscList(_listNsc, 'ddHealthHouse');
        } catch (error) {
          console.log(error)
        }
      }
    });
    var ucForHH;
    $("#ddUC").on("change", function () {
      var ucs = $(this).val();
      ucForHH = ucs;
      ipc.send("getHealthHouse", ucs);
      ipc.on("hh", function (evt, hh) {
        $("#ddHealthHouse")
          .children("option:not(:first)")
          .remove();
        //   hh.hh.forEach(el=>{
        // $('#ddHealthHouse').append(`<option value="${el.id}">${el.siteName}</option>`);
        //   })
        hhListener(hh);
        // $("#ddHealthHouse").val('');
      });
    });
    $('#ddHealthHouse').on('change', function () {
      // var ucs = $('#ddUC').val();
      var h_id = $(this).val();
      ipc.send("getVillage", h_id);
      ipc.on("haveVillage", (evt, _villages) => {
        $("#ddVillageName")
          .children("option:not(:first)")
          .remove();
        villListener(_villages);
        // $("#ddVillageName").val('');

      });
    });

    // filter
    await setFormDefualts('filterProgramType','filterProvince','filterDistrict','filterTehsil')
    // await appendItems('filterProvince','provinceList',false,'id','provinceName');
    // chooseDefault('filterProgramType', 'defProg');
    // chooseDefault('filterProvince', 'defProv');
    // $('#filterProgramType').trigger('change')
    // $('#filterProvince').trigger('change')
    // var DefProvince = JSON.parse(window.localStorage.getItem('defaults'))['defProv']['value'];
    // await appendItems('filterDistrict','districtList',false,'id','districtName',DefProvince,'province_id');
    // chooseDefault('filterDistrict', 'defDist');
    // var DefDistrict = JSON.parse(window.localStorage.getItem('defaults'))['defDist']['value'];
    // await appendItems('filterTehsil','tehsilList',false,'id','tehsilName',DefDistrict,'district_id');

    // $('#filterProvince').on('change', async function(){
    //   var _id = $(this).val();
    //   console.log(_id)
    //   await appendItems('filterDistrict','districtList',false,'id','districtName',_id,'province_id');
    //   chooseDefault('filterProvince', 'defProv');
    // })


    await updatGeoElonChange('filterProvince','filterDistrict','filterTehsil', 'filterUC' )
    $('.filter').on('change', async function(){
      // programe type change in uc selections
      if($('#filterProgramType').val() == 'sc'){
        $("#filterUC").attr("disabled", true);
      }else{
        $("#filterUC").attr("disabled", false);
      }
      var filter = {};
     createExternalFilter(filter);
     
      // $('#AddUpdate-jsGrid').jsGrid("loadData");
      $("#AddUpdate-jsGrid").jsGrid("loadData", filter).done(function() {
        console.log("data loaded");
      });

    })

  });
  $(function () {
    let getOtp = filter => {
      return new Promise((resolve, reject) => {
        ipc.send("allOtpTest", filter);
        ipc.on("allOtpTest", (e, result) => {
          // console.log(result);
          if (result.err) {
            reject(result.err);
            ipc.removeAllListeners("allOtpTest");
          } else {
            var s = {
              data: result.result.data,
              itemsCount: result.result.itemsCount[0].total
            };
            resolve(s);
            ipc.removeAllListeners("allOtpTest");
          }
        });
      });
    };
    let delOtp = item => {
      return new Promise((resolve, reject) => {
        ipc.send("deleteOtpAdd", item.otp_id);
        ipc.on("deleteOtpAdd", (e, result) => {
          if (result.err) {
            reject(result.err);
            ipc.removeAllListeners("deleteOtpAdd");
          } else {
            resolve(result.result);
            $("#otpAddUpdForm")
              .get(0)
              .reset();
            $("#otpAddUpdForm select").val("");
            $("#jsGrid")
              .jsGrid("render")
              .done(function () {
                console.log("rendering completed and data loaded");
              });
            ipc.removeAllListeners("deleteOtpAdd");
          }
        });
      });
    }
    var MyDateField = function (config) {
      jsGrid.Field.call(this, config);
    };

    MyDateField.prototype = new jsGrid.Field({
      css: "date-field", // redefine general property 'css'
      align: "center", // redefine general property 'align'

      sorter: function (date1, date2) {
        return new Date(date1) - new Date(date2);
      },
      itemTemplate: function (value) {
        return new Date(value).toJSON().split('T')[0];
      },

      // filterTemplate: function(value) {
      //   return (this._filterPicker = $("<input>")
      //     .datepicker()
      //     .datepicker("setDate", new Date(value)));
      // },
      insertTemplate: function (value) {
        return (this._insertPicker = $("<input>").datepicker({
          defaultDate: new Date()
        }));
      },

      editTemplate: function (value) {
        return this._editPicker = $("<input>").datepicker({
          format: 'MM/DD/YYYY'
        }).datepicker("setDate", new Date(value));
      },

      insertValue: function () {
        return this._insertPicker.datepicker("getDate").toJSON().split('T')[0];
      },

      editValue: function () {
        return this._editPicker.datepicker("getDate").toJSON().split('T')[0];
      }

      // editTemplate: function(value) {
      //   return (this._editPicker = $("<input>")
      //     .datepicker()
      //     .datepicker("setDate", new Date(value)));
      // },

      // insertValue: function() {
      //   return this._insertPicker.datepicker("getDate").toISOString();
      // },

      // editValue: function() {
      //   return this._editPicker.datepicker("getDate").toISOString();
      // },
      // filterValue: function() {
      //   return this._filterPicker.datepicker("getDate").toISOString();
      // }
    });
    jsGrid.fields.date = MyDateField;
    var prog_type = [{
        name: 'All',
        value: ''
      },
      {
        name: 'TSFP',
        value: 'sfp'
      },
      {
        name: 'TSFP-PLW',
        value: 'sfp_plw'
      },
      {
        name: 'OTP',
        value: 'otp'
      }, {
        name: 'NSC',
        value: 'sc'
      }
    ];
    $("#AddUpdate-jsGrid").jsGrid({
      width: "100%",
      height: "300px",
      filtering: true,
      // inserting: true,
      // editing: true,
      // sorting: true,
      paging: true,
      autoload: true,
      pageLoading: true, // this is the clue
      pageSize: 10,
      pageButtonCount: 5,
      confirmDeleting: true,
      deleteConfirm: "Do you really want to delete Patient Record? This will also delete all related information.",
      controller: {
        loadData: function (filter) {
          // console.log(filter);
          // console.log("loaddata", site_id);
          // ipc.send("allOtpTest", filter);
          createExternalFilter(filter);
          console.log(filter);
          return getOtp(filter);
        },
        deleteItem: function (item) {
          return delOtp(item);
        }
      },
      fields: [
        // {
        //   name: "prog_type",
        //   title: 'Program Type',
        //   type: 'select',
        //   items: prog_type,
        //   textField: 'name',
        //   valueField: 'value',
        //   width: 50
        // },
        // {
        //   name: "province",
        //   title: "Province",
        //   type: "text",
        //   width: 50
        // },
        // {
        //   name: "district_name",
        //   title: "District",
        //   type: "text",
        //   width: 50
        // },
        // {
        //   name: "tehsil_name",
        //   title: "Tehsil",
        //   type: "text",
        //   width: 50
        // },
        {
          name: "site_name",
          title: "Site Name",
          type: "text",
          width: 50,
          filtering:false,
          editing:false
        },
        {
          name: "site_village",
          title: "Village",
          type: "text",
          width: 50,
          editing: false
        },

        {
          name: "reg_id",
          title: "Reg #",
          type: "text",
          width: 50,
          editing: false
        },
        {
          name: "p_name",
          title: "Patient Name",
          type: "text",
          width: 50,
          editing: false
        },
        {
          name: "reg_date",
          title: "Reg: Date",
          type: "date",
          width: 50,
          filtering: false
          // editing: false
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
          editButton: false,
          modeSwitchButton: false
        }
      ],
      rowClick: function (args) {
        var date1 = new Date(args.item.upload_date);
        var date2 = new Date();
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        diffDays = (args.item.upload_status == 1) ? diffDays : 0;
        if (diffDays < 10000) {
          this.editItem(args.item);
          var data = args.item;
          ipc.send("getCommodity", data.prog_type);
          ipc.on('commodity', async function (evt, com) {
            $('#ration1').children('option:not(:first)').remove();
            $('#ration2').children('option:not(:first)').remove();
            $('#ration3').children('option:not(:first)').remove();
            await commodity(com, 'ration1');
            await commodity(com, 'ration2');
            await commodity(com, 'ration3');
          });
          $("#hh_id").val(data.hh_id);
          $("#travel_time_minutes").val(data.travel_time_minutes);
          $("#is_mother_alive").val(data.is_mother_alive);
          $("#ddProgramType").val(data.prog_type);

          changeProg(data.prog_type);
          //   if (data.prog_type == 'sc') {
          //     // $("#ddHealthHouse").attr("disabled", true);
          //     $("#ddUC").attr("disabled", true);
          //     $("#ddVillageName").attr('disabled', true);
          //     // $("#ddVillageName").val(data.site_village);
          //     $('#nsc_otp_id').val(data.nsc_otp_id);
          //     $('#entryref_type_other').val(data.ref_type_other);
          //     $("#ddHealthHouse").val(data.site_id);
          //     $("#ddUC").val(data.uc_id);
          //     $("#ent_reason").children('option:not(:first)').remove();
          //     $("#ent_reason").append(`
          // <option value="new_add"> New Admission</option>
          // <option value="transfer_in"> Transfer In</option>
          // <option value="transfer_in_from_otp"> Transfer In From OTP </option>
          // <option value="readnission"> Readmission</option>
          // <option value="defaulted"> Defaulted</option> 
          // `);
          //     $("#ref_type").children('option:not(:first)').remove();
          //     $("#ref_type").append(`
          // <option value="ref_by_otp">OTP</option>
          // <option value="opd">OPD</option>
          // <option value="ped_wards">Pediatric Wards</option>
          // <option value="other">Other</option>
          // `);
          //     if (data.ent_reason == "transfer_in_from_otp") {
          //       $("#nsc_tranfer_from_otp_div").css("display", "");
          //       $('#nsc_otp_id').attr("required", true);
          //     }
          //   } else {
          //     $("#ddHealthHouse").attr("disabled", false);
          //     $("#ddUC").attr("disabled", false);
          //     $("#ddHealthHouse").children("option:not(:first)").remove();
          //     $("#ddUC").children("option:not(:first)").remove();
          //     $("#ddVillageName").children("option:not(:first)").remove();
          //     $("#ddVillageName").attr('disabled', false);


          //   };
          console.log(data)
          // villListener(data.)
          // villListener(data.site_id);
          // setTimeout($("#ddVillageName").val(data.site_village), 200)
          // $("#ddVillageName").val(data.site_village);
          $("#reg_date").val(data.reg_date);
          $("#reg_id").val(data.reg_id);
          $("#f_or_h_name").val(data.f_or_h_name);
          $("#p_name").val(data.p_name);
          $("#cnic").val(data.cnic);
          $("#cnt_number").val(data.cnt_number);
          var _newAdr = data.address.split(',');
          if (_newAdr.length > 1) {

            $("#adrDistrict").val(_newAdr.length == 3 ? _newAdr[1] : '');
            $("#adrProvince").val(_newAdr.length == 3 ? _newAdr[0] : '');
            $("#address").val(_newAdr.length == 3 ? _newAdr[2] : '');
          } else {
            $("#address").val(data.address);

          }
          $("#age").val(data.age);
          $("#gender").val(data.gender);
          // $("#village").val(data.site_village);
          data.plw_type === null ?
            $("#plw_type").attr("disabled", true) :
            $("#plw_type").val(data.plw_type);
          // $('#plw_type').val(data.plw_type)
          $("#ent_reason").val(data.ent_reason);
          if (data.ent_reason == 'other') {
            $("#entry_reason_other_div").css('display', '');
            $("#entry_reason_other").attr('required', true);
            $("#entry_reason_other").val(data.entry_reason_other);
          } else {
            $("#entry_reason_other_div").css("display", "none");
            $("#entry_reason_other").attr("required", false);
            $("#entry_reason_other").empty();

          }

          $("#ref_type").val(data.ref_type);
          if (data.ref_type == "other") {
            $("#ref_type_other_div").css("display", "");
            $("#ref_type_other").attr("required", true);
            $("#ref_type_other").val(data.ref_type_other);
          } else {
            $("#ref_type_other_div").css("display", "none");
            $("#ref_type_other").attr("required", false);
            $("#ref_type_other").empty();

          }
          $("#weight").val(data.weight);
          $("#height").val(data.height);
          $("#oedema").val(data.oedema);
          $("#muac").val(data.muac);
          $("#diarrhoea").val(data.diarrhoea);
          $("#vomiting").val(data.vomiting);
          $("#cough").val(data.cough);
          $("#appetite").val(data.appetite);
          $("#daily_stool").val(data.daily_stool);
          $("#pass_urine").val(data.pass_urine);
          $("#b_feeding").val(data.b_Feeding);
          $("#od_swol_time").val(data.od_swol_time);


          $("#otp_id").val(data.otp_id);
          $('#other_com_name').val(data.other_com_name);
          $('#other_com_qty').val(data.other_com_qty);
          $('#nsc_old_otp_id').val(data.nsc_old_otp_id);
          // updateProvinceDD();
          $("#ddProvince").val(data.province_id);
          // console.log(data.ration1)
          setTimeout(qtz, 200)

          function qtz() {

            $("#ration1").val(data.ration1);
            $("#quantity1").val(data.quantity1);
            $("#ration2").val(data.ration2);
            $("#quantity2").val(data.quantity2);
            $("#ration3").val(data.ration3);
            $("#quantity3").val(data.quantity3);
          }
          if (data.ent_reason == "transfer_in_from_nsc" || data.ent_reason == "return_def") {
            $("#nsc_old_otp_id_div").css('display', '');
            $("#nsc_old_otp_id").attr("hidden", false);
          } else {
            $("#nsc_old_otp_id_div").css('display', 'none');

            $("#nsc_old_otp_id").attr("hidden", true);
          }

          $("#ddDistrict")
            .children("option:not(:first)")
            .remove();
          $("#ddDistrict").append(
            `<option value="${data.district_id}" selected>${
            data.district_name
          }</option>`
          );
          // $("#ddDistrict").val(data.district_id);
          $("#ddTehsil")
            .children("option:not(:first)")
            .remove();
          $("#ddTehsil").append(
            `<option value="${data.tehsil_id}" selected>${
            data.tehsil_name
          }</option>`
          );

          // $("#ddTehsil").val(data.tehsil_id);
          $("#ddUC")
            .children("option:not(:first)")
            .remove();
          $("#ddUC").append(
            `<option value="${data.uc_id}" selected>${data.uc_name}</option>`
          );

          // $("#ddUC").val(data.uc_id);
          $("#ddHealthHouse")
            .children("option:not(:first)")
            .remove();
          $("#ddHealthHouse").append(
            `<option value="${data.site_id}" selected>${
            data.site_name
          }</option>`
          );
          $("#ddVillageName").append(
            `<option value="${data.site_village}" selected>${
            data.site_village
          }</option>`
          );
          $('#z_score').val(data.z_score);
          $('#old_otp_or_nsc_detail').val(data.old_otp_or_nsc_detail);
          $('#ref_by_details').val(data.ref_by_details);
          if (data.age < 6 && data.prog_type == 'sc') {
            $('#z_score').attr('disabled', false).attr('required', true)
          } else {
            $('#z_score').attr('disabled', true)
          }

        } else {
          alert('This could not be edited b/c its been more than 5 days since uploaded')

        }
        // $("#ddHealthHouse").val(data.site_id);
        // $("#ddDistrict")
        //   .children("option:not(:first)")
        //   .remove();
        // console.log(args.item);
      },
      onItemDeleting: function (args) {
        var date1 = new Date(args.item.upload_date);
        var date2 = new Date();
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        diffDays = (args.item.upload_status == 1) ? diffDays : 0;
        // cancel deletion of the item with 'protected' field
        if (diffDays > 699) {
          args.cancel = true;
          alert(`Item can't be deleted b/c it been uploaded for more than 5 days`)
        }
      }
    });


  })

  $("#otpAddUpdSubmit").on("click", async (e) => {
    console.log("clicked");
    $("#otpAddUpdForm").validate();

    if ($("#otpAddUpdForm").valid()) {
      var otpAddUpdFormData = $("#otpAddUpdForm").serializeFormJSON();
      otpAddUpdFormData.address = otpAddUpdFormData.address.toString();
      if ($("#ddProgramType").val() == 'otp') {

        var chk_dist_teh_uc_otp = await knex('v_geo').where({
          district_id: $('#ddDistrict').val(),
          tehsil_id: otpAddUpdFormData.tehsil_id,
          uc_id: $('#ddUC').val(),
          site_id: otpAddUpdFormData.site_id
        });

        var chk_village = await knex('tblVillages').where({
          district: $('#ddDistrict').val(),
          tehsil: otpAddUpdFormData.tehsil_id,
          uc: $('#ddUC').val(),
          site: otpAddUpdFormData.site_id,
          villageName: otpAddUpdFormData.site_village
        })

        if (chk_dist_teh_uc_otp.length < 1 || chk_village.length < 1) {
          alert('Please check location details, either districts, tehsil, uc and site are not updated respectively or village does not exist in nutrition site')
        } else {
          console.table(otpAddUpdFormData);
          ipc.send("submitOtpAddUpd", otpAddUpdFormData);
          ipc.removeAllListeners("submitOtpAddUpd");
          $("#otpAddUpdForm")
            .get(0)
            .reset();
          $("#otpAddUpdForm select").val('');

          $("#jsGrid")
            .jsGrid("render")
            .done(() => {
              console.log("js grid is rendered");
            });
        }


      } else if ($("#ddProgramType").val() == 'sc') {
        console.table(otpAddUpdFormData);
        ipc.send("submitOtpAddUpd", otpAddUpdFormData);
        ipc.removeAllListeners("submitOtpAddUpd");
        $("#otpAddUpdForm")
          .get(0)
          .reset();
        $("#otpAddUpdForm select").val('');

        $("#jsGrid")
          .jsGrid("render")
          .done(() => {
            console.log("js grid is rendered");
          });
      }
    }

    // addScrChildTemplate()
    e.preventDefault();
  });

  function rusfOnWeigth(_weight) {
    console.log(_weight);
    if ($('#ddProgramType').val() == 'otp') {
      $('#ration1').val('RUTF');
      var qty = $('#quantity1');
      if (_weight >= 3.5 && _weight <= 3.9) {
        qty.val(11);
      } else if (_weight >= 4 && _weight <= 5.4) {
        qty.val(14);
      } else if (_weight >= 5.5 && _weight <= 6.9) {
        qty.val(18)
      } else if (_weight >= 7 && _weight <= 8.4) {
        qty.val(21)
      } else if (_weight >= 8.5 && _weight <= 9.4) {
        qty.val(25)
      } else if (_weight >= 9.5 && _weight <= 10.4) {
        qty.val(28)
      } else if (_weight >= 10.5 && _weight <= 11.9) {
        qty.val(32)
      } else if (_weight >= 12) {
        qty.val(35)
      }
    }
  }

  $('#weight').on('change', function (e) {
    var _weight = $(this).val();
    rusfOnWeigth(_weight);
  });

  //Placing automated address of the beneficiary
  $('#ddVillageName').on("change", function () {
    var village = $(this).val();
    var province = $('#ddProvince option:selected').text();
    var district = $('#ddDistrict option:selected').text();
    $('#adrProvince').val(province);
    $('#adrDistrict').val(district);
    $('#address').val(village ? village : '');
  });

  // list of change event monitor
  var pType = $('#ddProgramType');
  var age = $('#age');
  var eReason = $('#ent_reason');
  var rType = $('#ref_type');
  var oedema = $('#oedema');
  var muac = $('#muac');

  // list of element affecting
  var _oldId = $('#nsc_old_otp_id')
  var _oldIdDetail = $('#old_otp_or_nsc_detail')

  /**
   * Change element actions
   */
  function changeProg(prog) {
    // var prog = $(this).val();
    var msk = {
      sc: 'NSC',
      otp: 'OTP'
    }
    // Setting up ID input mask
    $('#nsc_old_otp_id').inputmask(`${msk[prog]}-999999`);

    // setting up sc entry 

    if (prog == 'sc') {
      $("#ent_reason").children('option:not(:first)').remove();
      $("#ent_reason").append(`
            <option value="new_add">New Admission</option>
            <option value="transfer_from_ward"> Transfer from ward</option>
            <option value="transfer_in_from_otp"> Transfer In From OTP </option>
            <option value="return_after_lama"> Return after LAMA</option> 
            <option value="relapse">Relapse after cured</option>
            <option value="other">Other</option>
            `);
      $("#ref_type").children('option:not(:first)').remove();
      $("#ref_type").append(`
            <option value="ref_by_otp">OTP</option>
            <option value="opd">OPD</option>
            <option value="ward">Ward</option>
            <option value="other">Other</option>
            `);
      $('#plw_type').attr('disabled', true);
      $('#muac').attr('min', 0).attr('max', 30);
      $('#age').attr('min', 0);
      $('#age').attr('max', 59);
      $("#ddUC").attr("disabled", true);
      $("#ddVillageName").attr('disabled', true);
      $('#height').attr('disabled', false)
      $('.notNsc').attr('disabled', true)

      // OTP data entry prep
    } else if (prog == 'otp') {
      $("#ent_reason").children('option:not(:first)').remove();
      $("#ent_reason").append(`
        <option value="no_prv_pro">New Admission</option>
        <option value="relapse">Relapse</option>
        <option value="return_def">Return After Defaulter</option>
        <option value="in-patient_refusal">In-patient Refusal</option>
        <option value="transfer_in_from_nsc">Transfer in from NSC</option>
        <option value="tranfer_in_other_otp">Transfer in<small>From other OTP</small></option>
        <option value="tranfer_in_from_sfp">Transfer in<small>From TSFP</small></option>
        <option value="moved_in">Moved In</option>
        <option value="other">Other</option>
        `);
      $("#ref_type")
        .children("option:not(:first)")
        .remove();
      $("#ref_type").append(`
        <option value="self">Self</option>
        <option value="peer">Peer to Peer</option>
        <option value="chw">CHW</option>
        <option value="lhw">LHW</option>
        <option value="doh_staff">DOH Staff</option>
        <option value="com_org">Community Org</option>
        <option value="by_sc_care">By SC Care</option>
        <option value="by_otp">By OTP</option>
        <option value="from_opd">From OPD</option>
        <option value="by_tsfp">By TSFP</option>
        <option value="other">Other</option>`);
      $('#plw_type').attr('disabled', true);
      $('#muac').attr('min', 5).attr('max', 11.4);
      $('#age').attr('min', 6);
      $('#age').attr('max', 59);
      $("#ddUC").attr("disabled", false);
      $("#ddVillageName").attr("disabled", false);
      $('#height').attr('disabled', true)
      $('.notNsc').attr('disabled', false)
      $('#z_score').attr('disabled', true)
    }
  }
  // age change for sc
  age.change(function () {
    if (pType.val() == 'sc') {
      if ($(this).val() < 6) {
        $('#z_score').attr('disabled', false).attr('required', true)
      } else {
        $('#z_score').attr('disabled', true)
      }
    } else {
      $('#z_score').attr('disabled', true)
    }
  })
  // entry reason change checks
  eReason.change(function () {
    var reason = $(this).val();

    var p = pType.val()
    if (p == 'otp') {
      if (reason == 'no_prv_pro' || reason == 'other') {
        _oldId.attr('disabled', true)
        _oldIdDetail.attr('disabled', true)
        muac.attr('min', 5).attr('max', 11.4);
        console.log({
          reason
        })
      } else {
        muac.attr('min', 0).attr('max', 30);
        _oldId.attr('disabled', false)
        _oldIdDetail.attr('disabled', false)
        console.log({
          reason
        })
      }
    } else if (p == 'sc') {
      if (reason == 'transfer_in_from_otp' || reason == 'return_after_lama' || reason == 'relapse') {
        rType.children('option').each(function () {
          if ($(this).val() != 'ref_by_otp') {
            $(this).attr('disabled', true)
          }
        })
        _oldId.attr('disabled', false)
        _oldIdDetail.attr('disabled', false)
      } else {
        rType.children('option').each(function () {
          $(this).attr('disabled', false)
        })
        _oldId.attr('disabled', true)
        _oldIdDetail.attr('disabled', true)
      }
    }
    // display other reason 
    if (reason == 'other') {
      $('#entry_reason_other_div').css('display', 'block');
      $('#entry_reason_other').attr('required', true)
    } else {
      $('#entry_reason_other_div').css('display', 'none');
      $('#entry_reason_other').attr('required', false)
    }
  })
  // ref type change event
  rType.change(function () {
    var _type = $(this).val();
    var p = pType.val();
    if (p == 'otp') {
      if (_type != 'self' || _type != 'doh_staff' || _type != 'peer' || _type != 'from_opd') {
        $('#ref_by_details').attr('disabled', false)
      } else {
        $('#ref_by_details').attr('disabled', false)
      }
    } else if (p == 'sc') {
      if (_type == 'ref_by_otp') {
        $('#ref_by_details').attr('disabled', false)
      } else {
        $('#ref_by_details').attr('disabled', false)
      }
    }
    if (_type == 'other') {
      $('#ref_type_other_div').css('display', 'block')
      $('#ref_type_other').attr('required', true)
    } else {
      $('#ref_type_other_div').css('display', 'none')
      $('#ref_type_other').attr('required', false)
    }
  })
  // if oedema muac max limit removal
  oedema.change(function () {
    if ($(this).val() != 'absent') {
      muac.attr('min', 0).attr('max', 30);
    }
  })
};