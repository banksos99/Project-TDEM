import DeviceInfo from 'react-native-device-info';
const bundleId = DeviceInfo.getBundleId();

console.log("BUNDLE ID ======================= " + bundleId);

// let HOST = 'https://tdemconnect.tdem.toyota-asia.com';
// let SERVER = 'PROD'
// let SessiontimeoutSec = 1800;

 let HOST = 'https://tdemconnect-dev.tdem.toyota-asia.com';
 let SERVER = 'DEV'
 let SessiontimeoutSec = 300;

//HOST = 'https://tdemconnect.tdem.toyota-asia.com'
//    SERVER = 'PROD'
//   SessiontimeoutSec = 1800;
    

if (bundleId == "com.tdem.stmconnect") {
   HOST = 'https://tdemconnect.tdem.toyota-asia.com'
    SERVER = 'PROD'
    SessiontimeoutSec = 1800;
}
//else if (bundleId == "com.tdem.tdemconnectdev") {
else{
    HOST = 'https://tdemconnect-dev.tdem.toyota-asia.com'
    SERVER = 'DEV'
    SessiontimeoutSec = 300;
}


console.log("HOST ======================= " + HOST);

// android - (Build type)
// 1. Debug - (มี log warning + error)
// 2. Release - (ไม่มี log พร้อมขึ้น store)

// android - product flavors หรือ build variant
// 1. Dev - (Icon, Server API)
// 2. Prod - (Icon,Server API ของจริง)

// ตัวอย่าง

// react-native run-android --variant=devDebug
// react-native run-android --variant=prodDebug

// Build Release APK

// ./gradlew assemble<ProductFlavor><BuildType>

// ./gradlew assembleDevRelease
// ./gradlew assembleProdRelease

// 
// const HOST = 'http://192.168.2.189:8080'
//const VERSION = 'v1'
//const VERSION = 'v1.0.59'//10-09-61
// const VERSION = 'v1.0.60'//11-09-61
// const VERSION = 'v1.0.61'//14-09-61
// const VERSION = 'v1.0.62'//14-09-61 IOS: Android:
// const VERSION = 'v1.0.63'//18-09-61 IOS: Android:
// const VERSION = 'v1.0.64'//18-09-61 IOS: Android:
// const VERSION = 'v1.0.65'//19-09-61 IOS: Android:
// const VERSION = 'v1.0.68'//20-09-61 IOS: Android:
// const VERSION = 'v1.0.70'//20-09-61 IOS: Android:
// const VERSION = 'v1.0.71'//27-09-61 IOS: Android:
// const VERSION = 'v1.0.72'//30-09-61 IOS: Android:
// const VERSION = 'v1.0.73'//28-09-61 IOS: Android:
// const VERSION = 'v1.0.74'//04-10-61 IOS: Android:
// const VERSION = 'v1.0.75'//04-10-61 IOS: Android:
// const VERSION = 'v1.0.76'//22-10-61 IOS: Android:
// const VERSION = 'v1.0.77'//24-10-61 IOS: Android:
// const VERSION = 'v1.0.78'//04-10-61 IOS: Android:
// const VERSION = 'v1.0.79'//29-10-61 IOS: Android:
// const VERSION = 'v1.0.80'//01-11-61 IOS: Android:
// const VERSION = 'v1.0.81'//04-10-61 IOS: Android:
// const VERSION = 'v1.0.82'//04-10-61 IOS: Android:

//const VERSION = 'v1.0.83'//04-10-61 IOS: Android:
// const VERSION = 'v1.0.84'//04-10-61 IOS: Android:

 const VERSION = 'v1.0.86'//04-10-61 IOS: Android: ** New funtion download file pdf on announment 24/10/2019

// const VERSION = 'v1.0.0'//23-11-61 IOS: Android:
// const VERSION = 'v1.0.1'//23-11-61 IOS: Android:
// const VERSION = 'v1.0.2'//23-11-61 IOS: Android:


 const APPLICATION_DEVICE = 'STM' // STM , TDEM

 let COMPANY_DEVICE = 'tmap-em'
 if(APPLICATION_DEVICE === 'STM'){
     COMPANY_DEVICE = 'stm'
 }

export default {
    APPLICATION_DEVICE: APPLICATION_DEVICE,
    HOST: HOST,
    SERVER: SERVER,
    VERSION: VERSION,
    TOKEN: '',
    SessiontimeoutSec:SessiontimeoutSec,
    
    INITIAL_MASTER_API: HOST + '/api/' + VERSION + '/initmaster/',
    APPLICATION_INFO_API: HOST + '/api/' + VERSION + '/appinfo',
    

    PULL_NOTIFICATION_API: HOST + '/api/' + VERSION + '/pullnotificationRollout' + '?applicationDevice=' + APPLICATION_DEVICE + '&latest_date=',
    PULL_NOTIFICATION_NODATE_API: HOST + '/api/' + VERSION + '/pullnotificationRollout' + '?applicationDevice=' + APPLICATION_DEVICE,
    ANNOUNCEMENT_ASC_API: HOST + '/api/' + VERSION + '/announcementRollout?sort=-create_date' + '&applicationDevice=' + APPLICATION_DEVICE,
    ANNOUNCEMENT_DSC_API: HOST + '/api/' + VERSION + '/announcementRollout?sort=%2Bcreate_date' + '&applicationDevice=' + APPLICATION_DEVICE,

    ANNOUNCEMENT_DETAIL_API: HOST + '/api/' + VERSION + '/announcement/',
    ANNOUNCEMENT_DOWNLOAD_API: HOST + '/api/' + VERSION + '/announcement/file',

    PAYSLIP_LIST_API: HOST + '/api/' + VERSION + '/payslip/summary',
    PAYSLIP_DETAIL_API: HOST + '/api/' + VERSION + '/payslip/',
    PAYSLIP_DOWNLOAD_API: HOST + '/api/' + VERSION + '/payslip/file/',

    OTSUMMARY_DETAIL: HOST + '/api/' + VERSION + '/ot/summary?',

    HANDBOOK_LIST: HOST + '/api/' + VERSION + '/handbooks',
    HANDBOOK_DOWNLOAD: HOST + '/api/' + VERSION,

    LEAVE_QUOTA_API: HOST + '/api/' + VERSION + '/leavequota/summary',
    NONPAYROLL_SUMMARY_API: HOST + '/api/' + VERSION + '/nonpayroll/summary',
    CALENDER_YEAR_API: HOST + '/api/' + VERSION + '/calendar?year=',
    CALENDER_YEAR_PDF_API: HOST + '/api/' + VERSION + '/calendar/file?year=',
    CALENDER_DOWNLOAD: HOST + '/api/' + VERSION,
    
    NON_PAYROLL_DETAIL_API: HOST + '/api/' + VERSION + '/nonpayroll?month=',

    CLOCK_IN_OUT_API: HOST + '/api/' + VERSION + '/clockinout?empcode=',
    CALENDAR_PDF_YEAR_API: HOST + '/api/' + VERSION + '/calendar/file?year=',
    CALENDAR_NAME: 'Toyota',

    REGISTER_API: HOST + '/api/' + VERSION + '/auth',
    SET_PIN_API: HOST + '/api/' + VERSION + '/pin',

    CLOCK_IN_OUT_MANAGER_API: HOST + '/api/' + VERSION + '/clockinout?empcode=',
    EMP_INFO_CAREERPATH_API: HOST + '/api/' + VERSION + '/employee/',
    EMP_INFO_MANAGER_API: HOST + '/api/' + VERSION + '/employee/',
    // ORGANIZ_STRUCTURE_API: HOST + '/api/' + VERSION + '/organization?type=CE&org_code=',


    OTSUMMARY_LINE_CHART: HOST + '/api/' + VERSION + '/ot/history?org_code=',
    OTSUMMARY_BAR_CHART: HOST + '/api/' + VERSION + '/ot/average?org_code=',

    ORGANIZ_STRUCTURE_API: HOST + '/api/' + VERSION + '/organization?type=CE&org_code=',
    ORGANIZ_STRUCTURE_OT_API: HOST + '/api/' + VERSION + '/organization?type=CE&org_code=',

    profileObject: {},
    initmaster: {},

    NOTIFICATION_CATEGORY: [],
    READ_TYPE: [],
    COMPANY_LOCATION: [],
   
    TB_M_LEAVETYPE: [],
    company: COMPANY_DEVICE,

    deviceInfo: {},
    calendarAutoSync: true,
    autoSyncCalendarBool:true,
    // MANAGER_STATUS:true,
    notipayslipID: 0,
    notiAnnounceMentID: 0,
    notiAnnounceMentBadge: 0,
    setHomeViewStatus: 0,
    notiPayslipBadge:[],
    nonPayslipBadge:[],
    timeinterval: 60000,
    lastdatetimeinterval: 0,
    payslipBadgeList: [],

    HandbookHighlightList: [],
    Handbook: [],
    isConnected: true,
    userRegisted: false,

    FUNCTIONID_SPLASH: 'HF0111',
    FUNCTIONID_REGISTER: 'HF0121',
    FUNCTIONID_PIN: 'HF0131',
    FUNCTIONID_MAIN: 'HF0141',
    FUNCTIONID_SETTING: 'HF0151',
    FUNCTIONID_ANNOUCEMENT: 'HF0201',
    FUNCTIONID_WORKING_CALENDAR: 'HF0311',
    FUNCTIONID_CALENDAR_EVENT: 'HF0321',
    FUNCTIONID_EMPLOYEE_INFORMATION: 'HF0401',
    FUNCTIONID_PAYSLIP: 'HF0501',
    FUNCTIONID_NON_PAYROLL: 'HF0601',
    FUNCTIONID_CLOCK_IN_OUT: 'HF0701',
    FUNCTIONID_OT_SUMMARY: 'HF0801',
    FUNCTIONID_LEAVE_QUOTA: 'HF0901',
    FUNCTIONID_HANDBOOK: 'HF0A01',
    FUNCTIONID_GENERAL_INFORMATION_SHARING: 'HF0B01',
    FUNCTIONID_ORGANIZ_STRUCTURE: 'HF0C01',
    FUNCTIONID_PUSH_NOTIFICATION: 'HF0C01',
    ////////////////////

    SCREEN_SPLASH: 'MHF01110SplashView',
    SCREEN_REGISTER: 'MHF01210RegisterView',
    SCREEN_PIN: 'MHF01310PinView',
    SCREEN_MAIN: 'MHF01410MainView',
    SCREEN_MAIN_MENU: 'MHF01411MainMenuView',
    SCREEN_MAIN_MANAGER_MENU: 'MHF01412MainManagerMenuView',
    SCREEN_SETTING: 'MHF01510SettingView',

    SCREEN_ANNOUCEMENT_VIEW: 'MHF02010AnnouncementView',
    SCREEN_ANNOUCEMENT_LIST: 'MHF02011AnnouncementListView',
    SCREEN_ANNOUCEMENT_DETAIL: 'MHF02012AnnouncementDetailView',

    SCREEN_WORKING_CALENDAR: 'MHF03110WorkingCalendarView',
    SCREEN_WORKING_CALENDAR_YEAR: 'MHF03111WorkingCalendarYearView',
    SCREEN_WORKING_CALENDAR_MONTH: 'MHF03112WorkingCalendarMonthView',
    SCREEN_WORKING_CALENDAR_DETAIL: 'MHF03112WorkingCalendarDetail',

    SCREEN_CALENDAR_EVENT: 'MHF03210CalendarEventView',
    SCREEN_CALENDAR_EVENT_DETAIL: 'MHF03211CalendarEventDetailView',

    SCREEN_EMPLOYEE_INFORMATION: 'MHF04010EmpInfoView',
    SCREEN_EMPLOYEE_INFORMATION_SELF: 'MHF04011EmpInfoSelfView',
    SCREEN_EMPLOYEE_INFORMATION_MANAGER: 'MHF04012EmpInfoManagerView',

    SCREEN_PAYSLIP: 'MHF05010PayslipView',
    SCREEN_PAYSLIP_LIST: 'MHF05011PaySlipListView',
    SCREEN_PAYSLIP_DETAIL: 'MHF05012PaySlipDetailView',

    SCREEN_NON_PAYROLL: 'MHF06010NonPayrollView',
    SCREEN_NON_PAYROLL_LIST: 'MHF05011PaySlipListView',
    SCREEN_NON_PAYROLL_DETAIL: 'MHF06012NonPayrollDetailView',

    SCREEN_CLOCK_IN_OUT: 'MHF07010ClockInOutView',
    SCREEN_CLOCK_IN_OUT_SELF: 'MHF07011ClockInOutSelfView',
    SCREEN_CLOCK_IN_OUT_MANAGER: 'MHF07012ClockInOutManagerView',

    SCREEN_OT_SUMMARY: 'MHF08010OTSummaryView',
    SCREEN_OT_SUMMARY_SELF: 'MHF08011OTSummarySelfViewView',
    SCREEN_OT_SUMMARY_MANAGER: 'MHF08012OTSummaryManagerView',

    SCREEN_LEAVE_QUOTA: 'MHF09010LeaveQuotaView',
    SCREEN_LEAVE_QUOTA_LIST: 'MHF09011LeaveQuotaListView',
    SCREEN_LEAVE_QUOTA_DETAIL: 'MHF09012LeaveQuotaDetailView',

    SCREEN_HANDBOOK: 'MHF0A010HandbookView',
    SCREEN_HANDBOOK_LIST: 'MHF0A011HandbookListView',
    SCREEN_HANDBOOK_DETAIL_LIST: 'MHF0A012HandbookDetailView',

    SCREEN_MANAGER_VIEW: 'MHF0C110ManagerViewView',

    SCREEN_GENERAL_INFORMATION_SHARING: 'MHF0C110GeneralInformationSharing',
    SCREEN_ORGANIZ_STRUCTURE: 'MHF0C110OrgamizStructure',

    currentNavigator: 'home',
    sessionTimeoutBool: false,
    countbegin: 0,
    selectLocationCalendar:'default',
    Sessiontimeout:0,
    del_event:0,
    add_event:0,
    allowfontscale:false
}

