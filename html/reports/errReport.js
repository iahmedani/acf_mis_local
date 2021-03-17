let Knex = require("../../mainfunc/db");
var Excel = require("exceljs");
const sheetColsFromJsonObject = function (dataArray) {
    var cols = [];
    var _els = [];
        for (property in dataArray) {
            _els.push(property)
        }
        _els = [...new Set(_els)]
        for (z of _els) {
            cols.push({
                header: z.replace(/_/g, ' ').toUpperCase(),
                key: z,
                width: 18
            })
        }

        return cols
}
module.exports.iniErrReports = async () => {
    var entFormFileds = {
        otpAdd: {
            table: "",
            fields: ["total_days", "followups", "muac", "reg_date"],
      
        },
        nscAdd: {
            table: "",
            fields: ["total_days", "followups", "muac", "reg_date"],
        },
        scrChildren: {
            table: "",
            fields: ["total_boys", "total_girls", "total", "type"],
        },
        scrPlw: {
            table: "",
            fields: ["total_pragnant", "total_lactating", "total", "type"],
        }
    }
  

  var entriesForm = $("#entForm")
  var qryfields = $("#filterFields")
  var filterType = $("#filterType")
    var values = $("#filValue")
    entriesForm.on('change', function () {
        var __val = $(this).val()
        qryfields.children("option:not(:first)").remove();
        for (x of entFormFileds[__val]['fields']) {
            qryfields.append(`<option val='${x}'>${x.toUpperCase()}</option>`)
        }
    })
    $('._ErFilter').on('change', () => {
        var table = '';
        var field = '';
        var filter = ''
        var values = '';
        var qry = `select * from ${table} where ${field} ${filter} ${values}`
        console.log(qry)

    })
};
