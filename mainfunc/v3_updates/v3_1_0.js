const { dialog } = require('electron');
var knex = require('../db')
const updateDatabase = require('./updUtils')
/**
 * 
 * @param {app} app is an application parameter;
 * 
 * This function helps to make new updates in database;
 * updateDatabase requires string of sql quries, it must have ';' to separete quries outherwise only one qury will run;
 * this function gets app element which is an electron mehtod, requires to get version of the application;
 * any update would require to have _checkVer define earlier than executing update;
 * than to run followin query
 *  var _check = await knex('tblUpdates').where({version:310});
 */

 async function chekAndExecuteUpdate (_checkVer, currentVersion, dbUpdateSqlString, dbUpdateMsg){
       var _check = await knex('tblUpdates').where({version:_checkVer});
       var _err = false;
       // && currentVersion < _checkVer
       if(!_check.length){
             try {
                     await updateDatabase(knex, dbUpdateSqlString);
             } catch (error) {
                    if(error.errno == 21){
                           _err = false
                    }else{
                           _err = true
                           var errLocationFunction = 'updateDatabase query for version :' +_checkVer;
                           error.customMsg = errLocationFunction
                           console.log(error.errno)
                           dialog.showErrorBox(`Database update`, `${error.customMsg} \n Please contact ACF team \n ${error}`)
                    }
             }
             if(!_err){
              await knex('tblUpdates').insert({version: _checkVer, description: dbUpdateMsg})
              console.log('Success Message '+dbUpdateMsg)
             }

        }
 }

module.exports = async function (app, dialog) {
       var currentVersion = app.getVersion();
       currentVersion = parseInt(currentVersion.replace(/[.]/g, ''));
       console.log({currentVersion})
      
    try {
           await knex.raw(`CREATE TABLE IF NOT EXISTS tblUpdates (id integer not null primary key autoincrement, version integer, description varchar(255));`)
       var _checkVer = 308;
       var v308Sql = `SAVEPOINT [sqlite_expert_apply_design_transaction];
       DROP VIEW IF EXISTS [main].[oneTable];
       CREATE VIEW [main].[oneTable]
            AS
            SELECT 
                   [tblOtpAdd].*, 
                   [tblOtpExit].[exit_muac], 
                   [tblOtpExit].[exit_weight], 
                   [tblOtpExit].[exit_height], 
                   [tblOtpExit].[exit_reason], 
                   [tblOtpExit].[exit_date]
            FROM   [tblOtpAdd]
                   LEFT JOIN [tblOtpExit] ON [tblOtpAdd].[otp_id] = [tblOtpExit].[otp_id]
            WHERE  [tblOtpAdd].[is_deleted] = 0;
            RELEASE [sqlite_expert_apply_design_transaction];
       `
       await chekAndExecuteUpdate(_checkVer,currentVersion,v308Sql,'Version 308 updates were made')
       var _checkVer = 310;
        var _check = await knex('tblUpdates').where({version:310});
        if(!_check.length ){
            await knex.raw(`PRAGMA [main].legacy_alter_table = 'on';`)
            await knex.raw(`PRAGMA [main].foreign_keys = 'off';`)
            await knex.raw(`SAVEPOINT [sqlite_expert_apply_design_transaction];`)
            await knex.raw(`ALTER TABLE [main].[tblScrChildren] RENAME TO [_sqliteexpert_temp_table_1];`)
            await knex.raw(`CREATE TABLE [main].[tblScrChildren](
                [ch_scr_id_old] INTEGER, 
                [ch_scr_id] char(36), 
                [site_id] INTEGER, 
                [screening_date] DATE, 
                [created_at] DATE, 
                [catchment_population] INTEGER DEFAULT 0, 
                [staff_name] VARCHAR(50), 
                [staff_code] VARCHAR(10), 
                [sup_name] VARCHAR(50), 
                [sup_code] VARCHAR(10), 
                [total_scr_girls] INTEGER, 
                [total_scr_boys] INTEGER, 
                [sam_without_comp_girls_623] INTEGER, 
                [sam_without_comp_boys_623] INTEGER, 
                [sam_with_comp_girls_623] INTEGER, 
                [sam_with_comp_boys_623] INTEGER, 
                [mam_girls_623] INTEGER, 
                [mam_boys_623] INTEGER, 
                [sam_without_comp_girls_2459] INTEGER, 
                [sam_without_comp_boys_2459] INTEGER, 
                [sam_with_comp_girls_2459] INTEGER, 
                [sam_with_comp_boys_2459] INTEGER, 
                [mam_girls_2459] INTEGER, 
                [mam_boys_2459] INTEGER, 
                [reffer_tsfp_girls] INTEGER, 
                [reffer_otp_girls] INTEGER, 
                [reffer_tsfp_boys] INTEGER, 
                [reffer_otp_boys] INTEGER, 
                [normal_boys_623] INTEGER, 
                [normal_girls_623] INTEGER, 
                [normal_boys_2459] INTEGER, 
                [normal_girls_2459] INTEGER, 
                [first_mnp_30_girls] INTEGER, 
                [first_mnp_30_boys] INTEGER, 
                [second_mnp_30_girls] INTEGER, 
                [second_mnp_30_boys] INTEGER, 
                [third_mnp_30_girls] INTEGER, 
                [third_mnp_30_boys] INTEGER, 
                [fourth_mnp_30_girls] INTEGER, 
                [fourth_mnp_30_boys] INTEGER, 
                [fifth_mnp_30_girls] INTEGER, 
                [fifth_mnp_30_boys] INTEGER, 
                [sixth_mnp_30_girls] INTEGER, 
                [sixth_mnp_30_boys] INTEGER, 
                [deworming_girls] INTEGER, 
                [deworming_boys] INTEGER, 
                [new_boys] INTEGER, 
                [new_girls] INTEGER, 
                [reScreened_boys] INTEGER, 
                [reScreened_girls] INTEGER, 
                [no_oedema_girls] INTEGER, 
                [no_oedema_boys] INTEGER, 
                [plus12_oedema_girls] INTEGER, 
                [plus12_oedema_boys] INTEGER, 
                [plus3_oedema_girls] INTEGER, 
                [plus3_oedema_boys] INTEGER, 
                [client_id] INTEGER, 
                [username] VARCHAR, 
                [project] VARCHAR, 
                [upload_status] INTEGER DEFAULT 0, 
                [approved] INTEGER, 
                [is_deleted] INTEGER(1) NOT NULL DEFAULT 0, 
                [report_month] VARCHAR, 
                [followedup_boys] INTEGER, 
                [followedup_girls] INTEGER, 
                [exits_boys] INTEGER, 
                [exits_girls] INTEGER, 
                [other_specify] VARCHAR, 
                [other_boys] INTEGER, 
                [other_girls] INTEGER, 
                [upload_date] DATE, 
                [site_one] VARCHAR(50), 
                [site_two] VARCHAR(50), 
                [reffer_otp_girls_s1] INTEGER DEFAULT 0, 
                [reffer_otp_girls_s2] INTEGER DEFAULT 0, 
                [reffer_otp_boys_s1] INTEGER DEFAULT 0, 
                [reffer_otp_boys_s2] INTEGER DEFAULT 0, 
                [reffer_tsfp_girls_s1] INTEGER DEFAULT 0, 
                [reffer_tsfp_girls_s2] INTEGER DEFAULT 0, 
                [total_hh] INTEGER DEFAULT 0, 
                [uc_id] INTEGER, 
                [reffer_tsfp_boys_s1] INTEGER DEFAULT 0, 
                [reffer_tsfp_boys_s2] INTEGER DEFAULT 0, 
                [mnp_boys] INTEGER DEFAULT 0, 
                [mnp_girls] INTEGER DEFAULT 0, 
                [total_followup] INTEGER DEFAULT 0, 
                [total_exits] INTEGER DEFAULT 0, 
                [ent_type] CHAR(10), 
                [org_name] VARCHAR(50), 
                [province_id] INTEGER, 
                [district_id] INTEGER, 
                [tehsil_id] INTEGER, 
               [total_scr_boys_623] INTEGER, 
                [total_scr_girls_623] INTEGER, 
                [total_scr_boys_2459] INTEGER, 
                [total_scr_girls_2459] INTEGER, 
                [plus12_boys_623] INTEGER, 
                [plus12_girls_623] INTEGER, 
                [plus12_boys_2459] INTEGER, 
                [plus12_girls_2459] INTEGER, 
                [plus3_boys_623] INTEGER, 
                [plus3_girls_623] INTEGER, 
                [plus3_boys_2459] INTEGER, 
                [plus3_girls_2459] INTEGER, 
                [reffer_otp_boys_623_s1] INTEGER, 
                [reffer_otp_girls_623_s1] INTEGER, 
                [reffer_otp_boys_2459_s1] INTEGER, 
                [reffer_otp_girls_2459_s1] INTEGER,
              [reffer_tsfp_boys_623_s1] INTEGER, 
                [reffer_tsfp_girls_623_s1] INTEGER, 
                [reffer_tsfp_boys_2459_s1] INTEGER, 
                [reffer_tsfp_girls_2459_s1] INTEGER, 
                [reffer_otp_boys_623_s2] INTEGER, 
                [reffer_otp_girls_623_s2] INTEGER, 
                [reffer_otp_boys_2459_s2] INTEGER, 
                [reffer_otp_girls_2459_s2] INTEGER, 
                [reffer_tsfp_boys_623_s2] INTEGER, 
                [reffer_tsfp_girls_623_s2] INTEGER, 
                [reffer_tsfp_boys_2459_s2] INTEGER, 
                [reffer_tsfp_girls_2459_s2] INTEGER, 
                [mnp_boys_623] INTEGER, 
                [mnp_girls_623] INTEGER, 
                [mnp_boys_2459] INTEGER, 
                [mnp_girls_2459] INTEGER, 
                [followup_boys_623] INTEGER, 
                [followup_girls_623] INTEGER, 
                [followup_boys_2459] INTEGER, 
                [followup_girls_2459] INTEGER, 
                [exits_boys_623] INTEGER, 
                [exits_girls_623] INTEGER, 
                [exits_boys_2459] INTEGER, 
                [exits_girls_2459] INTEGER, 
                [deworming_boys_623] INTEGER, 
                [deworming_girls_623] INTEGER, 
                [deworming_boys_2459] INTEGER, 
                [deworming_girls_2459] INTEGER, 
                [other_boys_623] INTEGER, 
                [other_girls_623] INTEGER, 
                [other_boys_2459] INTEGER, 
                [other_girls_2459] INTEGER);`)
            await knex.raw(`INSERT INTO [main].[tblScrChildren]([rowid], [ch_scr_id_old], [ch_scr_id], [site_id], [screening_date], [created_at], [catchment_population], [staff_name], [staff_code], [sup_name], [sup_code], [total_scr_girls], [total_scr_boys], [sam_without_comp_girls_623], [sam_without_comp_boys_623], [sam_with_comp_girls_623], [sam_with_comp_boys_623], [mam_girls_623], [mam_boys_623], [sam_without_comp_girls_2459], [sam_without_comp_boys_2459], [sam_with_comp_girls_2459], [sam_with_comp_boys_2459], [mam_girls_2459], [mam_boys_2459], [reffer_tsfp_girls], [reffer_otp_girls], [reffer_tsfp_boys], [reffer_otp_boys], [normal_boys_623], [normal_girls_623], [normal_boys_2459], [normal_girls_2459], [first_mnp_30_girls], [first_mnp_30_boys], [second_mnp_30_girls], [second_mnp_30_boys], [third_mnp_30_girls], [third_mnp_30_boys], [fourth_mnp_30_girls], [fourth_mnp_30_boys], [fifth_mnp_30_girls], [fifth_mnp_30_boys], [sixth_mnp_30_girls], [sixth_mnp_30_boys], [deworming_girls], [deworming_boys], [new_boys], [new_girls], [reScreened_boys], [reScreened_girls], [no_oedema_girls], [no_oedema_boys], [plus12_oedema_girls], [plus12_oedema_boys], [plus3_oedema_girls], [plus3_oedema_boys], [client_id], [username], [project], [upload_status], [approved], [is_deleted], [report_month], [followedup_boys], [followedup_girls], [exits_boys], [exits_girls], [other_specify], [other_boys], [other_girls], [upload_date], [site_one], [site_two], [reffer_otp_girls_s1], [reffer_otp_girls_s2], [reffer_otp_boys_s1], [reffer_otp_boys_s2], [reffer_tsfp_girls_s1], [reffer_tsfp_girls_s2], [total_hh], [uc_id], [reffer_tsfp_boys_s1], [reffer_tsfp_boys_s2], [mnp_boys], [mnp_girls], [total_followup], [total_exits], [ent_type], [org_name], [province_id], [district_id], [tehsil_id])
            SELECT [rowid], [ch_scr_id_old], [ch_scr_id], [site_id], [screening_date], [created_at], [catchment_population], [staff_name], [staff_code], [sup_name], [sup_code], [total_scr_girls], [total_scr_boys], [sam_without_comp_girls_623], [sam_without_comp_boys_623], [sam_with_comp_girls_623], [sam_with_comp_boys_623], [mam_girls_623], [mam_boys_623], [sam_without_comp_girls_2459], [sam_without_comp_boys_2459], [sam_with_comp_girls_2459], [sam_with_comp_boys_2459], [mam_girls_2459], [mam_boys_2459], [reffer_tsfp_girls], [reffer_otp_girls], [reffer_tsfp_boys], [reffer_otp_boys], [normal_boys_623], [normal_girls_623], [normal_boys_2459], [normal_girls_2459], [first_mnp_30_girls], [first_mnp_30_boys], [second_mnp_30_girls], [second_mnp_30_boys], [third_mnp_30_girls], [third_mnp_30_boys], [fourth_mnp_30_girls], [fourth_mnp_30_boys], [fifth_mnp_30_girls], [fifth_mnp_30_boys], [sixth_mnp_30_girls], [sixth_mnp_30_boys], [deworming_girls], [deworming_boys], [new_boys], [new_girls], [reScreened_boys], [reScreened_girls], [no_oedema_girls], [no_oedema_boys], [plus12_oedema_girls], [plus12_oedema_boys], [plus3_oedema_girls], [plus3_oedema_boys], [client_id], [username], [project], [upload_status], [approved], [is_deleted], [report_month], [followedup_boys], [followedup_girls], [exits_boys], [exits_girls], [other_specify], [other_boys], [other_girls], [upload_date], [site_one], [site_two], [reffer_otp_girls_s1], [reffer_otp_girls_s2], [reffer_otp_boys_s1], [reffer_otp_boys_s2], [reffer_tsfp_girls_s1], [reffer_tsfp_girls_s2], [total_hh], [uc_id], [reffer_tsfp_boys_s1], [reffer_tsfp_boys_s2], [mnp_boys], [mnp_girls], [total_followup], [total_exits], [ent_type], [org_name], [province_id], [district_id], [tehsil_id]
            FROM [main].[_sqliteexpert_temp_table_1];`)
            await knex.raw(`DROP TABLE IF EXISTS [main].[_sqliteexpert_temp_table_1];`)
            await knex.raw(`RELEASE [sqlite_expert_apply_design_transaction];`)
            await knex.raw(`PRAGMA [main].foreign_keys = 'on';`)
            await knex.raw(`PRAGMA [main].legacy_alter_table = 'off';`)
            await knex('tblUpdates').insert({version:310, description:'Updated scrChilren to support v2 IM tools'})
            console.log('updated v310')
        }
        _checkVer = 313
        var _check = await knex('tblUpdates').where({version:313});
        if(!_check.length ){
            await knex.raw(`PRAGMA [main].legacy_alter_table = 'on';`)
            await knex.raw(`PRAGMA [main].foreign_keys = 'off';`)
            await knex.raw(`SAVEPOINT [sqlite_expert_apply_design_transaction];`)
            await knex.raw(`ALTER TABLE [main].[tblSessions] RENAME TO [_sqliteexpert_temp_table_1];`)
            await knex.raw(`CREATE TABLE [main].[tblSessions](
                [session_id] char(36), 
                [session_id_old] integer, 
                [site_id] integer, 
                [client_id] varchar(255), 
                [session_date] date, 
                [session_type] varchar(255), 
                [male_participants] INTEGER, 
                [female_participants] INTEGER, 
                [session_location] varchar(255), 
                [upload_status] integer, 
                [created_at] datetime, 
                [updated_at] datetime, 
                [old_participants] INTEGER, 
                [new_participants] INTEGER, 
                [username] VARCHAR(50), 
                [org_name] VARCHAR(50), 
                [project_name] VARCHAR(50), 
                [pragnent] INT, 
                [lactating] INT, 
                [is_deleted] INTEGER(1) NOT NULL DEFAULT 0, 
                [remarks] VARCHAR NOT NULL DEFAULT "N/A", 
                [CHS_id] VARCHAR, 
                [CHW_id] VARCHAR, 
                [upload_date] DATE, 
                [prog_type] varchar(10), 
                [total_session] INTEGER DEFAULT 0, 
                [ind_session] INTEGER DEFAULT 0, 
                [grp_sessions] INTEGER DEFAULT 0, 
                [uc_id] INTEGER, 
                [province_id] INTEGER, 
                [district_id] INTEGER, 
                [tehsil_id] INTEGER, 
                [mtmg] INTEGER, 
                [ftfg] INTEGER);`)
            await knex.raw(`
            INSERT INTO [main].[tblSessions]([rowid], [session_id], [session_id_old], [site_id], [client_id], [session_date], [session_type], [male_participants], [female_participants], [session_location], [upload_status], [created_at], [updated_at], [old_participants], [new_participants], [username], [org_name], [project_name], [pragnent], [lactating], [is_deleted], [remarks], [CHS_id], [CHW_id], [upload_date], [prog_type], [total_session], [ind_session], [grp_sessions], [uc_id], [province_id], [district_id], [tehsil_id])
            SELECT [rowid], [session_id], [session_id_old], [site_id], [client_id], [session_date], [session_type], [male_participants], [female_participants], [session_location], [upload_status], [created_at], [updated_at], [old_participants], [new_participants], [username], [org_name], [project_name], [pragnent], [lactating], [is_deleted], [remarks], [CHS_id], [CHW_id], [upload_date], [prog_type], [total_session], [ind_session], [grp_sessions], [uc_id], [province_id], [district_id], [tehsil_id]
            FROM [main].[_sqliteexpert_temp_table_1];`)
            await knex.raw(`DROP TABLE IF EXISTS [main].[_sqliteexpert_temp_table_1];`)
            await knex.raw(`RELEASE [sqlite_expert_apply_design_transaction];`)
            await knex.raw(`PRAGMA [main].foreign_keys = 'on';`)
            await knex.raw(`PRAGMA [main].legacy_alter_table = 'off';`)
            await knex('tblUpdates').insert({version:313, description:'Updated tblSessions to support v2 IM tools'})
            console.log('updated v313')
        }
        _checkVer = 400
        var v400Update = `CREATE VIEW allExitsNotDel as 
            select * from tblOtpExit where is_deleted = 0;
            CREATE VIEW allNSCAdmisions as
SELECT 
       [main].[v_geo_active].[province_id], 
       [main].[v_geo_active].[province], 
       [main].[v_geo_active].[district_id], 
       [main].[v_geo_active].[district_name], 
       [main].[v_geo_active].[tehsil_id], 
       [main].[v_geo_active].[tehsil_name], 
       [main].[v_geo_active].[uc_id], 
       [main].[v_geo_active].[uc_name], 
       [main].[v_geo_active].[site_name], 
       [tblOtpAdd].*
FROM   [main].[v_geo_active]
       INNER JOIN [main].[tblOtpAdd] ON [main].[v_geo_active].[site_id] = [main].[tblOtpAdd].[site_id]
WHERE  [main].[tblOtpAdd].[is_deleted] = 0 and [tblOtpAdd].[prog_type] = 'sc'
UNION ALL
SELECT 
       [main].[v_geo_active].[province_id], 
       [main].[v_geo_active].[province], 
       [main].[v_geo_active].[district_id], 
       [main].[v_geo_active].[district_name], 
       [main].[v_geo_active].[tehsil_id], 
       [main].[v_geo_active].[tehsil_name], 
       [main].[v_geo_active].[uc_id], 
       [main].[v_geo_active].[uc_name], 
       [main].[v_geo_active].[site_name], 
       [tblOtpAdd].*
FROM   [main].[v_geo_active]
       INNER JOIN [main].[tblOtpAdd] ON [main].[v_geo_active].[tehsil_id] = [main].[tblOtpAdd].[tehsil_id]
WHERE  [main].[tblOtpAdd].[is_deleted] = 0 and [tblOtpAdd].[prog_type] = 'sc' and ([tblOtpAdd].[site_id] = '' or [tblOtpAdd].[site_id] is null);
CREATE VIEW allNSCExits as
SELECT 
       [main].[tblOtpAdd].[site_id], 
       [main].[tblOtpAdd].[p_name], 
       [main].[tblOtpAdd].[reg_id], 
       [main].[tblOtpAdd].[site_village], 
       [main].[tblOtpAdd].[prog_type], 
       [main].[v_geo].[province_id], 
       [main].[v_geo].[province], 
       [main].[v_geo].[district_id], 
       [main].[v_geo].[district_name], 
       [main].[v_geo].[tehsil_id], 
       [main].[v_geo].[tehsil_name], 
       [main].[v_geo].[uc_id], 
       [main].[v_geo].[uc_name], 
       [main].[v_geo].[site_name], 
       [tblOtpExit].*
FROM   [main].[tblOtpAdd]
       INNER JOIN [main].[tblOtpExit] ON [main].[tblOtpAdd].[otp_id] = [main].[tblOtpExit].[otp_id]
       INNER JOIN [main].[v_geo] ON [main].[tblOtpAdd].[site_id] = [main].[v_geo].[site_id]
WHERE  [tblOtpExit].[is_deleted] = 0 and [main].[tblOtpAdd].[prog_type] = 'sc'
UNION ALL
SELECT 
       [main].[tblOtpAdd].[site_id], 
       [main].[tblOtpAdd].[p_name], 
       [main].[tblOtpAdd].[reg_id], 
       [main].[tblOtpAdd].[site_village], 
       [main].[tblOtpAdd].[prog_type], 
       [main].[v_geo_tehsil].[province_id], 
       [main].[v_geo_tehsil].[province_name] AS [province], 
       [main].[v_geo_tehsil].[district_id], 
       [main].[v_geo_tehsil].[district_name], 
       [main].[v_geo_tehsil].[tehsil_id], 
       [main].[v_geo_tehsil].[tehsil_name], 
       '' AS [uc_id], 
       '' AS [uc_name], 
       '' AS [site_name], 
       [tblOtpExit].*
FROM   [main].[tblOtpAdd]
       INNER JOIN [main].[tblOtpExit] ON [main].[tblOtpAdd].[otp_id] = [main].[tblOtpExit].[otp_id]
       INNER JOIN [main].[v_geo_tehsil] ON [main].[tblOtpAdd].[tehsil_id] = [main].[v_geo_tehsil].[tehsil_id]
WHERE  [tblOtpExit].[is_deleted] = 0 AND [tblOtpAdd].[prog_type] = 'sc' and ([main].[tblOtpAdd].[site_id] is null or [main].[tblOtpAdd].[site_id] = '');
CREATE VIEW allOtpAdmisions as
SELECT 
       [main].[v_geo_active].[province_id], 
       [main].[v_geo_active].[province], 
       [main].[v_geo_active].[district_id], 
       [main].[v_geo_active].[district_name], 
       [main].[v_geo_active].[tehsil_id], 
       [main].[v_geo_active].[tehsil_name], 
       [main].[v_geo_active].[uc_id], 
       [main].[v_geo_active].[uc_name], 
       [main].[v_geo_active].[site_name], 
       [tblOtpAdd].*
FROM   [main].[v_geo_active]
       INNER JOIN [main].[tblOtpAdd] ON [main].[v_geo_active].[site_id] = [main].[tblOtpAdd].[site_id]
WHERE  [main].[tblOtpAdd].[is_deleted] = 0 and [tblOtpAdd].[prog_type] = 'otp';
CREATE VIEW allOtpExits as
SELECT 
       [main].[tblOtpAdd].[site_id], 
       [main].[tblOtpAdd].[p_name], 
       [main].[tblOtpAdd].[reg_id], 
       [main].[tblOtpAdd].[site_village], 
       [main].[tblOtpAdd].[prog_type], 
       [main].[v_geo].[province_id], 
       [main].[v_geo].[province], 
       [main].[v_geo].[district_id], 
       [main].[v_geo].[district_name], 
       [main].[v_geo].[tehsil_id], 
       [main].[v_geo].[tehsil_name], 
       [main].[v_geo].[uc_id], 
       [main].[v_geo].[uc_name], 
       [main].[v_geo].[site_name], 
       [tblOtpExit].*
FROM   [main].[tblOtpAdd]
       INNER JOIN [main].[tblOtpExit] ON [main].[tblOtpAdd].[otp_id] = [main].[tblOtpExit].[otp_id]
       INNER JOIN [main].[v_geo] ON [main].[tblOtpAdd].[site_id] = [main].[v_geo].[site_id]
WHERE  [tblOtpExit].[is_deleted] = 0 and [main].[tblOtpAdd].[prog_type] = 'otp';
SAVEPOINT [sqlite_expert_apply_design_transaction];

DROP VIEW IF EXISTS [main].[oneTable];

CREATE VIEW [main].[oneTable]
AS
SELECT 
       [tblOtpAdd].*, 
       [allExitsNotDel].[exit_muac], 
       [allExitsNotDel].[exit_weight], 
       [allExitsNotDel].[exit_height], 
       [allExitsNotDel].[exit_reason], 
       [allExitsNotDel].[days_in_program], 
       [allExitsNotDel].[weight_gain], 
       [allExitsNotDel].[exit_date]
FROM   [tblOtpAdd]
       LEFT JOIN [allExitsNotDel] ON [tblOtpAdd].[otp_id] = [allExitsNotDel].[otp_id]
WHERE  [tblOtpAdd].[is_deleted] = 0;

RELEASE [sqlite_expert_apply_design_transaction];

`
        var v400Msg = `Update Made to make changes for newly added features`
       //  var errUpdateMsg = 'Database update to version 4.0.0 failed, Please contact ACF team for further assistance'
           await chekAndExecuteUpdate(_checkVer, currentVersion, v400Update, v400Msg);
           _checkVer = 4012;
           var v4012Upadte = `PRAGMA [main].legacy_alter_table = 'on';

           PRAGMA [main].foreign_keys = 'off';
           
           SAVEPOINT [sqlite_expert_apply_design_transaction];
           
           ALTER TABLE [main].[tblOtpAdd] RENAME TO [_sqliteexpert_temp_table_1];
           
           CREATE TABLE [main].[tblOtpAdd](
             [otp_id] char(36), 
             [otp_id_old] integer, 
             [client_id] varchar(255), 
             [site_id] integer, 
             [site_village] varchar(255), 
             [reg_date] date, 
             [reg_id] varchar(255), 
             [p_name] varchar(255), 
             [f_or_h_name] varchar(255), 
             [cnic] VARCHAR(255), 
             [address] varchar(255), 
             [cnt_number] varchar(255), 
             [age] integer, 
             [gender] varchar(255), 
             [plw_type] varchar(255), 
             [ent_reason] varchar(255), 
             [ref_type] varchar(255), 
             [oedema] varchar(255), 
             [muac] FLOAT, 
             [diarrhoea] boolean, 
             [vomiting] boolean, 
             [cough] boolean, 
             [appetite] varchar(255), 
             [daily_stool] varchar(255), 
             [pass_urine] boolean, 
             [b_Feeding] boolean, 
             [weight] FLOAT, 
             [height] FLOAT DEFAULT null, 
             [ration1] varchar(255), 
             [quantity1] integer, 
             [ration2] varchar(255), 
             [quantity2] integer, 
             [ration3] varchar(255), 
             [quantity3] integer, 
             [prog_type] varchar(255), 
             [created_at] datetime, 
             [updated_at] datetime, 
             [upload_status] INTEGER DEFAULT 0, 
             [username] VARCHAR(50), 
             [org_name] VARCHAR(50), 
             [project_name] VARCHAR(50), 
             [is_deleted] BOOLEAN NOT NULL DEFAULT 0, 
             [other_com_name] VARCHAR(20), 
             [other_com_qty] FLOAT, 
             [nsc_old_otp_id] VARCHAR DEFAULT 0, 
             [ref_type_other] VARCHAR, 
             [entry_reason_other] VARCHAR, 
             [travel_time_minutes] INTEGER NOT NULL DEFAULT 0, 
             [is_mother_alive] VARCHAR(3) NOT NULL DEFAULT Yes, 
             [tehsil_id] INTEGER, 
             [nsc_otp_id] VARCHAR, 
             [upload_date] DATE, 
             [hh_id] VARCHAR(20), 
             [exit_date] DATE, 
             [exit_reason] VARCHAR(50), 
             [total_days] INTEGER, 
             [total_followups] INTEGER, 
             [exit_muac] FLOAT, 
             [exit_weight] FLOAT(8, 2), 
             [province_id] INTEGER, 
             [district_id] VARCHAR, 
             [uc_id] INTEGER, 
             [old_otp_or_nsc_detail] VARCHAR(100), 
             [z_score] FLOAT(8, 2), 
             [ref_by_details] VARCHAR(100));
           
           INSERT INTO [main].[tblOtpAdd]([rowid], [otp_id], [otp_id_old], [client_id], [site_id], [site_village], [reg_date], [reg_id], [p_name], [f_or_h_name], [cnic], [address], [cnt_number], [age], [gender], [plw_type], [ent_reason], [ref_type], [oedema], [muac], [diarrhoea], [vomiting], [cough], [appetite], [daily_stool], [pass_urine], [b_Feeding], [weight], [height], [ration1], [quantity1], [ration2], [quantity2], [ration3], [quantity3], [prog_type], [created_at], [updated_at], [upload_status], [username], [org_name], [project_name], [is_deleted], [other_com_name], [other_com_qty], [nsc_old_otp_id], [ref_type_other], [entry_reason_other], [travel_time_minutes], [is_mother_alive], [tehsil_id], [nsc_otp_id], [upload_date], [hh_id], [exit_date], [exit_reason], [total_days], [total_followups], [exit_muac], [exit_weight], [province_id], [district_id], [uc_id], [old_otp_or_nsc_detail], [z_score], [ref_by_details])
           SELECT [rowid], [otp_id], [otp_id_old], [client_id], [site_id], [site_village], [reg_date], [reg_id], [p_name], [f_or_h_name], [cnic], [address], [cnt_number], [age], [gender], [plw_type], [ent_reason], [ref_type], [oedema], [muac], [diarrhoea], [vomiting], [cough], [appetite], [daily_stool], [pass_urine], [b_Feeding], [weight], [height], [ration1], [quantity1], [ration2], [quantity2], [ration3], [quantity3], [prog_type], [created_at], [updated_at], [upload_status], [username], [org_name], [project_name], [is_deleted], [other_com_name], [other_com_qty], [nsc_old_otp_id], [ref_type_other], [entry_reason_other], [travel_time_minutes], [is_mother_alive], [tehsil_id], [nsc_otp_id], [upload_date], [hh_id], [exit_date], [exit_reason], [total_days], [total_followups], [exit_muac], [exit_weight], [province_id], [district_id], [uc_id], [old_otp_or_nsc_detail], [z_score], [ref_by_details]
           FROM [main].[_sqliteexpert_temp_table_1];
           
           DROP TABLE IF EXISTS [main].[_sqliteexpert_temp_table_1];
           
           RELEASE [sqlite_expert_apply_design_transaction];
           
           PRAGMA [main].foreign_keys = 'on';
           
           PRAGMA [main].legacy_alter_table = 'off';
           PRAGMA [main].legacy_alter_table = 'on';

PRAGMA [main].foreign_keys = 'off';

SAVEPOINT [sqlite_expert_apply_design_transaction];

ALTER TABLE [main].[tblOtpFollowup] RENAME TO [_sqliteexpert_temp_table_1];

CREATE TABLE [main].[tblOtpFollowup](
  [followup_id] char(36), 
  [followup_id_old] integer, 
  [otp_id_old] integer, 
  [otp_id] char(36), 
  [client_id] varchar(255), 
  [weight] DECIMAL, 
  [height] DECIMAL, 
  [ration1] varchar(255), 
  [quantity1] integer DEFAULT 0, 
  [ration2] varchar(255), 
  [quantity2] integer DEFAULT 0, 
  [ration3] varchar(255), 
  [quantity3] integer DEFAULT 0, 
  [prog_type] varchar(255), 
  [curr_date] date, 
  [status] varchar(255), 
  [next_followup] date, 
  [created_at] datetime, 
  [updated_at] datetime, 
  [muac] FLOAT, 
  [upload_status] INTEGER, 
  [is_deleted] INT(1) NOT NULL DEFAULT 0, 
  [other_com_name] varchar(20), 
  [other_com_qty] float(7), 
  [upload_date] DATE);

INSERT INTO [main].[tblOtpFollowup]([rowid], [followup_id], [followup_id_old], [otp_id_old], [otp_id], [client_id], [weight], [height], [ration1], [quantity1], [ration2], [quantity2], [ration3], [quantity3], [prog_type], [curr_date], [status], [next_followup], [created_at], [updated_at], [muac], [upload_status], [is_deleted], [other_com_name], [other_com_qty], [upload_date])
SELECT [rowid], [followup_id], [followup_id_old], [otp_id_old], [otp_id], [client_id], [weight], [height], [ration1], [quantity1], [ration2], [quantity2], [ration3], [quantity3], [prog_type], [curr_date], [status], [next_followup], [created_at], [updated_at], [muac], [upload_status], [is_deleted], [other_com_name], [other_com_qty], [upload_date]
FROM [main].[_sqliteexpert_temp_table_1];

DROP TABLE IF EXISTS [main].[_sqliteexpert_temp_table_1];

RELEASE [sqlite_expert_apply_design_transaction];

PRAGMA [main].foreign_keys = 'on';

PRAGMA [main].legacy_alter_table = 'off';


PRAGMA [main].legacy_alter_table = 'on';

PRAGMA [main].foreign_keys = 'off';

SAVEPOINT [sqlite_expert_apply_design_transaction];

ALTER TABLE [main].[tblScrChildren] RENAME TO [_sqliteexpert_temp_table_1];

CREATE TABLE [main].[tblScrChildren](
  [ch_scr_id_old] INTEGER, 
  [ch_scr_id] char(36), 
  [site_id] INTEGER, 
  [screening_date] DATE, 
  [created_at] DATE, 
  [catchment_population] INTEGER DEFAULT 0, 
  [staff_name] VARCHAR(50), 
  [staff_code] VARCHAR(10), 
  [sup_name] VARCHAR(50), 
  [sup_code] VARCHAR(10), 
  [total_scr_girls] INTEGER, 
  [total_scr_boys] INTEGER, 
  [sam_without_comp_girls_623] INTEGER, 
  [sam_without_comp_boys_623] INTEGER, 
  [sam_with_comp_girls_623] INTEGER, 
  [sam_with_comp_boys_623] INTEGER, 
  [mam_girls_623] INTEGER, 
  [mam_boys_623] INTEGER, 
  [sam_without_comp_girls_2459] INTEGER, 
  [sam_without_comp_boys_2459] INTEGER, 
  [sam_with_comp_girls_2459] INTEGER, 
  [sam_with_comp_boys_2459] INTEGER, 
  [mam_girls_2459] INTEGER, 
  [mam_boys_2459] INTEGER, 
  [reffer_tsfp_girls] INTEGER, 
  [reffer_otp_girls] INTEGER, 
  [reffer_tsfp_boys] INTEGER, 
  [reffer_otp_boys] INTEGER, 
  [normal_boys_623] INTEGER, 
  [normal_girls_623] INTEGER, 
  [normal_boys_2459] INTEGER, 
  [normal_girls_2459] INTEGER, 
  [first_mnp_30_girls] INTEGER, 
  [first_mnp_30_boys] INTEGER, 
  [second_mnp_30_girls] INTEGER, 
  [second_mnp_30_boys] INTEGER, 
  [third_mnp_30_girls] INTEGER, 
  [third_mnp_30_boys] INTEGER, 
  [fourth_mnp_30_girls] INTEGER, 
  [fourth_mnp_30_boys] INTEGER, 
  [fifth_mnp_30_girls] INTEGER, 
  [fifth_mnp_30_boys] INTEGER, 
  [sixth_mnp_30_girls] INTEGER, 
  [sixth_mnp_30_boys] INTEGER, 
  [deworming_girls] INTEGER, 
  [deworming_boys] INTEGER, 
  [new_boys] INTEGER, 
  [new_girls] INTEGER, 
  [reScreened_boys] INTEGER, 
  [reScreened_girls] INTEGER, 
  [no_oedema_girls] INTEGER, 
  [no_oedema_boys] INTEGER, 
  [plus12_oedema_girls] INTEGER, 
  [plus12_oedema_boys] INTEGER, 
  [plus3_oedema_girls] INTEGER, 
  [plus3_oedema_boys] INTEGER, 
  [client_id] VARCHAR(36), 
  [username] VARCHAR, 
  [project] VARCHAR, 
  [upload_status] INTEGER DEFAULT 0, 
  [approved] INTEGER, 
  [is_deleted] INTEGER(1) NOT NULL DEFAULT 0, 
  [report_month] VARCHAR, 
  [followedup_boys] INTEGER, 
  [followedup_girls] INTEGER, 
  [exits_boys] INTEGER, 
  [exits_girls] INTEGER, 
  [other_specify] VARCHAR, 
  [other_boys] INTEGER, 
  [other_girls] INTEGER, 
  [upload_date] DATE, 
  [site_one] VARCHAR(50), 
  [site_two] VARCHAR(50), 
  [reffer_otp_girls_s1] INTEGER DEFAULT 0, 
  [reffer_otp_girls_s2] INTEGER DEFAULT 0, 
  [reffer_otp_boys_s1] INTEGER DEFAULT 0, 
  [reffer_otp_boys_s2] INTEGER DEFAULT 0, 
  [reffer_tsfp_girls_s1] INTEGER DEFAULT 0, 
  [reffer_tsfp_girls_s2] INTEGER DEFAULT 0, 
  [total_hh] INTEGER DEFAULT 0, 
  [uc_id] INTEGER, 
  [reffer_tsfp_boys_s1] INTEGER DEFAULT 0, 
  [reffer_tsfp_boys_s2] INTEGER DEFAULT 0, 
  [mnp_boys] INTEGER DEFAULT 0, 
  [mnp_girls] INTEGER DEFAULT 0, 
  [total_followup] INTEGER DEFAULT 0, 
  [total_exits] INTEGER DEFAULT 0, 
  [ent_type] CHAR(10), 
  [org_name] VARCHAR(50), 
  [province_id] INTEGER, 
  [district_id] INTEGER, 
  [tehsil_id] INTEGER, 
  [total_scr_boys_623] INTEGER, 
  [total_scr_girls_623] INTEGER, 
  [total_scr_boys_2459] INTEGER, 
  [total_scr_girls_2459] INTEGER, 
  [plus12_boys_623] INTEGER, 
  [plus12_girls_623] INTEGER, 
  [plus12_boys_2459] INTEGER, 
  [plus12_girls_2459] INTEGER, 
  [plus3_boys_623] INTEGER, 
  [plus3_girls_623] INTEGER, 
  [plus3_boys_2459] INTEGER, 
  [plus3_girls_2459] INTEGER, 
  [reffer_otp_boys_623_s1] INTEGER, 
  [reffer_otp_girls_623_s1] INTEGER, 
  [reffer_otp_boys_2459_s1] INTEGER, 
  [reffer_otp_girls_2459_s1] INTEGER, 
  [reffer_tsfp_boys_623_s1] INTEGER, 
  [reffer_tsfp_girls_623_s1] INTEGER, 
  [reffer_tsfp_boys_2459_s1] INTEGER, 
  [reffer_tsfp_girls_2459_s1] INTEGER, 
  [reffer_otp_boys_623_s2] INTEGER, 
  [reffer_otp_girls_623_s2] INTEGER, 
  [reffer_otp_boys_2459_s2] INTEGER, 
  [reffer_otp_girls_2459_s2] INTEGER, 
  [reffer_tsfp_boys_623_s2] INTEGER, 
  [reffer_tsfp_girls_623_s2] INTEGER, 
  [reffer_tsfp_boys_2459_s2] INTEGER, 
  [reffer_tsfp_girls_2459_s2] INTEGER, 
  [mnp_boys_623] INTEGER, 
  [mnp_girls_623] INTEGER, 
  [mnp_boys_2459] INTEGER, 
  [mnp_girls_2459] INTEGER, 
  [followup_boys_623] INTEGER, 
  [followup_girls_623] INTEGER, 
  [followup_boys_2459] INTEGER, 
  [followup_girls_2459] INTEGER, 
  [exits_boys_623] INTEGER, 
  [exits_girls_623] INTEGER, 
  [exits_boys_2459] INTEGER, 
  [exits_girls_2459] INTEGER, 
  [deworming_boys_623] INTEGER, 
  [deworming_girls_623] INTEGER, 
  [deworming_boys_2459] INTEGER, 
  [deworming_girls_2459] INTEGER, 
  [other_boys_623] INTEGER, 
  [other_girls_623] INTEGER, 
  [other_boys_2459] INTEGER, 
  [other_girls_2459] INTEGER);

INSERT INTO [main].[tblScrChildren]([rowid], [ch_scr_id_old], [ch_scr_id], [site_id], [screening_date], [created_at], [catchment_population], [staff_name], [staff_code], [sup_name], [sup_code], [total_scr_girls], [total_scr_boys], [sam_without_comp_girls_623], [sam_without_comp_boys_623], [sam_with_comp_girls_623], [sam_with_comp_boys_623], [mam_girls_623], [mam_boys_623], [sam_without_comp_girls_2459],
       [sam_without_comp_boys_2459], [sam_with_comp_girls_2459], [sam_with_comp_boys_2459], [mam_girls_2459], [mam_boys_2459], [reffer_tsfp_girls], [reffer_otp_girls], [reffer_tsfp_boys], [reffer_otp_boys], [normal_boys_623], [normal_girls_623], [normal_boys_2459], [normal_girls_2459], [first_mnp_30_girls], [first_mnp_30_boys], [second_mnp_30_girls], [second_mnp_30_boys], [third_mnp_30_girls], [third_mnp_30_boys], [fourth_mnp_30_girls], [fourth_mnp_30_boys], [fifth_mnp_30_girls], [fifth_mnp_30_boys], [sixth_mnp_30_girls], [sixth_mnp_30_boys], [deworming_girls], [deworming_boys], [new_boys], [new_girls], [reScreened_boys], [reScreened_girls], [no_oedema_girls], [no_oedema_boys], [plus12_oedema_girls], [plus12_oedema_boys], [plus3_oedema_girls], [plus3_oedema_boys], [client_id], [username], [project], [upload_status], [approved], [is_deleted], [report_month], [followedup_boys], [followedup_girls], [exits_boys], [exits_girls], [other_specify], [other_boys], [other_girls], [upload_date], [site_one], [site_two], [reffer_otp_girls_s1], [reffer_otp_girls_s2],
       [reffer_otp_boys_s1], [reffer_otp_boys_s2], [reffer_tsfp_girls_s1], [reffer_tsfp_girls_s2], [total_hh], [uc_id], [reffer_tsfp_boys_s1], [reffer_tsfp_boys_s2], [mnp_boys], [mnp_girls], [total_followup], [total_exits], [ent_type], [org_name], [province_id], [district_id], [tehsil_id], [total_scr_boys_623], [total_scr_girls_623], [total_scr_boys_2459], [total_scr_girls_2459], [plus12_boys_623], [plus12_girls_623], [plus12_boys_2459], [plus12_girls_2459], [plus3_boys_623], [plus3_girls_623], [plus3_boys_2459], [plus3_girls_2459], [reffer_otp_boys_623_s1], [reffer_otp_girls_623_s1], [reffer_otp_boys_2459_s1], [reffer_otp_girls_2459_s1], [reffer_tsfp_boys_623_s1], [reffer_tsfp_girls_623_s1], [reffer_tsfp_boys_2459_s1], [reffer_tsfp_girls_2459_s1], [reffer_otp_boys_623_s2], [reffer_otp_girls_623_s2], [reffer_otp_boys_2459_s2], [reffer_otp_girls_2459_s2], [reffer_tsfp_boys_623_s2],
       [reffer_tsfp_girls_623_s2], [reffer_tsfp_boys_2459_s2], [reffer_tsfp_girls_2459_s2], [mnp_boys_623], [mnp_girls_623], [mnp_boys_2459], [mnp_girls_2459], [followup_boys_623], [followup_girls_623], [followup_boys_2459], [followup_girls_2459], [exits_boys_623], [exits_girls_623], [exits_boys_2459], [exits_girls_2459], [deworming_boys_623], [deworming_girls_623], [deworming_boys_2459], [deworming_girls_2459], [other_boys_623], [other_girls_623], [other_boys_2459], [other_girls_2459])
SELECT [rowid], [ch_scr_id_old], [ch_scr_id], [site_id], [screening_date], [created_at], [catchment_population], [staff_name], [staff_code], [sup_name], [sup_code], [total_scr_girls], [total_scr_boys], [sam_without_comp_girls_623], [sam_without_comp_boys_623], [sam_with_comp_girls_623], [sam_with_comp_boys_623], [mam_girls_623], [mam_boys_623], [sam_without_comp_girls_2459], [sam_without_comp_boys_2459], [sam_with_comp_girls_2459], [sam_with_comp_boys_2459], [mam_girls_2459], [mam_boys_2459], [reffer_tsfp_girls], [reffer_otp_girls], [reffer_tsfp_boys],
 [reffer_otp_boys], [normal_boys_623], [normal_girls_623], [normal_boys_2459], [normal_girls_2459], [first_mnp_30_girls], [first_mnp_30_boys], [second_mnp_30_girls], [second_mnp_30_boys], [third_mnp_30_girls], [third_mnp_30_boys], [fourth_mnp_30_girls], [fourth_mnp_30_boys], [fifth_mnp_30_girls], [fifth_mnp_30_boys], [sixth_mnp_30_girls], [sixth_mnp_30_boys], [deworming_girls], [deworming_boys], [new_boys], [new_girls], [reScreened_boys], [reScreened_girls], [no_oedema_girls], [no_oedema_boys], [plus12_oedema_girls], [plus12_oedema_boys], [plus3_oedema_girls], [plus3_oedema_boys], [client_id], [username], [project], [upload_status], [approved], [is_deleted], [report_month], [followedup_boys], [followedup_girls], [exits_boys], [exits_girls], [other_specify], [other_boys], [other_girls], [upload_date], [site_one], [site_two], [reffer_otp_girls_s1], [reffer_otp_girls_s2], [reffer_otp_boys_s1], [reffer_otp_boys_s2], [reffer_tsfp_girls_s1], [reffer_tsfp_girls_s2], [total_hh], [uc_id], [reffer_tsfp_boys_s1], [reffer_tsfp_boys_s2], [mnp_boys], [mnp_girls], [total_followup], [total_exits], [ent_type], [org_name], [province_id], [district_id], [tehsil_id], [total_scr_boys_623], [total_scr_girls_623], [total_scr_boys_2459], [total_scr_girls_2459], [plus12_boys_623], [plus12_girls_623], [plus12_boys_2459], [plus12_girls_2459], [plus3_boys_623], [plus3_girls_623], [plus3_boys_2459], [plus3_girls_2459], [reffer_otp_boys_623_s1], [reffer_otp_girls_623_s1], [reffer_otp_boys_2459_s1], [reffer_otp_girls_2459_s1], [reffer_tsfp_boys_623_s1], [reffer_tsfp_girls_623_s1], [reffer_tsfp_boys_2459_s1], [reffer_tsfp_girls_2459_s1], [reffer_otp_boys_623_s2], [reffer_otp_girls_623_s2], [reffer_otp_boys_2459_s2], [reffer_otp_girls_2459_s2], [reffer_tsfp_boys_623_s2], [reffer_tsfp_girls_623_s2], [reffer_tsfp_boys_2459_s2], [reffer_tsfp_girls_2459_s2], [mnp_boys_623], [mnp_girls_623], [mnp_boys_2459], [mnp_girls_2459], [followup_boys_623], [followup_girls_623], [followup_boys_2459], [followup_girls_2459], [exits_boys_623], [exits_girls_623], [exits_boys_2459], [exits_girls_2459], [deworming_boys_623], [deworming_girls_623], [deworming_boys_2459], [deworming_girls_2459], [other_boys_623], [other_girls_623], [other_boys_2459], [other_girls_2459]
FROM [main].[_sqliteexpert_temp_table_1];

DROP TABLE IF EXISTS [main].[_sqliteexpert_temp_table_1];

RELEASE [sqlite_expert_apply_design_transaction];

PRAGMA [main].foreign_keys = 'on';

PRAGMA [main].legacy_alter_table = 'off';

PRAGMA [main].legacy_alter_table = 'on';

PRAGMA [main].foreign_keys = 'off';

SAVEPOINT [sqlite_expert_apply_design_transaction];

ALTER TABLE [main].[tblScrPlw] RENAME TO [_sqliteexpert_temp_table_1];

CREATE TABLE [main].[tblScrPlw](
  [plw_scr_id_old] INTEGER, 
  [plw_scr_id] char(36), 
  [site_id] INTEGER, 
  [screening_date] DATE, 
  [created_at] DATE, 
  [village] VARCHAR(50), 
  [staff_name] VARCHAR(50), 
  [staff_code] VARCHAR(10), 
  [sup_name] VARCHAR(50), 
  [sup_code] VARCHAR(10), 
  [total_scr_pragnent] INTEGER, 
  [total_scr_lactating] INTEGER, 
  [new_scr_pragnent] INTEGER, 
  [new_scr_lactating] INTEGER, 
  [reScreened_scr_pragnent] INTEGER, 
  [reScreened_scr_lactating] INTEGER, 
  [muac_gt_21_pragnent] INTEGER, 
  [muac_gt_21_lactating] INTEGER, 
  [muac_le_21_pragnent] INTEGER, 
  [muac_le_21_lactating] INTEGER, 
  [client_id] varchar(255), 
  [username] VARCHAR, 
  [project] VARCHAR, 
  [upload_status] INTEGER DEFAULT 0, 
  [approved] INTEGER, 
  [is_deleted] INTEGER(1) NOT NULL DEFAULT 0, 
  [report_month] VARCHAR, 
  [ifa_first_time_pragnent] INTEGER NOT NULL DEFAULT 0, 
  [ifa_first_time_lactating] INTEGER NOT NULL DEFAULT 0, 
  [followup_pragnent] INTEGER NOT NULL DEFAULT 0, 
  [followup_lactating] INTEGER NOT NULL DEFAULT 0, 
  [exits_pragnent] INTEGER NOT NULL DEFAULT 0, 
  [exit_lactating] INTEGER NOT NULL DEFAULT 0, 
  [upload_date] DATE, 
  [uc_id] INTEGER, 
  [catchment_population] INTEGER, 
  [total_hh], 
  [total_followup] INTEGER DEFAULT 0, 
  [total_exits] INTEGER DEFAULT 0, 
  [org_name] VARCHAR(50), 
  [province_id] INTEGER, 
  [district_id] INTEGER, 
  [tehsil_id] INTEGER, 
  [ent_type] CHAR(10), 
  [new_scr_plw] INTEGER, 
  [reScreened_scr_plw] INTEGER, 
  [muac_gt_21_plw] INTEGER, 
  [muac_le_21_plw] INTEGER, 
  [ifa_first_time_plw] INTEGER, 
  [total_scr_plw] INTEGER);

INSERT INTO [main].[tblScrPlw]([rowid], [plw_scr_id_old], [plw_scr_id], [site_id], [screening_date], [created_at], [village], [staff_name], [staff_code], [sup_name], [sup_code], [total_scr_pragnent], [total_scr_lactating], [new_scr_pragnent], [new_scr_lactating], [reScreened_scr_pragnent], [reScreened_scr_lactating], [muac_gt_21_pragnent], [muac_gt_21_lactating], [muac_le_21_pragnent], [muac_le_21_lactating], [client_id], [username], [project], [upload_status], [approved], [is_deleted], [report_month], [ifa_first_time_pragnent], [ifa_first_time_lactating], [followup_pragnent], [followup_lactating], [exits_pragnent], [exit_lactating], [upload_date], [uc_id], [catchment_population], [total_hh], [total_followup], [total_exits], [org_name], [province_id], [district_id], [tehsil_id], [ent_type], [new_scr_plw], [reScreened_scr_plw], [muac_gt_21_plw], [muac_le_21_plw], [ifa_first_time_plw], [total_scr_plw])
SELECT [rowid], [plw_scr_id_old], [plw_scr_id], [site_id], [screening_date], [created_at], [village], [staff_name], [staff_code], [sup_name], [sup_code], [total_scr_pragnent], [total_scr_lactating], [new_scr_pragnent], [new_scr_lactating], [reScreened_scr_pragnent], [reScreened_scr_lactating], [muac_gt_21_pragnent], [muac_gt_21_lactating], [muac_le_21_pragnent], [muac_le_21_lactating], [client_id], [username], [project], [upload_status], [approved], [is_deleted], [report_month], [ifa_first_time_pragnent], [ifa_first_time_lactating], [followup_pragnent], [followup_lactating], [exits_pragnent], [exit_lactating], [upload_date], [uc_id], [catchment_population], [total_hh], [total_followup], [total_exits], [org_name], [province_id], [district_id], [tehsil_id], [ent_type], [new_scr_plw], [reScreened_scr_plw], [muac_gt_21_plw], [muac_le_21_plw], [ifa_first_time_plw], [total_scr_plw]
FROM [main].[_sqliteexpert_temp_table_1];

DROP TABLE IF EXISTS [main].[_sqliteexpert_temp_table_1];

RELEASE [sqlite_expert_apply_design_transaction];

PRAGMA [main].foreign_keys = 'on';

PRAGMA [main].legacy_alter_table = 'off';

PRAGMA [main].legacy_alter_table = 'on';

PRAGMA [main].foreign_keys = 'off';

SAVEPOINT [sqlite_expert_apply_design_transaction];

ALTER TABLE [main].[tblStokDistv2] RENAME TO [_sqliteexpert_temp_table_1];

CREATE TABLE [main].[tblStokDistv2](
  [dist_id_old] integer, 
  [dist_id] char(36), 
  [program_type] varchar(10), 
  [item_name] varchar(50) NOT NULL, 
  [item_id] integer NOT NULL, 
  [opening] decimal NOT NULL, 
  [received] decimal NOT NULL, 
  [distributed] decimal NOT NULL, 
  [remaining] decimal NOT NULL, 
  [district_id] integer NOT NULL, 
  [tehsil_id] integer NOT NULL, 
  [site_id] integer NOT NULL, 
  [CHW_id] VARCHAR NOT NULL DEFAULT 0, 
  [CHS_id] VARCHAR NOT NULL DEFAULT 0, 
  [is_deleted] INT NOT NULL DEFAULT 0, 
  [upload_status] INT NOT NULL DEFAULT 0, 
  [created_at] DATETIME, 
  [updated_at] DATETIME, 
  [stockDistId] VARCHAR, 
  [damaged] DECIMAL NOT NULL DEFAULT 0, 
  [dist_month] VARCHAR, 
  [province_id] INTEGER, 
  [uc_id] INTEGER, 
  [client_id] VARCHAR, 
  [upload_date] DATE, 
  [org_name] VARCHAR(50), 
  [project_name] VARCHAR(50));

INSERT INTO [main].[tblStokDistv2]([rowid], [dist_id_old], [dist_id], [program_type], [item_name], [item_id], [opening], [received], [distributed], [remaining], [district_id], [tehsil_id], [site_id], [CHW_id], [CHS_id], [is_deleted], [upload_status], [created_at], [updated_at], [stockDistId], [damaged], [dist_month], [province_id], [uc_id], [client_id], [upload_date], [org_name], [project_name])
SELECT [rowid], [dist_id_old], [dist_id], [program_type], [item_name], [item_id], [opening], [received], [distributed], [remaining], [district_id], [tehsil_id], [site_id], [CHW_id], [CHS_id], [is_deleted], [upload_status], [created_at], [updated_at], [stockDistId], [damaged], [dist_month], [province_id], [uc_id], [client_id], [upload_date], [org_name], [project_name]
FROM [main].[_sqliteexpert_temp_table_1];

DROP TABLE IF EXISTS [main].[_sqliteexpert_temp_table_1];

RELEASE [sqlite_expert_apply_design_transaction];

PRAGMA [main].foreign_keys = 'on';

PRAGMA [main].legacy_alter_table = 'off';
Update tblOtpAdd set height=null, upload_status=2 where height='';

update tblOtpAdd
   set province_id = (
                  select province_id
                    from v_geo
                   where v_geo.site_id = tblOtpAdd.site_id
                 ),
     district_id = (
                  select district_id
                    from v_geo
                   where v_geo.site_id = tblOtpAdd.site_id
                 ),
     upload_status=2
                 
 where exists (
               select *
                 from v_geo
                where v_geo.site_id = tblOtpAdd.site_id
              ) and tblOtpAdd.district_id is null;`
           var v4012Msg = `updated table with version 4.0.12 requirements`
              await chekAndExecuteUpdate(_checkVer, currentVersion, v4012Upadte, v4012Msg);
    } catch (error) {

        console.log(error)
    }
}