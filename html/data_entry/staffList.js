var uuid = require('uuid/v4');
var knex = require('../../mainfunc/db');
module.exports.StaffList = async function () {
  await setFormDefualts(false,'filterProvince','filterDistrict','filterTehsil')
  $('.filter').on('change', async function(){
    // programe type change in uc selections
    if($('#filterProgramType').val() == 'sc'){
      $("#filterUC").attr("disabled", true);
    }else{
      $("#filterUC").attr("disabled", false);
    }
    var filter = {};
    createExternalFilterValue(filter);
   filter.district = filter.district_name
          filter.tehsil = filter.tehsil_name
          filter.uc = filter.uc_name
   
    // $('#AddUpdate-jsGrid').jsGrid("loadData");
    $("#tblStaffList").jsGrid("loadData", filter).done(function() {
      console.log("data loaded");
    });
  })
  await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse' )
  await appendItems('ddProvince','provinceList',false,'id','provinceName');
  await updatGeoElonChange('filterProvince','filterDistrict','filterTehsil', 'filterUC' )
  // $(() => {
  function _staffList(cb) {
    // return new Promise((resolve, reject) => {
    ipc.send("stafflist");
    ipc.on("stafflist", (evt, staff) => {
      // console.log(staff)
      // supervisors = data;
      ipc.send("geoList");
      ipc.on("geoList", (evt, data) => {
        // console.log(data);
        var _staff = staff;
        var province = data.province;
        var district = data.district;
        var tehsil = data.tehsil;
        var uc = data.uc;
        // var site = data.site;
        cb(null, {
          _staff,
          province,
          district,
          tehsil,
          uc,
          // site
        })
        ipc.removeAllListeners("geoList")
      });
      ipc.removeAllListeners("stafflist")
    });
    // })
  }

  function initStaffListGrid() {
    _staffList((x, result) => {
      // console.log(result);
      // console.log(result)
      var _staffData = {
        loadData: function (filter) {
          createExternalFilterValue(filter);
          filter.district = filter.district_name
          filter.tehsil = filter.tehsil_name
          filter.uc = filter.uc_name
          console.log({filter})
          return $.grep(result._staff, function (client) {
            return (!filter.staff_code || client.staff_code.indexOf(filter.staff_code) > -1) &&
              (!filter.staff_name || client.staff_name.indexOf(filter.staff_name) > -1) && (!filter.province || client.province == filter.province) && (!filter.district || client.district == filter.district) && (!filter.tehsil || client.tehsil == filter.tehsil) && (!filter.uc || client.uc == filter.uc);
            // && (filter.Married === undefined || client.Married === filter.Married);
          });
        },

        insertItem: function (insertingClient) {
          // this.clients.push(insertingClient);
        },

        updateItem: function (updatingClient) {},

        deleteItem: function (deletingClient) {
          // var clientIndex = $.inArray(deletingClient, this.clients);
          // this.clients.splice(clientIndex, 1);
        }

      };
      if (!result.province.filter(el => el.id == 0).length > 0) {
        result.province.unshift({
          provinceName: '',
          id: 0
        })
        result.district.unshift({
          districtName: '',
          id: 0
        })
        result.tehsil.unshift({
          tehsilName: '',
          id: 0
        })
        result.uc.unshift({
          ucName: '',
          id: 0
        })
        // result.site.unshift({ siteName: '', id: 0 })
      }
      $("#tblStaffList").jsGrid({
        height: "400px",
        width: "100%",
        // inserting: true,
        filtering: true,
        // editing: true,
        sorting: true,
        paging: true,
        autoload: true,
        pageSize: 15,
        pageButtonCount: 5,
        controller: _staffData,
        fields: [{
            name: 'id',
            type: 'number',
            visible: false
          },
          {
            title: "Province",
            name: "province",
            type: "select",
            items: result.province,
            valueField: "id",
            textField: "provinceName",
            width: 50,
            filtering:false
          },
          {
            title: "District",
            name: "district",
            type: "select",
            items: result.district,
            valueField: "id",
            textField: "districtName",
            width: 50,
            filtering:false

          },
          {
            title: "Tehsil",
            name: "tehsil",
            type: "select",
            items: result.tehsil,
            valueField: "id",
            textField: "tehsilName",
            width: 50,
            filtering:false

          },
          {
            title: "UC",
            name: "uc",
            type: "select",
            items: result.uc,
            valueField: "id",
            textField: "ucName",
            width: 50,
            filtering:false

          },
          // {
          //   title: "Site",
          //   name: "site",
          //   type: "select",
          //   items: result.site,
          //   valueField: "id",
          //   textField: "siteName"
          // },
          {
            title: "Code",
            name: "staff_code",
            type: "text"
          },
          {
            title: "Name",
            name: "staff_name",
            type: "text"
          },
          // {
          //   type: "control",
          //   modeSwitchButton: true,
          //   editButton: false,
          //   deleteButton: false,
          // }
        ],
        rowClick: function (args) {
          var getData = args.item;
          $('#ddProvince').val(getData.province);
          $('#ddDistrict').children('option:not(:first)').remove();
          $('#ddDistrict').append(`<option value="${getData.district}" selected>${result.district.filter(el => el.id == getData.district)[0].districtName}</option>`)
          $('#ddTehsil').children('option:not(:first)').remove();
          $("#ddTehsil").append(`<option value="${getData.tehsil}" selected>${result.tehsil.filter(el => el.id == getData.tehsil)[0].tehsilName}</option>`);

          // $('#ddTehsil').val(getData.tehsil);
          $('#ddUC').children('option:not(:first)').remove();
          $("#ddUC").append(`<option value="${getData.uc}" selected>${result.uc.filter(el => el.id == getData.uc)[0].ucName}</option>`);
          // $("#ddHealthHouse").children("option:not(:first)").remove();
          // $("#ddHealthHouse").append(`<option value="${getData.site}" selected>${result.site.filter(el => el.id == getData.site)[0].siteName}</option>`);

          // $('#ddUC').val(getData.uc);
          $("#staff_code").val(getData.staff_code);
          $("#staff_name").val(getData.staff_name);
          if (getData.is_deleted) {
            $('#is_deleted').prop('checked', true)
          } else {
            $('#is_deleted').prop('checked', false)

          }
          $("#id").val(getData.id);
        },
        rowClass: function (item, itemIndex) {
          return (item.is_deleted) ? 'bg-red' : '';
        },
      });
    })
  }
  initStaffListGrid();

  // _kamran.then(result => {

  // })  
  // });
  $("#btnSaveStaff").on("click", e => {
    // console.log(data);
    $("#staffForm").validate();
    if ($("#staffForm").valid()) {
      var staffData = $("#staffForm").serializeFormJSON();
      // staffData.id = uuid();
      var appConfig = JSON.parse(window.sessionStorage.getItem('config'));
      staffData.org_name = appConfig.org_name;
      staffData.project_name = appConfig.project_name;
      staffData.is_deleted = $('#is_deleted').prop('checked');

      // console.log(staffData);
      ipc.send("addStaff", staffData);
      ipc.removeAllListeners("addStaff");
      $("#staffForm")
        .get(0)
        .reset();
      $("#tblStaffList").jsGrid("destroy");;
      initStaffListGrid();
      // $('input[type="number"]').attr("min", 0);
      $('#ddDistrict').children('option:not(:first)').remove();
      $('#ddTehsil').children('option:not(:first)').remove();
      $('#ddUC').children('option:not(:first)').remove();
      $("#ddHealthHouse").children("option:not(:first)").remove();
    }
    e.preventDefault();
  });
  $(document).ready(function () {
    $('#_staffListExport').click(async function () {
      try {
        var data = await knex.raw(`select b.province Province, b.district_name District,b.tehsil_name Tehsil,b.uc_name UC, a.staff_code Code, a.staff_name Name,a.org_name Organization,a.project_name Project, (case when a.is_deleted = 0 then 'No' else 'Yes' end)  Deleted,a.created_at Created, (case when a.upload_status = 0 then 'Not Uploaded' when a.upload_status = 1 then 'Uploaded' else 'Edited' end) Status from tblLhw a inner join v_geo_uc b on b.uc_id = a.uc`)
        // var data = $('#txt').val();
        if (data == '')
          return;
        JSONToCSVConvertor(data, "CHW List", true, );

      } catch (error) {
        console.log(error)
        alert('Data Fetch error')
      }


      // JSONToCSVConvertor(data, "Vehicle Report", true);
    });
  });

}