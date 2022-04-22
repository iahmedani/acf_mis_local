var uuid = require('uuid/v4');

module.exports.initOtpAdd = function () {
    // import database for dropdown and other events
    var knex = require('../../mainfunc/db')
    // initiating inputmask on all input where it is defined
    $(":input").inputmask();


    // drop down selections
    $(function () {
        var datePickerId = document.getElementById('reg_date');
        datePickerId.max = new Date().toISOString().split("T")[0];
        datePickerId.min = new Date('2018-01-01').toISOString().split("T")[0];
        ipc.send('getProvince');
        ipc.on('province', function (evt, province) {
            $('#ddProvince').children('option:not(:first)').remove();
            prov(province);
        })
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
            })
        })
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
                    $('#nsc_old_otp_id').attr('data-inputmask', "'mask':'NSC-999999'")
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
            ipc.on('hh', function (evt, hh) {
                $('#ddHealthHouse').children('option:not(:first)').remove();
                hhListener(hh);
            })
        })
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

    // Conditionals 
    /**
      NSC Conditions
      1. Should not ask MUAC <6 month age take Z score additional field
      3. Should not calculate the RUTF and disable other commodity
      4. if EDEA present no MUAC restriction
      5. Disable tehsil, village
      6. Enable height/length ask what they taking?
      7. Disable PLW
      8. referral and admission type
        i. if admission is new and referral by OTP
        ii. if admission type is ward limit referral only ward 
        iii. if transfer in from otp, limit referral type OTP and and ask for OTP ID 
        iv. if LAMA limit referral type to ward otp and other, and ask for OLD ID 
        v. Relapse  referral OTP and ward
        vi.

      OTP Conditions
      1. Should not allow admission <6 months
      2. if EDEA present no MUAC restriction
      3. Re-calculate the RUTF
      4. Referral and admission based criteria
        i. if admission type is relapse, return after default, Transfer in from other OTP => ask for OLD OTP ID 
        ii. if admission  transfer in from NSC ask NSC ID and limit referral type by SC only
        iii. if admission is in-patient-refusal limit referral type only have information 
        iv. if admission type is new, moved in and Other we need full referral type
        v. if admission type are as of above iv and return after default,  and referral type is CHW or LHW ask their name contact details
        vi. if admission type is Transfer in from other OTP => referral type to limit only by otp
        vii. if relapse and return after default the referral type only limited to LHW/CHW
      5. Disable PLW
    */

    //Placing automated address of the beneficiary
    $('#ddVillageName').on("change", function () {
        var village = $(this).val();
        var province = $('#ddProvince option:selected').text();
        var district = $('#ddDistrict option:selected').text();
        $('#adrProvince').val(province);
        $('#adrDistrict').val(district);
        $('#address').val(village ? village : '');
    });

    // list of change event monitor
    var pType = $('#ddProgramType');
    var age = $('#age');
    var eReason = $('#ent_reason');
    var rType = $('#ref_type');
    var oedema = $('oedema');
    var muac = $('#muac');

    // list of element affecting
    var _oldId = $('#nsc_old_otp_id')
    var _oldIdDetail = $('#old_otp_or_nsc_detail')

    /**
     * Change element actions
     */
    pType.on('change', function () {
        var prog = $(this).val();
        var msk = {
            sc: 'NSC',
            otp: 'OTP'
        }
        // Setting up ID input mask
        $('#nsc_old_otp_id').inputmask(`${msk[prog]}-999999`);
        // Getting commodities based on program
        ipc.send('getCommodity', prog)
        ipc.on('commodity', function (evt, com) {
            $('#ration1').children('option:not(:first)').remove();
            $('#ration2').children('option:not(:first)').remove();
            $('#ration3').children('option:not(:first)').remove();
            commodity(com, 'ration1');
            commodity(com, 'ration2');
            commodity(com, 'ration3');
        })

        // setting up sc entry 

        if (prog == 'sc') {
            $("#ent_reason").children('option:not(:first)').remove();
            $("#ent_reason").append(`
            <option value="new_add">New Admission</option>
            <option value="transfer_from_ward"> Transfer from ward</option>
            <option value="transfer_in_from_otp"> Transfer In From OTP </option>
            <option value="return_after_lama"> Return after LAMA</option> 
            <option value="relapse">Relapse after cured</option>
            <option value="other">Other</option>
            `);
            $("#ref_type").children('option:not(:first)').remove();
            $("#ref_type").append(`
            <option value="ref_by_otp">OTP</option>
            <option value="opd">OPD</option>
            <option value="ward">Ward</option>
            <option value="other">Other</option>
            `);
            $('#plw_type').attr('disabled', true);
            $('#muac').attr('min', 0).attr('max', 30);
            $('#age').attr('min', 0);
            $('#age').attr('max', 59);
            $("#ddUC").attr("disabled", true);
            $("#ddVillageName").attr('disabled', true);
            $('#height').attr('disabled', false)
            $('.notNsc').attr('disabled', true)

            // OTP data entry prep
        } else if (prog == 'otp') {
            $("#ent_reason").children('option:not(:first)').remove();
            $("#ent_reason").append(`
        <option value="no_prv_pro">New Admission</option>
        <option value="relapse">Relapse</option>
        <option value="return_def">Return After Defaulter</option>
        <option value="in-patient_refusal">In-patient Refusal</option>
        <option value="transfer_in_from_nsc">Transfer in from NSC</option>
        <option value="return_from_medical_transfer">Return from Medical Transfer</option>
        <option value="tranfer_in_other_otp">Transfer in<small>From other OTP</small></option>
        <option value="tranfer_in_from_sfp">Transfer in<small>From TSFP</small></option>
        <option value="moved_in">Moved In</option>
        <option value="other">Other</option>
        `);
            $("#ref_type")
                .children("option:not(:first)")
                .remove();
            $("#ref_type").append(`
        <option value="self">Self</option>
        <option value="peer">Peer to Peer</option>
        <option value="chw">CHW</option>
        <option value="lhw">LHW</option>
        <option value="doh_staff">DOH Staff</option>
        <option value="com_org">Community Org</option>
        <option value="by_sc_care">By SC Care</option>
        <option value="by_otp">By OTP</option>
        <option value="from_opd">From OPD</option>
        <option value="by_tsfp">By TSFP</option>
        <option value="other">Other</option>`);
            $('#plw_type').attr('disabled', true);
            $('#muac').attr('min', 5).attr('max', 11.4);
            $('#age').attr('min', 6);
            $('#age').attr('max', 59);
            $("#ddUC").attr("disabled", false);
            $("#ddVillageName").attr("disabled", false);
            $('#height').attr('disabled', true)
            $('.notNsc').attr('disabled', false)
        }
    })
    // age change for sc
    age.change(function () {
        if (pType.val() == 'sc') {
            if ($(this).val() < 6) {
                $('#z_score').attr('disabled', false).attr('required', true)
            } else {
                $('#z_score').attr('disabled', true)
            }
        } else {
            $('#z_score').attr('disabled', true)
        }
    })
    // entry reason change checks
    eReason.change(function () {
        var reason = $(this).val();
        var p = pType.val()
        if (p == 'otp') {
            if (reason != 'no_prev_pro' || reason != 'other') {
                muac.attr('min', 0).attr('max', 30);
                _oldId.attr('disabled', false)
                _oldIdDetail.attr('disabled', false)
            } else {
                muac.attr('min', 5).attr('max', 11.4);
                _oldId.attr('disabled', true)
                _oldIdDetail.attr('disabled', true)

            }
        } else if (p == 'sc') {
            if (reason == 'transfer_in_from_otp' || reason == 'return_after_lama' || reason == 'relapse') {
                rType.children('option').each(function () {
                    if ($(this).val() != 'ref_by_otp') {
                        $(this).attr('disabled', true)
                    }
                })
                _oldId.attr('disabled', false)
                _oldIdDetail.attr('disabled', false)
            } else {
                rType.children('option').each(function () {
                    $(this).attr('disabled', false)
                })
                _oldId.attr('disabled', true)
                _oldIdDetail.attr('disabled', true)
            }
        }
        // display other reason 
        if (reason == 'other') {
            $('#entry_reason_other_div').css('display', 'block');
            $('#entry_reason_other').attr('required', true)
        } else {
            $('#entry_reason_other_div').css('display', 'none');
            $('#entry_reason_other').attr('required', false)
        }
    })
    // ref type change event
    rType.change(function () {
        var _type = $(this).val();
        var p = pType.val();
        if (p == 'otp') {
            if (_type != 'self' || _type != 'doh_staff' || _type != 'peer' || _type != 'from_opd') {
                $('#ref_by_details').attr('disabled', false)
            } else {
                $('#ref_by_details').attr('disabled', false)
            }
        } else if (p == 'sc') {
            if (_type == 'ref_by_otp') {
                $('#ref_by_details').attr('disabled', false)
            } else {
                $('#ref_by_details').attr('disabled', false)
            }
        }
        if (_type == 'other') {
            $('#ref_type_other_div').css('display', 'block')
            $('#ref_type_other').attr('required', true)
        } else {
            $('#ref_type_other_div').css('display', 'none')
            $('#ref_type_other').attr('required', false)
        }
    })

    // if oedema muac max limit removal
    oedema.change(function () {
        if ($(this).val() != 'absent') {
            muac.attr('min', 0).attr('max', 30);
        }
    })
}