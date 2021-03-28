const electron = require('electron');
const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  dialog,
  globalShortcut
} = electron;
require('electron-reload')(__dirname,{electron});

var _uuid = require('uuid/v4')


var fs = require('fs');
// const _launch = require('./mainfunc/launch');

// if(app.getVersion() === "1.4.17"){
//   fs.stat(`${process.env.APPDATA}/ACF MIS Local app/updated.txt`, (err, stat)=>{
//     if(err){
//       console.log(err)
//       _launch.updateVersion().then(()=>{
//         console.log('done')

//       }).catch(err=>console.log(err))
//     }else{
//       console.log(stat)
//     }
//   })

// }

// require('electron-reload')(__dirname);
const firstRunDB = require('./firstRunCreateDb').firstCreateDb;
const url = require('url');
const path = require('path');
var geo = require('./geoData');
let imran = {};
const log = require('electron-log');
const {
  autoUpdater
} = require("electron-updater");
// autoUpdater.autoDownload = true;
// console.log(imran);
var async = require('async');
const knex = require('./mainfunc/db');

// let _testVar 
async function _serverUrl() {
  var x = await knex('tblConfig');
  return x;
}


function toJSONLocal(date) {
  var local = new Date(date);
  local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
}

function localDate() {
  var x = new Date();

  return toJSONLocal(x);
}
let sucMsg = function (event, listenChannel, message) {
  event.sender.send('success', {
    msg: message
  })
  // ipcMain.removeAllListeners(listenChannel)
  ipcMain.removeAllListeners('success')
}

let errMsg = function (event, listenChannel, message) {
  event.sender.send('error', {
    msg: message
  })
  // ipcMain.removeAllListeners(listenChannel)
  ipcMain.removeAllListeners('error')
}
// OTP Admission data save
function otpAddDataSave(event, addOtpData, config, client) {
  //console.log(addFormOtp);
  delete addOtpData.province;
  delete addOtpData.Tehsil;
  delete addOtpData.district;
  delete addOtpData.province;
  delete addOtpData.ddHealthHouseOTP;
  delete addOtpData.uc;
  addOtpData.client_id = client;
  addOtpData.username = config.usernameL;
  addOtpData.org_name = config.org_nameL;
  addOtpData.project_name = config.project_nameL;
  const addFormOtp = addOtpData;
  console.log(addFormOtp);
  knex('tblOtpAdd')
    .insert(addFormOtp)
    .then(result => {
      console.log(result + 'OTP addmision added')
      sucMsg(event, '', 'OTP admission added successfully')
      // addOtp.webContents.send("resultSentOtpAdd", {
      //   'msg': 'records added'
      // });
      var interimData = {
        otp_id: addOtpData.otp_id,
        interim_id: _uuid(),
        client_id: imran.client,
        muac: addFormOtp.muac,
        weight: addFormOtp.weight,
        ration1: addFormOtp.ration1,
        quantity1: addFormOtp.quantity1,
        ration2: (addFormOtp.ration2 ? addFormOtp.ration2 : ''),
        quantity2: addFormOtp.quantity2,
        ration3: (addFormOtp.ration3 ? addFormOtp.ration3 : ''),
        quantity3: addFormOtp.quantity3,
        curr_date: localDate(),
        created_at: localDate(),
        status: 'open',
        next_followup: function () {
          var myDate = new Date(addOtpData.reg_date);
          myDate.setDate(myDate.getDate() + (addOtpData.prog_type == 'sfp' ? 14 : 7))
          return toJSONLocal(myDate)
        }()
      }
      console.log(interimData)
      return knex('tblInterimOtp')
        .insert(interimData)
    })
    .then(result => {
      console.log('interim ID: ', result);
    })
    .catch(e => {
      console.log(e)
      console.log(e + 'OTP add error');
      errMsg(event, '', 'OTP Addmision not added, plz try again or contact admin');
      // addOtp.webContents.send("resultSentOtpAdd", {
      //   'err': 'records not added, plz try again'
      // });
    })
  // addFormOtp = null;
}
// followup interm data share
function followupIntermData(event, filter) {
  console.log(
    filter
  )
  var _limit = (filter.pageSize) ? filter.pageSize : 10;
  var _offset = (filter.pageIndex == 1) ? 0 : (filter.pageIndex - 1) * _limit;
  console.log('site_id from html', filter.site_id);
  knex.from('tblOtpAdd')
    .innerJoin('tblInterimOtp', 'tblInterimOtp.otp_id', 'tblOtpAdd.otp_id')
    .where({
      // site_id: filter.site_id,
      status: 'open',
      'tblInterimOtp.is_deleted': 0
    })
    .where((builder) => {
      if (filter.prog_type == "sc") {
        builder.where('tehsil_id', filter.tehsil_id)
        // .andWhere('tblOtpAdd.site_village', 'like', `%${filter.site_village ? filter.site_village :''}%`).orWhereNull('tblOtpAdd.site_village')
      } else {
        // builder.where('tehsil_id', 'like', '% %')
        builder.where({
            site_id: filter.site_id
          })
          .where('tblOtpAdd.site_village', 'like', `%${filter.site_village ? filter.site_village :''}%`)
      }
    })
    .where('tblOtpAdd.reg_id', 'like', `%${filter.reg_id ? filter.reg_id :''}%`)
    .where('tblOtpAdd.p_name', 'like', `%${filter.p_name ? filter.p_name :''}%`)
    .where('tblOtpAdd.f_or_h_name', 'like', `%${filter.f_or_h_name ? filter.f_or_h_name :''}%`)
    // .where('tblOtpAdd.prog_type', 'like', `%${filter.prog_type}%`)


    // .where('tblOtpAdd.site_village', 'like', `%${filter.site_village ? filter.site_village :''}%`)
    .where('tblOtpAdd.gender', 'like', `%${filter.gender ? filter.gender :''}%`)
    // .where('tblOtpAdd.prog_type', 'like', `%${filter.prog_type}%`)
    .limit(_limit)
    .offset(_offset)
    .then(result => {
      // result.location = 'Follow up interim call'
      return knex.from('tblOtpAdd')
        .innerJoin('tblInterimOtp', 'tblInterimOtp.otp_id', 'tblOtpAdd.otp_id')
        .where({
          // site_id: filter.site_id,
          status: 'open',
          'tblInterimOtp.is_deleted': 0
        })
        .where((builder) => {
          if (filter.prog_type == "sc") {
            builder.where('tehsil_id', filter.tehsil_id)
            // .andWhere('tblOtpAdd.site_village', 'like', `%${filter.site_village ? filter.site_village :''}%`).orWhereNull('tblOtpAdd.site_village')
          } else {
            // builder.where('tehsil_id', 'like', '% %')
            builder.where({
                site_id: filter.site_id
              })
              .where('tblOtpAdd.site_village', 'like', `%${filter.site_village ? filter.site_village :''}%`)
          }
        })
        // .where('tblOtpAdd.site_id', 'like', `%${filter.site_id ? filter.site_id : ''}%`)
        // .where('tblOtpAdd.tehsil_id', 'like', `%${filter.tehsil_id ? filter.tehsil_id : ''}%`)
        .where('tblOtpAdd.reg_id', 'like', `%${filter.reg_id ? filter.reg_id :''}%`)
        .where('tblOtpAdd.p_name', 'like', `%${filter.p_name ? filter.p_name :''}%`)
        .where('tblOtpAdd.f_or_h_name', 'like', `%${filter.f_or_h_name ? filter.f_or_h_name :''}%`)
        // .where('tblOtpAdd.prog_type', filter.prog_type)

        .where('tblOtpAdd.gender', 'like', `%${filter.gender ? filter.gender :''}%`)
        // .where('tblOtpAdd.prog_type', 'like', `%${filter.prog_type}%`)
        .count({
          total: 'tblOtpAdd.reg_id'
        })
        // .limit(_limit)
        // .offset(_offset)
        .then(totalCount => {
          return {
            result,
            totalCount
          }
        })

    }).then(result => {
      // console.log(result)
      event.sender.send('getInterim', ({
        result: result.result,
        totalCount: result.totalCount
      }))
      result = null;
    })
    .catch(e => {
      // e.location = 'Follow up interim call'
      // console.log(e);
      event.sender.send('getInterim', ({
        err: e
      }))
    })
}
// adding followup 
function followupAddData(event, item) {
  var date_ = new Date(item.next_followup)
  date_.setDate(date_.getDate() + 1);
  // date_.toISOString();
  // date_.toJSON().split('T')[0];
  date_ = date_.toJSON().split('T')[0]
  console.log(date_)
  var interimUpd = {
    muac: item.muac,
    weight: item.weight,
    ration1: item.ration1,
    quantity1: item.quantity1,
    ration2: item.ration2,
    quantity2: item.quantity2,
    ration3: item.ration3,
    quantity3: item.quantity3,
    curr_date: item.followup_date,
    other_com_name: item.other_com_name,
    other_com_qty: item.other_com_qty,
    // next_followup: item.next_followup,
    next_followup: date_,

    // next_followup: function () {
    //   var myDate = new Date(item.followup_date);
    //   myDate.setDate(myDate.getDate() + 15)
    //   return myDate.toLocaleDateString();
    // }(),
    updated_at: localDate()
  }
  var followupData = {
    upload_status: 0,
    followup_id: item.followup_id,
    otp_id: item.otp_id,
    client_id: imran.client,
    muac: item.muac,
    weight: item.weight,
    ration1: item.ration1,
    quantity1: item.quantity1,
    ration2: item.ration2,
    quantity2: item.quantity2,
    ration3: item.ration3,
    quantity3: item.quantity3,
    curr_date: item.followup_date,
    other_com_name: item.other_com_name,
    other_com_qty: item.other_com_qty,
    // next_followup: item.next_followup,    
    next_followup: date_,
    // next_followup: function () {
    //   var myDate = new Date(item.followup_date);
    //   myDate.setDate(myDate.getDate() + 15)
    //   return myDate.toLocaleDateString();
    // }(),
    created_at: localDate()
  }
  // console.log('_______________update data______')
  // console.log(interimUpd)
  // console.log('_______________followup data______')
  // console.log(followupData)

  knex.from('tblInterimOtp')
    .where({
      otp_id: item.otp_id,
      next_followup: date_
    })
    .then(result => {
      if (result.length) {
        event.sender.send('error', ({
          msg: 'Duplicate Followup is not allowed'
        }))
        knex.from('tblOtpAdd')
          .innerJoin('tblInterimOtp', 'tblInterimOtp.otp_id', 'tblOtpAdd.otp_id')
          .where({
            'tblInterimOtp.otp_id': item.otp_id,
            status: 'open'
          })
          .then(result => {

            // result.location = 'Follow up interim call'
            console.log(result)
            event.sender.send('addFollowup', ({
              result: result
            }))
          })
          .catch(e => {
            // e.location = 'Follow up interim call'
            console.log(e);
            event.sender.send('addFollowup', ({
              err: e
            }))
          })
      } else {
        knex.from('tblInterimOtp')
          .where({
            otp_id: item.otp_id
          })
          .update(interimUpd)
          .then(result => {
            console.log(result)
          })
          .catch(e => {
            console.log(e)
          })
        knex.from('tblOtpAdd')
          .innerJoin('tblInterimOtp', 'tblInterimOtp.otp_id', 'tblOtpAdd.otp_id')
          .where({
            'tblInterimOtp.otp_id': item.otp_id,
            status: 'open'
          })
          .then(result => {

            // result.location = 'Follow up interim call'
            console.log(result)
            event.sender.send('addFollowup', ({
              result: result
            }))
          })
          .catch(e => {
            // e.location = 'Follow up interim call'
            console.log(e);
            event.sender.send('addFollowup', ({
              err: e
            }))
          })
        knex('tblOtpFollowup')
          .insert(followupData)
          .then(result => {
            console.log({
              msg: 'Follow up added',
              result: result
            })
          })
          .catch(e => {
            console.log({
              msg: 'Error during followup record add',
              err: e
            })
          })
      }
    })



}

// Exit Update: Edit (update) one record
function exitUpdDataSave(event, data, client) {
  data.client_id = client;
  data.upload_status = 2;
  const otpExitAddData = data;
  console.log(otpExitAddData);
  const updAddmision = {
    exit_date: otpExitAddData.exit_date,
    exit_reason: otpExitAddData.exit_reason,
    total_days: otpExitAddData.days_in_program,
    exit_muac: otpExitAddData.exit_muac,
    exit_weight: otpExitAddData.exit_weight,
    // upload_status : 2
    // otp_id : otpExitAddData.otp_id
  }
  const followup = {
    client_id: data.client_id,
    weight: data.exit_weight,
    ration1: (data.exit_ration1) ? data.exit_ration1 : '',
    quantity1: (data.exit_quantity1) ? data.exit_quantity1 : '',
    ration2: (data.exit_ration2) ? data.exit_ration2 : '',
    quantity2: (data.exit_quantity2) ? data.exit_quantity2 : '',
    ration3: (data.exit_ration3) ? data.exit_ration3 : '',
    quantity3: (data.exit_quantity3) ? data.exit_quantity3 : '',
    other_com_name: (data.exit_other_com_name) ? data.exit_other_com_name : '',
    other_com_qty: (data.exit_other_com_qty) ? data.exit_other_com_qty : '',
    muac: data.exit_muac,
    status: data.exit_reason,
    curr_date: data.exit_date
  }

  knex('tblOtpExit')
    .where('otp_id', otpExitAddData.otp_id)
    .update(otpExitAddData)
    .then(result => {
      console.log(result);
      sucMsg(event, "", "Record updated Successfully");
      return knex('tblInterimOtp')
        .where('otp_id', otpExitAddData.otp_id)
        .update({
          status: otpExitAddData.exit_reason
        })
    })
    .then(result => {
      console.log({
        msg: 'interm table updated',
        data: result
      })
    }).then(result => {
      return knex('tblOtpFollowup').select('followup_id').where('otp_id', data.otp_id).whereNotNull('status').where({
        is_deleted: 0
      }).orderBy('rowid', 'desc').limit(1);
    }).then(result => {
      if (result.length) {
        return knex('tblOtpFollowup').update(followup).where('followup_id', result[0]['followup_id']);
      } else {
        return [];
      }
    }).then(r => {
      return knex('tblOtpFollowup').count({
        total_followups: 'followup_id'
      }).where({
        otp_id: data.otp_id,
        is_deleted: 0
      })

    }).then(async (result) => {
      console.log('total followups', JSON.stringify(result));
      if (result.length) {
        updAddmision.total_followups = result[0].total_followups;
        var upStatus = await knex.select('upload_status').from('tblOtpAdd').where('otp_id', data.otp_id).where('is_deleted', 0);
        if (upStatus[0].upload_status == '1') {
          updAddmision.upload_status = 2;
          return knex('tblOtpAdd').update(updAddmision).where('otp_id', data.otp_id)
        } else {
          return knex('tblOtpAdd').update(updAddmision).where('otp_id', data.otp_id)
        }
      } else {
        return [];
      }
    }).then(r => {
      console.log({
        msg: 'all tables are updated',
        data: r
      })
    })
    .catch(e => {
      console.log(e);
      errMsg(event, "", "Record not updated, plz try again or contact admin");
    })
}
// function exitUpdDataSave(event, data, client) {
//   data.client_id = client;
//   data.upload_status = 2;
//   const otpExitAddData = data;
//   console.log(otpExitAddData);

//   const followup = {
//     client_id: data.client_id,
//     weight: data.exit_weight,
//     ration1: (data.exit_ration1) ? data.exit_ration1 : '',
//     quantity1: (data.exit_quantity1) ? data.exit_quantity1 : '',
//     ration2: (data.exit_ration2) ? data.exit_ration2 : '',
//     quantity2: (data.exit_quantity2) ? data.exit_quantity2 : '',
//     ration3: (data.exit_ration3) ? data.exit_ration3 : '',
//     quantity3: (data.exit_quantity3) ? data.exit_quantity3 : '',
//     other_com_name: (data.exit_other_com_name) ? data.exit_other_com_name : '',
//     other_com_qty: (data.exit_other_com_qty) ? data.exit_other_com_qty : '',
//     muac: data.exit_muac,
//     status: data.exit_reason,
//     curr_date: data.exit_date
//   }

//   knex('tblOtpExit')
//     .where('otp_id', otpExitAddData.otp_id)
//     .update(otpExitAddData)
//     .then(result => {
//       console.log(result);
//       sucMsg(event, "", "Record updated Successfully");
//       return knex('tblInterimOtp')
//         .where('otp_id', otpExitAddData.otp_id)
//         .update({
//           status: otpExitAddData.exit_reason
//         })
//     })
//     .then(result => {
//       console.log({
//         msg: 'interm table updated',
//         data: result
//       })
//     }).then(result => {
//       return knex('tblOtpFollowup').select('followup_id').where('otp_id', data.otp_id).whereNotNull('status').orderBy('rowid', 'desc').limit(1);
//     }).then(result => {
//       if (result.length) {
//         return knex('tblOtpFollowup').update(followup).where('followup_id', result[0]['followup_id']);
//       } else {
//         return [];
//       }
//     }).then(r=>{
//       return knex('tblOtpFollowup').count({total_followups:'followup_id'}).where({otp_id: data.otp_id, is_deleted:0})

//     }).then(async (result)=>{
//       console.log('total followups', JSON.stringify(result));
//       if(result.length){
//         updAddmision.total_followups = result[0].total_followups;
//         var upStatus = await knex.select('upload_status').from('tblOtpAdd').where('otp_id', data.otp_id).where('is_deleted', 0);
//         if(upStatus[0].upload_status == '1'){
//           updAddmision.upload_status = 2;
//           return knex('tblOtpAdd').update(updAddmision).where('otp_id', data.otp_id)
//         }else{
//           return knex('tblOtpAdd').update(updAddmision).where('otp_id', data.otp_id)
//         }
//       } else {
//         return [];
//       }
//     }).then(result => {
//       console.log({
//         msg: 'all tables are updated',
//         data: result
//       })
//     })
//     .catch(e => {
//       console.log(e);
//       errMsg(event, "", "Record not updated, plz try again or contact admin");
//     })
// }


//Exit Update: Edit (update) one record
ipcMain.on('otpExitUpdate', (e, data) => {
  exitUpdDataSave(e, data, imran.client);
})

// sending all admisions for otp exit
function otpAddDataForExit(event, filter) {
  var _limit = (filter.pageSize) ? filter.pageSize : 10;
  var _offset = (filter.pageIndex == 1) ? 0 : (filter.pageIndex - 1) * _limit;
  if (filter.site_id) {
    var myFilter = {
      site_id: filter.site_id
    }
  } else {
    var myFilter = ['site_id', 'like', '%%']
  }

  knex.from('tblOtpAdd')
    .innerJoin('tblInterimOtp', 'tblInterimOtp.otp_id', 'tblOtpAdd.otp_id')
    .where({
      site_id: filter.site_id,
      status: 'open',
      'tblInterimOtp.is_deleted': 0
    })
    .where('tblOtpAdd.reg_id', 'like', `%${filter.reg_id ? filter.reg_id :''}%`)
    .where('tblOtpAdd.p_name', 'like', `%${filter.p_name ? filter.p_name :''}%`)
    .where('tblOtpAdd.f_or_h_name', 'like', `%${filter.f_or_h_name ? filter.f_or_h_name :''}%`)
    .where('tblOtpAdd.site_village', 'like', `%${filter.site_village ? filter.site_village :''}%`)
    .where('tblOtpAdd.gender', 'like', `%${filter.gender ? filter.gender :''}%`)
    .limit(_limit)
    .offset(_offset)
    .then(result => {
      // result.location = 'Follow up interim call'
      return knex.from('tblOtpAdd')
        .innerJoin('tblInterimOtp', 'tblInterimOtp.otp_id', 'tblOtpAdd.otp_id')
        .where({
          site_id: filter.site_id,
          status: 'open',
          'tblInterimOtp.is_deleted': 0
        })
        .where('tblOtpAdd.reg_id', 'like', `%${filter.reg_id ? filter.reg_id :''}%`)
        .where('tblOtpAdd.p_name', 'like', `%${filter.p_name ? filter.p_name :''}%`)
        .where('tblOtpAdd.f_or_h_name', 'like', `%${filter.f_or_h_name ? filter.f_or_h_name :''}%`)
        .where('tblOtpAdd.site_village', 'like', `%${filter.site_village ? filter.site_village :''}%`)
        .where('tblOtpAdd.gender', 'like', `%${filter.gender ? filter.gender :''}%`)
        .count({
          total: 'tblOtpAdd.reg_id'
        })
        // .limit(_limit)
        // .offset(_offset)
        .then(totalCount => {
          return {
            result,
            totalCount
          }
        })

    }).then(result => {
      console.log(result)
      event.sender.send('getOtpAll', ({
        result: result.result,
        totalCount: result.totalCount
      }))
      result = null;
    })
    .catch(e => {
      // e.location = 'Follow up interim call'
      console.log(e);
      event.sender.send('getOtpAll', ({
        err: e
      }))
    })

  // knex.from('tblOtpAdd')
  //   .innerJoin('tblInterimOtp', 'tblInterimOtp.otp_id', 'tblOtpAdd.otp_id')
  //   .where('tblOtpAdd.reg_id','like', `%${filter.reg_id ? filter.reg_id :''}%`)
  //   .where('tblOtpAdd.p_name','like', `%${filter.p_name ? filter.p_name :''}%`)
  //   .where('tblOtpAdd.f_or_h_name','like', `%${filter.f_or_h_name ? filter.f_or_h_name :''}%`)
  //   .where('tblOtpAdd.site_village','like', `%${filter.site_village ? filter.site_village :''}%`)
  //   .where('tblOtpAdd.gender','like', `%${filter.gender ? filter.gender :''}%`)
  //   .where({
  //     status: 'open',
  //   })
  //   .limit(_limit)
  //   .offset(_offset)
  //   // .orWhere({site_id: filter.site_id})
  //   // .where(myFilter)
  //   .then(result => {
  //     event.sender.send('getOtpAll', ({
  //       result: result
  //     }))
  //   })
  //   .catch(e => {
  //     event.sender.send('getOtpAll', ({
  //       err: e
  //     }))
  //   })
}
// add OTP Exit 
// function otpExitAddDataSave(event, data, client) {
//   data.client_id = client;
//   data.upload_status = 0;
//   const otpExitAddData = data;
//   console.log({
//     location: 'OTP ADD EXIT',
//     data
//   });
//   const followup = {
//     otp_id: data.otp_id,
//     followup_id: _uuid(),
//     client_id: data.client_id,
//     weight: data.exit_weight,
//     ration1: (data.exit_ration1) ? data.exit_ration1 : '',
//     quantity1: (data.exit_quantity1) ? data.exit_quantity1 : '',
//     ration2: (data.exit_ration2) ? data.exit_ration2 : '',
//     quantity2: (data.exit_quantity2) ? data.exit_quantity2 : '',
//     ration3: (data.exit_ration3) ? data.exit_ration3 : '',
//     quantity3: (data.exit_quantity3) ? data.exit_quantity3 : '',
//     other_com_name: (data.exit_other_com_name) ? data.exit_other_com_name : '',
//     other_com_qty: (data.exit_other_com_qty) ? data.exit_other_com_qty : '',
//     muac: data.exit_muac,
//     status: data.exit_reason,
//     curr_date: data.exit_date
//   }
//   knex('tblOtpExit')
//     .insert(data)
//     .then(result => {
//       console.log(result);
//       sucMsg(event, '', 'Patient exit record is saved')
//       return knex('tblInterimOtp')
//         .where('otp_id', otpExitAddData.otp_id)
//         .update({
//           status: otpExitAddData.exit_reason
//         })
//     })
//     .then(result => {
//       console.log({
//         msg: 'interm table updated',
//         data: result
//       })
//       console.log(followup)
//       return knex('tblOtpFollowup')
//         .insert(followup)
//     })
//     .then(result => {
//       console.log({
//         msg: 'followup table updated',
//         data: result
//       })
//     })
//     .catch(e => {
//       console.log(e);
//       errMsg(event, '', 'Patient exit record not saved, plz try again or contact admin')
//     })
// }

function otpExitAddDataSave(event, data, client) {
  data.client_id = client;
  data.upload_status = 0;
  const otpExitAddData = data;
  console.log({
    location: 'OTP ADD EXIT',
    data
  });
  const updAddmision = {
    exit_date: otpExitAddData.exit_date,
    exit_reason: otpExitAddData.exit_reason,
    total_days: otpExitAddData.days_in_program,
    exit_muac: otpExitAddData.exit_muac,
    exit_weight: otpExitAddData.exit_weight,
    // upload_status: 2
  }
  const followup = {
    otp_id: data.otp_id,
    followup_id: _uuid(),
    client_id: data.client_id,
    weight: data.exit_weight,
    ration1: (data.exit_ration1) ? data.exit_ration1 : '',
    quantity1: (data.exit_quantity1) ? data.exit_quantity1 : '',
    ration2: (data.exit_ration2) ? data.exit_ration2 : '',
    quantity2: (data.exit_quantity2) ? data.exit_quantity2 : '',
    ration3: (data.exit_ration3) ? data.exit_ration3 : '',
    quantity3: (data.exit_quantity3) ? data.exit_quantity3 : '',
    other_com_name: (data.exit_other_com_name) ? data.exit_other_com_name : '',
    other_com_qty: (data.exit_other_com_qty) ? data.exit_other_com_qty : '',
    muac: data.exit_muac,
    status: data.exit_reason,
    curr_date: data.exit_date
  }
  knex('tblOtpExit')
    .insert(data)
    .then(result => {
      console.log(result);
      sucMsg(event, '', 'Patient exit record is saved')
      return knex('tblInterimOtp')
        .where('otp_id', otpExitAddData.otp_id)
        .update({
          status: otpExitAddData.exit_reason
        })
    })
    .then(result => {
      console.log({
        msg: 'interm table updated',
        data: result
      })
      console.log(followup)
      return knex('tblOtpFollowup')
        .insert(followup)
    }).then(r => {
      return knex('tblOtpFollowup').count({
        total_followups: 'followup_id'
      }).where({
        is_deleted: 0,
        otp_id: data.otp_id
      })
    }).then(async (result) => {
      // console.log('total followups', JSON.stringify(result));
      // if(result.length){
      //   updAddmision.total_followups = result[0].total_followups;
      //   // return knex('tblOtpAdd').update(updAddmision).where('otp_id', data.otp_id)
      if (result.length) {
        updAddmision.total_followups = result[0].total_followups;
        var upStatus = await knex.select('upload_status').from('tblOtpAdd').where('otp_id', data.otp_id).where('is_deleted', 0);
        if (upStatus[0].upload_status) {
          updAddmision.upload_status = 2;
          return knex('tblOtpAdd').update(updAddmision).where('otp_id', data.otp_id)
        } else {
          return knex('tblOtpAdd').update(updAddmision).where('otp_id', data.otp_id)
        }
      } else {
        return [];
      }
    })
    .then(result => {
      console.log({
        msg: 'followup table updated',
        data: result
      })
    })
    .catch(e => {
      console.log(e);
      errMsg(event, '', 'Patient exit record not saved, plz try again or contact admin')
    })
}
// // sending all session of site 
// function allSessionsData(event, data) {
//   console.log(data);
//   knex('tblSessions')
//     .where('site_id', data)
//     .then(result => {
//       event.sender.send('getSessionsAll', ({
//         result: result
//       }))
//     })
//     .catch(e => {
//       event.sender.send('getSessionsAll', ({
//         err: e
//       }))
//     })
// }
// adding session data 
function sessionsDataSave(event, item, config, client) {

  item.upload_status = 0;
  item.client_id = client;
  item.created_at = localDate();
  item.username = config.usernameL;
  item.project_name = config.project_nameL;
  item.org_name = config.org_nameL;
  console.log({
    msg: 'insert Sessions',
    data: item
  })
  knex('tblSessions')
    .insert(item)
    .then(result => {
      console.log({
        msg: 'insert record',
        ret: result
      })
      return knex('tblSessions')
        .where('session_id', result[0])

    })
    .then(result => {
      console.log({
        msg: 'insert return item',
        result: result
      })
      event.sender.send('insertSessionsSingle', ({
        result: result
      }))
    })
    .catch(e => {
      console.log(e)
      event.sender.send('insertSessionsSingle', ({
        err: e
      }))
    })
}
// // updating session data
// function sessionUpdateSave(event, item) {
//   item.upload_status = 2;
//   item.updated_at = localDate();
//   knex('tblSessions')
//     .update(item)
//     .where('session_id', item.session_id)
//     .then(result => {
//       return knex('tblSessions')
//         .where('session_id', item.session_id)
//     })
//     .then(result => {
//       event.sender.send('updateSessionsSingle', ({
//         result: result
//       }))
//     })
//     .catch(e => {
//       event.sender.send('updateSessionsSingle', ({
//         err: e
//       }))
//     })
// }
ipcMain.on('stocks', (e, data) => {
  stockMovement(e);
})

function stockMovement(event) {
  knex('v_StockMovementv2')
    .orderBy('year', 'asc')
    .orderBy('month', 'asc')
    .then(result => {
      mainWindow.webContents.send('stocks', result)
    })
    .catch(e => {
      errMsg(event, '', 'Data Fetch error')
    })
}
ipcMain.on('enterRequest', (event, data) => {
  stockRequest(event, data);
})

function stockRequest(event, data) {
  data.client_id = client_id;
  knex('tblStockRequest')
    .insert(data)
    .then(result => {
      sucMsg(event, '', 'Stock request email is sent')
    })
    .catch(e => {
      errMsg(event, '', 'Stock Request: Db error ')
    })
}
// ipcMain.on('rusfStock', (e, data) => {
//   rusfStockDetails(e);
// })

// function rusfStockDetails(event) {

//   async.series({
//     dist: cb => {
//       knex.select('*').from('v_total_dist')
//         .sum({ distribution: 'distribution' })
//         .groupBy('month','year')
//         .then(result => cb(null, result))
//         .catch(e=>cb(e))
//     },
//     stockIn: cb => {
//       knex.select('item_desc').as('commodity').from('tblStock')
//         .sum({ rec_qty: 'rec_qty' })
//         .where({ item_desc: 'RUTF Sachets' })
//         .groupBy('item_desc')
//         .then(result => cb(null, result))
//         .catch(e => cb(e))     

//     }
//   }, function (err, results) {
//     if (err) {
//         errMsg(event, '', 'Data Fetch error')
//     } else {
//       mainWindow.webContents.send('rusfStock', results);
//       }
//   })
// }

// Save Stock Entry
function stockSave(event, data) {
  // console.log(data)
  const {
    client,
    mac
  } = JSON.parse(fs.readFileSync(`${process.env.APPDATA}/ACF MIS Local app/config.json`, 'utf8'));
  const newData = [];
  data.forEach((el, i) => {
    el.client_id = client;
    el.id = _uuid();
    newData.push(el)
    if (data.length - 1 == i) {
      console.log(newData)
      knex('tblStock')
        .insert(newData)
        .then(result => {
          sucMsg(event, '', 'Stock Entry Save')
        }).catch(e => {
          console.log(e)
          errMsg(event, '', 'Stock entry db error')
        })
    }
  })

}
ipcMain.on('geoList', (evt, data) => {
  async.series({
    province: (cb) => {
      knex('tblGeoProvince')
        .then(result => {
          cb(null, result)
        })
        .catch(e => {
          cb(e);
        })
    },
    district: (cb) => {
      knex('tblGeoDistrict')
        .then(result => {
          cb(null, result)
        })
        .catch(e => {
          cb(e);
        })
    },
    tehsil: (cb) => {
      knex('tblGeoTehsil')
        .then(result => {
          cb(null, result)
        })
        .catch(e => {
          cb(e);
        })
    },
    uc: (cb) => {
      knex('tblGeoUC')
        .then(result => {
          cb(null, result)
        })
        .catch(e => {
          cb(e);
        })
    },
    site: (cb) => {
      knex('tblGeoNutSite')
        .then(result => {
          cb(null, result)
        })
        .catch(e => {
          cb(e);
        })
    }
  }, (err, results) => {
    evt.sender.send("geoList", (results));

  })
})





// Screening Update: Children sending all data
function allScreeningData(event, qry) {
  db.scrChild(qry, (err, result) => {
    event.sender.send('getScrChAll', ({
        err: err,
        result: result,

      })

    )
    console.log(result);
  })
}
// Screening Update: Edit (update) children record
function screeningChUpDataSave(event, data) {
  var chUpd = {
    screening_id: data.screening_id,
    name: data.name,
    upload_status: 2,
    f_or_h_name: data.f_or_h_name,
    muac: data.muac,
    gender: data.gender,
    age: data.age,
    oedema: data.oedema,
    no_mm_sch: data.no_mm_sch,
    deworming: data.deworming,
    status: data.status
  }
  db.updScr(chUpd, function (err, result) {
    console.log('childupdate', result);
    event.sender.send('updScrChSingle', ({
      result,
      err: null
    }))
  })

}
// Screening Update: Plw sending all data
function allScreeningDataPlw(event, qry) {
  db.scrPlw(qry, (err, result) => {
    event.sender.send('getScrPlwAll', ({
      err: err,
      result: result,
    }))
    console.log(result);
  })
}

// Screening Update: Chilren sending all data
function allScrChildrenUpdData(event, qry) {
  db.allScrChildrenData(qry, (err, result) => {
    event.sender.send('allScrChildren', ({
      err: err,
      result: result,
    }))
    // console.log(result);
  })
}
// Screening Update: PLW NEW sending all data
function allScrPlwNewUpdData(event, qry) {
  db.allScrPlwNewData(qry, (err, result) => {
    event.sender.send('allScrPlwNew', ({
      err: err,
      result: result,
    }))
    console.log(result);
  })
}
// Screening Update: Edit (update) plw record
function screeningPlUpdDataSave(event, data) {
  var plwUpd = {
    screening_id: data.screening_id,
    name: data.name,
    f_or_h_name: data.f_or_h_name,
    muac: data.muac,
    upload_status: 2,
    address: data.address,
    age: data.age,
    plw_type: data.plw_type,
    status: data.status
  }
  db.updScr(plwUpd, function (err, result) {
    console.log(result);
    event.sender.send('updScrPlwSingle', ({
      result,
      err: null
    }))
  })
}
// Admission Update: sending all data
function allOtpAddUpdData(event, site_id) {
  knex('tblOtpAdd')
    .where({
      site_id: site_id
    })
    .then(result => {
      event.sender.send('allOtp', ({
        result: result
      }))
    })
    .catch(e => {
      event.send.send('allOtp', ({
        err: e
      }))
    })

}
// // Admission Update: Edit (update) one record
// function otpAddUpdDataSave(event, item) {
//   console.log(item);
//   item.upload_status = 2;
//   knex('tblOtpAdd')
//     .update(item)
//     .where('otp_id', item.otp_id)
//     .then(result => {
//       sucMsg(event, '', 'Record successfully updated')
//       console.log(result);
//     })
//     .catch(e => {
//       console.log(e)
//       errMsg(event, '', 'Record no updated, plz try again or contact admin')
//     })
// }

// Exit Update: sending all data
// function allExitData(event, site_id) {

//   knex.from('tblOtpExit')
//     .innerJoin('tblOtpAdd', 'tblOtpAdd.otp_id', 'tblOtpExit.otp_id')
//     .where({
//       site_id: site_id,
//     })
//     .then(result => {
//       console.log(result)
//       event.sender.send('have', ({
//         result: result
//       }))
//     })
//     .catch(e => {
//       event.sender.send('have', ({
//         err: e
//       }))
//     })
// }
// // Exit Update: Edit (update) one record
// function exitUpdDataSave(event, data, client) {
//   data.client_id = client;
//   data.upload_status = 2;
//   const otpExitAddData = data;
//   console.log(otpExitAddData);

//   knex('tblOtpExit')
//     .where('otp_id', otpExitAddData.otp_id)
//     .update(otpExitAddData)
//     .then(result => {
//       console.log(result);
//       sucMsg(event, '', 'Record updated Successfully')
//       return knex('tblInterimOtp')
//         .where('otp_id', otpExitAddData.otp_id)
//         .update({
//           status: otpExitAddData.exit_reason
//         })
//     })
//     .then(result => {
//       console.log({
//         msg: 'interm table updated',
//         data: result
//       })
//     })
//     .catch(e => {
//       console.log(e);
//       errMsg(event, '', 'Record not updated, plz try again or contact admin')
//     })
// }

// Screening Children Add 
function childrenScrAddSave(event, data, client, username, project) {
  // data.client_id = client;
  data.username = username;
  data.project = project;
  data.upload_status = 0;
  knex('tblScrChildren')
    .insert(data)
    .then(result => {
      sucMsg(event, '', 'Record Successfully added')
      // console.log('func childrenScrAddSave success', result)
    }).catch(e => {
      if (e.errno == 19) {

        errMsg(event, '', 'Duplicate registration ID is not allowed')
      }
      errMsg(event, '', 'Record not saved, plz try again or contact admin')
      console.log(e)
      // console.log('func childrenScrAddSave error', e)
    })
}
// Screening PLW Add 
function plwNewScrAddSave(event, data, client, username, project) {
  // data.client_id = client;
  data.username = username;
  data.project = project;
  data.upload_status = 0;
  knex('tblScrPlw')
    .insert(data)
    .then(result => {
      sucMsg(event, '', 'Record Successfully added')
      console.log('func childrenScrAddSave success', result)
    }).catch(e => {
      errMsg(event, '', 'Record not saved, plz try again or contact admin')
      console.log('func childrenScrAddSave error', e)
    })
}

// // Screening Children update 
// function childrenScrUpdSave(event, data) {
//   data.upload_status = 2;
//   knex('tblScrChildren')
//     .update(data)
//     .where('ch_scr_id', data.ch_scr_id)
//     .then(result => {
//       sucMsg(event, '', 'Record updated successfully')
//       console.log('func childrenScrUpdSave success', result)
//     }).catch(e => {
//       errMsg(event, '', 'Record not updated, plz try again or contact admin')
//       console.log('func childrenScrUpdSave error', e)
//     })
// }
// // Screening PLW NEW update 
// function plwNewScrUpdSave(event, data) {
//   data.upload_status = 2;
//   knex('tblScrPlw')
//     .update(data)
//     .where('plw_scr_id', data.plw_scr_id)
//     .then(result => {
//       sucMsg(event, '', 'Record updated successfully')
//       console.log('func plwNewScrUpdSave success', result)
//     }).catch(e => {
//       errMsg(event, '', 'Record not updated, plz try again or contact admin')
//       console.log('func plwNewScrUpdSave error', e)
//     })
// }

async function _firstRunDb(knex, Promise) {
  try {
    // var x =  require('./migrations/20190128163134_Screening')   
    // await  require('./migrations/20190128163134_Screening').down(knex, Promise);
    // await require('./migrations/20190128163134_Screening').up(knex, Promise);
    // await require('./migrations/v3').up(knex, Promise);
    await require('./migrations/v4')(knex);
    fs.writeFileSync(`${process.env.APPDATA}/ACF MIS Local app/.dbcreated`,`${Date.now()} database created`,'utf8')
  } catch (error) {
    console.log(error)
    // await  require('./migrations/20190128163134_Screening').up(knex, Promise);    
  }
}
var db = require('./dbTest');
const request = require('request');
var rp = require('request-promise-native');

function isEmpty(arg) {
  for (var item in arg) {
    return false;
  }
  return true;
}
// const bParser = require('body-parser');

// app.use(bParser.json());
// first run check

function _newfirstRun() {
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize
  var client_id = imran.client;
  runFirst = new BrowserWindow({
    width,
    height,
    title: 'first Run'
  });

  runFirst.loadURL(url.format({
    pathname: path.join(__dirname, '/html/firstRunNew.html'),
    protocol: 'file:',
    slashes: true
  }));

  runFirst.on('closed', function () {
    runFirst = null;
  })

  runFirst.on('close', function () {
    runFirst = null;
  })
}

function firstRun() {
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize
  var client_id = imran.client;
  runFirst = new BrowserWindow({
    width,
    height,
    title: 'first Run'
  });

  runFirst.loadURL(url.format({
    pathname: path.join(__dirname, '/html/firstRun.html'),
    protocol: 'file:',
    slashes: true
  }));

  ipcMain.on('firstRun', (e, firstRunInfo) => {
    require('getmac').getMac((e, mac) => {
      console.log(firstRunInfo);
      var usernameL = firstRunInfo.username.toLowerCase();
      usernameL = usernameL.replace(/\s+/g, '');

      var org_nameL = firstRunInfo.org_name.toLowerCase();
      org_nameL = org_nameL.replace(/\s+/g, '');

      var project_nameL = firstRunInfo.project_name.toLowerCase();
      project_nameL = project_nameL.replace(/\s+/g, '');

      var passwordL = firstRunInfo.password.toLowerCase();
      passwordL = passwordL.replace(/\s+/g, '');

      var client = firstRunInfo.client.toLowerCase();
      client = client.replace(/\s+/g, '');

      var configInformation = {
        usernameL,
        org_nameL,
        project_nameL,
        passwordL,
        client,
      }

      configInformation.mac = mac
      console.log(mac)




      console.log(configInformation)

      var thisJson = JSON.stringify(configInformation);
      var regData = {
        client_id: client,
        mac: mac
      }
      request({
        url: serverUrl + '/app_register',
        method: 'POST',
        body: {
          client_id: client,
          mac: mac
        },
        json: true
      }, function (err, response, body) {
        console.log(body)
        if (err) {
          runFirst.webContents.send('firstRunResponse', ({
            err: err
          }))
        } else {
          console.log(body)
          fs.writeFile('config.json', thisJson, 'utf8', (err) => {
            if (err) {
              runFirst.webContents.send('firstRunResponse', ({
                err: err
              }))
            } else {
              runFirst.webContents.send('firstRunResponse', ({
                success: 1,
                msg: 'Your configuration is saved, thanks!!'
              }))
            }
          });
        }
      })

      // fs.writeFile('config.json', thisJson, 'utf8', (err) => {
      //   if (err) {
      //     runFirst.webContents.send('firstRunResponse', ({
      //       err: err
      //     }))
      //   } else {
      //     runFirst.webContents.send('firstRunResponse', ({
      //       success: 1,
      //       msg: 'Your configuration is saved, thanks!!'
      //     }))
      //   }
      //   });
    })
  })

  runFirst.on('closed', function () {
    runFirst = null;
  })

  runFirst.on('close', function () {
    runFirst = null;
  })
}
let mainWindow;

function creatWindow() {

  var config = {};
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow({
    width,
    height,
    show: false
    // frame: false
  });

  majorDbUpdate = new BrowserWindow({
    width: 600,
    height: 400,
    show: false,
    frame: false
  });


  ipcMain.on('major-update-done', () => {
    console.log('This was called - Major-update-done')
    app.exit();
    app.relaunch();
    // majorDbUpdate.close();
    // mainWindow.maximize();
  })

  // mainWindow.fullscreen = true;
  fs.stat(`${process.env.APPDATA}/ACF MIS Local app/config.json`, function (err, stat) {
    if (err == null) {
      console.log('File exists');
      mainWindow.once('ready-to-show', () => {
        imran = config = JSON.parse(fs.readFileSync(`${process.env.APPDATA}/ACF MIS Local app/config.json`, 'utf8'));

        majorDbUpdate.loadURL(url.format({
          pathname: path.join(__dirname, '/html/majorDbUpdate.html'),
          protocol: 'file:',
          slashes: true,
        }));

        // if (Array.isArray(imran)) {
        //   console.log(imran)
        //   mainWindow.maximize();
        // } else {
        knex.schema.hasTable('tblUpdateTracker').then(function (exists) {
          if (!exists) {
            majorDbUpdate.show();
          } else {
            mainWindow.maximize();

          }
        })

        // }




        // mainWindow.maximize();
        // fs.stat(`${process.env.APPDATA}/ACF MIS Local app/majorUpd.json`, function (e, stat) {
        //   if (e) {
        //   } else {
        //     mainWindow.maximize();
        //   }
        // })

        // mainWindow.show()

      });
    } else if (err.code == 'ENOENT') {
      // file does not exist
      _newfirstRun()
      // firstRun();
      // firstRunDB(knex);
      _firstRunDb(knex, Promise);
      var version = app.getVersion();
      var regex = /([/./])/g;
      version.replace(regex, '');
      fs.writeFileSync(`${process.env.APPDATA}/ACF MIS Local app/.nv`, version, 'utf8')

    } else {
      console.log('Some other error: ', err.code);
    }
  });
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/html/index3.html'),
    protocol: 'file:',
    slashes: true
  }));

  ipcMain.on('getProvince', (evt) => {
    geo.provincev2(evt)

    // console.log(ipcMain.getMaxListeners())
  })
  ipcMain.on('getCommodity', (evt, prog_type) => {
    // geo.commodity(evt)
    geo.commodityv2(evt, prog_type);
    // console.log(ipcMain.getMaxListeners())
  })
  ipcMain.on('getCommodityAll', (evt) => {
    // geo.commodity(evt)
    geo.commodity(evt);
    // console.log(ipcMain.getMaxListeners())
  })
  ipcMain.on('getDistrict', function (event, prov) {
    console.log(prov)
    geo.districtv2(prov, event);
  });
  ipcMain.on('getTehsil', function (event, dist) {
    geo.tehsilv2(dist, event);
    console.log(dist)
  });
  ipcMain.on('getUC', function (event, tehs) {
    console.log(tehs)
    geo.ucv2(tehs, event);

  });
  ipcMain.on('getHealthHouse', function (event, ucs) {
    console.log(ucs)
    geo.healthHousev2(ucs, event);
  });
  ipcMain.on('getHealthHouseType', function (event, h_id) {
    console.log(h_id)
    geo.healthHouseTypev2(h_id, event);
  });
  ipcMain.on('nav', function (e, arg) {
    if (arg === 'child') {
      scrAddChild();
    } else if (arg === 'plw') {
      scrAddPlw();
    } else if (arg === 'report') {
      scrReports();
    } else if (arg === 'scrUpdate') {
      myUpdate();
    } else if (arg === 'scrChUpd') {
      scrChUpd();
    } else if (arg === 'scrPlUpd') {
      scrPlUpd();
    } else if (arg === 'otpAdd') {
      otpAdd();
    } else if (arg === 'addVill') {
      addVill();
    } else if (arg === 'addFollowupOtp') {
      // otpExit();
      addFollowupOtp();
    } else if (arg === 'otpExit') {
      otpExit();
      // addFollowupOtp();
    } else if (arg === 'otpAddUpdate') {
      otpAddUpdate();
    } else if (arg === 'otpExitEdit') {
      otpExitEdit();
    } else if (arg === 'sessions') {
      sessions();
    } else if (arg === 'otpReport') {
      otpReports();
    } else if (arg === 'defReport') {
      defReports();
    } else {
      console.log('error');
    }
  })

  //Adding Screening - Child
  ipcMain.on('scrChildAdd', (evt, data) => {
    console.log(data);
    knex('Screening')
      .insert(data)
      .then(result => {
        console.log({
          scrChildSucess: result
        })
        sucMsg(evt, 'scrChildAdd', `Screening - Children: ${result.length} records added successfully`)
      })
      .catch(e => {
        console.log({
          scrChildError: e
        })
        errMsg(evt, 'scrChildAdd', `Screening - Children: records not added please check again or contact system admin`)
      })
  });
  //Adding Screening - PLW
  ipcMain.on('scrPlwAdd', (evt, data) => {
    console.log(data);
    knex('Screening')
      .insert(data)
      .then(result => {
        console.log({
          scrPlwSucess: result
        })
        sucMsg(evt, 'scrPlwAdd', `Screening - Plw: ${result.length} records added successfully`)
      })
      .catch(e => {
        console.log({
          scrChildError: result
        })
        errMsg(evt, 'scrPlwAdd', `Screening - Plw: records not added please check again or contact system admin`)
      })
  })
  // Adding OTP Admission
  ipcMain.on('submitOtpAdd', function (event, addOtpData) {
    console.log({
      location: 'otp add, channel submitOtpAdd',
      formData: addOtpData
    })
    otpAddDataSave(event, addOtpData, config, imran.client);
  });

  // Followup interm data for followup add
  ipcMain.on('getInterim', (event, data) => {
    followupIntermData(event, data);
  })
  // follow up adding records;
  ipcMain.on('addFollowup', (e, item) => {
    followupAddData(e, item);
  });
  // sending all admission for exit
  ipcMain.on('getOtpAll', (e, site_id) => {
    otpAddDataForExit(e, site_id);
  });
  // to add exit record
  ipcMain.on('otpExitAdd', (e, data) => {
    console.log(data);
    otpExitAddDataSave(e, data, imran.client);
  })

  // adding (inserting) one session 
  ipcMain.on('insertSessionsSingle', (e, item) => {
    sessionsDataSave(e, item, config, imran.client);
  })


  // Screening Update: Children sending data 
  ipcMain.on('getScrChAll', function (e, qry) {
    allScreeningData(e, qry)
  })
  // Screening Update: Children edit (update) record
  ipcMain.on('updScrChSingle', function (e, data) {
    screeningChUpDataSave(e, data);
  })

  // Screening Update: PLW sending data 
  ipcMain.on('getScrPlwAll', function (e, qry) {
    allScreeningDataPlw(e, qry)
  })
  // Screening Update: PLW edit (update) record
  ipcMain.on('updScrPlwSingle', function (e, data) {
    screeningPlUpdDataSave(e, data);
  })

  // Admission Update: sending all data 
  ipcMain.on('allOtp', (e, site_id) => {
    allOtpAddUpdData(e, site_id);
  })


  // Exit Update: sending all data
  ipcMain.on('get', (e, site_id) => {
    allExitData(e, site_id);
  })

  ipcMain.on('stockEntry', (e, data) => {
    stockSave(e, data);
  })

  //  console.log(app.getVersion());

  // children Screening add Data 
  ipcMain.on('scrChildren', (e, data) => {
    console.log(data);
    childrenScrAddSave(e, data, imran.client, imran.usernameL, imran.project_nameL);
    // (e,data);
  })
  // PLW New Screening add Data 
  ipcMain.on('scrPlwNewAdd', (e, data) => {
    console.log(data);
    plwNewScrAddSave(e, data, imran.client, imran.usernameL, imran.project_nameL, );
  })

  ipcMain.on('allScrPlwNew', (e, data) => {
    console.log('data from html on chanel allScrPlwNew', data)
    allScrPlwNewUpdData(e, data)
  })



  ipcMain.on('scrChildReport', (e, qry) => {
    async.parallel({
      summary: (cb) => {
        db.scrChildReport(qry, (err, result) => {
          if (err) {
            cb(err)
            console.log(err);
          } else {
            cb(null, result)
          }
        })
      },
      single: (cb) => {
        db.allScrChildrenData(qry, (err, result) => {
          if (err) {
            console.log(err);
            cb(err)
          } else {

            cb(null, result)
          }
        })
      }
    }, (err, results) => {
      if (err) {
        errMsg(e, '', 'Report db query error, plz try again or contact admin')
        console.log(err);
      } else {
        console.log(results);

        e.sender.send('scrChildReport', ({
          result: results
        }))
      }
    })
  });

  ipcMain.on('scrPlwNewReport', (e, qry) => {
    async.parallel({
      summary: (cb) => {
        db.scrPlwNewReport(qry, (err, result) => {
          if (err) {
            cb(err)
            console.log(err);
          } else {
            cb(null, result)
          }
        })
      },
      single: (cb) => {
        db.allScrPlwNewData(qry, (err, result) => {
          if (err) {
            cb(err)
            console.log(err);
          } else {
            cb(null, result)
          }
        })
      }
    }, (err, results) => {
      if (err) {
        errMsg(e, '', 'Report db query error, plz try again or contact admin')
        console.log(err);
      } else {
        // console.log(results);

        e.sender.send('scrPlwNewReport', ({
          result: results
        }))
      }
    })
  });

  ipcMain.on('addExitReport', (e, qry) => {
    if (isEmpty(qry)) {
      errMsg(e, '', 'Atleast one item need to be selected')
    } else {
      async.parallel({
        add: (cb) => {
          db.AdmissionsReport(qry, (err, result) => {
            if (err) {
              cb(err)
            } else {
              cb(null, result)
            }
          })
        },
        exit: (cb) => {
          db.ExitReport(qry, (err, result) => {
            if (err) {
              cb(err)
            } else {
              cb(null, result)
            }
          })
        },
        addTable: (cb) => {
          db.otpAddTable(qry, (err, result) => {
            if (err) {
              cb(err)
            } else {
              cb(null, result)
            }
          })
        },
        exitTable: (cb) => {
          db.otpExitTable(qry, (err, result) => {
            if (err) {
              cb(err)
            } else {
              cb(null, result)
            }
          })
        }
      }, (err, results) => {
        if (err) {
          console.log(err)
          errMsg(e, '', 'DB error please try again or contact admin')
        } else {
          console.log(results)
          e.sender.send('addExitReport', results)
        }
      })
    }
  })
  // Build main menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

  // Emitted when the window is closed.
  mainWindow.on('closed', function (e) {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // console.log(e)
  mainWindow = null
    app.quit();
  })
}
//Creating main window
app.on('ready', creatWindow);


// Electron auto updator
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
  mainWindow.webContents.send('updateNote', 'Update Available')
})
autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
})
autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
})


autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  // mainWindow.webContents.send('__updateProgress', progressObj.percent)
  mainWindow.webContents.send('__updateProgress', progressObj.percent)
  console.log(progressObj)
})
autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('updateDownloaded', 'downloaded')

  console.log('Update downloaded');
});

ipcMain.on('updateNIMS', e => {
  autoUpdater.quitAndInstall();
})


app.on('ready', async () => {

  autoUpdater.checkForUpdatesAndNotify();

})

ipcMain.on('getVersion', (e) => {
  e.returnValue = app.getVersion();
})

// Creating Screening : Reports
function scrReports() {
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize

  scrReport = new BrowserWindow({
    width,
    height,
    title: 'Screening: Reports'
  });
  scrReport.loadURL(url.format({
    pathname: path.join(__dirname, '/html/scrReports.html'),
    protocol: 'file:',
    slashes: true
  }));
  ipcMain.on('scrRpt_getProvince', function (event) {
    geo.province(scrReport);
  });
  ipcMain.on('scrRpt_getDistrict', function (event, prov) {
    console.log(prov)
    geo.district(prov, scrReport);
  });
  ipcMain.on('scrRpt_getTehsil', function (event, dist) {
    geo.tehsil(dist, scrReport);
    console.log(dist)
  });
  ipcMain.on('scrRpt_getUC', function (event, tehs) {
    console.log(tehs)
    geo.uc(tehs, scrReport);

  });
  ipcMain.on('scrRpt_getHealthHouse', function (event, ucs) {
    console.log(ucs)
    geo.healthHouse(ucs, scrReport);

  });

  ipcMain.on('data', function (e, arg) {
    var x = arg;
    if (arg === 0) {
      x = null;
    }
    async.parallel({
      summary: (cb) => {
        db.scrSummary(x, (err, res) => cb(err, res));
      },
      plw: (cb) => {
        db.scrPlw(x, (err, res) => cb(err, res))
      },
      child: (cb) => {
        db.scrChild(x, (err, res) => cb(err, res))
      }
    }, (err, results) => {
      console.log(err, results);
      scrReport.webContents.send('data', ({
        data: results
      }))
      results = null;
    })
    // db.test(1, (err, res)=>{
    //   console.log(err, res);
    // })
    // async.parallel({
    //   summary: function(callback){
    //     db.scrSummary(x, (err, result)=>{
    //       callback(err, result)
    //     })
    //   },
    //   plw: function(callback){
    //     db.scrPlw(x, (err, result)=>{
    //     callback(err, result)
    //     })
    //   }
    //   ,
    //   child: function(callback){
    //     db.scrChild(x, (err, result)=>{
    //       callback(err, result)
    //     })
    //   }
    // }, (err, results)=>{
    //   if(err) return console.log(err);
    //   scrReport.webContents.send('data',({
    //   data:results
    //   }))
    // })
    console.log('test scr report' + arg)
  })
  scrReport.on('close', function () {
    var myChan = ['scrRpt_getProvince',
      'scrRpt_getDistrict',
      'scrRpt_getTehsil',
      'scrRpt_getUC',
      'scrRpt_getHealthHouse',
      'data'
    ]
    for (const i in myChan) {
      ipcMain.removeAllListeners(myChan[i])
      console.log('channel removed ', myChan[i])
    }
    scrReport = null;
  })
}

// Creating Screening : Reports
function defReports() {
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize

  reportDef = new BrowserWindow({
    width: 250,
    height: 250,
    title: 'Defauler: Reports'
  });
  reportDef.loadURL(url.format({
    pathname: path.join(__dirname, '/html/defaulter.html'),
    protocol: 'file:',
    slashes: true
  }));


  ipcMain.on('data', function (e, arg) {
    console.log('defaulter report' + arg)
    knex('v_defaulter')
      .then(result => {
        console.log(result);
        reportDef.webContents.send('data', {
          result: result
        })
      })
      .catch(e => {
        console.log(e);
      })

  })


  reportDef.on('close', function () {
    var myChan = ['data']
    for (const i in myChan) {
      ipcMain.removeAllListeners(myChan[i])
      console.log('channel removed ', myChan[i])
    }
    reportDef = null;
  })
}


// Creating Screening : Reports
function otpReports() {
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize

  reportOtp = new BrowserWindow({
    width,
    height,
    title: 'OTP: Reports'
  });
  reportOtp.loadURL(url.format({
    pathname: path.join(__dirname, '/html/otpReportv1.html'),
    protocol: 'file:',
    slashes: true
  }));
  ipcMain.on('otpRpt_getProvince', function (event) {
    geo.province(reportOtp);
  });
  ipcMain.on('otpRpt_getDistrict', function (event, prov) {
    console.log(prov)
    geo.district(prov, reportOtp);
  });
  ipcMain.on('otpRpt_getTehsil', function (event, dist) {
    geo.tehsil(dist, reportOtp);
    console.log(dist)
  });
  ipcMain.on('otpRpt_getUC', function (event, tehs) {
    console.log(tehs)
    geo.uc(tehs, reportOtp);

  });
  ipcMain.on('otpRpt_getHealthHouse', function (event, ucs) {
    console.log(ucs)
    geo.healthHouse(ucs, reportOtp);

  });

  ipcMain.on('data', function (e, arg) {
    var x = arg;
    if (arg === 0) {
      x = null;
    }
    async.parallel({
      add: (cb) => {
        db.otpAdd(x, (err, res) => cb(err, res));
      },
      exit: (cb) => {
        db.otpExit(x, (err, res) => cb(err, res))
      },
      AddTable: (cb) => {
        db.otpAddTable(x, (err, res) => cb(err, res))
      },
      ExitTable: (cb) => {
        db.otpExitTable(x, (err, res) => cb(err, res))
      }
    }, (err, results) => {
      console.log(err, results);
      reportOtp.webContents.send('data', ({
        data: results
      }))
      results = null;
    })
    // db.test(1, (err, res)=>{
    //   console.log(err, res);
    // })
    // async.parallel({
    //   summary: function(callback){
    //     db.scrSummary(x, (err, result)=>{
    //       callback(err, result)
    //     })
    //   },
    //   plw: function(callback){
    //     db.scrPlw(x, (err, result)=>{
    //     callback(err, result)
    //     })
    //   }
    //   ,
    //   child: function(callback){
    //     db.scrChild(x, (err, result)=>{
    //       callback(err, result)
    //     })
    //   }
    // }, (err, results)=>{
    //   if(err) return console.log(err);
    //   scrReport.webContents.send('data',({
    //   data:results
    //   }))
    // })
    console.log('test otp report' + arg)
  })
  reportOtp.on('close', function () {
    var myChan = ['otpRpt_getProvince',
      'otpRpt_getDistrict',
      'otpRpt_getTehsil',
      'otpRpt_getUC',
      'otpRpt_getHealthHouse',
      'data'
    ]
    for (const i in myChan) {
      ipcMain.removeAllListeners(myChan[i])
      console.log('channel removed ', myChan[i])
    }
    reportOtp = null;
  })
}
// Creating Admin : Geo Refference
function createGeoWindow() {
  addScrPlw = new BrowserWindow({
    width: 800,
    height: 800,
    title: 'Screening: Reports'
  });
  addScrPlw.loadURL(url.format({
    pathname: path.join(__dirname, '/html/geo.html'),
    protocol: 'file:',
    slashes: true
  }));

  addScrPlw.on('close', function () {
    addScrPlw = null;
  })
}


// Creating Admin : Geo Refference
function runDemo() {
  demo = new BrowserWindow({
    width: 800,
    height: 800,
    title: 'Demo'
  });
  demo.loadURL(url.format({
    pathname: path.join(__dirname, '/html/demo.html'),
    protocol: 'file:',
    slashes: true
  }));
  ipcMain.on('addDemo', function (event, name) {
    knex.insert({
      yourName: name,
      client_id: '1234'
    }).into('tblDemo').then((ret) => {
      if (ret.length > 0) {
        demo.webContents.send('resultSent', ({
          'msg': 'Successfully added'
        }))
      }
    }).catch((err) => {
      demo.webContents.send('resultSent', ({
        'msg': 'record not added failed'
      }))
    })
  })
  demo.on('close', function () {
    demo = null;
  })
}

const mac = '01:02:03:0a:0b:0c';
const appKey = 'A4C74FBD-2375-496E-97BA-C4C3E4D3F868';
// Creating Admin : sync Refference
async function newSync() {
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize

  // console.log(imran);
  var surl = await _serverUrl();
  surl = surl[0].value;
  console.log(surl);
  syncNew = new BrowserWindow({
    width,
    height,
    title: 'System: Sync'
  });
  syncNew.loadURL(url.format({
    pathname: path.join(__dirname, '/html/newSync.html'),
    protocol: 'file:',
    slashes: true
  }));

  syncNew.on('close', function () {
    var myChan = ['err', 'success',
      'updateServer',
      'errUpdDb',
      'successUpdDb',
      'updateDB'
    ]
    for (const i in myChan) {
      ipcMain.removeAllListeners(myChan[i])
      console.log('channel removed ', myChan[i])
    }
    syncNew = null;
  })
}

// console.log({
//   node_env : process.env
// })
// process.env.NODE_ENV = 'production';
// Create menu template



const mainMenuTemplate = [
  // Each object is a dropdown
  {
    label: 'File',
    submenu: [{
      label: 'Quit',
      accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
      click() {
        app.quit();
      }
    }]
  },
  {
    label: 'Tools',
    submenu: [{
        label: 'Backup',
        accelerator: process.platform == 'darwin' ? 'Command+B' : 'Ctrl+B',
        click() {
          dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'openDirectory']
          }, (file) => {
            if (file) {
              var _filedate = new Date();
              // _filedate.toISOString().split('T')[0]
              fs.copyFile(`${process.env.APPDATA}/ACF MIS Local app/acf_mis_local.sqlite3`, `${file[0]}\\acf_backup_${_filedate.toISOString().split('T')[0]}`, (err) => {
                if (err) throw err;
                fs.writeFile(`${process.env.APPDATA}/ACF MIS Local app/__backupPath`, `${file[0]}\\acf_backup_${_filedate.toISOString().split('T')[0]}`, (err) => {
                  if (err) throw err;
                  console.log('File coppied and path is saved')
                })
              })
            } else {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Backup',
                message: 'Backup not created as you canceled the process'
              })
            }
          })
        }
      },
      {
        label: 'Restore',
        click() {
          var _filedate = new Date();
          dialog.showOpenDialog(mainWindow, {
            properties: ['openFile']
          }, (file) => {
            if (file) {
              console.log(file)
              app.quit();
              fs.copyFile(`${process.env.APPDATA}/ACF MIS Local app/acf_mis_local.sqlite3`, `${file[0]}_old`, (err) => {
                if (err) throw err;
                fs.copyFile(file[0], `${process.env.APPDATA}/ACF MIS Local app/acf_mis_local.sqlite3`, (err) => {
                  if (err) throw err;
                  console.log('System restoted')
                })
              })
            } else {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Restore',
                message: 'System not restored'
              })
            }
          })

        }
      }

    ]
  },

];

var new_menu = {
  label: 'View',
  submenu: [{
      label: 'Reload',
      // role: 'reload',
      accelerator: process.platform == 'darwin' ? 'Command+R' : 'Ctrl+R',
      click(item, focusedWindow) {
        if (focusedWindow) focusedWindow.reload()
      }
    },
    // },    
    {
      label: 'Toggle Developer Tools',
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click(item, focusedWindow) {
        if (focusedWindow) focusedWindow.webContents.toggleDevTools()
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Actual Zoom',
      role: 'resetzoom',
      accelerator: false
    },
    {
      label: 'Zoom In',
      role: 'zoomin',
      accelerator: false
    },
    {
      label: 'Zoom Out',
      role: 'zoomout',
      accelerator: false,
    },
    {
      type: 'separator'
    },
    {
      label: 'Full Screen',
      role: 'togglefullscreen',

      accelerator: false,

    }
  ]
};

mainMenuTemplate.push(new_menu)


app.on('window-all-closed', () => {
  app.quit()
})
// External files;

var clientMessages = {
  sucMsg,
  errMsg
};

require("./mainfunc/supervisors")(ipcMain, knex, fs, clientMessages);
require("./mainfunc/stafflist")(ipcMain, knex, fs, clientMessages);
require("./mainfunc/villagelist")(ipcMain, knex, fs, clientMessages);
// Managing OTP EXIT Update and Delete
require("./mainfunc/otpExitUpd")(ipcMain, knex, fs, clientMessages, async);
// Managing OTP Addmision Update and delete
require("./mainfunc/otpAddUpd")(ipcMain, knex, fs, clientMessages, async);
// Managing PLW Screening  Update and delete
require("./mainfunc/scrPlwUpd")(ipcMain, knex, fs, clientMessages, async);
// Managing Children Screening  Update and delete
require("./mainfunc/scrChUpd")(ipcMain, knex, fs, clientMessages, async);
// Managing Sessions Add, Update and delete
require("./mainfunc/sessions")(ipcMain, knex, fs, clientMessages, async, imran.client, localDate);
// Managing Sessions Report
require("./mainfunc/sessionReport")(ipcMain, knex, fs, clientMessages, async, imran.client, localDate);
// Managing Site Stock out
require("./mainfunc/siteStockOut")(ipcMain, knex, fs, clientMessages, async);
// Managing Stock Distribution
require("./mainfunc/stockDist")(ipcMain, knex, fs, clientMessages, async);
// Managing Dashboard
// require("./mainfunc/dashboard")(ipcMain, knex, fs, clientMessages, async);
require("./mainfunc/dashboard")(ipcMain, knex, fs, clientMessages, async);
// Managing OTP Add and Exit Report
require("./mainfunc/otpAddExitReport")(ipcMain, knex, fs, clientMessages, async);
// Managing Sync with Auth
require("./mainfunc/syncwithauth")(ipcMain, knex, fs, clientMessages, async, request, rp);
// Managing Update of StockIn
require("./mainfunc/stockInUpdate")(ipcMain, knex, fs, clientMessages, async);

// Future db updates

// require('./mainfunc/updateDb');

// require('./mainfunc/dbUpdateFinal')(knex);
// require('./mainfunc/exitAdditionalColumns')();

// require('./mainfunc/dbUpdates/v3DbUpdates').v3Database();

// require('./mainfunc/v3_updates/v3_0_3');
// require('./mainfunc/v3_updates/v3_0_8');
// require('./mainfunc/v3_updates/v3_0_9');

// database update block
fs.stat(`${process.env.APPDATA}/ACF MIS Local app/.dbcreated`, (e) => {
  if (!e) {
    require('./mainfunc/v3_updates/v3_1_0')(app, dialog);
  }
})