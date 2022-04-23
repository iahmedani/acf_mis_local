const axios = require('axios');
const knex = require('../../mainfunc/db');
const fs = require('fs');
const _logger = require('electron-log');
// _logger.transports.console.level = false;

var newErr = false;
var intErr = false;
var newChunkSize = 1;
const logErrors = (error, data) => {
    var x = {error, data}
    x.serverResponse = error.precedingErrors.length ? JSON.stringify(error.precedingErrors) : JSON.stringify(error.originalError)
    x.data = data ? JSON.stringify(data) : '';
    _error = JSON.stringify(x)
// _logger.transports.console.level = false

    _logger.error(_error)
    newErr = true
}
const internalErr = (error, data) => {
    var x = {error, data}
    x.error = JSON.stringify(error)
    x.data = data ? JSON.stringify(data) : '';
    _error = JSON.stringify(x)
// _logger.transports.console.level = false

    _logger.error(_error)
    intErr = true
}

const _Errors = {
    register:false,
    requestError: false
}

module.exports.newSyncAuthV3 = function () {
    axios.defaults.timeout = 200000;
    

    const {
        client,
        mac
    } = JSON.parse(
        fs.readFileSync(`${process.env.APPDATA}/ACF MIS Local app/config.json`, "utf8")
    );
    var headers = {
        Authorization: `Bearer ${client} ${mac}`,
        'Content-Type': 'application/json'
    };
    var instance = axios.create({
        // baseUrl:surl,
        // timeout:10000,
        // timeout = 600000,
        headers
    })
    let elProgress = $('#progress')
    let elInfo = $('#information')
    // let counterT = $('#counterT')
    // let counterUploaded = $('#counterUpd')
    // let elNotuploaded = $('#notUploadedRecords')


    var uploadBtn = $('#uploadData')
    var updateBtn = $('#updateDb')

    async function updateData(table, column, data, update_val) {
        var upload_date = new Date().toJSON().split('T')[0]
        // console.log(data)
        try {
            if (data.insert.length) {
                for (datum of data.insert) {
                    await knex(table).update({
                        upload_status: update_val,
                        upload_date
                    }).where(column, '=', datum)
                }
            } else if (data.available.length) {
                for (datum of data.available) {
                    await knex(table).update({
                        upload_status: update_val,
                        upload_date
                    }).where(column, '=', datum)
                }
            }

        } catch (error) {
            // console.log(error)
            internalErr(error)
        }

    }

    async function uploadData(table, id_column, server_id_col, url, instance, title) {
        console.log(`${table} running uploading`)
        // _uploadedRecords = 0
        // _notUploaded = 0
        elInfo.text(`Preparing Data - ${title}`)
        var _tData = await knex(table).where({
            upload_status: 0
        }).orWhereNull('upload_date');
        if (_tData.length) {
            var newData = [];
            for (data of _tData) {
                data[server_id_col] = data[id_column];
                delete data[id_column];
                newData.push(data);
            }
            elInfo.text(`Uploading Started - ${title}`);
            // _totalRecords = newData.length;
            // counterT.text(`Total records for uploading ${_totalRecords}`);
            // counterUploaded.text(_uploadedRecords)
            var _div = (newData.length > newChunkSize) ? Math.floor(newData.length / newChunkSize) : 1;
            var _sendData = splitToChunks(newData, _div);
            for (_data of _sendData) {
                try {
                    var _x = await instance.post(url, _data)
                    // console.log(_x)
                    if(_x.data.code === 'EREQUEST'){
                        logErrors(_x.data, _data)
                        // _notUploaded = _notUploaded + newChunkSize
                        // elNotuploaded.text(_notUploaded)
                    } else if (Array.isArray(_x.data.insert) || Array.isArray(_x.data.available) && _x.data.length > 0) {
                        elInfo.text(`Uploading finished, updating NMIS - ${title}`)
                        await updateData(table, id_column, _x.data, 1)
                        elInfo.text(`NMIS updated - ${title}`)
                        // _uploadedRecords= _uploadedRecords+newChunkSize;
                        // counterUploaded.text(_uploadedRecords)
                        
                    }
                } catch (error) {
                    // console.log({error})
                    internalErr(error, _sendData)
                }
            }
        } else {
            elInfo.text(`No new data - ${title}`)
        }
    }

    // handles MNIS data updating for data which has been edited
    async function updateData_updated(table, column, data, update_val) {
        var upload_date = new Date().toJSON().split('T')[0]
        for (datum of data) {
            try {
                await knex(table).update({
                    upload_status: update_val,
                    upload_date
                }).where(column, '=', datum)
            } catch (error) {
                // console.log(error)
                internalErr(error, data)
            }
        }
    }

    async function uploadUpdatedData(table, id_column, server_id_col, url, instance, title) {
        elInfo.text(`Preparing updating data - ${title}`)
        // _uploadedRecords = 0
        // _notUploaded = 0
        var _tData = await knex(table).where({
            upload_status: 2
        }).whereNotNull('upload_date');
        if (_tData.length) {
            var newData = [];
            for (data of _tData) {
                data[server_id_col] = data[id_column];
                delete data[id_column];
                newData.push(data);
            }
            // _totalRecords = newData.length;
            // counterT.text(`Total records for updating ${_totalRecords}`);
            // counterUploaded.text(_uploadedRecords)
            var _div = (newData.length > newChunkSize) ? Math.floor(newData.length / newChunkSize) : 1;
            var _sendData = splitToChunks(newData, _div);
            elInfo.text(`Uploading updated data Started - ${title}`);
            for (_data of _sendData) {
                try {
                    var _x = await instance.put(url, _data)
                    if (_x.data.code === "EREQUEST") {
                        logErrors(_x.data, _data);
                        // _notUploaded = _notUploaded + newChunkSize
                        // elNotuploaded.text(_notUploaded)
                    }else if (Array.isArray(_x.data) && _x.data.length > 0) {

                        elInfo.text(`Uploading updated data finished, updating NMIS - ${title}`)
                        await updateData_updated(table, id_column, _x.data, 1)
                        elInfo.text(`NMIS updated - ${title}`)
                        // _uploadedRecords = _uploadedRecords + newChunkSize;
                        // _remainingRecords = _totalRecords - _uploadedRecords
                        // counterUploaded.text(_uploadedRecords + ' = ' + _remainingRecords)
                    }
                } catch (error) {
                    // console.log(error)
                    internalErr(error, _sendData)
                }
            }
        } else {
            elInfo.text(`No new data - ${title}`)
        }
    }

    async function uploadDataMultiple(table, id_column1, server_id_col1, id_column2, server_id_col2, url, instance, title) {
        console.log(`${table} running uploading`)
        elInfo.text(`Preparing data - ${title}`)
        // _uploadedRecords = 0
        // _notUploaded = 0
        var _tData = await knex(table).where({
            upload_status: 0
        }).orWhere({upload_status: null});
        if (_tData.length) {
            var newData = [];
            for (data of _tData) {
                data[server_id_col1] = data[id_column1];
                data[server_id_col2] = data[id_column2];
                delete data[id_column1];
                delete data[id_column2];
                newData.push(data);
            }
            elInfo.text(`Uploading Started - ${title}`);
            // _totalRecords = newData.length;
            // counterT.text(`Total records for uploading ${_totalRecords}`);
            // counterUploaded.text(_uploadedRecords)
            var _div = (newData.length > newChunkSize) ? Math.floor(newData.length / newChunkSize) : 1;
            var _sendData = splitToChunks(newData, _div);
            // var _sendData = splitToChunks(newData, 30);
            for (_data of _sendData) {
                try {
                    var _x = await instance.post(url, _data)
                    if (_x.data.code === "EREQUEST") {
                        logErrors(_x.data, _data)
                        // _notUploaded = _notUploaded + newChunkSize
                        // elNotuploaded.text(_notUploaded)
                    }else if (Array.isArray(_x.data.insert) || Array.isArray(_x.data.available) && _x.data.length > 0) {
                        elInfo.text(`Uploading finished, updating NMIS - ${title}`)
                        await updateData(table, id_column1, _x.data, 1)
                        elInfo.text(`NMIS Updated - ${title}`)
                        // _uploadedRecords = _uploadedRecords + newChunkSize;
                        // _remainingRecords = _totalRecords - _uploadedRecords
                        // counterUploaded.text(_uploadedRecords + ' = ' + _remainingRecords)
                    }
                } catch (error) {
                    // console.log({error})
                    internalErr(error, _sendData)
                }
            }
        } else {
            elInfo.text(`No new data - ${title}`)
        }
    }

    async function uploadUpdatedDataMultiple(table, id_column1, server_id_col1, id_column2, server_id_col2, url, instance, title) {
        elInfo.text(`Preparing updated data - ${title}`)
        // _uploadedRecords = 0
        // _notUploaded=0

        var _tData = await knex(table).where({
            upload_status: 2
        });
        if (_tData.length) {
            var newData = [];
            for (data of _tData) {
                data[server_id_col1] = data[id_column1];
                data[server_id_col2] = data[id_column2];
                delete data[id_column1];
                delete data[id_column2];
                newData.push(data);
            }
            elInfo.text(`Uploading updated data started - ${title}`);
            // _totalRecords = newData.length;
            // counterT.text(`Total records for update ${_totalRecords}`);
            // counterUploaded.text(_uploadedRecords)
            var _div = (newData.length > newChunkSize) ? Math.floor(newData.length / newChunkSize) : 1;
            var _sendData = splitToChunks(newData, _div);
            for (_data of _sendData) {
                try {
                    var _x = await instance.put(url, _data)
                    if (_x.data.code === "EREQUEST") {
                        logErrors(_x.data, _data)
                        // _notUploaded = _notUploaded + newChunkSize
                        // elNotuploaded.text(_notUploaded)
                    }else if (Array.isArray(_x.data) && _x.data.length > 0) {
                        elInfo.text(`Uploading updated data finished, updating NMIS - ${title}`)
                        await updateData_updated(table, id_column1, _x.data, 1)
                        elInfo.text(`NMIS Updated - ${title}`)
                        // _uploadedRecords = _uploadedRecords + newChunkSize;
                        // _remainingRecords = _totalRecords - _uploadedRecords
                        // counterUploaded.text(_uploadedRecords + ' = ' + _remainingRecords)
                    }
                } catch (error) {
                    // console.log(error)
                    internalErr(error, _sendData)
                }
            }
        } else {
            elInfo.text(`No new data - ${title}`)
        }
    }

    async function getAndUpdateBasicData(table, id_column, url, instance, title) {
        elInfo.text(`Requesting server for data - ${title}`)
        console.log(url)
        try {
            var _data = await instance.get(url);
            if (_data.data.code === "EREQUEST") {
                logErrors(_data.data)
            }else
             if (Array.isArray(_data.data) && _data.data.length > 0) {
                _Errors.register = false

                // console.log(_data)
                elInfo.text(`Updating NMIS - ${title}`)
                for (datum of _data.data) {
                    // console.log(datum)
                    // var _id = datum[id_column];
                    // delete datum[id_column]
                    delete datum.isActive;
                    try {
                        var _check = await knex(table).where(id_column, datum[id_column]);
                        if (_check.length == 0) {
                            await knex(table).insert(datum);
                            elInfo.text(`NMIS updated - ${title}`)
                        }
                    } catch (error) {
                        // console.log(error)
                        internalErr(error)
                    }
                }
            }
        } catch (error) {
            // console.log({error})
            internalErr(error)
        }

    }

    async function getAndUpdateBasicData1(table, id_column, colName, url, instance, title) {
        elInfo.text(`Requesting server for data - ${title}`)
        console.log(url)
        try {
            var _data = await instance.get(url);
            if (_data.data.code === "EREQUEST") {
                logErrors(_data.data)
            }else if (Array.isArray(_data.data) && _data.data.length > 0) {
                _Errors.register = true

                // console.log(_data)
                elInfo.text(`Updating NMIS - ${title}`)
                for (datum of _data.data) {
                    // console.log(datum)
                    // var _id = datum[id_column];
                    // delete datum[id_column]
                    // delete datum.isActive;
                    try {
                        var _check = await knex(table).where(id_column, datum[id_column]);
                        // console.log(_check)
                        if (_check.length == 0) {
                            await knex(table).insert(datum);
                            elInfo.text(`NMIS updated - ${title}`)
                        } else if (_check.length == 1 && datum[colName] != _check[0][colName]) {
                            await knex(table).where(id_column, datum[id_column]).update(colName, datum[colName]);
                            elInfo.text(`NMIS updated - ${title}`)
                            // console.log('getAndUpdateBasicData1')
                        } else if (datum.isActive != _check[0].isActive) {
                            await knex(table).where(id_column, datum[id_column]).update('isActive', datum.isActive);
                            elInfo.text(`NMIS updated - ${title}`)
                        }
                    } catch (error) {
                        // console.log(error)
                        internalErr(error)
                    }
                }
            }
        } catch (error) {
            // console.log(error)
            // _Errors.requestError = true;
            internalErr(error)
        }

    }
    async function getAndUpdateBasicData2(table, id_column, colName, url, instance, title) {
        console.log(`${table} table update request Initiated`)
        elInfo.text(`Requesting server for data - ${title}`)
        // console.log(url)
        try {
            var _data = await instance.get(url);
            // console.log({_data})
            if (_data.data.code === "EREQUEST") {
                logErrors(_data.data)
            }else if (Array.isArray(_data.data) && _data.data.length > 0) {
                _Errors.register = false 
                // console.log(_data)
                elInfo.text(`Updating NMIS - ${title}`)
                for (datum of _data.data) {
                    // console.log(datum)
                    // var _id = datum[id_column];
                    // delete datum[id_column]
                    // delete datum.isActive;
                    try {
                        var _check = await knex(table).where(id_column, datum[id_column]);
                        // console.log(_check)
                        if (_check.length == 0) {
                            await knex(table).insert(datum);
                            elInfo.text(`NMIS updated - ${title}`)

                        } else if (_check.length == 1 && datum[colName] == _check[0][colName] && datum.isActive == _check[0].isActive) {
                            var _newDatum = datum;
                            delete _newDatum[id_column]
                            await knex(table).where(id_column, _check[0][id_column]).update(_newDatum);
                            elInfo.text(`NMIS updated - ${title}`)
                        } else if (_check.length == 1 && datum[colName] != _check[0][colName]) {

                            await knex(table).where(id_column, _check[0][id_column]).update(colName, datum[colName]);
                            elInfo.text(`NMIS updated - ${title}`)
                            // console.log('getAndUpdateBasicData1')
                        } else if (datum.isActive != _check[0].isActive) {
                            await knex(table).where(id_column, _check[0][id_column]).update('isActive', datum.isActive);
                            elInfo.text(`NMIS updated - ${title}`)
                        }
                    } catch (error) {
                        // console.log({error})
                        internalErr(error)
                    }
                }
            }
        } catch (error) {
            // console.log({error})
            internalErr(error)
        }

    }
    uploadBtn.on('click', async () => {
        var surl = await knex("tblConfig");
        surl = surl[0].value + '/api3';
        console.log(surl)
        elProgress.show();
        updateBtn.attr('disabled', true)
        uploadBtn.attr('disabled', true)
        console.log(surl)

        try {
            // Scr Children block
            await uploadData('tblScrChildren', 'ch_scr_id', 'client_scr_ch_id', `${surl}/newScrBulk`, instance, 'Children Screening');
            await uploadUpdatedData('tblScrChildren', 'ch_scr_id', 'client_scr_ch_id', `${surl}/newScrBulk`, instance, 'Children Screening');
            // Scr Plw block          
            await uploadData('tblScrPlw', 'plw_scr_id', 'client_scr_plw_id', `${surl}/newScrPlwBulk`, instance, 'Plw Screening');
            await uploadUpdatedData('tblScrPlw', 'plw_scr_id', 'client_scr_plw_id', `${surl}/newScrPlwBulk`, instance, 'Plw Screening');
            //  OtpFollowup Block
            await uploadDataMultiple('tblOtpFollowup', 'followup_id', 'client_followup_id', 'otp_id', 'client_otp_id', `${surl}/otpFollowupBulk`, instance, 'Followup');
            await uploadUpdatedDataMultiple('tblOtpFollowup', 'followup_id', 'client_followup_id', 'otp_id', 'client_otp_id', `${surl}/otpFollowupBulk`, instance, 'Followup');
            //  OtpFollowup Block
            // await uploadData('tblOtpFollowup', 'followup_id', 'client_followup_id', `${surl}/otpFollowupBulk`, instance, 'Followup');
            // await uploadUpdatedData('tblOtpFollowup', 'followup_id', 'client_followup_id',`${surl}/otpFollowupBulk`, instance, 'Followup');

            // Stock Out
            await uploadData('tblSiteStock', 'stock_out_id', 'client_stock_out_id', `${surl}/stockOutBulk`, instance, 'Stock Out');
            await uploadUpdatedData('tblSiteStock', 'stock_out_id', 'client_stock_out_id', `${surl}/stockOutBulk`, instance, 'Stock Out');

            // Stock Distribution
            await uploadData('tblStokDistv2', 'dist_id', 'client_dist_id', `${surl}/stockDistBulk`, instance, 'Distributions');
            await uploadUpdatedData('tblStokDistv2', 'dist_id', 'client_dist_id', `${surl}/stockDistBulk`, instance, 'Distributions');

            // Villages Block
            await uploadData('tblVillages', 'id', 'client_village_id', `${surl}/villagesBulk`, instance, 'Villages');
            await uploadUpdatedData('tblVillages', 'id', 'client_village_id', `${surl}/villagesBulk`, instance, 'Villages');

            // LHW Block
            await uploadData('tblLhw', 'id', 'client_lhw_id', `${surl}/lhwBulk`, instance, 'LHW/CHW');
            await uploadUpdatedData('tblLhw', 'id', 'client_lhw_id', `${surl}/lhwBulk`, instance, 'LHW/CHW');

            // Supervisors Block
            await uploadData('tblSupervisors', 'id', 'client_sup_id', `${surl}/supsBulk`, instance, 'LHS');
            await uploadUpdatedData('tblSupervisors', 'id', 'client_sup_id', `${surl}/supsBulk`, instance, 'LHS');

            // Admisions Block
            await uploadData('tblOtpAdd', 'otp_id', 'client_otp_id', `${surl}/admisionsBulk`, instance, 'Admisions');
            await uploadUpdatedData('tblOtpAdd', 'otp_id', 'client_otp_id', `${surl}/admisionsBulk`, instance, 'Admisions');

            // Exits Block
            await uploadDataMultiple('tblOtpExit', 'exit_id', 'client_exit_id', 'otp_id', 'client_otp_id', `${surl}/exitsBulk`, instance, 'Admisions');
            await uploadUpdatedDataMultiple('tblOtpExit', 'exit_id', 'client_exit_id', 'otp_id', 'client_otp_id', `${surl}/exitsBulk`, instance, 'Admisions');

            // Sessions Block
            await uploadData('tblSessions', 'session_id', 'client_session_id', `${surl}/sessionsBulk`, instance, 'Sessions');
            await uploadUpdatedData('tblSessions', 'session_id', 'client_session_id', `${surl}/sessionsBulk`, instance, 'Sessions');


            // Stock In Block
            await uploadData('tblStock', 'id', 'client_stockIn_id', `${surl}/stockInBulk`, instance, 'Stock In');
            await uploadUpdatedData('tblStock', 'id', 'client_stockIn_id', `${surl}/stockInBulk`, instance, 'Stock In');


            elProgress.hide();
            if(_Errors.register || _Errors.requestError){


                Swal.fire({
                    type: 'error',
                    title: 'NMIS Syncronization',
                    text: _Errors.register ? 'NMIS is not registred' : 'Unable to contact with Server'
                })

            }else{
                
                Swal.fire({
                    type: 'success',
                    title: 'NMIS Syncronization',
                    text: 'Successfully uploaded'
                })
            }
            // elProgress.hide();
            updateBtn.attr('disabled', false)
            uploadBtn.attr('disabled', false)

        } catch (error) {
            // console.log({error})
            elProgress.hide();
            Swal.fire({
                type: 'error',
                title: 'NMIS Syncronization',
                text: _Errors.register ? 'NMIS is not registred' : 'Unable to contact with Server'
            })
            updateBtn.attr('disabled', false)
            uploadBtn.attr('disabled', false)
        }

    })

    updateBtn.on('click', async () => {
        var surl = await knex("tblConfig");
        surl = surl[0].value + '/api3';
        // surl = surl[0].value;
        elProgress.show();
        updateBtn.attr('disabled', true)
        uploadBtn.attr('disabled', true)

        try {
            await getAndUpdateBasicData2('tblGeoProvince', 'id', 'provinceName', `${surl}/getProvince`, instance, 'Province(s)')            
            await getAndUpdateBasicData2('tblGeoDistrict', 'id', 'districtName', `${surl}/getDistrict`, instance, 'District(s)')
            await getAndUpdateBasicData2('tblGeoTehsil', 'id', 'tehsilName', `${surl}/getTehsil`, instance, 'Tehsil(s)')
            await getAndUpdateBasicData2('tblGeoUC', 'id', 'ucName', `${surl}/getUC`, instance, 'Union Council(s)')
            await getAndUpdateBasicData2('tblGeoNutSite', 'id', 'siteName', `${surl}/getSite`, instance, 'Health House(s)')
            await getAndUpdateBasicData('tblCommodity', 'id', `${surl}/getItems`, instance, 'Commodities')
            var _config = await instance.post(`${surl}/getConfig`);
            // console.log(_config)
            await knex('tblConfig').update({
                value: _config.data[0].value
            }).whereNot('value', _config.data[0].value)
            elProgress.hide();
            // console.log({_Errors})
            if(_Errors.register || _Errors.requestError){
                Swal.fire({
                    type: 'error',
                    title: 'NMIS Syncronization error',
                    text: _Errors.register ? 'NMIS is not registred' : 'Unable to contact with Server'
                })
            }else{

                Swal.fire({
                    type: 'success',
                    title: 'NMIS Syncronization',
                    text: 'Successfully downloaded'
                })
            }
            updateBtn.attr('disabled', false)
            uploadBtn.attr('disabled', false)
        } catch (error) {
            // console.log({error})
            elProgress.hide();
            Swal.fire({
                type: 'error',
                title: 'NMIS Syncronization error',
                text: _Errors.register ? 'NMIS is not registred' : 'Unable to contact with Server'
            })
            updateBtn.attr('disabled', false)
            uploadBtn.attr('disabled', false)
        }
    })

    function splitToChunks(array, parts) {
        let result = [];
        for (let i = parts; i > 0; i--) {
            result.push(array.splice(0, Math.ceil(array.length / i)));
        }
        return result;
    }

    async function scr30(data, instance, surl) {
        var _data = splitToChunks(data, Math.floor(data.length / 20));


        for (data of _data) {
            // data.client_id = client;
            // data.client_scr_ch_id = data.ch_scr_id;
            // delete data.ch_scr_id;
            // console.log(data);
            try {
                var _testData = await instance.post(`${surl}/newChScr`, data)
                // console.log(_testData)
            } catch (error) {
                // console.log(error)
            }
            // instance.post('/newScrChild1', )
        }
    }


}