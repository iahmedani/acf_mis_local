module.exports.initScrChildrenUpd = function () {
  $(() => {
    $('input[type="number"]').attr('min', 0);
    // $('.secondSite').css('display', 'none')
  })
  $(function () {
    var datePickerId = document.getElementById('txtScrChildDate');
    datePickerId.max = new Date().toISOString().split("T")[0];
  });
  $( async function () {
    await setFormDefualts(false,'ddProvince','ddDistrict','ddTehsil')
    var defDist = JSON.parse(window.localStorage.getItem('defaults'))['defDist'];
    ipc.send('getAddSitesByDistrict', defDist['value']);
        ipc.on('getAddSitesByDistrict', (e, r) => {
          console.log({r})
          for (site of r.r) {
            $('#site_two').append(`<option value="${site.site_name}">${site.site_name}</option>`);
          }
        })
    // await appendItems('ddProvince','provinceList',false,'id','provinceName');
    // ipc.send('getProvince');
    // ipc.on('province', function (evt, province) {
    //   $('#ddProvince').children('option:not(:first)').remove();
    //   prov(province);
    // })
    $('#ddProvince').on('change', function () {
      var prov = $(this).val();
      ipc.send('getDistrict', prov)
      ipc.on('district', function (evt, district) {
        $('#ddDistrict').children('option:not(:first)').remove();
        dist(district);
      })
    })
    $('#ddDistrict').on('change', function () {
      var dist = $(this).val();
      ipc.send('getTehsil', dist)
      ipc.on('tehsil', function (evt, tehsil) {
        $('#ddTehsil').children('option:not(:first)').remove();
        teh(tehsil);
        $('#site_two').children('option:not(:first)').remove();
        ipc.send('getAddSitesByDistrict', dist);
        ipc.on('getAddSitesByDistrict', (e, r) => {
          console.log({r})
          for (site of r.r) {
            $('#site_two').append(`<option value="${site.site_name}">${site.site_name}</option>`);
          }
        })

        // knex('v_geo_active')
        // .columns('site_name')
        // .where({district_id: dist})
        // .then(result=>{
        //   // $('#other_site').children('option:not(:first)').remove();
        //   // console.log(result)
        //   var xlist = []
        //   for (__site of result){
        //     // console.log(__site)
        //     // $('#other_site').append(`<option value="${__site.site_name}" data-subtext="${__site.site_name}">UC:${__site.uc_name}, Site:${__site.site_name}</option>`); 
        //     xlist.push(__site.site_name)
        //     // $('#other_site').append(`<option `)
        //   }
        //   $('#other_site').select2({
        //     data:xlist
        //   });
        //   })
        //   .catch(e=>{
        //     console.log(e)
        //   })
      })
    })
    $('#ddTehsil').on('change', function () {
      var tehs = $(this).val();
      ipc.send('getUC', tehs)
      ipc.on('uc', function (evt, uc) {
        $('#ddUC').children('option:not(:first)').remove();

        ucListener(uc);
      })
    })
    var ucForHH;
    $('#ddUC').on('change', function () {
      var ucs = $(this).val();
      ucForHH = ucs
      ipc.send('getHealthHouse', ucs)
      ipc.on('hh', async function (evt, hh) {
        // console.log(hh)
        $('#site_one').children('option:not(:first)').remove();
        // if (hh.hh.length > 1) {
        //   $('.secondSite').css('display', '')
        //   $('#site_two').children('option:not(:first)').remove();
        //   await asyncForEach(hh.hh, async (el) => {
        //     $('#site_two').append(`<option value="${el.siteName}">${el.siteName}</option>`);
        //   })
        // } else {
        //   $('.secondSite').css('display', 'none')

        // }
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
    // $("#ddHealthHouse").on("change", function() {
    //   var siteId = $(this).val();
    //   // ucForHH = ucs;

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
    $('.sum_normal_boys').on('change', function () {
      var sum =
        (($("#normal_boys_623").val()) ? parseInt($("#normal_boys_623").val()) : 0) +
        (($("#normal_boys_2459").val()) ? parseInt($("#normal_boys_2459").val()) : 0);
      $("#total_normal_boys").empty();
      $("#total_normal_boys").val(sum);
    });
    $(".sum_normal_girls").on("change", function () {
      var sum = (($("#normal_girls_623").val()) ? parseInt($("#normal_girls_623").val()) : 0) +
        (($("#normal_girls_2459").val()) ? parseInt($("#normal_girls_2459").val()) : 0);
      $("#total_normal_girls").empty();
      $("#total_normal_girls").val(sum);
    });
    $('.mam_boys').on('change', function () {
      var sum =
        (($("#mam_boys_623").val()) ? parseInt($("#mam_boys_623").val()) : 0) +
        (($("#mam_boys_2459").val()) ? parseInt($("#mam_boys_2459").val()) : 0);
      $("#total_mam_boys").empty();
      $("#total_mam_boys").val(sum);
    });
    $(".mam_girls").on("change", function () {
      var sum = (($("#mam_girls_623").val()) ? parseInt($("#mam_girls_623").val()) : 0) +
        (($("#mam_girls_2459").val()) ? parseInt($("#mam_girls_2459").val()) : 0);
      $("#total_mam_girls").empty();
      $("#total_mam_girls").val(sum);
    });
    $('.sam_boys').on('change', function () {
      var sum =
        (($("#sam_without_comp_boys_623").val()) ? parseInt($("#sam_without_comp_boys_623").val()) : 0) +
        (($("#sam_without_comp_boys_2459").val()) ? parseInt($("#sam_without_comp_boys_2459").val()) : 0);
      $("#total_sam_boys").empty();
      $("#total_sam_boys").val(sum);
    });
    $(".sam_girls").on("change", function () {
      var sum = (($("#sam_without_comp_girls_623").val()) ? parseInt($("#sam_without_comp_girls_623").val()) : 0) +
        (($("#sam_without_comp_girls_2459").val()) ? parseInt($("#sam_without_comp_girls_2459").val()) : 0);
      $("#total_sam_girls").empty();
      $("#total_sam_girls").val(sum);
    });
    $('.comp_boys').on('change', function () {
      var sum =
        (($("#sam_with_comp_boys_623").val()) ? parseInt($("#sam_with_comp_boys_623").val()) : 0) +
        (($("#sam_with_comp_boys_2459").val()) ? parseInt($("#sam_with_comp_boys_2459").val()) : 0);
      $("#total_comp_boys").empty();
      $("#total_comp_boys").val(sum);
    });
    $(".comp_girls").on("change", function () {
      var sum = (($("#sam_with_comp_girls_623").val()) ? parseInt($("#sam_with_comp_girls_623").val()) : 0) +
        (($("#sam_with_comp_girls_2459").val()) ? parseInt($("#sam_with_comp_girls_2459").val()) : 0);
      $("#total_comp_girls").empty();
      $("#total_comp_girls").val(sum);
    });
  })
  $(() => {
    // function prepareQry() {
    //   var qry = {};
    //   ($('#ddProvince').val()) ? qry.province_id = $('#ddProvince').val() : '';
    //   ($('#ddDistrict').val()) ? qry.district_id = $('#ddDistrict').val() : '';
    //   ($('#ddTehsil').val()) ? qry.tehsil_id = $('#ddTehsil').val() : '';
    //   ($('#ddUC').val()) ? qry.uc_id = $('#ddUC').val() : '';
    //   ($('#ddInterval').val() == 1) ? qry.date = {
    //     x: 'screening_date',
    //     y: [$('#start_date').val(), $('#end_date').val()]
    //   } : '';
    //   console.log(qry);
    //   return qry;
    // }

    let getChScr = filter => {
      return new Promise((resolve, reject) => {
        ipc.send("allScrChildren", filter);
        ipc.on("allScrChildren", (e, result) => {
          console.log(result);
          if (result.err) {
            reject(result.err);
            ipc.removeAllListeners("allScrChildren");
          } else {
            var s = {
              data: result.result.data,
              itemsCount: result.result.itemsCount[0].total
            };
            // console.log(s);
            resolve(s);
            ipc.removeAllListeners("allScrChildren");
          }
        });
      });
    };
    let delChScr = item => {
      return new Promise((resolve, reject) => {
        ipc.send("deleteScrChildren", item.ch_scr_id);
        ipc.on("deleteScrChildren", (e, result) => {
          if (result.err) {
            reject(result.err);
            ipc.removeAllListeners("deleteScrChildren");
          } else {
            resolve(result.result);
            $("#jsGridScrChEdit")
              .jsGrid("render")
              .done(function () {
                // console.log("rendering completed and data loaded");
              });
            $("#scrChildrenUpdForm")
              .get(0)
              .reset();
            $("#scrChildrenUpdForm select").val("");
            ipc.removeAllListeners("deleteScrChildren");
          }
        });
      });
    }
    // var MyDateField = function (config) {
    //   jsGrid.Field.call(this, config);
    // };

    // MyDateField.prototype = new jsGrid.Field({

    //   css: "date-field",            // redefine general property 'css'
    //   align: "center",              // redefine general property 'align'


    //   sorter: function (date1, date2) {
    //     return new Date(date1) - new Date(date2);
    //   },

    //   itemTemplate: function (value) {
    //     return new Date(value).toDateString();
    //   },

    //   insertTemplate: function (value) {
    //     return this._insertPicker = $("<input>").datepicker({ defaultDate: new Date() });
    //   },

    //   editTemplate: function (value) {
    //     return this._editPicker = $("<input>").datepicker().datepicker("setDate", new Date(value));
    //   },

    //   insertValue: function () {
    //     return this._insertPicker.datepicker("getDate").toISOString();
    //   },

    //   editValue: function () {
    //     return this._editPicker.datepicker("getDate").toISOString();
    //   }
    // });
    // jsGrid.fields.date = MyDateField;
    $("#jsGridScrChEdit").jsGrid({
      width: "100%",
      height: "300px",
      filtering: true,
      // editing: true,
      sorting: true,
      paging: true,
      autoload: true,
      pageLoading: true,
      // data: allData,
      controller: {
        loadData: filter => {
          return getChScr(filter);
        },
        deleteItem: function (item) {
          return delChScr(item);
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
          width: 50
        },
        {
          name: "district_name",
          title: "District",
          type: "text",
          width: 50
        },
        {
          name: "tehsil_name",
          title: "Tehsil",
          type: "text",
          width: 50
        },
        {
          name: "uc_name",
          title: "Uion Council",
          type: "text",
          width: 50
        },
        {
          name: "catchment_population",
          title: "Catchment Population",
          type: "text",
          editing: false,
          width: 50
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
          name: "total_scr_girls",
          title: "Total Girls",
          type: "number",
          filtering: false,
          width: 50
        },
        {
          name: "total_scr_boys",
          title: "Total Boys",
          type: "number",
          filtering: false,
          width: 50
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
          width: 50
        },
        {
          width: 80,
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
          modeSwitchButton: false,
          width: 50
        }
      ],
      //   onItemEditing: function(args) {
      //     var date1 = new Date(args.item.upload_date);
      //           var date2 = new Date();
      //           var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      //           var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      //     // cancel editing of the row of item with field 'ID' = 0
      //     if(diffDays > 0) {
      //         args.cancel = true;
      //     }
      // },
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
          // console.log(dataKeys);
          dataKeys.forEach(el => {
            $(`input[name="${el}"]`).val(data[el]);
            $(`select[name="${el}"]`).val(data[el]);
            // console.log(data[el])
            // }
          });
          $("#ddProvince").val(data.province_id);

          $("#ddDistrict")
            .children("option:not(:first)")
            .remove();
          $("#ddDistrict").append(
            `<option value="${data.district_id}" selected>${
            data.district_name
            }</option>`
          );

          $('#site_two').children('option:not(:first)').remove();
          ipc.send('getAddSitesByDistrict', data.district_id);
          ipc.on('getAddSitesByDistrict', (e, r) => {

            for (site of r.r) {
              $('#site_two').append(`<option value="${site.site_name}">${site.site_name}</option>`);
            }
          })
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

          $("#ddUC").val(data.uc_id);
          $("#site_one")
            .children("option:not(:first)")
            .remove();
          $("#site_one").append(
            `<option value="${data.site_one}" selected>${
            data.site_one
            }</option>`
          );
          console.log(data.site_two)
          if (data.site_two) {
            // $('.secondSite').css('display', '')
            // $("#site_two")
            //   .children("option:not(:first)")
            //   .remove();
            // $("#site_two").append(
            //   `<option value="${data.site_two}" selected>${
            //   data.site_two
            //   }</option>`
            // );

            console.log(data.site_two)
            $(`#site_two option[value="${data.site_two}"]`).attr("selected", true);

          } else {
            // $('.secondSite').css('display', 'none')

          }
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
          $("#site_two")
            .children("option:not(:first)")
            .remove();
          $("#site_two").append(
            `<option value="${data.site_two}" selected>${
            data.site_two
            }</option>`
          );
          $("#site_one")
            .children("option:not(:first)")
            .remove();
          $("#site_one").append(
            `<option value="${data.site_one}" selected>${
            data.site_one
            }</option>`
          );

          var normal_boys = data.normal_boys_623 + data.normal_boys_2459;
          var normal_girls = data.normal_girls_623 + data.normal_girls_2459;
          var mam_boys = data.mam_boys_623 + data.mam_boys_2459;
          var mam_girls = data.mam_girls_623 + data.mam_girls_2459;
          var sam_comp_boys =
            data.sam_with_comp_boys_623 + data.sam_with_comp_boys_2459;
          var sam_comp_girls =
            data.sam_with_comp_girls_623 + data.sam_with_comp_girls_2459;
          var sam_boys =
            data.sam_without_comp_boys_623 + data.sam_without_comp_boys_2459;
          var sam_girls =
            data.sam_without_comp_girls_623 +
            data.sam_without_comp_girls_2459;
          $("#total_normal_boys").empty();
          $("#total_normal_boys").val(normal_boys);
          $("#total_normal_girls").empty();
          $("#total_normal_girls").val(normal_girls);
          $("#total_mam_boys").empty();
          $("#total_mam_boys").val(mam_boys);
          $("#total_mam_girls").empty();
          $("#total_mam_girls").val(mam_girls);
          $("#total_sam_boys").empty();
          $("#total_sam_boys").val(sam_boys);
          $("#total_sam_girls").empty();
          $("#total_sam_girls").val(sam_girls);
          $("#total_comp_boys").empty();
          $("#total_comp_boys").val(sam_comp_boys);
          $("#total_comp_girls").empty();
          $("#total_comp_girls").val(sam_comp_girls);

          // $('#p_name').val(data.p_name);
          // $('#gender').val(data.gender);
          // $('#village').val(data.site_village);
          // $('#otp_id').val(data.otp_id);
          // console.log(args.item);
        } else {
          alert('This could not be edited b/c its been more than 5 days since uploaded')
        }
      }
    });
    $(function () {
      $('#ddInterval').on('change', function () {
        var value = $(this).val();
        // console.log(value);
        if (value == 1) {
          $('#start_date').attr('disabled', false);
          $('#end_date').attr('disabled', false);
        } else {
          $('#start_date').attr('disabled', true);
          $('#end_date').attr('disabled', true);
        }
      })
    })

    function scrChilrenData(qry) {
      return new Promise((resolve, reject) => {
        ipc.send('allScrChildren', (qry));
        ipc.on('allScrChildren', (e, result) => {
          var s = {
            data: result.result,
            itemsCount: result.result.length
          }
          if (result.err) {
            reject(result.err)
            ipc.removeAllListeners('allScrChildren')
          } else {
            resolve(s);
            ipc.removeAllListeners('allScrChildren')
          }
        })
      })

    };
    // var allData = scrChilrenData(prepareQry());
    $('#showDataScrChildren').on('click', (e) => {
      // console.log(prepareQry())

    })
  })
  $('#submitScrChildUpdForm').on('click', (e) => {
    // console.log(data);
    totalCheck();
    samTotalCheck();
    $('#scrChildrenUpdForm').validate();
    if ($('#scrChildrenUpdForm').valid() && $('.highlightInput').length == 0) {
      var scrChildrenUpdData = $('#scrChildrenUpdForm').serializeFormJSON();
      var appConfig = JSON.parse(window.sessionStorage.getItem('config'));
      scrChildrenUpdData.org_name = appConfig.org_name;
      scrChildrenUpdData.reffer_otp_boys = parseInt(scrChildrenUpdData.reffer_otp_boys_s1) + ((parseInt(scrChildrenUpdData.reffer_otp_boys_s2)) ? parseInt(scrChildrenUpdData.reffer_otp_boys_s2) : 0);
      scrChildrenUpdData.reffer_otp_girls = parseInt(scrChildrenUpdData.reffer_otp_girls_s1) + ((parseInt(scrChildrenUpdData.reffer_otp_girls_s2)) ? parseInt(scrChildrenUpdData.reffer_otp_girls_s2) : 0);
      scrChildrenUpdData.reffer_tsfp_boys = parseInt(scrChildrenUpdData.reffer_tsfp_boys_s1) + ((parseInt(scrChildrenUpdData.reffer_tsfp_boys_s2)) ? parseInt(scrChildrenUpdData.reffer_tsfp_boys_s2) : 0);
      scrChildrenUpdData.reffer_tsfp_girls = parseInt(scrChildrenUpdData.reffer_tsfp_girls_s1) + ((parseInt(scrChildrenUpdData.reffer_tsfp_girls_s2)) ? parseInt(scrChildrenUpdData.reffer_tsfp_girls_s2) : 0);
      scrChildrenUpdData.sup_name = $("#ddSup_name option:selected").text();
      scrChildrenUpdData.staff_name = $("#ddStaff_name option:selected").text();
      // console.log(scrChildrenUpdData);
      ipc.send('scrChildrenUpd', scrChildrenUpdData);
      ipc.removeAllListeners('scrChildrenUpd');
      $('#scrChildrenUpdForm').get(0).reset();
      $("#scrChildrenUpdForm select").val('');
      $('input[type="number"]').attr('min', 0);
      $('#jsGridScrChEdit').jsGrid("render").done(() => {
        // console.log('js grid rendered')
      })
    }
    e.preventDefault();
  })
  // $('.tbb').on('change', function () {
  //   var total = 0;
  //   $('.tbb').each(function (i, el) {
  //     total = total + (($(el).val()) ? parseInt($(el).val()) : 0);
  //   })
  //   $("#total_scr_boys").empty();
  //   $("#total_scr_boys").val(total);
  // })
  // $(".tgg").on("change", function () {
  //   var total = 0;
  //   $(".tgg").each(function (i, el) {
  //     total = total + ($(el).val() ? parseInt($(el).val()) : 0);
  //   });
  //   $("#total_scr_girls").empty();
  //   $("#total_scr_girls").val(total);
  // });

  $('.tnew').on('change', function () {
    var total = 0;
    $('.tnew').each(function (i, el) {
      total = total + ($(el).val() ? parseInt($(el).val()) : 0);
    })
    $("#total_scr_boys").empty();
    $("#total_scr_boys").val(total);
  })
  $('.tgnew').on('change', function () {
    var total = 0;
    $('.tgnew').each(function (i, el) {
      total = total + ($(el).val() ? parseInt($(el).val()) : 0);
    })
    $("#total_scr_girls").empty();
    $("#total_scr_girls").val(total);
  })

  // let totalCheck = () => {
  //   var totalScrB = parseInt($("#total_scr_boys").val());
  //   var x = 0;
  //   $(".tchkb").each(function (i, el) {
  //     x = x + ($(el).val() ? parseInt($(el).val()) : 0);
  //     if ($(".tchkb").length - 1 == i) {
  //       if (x != totalScrB) {
  //         $(".tchkb").addClass("highlightInput");
  //         // alert('Value not allowed')
  //       } else {
  //         $(".tchkb").removeClass("highlightInput");
  //       }
  //     }
  //   });
  //   var totalScrG = parseInt($("#total_scr_girls").val());
  //   var y = 0;
  //   $(".tchkg").each(function (i, el) {
  //     y = y + ($(el).val() ? parseInt($(el).val()) : 0);
  //     if ($(".tchkg").length - 1 == i) {
  //       if (y != totalScrG) {
  //         $(".tchkg").addClass('highlightInput');
  //         // alert('Value not allowed')
  //       } else {
  //         $(".tchkg").removeClass('highlightInput');
  //       }
  //     }
  //   });

  // }

  let totalCheck = () => {
    var totalScrB = parseInt($("#total_scr_boys").val());
    var x = 0;
    $(".tchkb").each(function (i, el) {
      x = x + ($(el).val() ? parseInt($(el).val()) : 0);
      if ($(".tchkb").length - 1 == i) {
        if (x != totalScrB) {
          $(".tchkb").addClass("highlightInput");
          // alert('Value not allowed')
        } else {
          $(".tchkb").removeClass("highlightInput");
        }
      }
    });
    var totalScrG = parseInt($("#total_scr_girls").val());
    var y = 0;
    $(".tchkg").each(function (i, el) {
      y = y + ($(el).val() ? parseInt($(el).val()) : 0);
      if ($(".tchkg").length - 1 == i) {
        if (y != totalScrG) {
          $(".tchkg").addClass('highlightInput');
          // alert('Value not allowed')
        } else {
          $(".tchkg").removeClass('highlightInput');
        }
      }
    });

  }

  let samTotalCheck = () => {
    var samTotalB = parseInt($('#total_sam_boys').val()) + parseInt($('#plus12_oedema_boys').val()) + parseInt($('#plus3_oedema_boys').val()) + parseInt($('#total_comp_boys').val())
    var samTotalG = parseInt($('#total_sam_girls').val()) + parseInt($('#plus12_oedema_girls').val()) + parseInt($('#plus3_oedema_girls').val()) + parseInt($('#total_comp_girls').val())
    var mamTotalB = parseInt($('#total_mam_boys').val())
    var mamTotalG = parseInt($('#total_mam_girls').val())

    var s_sam_g = 0
    $('.s_sam_g').each(function (i, el) {
      s_sam_g = s_sam_g + ($(el).val() ? parseInt($(el).val()) : 0);
      if ($(".s_sam_g").length - 1 == i) {
        if (s_sam_g != samTotalG) {
          $(".s_sam_g").addClass('highlightInput');
          // $("#plus12_oedema_girls").addClass('highlightInput');
          // $("#plus3_oedema_girls").addClass('highlightInput');
          // alert('Value not allowed')
        } else {
          $(".s_sam_g").removeClass('highlightInput');
          // $("#plus12_oedema_girls").removeClass('highlightInput');
          // $("#plus3_oedema_girls").removeClass('highlightInput');
        }
      }
    })

    var s_sam_b = 0
    $('.s_sam_b').each(function (i, el) {
      s_sam_b = s_sam_b + ($(el).val() ? parseInt($(el).val()) : 0);
      if ($(".s_sam_b").length - 1 == i) {
        if (s_sam_b != samTotalB) {
          $(".s_sam_b").addClass('highlightInput');
          // $("#plus12_oedema_boys").addClass('highlightInput');
          // $("#plus3_oedema_boys").addClass('highlightInput');
          // alert('Value not allowed')
        } else {
          $(".s_sam_b").removeClass('highlightInput');
          // ("#plus12_oedema_boys").addClass('highlightInput');
          // $("#plus3_oedema_boys").addClass('highlightInput');
        }
      }
    })
    // var s_mam_g = 0
    // $('.s_mam_g').each(function (i, el) {
    //   s_mam_g = s_mam_g + ($(el).val() ? parseInt($(el).val()) : 0);
    //   if ($(".s_mam_g").length - 1 == i) {
    //     if (s_mam_g != mamTotalG) {
    //       $(".s_mam_g").addClass('highlightInput');
    //       // alert('Value not allowed')
    //     } else {
    //       $(".s_mam_g").removeClass('highlightInput');
    //     }
    //   }
    // })

    // var s_mam_b = 0
    // $('.s_mam_b').each(function (i, el) {
    //   s_mam_b = s_mam_b + ($(el).val() ? parseInt($(el).val()) : 0);
    //   if ($(".s_mam_b").length - 1 == i) {
    //     if (s_mam_b != mamTotalB) {
    //       $(".s_mam_b").addClass('highlightInput');
    //       // alert('Value not allowed')
    //     } else {
    //       $(".s_mam_b").removeClass('highlightInput');
    //     }
    //   }
    // })



  }

  $('#site_one').on('change', function () {
    var that = $(this)
    $('#site_two option').each(function () {
      if ($(this).val() == that.val()) {
        $(this).prop('disabled', true)
      } else {
        $(this).prop('disabled', false)

      }
    })
  })
  // $('#ent_type').on('change', function () {
  //   if ($(this).val() == 'new') {
  //     $('.newscreen').attr('disabled', false)
  //     $('.rescreen').attr('disabled', true)
  //   } else {
  //     $('.newscreen').attr('disabled', true)
  //     $('.rescreen').attr('disabled', false)
  //   }
  // })
  // $('.rescreen').attr('disabled', true)

  var $table = $('#tablePreview');
  $table.floatThead({
    position: 'absolute',
    scrollContainer: true,
    responsiveContainer: function ($table) {
      return $table.closest('.table-responsive');
    }
  });

  $('#site_two').select2({
    minimumInputLength: 3 // only start searching when the user has input 3 or more characters
  });

  let _sumVals = function(el1, el2, tel1, tel2) {
    var _el1 = $('.'+el1);
    var _el2 = $('.'+el2);
    var _tel1 = $('#'+tel1);
    var _tel2 = $('#'+tel2);

    var t1 = 0;
    var t2 = 0;
    _el1.each(function(i, el){     
      t1 = t1 + parseInt($(this).val());
      if(_el1.length == i+1){
        _tel1.val(t1);
      }
    })
    _el2.each(function(i, el){    
      t2 = t2 + parseInt($(this).val());

      if(_el2.length == i+1){
        _tel2.val(t2);
      }
    })
    
    

  }
  
  var tscr = $('.tscr');
  var ent_type = $('#ent_type');
  var odema12 = $('.odema12');
  var odema3 = $('.odema3');
  var otp1 = $('.otp1');
  var otp2 = $('.otp2');
  var tsfp1 = $('.tsfp1');
  var tsfp2 = $('.tsfp2');
  var mnpnew = $('.mnpnew');
  var mnp = $('.mnp');
  var mnpexit = $('.mnpexit');
  var deworm = $('.deworm');
  var other = $('.other');
  
  // Total screening auto calculation
  tscr.on('change', function(){
    _entType = ent_type.val();
    _sumVals('_tb', '_tg', 'total_scr_boys', 'total_scr_girls');
    if(_entType == 'rescreen'){
      $('#reScreened_boys').val($('#total_scr_boys').val());
      $('#reScreened_girls').val($('#total_scr_girls').val());
      $('#new_boys').val(0);
      $('#new_girls').val(0);
    }else if(_entType == 'new'){
      $('#reScreened_boys').val(0);
      $('#reScreened_girls').val(0);
      $('#new_boys').val($('#total_scr_boys').val());
      $('#new_girls').val($('#total_scr_girls').val());
    }
  })
  // Entry values corrention
  ent_type.on('change', function(){
    _entType = $(this).val();
    if(_entType == 'rescreen'){
      $('#reScreened_boys').val($('#total_scr_boys').val());
      $('#reScreened_girls').val($('#total_scr_girls').val());
      $('#new_boys').val(0);
      $('#new_girls').val(0);
    }else if(_entType == 'new'){
      $('#reScreened_boys').val(0);
      $('#reScreened_girls').val(0);
      $('#new_boys').val($('#total_scr_boys').val());
      $('#new_girls').val($('#total_scr_girls').val());
    }
  })
// Odema plus12
  odema12.on('change', function(){
    _sumVals('_odb12', '_odg12', 'plus12_oedema_boys', 'plus12_oedema_girls')
  })
  // Odema plus3
  odema3.on('change', function(){
    _sumVals('_odb3', '_odg3', 'plus3_oedema_boys', 'plus3_oedema_girls')
  })

  // otp1 ref
  otp1.on('change', function(){
    _sumVals('otp1b', 'otp1g', 'reffer_otp_boys_s1', 'reffer_otp_girls_s1')
  })
  // otp1 ref
  otp2.on('change', function(){
    _sumVals('otp2b', 'otp2g', 'reffer_otp_boys_s2', 'reffer_otp_girls_s2')
  })
  // tsfp1 ref
  tsfp1.on('change', function(){
    _sumVals('tsfp1b', 'tsfp1g', 'reffer_tsfp_boys_s1', 'reffer_tsfp_girls_s1')
  })
  // tsfp2 ref
  tsfp2.on('change', function(){
    _sumVals('tsfp2b', 'tsfp2g', 'reffer_tsfp_boys_s2', 'reffer_tsfp_girls_s2')
  })
  // mnp new
  mnpnew.on('change', function(){
    _sumVals('mnpnewb', 'mnpnewg', 'mnp_boys', 'mnp_girls')
  })
  // mnp followup
  mnp.on('change', function(){
    _sumVals('mnpb', 'mnpg', 'followup_boys', 'followup_girls')
    $('#total_followup').val( (parseInt($('#followup_boys').val()) + parseInt($('#followup_girls').val())))
  })
  // mnp exits
  mnpexit.on('change', function(){
    _sumVals('mnpexitb', 'mnpexitg', 'exits_boys', 'exits_girls')
    $('#total_exits').val( (parseInt($('#exits_boys').val()) + parseInt($('#exits_girls').val())))
  })
  // Deworming
  deworm.on('change', function(){
    _sumVals('dewormb', 'dewormg', 'deworming_boys', 'deworming_girls')
  })
  // Deworming
  other.on('change', function(){
    _sumVals('otherb', 'otherg', 'other_boys', 'other_girls')
  })
  

}