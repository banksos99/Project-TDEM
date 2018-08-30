import React, { Component } from 'react';

import {
    Text,
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
    Button,
    TouchableOpacity,
    ListView,
    RefreshControl,
    Image, Picker, WebView,
    Platform,
    ActivityIndicator,
    Alert,
    BackHandler, NetInfo
} from 'react-native';

import Colors from "./../SharedObject/Colors"
import { styles } from "./../SharedObject/MainStyles"
import SharedPreference from "./../SharedObject/SharedPreference"
import StringText from '../SharedObject/StringText';
import RestAPI from "../constants/RestAPI"
import firebase from 'react-native-firebase';
//monthNames
let MONTH_LIST = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let selectmonth = 0;

export default class OTSummaryDetail extends Component {

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
            // isConnected: true,
            months: [],
            tdataSource: {},
            headerdataSource: {},
            initialyear: 0,
            initialmonth: 0,
            tempannouncementTypetext:0,
            
            dateselected: 0,
        }
        selectmonth = 0;
        tempannouncementType=0;
        tempinitannouncementType = 0;
        tempinitannouncementTypetext = 0;
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_CLOCK_IN_OUT_MANAGER)


    }

    componentDidMount() {
        selectmonth = 0;
        this.settimerInAppNoti()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        // NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        // NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }
    // handleConnectivityChange = isConnected => {
    //     this.setState({ isConnected });
    // };
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
        
        if (!SharedPreference.lastdatetimeinterval) {
            let today = new Date()
            const _format = 'YYYY-MM-DD hh:mm:ss'
            const newdate = moment(today).format(_format).valueOf();
            SharedPreference.lastdatetimeinterval = newdate
        }

        this.APIInAppCallback(await RestAPI(SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval,1))

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

        }

    }

    onAutenticateErrorAlertDialog(error) {

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

                }
            }],
            { cancelable: false }
        )
    }

    onRegisterErrorAlertDialog(data) {

        timerstatus = false;
        this.setState({
            isscreenloading: false,
        })

        Alert.alert(
            'MHF00600AERR',
            'MHF00600AERR: Employee ID. {0} is not authorized.'
            [{
                text: 'OK', onPress: () => {

                    page = 0
                    SharedPreference.Handbook = []
                    SharedPreference.profileObject = null
                    this.setState({
                        isscreenloading: false
                    })
                    this.props.navigation.navigate('RegisterScreen')

                }
            }],
            { cancelable: false }
        )
    }


    checkDataFormat(DataResponse) {
       
        if (DataResponse) {

            let titems = [];
            for (let i = 0; i < DataResponse.detail.items.length; i++) {

                // console.log('tosummary data : ', DataResponse.detail.items[i])
                let x15 = DataResponse.detail.items[i].x15.split('.');
                let x20 = DataResponse.detail.items[i].x20.split('.');
                let x30 = DataResponse.detail.items[i].x30.split('.');
                let total = DataResponse.detail.items[i].total_ot.split('.');
                titems.push({
                    ot_date: DataResponse.detail.items[i].ot_date,
                    time: DataResponse.detail.items[i].time,
                    x15:x15[0]+'.'+x15[1][0],
                    x20:x20[0]+'.'+x20[1][0],
                    x30:x30[0]+'.'+x30[1][0],
                    total_ot:total[0]+'.'+total[1][0],
                    meal_no: DataResponse.detail.items[i].meal_no,
                    shift_allw: DataResponse.detail.items[i].shift_allw,

                })

            }
            // console.log('tosummary data : ', titems)
            // this.setState({

            //     tdataSource: titems,
            //     headerdataSource: DataResponse.header,
           
            // })

            // console.log('tdataSource : ', DataResponse)
            this.state.tdataSource = titems;
            this.state.headerdataSource = DataResponse.header
            // console.log('tosummary data : ', this.state.tdataSource)
        }

        let today = new Date();
        date = today.getDate() + "/" + parseInt(today.getMonth() + 1) + "/" + today.getFullYear();
        this.state.initialyear = today.getFullYear();
        this.state.initialmonth = parseInt(today.getMonth() - 1);
        this.state.announcementTypetext = MONTH_LIST[this.state.initialmonth + 1] + ' ' + this.state.initialyear;
        for (let i = this.state.initialmonth + 13; i > this.state.initialmonth; i--) {

            if (i === 11) {

                this.state.initialyear--;
            }
            this.state.months.push(MONTH_LIST[i % 12] + ' ' + this.state.initialyear)
        }

        tempinitannouncementType = this.state.months[0];
        initannouncementType = tempinitannouncementType;
        //tempinitannouncementTypetext = tempinitannouncementType;
      //  this.state.announcementType = initannouncementType;
        this.state.tempannouncementTypetext= initannouncementType;
        console.log('initannouncementType : ',initannouncementType)
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

    loadOTSummarySelffromAPI = async (omonth, oyear) => {

        this.setState({
            loadingtype: 1,
            isscreenloading: true,
        })

        let tmonth = omonth.toString();


        if (omonth < 10) {
            tmonth = '0' + omonth
        }

        let today = new Date();


        let url = SharedPreference.OTSUMMARY_DETAIL + 'month=' + tmonth + '&year=' + oyear

        // this.APICallback(await RestAPI(url), 'OTSummarySelfView')
        let data = await RestAPI(url, SharedPreference.FUNCTIONID_OT_SUMMARY)
        code = data[0]
        data = data[1]
        //console.log('ot data response : ',data)
        if (code.SUCCESS == data.code) {
            let titems = [];
            for (let i = 0; i < data.data.detail.items.length; i++) {
                let x15 = data.data.detail.items[i].x15.split('.');
                let x20 = data.data.detail.items[i].x20.split('.');
                let x30 = data.data.detail.items[i].x30.split('.');
                let total = data.data.detail.items[i].total_ot.split('.');
                titems.push({
                    ot_date: data.data.detail.items[i].ot_date,
                    time: data.data.detail.items[i].time,
                    x15:x15[0]+'.'+x15[1][0],
                    x20:x20[0]+'.'+x20[1][0],
                    x30:x30[0]+'.'+x30[1][0],
                    total_ot:total[0]+'.'+total[1][0],
                    meal_no: data.data.detail.items[i].meal_no,
                    shift_allw: data.data.detail.items[i].shift_allw,

                })

            }
    
            this.setState({

                tdataSource: titems,
                headerdataSource: data.data.header,
           
            })

        } else if (code.NODATA == data.code) {

            Alert.alert(

                data.data[0].code,
                data.data[0].detail,
                [{ text: 'OK', onPress: () => { } }],
                { cancelable: false }
            )

            this.setState({

                tdataSource: [],
                headerdataSource: []
            })

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog(data)


        } else {

            Alert.alert(

                error.data[0].code,
                error.data[0].detail,
                [{
                    text: 'OK', onPress: () => {
    
                    }
                }],
                { cancelable: false }
            )

        }

        this.setState({
           
            isscreenloading: false,
        })
    }

    onAutenticateErrorAlertDialog(error) {

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

                }
            }],
            { cancelable: false }
        )
    }

    
    onLoadErrorAlertDialog(error) {
        // this.setState({
        //     isscreenloading: false,
        // })
        // //console.log("isConnected : ", this.state.isConnected)

        Alert.alert(

            error.data[0].code,
            error.data[0].detail,
            [{
                text: 'OK', onPress: () => {

                }
            }],
            { cancelable: false }
        )

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

    _renderRow() {
        return (
            <Text>fdfsfsfs</Text>
        );
    }

    onBack() {
        this.props.navigation.navigate('HomeScreen');
    }

    select_month() {
        console.log('announcementType : ',this.state.announcementType)
        tempannouncementType = this.state.announcementType
        
        this.setState({

            loadingtype: 0,
            isscreenloading: true,

        }, function () {

            this.setState(this.renderloadingscreen())
        });
    }

    cancel_select_change_month_andr(){
        
        // console.log('tempannouncementType =>', tempannouncementType)
 
         this.setState({
           // announcementType: tempannouncementType,
             loadingtype: 1,
             isscreenloading: false,
 
         })
 
     }

    cancel_select_change_month = () => {
        
        console.log('tempannouncementType =>', tempannouncementType)
        this.setState({
            announcementType: tempannouncementType,
            loadingtype: 1,
            isscreenloading: false,

        })

    }

    select_change_month = () => {

        // ////console.log('select_announce_all_type')

        this.setState({

            // announcementType: month,
            loadingtype: 1,
            isscreenloading: true,
            announcementTypetext:this.state.tempannouncementTypetext
            // isscreenloading: false,

        }, function () {
            initannouncementType = tempinitannouncementType;
            initannouncementTypetext = tempinitannouncementTypetext
            let tdate = initannouncementType.split(' ')
            let mdate = 0;
            //console.log('month : ', tdate[0])

            for (let i = 0; i < 12; i++) {
                if (MONTH_LIST[i] === tdate[0]) {
                    //console.log('month : ', i)
                    mdate = i;
                }
            }
            //console.log('year : ', tdate[1])

            this.setState(this.renderloadingscreen())

            this.loadOTSummarySelffromAPI(mdate + 1, tdate[1])
        });

    }

    selected_month(monthselected, index) {

        if (SharedPreference.isConnected) {

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

                this.loadOTSummarySelffromAPI(mdate + 1, tdate[1])

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

    renderpickerview() {

        if (this.state.loadingtype == 0) {

            if (Platform.OS === 'android') {

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
                                            onPress={() => { this.selected_month(item, index) }}
                                            key={index + 100}>
                                            <View style={{ justifyContent: 'center', height: 40, alignItems: 'center', }}>
                                                <Text style={index === selectmonth ?
                                                    { color: 'red', textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' } :
                                                    { textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}> {item}</Text>
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
                                tempannouncementTypetext: this.state.months[itemIndex],
                            }, function () {

                                tempinitannouncementType = itemValue;
                                tempinitannouncementTypetext = itemValue;

                            })}>{
                                this.state.months.map((item, index) => (
                                    <Picker.Item label={item} value={item} key={index} />

                                ))}
                        </Picker>
                        <View style={{ flexDirection: 'row', height: 50, alignItems: 'center', }}>
                            <TouchableOpacity style={{ flex: 2, justifyContent: 'flex-start' }}
                                onPress={(this.cancel_select_change_month)}>
                                >
                                <Text style={styles.buttonpicker}> Cancel</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 3, justifyContent: 'center' }} />
                            <TouchableOpacity style={{ flex: 2, justifyContent: 'flex-end' }}
                                onPress={(this.select_change_month)}>
                                <Text style={styles.buttonpicker}> OK</Text>
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
 

        if (this.state.tdataSource.length) {
            return (
                <View style={{ flex: 16, backgroundColor: Colors.calendarLocationBoxColor, }}>
                    <ScrollView>
                        {
                            this.state.tdataSource.map((item, index) => (

                                <View key={item.id} style={{ height: 50 }} key={index + 500}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', }}>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>
                                            {parseInt(item.ot_date.split('-')[2])}
                                        </Text>
                                        <Text style={[styles.otsummarybody, { flex: 2, }]}>{item.time}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>{item.x15}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>{item.x20}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>{item.x30}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>{item.total_ot}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>{item.meal_no}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1.5 }]}>{item.shift_allw}</Text>
                                    </View>
                                    <View style={{ height: 1, backgroundColor: Colors.lightGrayTextColor, }} />
                                </View>
                            ))
                        }

                    </ScrollView>
                </View>
            );
        }
        return (

            <View style={{ flex: 16, backgroundColor: 'white', alignItems: 'center' }} key={1000}>
                <Text style={styles.otsummarynoresulttext}> No Result</Text>
            </View>

        )

    }
    render() {
        // this.state.datasource.map((i, index) => (
        //     <Picker.Item key={index} label={i.label} value={i.value} />
        // ))

        let total_ot = 0;
        let ot_15 = 0;
        let ot_20 = 0;
        let ot_30 = 0;
        let ot_meals = 0;

        if (this.state.headerdataSource.total_ot_hr) {

            total_ot = this.state.headerdataSource.total_ot_hr;
        }
        if (this.state.headerdataSource.ot_hr) {

            ot_15 = this.state.headerdataSource.ot_hr.ot_x15;
        }
        if (this.state.headerdataSource.ot_hr) {
            ot_20 = this.state.headerdataSource.ot_hr.ot_x20;
        }
        if (this.state.headerdataSource.ot_hr) {
            ot_30 = this.state.headerdataSource.ot_hr.ot_x30;
        }
        if (this.state.headerdataSource.ot_meals) {
            ot_meals = this.state.headerdataSource.ot_meals;
        }

        return (
            // this.state.dataSource.map((item, index) => (
            <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }} >
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
                            <Text style={styles.navTitleTextTop}>Overtime Summary</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: 'column', }}>

                    <TouchableOpacity style={{ flex: 2, backgroundColor: Colors.calendarLocationBoxColor, margin: 5, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}
                        onPress={(this.select_month.bind(this))}
                    >

                        <Text style={styles.otsummarydatetext}>{this.state.announcementTypetext}</Text>

                    </TouchableOpacity>

                    <View style={{ flex: 2 }}>
                        <View style={{ flex: 1, backgroundColor: Colors.lightblue, marginLeft: 15, marginRight: 15, marginTop: 2, marginBottom: 2, borderRadius: 5, flexDirection: 'row', }}>

                            <View style={{ flex: 2, justifyContent: 'center', marginLeft: 18 }}>
                                <Text style={styles.otsummaryheadertext}>Total OT Hour</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={styles.otsummaryheaderredtext}>{total_ot}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', marginRight: 18 }}>
                                <Text style={styles.otsummaryheadertext}>Hour(s)</Text>
                            </View>

                        </View>
                    </View>

                    <View style={{ flex: 6 }}>
                        <View style={{ flex: 1, flexDirection: 'row', marginLeft: 15, marginRight: 15 }}>

                            <View style={{ flex: 3, backgroundColor: Colors.burlywood, marginRight: 3, marginTop: 5, marginBottom: 5, borderRadius: 5 }}>

                                {/* <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10, position: 'absolute',alignItems: 'center', }}>
                                    <Text style={{ color: Colors.grayTextColor, fontSize: 18, fontWeight: 'bold', textAlign: 'left' }}>OT Hour</Text>
                                </View> */}

                                <View style={{ flex: 3, }}>
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        <View style={{ flex: 1, justifyContent: 'center', marginLeft: 15, flexDirection: 'column' }}>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailboldtext}>OT Hour</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailtext}>X 1.5</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailredtext}>{ot_15}</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailtext}>Hour(s)</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center', marginLeft: 15, flexDirection: 'column' }}>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                {/* <Text style={{ color: Colors.grayTextColor, fontSize: 18, fontWeight: 'bold' }}>OT Hour</Text> */}
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailtext}>X 2.0</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailredtext}>{ot_20}</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailtext}>Hour(s)</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center', marginLeft: 15, flexDirection: 'column' }}>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                {/* <Text style={{ color: Colors.grayTextColor, fontSize: 18, fontWeight: 'bold' }}>OT Hour</Text> */}
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailtext}>X 3.0</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailredtext}>{ot_30}</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailtext}>Hour(s)</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flex: 1, backgroundColor: Colors.pink, marginLeft: 3, marginTop: 5, marginBottom: 5, borderRadius: 5, flexDirection: 'column' }}>
                                <View style={{ flex: 1, justifyContent: 'center', marginLeft: 5 }}>
                                    <Text style={styles.otsummarydetailboldtext}>OT Meals</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', marginLeft: 5 }}>
                                    <Text style={styles.otsummarydetailtext}>No.</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', marginLeft: 5 }}>
                                    <Text style={styles.otsummarydetailredtext}>{ot_meals}</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', marginLeft: 5 }}>
                                    <Text style={styles.otsummarydetailtext}>Meal(s)</Text>
                                </View>

                            </View>
                        </View>
                    </View>

                    <View style={{ flex: 16, marginLeft: 5, marginRight: 5, marginTop: 2, marginBottom: 2 }}>

                        <View style={{ flex: 1, backgroundColor: Colors.lightred, borderRadius: 5 }}>
                            <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>Date</Text>
                                <Text style={[styles.otsummarybodytitle, { flex: 2 }]}>Time</Text>
                                <View style={{ flex: 4, flexDirection: 'column', }}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}>
                                        <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>OT Hour</Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
                                        <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>X1.5</Text>
                                        <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>X2</Text>
                                        <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>X3</Text>
                                        <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>Total</Text>
                                    </View>
                                </View>
                                <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>OT Meal No.</Text>
                                <Text style={[styles.otsummarybodytitle, { flex: 1.5 }]}>Shift Allowance</Text>
                            </View>
                            {this.renderdetail()}

                        </View>

                    </View>

                </View>
                {this.renderloadingscreen()}
            </View >
            // ))
        );
    }
}