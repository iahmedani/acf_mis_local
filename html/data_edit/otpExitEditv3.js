module.exports.initOtpExitEditV2 = function () {
  // $('#myForm').validate();
  $('#exitUpdSubmit').on('click', function (e) {
    $('#exitUpdForm').validate();
    if ($('#exitUpdForm').valid()) {
      var formData = $('#exitUpdForm').serializeFormJSON();
      var exit_date = $('#exit_date').val();
      formData.exit_date = exit_date;
      delete formData.p_name;
      delete formData.gender;
      delete formData.village;
      e.preventDefault();
      ipc.send('otpExitUpdate', formData);
      ipc.removeAllListeners('otpExitUpdate');
      $("#exitUpdForm")
        .get(0)
        .reset();
      $("#exitUpdForm select").val("");
      $("#jsGrid").jsGrid("render").done(() => {
        console.log('Js grid updated')
      });

      // location.reload();

    }
    e.preventDefault();
  })

  $(async function () {
    var datePickerId = document.getElementById('exit_date');
    datePickerId.max = new Date().toISOString().split("T")[0];


    
  });
  $(async function () {
    var inDays = function (d1, d2) {
      var date1 = new Date(d1);
      var date2 = new Date(d2);
      var t2 = date2.getTime();
      var t1 = date1.getTime();

      return parseInt((t2 - t1) / (24 * 3600 * 1000));
    };
    $('#exit_date').on('change', function () {
      console.log('clicked')
      var days = inDays($('#add_date').val(), $(this).val());
      console.log(days)
      $('#days_in_program').empty();
      $('#days_in_program').val(days);
      var gKgDay = (($('#exit_weight').val() - $('#add_weight').val()) * 1000) / days
      $('#weight_gain').empty();
      $('#weight_gain').val(gKgDay);
    })

    
   
    // ipc.send('getCommodity');
    // ipc.on('commodity', function (evt, com) {
    //   $('#exit_ration1').children('option:not(:first)').remove();
    //   $('#exit_ration2').children('option:not(:first)').remove();
    //   $('#exit_ration3').children('option:not(:first)').remove();
    //   commodity(com, 'exit_ration1');
    //   commodity(com, 'exit_ration2');
    //   commodity(com, 'exit_ration3');
    // })
    ipc.send('getProvince');
    ipc.on('province', function (evt, province) {
      $('#ddProvince').children('option:not(:first)').remove();

      // province.province.forEach(el=>{
      // $('#ddProvince').append(`<option value="${el.id}">${el.provinceName}</option>`);

      // })
      prov(province);
    })
    $('#ddProvince').on('change', function () {
      var prov = $(this).val();
      ipc.send('getDistrict', prov)
      ipc.on('district', function (evt, district) {
        $('#ddDistrict').children('option:not(:first)').remove();

        //   district.district.forEach(el=>{
        // $('#ddDistrict').append(`<option value="${el.id}">${el.districtName}</option>`);              
        //   })
        dist(district);
      })
    })
    $('#ddDistrict').on('change', function () {
      var dist = $(this).val();
      ipc.send('getTehsil', dist)
      ipc.on('tehsil', function (evt, tehsil) {
        $('#ddTehsil').children('option:not(:first)').remove();

        //   tehsil.tehsil.forEach(el=>{
        // $('#ddTehsil').append(`<option value="${el.id}">${el.tehsilName}</option>`);              
        //   })
        teh(tehsil);
      })
    })
    $('#ddTehsil').on('change', function () {
      var tehs = $(this).val();
      ipc.send('getUC', tehs)
      ipc.on('uc', function (evt, uc) {
        $('#ddUC').children('option:not(:first)').remove();

        //   uc.uc.forEach(el=>{
        // $('#ddUC').append(`<option value="${el.id}">${el.ucName}</option>`);              
        //   })
        ucListener(uc);
      })
    })
    var ucForHH;
    $('#ddUC').on('change', function () {
      var ucs = $(this).val();
      ucForHH = ucs
      ipc.send('getHealthHouse', ucs)
      ipc.on('hh', function (evt, hh) {
        $('#ddHealthHouse').children('option:not(:first)').remove();
        //   hh.hh.forEach(el=>{
        // $('#ddHealthHouse').append(`<option value="${el.id}">${el.siteName}</option>`);              
        //   })
        hhListener(hh);
      })
    })
    $('#ddHealthHouse').on('change', function () {
      // var ucs = $('#ddUC').val();
      var h_id = $(this).val();
      ipc.send('getHealthHouseType', h_id)
      ipc.on('hhType', function (evt, hh) {
        // var result = hh.hh.filter(el => el.id == $(this).val());
        // if(h_id === ""){
        //   $('#txtSiteType').val().empty();  
        // } else{

        //   $('#txtSiteType').val(function(){
        //     var site = [];
        //     if(hh.hh[0].OTP === 1){
        //       site.push('OTP')
        //     }
        //     if(hh.hh[0].SFP === 1){
        //       site.push('SFP')                
        //     }
        //     if(hh.hh[0].SC === 1){
        //       site.push('SC')                
        //     }
        //     return site;
        //   })  
        // }
        hhTypeListener(h_id, hh);

      })
    })

    
  });
  $(async function () {

    $('.filter').on('change', function(){
      // programe type change in uc selections
      if($('#filterProgramType').val() == 'sc'){
        $("#filterUC").attr("disabled", true);
      }else{
        $("#filterUC").attr("disabled", false);
      }
      var filter = {};
     createExternalFilter(filter);
     
      // $('#AddUpdate-jsGrid').jsGrid("loadData");
      $("#jsGrid").jsGrid("loadData", filter).done(function() {
        console.log("data loaded");
      });

    })

    await setFormDefualts('filterProgramType','filterProvince','filterDistrict','filterTehsil')
    await updatGeoElonChange('filterProvince','filterDistrict','filterTehsil', 'filterUC' )
    let xx = (site_id) => {
      return new Promise((resolve, reject) => {
        ipc.send('get', site_id);
        ipc.on('have', (e, result) => {
          var s = {
            data: result.result,
            itemsCount: result.result.length
          }
          if (result.err) {
            reject(result.err)
            ipc.removeAllListeners('have')
            ipc.removeAllListeners('get')
          } else {
            resolve(s)
            ipc.removeAllListeners('have')
            ipc.removeAllListeners('get')

          }
        })
      })
    }
  })

  let getOtpExit = filter => {
    return new Promise((resolve, reject) => {
      ipc.send("allOtpExit", filter);
      ipc.on("allOtpExit", (e, result) => {
        // console.log(result);
        var s = {
          data: result.result.data,
          itemsCount: result.result.itemsCount[0].total
        };
        if (result.err) {
          reject(result.err);
          ipc.removeAllListeners("allOtpExit");
        } else {
          resolve(s);
          ipc.removeAllListeners("allOtpExit");
        }
      });
    });
  };
  let delOtpExit = item => {
    return new Promise((resolve, reject) => {
      ipc.send("deleteOtpExit", item);
      ipc.on("deleteOtpExit", (e, result) => {
        if (result.err) {
          reject(result.err);
          ipc.removeAllListeners("deleteOtpExit");
        } else {
          resolve(result.result);
          $("#exitUpdForm")
            .get(0)
            .reset();
          $("#exitUpdForm select").val("");
          $("#jsGrid")
            .jsGrid("render")
            .done(function () {
              console.log("rendering completed and data loaded");
            });
          ipc.removeAllListeners("deleteOtpExit");
        }
      });
    });
  }

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
  $("#jsGrid").jsGrid({
    height: "300px",
    width: "100%",
    filtering: true,
    paging: true,
    autoload: true,
    pageLoading: true, // this is the clue
    pageSize: 10,
    pageButtonCount: 5,
    deleteConfirm: "Do you really want to delete Exit record?",
    controller: {
      loadData: function (filter) {
        createExternalFilter(filter);
        return getOtpExit(filter);
      },
      deleteItem: function (item) {
        return delOtpExit(item);
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
      // {
      //   name: "uc_name",
      //   title: "Uion Council",
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
        editing: false,
        filtering: false
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
        name: "exit_date",
        title: "Exit Date",
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
      if (1 == 1) {
        this.editItem(args.item);
        var data = args.item;
        ipc.send("getCommodity", data.prog_type);
        ipc.on("commodity", function (evt, com) {
          $("#exit_ration1")
            .children("option:not(:first)")
            .remove();
          $("#exit_ration2")
            .children("option:not(:first)")
            .remove();
          $("#exit_ration3")
            .children("option:not(:first)")
            .remove();
          commodity(com, "exit_ration1");
          commodity(com, "exit_ration2");
          commodity(com, "exit_ration3");
        });
        $("#p_name").val(data.p_name);
        $("#gender").val(data.gender);
        $("#village").val(data.site_village);
        $("#otp_id").val(data.otp_id);
        $("#exit_date").val(data.exit_date);
        $("#exit_weight").val(data.exit_weight);
        $("#exit_muac").val(data.exit_muac);

        $("#exit_other_com_name").val(data.exit_other_com_name);
        $("#exit_other_com_qty").val(data.exit_other_com_qty);

        function ration() {
          $("#exit_ration1").val(data.exit_ration1);
          $("#exit_ration2").val(data.exit_ration2);
          $("#exit_ration3").val(data.exit_ration3);
          $("#exit_quantity1").val(data.exit_quantity1);
          $("#exit_quantity2").val(data.exit_quantity2);
          $("#exit_quantity3").val(data.exit_quantity3);
        }
        setTimeout(ration, 200);
        if (data.prog_type == 'sc') {
          $('#exit_reason').children('option:not(:first)').remove();
          $('#exit_reason').append(`
            <option value="cured">Cured</option>
                      <option value="lama">Defaulter (LAMA)</option>
                      <option value="non_recovered">Non Recovered</option>
                      <option value="death">Death</option>
                      <option value="medical_transfer">Medical Transfer</option>
                      <option value="transfer_to_otp">Transfer to OTP</option>
                      <option value="moved_out">Moved Out</option>
                      <option value="moved_out_to_other_programe">Moved Out to other Programme</option>
                      <option value="other">Other</option>
            `)
        } else if (data.prog_type == 'otp') {
          var _otp = `<option value="cured">Cured</option>
            <option value="defaulter">Defaulter</option>
            <option value="non_respondent">Non Respondent</option>
            <option value="death">Death</option>
            <option value="medical_transfer_sc">Transfer To NSC</option>
            <option value="medical_transfer">Medical Transfer</option>
            <option value="transfer_out_to_other_otp">Transfer Out to other OTP</option>
            <option value="moved_out">Moved Out</option>
            <option value="moved_out_to_other_programe">Moved Out to other Programme</option>
            <option value="other">Other</option>`
          $('#exit_reason').append(_otp);
        }
        $("#exit_reason").val(data.exit_reason);

        $("#weight_gain").val(data.weight_gain);
        $("#days_in_program").val(data.days_in_program);
        $("#add_weight").val(data.weight);
        $("#add_date").val(data.add_date);
        $("#ddProvince").val(data.province_id);


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


      } else {
        alert('This could not be edited b/c its been more than 5 days since uploaded')

      }
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
  $('#exit_reason').change(function () {
    if ($(this).val() == 'defaulter') {
      $('#exit_weight').attr('required', false)
      $('#exit_muac').attr('required', false)
      $('#exit_ration1').attr('required', false)
      $('#exit_quantity1').attr('required', false)
    } else {
      $('#exit_weight').attr('required', true)
      $('#exit_muac').attr('required', true)
      $('#exit_ration1').attr('required', true)
      $('#exit_quantity1').attr('required', true)
    }
  })
}