module.exports.initScrPlwNewUpd = function () {
  $(() => {
    $('input[type="number"]').attr('min', 0);
    var p = $('.p')
    var l = $('.l')
    var plw = $('.plw')
    var pt = $('#total_scr_pragnent')
    var lt = $('#total_scr_lactating')
    var plwt = $('#total_scr_plw')

    p.change(() => {
      var total = 0;
      p.each(function () {
        total += isNaN(parseInt($(this).val())) ? 0 : parseInt($(this).val())
        pt.val(total);
      })
    })
    l.change(() => {
      var total = 0;
      l.each(function () {
        total += isNaN(parseInt($(this).val())) ? 0 : parseInt($(this).val())


        lt.val(total);
      })
    })
    plw.change(() => {
      var total = 0;
      plw.each(function () {
        total += isNaN(parseInt($(this).val())) ? 0 : parseInt($(this).val())


        plwt.val(total);
      })
    })

  })

  function totalCheck() {
    var pt = $('#total_scr_pragnent')
    var lt = $('#total_scr_lactating')
    var plwlt = $('#total_scr_plw')
    var p1 = $('.p1')
    var l1 = $('.l1')
    var plw1 = $('.plw1')
    var ltotal = parseInt(lt.val());
    var ptotal = parseInt(pt.val());
    var plwtotal = parseInt(plwlt.val());
    var p1Val = 0;
    var l1Val = 0;
    var plw1Val = 0;
    p1.each(function () {
      p1Val += ($(this).val()) ? parseInt($(this).val()) : 0;
    })
    l1.each(function () {
      l1Val += ($(this).val()) ? parseInt($(this).val()) : 0;
    })
    plw1.each(function () {
      plw1Val += ($(this).val()) ? parseInt($(this).val()) : 0;
    })
    if (ltotal != l1Val) {
      l1.addClass('highlightInput')
    } else {
      l1.removeClass('highlightInput')
    }
    if (ptotal != p1Val) {
      p1.addClass('highlightInput')
    } else {
      p1.removeClass('highlightInput')
    }
    if (plwtotal != plw1Val) {
      plw1.addClass('highlightInput')
    } else {
      plw1.removeClass('highlightInput')
    }
  }
  $(function () {
    var datePickerId = document.getElementById('txtScrChildDate');
    datePickerId.max = new Date().toISOString().split("T")[0];
  });
  $(async function () {
    await setFormDefualts(false,'ddProvince','ddDistrict','ddTehsil')
    // await appendItems('ddProvince','provinceList',false,'id','provinceName');
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse' )
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
      // ipc.send('getHealthHouse', ucs)
      // ipc.on('hh', function (evt, hh) {
      //   $('#ddHealthHouse').children('option:not(:first)').remove();
      //   hhListener(hh);
      // })
    })
    // $("#ddHealthHouse").on("change", function () {
    //   var siteId = $(this).val();
    //   // ucForHH = ucs;
    //   ipc.send("getStaff", siteId);
    //   ipc.send("getSups", siteId);

    //   ipc.on("haveStaff", function (evt, staffs) {
    //     $("#ddStaff_code")
    //       .children("option:not(:first)")
    //       .remove();
    //     staffListener(staffs);
    //   });
    //   ipc.on("haveSups", function (evt, _sups) {
    //     $("#ddSup_code")
    //       .children("option:not(:first)")
    //       .remove();
    //     supListener(_sups);
    //   });
    // });
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
  })
  $(() => {
    // function prepareQry() {
    //   var qry = {};
    //   ($('#ddProvince').val()) ? qry.province_id = $('#ddProvince').val(): '';
    //   ($('#ddDistrict').val()) ? qry.district_id = $('#ddDistrict').val(): '';
    //   ($('#ddTehsil').val()) ? qry.tehsil_id = $('#ddTehsil').val(): '';
    //   ($('#ddUC').val()) ? qry.uc_id = $('#ddUC').val(): '';
    //   ($('#ddInterval').val() == 1) ? qry.date = {
    //     x: 'screening_date',
    //     y: [$('#start_date').val(), $('#end_date').val()]
    //   }: '';
    //   console.log(qry);
    //   return qry;
    // }
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
        return new Date(value).toDateString();
      },

      insertTemplate: function (value) {
        return this._insertPicker = $("<input>").datepicker({
          defaultDate: new Date()
        });
      },

      editTemplate: function (value) {
        return this._editPicker = $("<input>").datepicker().datepicker("setDate", new Date(value));
      },

      insertValue: function () {
        return this._insertPicker.datepicker("getDate").toISOString();
      },

      editValue: function () {
        return this._editPicker.datepicker("getDate").toISOString();
      }
    });
    jsGrid.fields.date = MyDateField;
    let getPlwScr = filter => {
      return new Promise((resolve, reject) => {
        ipc.send("allScrPlw", filter);
        ipc.on("allScrPlw", (e, result) => {
          // console.log(result);
          if (result.err) {
            reject(result.err);
            ipc.removeAllListeners("allScrPlw");
          } else {
            var s = {
              data: result.result.data,
              itemsCount: result.result.itemsCount[0].total
            };
            resolve(s);
            ipc.removeAllListeners("allScrPlw");
          }
        });
      });
    };
    let delPlwScr = item => {
      return new Promise((resolve, reject) => {
        ipc.send("deleteScrPlw", item.plw_scr_id);
        ipc.on("deleteScrPlw", (e, result) => {
          if (result.err) {
            reject(result.err);
            ipc.removeAllListeners("deleteScrPlw");
          } else {
            resolve(result.result);
            $("#jsGridScrPlwEdit")
              .jsGrid("render")
              .done(function () {
                // console.log("rendering completed and data loaded");
              });
            $('#scrPlwNewUpdForm').get(0).reset();
            $("#scrPlwNewUpdForm select").val('');
            ipc.removeAllListeners("deleteScrPlw");
          }
        });
      })
    }
    $('#jsGridScrPlwEdit').jsGrid({
      width: '100%',
      height: '300px',
      // editing: true,
      filtering: true,
      sorting: true,
      paging: true,
      autoload: true,
      pageLoading: true,
      // data: allData,
      controller: {
        loadData: (filter) => {
          return getPlwScr(filter);
        },
        deleteItem: (item) => {
          delPlwScr(item)
        }
      },
      fields: [{
          name: "report_month",
          title: "Report Month",
          type: "text",
          editing: false,
          width: 50
          // editing:false
        },
        {
          name: "province",
          title: "Province",
          type: "text",
          width: 80
        },
        {
          name: "district_name",
          title: "District",
          type: "text",
          width: 80
        },
        {
          name: "tehsil_name",
          title: "Tehsil",
          type: "text",
          width: 80
        },
        {
          name: "uc_name",
          title: "Uion Council",
          type: "text",
          width: 80
        },
        {
          name: "catchment_population",
          title: "Catchment Population",
          type: "text",
          editing: false,
          width: 80
        },
        {
          name: "staff_name",
          title: "Staff",
          type: "text",
          editing: false,
          width: 100
        },
        {
          name: "sup_name",
          title: "Supervisor",
          type: "text",
          editing: false,
          width: 100
        },
        {
          name: 'total_scr_pragnent',
          title: 'Total Pragnent',
          type: 'number',
          filtering: false
        }, {
          name: 'total_scr_lactating',
          title: 'Total Lactating',
          type: 'number',
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

        },
        {
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
        }, {
          type: "control",
          editButton: false,
          modeSwitchButton: false,
          width: 50
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
          var dataKeys = Object.keys(data);
          // console.log(dataKeys)
          dataKeys.forEach(el => {
            $(`input[name="${el}"]`).val(data[el]);
            $(`select[name="${el}"]`).val(data[el]);
            // console.log(data[el])
            // }
          })
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
          // $("#ddHealthHouse")
          //   .children("option:not(:first)")
          //   .remove();
          // $("#ddHealthHouse").append(
          //   `<option value="${data.site_id}" selected>${
          //   data.site_name
          //   }</option>`
          // );
          $("#ddStaff_code")
            .children("option:not(:first)")
            .remove();
          $("#ddStaff_code").append(
            `<option value="${data.staff_code}" selected>${
            data.staff_code
            }</option>`
          );
          $("#ddStaff_name")
            .children("option:not(:first)")
            .remove();
          $("#ddStaff_name").append(
            `<option value="${data.staff_name}" selected>${
            data.staff_name
            }</option>`
          );
          $("#ddSup_code")
            .children("option:not(:first)")
            .remove();
          $("#ddSup_code").append(
            `<option value="${data.sup_code}" selected>${
            data.sup_code
            }</option>`
          );
          $("#ddSup_name")
            .children("option:not(:first)")
            .remove();
          $("#ddSup_name").append(
            `<option value="${data.sup_name}" selected>${
            data.sup_name
            }</option>`
          );
        } else {
          alert('This could not be edited b/c its been more than 5 days since uploaded')

        }
        // $('#p_name').val(data.p_name);
        // $('#gender').val(data.gender);
        // $('#village').val(data.site_village);
        // $('#otp_id').val(data.otp_id);
        // console.log(args.item);
      }
    })
    // $(function () {
    //   $('#ddInterval').on('change', function () {
    //     var value = $(this).val();
    //     console.log(value);
    //     if (value == 1) {
    //       $('#start_date').attr('disabled', false);
    //       $('#end_date').attr('disabled', false);
    //     } else {
    //       $('#start_date').attr('disabled', true);
    //       $('#end_date').attr('disabled', true);
    //     }
    //   })
    // })

    // function scrChilrenData(qry) {
    //   return new Promise((resolve, reject) => {
    //     ipc.send('allScrPlwNew', (qry));
    //     ipc.on('allScrPlwNew', (e, result) => {
    //       var s = {
    //         data: result.result,
    //         itemsCount: result.result.length
    //       }
    //       if (result.err) {
    //         reject(result.err)
    //         ipc.removeAllListeners('allScrPlwNew')
    //       } else {
    //         resolve(s);
    //       }
    //     })
    //   })

    // };
    // var allData = scrChilrenData(prepareQry());
    // $('#showDataScrPlwNew').on('click', (e) => {
    //   console.log(prepareQry())

    // })
  })
  $('#submitScrPlwNewUpd').on('click', (e) => {
    // console.log(data);
    $('#scrPlwNewUpdForm').validate();
    totalCheck();
    if ($('#scrPlwNewUpdForm').valid() && $('.highlightInput').length == 0) {
      var scrPlwNewUpdData = $('#scrPlwNewUpdForm').serializeFormJSON();
      // console.log(scrPlwNewUpdData);
      ipc.send('scrPlwNewUpd', scrPlwNewUpdData);
      ipc.removeAllListeners('scrPlwNewUpd');
      $('#scrPlwNewUpdForm').get(0).reset();
      $('input[type="number"]').attr('min', 0);
      $("#scrPlwNewUpdForm select").val('');

      $('#jsGridScrPlwEdit').jsGrid("render").done(() => {
        // console.log('js grid rendered')
      })
    }
    e.preventDefault();
  })
  $('#ent_type').on('change', function () {
    if ($(this).val() == 'new') {
      $('.newscreen').attr('disabled', false)
      $('.rescreen').attr('disabled', true)
    } else {
      $('.newscreen').attr('disabled', true)
      $('.rescreen').attr('disabled', false)
    }
  })
  $('.rescreen').attr('disabled', true)

}