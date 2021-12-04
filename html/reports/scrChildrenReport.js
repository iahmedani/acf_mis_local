module.exports.initScrChildrenReport = function () {
  var defProg = JSON.parse(window.localStorage.getItem('defaults'))['defProg']
  $(async function () {
    // var datePickerId_end = document.getElementById('end_date');
    // datePickerId_end.max = new Date().toISOString().split("T")[0];
    // var datePickerId_start = document.getElementById('start_date');
    // datePickerId_start.min = new Date(2018,07,01).toISOString().split("T")[0];

    $('#ddInterval').on('change', function () {
      var value = $(this).val();
      console.log(value);
      if (value == 1) {
        $('#start_date').attr('disabled', false);
        $('#end_date').attr('disabled', false);
      } else {
        $('#start_date').attr('disabled', true);
        $('#end_date').attr('disabled', true);
      }
    })

      await setFormDefualts('ddProgramType','ddProvince','ddDistrict','ddTehsil')
      await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse',defProg )
      
    $('#ddUC').on('change', function () {
      var ucs = $(this).val();
      ucForHH = ucs
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

  function prepareQry() {
    var qry = {};
    ($('#ddProvince').val()) ? qry.province_id = $('#ddProvince').val(): '';
    ($('#ddDistrict').val()) ? qry.district_id = $('#ddDistrict').val(): '';
    ($('#ddTehsil').val()) ? qry.tehsil_id = $('#ddTehsil').val(): '';
    ($('#ddUC').val()) ? qry.uc_id = $('#ddUC').val(): '';
    ($('#ddStaff_code').val()) ? qry.staff_code = $('#ddStaff_code').val(): '';
    ($('#ddSup_code').val()) ? qry.sup_code = $('#ddSup_code').val(): '';
    ($('#ddInterval').val() == 1) ? qry.date = {
      x: 'screening_date',
      y: [$('#start_date').val(), $('#end_date').val()]
    }: '';
    // console.log(qry);
    return qry;
  }
  $(function () {
    function putSummaryDataToTable(table, array) {
      $(`#${table} td`).each(function () {
        $(this).empty();
      })
      var keys = Object.keys(array[0]);
      keys.forEach(el => {
        $(`#${el}`).text(array[0][el]);
      })
    }

    function createSingleEntryTable(table, array, headerObj, headerKeys) {
      var html = `<tr>`
      headerObj.forEach(el => {
        html += `<th>${el}</th>`
      })
      html += '</tr>'
      array.forEach(el => {
        html += '<tr>'
        headerKeys.forEach(h => {
          html += `<td>${el[h]}</td>`
        })
        html += '</tr>'
      })
      $(`#${table}`).empty();
      $(`#${table}`).append(html);
    }

    function scrChildReport(qry) {
      return new Promise((resolve, reject) => {
        ipc.send('scrChildReport', (qry));
        ipc.on('scrChildReport', (e, result) => {
          // console.log(result)
          if (result.err) {
            reject(result.err)
            ipc.removeAllListeners('scrChildReport')
          } else {
            resolve(result.result);
            ipc.removeAllListeners('scrChildReport')

          }
        })
      })
    }
    $('#showDataScrReport').on('click', function (e) {
      e.preventDefault();
      var fullTextCh = ['Province', 'District', 'Tehsil', 'UC', 'Catchment Population', 'Reporting Month', 'Staff Name', 'Staff Code', 'Supervisor Name', 'Supervisor Code', 'Total HH Visited', 'Report Type', 'Total Screened (Girls)', 'Total Screened (Boys)','Total Boys 6-23','Total Girls 6-23', 'Total Boys 24-59','Total Girls 24-59','First time Screened (Girls)', 'First time screened (Boys)', 'Re-Screened Girls', 'Re-Screened Boys', 'Normal (6 to 23 Girls)', 'Normal (6 to 23 Boys)', 'Normal (24 to 59 Girls)', 'Normal (24 to 59 Boys)', 'MAM (6 to 23 Girls)', 'MAM (6 to 23 Boys)', 'MAM (24 to 59 Girls)', 'MAM (24 to 59 Boys)', 'SAM without complication (6 to 23 Girls)', 'SAM without complication (6 to 23 Boys)', 'SAM without complication (24 to 59 Girls)', 'SAM without complication (24 to 59 Boys)', 'SAM with complication (6 to 23 Girls)', 'SAM with complication (6 to 23 Boys)', 'SAM with complication (24 to 59 Girls)', 'SAM with complication (24 to 59 Boys)', '+,++ Oedema (Girls)', '+,++ Oedema (Boys)', '+,++ Oedema (Girls) 6-23', '+,++ Oedema (Boys) 6-23','+,++ Oedema (Girls) 2459', '+,++ Oedema (Boys) 2459','+++ Oedema (Girls)', '+++ Oedema (Boys)','+++ Oedema (Girls) 6-23', '+++ Oedema (Boys) 6-23','+++ Oedema (Girls) 2459', '+++ Oedema (Boys) 2459', 'Total Refered TSFP (Girls)', 'Total Refered TSFP (Boys)', 'Total Refered OTP (Girls)', 'Total Refered OTP (Boys)', 'Site One', 'Refered TSFP (Girls) S1', 'Refered TSFP (Boys) S1', 'Refered TSFP (Girls 6-23) S1', 'Refered TSFP (Boys 6-23) S1','Refered TSFP (Girls 24-59) S1', 'Refered TSFP (Boys 24-59) S1','Refered OTP (Girls) S1', 'Refered OTP (Boys) S1','Refered OTP (Girls 6-23) S1', 'Refered OTP (Boys 6-23) S1','Refered OTP (Girls 24-59) S1', 'Refered OTP (Boys 24-59) S1', 'Site Two', 'Refered TSFP (Girls) S2', 'Refered TSFP (Boys) S2','Refered TSFP (Girls 6-23) S2', 'Refered TSFP (Boys 6-23) S2','Refered TSFP (Girls 24-59) S2', 'Refered TSFP (Boys 24-59) S2', 'Refered OTP (Girls) S2', 'Refered OTP (Boys) S2','Refered OTP (Girls 6-23) S2', 'Refered OTP (Boys 6-23) S2','Refered OTP (Girls 24-59) S2', 'Refered OTP (Boys 24-59) S2',  'Deworming Girls', 'Deworming Boys', 'MNP Sachet distributed (Girls)', 'MNP Sachet distributed (Boys)', 'MNP Sachet distributed (Boys 6-23)', 'MNP Sachet distributed (Girls 6-23)','MNP Sachet distributed (Girls 24-59)', 'MNP Sachet distributed (Boys 24-59)','MNP Followed Up','MNP Followed Up (Boys 6-23)', 'MNP Followed Up (Girls 6-23)','MNP Followed Up (Boys 24-59)', 'MNP Followed Up (Girls 24-59)','Exit From MNP Criteria','Exit From MNP Criteria (Boys 6-23)','Exit From MNP Criteria (Girls 6-23)','Exit From MNP Criteria (Boys 24-59)', 'Exit From MNP Criteria (Girls 24-59)','Deworming Grils', 'Deworming Boys', 'Deworming (Boys 6-23)','Deworming (Girls 6-23)','Deworming (Boys 24-59)', 'Deworming (Girls 24-59)','Other Commodity','Rec: other Com: Boys', 'Rec: other Com: Girls', 'Rec: other Com: (Boys 6-23)','Rec: other Com: (Girls 6-23)','Rec: other Com: (Boys 24-59)', 'Rec: other Com: (Girls 24-59)' ]
      var colNameCh = ['province', 'district_name', 'tehsil_name', 'uc_name', 'catchment_population', 'report_month', 'staff_name', 'staff_code', 'sup_name', 'sup_code', 'total_hh', 'ent_type', 'total_scr_girls', 'total_scr_boys','total_scr_boys_623','total_scr_girls_623', 'total_scr_boys_2459','total_scr_girls_2459','new_girls', 'new_boys', 'reScreened_girls', 'reScreened_boys', 'normal_girls_623', 'normal_boys_623', 'normal_girls_2459', 'normal_boys_2459', 'mam_girls_623', 'mam_boys_623', , 'mam_girls_2459', 'mam_boys_2459', 'sam_without_comp_girls_623', 'sam_without_comp_boys_623', 'sam_without_comp_girls_2459', 'sam_without_comp_boys_2459', 'sam_with_comp_girls_623', 'sam_with_comp_boys_623', 'sam_with_comp_girls_2459', 'sam_with_comp_boys_2459', 'plus12_oedema_girls', 'plus12_oedema_boys', 'plus12_boys_623','plus12_girls_623','plus12_boys_2459','plus12_girls_2459','plus3_oedema_girls', 'plus3_oedema_boys','plus3_boys_623','plus3_girls_623','plus3_boys_2459','plus3_girls_2459', 'reffer_tsfp_girls', 'reffer_tsfp_boys', 'reffer_otp_girls', 'reffer_otp_boys', 'site_one', 'reffer_tsfp_girls_s1', 'reffer_tsfp_boys_s1','reffer_tsfp_boys_623_s1','reffer_tsfp_girls_623_s1','reffer_tsfp_boys_2459_s1','reffer_tsfp_girls_2459_s1', 'reffer_otp_girls_s1', 'reffer_otp_boys_s1','reffer_otp_boys_623_s1','reffer_otp_girls_623_s1','reffer_otp_boys_2459_s1','reffer_otp_girls_2459_s1', 'site_two', 'reffer_tsfp_girls_s2', 'reffer_tsfp_boys_s2','reffer_tsfp_boys_623_s2','reffer_tsfp_girls_623_s2','reffer_tsfp_boys_2459_s2','reffer_tsfp_girls_2459_s2', 'reffer_otp_girls_s2', 'reffer_otp_boys_s2','reffer_otp_boys_623_s2','reffer_otp_girls_623_s2','reffer_otp_boys_2459_s2','reffer_otp_girls_2459_s2', 'deworming_girls', 'deworming_boys', 'mnp_girls', 'mnp_boys','mnp_boys_623','mnp_girls_623','mnp_boys_2459','mnp_girls_2459','total_followup', 'followup_boys_623','followup_girls_623','followup_boys_2459','followup_girls_2459','total_exits','exits_boys_623','exits_girls_623','exits_boys_2459','exits_girls_2459','deworming_girls', 'deworming_boys','deworming_boys_623','deworming_girls_623','deworming_boys_2459','deworming_girls_2459','other_specify','other_boys','other_girls','other_boys_623','other_girls_623','other_boys_2459','other_girls_2459']
      // $('#filterDate').validate();
      if ($('#filterDate').valid()) {

        scrChildReport(prepareQry())
          .then(result => {
            // console.log(result)
            putSummaryDataToTable('scrChildNewSum', result.summary)
            createSingleEntryTable('scrChildNewSingle', result.single, fullTextCh, colNameCh)
            
          })
          .catch(e => {
            // console.log('error occured during summary table creation')
          })
      }
    });
    $('#exportScrChReport').on('click', function () {
      export_xlsx();
    })
  })

  /* xlsx.js (C) 2013-present SheetJS -- http://sheetjs.com */
  /*global Uint8Array, console */
  /* exported export_xlsx */
  /* eslint no-use-before-define:0 */
  var XLSX = require('xlsx');
  var electron = require('electron').remote;

  var export_xlsx = (function () {
    // var HTMLOUT = document.getElementById('htmlout');
    var XTENSION = "xls|xlsx|xlsm|xlsb|xml|csv|txt|dif|sylk|slk|prn|ods|fods|htm|html".split("|")
    return function () {
      var workbook = XLSX.utils.book_new();
      var ws1 = XLSX.utils.table_to_sheet(document.getElementById('scrChildNewSum'));
      XLSX.utils.book_append_sheet(workbook, ws1, "Summary");

      /* convert table 'table2' to worksheet named "Sheet2" */
      var ws2 = XLSX.utils.table_to_sheet(document.getElementById('scrChildNewSingle'));
      XLSX.utils.book_append_sheet(workbook, ws2, "Screening Detail");
      // var wb = XLSX.utils.table_to_book(HTMLOUT);
      var o = electron.dialog.showSaveDialog({
        title: 'Save file as',
        filters: [{
          name: "Spreadsheets",
          extensions: XTENSION
        }]
      });

      console.log(o);
      XLSX.writeFile(workbook, o);
      electron.dialog.showMessageBox({
        message: "Exported data to " + o,
        buttons: ["OK"]
      });
    };
  })();
  void export_xlsx;
}