module.exports = (ipcMain, knex, fs, sndMsg, async) => {
  //  Calling all data in table  
  ipcMain.on("allOtpExit", (event, filter) => {
    console.log(filter);
    var _tableName;
    var _limit = filter.pageSize ? filter.pageSize : 10;
    var _offset = filter.pageIndex == 1 ? 0 : (filter.pageIndex - 1) * _limit;
    filter.p_name = filter.p_name ? filter.p_name : ''
    filter.reg_id = filter.reg_id ? filter.reg_id : ''
    filter.site_village = filter.site_village ? filter.site_village : ''
    // console.log({ _limit, _offset });
    // console.log(`%${filter.site_village}%`);

    if(filter.prog_type == 'sc'){
      _tableName = 'allNSCExits'
      whereField = `site_name`
    }else if (filter.prog_type == 'otp'){
      _tableName = 'allOtpExits'
      whereField = `uc_name`
    }else{
      _tableName = '';
    }

    async.series({
        data: cb => {
          knex(_tableName)
            .where("p_name", "like", `%${filter.p_name}%`)
            // .where("site_village", "like", `%${filter.site_village}%`)
            .where("reg_id", "like", `%${filter.reg_id}%`)
            .where("province", "like", `%${filter.province}%`)
            .where("district_name", "like", `%${filter.district_name}%`)
            // .where("uc_name", "like", `%${filter.uc_name}%`)
            .where(whereField, "like", `%${filter[whereField]}%`)
            .where("tehsil_name", "like", `%${filter.tehsil_name}%`)
            // .where("prog_type", "like", `%${filter.prog_type}%`)
            // .where('report_month', 'like', `%${filter.report_month}%`)

            .where({
              is_deleted: 0
            })
            .limit(_limit)
            .offset(_offset)
            .then(result => cb(null, result))
            .catch(e => cb(e));
        },
        itemsCount: cb => {
          knex(_tableName)
            .where("p_name", "like", `%${filter.p_name}%`)
            // .where("site_village", "like", `%${filter.site_village}%`)
            .where("reg_id", "like", `%${filter.reg_id}%`)
            .where("province", "like", `%${filter.province}%`)
            .where("district_name", "like", `%${filter.district_name}%`)
            // .where("uc_name", "like", `%${filter.uc_name}%`)
            .where(whereField, "like", `%${filter[whereField]}%`)
            .where("tehsil_name", "like", `%${filter.tehsil_name}%`)
            // .where("prog_type", "like", `%${filter.prog_type}%`)
            .where({
              is_deleted: 0
            })
            .count("exit_id as total")
            .then(result => cb(null, result))
            .catch(e => cb(e));
        }
      },
      (e, result) => {
        if (e) {
          console.log(e)
          event.sender.send("allOtpExit", {
            err: e
          });
          // console.log(e);
        } else {
          event.sender.send("allOtpExit", {
            result
          });
          console.log(result)
          // console.log(result);
        }
      }
    );
  });
  // Method to delete (is_deleted = 1) for required tables (tblOtpExit and tblInterimOtp)
  ipcMain.on("deleteOtpExit", (event, item) => {
    // console.log(item);
    async.series({
        delSOtpExit: cb => {
          knex("tblOtpExit")
            .where({
              exit_id: item.exit_id
            })
            .update({
              is_deleted: 1
            })
            .then(result => {
              if (result) {
                knex("tblInterimOtp")
                  .where({
                    otp_id: item.otp_id
                  })
                  .update({
                    status: "open"
                  })
                  .then(result => {
                    cb(null, result);
                  });
              }
            })
            .catch(e => cb(e));
        }
      },
      (err, result) => {
        if (err) {
          // console.log(err);
          event.sender.send("deleteOtpExit", {
            err
          });
          sndMsg.errMsg(event, "", "Unable to delte record");
        } else {
          // console.log(result);
          event.sender.send("deleteOtpExit", {
            result
          });
          sndMsg.sucMsg(event, "", `Patient with id: ${item.exit_id} is sucessfully delted`);
        }
      }
    );
  });

};