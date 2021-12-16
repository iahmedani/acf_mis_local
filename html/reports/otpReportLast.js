const knex = require('../../mainfunc/db');

function prepareQry() {
    var qry = {};
    $("#ddProvince").val() ? (qry.province_id = $("#ddProvince").val()) : qry.province_id = "";
    $("#ddDistrict").val() ? (qry.district_id = $("#ddDistrict").val()) : qry.district_id = "";
    $("#ddTehsil").val() ? (qry.tehsil_id = $("#ddTehsil").val()) : qry.tehsil_id = "";
    $("#ddUc").val() ? (qry.uc_id = $("#ddTehsil").val()) : qry.uc_id = "";
    $("#ddHealthHouse").val() ? (qry.site_id = $("#ddHealthHouse").val()) : qry.site_id = "";
    $("#startDate").val() ? (qry.start_date = $("#startDate").val()) : qry.start_date = "";
    $("#endDate").val() ? (qry.end_date = $("#endDate").val()) : qry.end_date = "";
    $('#ddProgramType').val() ? (qry.prog_type = $("#ddProgramType").val()) : qry.prog_type = "";
    return qry;
}

function qryStringPrepare(filter) {
    var qry = {};
    if (filter.prog_type == 'sc') {
        qry.begin = `SELECT
        count( * ) AS a,
    (case when age < 7 then '06' when age > 6 and age < 24 then '623' when age > 23 then '2459' end) as age_group,
    gender 
FROM
    oneTableGeo 
WHERE
    reg_date < '${filter.start_date}' 
    AND prog_type = 'sc' 
    AND [province_id:1] LIKE '%${filter.site_id}%' 
    AND [district_id:1] LIKE '%${filter.site_id}%' 
    AND [tehsil_id:1] LIKE '%${filter.site_id}%' 
    AND [uc_id:1] LIKE '%${filter.site_id}%' 
    AND [site_id:1] LIKE '%${filter.site_id}%' 
    AND otp_id NOT IN ( SELECT otp_id FROM oneTableGeo WHERE reg_date < '${filter.start_date}' AND [exit_date:1] < '${filter.start_date}' ) 
GROUP BY
    age_group,
    gender `;
        qry.add = `SELECT
        (case when age < 7 then '06' when age > 6 and age < 24 then '623' when age > 23 then '2459' end) as age_group,
    gender,
    count( CASE WHEN muac < 11.5 AND ent_reason = 'new_add' AND oedema = 'absent' THEN 1 END ) b1,
    count( CASE WHEN oedema <> 'absent' AND ent_reason = 'new_add' THEN 1 END ) b2,
    (
    count( CASE WHEN muac < 11.5 AND ent_reason = 'new_add' AND oedema = 'absent' THEN 1 END ) + count( CASE WHEN oedema <> 'absent' AND ent_reason = 'new_add' THEN 1 END ) 
    ) b,
    count( CASE WHEN ent_reason = 'relapse' THEN 1 END ) c1,
    count( CASE WHEN ent_reason = 'return_after_lama' THEN 1 END ) c2,
    count( CASE WHEN ent_reason = 'transfer_from_ward' THEN 1 END ) c3,
    count( CASE WHEN ent_reason = 'transfer_in_from_otp' THEN 1 END ) c4,
    count( CASE WHEN ent_reason = 'other' THEN 1 END ) c5,
    count( CASE WHEN ent_reason <> 'new_add' THEN 1 END ) c 
FROM
    oneTableGeo
WHERE
    prog_type = 'sc'
    AND (reg_date BETWEEN '${filter.start_date}' AND '${filter.end_date}')
    AND [province_id:1] LIKE '%${filter.province_id}%' 
    AND [district_id:1] LIKE '%${filter.district_id}%' 
    AND [tehsil_id:1] LIKE '%${filter.tehsil_id}%' 
    AND [uc_id:1] LIKE '%${filter.uc_id}%' 
    AND [site_id:1] LIKE '%${filter.site_id}%' 
    GROUP BY
    age_group,
    gender`
        qry.exit = `select (case when age < 7 then '06' when age > 6 and age < 24 then '623' when age > 23 then '2459' end) as age_group, gender,
    count(case when [exit_reason:1] = 'cured' then 1 end) as e1,
    count(case when [exit_reason:1] = 'death' then 1 end) as e2,
    count(case when [exit_reason:1] = 'lama' then 1 end) as e3,
    count(case when [exit_reason:1] = 'non_recovered' then 1 end) as e4,
    (count(case when [exit_reason:1] = 'cured' then 1 end)+ count(case when [exit_reason:1] = 'death' then 1 end) + count(case when [exit_reason:1] = 'lama' then 1 end) + count(case when [exit_reason:1] = 'non_recovered' then 1 end)) as e,
    count(case when [exit_reason:1] = 'medical_transfer' then 1 end) as f1,
    count(case when [exit_reason:1] = 'medical_transfer_otp' then 1 end) as f2,
    count(case when [exit_reason:1] = 'other' then 1 end) as f3,
    (count(case when [exit_reason:1] = 'medical_transfer' then 1 end) + count(case when [exit_reason:1] = 'medical_transfer_otp' then 1 end) + count(case when [exit_reason:1] = 'other' then 1 end)) as f,
    ((count(case when [exit_reason:1] = 'cured' then 1 end)+ count(case when [exit_reason:1] = 'death' then 1 end) + count(case when [exit_reason:1] = 'lama' then 1 end) + count(case when [exit_reason:1] = 'non_recovered' then 1 end)) + (count(case when [exit_reason:1] = 'medical_transfer' then 1 end) + count(case when [exit_reason:1] = 'medical_transfer_otp' then 1 end) + count(case when [exit_reason:1] = 'other' then 1 end))) as g 
    from oneTableGeo
    WHERE
        [exit_date:1] BETWEEN '${filter.start_date}' AND '${filter.end_date}' 
        AND prog_type = 'sc' 
        AND [province_id:1] LIKE '%${filter.site_id}%' 
        AND [district_id:1] LIKE '%${filter.site_id}%' 
        AND [tehsil_id:1] LIKE '%${filter.site_id}%' 
        AND [uc_id:1] LIKE '%${filter.site_id}%' 
        AND [site_id:1] LIKE '%${filter.site_id}%' 
        GROUP BY
        age_group,
        gender `
        return qry;
    } else if (filter.prog_type == 'otp') {
        qry.begin = `select count(*) as a, (case when age BETWEEN 6 and 23 then '6_23' when age BETWEEN 24 and 59 then '24_59' end) as age_group, gender from oneTableGeo where reg_date < '${filter.start_date}' and prog_type = 'otp' and [province_id:1] like '%${filter.province_id}%' and [district_id:1] like '%${filter.district_id}%' and [tehsil_id:1] like '%${filter.tehsil_id}%' and [uc_id:1] like '%${filter.uc_id}%' and [site_id:1] like '%${filter.site_id}%' and otp_id not in (select otp_id from oneTableGeo where  reg_date < '${filter.start_date}' and [exit_date:1] < '${filter.start_date}')
        group by age_group, gender`
        qry.add = `select (case when age BETWEEN 6 and 23 then '6_23' when age BETWEEN 24 and 59 then '24_59' end) as age_group,
        gender,
        count(case when muac < 11.5  and ent_reason = 'no_prv_pro' and oedema = 'absent' then 1 end) as b1,  
        count(case when oedema <> 'absent' and ent_reason = 'no_prv_pro' then 1 end) as b2,
        ( count(case when muac < 11.5  and ent_reason = 'no_prv_pro' and oedema = 'absent' then 1 end) + count(case when oedema <> 'absent' and ent_reason = 'no_prv_pro' then 1 end)) as b,
        count(case when ent_reason = 'return_def' then 1 end) as c1,
        count(case when ent_reason = 'transfer_in_from_nsc' then 1 end) as c2,
        count(case when (ent_reason <> 'transfer_in_from_nsc' and  ent_reason <> 'return_def' and ent_reason <> 'relapse' and ent_reason <> 'no_prv_pro') then 1 end) as c3,
        count(case when ent_reason = 'relapse' then 1 end) as cc,
        (  count(case when ent_reason = 'return_def' then 1 end) + count(case when ent_reason = 'transfer_in_from_nsc' then 1 end) + count(case when ent_reason <> 'transfer_in_from_nsc' and  ent_reason <> 'return_def' and ent_reason <> 'relapse' and ent_reason <> 'no_prv_pro' then 1 end) )  as c,
        (( count(case when muac < 11.5  and ent_reason = 'no_prv_pro' and oedema = 'absent' then 1 end) + count(case when oedema <> 'absent' and ent_reason = 'no_prv_pro' then 1 end)) + (count(case when ent_reason = 'relapse' then 1 end)) + (count(case when ent_reason = 'return_def' then 1 end) + count(case when ent_reason = 'transfer_in_from_nsc' then 1 end) + count(case when ent_reason <> 'transfer_in_from_nsc' and  ent_reason <> 'return_def' and ent_reason <> 'relapse' and ent_reason <> 'no_prv_pro' then 1 end))) as d
        from oneTableGeo
        where (reg_date >= '${filter.start_date}' and reg_date <= '${filter.end_date}') and prog_type='otp' and [province_id:1] like '%${filter.province_id}%' and [district_id:1] like '%${filter.district_id}%' and [tehsil_id:1] like '%${filter.tehsil_id}%' and [uc_id:1] like '%${filter.uc_id}%' and [site_id:1] like '%${filter.site_id}%'
        group by age_group, gender`;
        qry.exit = `select (case when age BETWEEN 6 and 23 then '6_23' when age BETWEEN 24 and 59 then '24_59' end) as age_group,
        gender,
        count(case when [exit_reason:1] = 'cured' then 1 end) as e1,
        count(case when [exit_reason:1] = 'death' then 1 end) as e2,
        count(case when [exit_reason:1] = 'defaulter' then 1 end) as e3,
        count(case when [exit_reason:1] = 'non_respondent' then 1 end) as e4,
        (count(case when [exit_reason:1] = 'cured' then 1 end)+ count(case when [exit_reason:1] = 'death' then 1 end) + count(case when [exit_reason:1] = 'defaulter' then 1 end) + count(case when [exit_reason:1] = 'non_respondent' then 1 end)) as e,
        count(case when [exit_reason:1] = 'medical_transfer' then 1 end) as f1,
        count(case when [exit_reason:1] = 'medical_transfer_sc' then 1 end) as f2,
        count(case when [exit_reason:1] <> 'cured' and [exit_reason:1] <> 'death' and [exit_reason:1] <> 'defaulter' and [exit_reason:1] <> 'non_respondent' and [exit_reason:1] <> 'medical_transfer' and [exit_reason:1] <> 'medical_transfer_sc' then 1 end) as f3,
        (count(case when [exit_reason:1] = 'medical_transfer' then 1 end) + count(case when [exit_reason:1] = 'medical_transfer_sc' then 1 end) + count(case when [exit_reason:1] <> 'cured' and [exit_reason:1] <> 'death' and [exit_reason:1] <> 'defaulter' and [exit_reason:1] <> 'non_respondent' and [exit_reason:1] <> 'medical_transfer' and [exit_reason:1] <> 'medical_transfer_sc' then 1 end)) as f,
        ((count(case when [exit_reason:1] = 'medical_transfer' then 1 end) + count(case when [exit_reason:1] = 'medical_transfer_sc' then 1 end) + count(case when [exit_reason:1] <> 'cured' and [exit_reason:1] <> 'death' and [exit_reason:1] <> 'defaulter' and [exit_reason:1] <> 'non_respondent' and [exit_reason:1] <> 'medical_transfer' and [exit_reason:1] <> 'medical_transfer_sc' then 1 end)) +(count(case when [exit_reason:1] = 'cured' then 1 end)+ count(case when [exit_reason:1] = 'death' then 1 end) + count(case when [exit_reason:1] = 'defaulter' then 1 end) + count(case when [exit_reason:1] = 'non_respondent' then 1 end))) as g 
        from oneTableGeo
        where ([exit_date:1] >= '${filter.start_date}' and [exit_date:1] <= '${filter.end_date}') and prog_type = 'otp' and [province_id:1] like '%${filter.province_id}%' and [district_id:1] like '%${filter.district_id}%' and [tehsil_id:1] like '%${filter.tehsil_id}%' and [uc_id:1] like '%${filter.uc_id}%' and [site_id:1] like '%${filter.site_id}%'
        group by age_group, gender`
        return qry;
    }

}


var otpColsSummary = [{
        title: 'Age Group',
        data: '_age'
    },
    {
        title: 'Gender',
        data: null,
        render: function (data, type, row) {
            return data._gender.toUpperCase();
        }
    },
    {
        title: `Total in OTP beginning of the month (A)`,
        data: 'begin.a'
    },
    {
        title: `MUAC < 11.5 cm (B1)`,
        data: 'add.b1'
    },
    {
        title: `ODEMA(B2)`,
        data: 'add.b2'
    },
    {
        title: 'Total New Admission (B=B1+B2)',
        data: 'add.b'
    },
    {
        title: 'Return After Default(C1)',
        data: 'add.c1'
    },
    {
        title: 'Transfer from SC (C2)',
        data: 'add.c2'
    },
    {
        title: 'Other (C3)',
        data: 'add.c3'
    },
    {
        title: 'Relapse After Cure (CC)',
        data: 'add.cc'
    },
    {
        title: 'Total Moved In \n(C=C2+C2+C3)',
        data: 'add.c'
    },
    {
        title: 'Total In (D=A+B+C+CC)',
        data: null,
        render: function (data, type, row) {
            return (data.begin.a + data.add.cc + data.add.c + data.add.b)
        }
    },
    {
        title: 'Cured (E1)',
        data: 'exit.e1'
    },
    {
        title: 'Death (E2)',
        data: 'exit.e2'
    },
    {
        title: 'Defaulter (E3)',
        data: 'exit.e3'
    },
    {
        title: 'No Recovered (E4)',
        data: 'exit.e4'
    },
    {
        title: 'Total Discharged (E=E1+E2+E3+E4)',
        data: 'exit.e'
    },
    {
        title: 'Medical Transfer (F1)',
        data: 'exit.f1'
    },
    {
        title: 'Transfer to In patient (F2)',
        data: 'exit.f2'
    },
    {
        title: 'Other (F3)',
        data: 'exit.f3'
    },
    {
        title: 'Total Moved Out (F=F1+F2+F3)',
        data: 'exit.f'
    },
    {
        title: 'Total Exit (G=E+F)',
        data: 'exit.g'
    },
    {
        title: 'Total In OTP end of the month (H=D-G)',
        data: null,
        render: function (data, type, row) {
            // console.log(data);
            return ((data.begin.a + data.add.cc + data.add.c + data.add.b) - data.exit.g)
        }
    }
]

var scColsSummary = [{
        title: 'Age Group',
        data: 'age_group'
    },
    {
        title: 'Gender',
        data: null,
        render: function (data, type, row) {
            return data.gender.toUpperCase();
        }
    },
    {
        title: `Total in NSC beginning of the month (A)`,
        data: 'a'
    },
    {
        title: `MUAC < 11.5 cm (B1)`,
        data: 'b1'
    },
    {
        title: `ODEMA(B2)`,
        data: 'b2'
    },
    {
        title: 'Total New Admission (B=B1+B2)',
        data: 'b'
    },
    {
        title: 'Relapse After Cure(C1)',
        data: 'c1'
    },
    {
        title: 'Return after LAMA (C2)',
        data: 'c2'
    },
    {
        title: 'Transfer From Ward (C3)',
        data: 'c3'
    },
    {
        title: 'Transfer from OTP (CC)',
        data: 'c4'
    },
    {
        title: 'Other',
        data: 'c5'
    },
    {
        title: 'Total Moved In \n(C=C2+C2+C3+C4+C5)',
        data: 'c'
    },
    {
        title: 'Total In (D=A+B+C)',
        data: null,
        render: function (data, type, row) {
            return (data.a + data.c + data.b)
        }
    },
    {
        title: 'Cured (E1)',
        data: 'e1'
    },
    {
        title: 'Death (E2)',
        data: 'e2'
    },
    {
        title: 'LAMA (E3)',
        data: 'e3'
    },
    {
        title: 'No Recovered (E4)',
        data: 'e4'
    },
    {
        title: 'Total Discharged (E=E1+E2+E3+E4)',
        data: 'e'
    },
    {
        title: 'Medical Transfer (F1)',
        data: 'f1'
    },
    {
        title: 'Transfer to OTP (F2)',
        data: 'f2'
    },
    {
        title: 'Other (F3)',
        data: 'f3'
    },
    {
        title: 'Total Moved Out (F=F1+F2+F3)',
        data: 'f'
    },
    {
        title: 'Total Exit (G=E+F)',
        data: 'g'
    },
    {
        title: 'Total In OTP end of the month (H=D-G)',
        data: null,
        render: function (data, type, row) {
            return ((data.a + data.c + data.b) - data.g)
        }
    }
]

function otpSummaryDataTable(table_id, data, filter, cols) {
    if ($.fn.DataTable.isDataTable('#' + table_id)) {
        $('#' + table_id).DataTable().destroy();
    }
    $('#' + table_id).empty();
    $('#' + table_id).DataTable({
        order: [
            [0, 'desc'],
            [1, 'asc']
        ],
        data,
        dom: 'Bfrtip',
        buttons: [
            'copy', {
                extend: 'csv',
                title: `${filter.prog_type.toUpperCase()} Admission and Exit Report_${Date.now()}`
            }, {
                extend: 'excel',
                title: `${filter.prog_type.toUpperCase()} Admission and Exit Report_${Date.now()}`
            }
        ],
        "scrollX": true,
        columns: cols
    });
}

const singleTables = (addTableEl, exitTableEl, add, exit) => {
    if ($.fn.DataTable.isDataTable('#' + addTableEl)) {
        $('#' + addTableEl).DataTable().destroy();
    }
    $('#' + addTableEl + 'tbody').empty();
    $('#' + addTableEl).DataTable({
        data: add,
        "paging": false,
        "scrollY": 380,
        "scrollX": true,
        columns: [{
                title: 'Province',
                data: 'province'
            },
            {
                title: 'District',
                data: 'district_name'
            },
            {
                title: 'Tehsil',
                data: 'tehsil_name'
            },
            {
                title: 'UC',
                data: 'uc_name'
            },
            {
                title: 'Site Name',
                data: 'site_name'
            },
            {
                title: 'Registration Date',
                data: 'reg_date'
            },
            {
                title: 'Registration ID',
                data: null,
                render: function (data, type, row) {
                    return data.reg_id.toString();
                }
            },
            {
                title: 'Name',
                data: 'p_name'
            },
            {
                title: 'Age',
                data: 'age'
            },
            {
                title: 'Gender',
                data: 'gender'
            },
            {
                title: 'Father/Husband Name',
                data: 'f_or_h_name'
            },
            {
                title: 'CNIC',
                data: 'cnic'
            },
            {
                title: 'Contact Number',
                data: 'cnt_number'
            },
            {
                title: 'Address',
                data: 'address'
            },
            {
                title: 'Entry Reason',
                // data: '',
                data: null,
                render: function (data, type, row) {
                    if (data.ent_reason == 'no_prv_pro') {
                        return 'new'
                    } else {
                        return data.ent_reason
                    }
                }
            },
            {
                title: 'Referral Type',
                data: 'ref_type'
            }, {
                title: 'Referer Details',
                data: 'ref_by_details'
            },
            {
                title: 'Oedema',
                data: 'oedema'
            },
            {
                title: 'MUAC',
                data: 'muac'
            },
            {
                title: 'Weight',
                data: 'weight'
            },
            {
                title: 'Height',
                data: 'height'
            },
            {
                title: 'Z Score',
                data: 'z_score'
            },
            {
                title: 'Diarrhoea',
                data: 'diarrhoea'
            },
            {
                title: 'vomiting',
                data: 'vomiting'
            },
            {
                title: 'cough',
                data: 'cough'
            },
            {
                title: 'Appetite',
                data: 'appetite'
            },
            {
                title: 'Daily Stool',
                data: 'daily_stool'
            },
            {
                title: 'Urine',
                data: 'pass_urine'
            },
            {
                title: 'Breast Fed',
                data: 'b_Feeding'
            },
            {
                title: 'Exit Reason',
                data: null,
                render: function (data, type, row) {
                    return data.exit_reason ? data.exit_reason : 'ongoing';
                }
            }
        ]
    })

    if ($.fn.DataTable.isDataTable('#' + exitTableEl)) {
        $('#' + exitTableEl).DataTable().destroy();
    }
    $('#' + exitTableEl + 'tbody').empty();
    $('#' + exitTableEl).DataTable({
        data: exit,
        "paging": false,
        "scrollY": 380,
        "scrollX": true,
        columns: [{
                title: 'Province',
                data: 'province'
            },
            {
                title: 'District',
                data: 'district_name'
            },
            {
                title: 'Tehsil',
                data: 'tehsil_name'
            },
            {
                title: 'UC',
                data: 'uc_name'
            },
            {
                title: 'Site Name',
                data: 'site_name'
            },
            {
                title: 'Village',
                data: 'site_village'
            },
            {
                title: 'Registration Date',
                data: 'reg_date'
            },
            {
                title: 'Exit Date',
                data: 'exit_date:1'
            },
            {
                title: 'Registration ID',
                data: 'reg_id'
            },
            {
                title: 'Name',
                data: 'p_name'
            },
            {
                title: 'Age',
                data: 'age'
            },
            {
                title: 'Gender',
                data: 'gender'
            },
            {
                title: 'Father/Husband Name',
                data: 'f_or_h_name'
            },
            {
                title: 'Address',
                data: 'address'
            },
            {
                title: 'Exit MUAC',
                data: 'exit_muac:1'
            },
            {
                title: 'Exit Weight',
                data: 'exit_weight:1'
            },
            {
                title: 'Exit Reason',
                data: 'exit_reason:1'
            },
            {
                title: 'Total Followups',
                data: 'total_followups'
            },
            {
                title: 'Total Days',
                data: 'days_in_program'
            }
        ]
    })
}

module.exports.OTPReport = async function () {

    var defProg = JSON.parse(window.localStorage.getItem('defaults'))['defProg']
    await setFormDefualts('ddProgramType','ddProvince','ddDistrict','ddTehsil')
    await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse',defProg ) 
    // drop down selections
    $(async function () {
        await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse',defProg ) 
        $('#ddHealthHouse').on('change', function () {

            var h_id = $(this).val();
            ipc.send("getVillage", h_id);
            ipc.on("haveVillage", (evt, _villages) => {
                $("#ddVillageName")
                    .children("option:not(:first)")
                    .remove();
                villListener(_villages);

            });
            ipc.send('getHealthHouseType', h_id)
            ipc.on('hhType', function (evt, hh) {
                hhTypeListener(h_id, hh);

            })
        })
    });

    // Triggers elements
    var showData = $('#showData')
    var exportData = $('#exportData')
    // my filters
    $('#otpReportFilerForm').on('submit', function (e) {
        e.preventDefault();
    })
    var ddReportType = $('#ddProgramType');

    if (defProg == 'sc') {
        $('#nsc_report').css('display', 'block')
        $('#otp_report').css('display', 'none')

    } else if (defProg == 'otp') {
        $('#nsc_report').css('display', 'none')
        $('#otp_report').css('display', 'block')
    }

    ddReportType.on('change', async function (e) {
        var val = $(this).val()
        await updatGeoElonChange('ddProvince','ddDistrict','ddTehsil', 'ddUC','ddHealthHouse',val ) 
        // console.log($(this).val())
        if (val == 'sc') {
            $('#nsc_report').css('display', 'block')
            $('#otp_report').css('display', 'none')

        } else if (val == 'otp') {
            $('#nsc_report').css('display', 'none')
            $('#otp_report').css('display', 'block')
        }
    })
    showData.on("click", async function (e) {
        e.preventDefault();
        var filter = prepareQry();
        var _qry = qryStringPrepare(filter);

        var d1 = new Date(filter.start_date);
        var d2 = new Date(filter.end_date);
        if (!filter.prog_type || !filter.start_date || !filter.end_date) {
            if (!filter.prog_type) {
                alert('Please select Program Type')
            } else if (!filter.start_date) {
                alert('Please select Start Date')
            } else if (!filter.end_date) {
                alert('Please select End Date')
            }
        } else if (d2 < d1) {
            alert('End date must by greater than Start date')
        } else {
            // console.log(knex.raw(_qry).toString())

            try {
                Swal.fire({
                    title: 'Please wait',
                    html: `<div class="d-flex justify-content-center">
                    <div class="spinner-border" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                  </div>`,
                    showCloseButton: false
                })
                var Add = await knex('oneTableGeo')
                    .whereBetween("reg_date", [filter.start_date, filter.end_date])
                    .where('site_id:1', 'like', `%${filter.site_id}%`)
                    .where('province_id:1', 'like', `%${filter.province_id}%`)
                    .where('district_id:1', 'like', `%${filter.district_id}%`)
                    .where('tehsil_id:1', 'like', `%${filter.tehsil_id}%`)
                    .where('uc_id:1', 'like', `%${filter.uc_id}%`)
                    .where({
                        prog_type: filter.prog_type
                    })
                var Exit = await knex('oneTableGeo')
                    .whereBetween("exit_date:1", [filter.start_date, filter.end_date])
                    .where('site_id:1', 'like', `%${filter.site_id}%`)
                    .where('province_id:1', 'like', `%${filter.province_id}%`)
                    .where('district_id:1', 'like', `%${filter.district_id}%`)
                    .where('tehsil_id:1', 'like', `%${filter.tehsil_id}%`)
                    .where('uc_id:1', 'like', `%${filter.uc_id}%`)
                    .where({
                        prog_type: filter.prog_type
                    })
                // var _cols = filter.prog_type == 'sc' ? scColsSummary : otpColsSummary;
                // otpSummaryDataTable('otpSumamry', summary, filter, _cols);
                singleTables('addTableReport', 'exitTableReport', Add, Exit)
                if ($('#ddProgramType').val() == 'otp') {
                    var _data = await otpSumReport(_qry)
                    myPushData(_data);
                } else if ($('#ddProgramType').val() == 'sc') {
                    $(`.cls`).empty();
                    var dataNSCReport = await nscSumReport(_qry)
                    // console.log(dataNSCReport)
                    await myPushDataNSC(dataNSCReport);
                }
                Swal.close();

            } catch (error) {
                console.log(error);
                alert('Report fetching error, please contact administrator with error code: Report-DB000')
            }
        }


    });


    var XLSX = require("xlsx");
    var electron = require("electron").remote;

    var export_xlsx = (function () {
        // var HTMLOUT = document.getElementById('htmlout');
        var XTENSION = "xls|xlsx|xlsm|xlsb|xml|csv|txt|dif|sylk|slk|prn|ods|fods|htm|html".split(
            "|"
        );
        return function () {
            var addExitReport = XLSX.utils.book_new();
            var summaryReport;
            if ($('#ddProgramType').val() == 'sc') {
                summaryReport = XLSX.utils.table_to_sheet(document.getElementById('NSCMonthly'));
            } else if ($('#ddProgramType').val() == 'otp') {
                summaryReport = XLSX.utils.table_to_sheet(document.getElementById('addmisionReport'));
            }

            XLSX.utils.book_append_sheet(addExitReport, summaryReport, "Summary")
            /* convert table 'table2' to worksheet named "Sheet2" */
            var Admissions = XLSX.utils.table_to_sheet(document.getElementById("addTableReport"));
            XLSX.utils.book_append_sheet(addExitReport, Admissions, "Admissions");
            var Exits = XLSX.utils.table_to_sheet(document.getElementById("exitTableReport"));
            XLSX.utils.book_append_sheet(addExitReport, Exits, "Exits");
            // var wb = XLSX.utils.table_to_book(HTMLOUT);
            // console.log(addExitReport.Workbook.Names)
            var o = electron.dialog.showSaveDialog({
                title: "Save file as",
                filters: [{
                    name: "Spreadsheets",
                    extensions: XTENSION
                }]
            });
            // console.log(o);
            XLSX.writeFile(addExitReport, o);
            electron.dialog.showMessageBox({
                message: "Exported data to " + o,
                buttons: ["OK"]
            });
        };
    })();
    void export_xlsx;


    exportData.on('click', function () {
        export_xlsx();
    });


}

const SummaryArray = async function (data) {
    let _data = [{
            name: "cat_623_m",
            _gender: `male`,
            _age: '6-23 Months'
        },
        {
            name: "cat_623_f",
            _gender: `female`,
            _age: '6-23 Months'
        },
        {
            name: "cat_2459_m",
            _gender: `male`,
            _age: '24-59 Months'
        },
        {
            name: "cat_2459_f",
            _gender: `female`,
            _age: '24-59 Months'
        }
    ]

    for (_x in _data) {

        //Pushing add;
        if (!data.add.filter(function (el) {
                // console.log(el)
                if (el.age_group == _data[_x]._age && el.gender == _data[_x]._gender) {
                    _data[_x].add = el;
                    return true
                } else {
                    return false
                }
            })) {
            var add = {
                b: 0,
                b1: 0,
                b2: 0,
                c: 0,
                c1: 0,
                c2: 0,
                c3: 0,
                cc: 0,
                d: 0,

            }
            _data[_x].add = add;
        }
        // Pushing begin;
        if (!data.begin.filter(function (el) {
                if (el.age_group == _data[_x]._age && el.gender == _data[_x]._gender) {
                    _data[_x].begin = el;
                    return true
                } else {
                    return false
                }
            })) {
            var begin = {
                b: 0
            }
            _data[_x].begin = begin;
        }
        //Pushing exit;
        if (!data.exit.filter(function (el) {
                if (el.age_group == _data[_x]._age && el.gender == _data[_x]._gender) {
                    _data[_x].exit = el;
                    return true
                } else {
                    return false
                }
            })) {
            var exit = {
                b: 0,
                e: 0,
                e1: 0,
                e2: 0,
                e3: 0,
                e4: 0,
                f: 0,
                f1: 0,
                f2: 0,
                f3: 0,
                g: 0
            }
            _data[_x].exit = exit

        }
    }

    // console.log(_data)
    return _data

}

const otpFooterCallback = function (row, data, start, end, display) {
    var api = this.api();

    api.columns('.sum', {
        page: 'current'
    }).every(function () {
        // console.log(this.data())
        var sum = this
            .data()
            .reduce(function (a, b) {
                var x = parseFloat(a) || 0;
                var y = parseFloat(b) || 0;
                return x + y;
            }, 0);
        // console.log(sum); //alert(sum);
        $(this.footer()).html(sum);
    });
}

async function nscSumReport(qry) {

    try {
        var begin = await knex.raw(qry.begin)
        var nscAdd = await knex.raw(qry.add)
        var nscExit = await knex.raw(qry.exit)
        return {
            begin,
            nscAdd,
            nscExit
        }

    } catch (error) {
        console.log(error)
        return [];
    }
}
async function otpSumReport(qry) {

    try {
        var last = await knex.raw(qry.begin)
        var add = await knex.raw(qry.add)
        var exit = await knex.raw(qry.exit)
        return {
            add,
            last,
            exit
        }

    } catch (error) {
        console.log(error)
        return [];
    }
}

function myPushData(x) {
    // console.log(x)
    var a_male_623 = (x.last.filter(el => el.age_group == '6_23' && el.gender == 'male').length > 0) ? x.last.filter(el => el.age_group == '6_23' && el.gender == 'male')[0].a : 0;
    var a_female_623 = (x.last.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0) ? x.last.filter(el => el.age_group == "6_23" && el.gender == "female")[0].a : 0;
    var a_male_24_59 = (x.last.filter(el => el.age_group == '24_59' && el.gender == 'male').length > 0) ? x.last.filter(el => el.age_group == '24_59' && el.gender == 'male')[0].a : 0;
    var a_female_24_59 = (x.last.filter(el => el.age_group == '24_59' && el.gender == 'female').length > 0) ? x.last.filter(el => el.age_group == '24_59' && el.gender == 'female')[0].a : 0;
    var total_a = a_male_623 + a_female_623 + a_male_24_59 + a_female_24_59;
    $('#6_23-male-a').empty()
    $('#6_23-male-a').text(a_male_623)
    $('#6_23-female-a').empty()
    $('#6_23-female-a').text(a_female_623)
    $('#24_59-male-a').empty()
    $('#24_59-male-a').text(a_male_24_59)
    $('#24_59-female-a').empty()
    $('#24_59-female-a').text(a_female_24_59)
    $('#total-a').empty();
    $('#total-a').text(total_a);
    var b1_male_623 = (x.add.filter(el => el.age_group == '6_23' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '6_23' && el.gender == 'male')[0].b1 : 0;
    var b1_female_623 = (x.add.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0) ? x.add.filter(el => el.age_group == "6_23" && el.gender == "female")[0].b1 : 0;
    var b1_male_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'male')[0].b1 : 0;
    var b1_female_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'female').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'female')[0].b1 : 0;
    var total_b1 = b1_male_623 + b1_female_623 + b1_male_24_59 + b1_female_24_59;
    $("#6_23-male-b1").empty();
    $("#6_23-male-b1").text(b1_male_623);
    $("#6_23-female-b1").empty();
    $("#6_23-female-b1").text(b1_female_623);
    $("#24_59-male-b1").empty();
    $("#24_59-male-b1").text(b1_male_24_59);
    $("#24_59-female-b1").empty();
    $("#24_59-female-b1").text(b1_female_24_59);
    $("#total-b1").empty();
    $("#total-b1").text(total_b1);
    var b2_male_623 = (x.add.filter(el => el.age_group == '6_23' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '6_23' && el.gender == 'male')[0].b2 : 0;
    var b2_female_623 = (x.add.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0) ? x.add.filter(el => el.age_group == "6_23" && el.gender == "female")[0].b2 : 0;
    var b2_male_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'male')[0].b2 : 0;
    var b2_female_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'female').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'female')[0].b2 : 0;
    var total_b2 = b2_male_623 + b2_female_623 + b2_male_24_59 + b2_female_24_59;
    $("#6_23-male-b2").empty();
    $("#6_23-male-b2").text(b2_male_623);
    $("#6_23-female-b2").empty();
    $("#6_23-female-b2").text(b2_female_623);
    $("#24_59-male-b2").empty();
    $("#24_59-male-b2").text(b2_male_24_59);
    $("#24_59-female-b2").empty();
    $("#24_59-female-b2").text(b2_female_24_59);
    $("#total-b2").empty();
    $("#total-b2").text(total_b2);
    var b_male_623 = (x.add.filter(el => el.age_group == '6_23' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '6_23' && el.gender == 'male')[0].b : 0;
    var b_female_623 = (x.add.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0) ? x.add.filter(el => el.age_group == "6_23" && el.gender == "female")[0].b : 0;
    var b_male_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'male')[0].b : 0;
    var b_female_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'female').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'female')[0].b : 0;
    var total_b = b_male_623 + b_female_623 + b_male_24_59 + b_female_24_59;
    $("#6_23-male-b").empty();
    $("#6_23-male-b").text(b_male_623);
    $("#6_23-female-b").empty();
    $("#6_23-female-b").text(b_female_623);
    $("#24_59-male-b").empty();
    $("#24_59-male-b").text(b_male_24_59);
    $("#24_59-female-b").empty();
    $("#24_59-female-b").text(b_female_24_59);
    $("#total-b").empty();
    $("#total-b").text(total_b);
    var c1_male_623 = (x.add.filter(el => el.age_group == '6_23' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '6_23' && el.gender == 'male')[0].c1 : 0;
    var c1_female_623 = (x.add.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0) ? x.add.filter(el => el.age_group == "6_23" && el.gender == "female")[0].c1 : 0;
    var c1_male_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'male')[0].c1 : 0;
    var c1_female_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'female').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'female')[0].c1 : 0;
    var total_c1 = c1_male_623 + c1_female_623 + c1_male_24_59 + c1_female_24_59;
    $("#6_23-male-c1").empty();
    $("#6_23-male-c1").text(c1_male_623);
    $("#6_23-female-c1").empty();
    $("#6_23-female-c1").text(c1_female_623);
    $("#24_59-male-c1").empty();
    $("#24_59-male-c1").text(c1_male_24_59);
    $("#24_59-female-c1").empty();
    $("#24_59-female-c1").text(c1_female_24_59);
    $("#total-c1").empty();
    $("#total-c1").text(total_c1);
    var c2_male_623 = (x.add.filter(el => el.age_group == '6_23' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '6_23' && el.gender == 'male')[0].c2 : 0;
    var c2_female_623 = (x.add.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0) ? x.add.filter(el => el.age_group == "6_23" && el.gender == "female")[0].c2 : 0;
    var c2_male_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'male')[0].c2 : 0;
    var c2_female_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'female').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'female')[0].c2 : 0;
    var total_c2 = c2_male_623 + c2_female_623 + c2_male_24_59 + c2_female_24_59;
    $("#6_23-male-c2").empty();
    $("#6_23-male-c2").text(c2_male_623);
    $("#6_23-female-c2").empty();
    $("#6_23-female-c2").text(c2_female_623);
    $("#24_59-male-c2").empty();
    $("#24_59-male-c2").text(c2_male_24_59);
    $("#24_59-female-c2").empty();
    $("#24_59-female-c2").text(c2_female_24_59);
    $("#total-c2").empty();
    $("#total-c2").text(total_c2);
    var c3_male_623 = (x.add.filter(el => el.age_group == '6_23' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '6_23' && el.gender == 'male')[0].c3 : 0;
    var c3_female_623 = (x.add.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0) ? x.add.filter(el => el.age_group == "6_23" && el.gender == "female")[0].c3 : 0;
    var c3_male_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'male')[0].c3 : 0;
    var c3_female_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'female').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'female')[0].c3 : 0;
    var total_c3 = c3_male_623 + c3_female_623 + c3_male_24_59 + c3_female_24_59;
    $("#6_23-male-c3").empty();
    $("#6_23-male-c3").text(c3_male_623);
    $("#6_23-female-c3").empty();
    $("#6_23-female-c3").text(c3_female_623);
    $("#24_59-male-c3").empty();
    $("#24_59-male-c3").text(c3_male_24_59);
    $("#24_59-female-c3").empty();
    $("#24_59-female-c3").text(c3_female_24_59);
    $("#total-c3").empty();
    $("#total-c3").text(total_c3);
    var cc_male_623 = (x.add.filter(el => el.age_group == '6_23' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '6_23' && el.gender == 'male')[0].cc : 0;
    var cc_female_623 = (x.add.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0) ? x.add.filter(el => el.age_group == "6_23" && el.gender == "female")[0].cc : 0;
    var cc_male_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'male')[0].cc : 0;
    var cc_female_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'female').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'female')[0].cc : 0;
    var total_cc = cc_male_623 + cc_female_623 + cc_male_24_59 + cc_female_24_59;
    $("#6_23-male-cc").empty();
    $("#6_23-male-cc").text(cc_male_623);
    $("#6_23-female-cc").empty();
    $("#6_23-female-cc").text(cc_female_623);
    $("#24_59-male-cc").empty();
    $("#24_59-male-cc").text(cc_male_24_59);
    $("#24_59-female-cc").empty();
    $("#24_59-female-cc").text(cc_female_24_59);
    $("#total-cc").empty();
    $("#total-cc").text(total_cc);
    var c_male_623 = (x.add.filter(el => el.age_group == '6_23' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '6_23' && el.gender == 'male')[0].c : 0;
    var c_female_623 = (x.add.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0) ? x.add.filter(el => el.age_group == "6_23" && el.gender == "female")[0].c : 0;
    var c_male_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'male')[0].c : 0;
    var c_female_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'female').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'female')[0].c : 0;
    var total_c = c_male_623 + c_female_623 + c_male_24_59 + c_female_24_59;
    $("#6_23-male-c").empty();
    $("#6_23-male-c").text(c_male_623);
    $("#6_23-female-c").empty();
    $("#6_23-female-c").text(c_female_623);
    $("#24_59-male-c").empty();
    $("#24_59-male-c").text(c_male_24_59);
    $("#24_59-female-c").empty();
    $("#24_59-female-c").text(c_female_24_59);
    $("#total-c").empty();
    $("#total-c").text(total_c);
    var d_male_623 = (x.add.filter(el => el.age_group == '6_23' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '6_23' && el.gender == 'male')[0].d : 0;
    var d_female_623 = (x.add.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0) ? x.add.filter(el => el.age_group == "6_23" && el.gender == "female")[0].d : 0;
    var d_male_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'male').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'male')[0].d : 0;
    var d_female_24_59 = (x.add.filter(el => el.age_group == '24_59' && el.gender == 'female').length > 0) ? x.add.filter(el => el.age_group == '24_59' && el.gender == 'female')[0].d : 0;
    d_female_623 = d_female_623 + a_female_623;
    d_male_623 = d_male_623 + a_male_623;
    d_male_24_59 = d_male_24_59 + a_male_24_59;
    d_female_24_59 = d_female_24_59 + a_female_24_59;
    var total_d = d_male_623 + d_female_623 + d_male_24_59 + d_female_24_59;
    $("#6_23-male-d").empty();
    $("#6_23-male-d").text(d_male_623);
    $("#6_23-female-d").empty();
    $("#6_23-female-d").text(d_female_623);
    $("#24_59-male-d").empty();
    $("#24_59-male-d").text(d_male_24_59);
    $("#24_59-female-d").empty();
    $("#24_59-female-d").text(d_female_24_59);
    $("#total-d").empty();
    $("#total-d").text(total_d);

    var e1_male_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "male")[0].e1 : 0;
    var e1_female_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "female")[0].e1 : 0;
    var e1_male_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "male")[0].e1 : 0;
    var e1_female_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "female")[0].e1 : 0;
    var total_e1 = e1_male_623 + e1_female_623 + e1_male_24_59 + e1_female_24_59;
    $("#6_23-male-e1").empty();
    $("#6_23-male-e1").text(e1_male_623);
    $("#6_23-female-e1").empty();
    $("#6_23-female-e1").text(e1_female_623);
    $("#24_59-male-e1").empty();
    $("#24_59-male-e1").text(e1_male_24_59);
    $("#24_59-female-e1").empty();
    $("#24_59-female-e1").text(e1_female_24_59);
    $("#total-e1").empty();
    $("#total-e1").text(total_e1);
    var e2_male_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "male")[0].e2 : 0;
    var e2_female_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "female")[0].e2 : 0;
    var e2_male_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "male")[0].e2 : 0;
    var e2_female_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "female")[0].e2 : 0;
    var total_e2 = e2_male_623 + e2_female_623 + e2_male_24_59 + e2_female_24_59;
    $("#6_23-male-e2").empty();
    $("#6_23-male-e2").text(e2_male_623);
    $("#6_23-female-e2").empty();
    $("#6_23-female-e2").text(e2_female_623);
    $("#24_59-male-e2").empty();
    $("#24_59-male-e2").text(e2_male_24_59);
    $("#24_59-female-e2").empty();
    $("#24_59-female-e2").text(e2_female_24_59);
    $("#total-e2").empty();
    $("#total-e2").text(total_e2);
    var e3_male_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "male")[0].e3 : 0;
    var e3_female_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "female")[0].e3 : 0;
    var e3_male_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "male")[0].e3 : 0;
    var e3_female_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "female")[0].e3 : 0;
    var total_e3 = e3_male_623 + e3_female_623 + e3_male_24_59 + e3_female_24_59;
    $("#6_23-male-e3").empty();
    $("#6_23-male-e3").text(e3_male_623);
    $("#6_23-female-e3").empty();
    $("#6_23-female-e3").text(e3_female_623);
    $("#24_59-male-e3").empty();
    $("#24_59-male-e3").text(e3_male_24_59);
    $("#24_59-female-e3").empty();
    $("#24_59-female-e3").text(e3_female_24_59);
    $("#total-e3").empty();
    $("#total-e3").text(total_e3);
    var e4_male_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "male")[0].e4 : 0;
    var e4_female_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "female")[0].e4 : 0;
    var e4_male_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "male")[0].e4 : 0;
    var e4_female_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "female")[0].e4 : 0;
    var total_e4 = e4_male_623 + e4_female_623 + e4_male_24_59 + e4_female_24_59;
    $("#6_23-male-e4").empty();
    $("#6_23-male-e4").text(e4_male_623);
    $("#6_23-female-e4").empty();
    $("#6_23-female-e4").text(e4_female_623);
    $("#24_59-male-e4").empty();
    $("#24_59-male-e4").text(e4_male_24_59);
    $("#24_59-female-e4").empty();
    $("#24_59-female-e4").text(e4_female_24_59);
    $("#total-e4").empty();
    $("#total-e4").text(total_e4);
    var e_male_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "male")[0].e : 0;
    var e_female_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "female")[0].e : 0;
    var e_male_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "male")[0].e : 0;
    var e_female_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "female")[0].e : 0;
    var total_e = e_male_623 + e_female_623 + e_male_24_59 + e_female_24_59;
    $("#6_23-male-e").empty();
    $("#6_23-male-e").text(e_male_623);
    $("#6_23-female-e").empty();
    $("#6_23-female-e").text(e_female_623);
    $("#24_59-male-e").empty();
    $("#24_59-male-e").text(e_male_24_59);
    $("#24_59-female-e").empty();
    $("#24_59-female-e").text(e_female_24_59);
    $("#total-e").empty();
    $("#total-e").text(total_e);
    var f1_male_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "male")[0].f1 : 0;
    var f1_female_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "female")[0].f1 : 0;
    var f1_male_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "male")[0].f1 : 0;
    var f1_female_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "female")[0].f1 : 0;
    var total_f1 = f1_male_623 + f1_female_623 + f1_male_24_59 + f1_female_24_59;
    $("#6_23-male-f1").empty();
    $("#6_23-male-f1").text(f1_male_623);
    $("#6_23-female-f1").empty();
    $("#6_23-female-f1").text(f1_female_623);
    $("#24_59-male-f1").empty();
    $("#24_59-male-f1").text(f1_male_24_59);
    $("#24_59-female-f1").empty();
    $("#24_59-female-f1").text(f1_female_24_59);
    $("#total-f1").empty();
    $("#total-f1").text(total_f1);
    var f2_male_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "male")[0].f2 : 0;
    var f2_female_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "female")[0].f2 : 0;
    var f2_male_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "male")[0].f2 : 0;
    var f2_female_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "female")[0].f2 : 0;
    var total_f2 = f2_male_623 + f2_female_623 + f2_male_24_59 + f2_female_24_59;
    $("#6_23-male-f2").empty();
    $("#6_23-male-f2").text(f2_male_623);
    $("#6_23-female-f2").empty();
    $("#6_23-female-f2").text(f2_female_623);
    $("#24_59-male-f2").empty();
    $("#24_59-male-f2").text(f2_male_24_59);
    $("#24_59-female-f2").empty();
    $("#24_59-female-f2").text(f2_female_24_59);
    $("#total-f2").empty();
    $("#total-f2").text(total_f2);
    var f3_male_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "male")[0].f3 : 0;
    var f3_female_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "female")[0].f3 : 0;
    var f3_male_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "male")[0].f3 : 0;
    var f3_female_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "female")[0].f3 : 0;
    var total_f3 = f3_male_623 + f3_female_623 + f3_male_24_59 + f3_female_24_59;
    $("#6_23-male-f3").empty();
    $("#6_23-male-f3").text(f3_male_623);
    $("#6_23-female-f3").empty();
    $("#6_23-female-f3").text(f3_female_623);
    $("#24_59-male-f3").empty();
    $("#24_59-male-f3").text(f3_male_24_59);
    $("#24_59-female-f3").empty();
    $("#24_59-female-f3").text(f3_female_24_59);
    $("#total-f3").empty();
    $("#total-f3").text(total_f3);
    var f_male_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "male")[0].f : 0;
    var f_female_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "female")[0].f : 0;
    var f_male_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "male")[0].f : 0;
    var f_female_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "female")[0].f : 0;
    var total_f = f_male_623 + f_female_623 + f_male_24_59 + f_female_24_59;
    $("#6_23-male-f").empty();
    $("#6_23-male-f").text(f_male_623);
    $("#6_23-female-f").empty();
    $("#6_23-female-f").text(f_female_623);
    $("#24_59-male-f").empty();
    $("#24_59-male-f").text(f_male_24_59);
    $("#24_59-female-f").empty();
    $("#24_59-female-f").text(f_female_24_59);
    $("#total-f").empty();
    $("#total-f").text(total_f);

    var g_male_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "male")[0].g : 0;
    var g_female_623 = x.exit.filter(el => el.age_group == "6_23" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "6_23" && el.gender == "female")[0].g : 0;
    var g_male_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "male").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "male")[0].g : 0;
    var g_female_24_59 = x.exit.filter(el => el.age_group == "24_59" && el.gender == "female").length > 0 ? x.exit.filter(el => el.age_group == "24_59" && el.gender == "female")[0].g : 0;
    var total_g = g_male_623 + g_female_623 + g_male_24_59 + g_female_24_59;
    $("#6_23-male-g").empty();
    $("#6_23-male-g").text(g_male_623);
    $("#6_23-female-g").empty();
    $("#6_23-female-g").text(g_female_623);
    $("#24_59-male-g").empty();
    $("#24_59-male-g").text(g_male_24_59);
    $("#24_59-female-g").empty();
    $("#24_59-female-g").text(g_female_24_59);
    $("#total-g").empty();
    $("#total-g").text(total_g);

    var h_male_623 = (d_male_623 - g_male_623) ? (d_male_623 - g_male_623) : 0;
    var h_female_623 = (d_female_623 - g_female_623) ? (d_female_623 - g_female_623) : 0;
    var h_male_24_59 = d_male_24_59 - g_male_24_59;
    var h_female_24_59 = d_female_24_59 - g_female_24_59;
    var total_h = h_male_623 + h_female_623 + h_male_24_59 + h_female_24_59;
    $("#6_23-male-h").empty();
    $("#6_23-male-h").text(h_male_623);
    $("#6_23-female-h").empty();
    $("#6_23-female-h").text(h_female_623);
    $("#24_59-male-h").empty();
    $("#24_59-male-h").text(h_male_24_59);
    $("#24_59-female-h").empty();
    $("#24_59-female-h").text(h_female_24_59);
    $("#total-h").empty();
    $("#total-h").text(total_h);

}

async function pushLineData(group, data) {
    var MyKeys = Object.keys(data)

    for (el of MyKeys) {
        var elId = group + el;
        $(`#${elId}`).empty();
        $(`#${elId}`).text(data[el] ? data[el] : 0)
        // console.log(elId)
    }

}

async function pushLineDataCatLoop(data) {
    // console.log(data)
    if (data.length) {
        for (dataum of data) {
            if (dataum.age_group == '06' && dataum.gender == 'male') {
                // console.log(dataum)
                await pushLineData('06_m_', dataum)
            } else if (dataum.age_group == '06' && dataum.gender == 'female') {
                // console.log(dataum)
                await pushLineData('06_f_', dataum)
            } else if (dataum.age_group == '623' && dataum.gender == 'male') {
                // console.log(dataum)
                await pushLineData('623_m_', dataum)
            } else if (dataum.age_group == '623' && dataum.gender == 'female') {
                // console.log(dataum)
                await pushLineData('623_f_', dataum)
            } else if (dataum.age_group == '2459' && dataum.gender == 'male') {
                // console.log(dataum)
                await pushLineData('2459_m_', dataum)
            } else if (dataum.age_group == '2459' && dataum.gender == 'female') {
                // console.log(dataum)
                await pushLineData('2459_f_', dataum)
            }

            var makeZero = $('.nscSum');
            for (el of makeZero) {
                if ($(el).text() == '') {
                    $(el).text(0);
                }
            }
        }
        await ageGenderGroup();
    }

}
async function ageGenderGroup() {

    $('#06_m_d').text(
        function () {
            return parseInt($('#06_m_a').text()) + parseInt($('#06_m_b').text()) + parseInt($('#06_m_c').text()) ? parseInt($('#06_m_a').text()) + parseInt($('#06_m_b').text()) + parseInt($('#06_m_c').text()) : 0
        })
    $('#06_f_d').text(
        function () {
            return parseInt($('#06_f_a').text()) + parseInt($('#06_f_b').text()) + parseInt($('#06_f_c').text()) ? parseInt($('#06_f_a').text()) + parseInt($('#06_f_b').text()) + parseInt($('#06_f_c').text()) : 0
        })
    $('#623_m_d').text(
        function () {
            return parseInt($('#623_m_a').text()) + parseInt($('#623_m_b').text()) + parseInt($('#623_m_c').text()) ? parseInt($('#623_m_a').text()) + parseInt($('#623_m_b').text()) + parseInt($('#623_m_c').text()) : 0
        })
    $('#623_f_d').text(
        function () {
            return parseInt($('#623_f_a').text()) + parseInt($('#623_f_b').text()) + parseInt($('#623_f_c').text()) ? parseInt($('#623_f_a').text()) + parseInt($('#623_f_b').text()) + parseInt($('#623_f_c').text()) : 0
        })
    $('#2459_m_d').text(
        function () {
            return parseInt($('#2459_m_a').text()) + parseInt($('#2459_m_b').text()) + parseInt($('#2459_m_c').text()) ? parseInt($('#2459_m_a').text()) + parseInt($('#2459_m_b').text()) + parseInt($('#2459_m_c').text()) : 0
        })
    $('#2459_f_d').text(
        function () {
            return parseInt($('#2459_f_b').text()) + parseInt($('#2459_f_b').text()) + parseInt($('#2459_f_c').text()) ? parseInt($('#2459_f_b').text()) + parseInt($('#2459_f_b').text()) + parseInt($('#2459_f_c').text()) : 0
        })

    $('#06_m_h').text(
        function () {
            return parseInt($('#06_m_d').text()) - parseInt($('#06_m_g').text()) ? parseInt($('#06_m_d').text()) - parseInt($('#06_m_g').text()) : 0
        })
    $('#06_f_h').text(
        function () {
            return parseInt($('#06_f_d').text()) - parseInt($('#06_f_g').text()) ? parseInt($('#06_f_d').text()) - parseInt($('#06_f_g').text()) : 0
        })
    $('#623_m_h').text(
        function () {
            return parseInt($('#623_m_d').text()) - parseInt($('#623_m_g').text()) ? parseInt($('#623_m_d').text()) - parseInt($('#623_m_g').text()) : 0
        })
    $('#623_f_h').text(
        function () {
            return parseInt($('#623_f_d').text()) - parseInt($('#623_f_g').text()) ? parseInt($('#623_f_d').text()) - parseInt($('#623_f_g').text()) : 0
        })
    $('#2459_m_h').text(
        function () {
            return parseInt($('#2459_m_d').text()) + parseInt($('#2459_m_g').text()) ? parseInt($('#2459_m_d').text()) - parseInt($('#2459_m_g').text()) : 0
        })
    $('#2459_f_h').text(
        function () {
            return parseInt($('#2459_f_d').text()) - parseInt($('#2459_f_g').text()) ? parseInt($('#2459_f_d').text()) - parseInt($('#2459_f_g').text()) : 0
        })

    var types = ['06_m_', '06_f_', '623_m_', '623_f_', '2459_m_', '2459_f_'];
    var cels = ['a', 'b1', 'b2', 'b', 'c1', 'c2', 'c3', 'c4', 'c5', 'c', 'd', 'e1', 'e2', 'e3', 'e4', 'e', 'f1', 'f2', 'f3', 'f', 'g', 'h'];

    for (cel of cels) {
        var x = 0;
        for (type of types) {
            // console.log(type[cel])
            x += parseInt($(`#${type+cel}`).text());
        }
        $(`#t_${cel}`).empty()
        $(`#t_${cel}`).text(x);
    }

}
async function myPushDataNSC(x) {
    // console.log(x)
    try {
        await pushLineDataCatLoop(x.begin)
        await pushLineDataCatLoop(x.nscAdd)
        await pushLineDataCatLoop(x.nscExit);
        // singleTablesNSC(x);
    } catch (error) {
        console.log(error)
    }

}