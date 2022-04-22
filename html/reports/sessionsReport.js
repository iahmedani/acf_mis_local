var knex = require('../../mainfunc/db')
module.exports.sessionsReport = () => {
  var defProg = JSON.parse(window.localStorage.getItem('defaults'))['defProg']
  $('#ddProgramType').change(() => {
    $('.prgChange').val("")
  })

  
  $( async function () {
    // $("#tblSessionReport").DataTable({
    //   paging: false,
    //   searching:false
    // })

    await setFormDefualts('ddProgramType','ddProvince','ddDistrict','ddTehsil')
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse',defProg )
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
    $(".sReportFilter").on('change', function () {
      console.log($(this).val())
      // if ($.fn.DataTable.isDataTable("#tblSessionReport")) {
      //   $("#tblSessionReport")
      //     .DataTable()
      //     .destroy();
      // }

      getSessionData(currentFilter());


    });
    var currentFilter = () => {
      var x = {};
      x.prog_type = $("#ddProgramType").val() ? $("#ddProgramType").val() : "";
      x.province_id = $("#ddProvince").val() ? $("#ddProvince").val() : "";
      x.district_id = $("#ddDistrict").val() ? $("#ddDistrict").val() : "";
      x.tehsil_id = $("#ddTehsil").val() ? $("#ddTehsil").val() : "";
      x.uc_id = $("#ddUC").val() ? $("#ddUC").val() : "";
      x.site_id = ($("#ddHealthHouse").val() && $('#ddProgramType').val() == 'otp') ? $("#ddHealthHouse").val() : "";
      x.CHS_id = ($("#ddSup_code").val()) ? $("#ddSup_code").val() : "";
      x.CHW_id = ($("#ddStaff_code").val()) ? $("#ddStaff_code").val() : "";
      if ($("#ddInterval").val() == 1 && $("#start_date").val() && $("#end_date").val()) {
        x.startDate = $("#start_date").val();
        x.endDate = $("#end_date").val();
      }
      return x;
    }

    let getSessionData = (filter) => {
      if ($.fn.DataTable.isDataTable("#tblSessionReport")) {
        $("#tblSessionReport")
          .DataTable()
          .destroy();
      }

      if ($.fn.DataTable.isDataTable("#tblSessionSummary")) {
        $("#tblSessionSummary")
          .DataTable()
          .destroy();
      }
      swal.fire({
        imageUrl:'../img/4V0b.gif',
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
    })

      ipc.send("getSessionsAllReport", filter);
      ipc.on("getSessionsAllReport", (event, data) => {
        // console.log(data.result.data);
      
        $("#tblSessionReport")
          .on('processing.dt', function (e, settings, processing) {
            $('.spinner-border').css('display', processing ? 'block' : 'none');
          })
          .DataTable({
            data: data.result.data,
            responsive: true,
            pageLength: 5,
            dom: "Bfrtip",
            // "dom": '<"dttopcustom"lfr>t<"dtbottomcustom"ip>',
            buttons: ["copy", {
              extend: "csv",
              title: 'Sessions Report_' + new Date().toDateString()
            }, {
              extend: "excel",
              title: 'Sessions Report_' + new Date().toDateString()
            }],
            retrieve: true,
            paging: true,
            columns: [{
                title: "Date",
                data: "session_date",
                render: function (data, type, row) {
                  var x = new Date(data).getFullYear() + '-' + (parseInt(new Date(data).getMonth()) + parseInt(1));
                  return x

                }
              },{
                title: "Session Date",
                data: "session_date"
              },
              {
                title: "Program",
                data: "prog_type",
                render: function (data, type, row) {
                  return data.toUpperCase();
                }
              },
              {
                title: "Province",
                data: "province"
              },
              {
                title: "District",
                data: "district_name"
              },
              {
                title: "Tehsil",
                data: "tehsil_name"
              },
              {
                title: "UC",
                data: "uc_name"
              },
              {
                title: "Site",
                data: "site_name"
              },
              {
                title: "CHS Name",
                data: "sup_name",
                render: function (data, type, row) {
                  return data ? data.toUpperCase() : '';
                }
              },
              {
                title: "LHS Name",
                data: "staff_name",
                render: function (data, type, row) {
                  return data ? data.toUpperCase() : '';
                }
              },
              {
                title: 'Total Sessions',
                data: 'total_session'
              },
              {
                title: 'Session Given to MTM',
                data: 'mtmg'
              },
              {
                title: 'Session Given to FTF',
                data: 'ftfg'
              },
              {
                title: 'Group Sessions',
                data: 'grp_sessions'
              },
              {
                title: 'Individual Sessions',
                data: 'ind_session'
              },
              {
                title: "Session",
                data: "session_type",
                render: function (data, type, row) {
                  var x = {
                    nut_health_hygene: 'Nutrition, Health and Hygene',
                    iycf: 'IYCF',
                    breastFeeding: 'Breast Feeding Counseling',
                    cooking: 'Cooking Demonstration',
                    other: 'Other',
                    '(SBCC) Identification, prevention and treatment of malnutrition': '(SBCC) Identification, prevention and treatment of malnutrition',
                     '(SBCC) Diet and healthcare of mothers during pregnancy and lactation': '(SBCC) Diet and healthcare of mothers during pregnancy and lactation',
                    '(SBCC) Mother and child care after delivery': '(SBCC) Mother and child care after delivery',
                   '(SBCC) Children’s diet': `(SBCC) Children’s diet`,
                   '(SBCC) Personal and environmental hygiene': `(SBCC) Personal and environmental hygiene`
                    }
                  return x[data];
                }
              },
              {
                title: "Location",
                data: "session_location",
                render: function (data, type, row) {
                  return data.replace('_', ' ').toUpperCase();
                }
              },
              
              {
                title: "Males",
                data: "male_participants"
              },
              {
                title: "Females",
                data: "female_participants"
              },
              {
                title: "Pragnent",
                data: "pragnent"
              },
              {
                title: "Lactating",
                data: "lactating"
              },
              {
                title: "PLW",
                data: "plw"
              },
              {
                title: 'Other Female',
                render: function (data, type,row) {
                  return (row.female_participants - (row.pragnent + row.lactating + row.plw))
                }
              },
              {
                title: "New Participants",
                data: "new_participants"
              },
              {
                title: "Old Participants",
                data: "old_participants"
              },
              
              {
                title: "Remarks",
                data: "remarks"
              }

            ]
          });
      });

      ipc.send("getSessionsSummary", filter);
      ipc.on("getSessionsSummary", (event, data) => {
        // console.log(data.result.data);
        $("#tblSessionSummary")
          .on('processing.dt', function (e, settings, processing) {
            $('.spinner-border').css('display', processing ? 'block' : 'none');
          }).DataTable({
            data: data.result.data,
            dom: "Bfrtip",
            buttons: ["copy", {
              extend: "csv",
              title: 'Sessions Summary Report_' + new Date().toDateString()
            }, {
              extend: "excel",
              title: 'Sessions Summary Report_' + new Date().toDateString()
            }],
            retrieve: true,
            paging: true,
            columns: [{
                title: "Program",
                data: "prog_type",
                render: function (data, type, row) {
                  return data.toUpperCase();
                }
              },
              {
                title: "Session",
                data: "session_type",
                render: function (data, type, row) {
                  var x = {
                    nut_health_hygene: 'Nutrition, Health and Hygene',
                    iycf: 'IYCF',
                    breastFeeding: 'Breast Feeding Counseling',
                    cooking: 'Cooking Demonstration',
                    other: 'Other',
                    '(SBCC) Identification, prevention and treatment of malnutrition': '(SBCC) Identification, prevention and treatment of malnutrition',
                     '(SBCC) Diet and healthcare of mothers during pregnancy and lactation': '(SBCC) Diet and healthcare of mothers during pregnancy and lactation',
                    '(SBCC) Mother and child care after delivery': '(SBCC) Mother and child care after delivery',
                   '(SBCC) Children’s diet': `(SBCC) Children’s diet`,
                   '(SBCC) Personal and environmental hygiene': `(SBCC) Personal and environmental hygiene`
                    }
                  return x[data];
                }
              },
              {
                title: 'Total Sessions',
                data: 'total_session'
              },
              {
                title: 'Session Given to MTM',
                data: 'mtmg'
              },
              {
                title: 'Session Given to FTF',
                data: 'ftfg'
              },
              {
                title: 'Group',
                data: 'grp_sessions'
              },
              {
                title: 'Individual',
                data: 'ind_session'
              },

              {
                title: "Females",
                data: "female_participants"
              },
              {
                title: "Males",
                data: "male_participants"
              },
              {
                title: "Pragnent",
                data: "pragnent"
              },
              {
                title: "Lactating",
                data: "lactating"
              }
              ,
              {
                title: "PLW",
                data: "plw"
              },
              {
                title: 'Other Female',
                render: function (data, type,row) {
                  return (row.female_participants - (row.pragnent + row.lactating + row.plw))
                }
              },
              {
                title: "New Participants",
                data: "new_participants"
              },
              {
                title: "Old Participants",
                data: "old_participants"
              }
            ]
          });
      });
      Swal.close()
    }
    getSessionData(currentFilter());
    $("#ddInterval").on("change", function () {
      var value = $(this).val();
      console.log(value);
      if (value == 1) {
        $("#start_date").attr("disabled", false);
        $("#end_date").attr("disabled", false);
        $("#showSessionReport").attr('disabled', false);
      } else {
        $("#start_date").attr("disabled", true);
        $("#end_date").attr("disabled", true);
        $("#showSessionReport").attr('disabled', true);

      }
    });

    $("#showSessionReport").on("click", function (e) {
      e.preventDefault();
      $("#filterDateSession").validate();
      if ($("#filterDateSession").valid()) {
        // console.log('here')
        getSessionData(currentFilter());
      }
    });
  });


  $(async () => {
    // $('.outreach').hide();
    var defProg = JSON.parse(window.localStorage.getItem('defaults'))['defProg']
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
     
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse',val )
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

}