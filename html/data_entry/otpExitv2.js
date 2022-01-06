const knex = require('../../mainfunc/db');
var uuid = require('uuid/v4');

module.exports.initOtpExit = function () {

  $( async function () {
    var inDays = function (d1, d2) {
      var date1 = new Date(d1);
      var date2 = new Date(d2);
      var t2 = date2.getTime();
      var t1 = date1.getTime();

      return parseInt((t2 - t1) / (24 * 3600 * 1000));
    };
    $(function () {
      var datePickerId = document.getElementById("exit_date");
      datePickerId.max = new Date().toISOString().split("T")[0];
    });
    $('#exit_date').on('change', function () {
      console.log('clicked')
      var days = inDays($('#add_date').val(), $(this).val());
      console.log(days)
      $('#days_in_program').empty();
      $('#days_in_program').val(days);
      var gKgDay = parseFloat(((($('#exit_weight').val() - $('#add_weight').val()) * 1000) / days), 2);
      $('#weight_gain').empty();
      $('#weight_gain').val(gKgDay);
    })
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
    // ipc.send("getCommodityAll");
    // ipc.on('commodityAll', function (evt, com) {
    //   $('#exit_ration1').children('option:not(:first)').remove();
    //   $('#exit_ration2').children('option:not(:first)').remove();
    //   $('#exit_ration3').children('option:not(:first)').remove();
    //   commodity(com, 'exit_ration1');
    //   commodity(com, 'exit_ration2');
    //   commodity(com, 'exit_ration3');
    // })
    await setFormDefualts('ddProgramType','ddProvince','ddDistrict','ddTehsil')
    await appendItems('ddProvince','provinceList',false,'id','provinceName');
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse' )
  });
  // $('#ddHealthHouse').on('change', function (e) {
  //   // $('#').jsGrid.
  //   // loadData with custom filter
  //   var filter = {};
  //   filter.site_id = $('#ddHealthHouse').val()
  //   if (!$('#ddProgramType').val() || $('#ddProgramType').val() == "") {
  //     Swal.fire({
  //       type: 'error',
  //       title: 'Exit Entry',
  //       text: 'Please select Program Type'
  //     })
  //     return;
  //   }
  //   filter.tehsil_id = ($('#ddTehsil').val()) ? $('#ddTehsil').val() : '';
  //   filter.prog_type = $('#ddProgramType').val();
  //   $("#otpExitGrid").jsGrid("loadData", {
  //     site_id: filter
  //   }).done(function () {
  //     console.log("data loaded");
  //   });
  //   // $("#otpExitGrid").jsGrid("loadData", { site_id: $(this).val()}).done(function() {
  //   //   console.log("data loaded");
  //   // });
  // })
  $('.chq').on('change', function (e) {
    // $('#').jsGrid.
    // loadData with custom filter
    var filter = {};
    filter.site_id = ($('#ddHealthHouse').val()) ? $('#ddHealthHouse').val() : '';
    if (!$('#ddProgramType').val() || $('#ddProgramType').val() == "") {
      Swal.fire({
        type: 'error',
        title: 'Exit Entry',
        text: 'Please select Program Type'
      })
      return;
    }
    filter.tehsil_id = ($('#ddTehsil').val()) ? $('#ddTehsil').val() : '';
    filter.prog_type = $('#ddProgramType').val();
    if (filter.prog_type == 'sc') {
      $('#ddHealthHouse option').attr('value', '');
      $('#ddHealthHouse').attr('disabled', true)
      $('#ddغظ option').attr('value', '');
      $('#ddUC').attr('disabled', true)
    } else {
      $('#ddHealthHouse').attr('disabled', false)
      $('#ddUC').attr('disabled', false)


    }

    $("#otpExitGrid").jsGrid("loadData", {
      site_id: filter.site_id,
      prog_type: filter.prog_type,
      tehsil_id: filter.tehsil_id
    }).done(function () {
      console.log("data loaded");
    });
    // $("#otpExitGrid").jsGrid("loadData", { site_id: $(this).val()}).done(function() {
    //   console.log("data loaded");
    // });
  })

  let xx = (filter) => {
    return new Promise((resolve, reject) => {
      ipc.send('getInterim', filter);
      ipc.on('getInterim', (e, result) => {
        var s = {
          data: result.result,
          itemsCount: result.totalCount[0].total
        }
        if (result.err) {
          reject(result.err)
          ipc.removeAllListeners('getOtpAll')
        } else {
          console.log(s)
          resolve(s)
          ipc.removeAllListeners('getOtpAll')
        }
      })
    })
    //   ipc.send('getOtpAll', site_id);
    //   ipc.on('getOtpAll', (e, result)=>{
    //     if(result.err){
    //       reject(result.err)
    //       ipc.removeAllListeners('getOtpAll')
    //     }else{           
    //             var s = {
    //               data: result.result,
    //               itemsCount: result.result.length
    //             }
    //             console.log(s)
    //       resolve(s)
    //       ipc.removeAllListeners('getOtpAll')
    //     }
    //   })
    // })
  }

  function _dataGrid() {
    $("#otpExitGrid").jsGrid({
      height: "300px",
      width: "100%",
      filtering: true,
      editing: true,
      sorting: false,
      paging: true,
      autoload: true,
      pageLoading: true, // this is the clue
      pageSize: 10,
      pageButtonCount: 5,
      deleteConfirm: "Do you really want to delete client?",
      controller: {
        loadData: function (filter) {
          // console.log(filter)
          filter.site_id = ($('#ddHealthHouse').val()) ? $('#ddHealthHouse').val() : '';
          filter.tehsil_id = ($('#ddTehsil').val()) ? $('#ddTehsil').val() : '';

          filter.prog_type = $('#ddProgramType').val();
          // console.log('loaddata', site_id)
          return xx(filter);
        },
        updateItem: function (item) {
          console.log('update')
          console.log(item);
          return addFollowup(item);
        }
      },
      fields: [{
          name: "reg_id",
          title: "Reg #",
          type: "text",
          width: 50,
          editing: false,
        }, {
          name: "p_name",
          title: "Name",
          type: "text",
          width: 100,
          editing: false,
        }, {
          name: "f_or_h_name",
          title: "Husband Name",
          type: "text",
          width: 100,
          editing: false,
        }, {
          name: 'gender',
          title: 'Gender',
          type: "text",
          width: 100,
          editing: false,
        },
        {
          name: "site_village",
          title: "Village",
          type: "text",
          width: 100,
          editing: false,
          // filtering: false
          // filtering: $('#ddProgramType').val() == 'sc' ? false : true
        },
        //   {type: 'control',
        //     f  
        // } 
      ],

      rowClass: function (item, itemIndex) {
        // console.log(item)
        var date1 = new Date(item.curr_date);
        var date2 = new Date();
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        // console.log(diffDays)
        return diffDays > 21 ? 'bg-red' : '';
        // itemIndex%2==0 ? 'bg-red' : 'bg-green';
      },
      rowClick: function (args) {
        this.editItem(args.item);
        var data = args.item;
        $("#exitAddForm").trigger('reset');
        $('#p_name').val(data.p_name);
        $('#gender').val(data.gender);
        $('#village').val(data.site_village);
        $('#otp_id').val(data.otp_id);
        $('#add_weight').val(data.weight);
        $('#add_date').val(data.reg_date);
        console.log(args.item);
        ipc.send("getCommodity", data.prog_type);
        ipc.on('commodity', function (evt, com) {
          $('#exit_ration1').children('option:not(:first)').remove();
          $('#exit_ration2').children('option:not(:first)').remove();
          $('#exit_ration3').children('option:not(:first)').remove();
          commodity(com, 'exit_ration1');
          commodity(com, 'exit_ration2');
          commodity(com, 'exit_ration3');
        })
      }

    });
  };

  $('#ddProgramType').on('change', async function () {
    var prog = $(this).val();
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse',prog)
    $('#exit_reason').children('option:not(:first)').remove();
    if ($(this).val() == 'sc') {
      $('#exit_reason').append(`
      <option value="cured">Cured</option>
                <option value="lama">Defaulter (LAMA)</option>
                <option value="non_recovered">Non Recovered</option>
                <option value="death">Death</option>
                <option value="medical_transfer">Medical Transfer</option>
                <option value="transfer_to_otp">Transfer to OTP</option>
                <option value="moved_out">Moved Out</option>
                <option value="moved_out_to_other_programe">Moved Out to other proragme</option>
                <option value="other">Other</option>
      `)
    } else {
      var _otp = `<option value="cured">Cured</option>
      <option value="defaulter">Defaulter</option>
      <option value="non_respondent">Non Respondent</option>
      <option value="death">Death</option>
      <option value="medical_transfer_sc">Transfer To NSC</option>
      <option value="medical_transfer">Medical Transfer</option>
      <option value="transfer_out_to_other_otp">Transfer Out to other OTP</option>
      <option value="moved_out">Moved Out</option>
      <option value="moved_out_to_other_programe">Moved Out to other proragme</option>
      <option value="other">Other</option>`
      $('#exit_reason').append(_otp);
    }

  })
  _dataGrid();

  function _refreshGrid() {
    $("#otpExitGrid").jsGrid("render").done(function () {
      console.log("rendering completed and data loaded");
    });

  }


  $('#exitAddForm').on('submit', (e) => {
    e.preventDefault();
    $('#exitAddForm').validate();
    if ($('#exitAddForm').valid()) {
      var formData = $('#exitAddForm').serializeFormJSON();
      formData.exit_id = uuid();
      console.log(formData)
      // var exit_date = $('#exit_date').val();
      // formData.exit_date = exit_date;
      delete formData.p_name;
      delete formData.gender;
      delete formData.village;
      ipc.send('otpExitAdd', formData);
      ipc.removeAllListeners('otpExitAdd');
      $("#exitAddForm").trigger('reset');
      var filter = {};
      filter.site_id = $('#ddHealthHouse').val()
      //  $("#otpExitGrid").jsGrid("reset");
      // _dataGrid();
      setTimeout(_refreshGrid, 200)
      //  _dataGrid();
      //  $("#otpExitGrid").jsGrid("loadData", { site_id: filter}).done(function() {
      //   console.log("data loaded");
      // });
      //   $("#otpExitGrid").jsGrid("render").done(function() {
      //     console.log("rendering completed and data loaded");
      // });
      // $("#jsGrid").jsGrid("refresh")     
    }
  })

}