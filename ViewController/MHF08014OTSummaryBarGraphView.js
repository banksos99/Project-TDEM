import React, { Component } from 'react';


import {
    Text,
    ScrollView,
    View,
    TouchableOpacity,
    ListView,
    Image, Picker,
    Platform,
    ActivityIndicator,
    Alert,
    BackHandler,
    PanResponder
} from 'react-native';

import Colors from "./../SharedObject/Colors"
import { styles } from "./../SharedObject/MainStyles"
// import AnnounceTable from "../../components/TableviewCell"
import BarChartCompare from "./BarChartCompare";
import BarChartIndiv from "./BarChartIndividual";
import SharedPreference from "./../SharedObject/SharedPreference"
import StringText from '../SharedObject/StringText';
import RestAPI from "../constants/RestAPI"
import firebase from 'react-native-firebase';
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
let MONTH_LIST = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let monthstr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let selectmonth = 0;
let initannouncementTypetext;

export default class OTSummaryBarChart extends Component {

    panResponder = {};
    
    constructor(props) {
        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        let ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        this.state = {
            isscreenloading: false,
            dataSource: ds,
            page: 1,
            data: [],
            fetching: false,
            refreshing: false,
            url: '',
            showincome: true,
            Heightincome: 0,
            heightdeduct: 0,
            incomeBG: Colors.greenTextColor,
            incomeText: 'white',
            deductBG: Colors.pink,
            deductText: Colors.lightred,
            bordercolor: Colors.greenTextColor,

            months: [],
            tdataSource: {},
            initialyear: 0,
            initialmonth: 0,

            dateselected: 0,
            org_name: this.props.navigation.getParam("org_name", ""),
            org_code: this.props.navigation.getParam("org_code", "")

        }
        selectmonth = 0;
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_OT_SUMMARY_MANAGER)

    }

    checkDataFormat(DataResponse) {
        let today = new Date();
        date = today.getDate() + "/" + parseInt(today.getMonth() + 1) + "/" + today.getFullYear();
        this.state.initialyear = today.getFullYear();
        this.state.initialmonth = parseInt(today.getMonth() - 1);
        this.state.announcementTypetext = MONTH_LIST[this.state.initialmonth + 1] + ' ' + this.state.initialyear;

        if (DataResponse) {
            console.log('OTSummaryBarChart DataResponse =>', DataResponse)
            

            for (let i = this.state.initialmonth + 13; i > this.state.initialmonth; i--) {

                if (i === 11) {

                    this.state.initialyear--;
                }
                this.state.months.push(MONTH_LIST[i % 12] + ' ' + this.state.initialyear)
            }

            this.state.tdataSource = DataResponse;


        }
        initannouncementType = this.state.months[0]
    }

    componentDidMount() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => {
                SharedPreference.Sessiontimeout = 0
                return true
            },
            onStartShouldSetPanResponderCapture: () => {
   
                SharedPreference.Sessiontimeout = 0
  
                return false
            }
        })
        // this.settimerInAppNoti()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.onBack()
        return true;
    }

    settimerInAppNoti() {
        this.timer = setTimeout(() => {
            this.onLoadInAppNoti()
        }, SharedPreference.timeinterval);

    }

    onLoadInAppNoti = async () => {
        
        // if (!SharedPreference.lastdatetimeinterval) {
        //     let today = new Date()
        //     const _format = 'YYYY-MM-DD hh:mm:ss'
        //     const newdate = moment(today).format(_format).valueOf();
        //     SharedPreference.lastdatetimeinterval = newdate
        // }

        // this.APIInAppCallback(await RestAPI(SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval,1))
        this.APIInAppCallback(await LoginChangePinAPI('1111', '2222', SharedPreference.FUNCTIONID_PIN))
    }

    APIInAppCallback(data) {
        code = data[0]
        data = data[1]
        
        if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog(data)

        } else if (code.SUCCESS == data.code) {

            this.timer = setTimeout(() => {
                this.onLoadInAppNoti()
            }, SharedPreference.timeinterval);
        }else{

            this.timer = setTimeout(() => {
                this.onLoadInAppNoti()
            }, SharedPreference.timeinterval);
        }

    }

    onAutenticateErrorAlertDialog(error) {
        SharedPreference.userRegisted = false;
        timerstatus = false;
        this.setState({
            isscreenloading: false,
        })

        Alert.alert(
            StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
            StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
            [{
                text: 'OK', onPress: () => {

                    page = 0
                    SharedPreference.Handbook = []
                    SharedPreference.profileObject = null
                    this.setState({
                        isscreenloading: false
                    })
                    this.props.navigation.navigate('RegisterScreen')
                    SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                }
            }],
            { cancelable: false }
        )
    }

    onRegisterErrorAlertDialog(data) {
        if (!SharedPreference.sessionTimeoutBool) {
        SharedPreference.userRegisted=false;
        timerstatus = false;
        this.setState({
            isscreenloading: false,
        })

        Alert.alert(
            StringText.ALERT_SESSION_AUTHORIZED_TITILE,
            StringText.ALERT_SESSION_AUTHORIZED_DESC,
            [{
                text: 'OK', onPress: () => {

                    page = 0
                    SharedPreference.Handbook = []
                    SharedPreference.profileObject = null
                    this.setState({
                        isscreenloading: false
                    })
                    this.props.navigation.navigate('RegisterScreen')
                    SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                }
            }],
            { cancelable: false }
        )
    }
    }


    _onRefresh() {
        if (this.state.refreshing) {
            return;
        }

        ////console.log('refreshing');

        this.setState({ refreshing: true, page: 1 });
        let promise = this._fetchMore(1);
        if (!promise) {
            return;
        }

        promise.then(() => this.setState({ refreshing: false }));
    }

    _fetchMore(page) {
        if (this.state.fetching) {
            return;
        }

        this.setState({ fetching: true });

        let promise = this._generateRows(page);

        promise.then((rows) => {
            var data;
            if (this.state.refreshing) {
                data = rows;
            } else {
                data = [...this.state.data, ...rows];
            }

            this.setState({
                page: page + 1,
                dataSource: this.state.dataSource.cloneWithRows(data),
                data: data,
                fetching: false
            });
        });

        return promise;
    }

    onOrgStruct(item, index) {

        this.setState({

            isscreenloading: true,
            loadingtype: 3,

        }, function () {

            this.loadOTBarChartfromAPI()
        });

    }

    loadOTSummarySelffromAPI = async (omonth, oyear) => {
        let tmonth = omonth.toString();
        if (omonth < 10) {
            tmonth = '0' + omonth
        }
        let url = SharedPreference.OTSUMMARY_BAR_CHART + this.state.org_code + '&month=' + tmonth + '&year=' + oyear
        //console.log('OT summary url  :', url)
        this.APIDetailCallback(await RestAPI(url, SharedPreference.FUNCTIONID_OT_SUMMARY), 'OTBarChartView')
    }


    APIDetailCallback(data, path) {

        code = data[0]
        data = data[1]

        if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog(data)

        } else if (code.SUCCESS == data.code) {

            //console.log('data  :', data.data)
            this.setState({
                isscreenloading: false,
                tdataSource: data.data

            })

            // this.props.navigation.navigate(path, {
            //     DataResponse: data.data,
            //     org_name:this.state.org_name
            // });

        } else if (code.NODATA == data.code) {

            //console.log('data  :', data.data)
            this.setState({
                isscreenloading: false,
                // tdataSource: data.data

            })
        } else {

            this.onLoadErrorAlertDialog(data)
        }

    }


    onLoadErrorAlertDialog(error) {

        this.setState({
            isscreenloading: false,
        })

            Alert.alert(
                'MHF00001ACRI',
                'Cannot connect to server. Please contact system administrator.',
                [{
                    text: 'OK', onPress: () => {
                        //console.log('OK Pressed')
                    }
                }],
                { cancelable: false }
            )
       
        //console.log("error : ", error)
    }

    _generateRows(page) {
        ////console.log(`loading rows for page ${page}`);

        var rows = [];
        for (var i = 0; i < 100; i++) {
            rows.push('Hello ' + (i + ((page - 1) * 100)));
        }

        let promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(rows);
                ////console.log(`resolved for page ${page}`);
            }, 3);
        });

        return promise;
    }

    onBack() {

        // this.props.navigation.navigate('OrganizationOTStruct');
        this.props.navigation.goBack();
    }
    select_month() {

        if (SharedPreference.isConnected) {

            tempannouncementType = this.state.announcementType;

            this.setState({

                loadingtype: 0,
                isscreenloading: true,

            }, function () {

                this.setState(this.renderloadingscreen())
            });

        } else {

Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } },
                ], { cancelable: false }
            )
        } 
    }

    select_month_ios = () => {

        this.setState({

            // announcementType: month,
            loadingtype: 1,
            isscreenloading: true,
            // isscreenloading: false,
            announcementTypetext:initannouncementTypetext,

            

        }, function () {

            let tdate = initannouncementType.split(' ')
            let mdate = 0;


            for (let i = 0; i < 12; i++) {
                if (MONTH_LIST[i] === tdate[0]) {

                    mdate = i;
                }
            }
            this.setState(this.renderloadingscreen())

            this.loadOTSummarySelffromAPI(mdate + 1, tdate[1])
        });

    }

    selected_cancle_month = () => {

        this.setState({

            isscreenloading: false,
            announcementType:tempannouncementType

        }, function () {

        });

    }

    selected_month(monthselected,index) {

        ////console.log('monthselected : ',monthselected)
        initannouncementType = monthselected

        selectmonth = index;

        this.setState({
            announcementTypetext: monthselected,
            loadingtype: 1,
            isscreenloading: true,

        }, function () {

            let tdate = initannouncementType.split(' ')
            let mdate = 0;

            for (let i = 0; i < 12; i++) {
                if (MONTH_LIST[i] === tdate[0]) {
                    //console.log('month : ', i)
                    mdate = i;
                }
            }

            this.setState(this.renderloadingscreen())

            this.loadOTSummarySelffromAPI(mdate + 1, tdate[1])

        });

    }

    cancel_select_change_month_andr(){
        
         this.setState({

             loadingtype: 1,
             isscreenloading: false,
 
         })
 
     }

    renderpickerview() {

        if (this.state.loadingtype == 0) {

            if (Platform.OS === 'android') {
                ////console.log('android selectmonth')
                return (
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                        <View style={{ width: '80%', backgroundColor: 'white' }}>
                            <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                                <Text style={styles.alertDialogBoxText}>Select Month and Year</Text>
                            </View>
                            <ScrollView style={{ height: '40%' }}>
                                {
                                    this.state.months.map((item, index) => (
                                        <TouchableOpacity style={styles.button}
                                            onPress={() => { this.selected_month(item,index) }}
                                            key={index + 100}>
                                            <View style={{ justifyContent: 'center', height: 40, alignItems: 'center', }} key={index + 200}>
                                            <Text style={index === selectmonth ?
                                                    { color: 'red', textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' } :
                                                    { textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}> {item}</Text>
                                                {/* <Text style={{ textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}> {item}</Text> */}
                                            </View>
                                        </TouchableOpacity>

                                    ))}
                            </ScrollView>
                            <View style={{ flexDirection: 'row', height: 40, }}>
                                <View style={{ flex: 2 }} />
                                <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                    onPress={() => { this.cancel_select_change_month_andr() }}
                                >
                                    <Text style={{ fontSize: 16, color: Colors.redTextColor, textAlign: 'center' }}> Cancel</Text>
                                </TouchableOpacity>
                            </View>
                            
                        </View>
                    </View>
                )

            }
            return (
                <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                    <View style={{ width: '80%', backgroundColor: 'white' }}>
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                            <Text style={styles.titlepicker}>Select Month and Year</Text>
                        </View>
                        <Picker
                            selectedValue={this.state.announcementType}
                            onValueChange={(itemValue, itemIndex) => this.setState({
                                announcementType: itemValue,
                               // announcementTypetext: this.state.months[itemIndex],
                            }, function () {

                                initannouncementType = itemValue;
                                
                                initannouncementTypetext = this.state.months[itemIndex];

                                })}>{
                                this.state.months.map((item, index) => (
                                    <Picker.Item label={item} value={item} key={index} />

                                ))}

                        </Picker>
                        <View style={{ flexDirection: 'row', height: 50 }}>
                            <TouchableOpacity style={{ flex: 2, justifyContent: 'center' }}
                                onPress={(this.selected_cancle_month)}

                            >
                                <Text style={styles.buttonpickerdownloadleft}>Cancel</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity style={{ flex: 2, justifyContent: 'center' }}
                                onPress={(this.select_month_ios)}
                            >
                                <Text style={styles.buttonpickerdownloadright}>OK</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            )

        }
        return (
            <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                <ActivityIndicator />
            </View>
        )

    }

    renderloadingscreen() {

        if (this.state.isscreenloading) {

            return (
                <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
                    <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>

                    </View>
                    {this.renderpickerview()}
                </View>
            )
        }

    }

    renderdetail() {

        let year = date.substring(2, 4);
        let month = parseInt(date.substring(4, 6));

        let premonth = 0;
        let curmonth = 0;
        let manpower1 = 0;
        let manpower2 = 0;
        console.log('this.state.tdataSource =>',this.state.tdataSource)
        // if (this.state.tdataSource.length) {
            premonth = monthstr[parseInt(this.state.tdataSource.previous_month.month - 1)] + ' - ' + this.state.tdataSource.previous_month.year.substring(2, 4);
            curmonth = monthstr[parseInt(this.state.tdataSource.request_month.month - 1)] + ' - ' + this.state.tdataSource.request_month.year.substring(2, 4);
            manpower1 = this.state.tdataSource.previous_month.manPower;
            manpower2 = this.state.tdataSource.request_month.manPower
        // }

        

        return (
            <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }} />

                    <View style={{ flex: 3, justifyContent: 'center' }}>
                        <Text style={{ color: '#555555', fontFamily: 'Prompt-Regular' }}>Month</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, backgroundColor: '#d77c7c', margin: 10 }} />

                    </View>
                    <View style={{ flex: 2, justifyContent: 'center' }}>
                        <Text style={{ color: '#555555', fontFamily: 'Prompt-Regular' }}>{premonth}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, backgroundColor: '#f20909', margin: 10 }} />
                    </View>
                    <View style={{ flex: 2, justifyContent: 'center' }}>
                        <Text style={{ color: '#555555', fontFamily: 'Prompt-Regular' }}>{curmonth}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }} />

                    <View style={{ flex: 3, justifyContent: 'center' }}>
                        <Text style={{ color: '#555555', fontFamily: 'Prompt-Regular' }}>Manpower</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ textAlign: 'center', color: '#d77c7c', fontFamily: 'Prompt-Regular' }}>{manpower1}</Text>
                    </View>
                    <View style={{ flex: 2 }}>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ textAlign: 'center', color: '#f20909', fontFamily: 'Prompt-Regular' }}>{manpower2}</Text>
                    </View>
                    <View style={{ flex: 2 }}>
                    </View>
                    <View style={{ flex: 1 }}>
                    </View>
                </View>
            </View>
        );

    }


    render() {

        return (
            // this.state.dataSource.map((item, index) => (
            <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}
                collapsable={true}
                {...this.panResponder.panHandlers}
            >
                <View style={[styles.navContainer, { flexDirection: 'column' }]}>
                    <View style={styles.statusbarcontainer} />
                    <View style={{ height: 50, flexDirection: 'row', }}>
                        <View style={{ flex: 1, justifyContent: 'center', }}>
                            <TouchableOpacity onPress={(this.onBack.bind(this))}>
                                <Image
                                    style={{ width: 50, height: 50 }}
                                    source={require('./../resource/images/Back.png')}
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.navTitleTextTop}>Overtime Average</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: 'column', }}>

                    {/* <TouchableOpacity style={{ flex: 2, backgroundColor: Colors.calendarLocationBoxColor, margin: 5, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}
                        onPress={(this.select_month.bind(this))}
                    >

                        <Text style={styles.otsummarydatetext}>{this.state.announcementTypetext}</Text>

                    </TouchableOpacity> */}

                    <View style={{  margin: 5, }} >
                        <View style={{ height: '100%', width: '100%', position: 'absolute' }}>
                            <View style={{ flex: 2, flexDirection: 'row', backgroundColor: Colors.backgroundcolor, borderRadius: 5, }}>
                                <View style={{ flex: 4 }} >
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                                    <Image
                                        style={{ width: 20, height: 30, tintColor: Colors.redTextColor }}
                                        source={require('./../resource/images/dropdown.png')}
                                    // resizeMode='contain'
                                    />
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }}
                            onPress={(this.select_month.bind(this))}
                        >

                            <Text style={styles.otsummarydatetext}>{this.state.announcementTypetext}</Text>

                        </TouchableOpacity>

                    </View>

                    <View style={{ flex: 3, backgroundColor: Colors.calendarLocationBoxColor }}>
                        {this.renderdetail()}
                    </View>
                    <View style={{ flex: 0.5 }} />
                    <View style={{ flex: 8, backgroundColor: Colors.calendarLocationBoxColor }}>

                        <BarChartCompare
                            datalist={this.state.tdataSource}
                        />

                    </View>
                    <View style={{ flex: 0.5 }} />
                    <View style={{ flex: 11, backgroundColor: Colors.calendarLocationBoxColor }}>

                        <BarChartIndiv
                            datalist={this.state.tdataSource}
                            org_name={this.state.org_name}
                        />

                    </View>

                </View>
                {this.renderloadingscreen()}
            </View >
            // ))
        );
    }
}