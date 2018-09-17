import { StyleSheet, Platform, } from "react-native";

import Colors from "./Colors";
import Layout from "./Layout";

// import { backgroundColor } from "react-native-calendars/src/style";

let scale = Layout.window.width / 320;
const font_medium = "Prompt-Regular";
const font_light = 'Prompt-Light';
const font_thin = 'Prompt-Thin';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white'
    },

    statusbarcontainer: {
        ...Platform.select({
            ios: {
                height: 20,
                width: '100%'
            },
            android: {
                height: 0,
                width: '100%'
            }
        })
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: 'white'

    },
    emptyContainer1: {
        flex: 1,
        backgroundColor: Colors.redColor

    },
    textContainer: {
        color: 'black',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 30,
        margin: 2,
        borderColor: '#2a4944',
        borderWidth: 1,
        backgroundColor: '#d2f7f1'
    },
    //App.js
    MainContainer: {
        justifyContent: 'center',
        flex: 1,
        margin: 10
    },
    TextStyle: {
        fontSize: 20,
        textAlign: 'center',
        color: 'black',
    },
    centerContainer: {
        flexDirection: "column",
        flex: 1
    },
    //LoginActivity
    pickerContainer: {
        backgroundColor: 'black'
    },
    tabItemContainer: {
        flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'center'
    },
    tabIconContainer: {
        width: 40,
        height: 40,
        // alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    badgeIcon: {
        minWidth: 18,
        height: 18,
        backgroundColor: '#2b78e4',
    },
    badgeIconpayslip: {
        top: scale ,
        right: scale,
        width: 18* scale,
        height: 18* scale,
        borderRadius: 9* scale,
        backgroundColor: 'red',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center'
    },
    badgeIconpayslipDisable: {
        top: scale ,
        right: scale,
        width: 18* scale,
        height: 18* scale,
        borderRadius: 9* scale,
        backgroundColor: 'transparent',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        width: 40,
        height: 40
    },
    //NavView 
    navContainer: {

        ...Platform.select({
            ios: {
                height: 70,
            },
            android: {
                height: 50,
            }
        }),
        // paddingTop: 20,

        width: Layout.window.width,

        backgroundColor: Colors.navColor

    },
    detailContainer: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: 'column'
    },
    navLeftContainer: {
        ...Platform.select({
            ios: {
                paddingTop: 20,
            },
            android: {
                paddingTop: 0,
            }
        }),
        // paddingTop: 20,//title
        flexDirection: 'row',
        position: 'absolute',
        alignSelf: 'flex-start'
    },
    navTitleText: {
        ...Platform.select({
            ios: {
                paddingTop: 20,
            },
            android: {
                paddingTop: 0,
            }
        }),
        marginTop: 10,
        fontSize: 20,
        color: 'white',
        alignSelf: 'center',
        marginLeft: 45,
        marginRight: 45,
        fontFamily: font_medium
    },
    navTitleTextTop: {
        fontSize: Layout.window.width / 320 * 17,
        color: 'white',
        alignSelf: 'center',
        fontFamily: font_medium
    },
    navRightContainer: {
        ...Platform.select({
            ios: {
                paddingTop: 20,
            },
            android: {
                paddingTop: 0,
            }
        }),

        // paddingTop: 20,//title
        flexDirection: 'row',
        position: 'absolute',
        alignSelf: 'flex-end',
        // zIndex: '10',
    },
    navRightButton: {
        flex: 1,
        width: 45,
        height: 45,
        padding:5,
        // marginLeft:10,
        // marginRight:10,
        // backgroundColor:'blue',
        

    },
    navRightSyncButton: {
        flex: 1,
        width: 30,
        height: 30,
        margin:10,
        // width: 25,
        // height: 25,
        // marginTop:10,
        // marginLeft:10,
        // marginRight:10,
        // backgroundColor:'green'
    },
    navBackButton: {
        width: 45,
        height: 45,
    },
    calendarMonthTextLeftContainer: {
        flexDirection: 'row',
        position: 'absolute',
        alignSelf: 'flex-start',
        // zIndex: '10',
    },
    calendarMonthTextRightContainer: {
        flexDirection: 'row',
        position: 'absolute',
        alignSelf: 'flex-end',
        // zIndex: '10',
    },
    calendarMonthText: {
        fontSize: 10,
        textAlign: 'left',
        color: Colors.calendarRedText
    },
    calendarYearText: {
        fontSize: 40,
        textAlign: 'left',
        color: Colors.redTextColor,
    },
    calendarLocationText: {
        fontSize: 18,
        textAlign: 'right',
        color: Colors.redTextColor,
    },
    calendarTitleBox: {
        height: 60, marginLeft: 10, marginRight: 10,
    },
    calendarCoverTitleBox: {
        width: 120,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: Colors.calendarLocationBoxColor,
        borderRadius: 5,
        borderColor: Colors.calendarLocationBorderBoxColor,
        borderWidth: 2,
        justifyContent: 'flex-end',
    },
    calendarLocationBox: {
        width: 120,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: Colors.calendarLocationBoxColor,
        borderRadius: 5,
        borderColor: Colors.calendarLocationBorderBoxColor,
        borderWidth: 2,
        justifyContent: 'flex-end'
    },
    calendarRowBox: {
        flex: 1, backgroundColor: 'white', flexDirection: 'row'
    },
    calendarDayContainer: {
        flex: 1, height: 15, marginBottom: -13, marginTop: -10
        // alignItems: 'right',
    },
    calendarDayText: {
        fontSize: 10,
        textAlign: 'right',
    },
    calendarCurrentDayCircle: {
        height: 15, width: 15,
        backgroundColor: 'red',
        borderRadius: 100,
        position: 'absolute',
        marginLeft: 4.5,
        marginTop:0

    },
    calendarCurrentDayCicleContainer: {
        flex: 1,
        height: 15, marginBottom: -13, marginTop: -10
    },
    calendarCurrentDayText:
    {
        fontSize: 10, textAlign: 'right', color: 'white'
    },
    calendarTitleDialogText: {
        color: 'black',
        fontSize: 20,
        textAlign: 'left',
        paddingTop: 10,
        paddingLeft: 20
    },
    calendarButtonDialogText: {
        color: Colors.redTextColor,
        fontSize: 20,
        textAlign: 'right',
        paddingBottom: 10,
        paddingRight: 20
    },
    calendarTitleRightText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        paddingRight: 10
    },
    calendarMonthTitleText: {
        fontSize: 35,
        fontWeight: 'bold',
        color: 'white',
    },
    calendarYearTitleText: {
        fontSize: 20,
        color: 'white',
    },
    calendarWeekTitleView: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 1,
        alignItems: 'flex-end'
    },
    calendarDayHeader: {
        flex: 1,
        fontSize: 12,
        backgroundColor: 'red',
        textAlign: 'center',
        color: 'white',
        textAlign: 'center',
        paddingBottom: 2
    },
    calendarEventTitleText: {
        fontSize: 15,
        textAlign: 'left',
        fontWeight: 'bold',
        color: Colors.redTextColor,
        paddingLeft: 10,
        paddingRight: 10
    },
    calendarEventItemView: {
        height: 50,
        margin: 3,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    calendarNoEventItemView: {
        flex: 1, justifyContent: 'center',
        alignItems: 'center',
    },
    calendarNoEventItemText: {
        color: Colors.grayTextColor, alignSelf: 'center'
    },
    calendarEventCircleView: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginRight: 5,
        marginBottom: 5
    },
    calendarEventItemLeftView: {
        width: 100,
        paddingLeft: 20,
    },
    calendarEventItemRightView: {
        flex: 1,
    },
    calendarEventTimeStartText: {
        fontSize: 14,
        textAlign: 'left',
        color: Colors.grayTextColor,
    },
    calendarEventTimeEndText: {
        fontSize: 12,
        textAlign: 'left',
        color: Colors.lightGrayTextColor,
    },
    calendarEventDetailIcon: {
        width: 30,
        height: 30,
        margin: 10,
    },
    calendarEventDetailView: {
        backgroundColor: Colors.calendarGrayBackgroundColor,
        marginTop: 5,
        marginBottom: 5,
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 10
    },
    calendarEventHeaderText: {
        alignSelf: 'center',
        fontSize: 15,
        // textAlign: 'left',
        color: Colors.redTextColor,
        fontWeight: 'bold'
    },
    calendarEventText: {
        alignSelf: 'center',
        flex: 1,
        fontSize: 16,
        textAlign: 'left',
    },
    calendarEventTimeText: {
        fontSize: 15,
        // textAlign: 'left',
        color: Colors.grayTextColor,
        fontWeight: 'bold'
    },
    calendarEventTimeDetialText: {
        fontSize: 13,
        color: Colors.lightGrayTextColor,
        textAlign: 'left'
    },
    calendarEventTimeAlldayDetialText: {
        fontSize: 13,
        color: Colors.lightGrayTextColor,
    },
    calendarEventContainer: {
        flexDirection: 'column',
        alignSelf: 'center'
    },
    calendarEventViewContainer: {
        flexDirection: 'row',
        paddingTop: 15,
        paddingBottom: 15,
        marginRight: 30
    },
    //MainMenu
    mainscreen: {
        height: scale * 169,
        width: '100%',
        alignItems: 'center'
        //  backgroundColor: 'green'
    },
    boxShadow: {
        flex: 1,
        margin: 5,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
     
        
    },
    buttonContainer: {
        flex: 1,
    },
    mainmenutabbarstyle: {
        ...Platform.select({
            ios: {
                height: 20 ,
                backgroundColor: Colors.calendarRedText
            },
            android: {
                height: 0,
                backgroundColor: Colors.calendarRedText
            }
        })
    },
    mainmenuImageButton: {
        flex: 3,
       // alignSelf: 'center',
        // backgroundColor: 'green',
        justifyContent: 'center', // Used to set Text Component Vertically Center
        alignItems: 'center' // Us
    },
    mainmenuTextButton: {
        flex: 2,
        // backgroundColor: 'blue',
        justifyContent: 'center', // Used to set Text Component Vertically Center
        alignItems: 'center' // Us
    },
    mainmenuTextname: {
        fontSize: scale * 13,
        color: Colors.grayTextColor,
        fontFamily: font_medium
    },
    userTitleText: {
        fontSize: scale * 15,
        color: Colors.grayTextColor,
        fontFamily: font_medium
    },
    usernameText: {
        fontSize: scale * 13,
        color: Colors.grayTextColor,
        fontFamily: font_medium

    },
    managermenuImageButton: {
        flex: 4,
        alignSelf: 'center',
        marginTop: 50,
        // backgroundColor: 'green',
        justifyContent: 'center', // Used to set Text Component Vertically Center
        alignItems: 'center' // Us
    },
    managermenuTextButton: {
        flex: 2,
        // backgroundColor: 'blue',
        justifyContent: 'center', // Used to set Text Component Vertically Center
        alignItems: 'center' // Us
    },
    managermenuTextname: {
        fontSize: scale * 14,
        color: Colors.grayTextColor,
        fontFamily: font_medium
    },
    // LeaveQuota
    leavequotaTabbar: {
        height: 50,
        backgroundColor: Colors.backgroundcolor,

    },
    leaveYearButton_dis: {
        color: Colors.calendarLocationBoxColor,
        fontSize: scale * 22,
        textAlign: 'center',
        // backgroundColor: Colors.backgroundcolor
    },
    leaveYearButton_ena: {

        color: Colors.redTextColor,
        fontSize: scale * 22,
        textAlign: 'center',
        // backgroundColor: Colors.calendarLocationBoxColor
    },
    leavequotaBackground: {
        flex: 1,
        marginLeft: 7,
        marginRight: 7,
        paddingLeft: 10,
        paddingRight: 10
        // backgroundColor: Colors.backgroundcolor
    },
    leavequotaLeftContainer: {
        flex: 10, justifyContent: 'center', flexDirection: 'column'
    },
    leavequotaListContainer: {
        flex: 2,
        justifyContent: 'center'
    },
    leavequotaLastListContainer: {
        justifyContent: 'center',
        flex: 2
    },
    leavequotalistBackground: {
        backgroundColor: Colors.calendarLocationBoxColor,
        height: scale * 55,
        marginBottom: 1,
        flex: 3,
        justifyContent: 'center',
        flexDirection: 'column'
    },
    leavequotaLine: {
        height: 1, backgroundColor: Colors.lightGrayTextColor
    },
    leavequotaContainer: {
        flex: 1, flexDirection: 'row'
    },
    leavequotalisttextbold: {
        // color: Colors.grayTextColor,
        fontSize: 14,
        textAlign: 'left',
        fontFamily: font_medium
    },
    leavequotalisttext: {
        color: Colors.lightgrayText,
        fontSize: 10 * scale,
        textAlign: 'left',
        fontFamily: font_medium
    },
    leavequotalisttextboldUnit: {
        color: Colors.grayTextColor,
        fontSize: 13 * scale,
        textAlign: 'right',
        fontFamily: font_medium
    },

    leavequotalisttextred: {
        color: Colors.redTextColor,
        fontSize: 13*scale,
        textAlign: 'center',
        fontFamily: font_medium
    },
    leavequotalisttextgreen: {
        color: Colors.greenTextColor,
        fontSize: 13*scale,
        textAlign: 'center',
        fontFamily: font_medium
    },
    leaveQuotaDetailContainer: {
        flex: 1, flexDirection: 'column',
        backgroundColor: 'white',
       // marginLeft: 10,
       // marginRight: 10
    },
    leaveQuotaDetailContentContainer: {
        backgroundColor: Colors.calendarGrayBackgroundColor,
        paddingTop: 20, paddingBottom: 20, marginBottom: 5
    },
    leaveQuotaDescText: {
        fontSize: 15*scale, color: Colors.grayTextColor, fontFamily: font_light
    },
    leaveQuotaDetailContentTextContainer: {
        height: 30,
    },
    leaveQuotaDetailContentTextInsideContainer: {
        flex: 1, flexDirection: 'row', marginLeft: 10, marginRight: 10
    },
    leaveQuotaContentTitleText: {
        flex: 1,
        fontSize: 15*scale,
        color: Colors.grayTextColor,
        fontFamily: font_medium
    },
    leaveQuotaContentDescText: {
        flex: 1,
        fontSize: 15*scale,
        color: Colors.grayTextColor,
        textAlign: 'left',
        fontFamily: font_medium
    },
    leaveQuotaContentGrayText: {
        fontSize: 15*scale,
        color: Colors.grayTextColor,
        fontFamily: font_medium
    },
    leaveQuotaContentRedText: {
        fontSize: 15*scale,
        color: Colors.redTextColor,
        fontFamily: font_medium
    },
    leaveQuotaContainer: {
        // flex: 1,
        height: 160,
        flexDirection: 'row',
        paddingLeft: 30,
        paddingRight: 30,
        backgroundColor: Colors.calendarGrayBackgroundColor,
        marginTop: 5,
        marginBottom: 5,
    //     marginLeft: 10,
    //    marginRight: 10
    },
    leaveQuotaDetailItemTopContainer: {
        flex: 1, flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center',
    },
    leaveQuotaDetailItemTopTitleText: {
        fontSize: 16*scale, color: Colors.grayTextColor,
        fontFamily: font_medium
    },
    leaveQuotaDetailItemTopCircleContainer: {
        width: 60, height: 60, backgroundColor: Colors.leaveCircleRed,
        justifyContent: 'center', alignItems: 'center', borderRadius: 60
        , marginTop: 10, marginBottom: 10
    },
    leaveQuotaDetailItemTopCircleText: {
        textAlign: 'center', fontSize: 20*scale, color: 'white',
        fontFamily: font_medium
    },
    leaveQuotaDetailItemTopDescText: {
        fontSize: 15*scale, color: Colors.grayText, fontFamily: font_light//TODO
    },
    pinnumber: {
        flex: 1,
        fontSize: scale * 20,
        fontWeight: 'bold',
        //color: Colors.grayColor,//'white',
        color: 'white',
        textAlign: 'center',
        justifyContent: 'center',
        position: 'absolute',
    },
    pinnumber1: {
        flex: 1,
        fontSize: scale * 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        justifyContent: 'center',
        position: 'absolute',
    },
    pinImage: {
        width: 40,
        height: 40
    },
    pinDelete: {
        width: 65,
        height: 65,
        tintColor:'white'
    },
    pinImageDotContainer: {
        width: Layout.window.width,
        paddingTop: 40,
        backgroundColor: 'white',
        height: 230,
        alignItems: 'center',
        justifyContent: 'center'
    },
    arrowpinnumber: {
        flex: 1,
        fontSize: scale * 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        justifyContent: 'center',
        position: 'absolute',
    },
    //Payslip
    payslipitemdetail: {
        fontSize: 12 * scale,
        color: Colors.thingrayTextColor,
        fontFamily: font_medium
    },
    payslipitemcurrentdetail: {
        fontSize: 12 * scale,
        color: 'white',
        fontFamily: font_medium
    },
    payslipitemdetailHide: {
        fontSize: 12 * scale,
        color: 'transparent',
        fontFamily: font_medium
    },
    payslipitemmoney: {
        fontSize: 15 * scale,
        color: Colors.thingrayTextColor,
        fontFamily: font_medium
    },
    payslipitemdate: {
        fontSize: 12 * scale,
        color: Colors.thingrayTextColor,
        fontFamily: font_medium

    }, payslipiteMonth: {
        fontSize: 15 * scale,
        color: Colors.thingrayTextColor,
        fontFamily: font_medium
    },
    payslipiteMonthHide: {
        fontSize: 15 * scale,
        color: 'transparent',
        fontFamily: font_medium
    },
    payslipitemcurrentdMonth:{
        fontSize: 15 * scale,
        color: 'white',
        fontFamily: font_medium

    },
    payslipitemcurrentdNet:{
        fontSize: 16 * scale,
        color: 'white',
        fontFamily: font_medium

    },

    payslipitemdetailred: {
        fontSize: 12 * scale,
        color: 'white',
        fontFamily: font_medium

    },
    payslipitemmoneyred: {
        fontSize: 12 * scale,
        color: 'white',
        fontFamily: font_medium
    },
    payslipincome: {
        fontSize: 15 * scale,
        color: Colors.thingrayTextColor,
        fontFamily: font_medium
    },
    payslipitemdatered: {
        fontSize: 12 * scale,
        color: 'white',
        fontFamily: font_light
    },
    payslipitem: {
        flex: 1,
        backgroundColor: Colors.calendarLocationBoxColor,
        margin: 2,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.lightGrayTextColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    payslipitemlast: {
        flex: 1,
        backgroundColor: Colors.redTextColor,
        margin: 2,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.lightGrayTextColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    payslipitemdisable: {
        flex: 1,
        backgroundColor: Colors.backgroundcolor,
        margin: 2,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.lightGrayTextColor,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    payslipAnnoualLeft: {
        flex: 1,
       // textAlign: 'left',
        color: Colors.grayTextColor,
        fontSize: scale * 11,
        marginLeft: scale * 10,
        fontFamily: font_medium
    },
    payslipAnnoualRight: {
        flex: 1,
        textAlign: 'right',
        color: Colors.lightredTextColor,
        fontSize: 15 * scale,
        marginLeft: 10* scale
    },
    alertDialogContainer: {
        flex: 1,
        position: 'absolute',
        left: 0,
        top: 0,
        width: Layout.window.width,
        height: Layout.window.height,
        alignItems: 'center',
        justifyContent: 'center',
      //backgroundColor:Colors.redColor
    },
    registerContainer: {
        // flex: 1,
        position: 'absolute',
        left: 0,
        top: 0,
        width:'100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      backgroundColor:Colors.redColor
    },
     alertDialogBox: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10
    }, alertDialogOverlay: {
        flex: 1,
        position: 'absolute',
        left: 0,
        top: 0,
        width: Layout.window.width,
        height: Layout.window.height
    }, alertDialogBackgroudAlpha: {
        left: 0,
        top: 0,
        width: Layout.window.width,
        height: Layout.window.height,
        backgroundColor: 'black',
        opacity: 0.8
    },
    alertDialogBoxContainer: {
        width: '80%',
        backgroundColor: 'white',
       // borderRadius: 5,
    },
    alertDialogBoxText: {
        marginLeft: 20,
        // marginTop: 10,
        textAlign: 'left',
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    alertDialogBoxSelectText: {
        textAlign: 'center', fontSize: 18, width: '100%', height: 50, alignItems: 'center'
    },
    pickerViewAndroidContrianer: {
        justifyContent: 'center', height: 40, alignItems: 'center',
    },
    pickerViewAndroidText: {
        textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center'
    },
    announcementitemRead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 1,
        borderColor: '#2a4944',
        backgroundColor: '#FAFAFA',
        height: scale * 60
    },
    announcementitemUnread: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 1,
        borderColor: '#2a4944',
        //borderWidth: 1,
        backgroundColor: '#F2DEDE',
        height: scale * 60
    },
    handbookItem: {
        height: 200,
        width: Layout.window.width / 2,
        flexDirection: 'column',
        backgroundColor: Colors.backgroundcolor,
        marginTop: 5,
        borderColor: Colors.lightGrayTextColor,
    },
    nonPayRollLeftContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        paddingRight: 100,
        marginBottom: 10,
      
    },
    nonPayRollRightContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        position: 'absolute',
       // marginRight:20
    },
    nonPayRollTitleText: {
        color: Colors.redTextColor,
        fontSize: 15,
        marginTop: 10,
        marginBottom: 10,
         marginLeft: 20,
    }, nonPayRolldateYearText: {
        color: Colors.redTextColor,
        fontSize: 20,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 20, 
        marginRight: 20
    }, nonPayRolldateDetailText: {
        color: Colors.grayTextColor,
        fontSize: 14,
    }, nonPayRolldateMoneyText: {
        color: Colors.redTextColor,
        fontSize: 14,
    },
    nonpayrolltabBG_ena: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: Colors.calendarLocationBoxColor
    },
    nonpayrolltabBG_dis: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: Colors.backgroundcolor
    },
    otsummaryheadertext: {
        color: Colors.grayTextColor,
        fontSize: 17 * scale,
        fontFamily: font_medium,
        textAlign: 'left'
    },
    otsummarydetailboldtext: {
        color: Colors.grayTextColor,
        fontSize: 14 * scale,
        fontFamily: font_medium

    },

    otsummaryheaderredtext: {
        color: Colors.redTextColor,
        fontSize: 17 * scale,
        fontFamily: font_medium,
        textAlign: 'left'
    },
    otsummarybody: {
        textAlign: 'center',
        color: Colors.grayTextColor,
        fontSize: 10 * scale,
        fontFamily: font_medium
    },
    otsummarybodyredtext: {
        textAlign: 'center',
        color: Colors.redTextColor,
        fontSize: 10 * scale,
        fontFamily: font_medium
    },
    otsummarybodytitle: {

        textAlign: 'center',
        color: 'white',
        fontSize: 8 * scale,
        fontFamily: font_medium
    },
    otsummarydatetext: {

        fontSize: 25 * scale,
        textAlign: 'center',
        justifyContent:'center',
        color: Colors.redTextColor,
        fontFamily: font_medium

    },


    otsummarydetailredtext: {
        color: Colors.redTextColor,
        fontSize: 15 * scale,
        fontFamily: font_medium

    },

    otsummarynoresulttext: {
        fontSize: 16 * scale,
        color: Colors.grayTextColor,
        marginTop: 20,
        fontFamily: font_medium

    },//NONPAYROLL
    tabbarSelectYearContainer: {
        height: 50,
        backgroundColor: Colors.backgroundcolor,
        paddingTop: 10,
        paddingLeft: 5,
        paddingRight: 5
    },
    nonPayRollMonthContainer: {
        flex: 1, flexDirection: 'column',
        backgroundColor: Colors.calendarLocationBoxColor,
        // backgroundColor:"red",
        marginLeft: 5,
        marginRight: 5,
        marginTop: -5,
        paddingBottom: 5,
        borderRadius: 5
    },
    selectYearContainer: {
        flex: 1, flexDirection: 'row'
    },
    nonPayRollItemContainer: {
        flex: 1, flexDirection: 'column', marginLeft: 3, marginRight: 3,
        backgroundColor: Colors.calendarLocationBoxColor
    },
    nonPayRollDetailContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      //  fontSize: 15 * scale,
       
    },
    nonPayRollitem: {//TODO Bell
        flex: 1,
        // margin: 2,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.lightGrayTextColor,
        marginLeft: 1,
        marginRight: 3,
        marginTop: 2,
        marginBottom: 2,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nonPayRollitemRed: {//TODO Bell
        flex: 1,
        // margin: 2,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.lightGrayTextColor,
        marginLeft: 1,
        marginRight: 3,
        marginTop: 2,
        marginBottom: 2,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.calendarRedDotColor
    },
    nonPayRollitemBg: {
        flex: 1,
    },

    nonPayrollBadgeContrainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 20,
        height: 20,
        backgroundColor: Colors.redTextColor,
        borderRadius: 20 / 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    nonPayrollBadgeText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 10* scale
    },
    payslipTextCente_income_ena: {
        color: 'white',
        fontSize: 15* scale,
        textAlign: 'left',
        fontFamily: font_medium

    },
    payslipTextCente_income_dis: {
        color: Colors.midnightblue,
        fontSize: 15* scale,
        textAlign: 'left',
        fontFamily: font_medium

    },
    payslipTextCente_deduct_ena: {
        color: 'white',
        fontSize: 15 * scale,
        textAlign: 'left',
        fontFamily: font_medium

    },
    payslipTextCente_deduct_dis: {
        color: 'red',
        fontSize: 15 * scale,
        textAlign: 'left',
        fontFamily: font_medium

    },
    payslipTextLeft: {
        color: 'white',
        fontSize: 16 * scale,
        textAlign: 'left',
        fontFamily: font_medium

    }, payslipTextRight: {
        color: 'white',
        fontSize: 16 * scale,
        textAlign: 'right',
        fontFamily: font_medium
    },
    // regist
    registContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerContainerWidth: {
        width: '60%'
    },
    registetImageContainer: {
        marginRight: 10,
        width: 22,
        height: 22,
        alignItems: 'center'
    },
    registTextContainer: {
        flexDirection: 'row',
        height: 30,
        alignItems: 'center',
    },
    registLine: {
        height: 1,
        backgroundColor: Colors.lightGrayTextColor,
        marginBottom: 10
    },
    registText: {
        fontSize: 17 * scale,
        //color: Colors.lightGrayTextColor,
        flex: 1,
        height: 45,
        fontFamily:font_medium
    },
    registTitleText: {
        fontSize: 12,
        color: Colors.lightGrayTextColor,
        flex: 1,
    },
    registBackground: {
        alignSelf: 'center',
        position: 'absolute'
    },
    registButton: {
        marginTop: 10,
        height: 45,
        backgroundColor: Colors.redTextColor,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registTextButton: {
        fontSize: 16 * scale,
        color: 'white',
        fontFamily: font_medium
    },
    epubreader: {
        backgroundColor: 'white'
    },
    registPinImageSubContainer: {
        width: 30,
        height: 30,
        marginLeft: 5,
        marginRight: 5,
        tintColor: 'white'
    },
    createPinImageSubContainer: {
        width: 30,
        height: 30,
        marginLeft: 5,
        marginRight: 5,
        tintColor: Colors.grayColor
    },
    registPinImageContainer: {
        flexDirection: 'row',
        height: 40,
    },
    registPinNumRowContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
     
    },
    registPinNumContainer: {
       flex: 1,
        // height: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.redColor
    },
    registPinForgotContainer: {
        marginTop: 10,
        color: 'white',
        fontSize: 15 * scale,
        textAlign: 'right',
        fontFamily: font_medium

    },
    registPinEnterContainer: {
        //marginTop: 10,
        color: 'white',
        fontSize: 15 * scale,
        marginBottom:5,
        marginTop:5,
        textAlign: 'right',
        fontFamily: font_medium

    }, payslipTitleTextLeft: {
        fontSize: 14* scale,
        marginLeft: 10* scale,
        textAlign: 'left',
        color: Colors.grayTextColor,
        fontFamily: font_medium

    }, payslipDetailTextLeft: {
        fontSize: 14 * scale,
        marginLeft: 10 * scale,
       // textAlign: 'left',
        color: Colors.lightGrayTextColor,
        fontFamily: font_medium

    }, payslipDetailTextRight: {
        fontSize: 15* scale,
        marginRight: 10* scale,
        color: Colors.lightGrayTextColor,
        textAlign: 'right',
        fontFamily: font_medium

    }, payslipDetailTextCenter: {
        
        marginRight: 10* scale,
        color: Colors.lightGrayTextColor,
        textAlign: 'center',
        fontFamily: font_medium,
        fontSize: 13* scale,
        fontWeight: 'bold'
    },
    pinText: {
        fontSize: 13,
        color: Colors.grayText,
        fontWeight: 'bold',
        paddingTop: 10,
        paddingBottom: 10,
        fontFamily: font_medium,
    },
    pinContainer: {
        //width: Layout.window.width,
       // height: 260,
        alignItems: 'center',
        justifyContent: 'center'
    },
    pinCreateSuccessTitleText: {
        fontSize: 15,
        color: Colors.grayText
    },
    pinCreateSuccessButtonText: {
        fontSize: 15,
        color: "white"
    },
    pinCreateSuccessDescText: {
        fontSize: 13,
        color: Colors.grayText
    },
    pinImage: {
        alignSelf: 'center',

    },
    pinButtonContainer: {
        backgroundColor: Colors.redColor,
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: Layout.window.width,
        ...Platform.select({
            ios: {
                marginBottom: 0
            },
            android: {
                marginBottom: 20
            }
        })
    },
    registPinSuccessContainer: {
        flex: 1,
        backgroundColor: 'white',
    },

    settinglefttext: {
        textAlign: 'left',
        color: Colors.GrayTextColor,
        fontSize: 15,
        marginLeft: 10,
        fontFamily: font_medium
    },
    settingleftredtext: {
        textAlign: 'left',
        color: Colors.redTextColor,
        fontSize: 15,
        marginLeft: 10,
        fontFamily: font_medium
    },
    settingrighttext: {
        textAlign: 'right',
        color: Colors.GrayTextColor,
        fontSize: 15,
        marginRight: 10,
        fontFamily: font_medium
    },
    pinFailBoxContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white",
        borderRadius: 10,
        marginTop: 10,
        width: '50%',
        height: 20
    },
    pinFailBoxText: {
        color: Colors.redColor,
        fontSize: 12 * scale,
        fontFamily: font_medium,
        marginLeft: 10 * scale,
        marginRight: 10 * scale
    },
    emptyDialogContainer: {
        flex: 1,
        width: Layout.window.width,
        height: Layout.window.height,
        backgroundColor: Colors.redColor
    },
    clockinoutdaytext: {

        color: Colors.grayTextColor,
        fontSize: 35 * scale,
        fontFamily: font_medium,
    },
    clockinoutbodyhidetext: {
        color: 'transparent',
        fontSize: 12 * scale,
        fontFamily: font_medium,
    },
    clockinoutbodyredtext: {
        color: Colors.redTextColor,
        fontSize: 12 * scale,
        fontFamily: font_medium,
    },
    clockinoutbodytext: {
        color: Colors.grayTextColor,
        fontSize: 12 * scale,
        fontFamily: font_medium,
    },

    clockinoutdayredtext: {
        color: Colors.redTextColor,
        fontSize: 35 * scale,
        fontFamily: font_medium,
    },
    clockinoutdaybluetext: {
        color: Colors.blueTextColor,
        fontSize: 35 * scale,
        fontFamily: font_medium,
    },
    clockinoutweakdaytext: {
        color: Colors.grayTextColor,
        fontSize: 12 * scale,
        fontFamily: font_medium,
    },
    clockinoutweakdayredtext: {
        color: Colors.redTextColor,
        fontSize: 12 * scale,
        fontFamily: font_medium,
    },
    clockinoutweakdaybluetext: {
        color: Colors.blueTextColor,
        fontSize: 12 * scale,
        fontFamily: font_medium,
    },
    clockinoutweakdayalphatext: {
        color: Colors.grayTextColor,
        fontSize: 12 * scale,
        fontFamily: font_medium,
    },
    epubTocText: {
        fontSize: 14 * scale,
        color: Colors.redTextColor,
        width: '100%',
        fontFamily: font_medium,


    }, epubHighlightdateText: {
        fontSize: 10 * scale,
        color: Colors.lightgrayText,
        // width: '100%',
        fontFamily: font_medium,
        // backgroundColor:'blue',
        flex: 2

    },
    epubHighlighttitleText: {
        fontSize: 15 * scale,
        color: Colors.grayText,
        // width: '100%',
        fontFamily: font_medium,
        // backgroundColor:'red',
        flex: 3
    },
    epubbookname: {
        textAlign: 'center',
        fontSize: 12 * scale,
        color: Colors.thingrayTextColor,
        fontFamily: font_medium
    },
    empinfoTitleText: {
        color: Colors.grayTextColor,
        marginLeft: 20,
        fontFamily: font_medium
    },
    empinfoDetailText: {
        marginTop:5,
        marginBottom:5,
        color: Colors.grayTextColor,
        flexWrap: 'wrap',
        fontFamily: font_medium,
        fontSize: 12 * scale
    },
    empinfoDetailRedText: {
        marginTop:5,
        marginBottom:5,
        color: Colors.redTextColor,
        marginLeft: 20 * scale,
        fontFamily: font_medium
    },
    empinfoDetailonTopRedText: {
        marginTop:5,
        marginBottom:5,
        color: Colors.redTextColor,
        marginLeft: 20 * scale,
        fontFamily: font_medium,
        alignItems:'flex-start'
    },
    empinfocareerLeftText: {
        fontSize: 9 * scale,
        marginRight: 10 * scale,
        color: Colors.grayText,
        textAlign: 'left',
        fontFamily: font_medium

    },
    empinfocareerRightText: {
        fontSize: 9 * scale,
        marginRight: 10 * scale,
        color: Colors.grayText,
        textAlign: 'right',
        fontFamily: font_medium

    },
    empinfocareerRightRedText: {
        fontSize: 11 * scale,
        marginRight: 10 * scale,
        color: Colors.redTextColor,
        textAlign: 'right',
        fontFamily: font_medium

    },
    empInfoLeftText: {
        color: 'white',
        fontSize: 15 * scale,
        textAlign: 'left',
        fontFamily: font_medium

    },
    empInfopositionLeftText: {
        color: 'white',
        fontSize: 12 * scale,
        textAlign: 'left',
        fontFamily: font_medium
    },
    calendarDownloadContrainer: {
        width: "80%",
        height: 50,
        borderRadius: 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    calendarDownloadCancelText: {
        color: Colors.redTextColor,
        fontSize: 12 * scale,
    },
    titlepicker: {

        marginLeft: 20 * scale,
        marginTop: 10 * scale,
      //  textAlign: 'left',
        color: 'black',
        fontSize: 15 * scale,
      //  fontWeight: 'bold',
        fontFamily: font_medium
    },
    buttonpicker: {
        textAlign: 'center',
        color: Colors.redTextColor,
        fontSize: 17 * scale,
       // width: 80 * scale,
        height: 50 ,
        alignItems: 'center',
        fontFamily: font_medium
    },
    datapicker:{



    }

})