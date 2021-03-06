var uuid = require('uuid/v4');
const { client } = require('../../mainfunc/db');
var knex = require('../../mainfunc/db');

module.exports.SupList = async function () {
 
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
    $("#tblSupList").jsGrid("loadData", filter).done(function() {
      console.log("data loaded");
    });

  })
  function reRenderGrid() {
    $("#tblSupList")
      .jsGrid("render")
      .done(function () {
        console.log("rendering completed and data loaded");
      });
  }
  await appendItems('ddProvince','provinceList',false,'id','provinceName');
  await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse' )
  await updatGeoElonChange('filterProvince','filterDistrict','filterTehsil', 'filterUC' )
  // var ucForHH;
  // $('#ddUC').on('change', function () {
  //   var ucs = $(this).val();
  //   ucForHH = ucs
  //   ipc.send('getHealthHouse', ucs)
  //   ipc.on('hh', function (evt, hh) {
  //     $('#ddHealthHouse').children('option:not(:first)').remove();
  //     hhListener(hh);
  //   })
  // })


  // $(() => {
  function _supListFunc(cb) {
    // return new Promise((resolve, reject) => {
    ipc.send("supervisorlist");
    ipc.on("supervisorlist", (evt, sups) => {
      // console.log(sups)
      // supervisors = data;
      ipc.send("geoList");
      ipc.on("geoList", (evt, data) => {
        // console.log(data);
        var supervisors = sups;
        var province = data.province;
        var district = data.district;
        var tehsil = data.tehsil;
        var uc = data.uc;

        // var site = data.site;
        cb(null, {
          supervisors,
          province,
          district,
          tehsil,
          uc,
          // site
        })
        ipc.removeAllListeners('geoList')
      });

      ipc.removeAllListeners('supervisorlist')
    });
    // })
  }

  function initSupList() {
    _supListFunc((x, result) => {
      // console.log(result);
      // console.log(result)
      var _supData = {
        loadData: function (filter) {
          createExternalFilterValue(filter);
          filter.district = filter.district_name
          filter.tehsil = filter.tehsil_name
          filter.uc = filter.uc_name
          console.log({filter})
          return $.grep(result.supervisors, function (client) {
            return (!filter.sup_code || client.sup_code.indexOf(filter.sup_code) > -1) && (!filter.sup_name || client.sup_name.indexOf(filter.sup_name) > -1) && (!filter.province || client.province == filter.province) && (!filter.district || client.district == filter.district) && (!filter.tehsil || client.tehsil == filter.tehsil) && (!filter.uc || client.uc == filter.uc);
            //  && (!filter.site || client.site === filter.site);
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


      $("#tblSupList").jsGrid({
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
        controller: _supData,
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
            filtering:false,
          },
          {
            title: "District",
            name: "district",
            type: "select",
            items: result.district,
            valueField: "id",
            textField: "districtName",
            width: 50,
            filtering:false,

          },
          {
            title: "Tehsil",
            name: "tehsil",
            type: "select",
            items: result.tehsil,
            valueField: "id",
            textField: "tehsilName",
            width: 50,
            filtering:false,

          },
          {
            title: "UC",
            name: "uc",
            type: "select",
            items: result.uc,
            valueField: "id",
            textField: "ucName",
            width: 50,
            filtering:false,

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
            name: "sup_code",
            type: "text",
          },
          {
            title: "Name",
            name: "sup_name",
            type: "text"
          },
          // {
          //   type: "control",
          //   modeSwitchButton: false,
          //   editButton: false,
          //   deleteButton: false
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
          $("#sup_code").val(getData.sup_code);
          $("#sup_name").val(getData.sup_name);
          if (getData.is_deleted) {
            $('#is_deleted').prop('checked', true)
          } else {
            $('#is_deleted').prop('checked', false)

          }
          $("#id").val(getData.id);
          // $("#btnSaveSup").attr("disabled", true);
          // $("#btnUpdateSup").attr("disabled", false);
        },
        rowClass: function (item, itemIndex) {
          return (item.is_deleted) ? 'bg-red' : '';
        },
      });
    })
  }

  // _kamran.then(result => {
  initSupList();
  // })  
  // });
  $("#btnSaveSup").on("click", e => {
    // console.log(data);
    $("#supForm").validate();
    if ($("#supForm").valid()) {
      var supData = $("#supForm").serializeFormJSON();
      var appConfig = JSON.parse(window.sessionStorage.getItem('config'));
      supData.org_name = appConfig.org_name;
      supData.project_name = appConfig.project_name;
      // if (!supData.id || supData.id == '') {

      //   supData.id = uuid();
      // }
      supData.is_deleted = $('#is_deleted').prop('checked');

      // console.log(supData);
      ipc.send("addSup", supData);
      ipc.removeAllListeners("addSup");
      $("#supForm")
        .get(0)
        .reset();
      // reRenderGrid();
      $("#tblSupList").jsGrid("destroy");
      initSupList();
      // $('input[type="number"]').attr("min", 0);
      $('#ddDistrict').children('option:not(:first)').remove();
      $('#ddTehsil').children('option:not(:first)').remove();
      $('#ddUC').children('option:not(:first)').remove();
      $("#ddHealthHouse").children("option:not(:first)").remove();


    }
    e.preventDefault();
  });

  $(document).ready(function () {
    $('#_supListExport').click(async function () {
      try {
        var data = await knex.raw(`select b.province Province, b.district_name District,b.tehsil_name Tehsil,b.uc_name UC, a.sup_code Code, a.sup_name Name,a.org_name Organization,a.project_name Project, (case when a.is_deleted = 0 then 'No' else 'Yes' end)  Deleted,a.created_at Created, (case when a.upload_status = 0 then 'Not Uploaded' when a.upload_status = 1 then 'Uploaded' else 'Edited' end) Status from tblSupervisors a inner join v_geo_uc b on b.uc_id = a.uc`)
        // var data = $('#txt').val();
        if (data == '')
          return;
        JSONToCSVConvertor(data, "Supervisor List", true);

      } catch (error) {
        console.log(error)
        alert('Data Fetch error')
      }


      // JSONToCSVConvertor(data, "Vehicle Report", true);
    });
  });


}