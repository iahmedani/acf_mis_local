var knex = require('../../mainfunc/db')
module.exports.stockDistUpd = function () {
  // $(function () {
  //   var datePickerId = document.getElementById('txtScrChildDate');
  //   datePickerId.max = new Date().toISOString().split("T")[0];
  // });

  $('#ddProgramType').change(() => {
    $('.prgChange').val("")
  })
  let loadData = (data) => {
    return new Promise((resolve, reject) => {
      ipc.send('getAllStockDist', data);
      ipc.on('getAllStockDist', (e, result) => {
        console.log(result);
        if (result.result.data.length < 1) {
          var s = {
            data: [],
            itemsCount: 0
          };
          resolve(s)
        } else {

          if (result.err) {
            reject(result.err)
            ipc.removeAllListeners('getAllStockDist')
          } else {
            var s = {
              data: result.result.data,
              itemsCount: result.result.itemsCount[0].total
            };
            resolve(s)
            ipc.removeAllListeners('getAllStockDist')
          }
        }
      })
    })
  }

  let deleteData = (item) => {
    return new Promise((resolve, reject) => {
      ipc.send("deleteStockDist", item);
      ipc.on('deleteStockDist', (e, result) => {
        console.log(result)
        if (result.err) {
          reject()
          ipc.removeAllListeners("deleteStockDist");
        } else {
          resolve()
          ipc.removeAllListeners("deleteStockDist");
        }
      })
    })
  }
  $('.myFilter').on('change', function () {
    console.log($(this).val())
    var x = {};
    x.program_type = $("#ddProgramType").val() ? $("#ddProgramType").val() : "";
    x.district_id = ($("#ddDistrict").val()) ? $("#ddDistrict").val() : '';
    x.tehsil_id = ($("#ddTehsil").val()) ? $("#ddTehsil").val() : '';
    x.uc_id = ($("#ddUC").val()) ? $("#ddUC").val() : '';
    x.site_id = ($("#ddHealthHouse").val() && $("#ddProgramType").val() != 'otp') ? $("#ddHealthHouse").val() : '';
    x.dist_month = ($("#distMonth").val()) ? $("#distMonth").val() : '';
    x.CHW_id = ($("#ddStaff_code").val()) ? $("#ddStaff_code").val() : '';
    x.CHS_id = ($("#ddSup_code").val()) ? $("#ddSup_code").val() : '';
    // x.dist_month = 

    $("#stockDistListGrid")
      .jsGrid("loadData", x)
      .done(function () {
        console.log("data loaded");
      });
  })
  // var programItems = 
  $("#stockDistListGrid").jsGrid({
    height: "250px",
    width: "100%",
    // filtering: true,
    // inserting: true,
    // editing: true,
    sorting: true,
    // deleting: true,
    paging: true,
    autoload: true,
    pageLoading: true, // this is the clue
    pageSize: 10,
    pageButtonCount: 5,
    deleteConfirm: "Do you really want to delete Session?",
    controller: {
      loadData: function (filter) {
        filter.program_type = $("#ddProgramType").val() ?
          $("#ddProgramType").val() :
          "";
        filter.district_id = $("#ddDistrict").val() ?
          $("#ddDistrict").val() :
          "";
        filter.tehsil_id = $("#ddTehsil").val() ? $("#ddTehsil").val() : "";
        filter.site_id = ($("#ddHealthHouse").val() && $("#ddProgramType").val() != 'otp') ? $("#ddHealthHouse").val() : '';
        filter.dist_month = $("#distMonth").val() ?
          $("#distMonth").val() :
          "";
        filter.CHW_id = $("#ddStaff_code").val() ?
          $("#ddStaff_code").val() :
          "";
        filter.CHS_id = $("#ddSup_code").val() ? $("#ddSup_code").val() : "";
        return loadData(filter);
      },
      deleteItem: function (item) {
        console.log(item);
        return deleteData(item);
      }
    },
    fields: [{
        name: "program_type",
        type: "select",
        items: [{
            value: '',
            Name: ''
          },
          {
            value: "sfp",
            Name: 'TSFP'
          },
          {
            value: "sfp_Plw",
            Name: 'TSFP-PLW'
          },
          {
            value: "otp",
            Name: 'OTP'
          },
          {
            value: "sc",
            Name: 'NSC'
          },
          {
            value: "outreach",
            Name: 'Out Reach'
          }
        ],
        title: "Program Type",
        // valueType: "string",
        valueField: "value",
        textField: "Name"
      },
      {
        name: "stockDistId",
        title: "Report ID",
        filtering: false,
        type: "text"
        // validate: "required"
      },
      {
        name: "dist_month",
        title: "Report Month",
        type: "text",
        filtering: false
      },
      {
        name: "total_distribution",
        title: "Total Distribution",
        type: "decimal",
        filtering: false
      },

      {
        name: "upload_status",
        title: "Upload Status",
        type: "select",
        valueType: "number",
        items: [{
            Name: "",
            value: ""
          },
          {
            Name: "Uploaded",
            value: 1
          },
          {
            Name: "Not Uploaded",
            value: 0
          },
          {
            Name: "Edited",
            value: 2
          }
        ],
        readOnly: true,
        valueField: "value",
        textField: "Name",
        editing: false,
        inserting: false,
        filtering: false
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
          diffDays = (item.upload_status == 1 && item.upload_date != null) ? diffDays : 0;
          // alert(diffDays);
          return diffDays;
        }
      },
      {
        type: "control",
        modeSwitchButton: true,
        editButton: false
        // deleteButton: false,
      }
    ],
    rowClick: function (args) {
      var date1 = new Date(args.item.upload_date);
      var date2 = new Date();
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      diffDays = (args.item.upload_status == 1 && args.item.upload_date != null) ? diffDays : 0;
      if (diffDays < 10000) {

        var getData = args.item;
        $("#updateStockDistModalId").modal("show");
        // var prog_type = $("#ddProgramType").val();
        if (getData.program_type == "outreach") {
          $(".outreach-upd").show();
          $(".outreach-upd input").attr("required", true);
          $(".nsc-upd").show();
          $('.noOutreach-upd').hide();
          $(".nsc-upd input").attr("required", true);
        } else if (getData.program_type == "sc") {
          $(".nsc-upd").hide();
          $(".nsc-upd input").attr("required", false);
          $(".outreach-upd").hide();
          $(".outreach-upd input").attr("required", false);
        } else {
          $(".outreach-upd").hide();
          $(".nsc-upd").show();
          $(".nsc-upd input").attr("required", true);
          $(".outreach-upd input").attr("required", false);
        }
        updateGrid(getData.stockDistId, getData.program_type);
      } else {
        alert('This could not be edited b/c its been more than 5 days since uploaded')
      }
    }
  });



  // Geo Refference for filter
  // Geo Refference for filter
  $(async function () {

    await setFormDefualts('ddProgramType','ddProvince','ddDistrict','ddTehsil')
    var defProg = JSON.parse(window.localStorage.getItem('defaults'))['defProg']
    // await appendItems('ddProvince','provinceList',false,'id','provinceName');
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse' ,defProg)
    
    $('#ddTehsil').on('change', async function () {
      var tehs = $(this).val();
      ipc.send('getUC', tehs)
      ipc.on('uc', function (evt, uc) {
        $('#ddUC').children('option:not(:first)').remove();
        ucListener(uc);
      })
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
    })
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
    $('#ddUC').on('change', function () {
      var ucs = $(this).val();
      ucForHH = ucs
      if ($('#ddProgramType').val() == 'otp') {

        ipc.send('getHealthHouse', ucs)
        ipc.on('hh', function (evt, hh) {
          $('#ddHealthHouse').children('option:not(:first)').remove();
          hhListener(hh);
        })
      }
    })
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
  })
 // Geo Refference for Updte
  $(function () {
    ipc.send("getProvince");
    ipc.on("province", function (evt, province) {
      $("#ddProvince-upd")
        .children("option:not(:first)")
        .remove();
      provUpd(province);
    });
    $("#ddProvince-upd").on("change", function () {
      var prov = $(this).val();
      ipc.send("getDistrict", prov);
      ipc.on("district", function (evt, district) {
        $("#ddDistrict-upd")
          .children("option:not(:first)")
          .remove();
        distUpd(district);
      });
    });
    $("#ddDistrict-upd").on("change", function () {
      var dist = $(this).val();
      ipc.send("getTehsil", dist);
      ipc.on("tehsil", function (evt, tehsil) {
        $("#ddTehsil-upd")
          .children("option:not(:first)")
          .remove();

        tehUpd(tehsil);
      });
    });
    $("#ddTehsil-upd").on("change", function () {
      var tehs = $(this).val();
      ipc.send("getUC", tehs);
      ipc.on("uc", function (evt, uc) {
        $("#ddUC-upd")
          .children("option:not(:first)")
          .remove();
        ucListenerUpd(uc);
      });
    });
    var ucForHH;
    $('#ddUC-upd').on('change', function () {
      var ucs = $(this).val();
      ucForHH = ucs
      ipc.send("getStaffuc", ucs);
      ipc.send("getSupsuc", ucs);

      ipc.on("haveStaffuc", function (evt, staffs) {
        $("#ddStaff_code-upd")
          .children("option:not(:first)")
          .remove();
        staffListeneruc(staffs);
      });
      ipc.on("haveSupsuc", function (evt, _sups) {
        $("#ddSup_code-upd")
          .children("option:not(:first)")
          .remove();
        supListeneruc(_sups);
      });
    })
    $("#ddUC-upd").on("change", function () {
      var ucs = $(this).val();
      ucForHH = ucs;
      if ($('#ddProgramType').val() == 'otp') {

        ipc.send("getHealthHouse", ucs);
        ipc.on("hh", function (evt, hh) {
          $("#ddHealthHouse-upd")
            .children("option:not(:first)")
            .remove();
          hhListenerUpd(hh);
        });
      }
    });
    $("#ddHealthHouse-upd").on("change", function () {
      var siteId = $(this).val();
      // ucForHH = ucs;
      ipc.send("getStaff", siteId);
      ipc.send("getSups", siteId);
      console.log(siteId)

      ipc.on("haveStaff", function (evt, staffs) {
        $("#ddStaff_code-upd")
          .children("option:not(:first)")
          .remove();
        console.log(staffs)
        staffListenerUpd(staffs);
      });
      ipc.on("haveSups", function (evt, _sups) {
        $("#ddSup_code-upd")
          .children("option:not(:first)")
          .remove();
        supListenerUpd(_sups);
      });
    });
    $("#ddStaff_code-upd").on("change", function () {
      var staff_code = $(this).val();
      $("#ddStaff_name-upd").val(staff_code);
    });
    $("#ddStaff_name-upd").on("change", function () {
      var staff_code = $(this).val();
      $("#ddStaff_code-upd").val(staff_code);
    });
    $("#ddSup_code-upd").on("change", function () {
      var sup_code = $(this).val();
      $("#ddSup_name-upd").val(sup_code);
    });
    $("#ddSup_name-upd").on("change", function () {
      var sup_code = $(this).val();
      $("#ddSup_code-upd").val(sup_code);
    });
  });
  // $('#submitScrChildForm').on('click', (e) => {
  //   // console.log(data);
  //   $('#scrChildrenForm').validate();
  //   if ($('#scrChildrenForm').valid()) {
  //     var scrChildrenData = $('#scrChildrenForm').serializeFormJSON();
  //     console.log(scrChildrenData);
  //     ipc.send('scrChildren', scrChildrenData);
  //     ipc.removeAllListeners('scrChildren');
  //     // $('#scrChildrenForm').get(0).reset();
  //     $('.clr').val("");
  //     $('.cld').val("");
  //     $('input[type="number"]').attr('min', 0);
  //   }
  //   e.preventDefault();
  // })
  // $('#resetScrChildForm').on('click', () => {
  //   $('#scrChildrenForm').get(0).reset();
  // });
  $(async () => {
    // $('.outreach').hide();
    var defProg = JSON.parse(window.localStorage.getItem('defaults'))['defProg']
    if (defProg == 'outreach') {
      $('.outreach').show();
      $('.outreach input').attr('required', true);
      $('.nsc').show();
      $('.noOutreach').hide();
      $('.nsc input').attr('required', true);
      $('#ddUC').attr('disabled', false)

    } else if (defProg == 'sc') {
      $('#ddUC').attr('disabled', true)
      $('.outreach').hide();
      $('.outreach input').attr('required', false);
    } else {
      $('.outreach').hide();
      $('.nsc').show();
      $('.nsc input').attr('required', true);
      $('.outreach input').attr('required', false);
      $('#ddUC').attr('disabled', false)
    }
    $('#ddProgramType').on('change', async function () {
      var val = $(this).val();
      // if (data.length > 0) {
      //   data = [];
      // }
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse' ,val)

      console.log(val)
      if (val == 'outreach') {
        $('.outreach').show();
        $('.outreach input').attr('required', true);
        $('.nsc').show();
        $('.noOutreach').hide();
        $('.nsc input').attr('required', true);
        $('#ddUC').attr('disabled', false)

      } else if (val == 'sc') {
        $('#ddUC').attr('disabled', true)
        $('.outreach').hide();
        $('.outreach input').attr('required', false);
      } else {
        $('.outreach').hide();
        $('.nsc').show();
        $('.nsc input').attr('required', true);
        $('.outreach input').attr('required', false);
        $('#ddUC').attr('disabled', false)
      }
    })
  })
  var data = [];
  let myInsert = (item) => {
    // console.log(item);
    return new Promise((resolve, reject) => {
      //  Description = [{ Name: '', item: '' }];
      //  Unit = [{ Name: '', item: '' }];
      //  SubUnit = [{ Name: '', item: '' }];
      var length = data.length + 1;
      item.id = data.length + 1;
      item.prog_type = $("#ddProgramType").val();
      item.stock_release_date = $("#stock_release_date").val();
      item.district_id = $("#ddDistrict").val();
      item.tehsil_id = $("#ddTehsil").val();
      item.site_id = $("#ddHealthHouse").val() || 0;
      item.CHW_id = $("#ddStaff_code").val() || 0;
      item.CHS_id = $("#ddStaff_code").val() || 0;
      item.upload_status = 0;
      item.created_at = new Date().toLocaleDateString();
      item.dist_month = $("#distMonth").val();
      var appConfig = JSON.parse(window.sessionStorage.getItem('config'));
      item.org_name = appConfig.org_name;
      item.project_name = appConfig.project_name;
      $("#stockDist").validate();
      if (data.filter(el => el.item_name == item.item_name).length > 0) {
        alert('Same item is not allowed to enter multiple time, if you want to change quantity release please click to edit the line/same item');
      } else {

        if ($("#stockDist").valid()) {
          data.push(item);
          // console.log(data);
        }
      }

      // data.push(item);
      // console.log(data);
      if (length == data.length && $("#stockDist").valid()) {
        resolve(data[data.length]);
      } else {
        reject();
      }
    })
  }
  let delItem = (item) => {
    return new Promise((resolve, reject) => {
      var total = data.length
      data = data.filter(function (single) {
        return single !== item
      })
      console.log(data);

      if (data.length != total) {
        // data.splice(index, 1);
        resolve(data)
      } else {
        reject()
      }
    })
  }
  let updItem = (item) => {
    return new Promise((resolve, reject) => {
      var tempVar = false;
      data.forEach((el, i) => {
        if (el.id == item.id) {
          // console.log('item matched in update')
          data[i] = item;
          tempVar = true
        }
      })

      if (tempVar) {
        // delIndex.splice(index, 1);
        // console.log(data);
        var appConfig = JSON.parse(window.sessionStorage.getItem('config'));
        item.org_name = appConfig.org_name;
        item.project_name = appConfig.project_name;
        resolve(item)
      } else {
        reject()
      }
    })
  }
  $(() => {
    var sendValue = function (varName, value) {
      // console.log(varName, value)
      var xx = varName.filter(el => el.item == value)
      // console.log(xx)
      // if (value == '') {
      //   return { Name: "", item: "" };
      // } else{}
      return xx;
    }
    $("#ddProgramType").on('change', function () {
      var progType = $(this).val();
      ipc.send('getCommodity', progType);
      ipc.on('commodity', (evt, com) => {
        var Description = [{
          Name: '',
          item: ''
        }];
        var Unit = [{
          Name: '',
          item: ''
        }];
        var SubUnit = [{
          Name: '',
          item: ''
        }];
        var items = [{
          Name: ""
        }];
        var item_id = [{
          Name: '',
          item: ''
        }];
        // console.log(com)
        // var availStock = [{ Name: "", item: '' }];
        com.commodity.forEach((el, i) => {
          Description.push({
            Name: el.item_desc,
            item: el.item_name,
          })
          Unit.push({
            Name: el.item_unit,
            item: el.item_name,
          })
          SubUnit.push({
            Name: el.item_sub_unit,
            item: el.item_name,
          })
          items.push({
            Name: el.item_name,
            item: el.item_name,
          })
          item_id.push({
            Name: el.id,
            item: el.item_name,
          })
          // availStock.push({
          //   Name: el.remaining,
          //   item: el.item_name,
          // })
          if (com.commodity.length - 1 == i) {
            stockGrid(Description, Unit, items, SubUnit, item_id);
          }
        })
      })

      function stockGrid(Description, Unit, items, SubUnit, item_id) {
        $("#stockDistGrid").jsGrid({
          width: "100%",
          height: "400px",
          inserting: true,
          editing: true,
          sorting: true,
          paging: true,
          controller: {
            loadData: filter => {
              return data;
            },
            insertItem: item => {
              return myInsert(item);
            },
            updateItem: function (item) {
              // console.log('updateitem clicked', item)
              return updItem(item);
            },

            deleteItem: function (item) {
              return delItem(item);
            }
          },

          fields: [
            // {name:'country_code', title:'Country Code', type:'text'},
            // {name:'base_code', title:'Base Code', type:'text'},
            // {name:'dept_code', title:'Dept Code', type:'text'},
            // {name:'proc_req', title:'Proc: Req: #', type:'text'},
            // {name:'proc_line', title:'Proc: Line', type:'text'},
            {
              name: "item_name",
              title: "Item",
              type: "select",
              items: items,
              valueField: "Name",
              textField: "Name",
              valueType: "string",
              insertTemplate: function () {
                var descField = this._grid.fields[1];
                var unitField = this._grid.fields[2];
                var subUnitField = this._grid.fields[3];
                var item_idField = this._grid.fields[9];
                console.log(item_idField);
                // var avalable_stockField = this._grid.fields[4];
                // var quantity_releasedField = this._grid.fields[5];
                // var testField = this._grid.fields[6];
                var $inertControl = jsGrid.fields.select.prototype.insertTemplate.call(
                  this
                );
                $inertControl.on("change", function () {
                  var itemId = $(this).val();
                  descField.items = sendValue(Description, itemId);
                  $(".item_desc-insert")
                    .empty()
                    .append(descField.insertTemplate());
                  unitField.items = sendValue(Unit, itemId);
                  $(".disp_unit-insert")
                    .empty()
                    .append(unitField.insertTemplate());
                  subUnitField.items = sendValue(SubUnit, itemId);
                  $(".disp_sub_unit-insert")
                    .empty()
                    .append(subUnitField.insertTemplate());
                  item_idField.items = sendValue(item_id, itemId);
                  $(".item_id-insert")
                    .empty()
                    .append(item_idField.insertTemplate());
                  // avalable_stockField.items = sendValue(availStock, itemId);
                  // $(".avalable_stock-insert").empty().append(avalable_stockField.insertTemplate());
                  // testField = (avalable_stockField - quantity_releasedField);
                  // $(".test-insert").empty().append(testField.insertTemplate());
                });
                return $inertControl;
              },
              editTemplate: function (value) {
                var descField = this._grid.fields[1];
                var unitField = this._grid.fields[2];
                var subUnitField = this._grid.fields[3];
                var item_idField = this._grid.fields[9];
                // console.log(item_idField);

                // var avalable_stockField = this._grid.fields[4];
                // var quantity_releasedField = this._grid.fields[5];
                // var testField = this._grid.fields[6];
                var $editControl = jsGrid.fields.select.prototype.editTemplate.call(
                  this,
                  value
                );

                var changeItem = function () {
                  var editVal = $editControl.val();
                  // console.log({editVal: editVal})
                  descField.items = sendValue(Description, editVal);
                  $(".item_desc-update")
                    .empty()
                    .append(descField.editTemplate());
                  unitField.items = sendValue(Unit, editVal);
                  $(".disp_unit-update")
                    .empty()
                    .append(unitField.editTemplate());
                  subUnitField.items = sendValue(SubUnit, editVal);
                  $(".disp_sub_unit-update")
                    .empty()
                    .append(subUnitField.editTemplate());
                  item_idField.items = sendValue(item_id, editVal);
                  $(".item_id-update")
                    .empty()
                    .append(item_idField.editTemplate());
                  // avalable_stockField.items = sendValue(availStock, editVal);
                  // $(".avalable_stock-update").empty().append(avalable_stockField.editTemplate());
                  // testField = (availStock - quantity_releasedField);
                  // $(".test-update").empty().append(testField.editTemplate());
                };
                $editControl.on("change", changeItem);
                changeItem();
                return $editControl;
              }
            },
            {
              name: "item_desc",
              title: "Description",
              type: "select",
              items: Description,
              valueField: "Name",
              valueType: "string",
              textField: "Name",
              insertcss: "item_desc-insert",
              updatecss: "item_desc-update",
              itemTemplate: function (item_desc) {
                return item_desc;
              },
              readOnly: true
            },
            {
              name: "disp_unit",
              title: "Unit",
              type: "select",
              items: Unit,
              valueField: "Name",
              valueType: "string",
              textField: "Name",
              insertcss: "disp_unit-insert",
              updatecss: "disp_unit-update",
              itemTemplate: function (disp_unit) {
                return disp_unit;
              },
              readOnly: true
            },
            {
              name: "disp_sub_unit",
              title: "Sub Unit",
              type: "select",
              items: SubUnit,
              valueField: "Name",
              valueType: "string",
              textField: "Name",
              insertcss: "disp_sub_unit-insert",
              updatecss: "disp_sub_unit-update",
              itemTemplate: function (disp_sub_unit) {
                return disp_sub_unit;
              },
              readOnly: true
            },
            {
              name: "opening",
              title: "Opening",
              type: "decimal",
              validate: ["required", {
                validator: "min",
                param: 0
              }]
            },
            {
              name: "received",
              title: "Received",
              type: "decimal",
              validate: ["required", {
                validator: "min",
                param: 0
              }]
            },
            {
              name: "distributed",
              title: "Distributed",
              type: "decimal",
              validate: [
                "required",
                {
                  validator: function (value, item) {
                    return value <= item.opening + item.received;
                  },
                  message: function (value, item) {
                    return `${
                      item.item_name
                      } coult not be distribued more than available stock (opening + received) ${item.opening +
                      item.received}`;
                  }
                }
              ]
            },
            {
              name: "damaged",
              title: "Damaged",
              type: "decimal",
              validate: [
                "required",
                {
                  validator: function (value, item) {
                    return (
                      value <=
                      item.opening + item.received - item.distributed
                    );
                  },
                  message: function (value, item) {
                    return `${
                      item.item_name
                      } coult not be damaged more than available stock (opening + received - distributed) ${item.opening +
                      item.received -
                      item.distributed}`;
                  }
                }
              ]
            },
            {
              name: "remaining",
              title: "Balance",
              width: 80,
              align: "center",
              itemTemplate: function (value, item) {
                // var test = this._grid.fields[5];
                // var $inertControl = jsGrid.fields.DecimalField.prototype.insertTemplate.call(test);

                return (
                  item.opening +
                  item.recieved -
                  (item.distributed + item.damaged)
                );
                // $inertControl.on("change", function() {
                // });
              }
            },
            {
              name: "item_id",
              title: "Id",
              type: "select",
              css: "d-none",
              items: item_id,
              valueField: "Name",
              valueType: "number",
              textField: "Name",
              insertcss: "item_id-insert",
              updatecss: "item_id-update",
              itemTemplate: function (item_id) {
                // console.log(item_id);
                return item_id;
              }
            },
            {
              type: "control",
              editButton: false,
              modeSwitchButton: false
            }
          ]
        });
      }
    });


  });
  // $(function () {
  //   var datePickerId = document.getElementById('stock_release_date');
  //   datePickerId.max = new Date().toISOString().split("T")[0];
  // });
  $("#stockDistSubmit").on("click", e => {
    console.log(data);
    // if(data.length>0){

    var stockDistArr = [];
    data.forEach(el => {
      delete el.id;
      stockDistArr.push(el);
    });
    console.log(stockDistArr);
    ipc.send("stockDistEntry", stockDistArr);
    ipc.removeAllListeners("stockDistEntry");
    // data = [];
    // $('#jsGrid').jsGrid("loadData");
    // $('#scrPlwForm').get(0).reset();
    setTimeout(stockDistTemplate, 3000);

    // } else {
    //   $('#scrPlwForm').validate();
    // }
    e.preventDefault();
  });
  $("#stockDistReset").on("click", e => {
    data = [];
    // $('#jsGrid').jsGrid("loadData");
    $("#stockDist")
      .get(0)
      .reset();
    $("#stockDistGrid").jsGrid("destroy");
    e.preventDefault();
  });


  function updateGrid(reportId, prog_type) {
    var sendValue = function (varName, value) {
      // console.log(varName, value)
      var xx = varName.filter(el => el.item == value);
      // console.log(xx)
      // if (value == '') {
      //   return { Name: "", item: "" };
      // } else{}
      return xx;
    };
    ipc.send("getCommodity", prog_type);
    ipc.on("commodity", (evt, com) => {
      var Description = [{
        Name: "",
        item: ""
      }];
      var Unit = [{
        Name: "",
        item: ""
      }];
      var SubUnit = [{
        Name: "",
        item: ""
      }];
      var items = [{
        Name: ""
      }];
      var item_id = [{
        Name: "",
        item: ""
      }];
      // console.log(com)
      // var availStock = [{ Name: "", item: '' }];
      com.commodity.forEach((el, i) => {
        Description.push({
          Name: el.item_desc,
          item: el.item_name
        });
        Unit.push({
          Name: el.item_unit,
          item: el.item_name
        });
        SubUnit.push({
          Name: el.item_sub_unit,
          item: el.item_name
        });
        items.push({
          Name: el.item_name,
          item: el.item_name
        });
        item_id.push({
          Name: el.id,
          item: el.item_name
        });
        // availStock.push({
        //   Name: el.remaining,
        //   item: el.item_name,
        // })
        if (com.commodity.length - 1 == i) {
          stockGrid(Description, Unit, items, SubUnit, item_id, reportId);
        }
      });
    });

    function stockGrid(Description, Unit, items, SubUnit, item_id, reportId) {
      var geoData = {
        program_type: '',
        province_id: '',
        district_id: '',
        tehsil_id: '',
        uc_id: '',
        site_id: '',
        stockReportID: '',
        dist_month: '',
        CHS_id: '',
        CHW_id: '',
        items: []
      }
      let _loadData = (report) => {
        return new Promise((resolve, reject) => {
          ipc.send('getStockDist', reportId);
          ipc.on('getStockDist', (e, result) => {
            console.log(result);
            if (result.result.data.length < 1) {
              var s = {
                data: [],
                itemsCount: 0
              };
              resolve(s)
            } else {
              var s = {
                data: result.result.data,
                itemsCount: result.result.itemsCount[0].total
              };
              var first = s.data[0];
              geoData.program_type = first.program_type;
              geoData.province_id = first.province_id;
              geoData.district_id = first.district_id;
              geoData.tehsil_id = first.tehsil_id;
              geoData.uc_id = first.uc_id;
              geoData.site_id = first.site_id;
              geoData.stockReportID = first.stockReportID;
              geoData.CHS_id = first.CHS_id;
              geoData.CHW_id = first.CHW_id;
              geoData.dist_month = first.dist_month;
              geoData.items = s.data.map(el => el.item_name)
              if (result.err) {
                reject(result.err)
                ipc.removeAllListeners('getStockDist')
              } else {
                resolve(s)
                ipc.removeAllListeners('getStockDist')
              }
            }
          })
        })
      }
      let myInsert = (item) => {
        item.program_type = geoData.program_type;
        item.province_id = geoData.province_id;
        item.district_id = geoData.district_id;
        item.tehsil_id = geoData.tehsil_id;
        item.uc_id = geoData.uc_id;
        item.site_id = geoData.site_id;
        item.stockReportID = geoData.stockReportID;
        item.CHS_id = geoData.CHS_id;
        item.CHW_id = geoData.CHW_id;
        item.dist_month = geoData.dist_month;
        console.log(item);
        console.log(geoData.items);
        return new Promise((resolve, reject) => {
          if (geoData.items.filter(el => el === item.item_name).length > 0) {
            alert('Same item is not allowed to enter multiple time, if you want to change quantity release please click to edit the line/same item');
            reject();
          } else {
            ipc.send('addItemToStockDist', item);
            ipc.on("addItemToStockDist", (event, result) => {
              console.log(result)
              if (result.err) {
                console.log(result.err)
                reject(result.err)
              } else {
                console.log(result);
                resolve(result.result)
                ipc.removeAllListeners("addItemToStockDist");
              }
            });
          }

        })

      };
      let updItem = (item) => {
        console.log(item)
        return new Promise((resolve, reject) => {
          if (geoData.items.filter(el => el === item.item_name).length > 1) {
            alert("Same item is not allowed to enter multiple time, if you want to change quantity release please click to edit the line/same item");
            reject()
          } else {
            ipc.send('updateSingleItem', item);
            ipc.on("updateSingleItem", (event, result) => {
              if (result.err) {
                reject()
              } else {
                resolve(result.result)
                ipc.removeAllListeners("updateSingleItem")
              }
            });
          }
        })
      };
      let delItem = (item) => {
        console.log(item)
        return new Promise((resolve, reject) => {
          ipc.send('deleteStockDistItem', item)
          ipc.on("deleteStockDistItem", (event, result => {
            console.log(result)
            if (result.err) {
              reject()
            } else {
              resolve()
              ipc.removeAllListeners("deleteStockDistItem")
            }
          }));
        })
      };
      $("#stockDistUpdateGrid").jsGrid({
        width: "100%",
        height: "400px",
        inserting: false,
        editing: true,
        sorting: true,
        // deleting: true,
        // paging: true,
        autoload: true,
        pageLoading: true, // this is the clue
        pageSize: 10,
        pageButtonCount: 5,
        deleteConfirm: "Do you really want to delete Stock Distribution?",
        sorting: true,
        paging: true,
        controller: {
          loadData: filter => {
            console.log(filter)
            return _loadData(reportId);
          },
          insertItem: item => {
            return myInsert(item);
          },
          updateItem: function (item) {
            // console.log('updateitem clicked', item)
            return updItem(item);
          },

          deleteItem: function (item) {
            return delItem(item);
          }
        },

        fields: [
          // {name:'country_code', title:'Country Code', type:'text'},
          // {name:'base_code', title:'Base Code', type:'text'},
          // {name:'dept_code', title:'Dept Code', type:'text'},
          // {name:'proc_req', title:'Proc: Req: #', type:'text'},
          // {name:'proc_line', title:'Proc: Line', type:'text'},
          {
            name: "item_name",
            width: 50,
            title: "Item",
            type: "select",
            items: items,
            valueField: "Name",
            textField: "Name",
            valueType: "string",
            insertTemplate: function () {
              var descField = this._grid.fields[1];
              var unitField = this._grid.fields[2];
              var subUnitField = this._grid.fields[3];
              var item_idField = this._grid.fields[9];
              console.log(item_idField);
              // var avalable_stockField = this._grid.fields[4];
              // var quantity_releasedField = this._grid.fields[5];
              // var testField = this._grid.fields[6];
              var $inertControl = jsGrid.fields.select.prototype.insertTemplate.call(
                this
              );
              $inertControl.on("change", function () {
                var itemId = $(this).val();
                descField.items = sendValue(Description, itemId);
                $(".item_desc-insert")
                  .empty()
                  .append(descField.insertTemplate());
                unitField.items = sendValue(Unit, itemId);
                $(".disp_unit-insert")
                  .empty()
                  .append(unitField.insertTemplate());
                subUnitField.items = sendValue(SubUnit, itemId);
                $(".disp_sub_unit-insert")
                  .empty()
                  .append(subUnitField.insertTemplate());
                item_idField.items = sendValue(item_id, itemId);
                $(".item_id-insert")
                  .empty()
                  .append(item_idField.insertTemplate());
                // avalable_stockField.items = sendValue(availStock, itemId);
                // $(".avalable_stock-insert").empty().append(avalable_stockField.insertTemplate());
                // testField = (avalable_stockField - quantity_releasedField);
                // $(".test-insert").empty().append(testField.insertTemplate());
              });
              return $inertControl;
            },
            editTemplate: function (value) {
              var descField = this._grid.fields[1];
              var unitField = this._grid.fields[2];
              var subUnitField = this._grid.fields[3];
              var item_idField = this._grid.fields[9];
              // console.log(item_idField);

              // var avalable_stockField = this._grid.fields[4];
              // var quantity_releasedField = this._grid.fields[5];
              // var testField = this._grid.fields[6];
              var $editControl = jsGrid.fields.select.prototype.editTemplate.call(
                this,
                value
              );

              var changeItem = function () {
                var editVal = $editControl.val();
                // console.log({editVal: editVal})
                descField.items = sendValue(Description, editVal);
                $(".item_desc-update")
                  .empty()
                  .append(descField.editTemplate());
                unitField.items = sendValue(Unit, editVal);
                $(".disp_unit-update")
                  .empty()
                  .append(unitField.editTemplate());
                subUnitField.items = sendValue(SubUnit, editVal);
                $(".disp_sub_unit-update")
                  .empty()
                  .append(subUnitField.editTemplate());
                item_idField.items = sendValue(item_id, editVal);
                $(".item_id-update")
                  .empty()
                  .append(item_idField.editTemplate());
                // avalable_stockField.items = sendValue(availStock, editVal);
                // $(".avalable_stock-update").empty().append(avalable_stockField.editTemplate());
                // testField = (availStock - quantity_releasedField);
                // $(".test-update").empty().append(testField.editTemplate());
              };
              $editControl.on("change", changeItem);
              changeItem();
              return $editControl;
            }
          },
          {
            name: "item_desc",
            width: 50,
            title: "Description",
            type: "select",
            items: Description,
            valueField: "Name",
            valueType: "string",
            textField: "Name",
            insertcss: "item_desc-insert",
            updatecss: "item_desc-update",
            itemTemplate: function (item_desc) {
              return item_desc;
            },
            readOnly: true
          },
          {
            name: "disp_unit",
            width: 50,
            title: "Unit",
            type: "select",
            items: Unit,
            valueField: "Name",
            valueType: "string",
            textField: "Name",
            insertcss: "disp_unit-insert",
            updatecss: "disp_unit-update",
            itemTemplate: function (disp_unit) {
              return disp_unit;
            },
            readOnly: true
          },
          {
            name: "disp_sub_unit",
            width: 50,
            title: "Sub Unit",
            type: "select",
            items: SubUnit,
            valueField: "Name",
            valueType: "string",
            textField: "Name",
            insertcss: "disp_sub_unit-insert",
            updatecss: "disp_sub_unit-update",
            itemTemplate: function (disp_sub_unit) {
              return disp_sub_unit;
            },
            readOnly: true
          },
          {
            name: "opening",
            width: 50,
            title: "Opening",
            type: "decimal",
            validate: ["required", {
              validator: "min",
              param: 0
            }]
          },
          {
            name: "received",
            width: 50,
            title: "Received",
            type: "decimal",
            validate: ["required", {
              validator: "min",
              param: 0
            }]
          },
          {
            name: "distributed",
            width: 50,
            title: "Distributed",
            type: "decimal",
            validate: [
              "required",
              {
                validator: function (value, item) {
                  return value <= item.opening + item.received;
                },
                message: function (value, item) {
                  return `${
                  item.item_name
                } coult not be distribued more than available stock (opening + received) ${item.opening +
                  item.received}`;
                }
              }
            ]
          },
          {
            name: "damaged",
            width: 50,
            title: "Damaged",
            type: "decimal",
            validate: [
              "required",
              {
                validator: function (value, item) {
                  return (
                    value <= item.opening + item.received - item.distributed
                  );
                },
                message: function (value, item) {
                  return `${
                  item.item_name
                } coult not be damaged more than available stock (opening + received - distributed) ${item.opening +
                  item.received -
                  item.distributed}`;
                }
              }
            ]
          },
          {
            name: "remaining",
            width: 50,
            title: "Balance",
            // width: 80,
            align: "center",
            itemTemplate: function (value, item) {
              // var test = this._grid.fields[5];
              // var $inertControl = jsGrid.fields.DecimalField.prototype.insertTemplate.call(test);

              return (
                parseFloat(item.opening) +
                parseFloat(item.recieved) -
                (parseFloat(item.distributed) + parseFloat(item.damaged))
              );
              // $inertControl.on("change", function() {
              // });
            }
          },
          {
            name: "item_id",
            title: "Id",
            type: "select",
            css: "d-none",
            items: item_id,
            valueField: "Name",
            valueType: "number",
            textField: "Name",
            insertcss: "item_id-insert",
            updatecss: "item_id-update",
            itemTemplate: function (item_id) {
              // console.log(item_id);
              return item_id;
            }
          },
          {
            type: "control",
            width: 50,
            editButton: true,
            modeSwitchButton: true
          }
        ]
      });
    }

  }

  $('.myclose').on('click', function () {
    $("#stockDistListGrid").jsGrid('loadData');
  })

}