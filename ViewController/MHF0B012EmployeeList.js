import React, { Component } from 'react';

import {
    Text,
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
    Button,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    BackHandler,NetInfo,
    PanResponder
} from 'react-native';

import Colors from "./../SharedObject/Colors"
import { styles } from "./../SharedObject/MainStyles"

import orgdata from './../InAppData/OrgstructerData.json';
import SharedPreference from "./../SharedObject/SharedPreference"
import RestAPI from "../constants/RestAPI"
import firebase from 'react-native-firebase';
import StringText from '../SharedObject/StringText';
import SaveProfile from "../constants/SaveProfile"
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
let dataSource = [];
let option = 0;

export default class OrganizationStruct extends Component {
    panResponder = {};
    constructor(props) {
        super(props);
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => {
                SharedPreference.Sessiontimeout = 0
                return false
            },
            onStartShouldSetPanResponderCapture: () => {
   
                SharedPreference.Sessiontimeout = 0
  
                return false
            }
        })
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state = {
            //employee_name,
            //employee_position,
            isConnected: true,
        };
        
        this.checkOption(this.props.navigation.getParam("Option", ""))
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_EMPLOYEE_INFORMATION_SELF)
    }

    checkOption(opt) {
        if (opt) {
            option = opt;
        }
    }

    checkDataFormat(DataResponse) {
        
        if (DataResponse) {
            console.log('DataResponse : ', DataResponse.data[0].org_emp)
            dataSource = DataResponse.data[0];

            
        } else {

        //    console.log('orgdata : ', orgdata)

        }
    }

    componentWillMount() {
       BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
       NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    }

    componentDidMount() {
       
        // this.settimerInAppNoti()
       
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
        this.setState({
            isscreenloading: false,
        })
    }
    
    handleConnectivityChange = isConnected => {
        this.setState({ isConnected });
    };
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

            this.onRegisterErrorAlertDialog()

        } else if (code.SUCCESS == data.code) {

            this.timer = setTimeout(() => {
                this.onLoadInAppNoti()
            }, SharedPreference.timeinterval);

        } else {

            this.timer = setTimeout(() => {
                this.onLoadInAppNoti()
            }, SharedPreference.timeinterval);
        }

    }

    onAutenticateErrorAlertDialog() {
        SharedPreference.userRegisted=false;
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
                   // SharedPreference.profileObject = null
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

    onRegisterErrorAlertDialog() {

        if (!SharedPreference.sessionTimeoutBool) {
            
            SharedPreference.userRegisted = false;
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

    onBack() {
        this.props.navigation.navigate('OrgStructure');
    }

    showDetail(item, index) {

        //console.log('emp list item :', item)

        this.setState({

            isscreenloading: true,
            loadingtype: 3,
            org_code: item.employee_id,
            index_org_code: index,
            employee_name: item.employee_name,
            employee_position: item.employee_position

        }, function () {
            this.loadOrgStructureDetailAPI()
        });

    }

    loadOrgStructureDetailAPI = async () => {

        if (SharedPreference.isConnected) {

            if (option == 1) {
                let url = SharedPreference.EMP_INFO_MANAGER_API + this.state.org_code
                this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_EMPLOYEE_INFORMATION))

            } else if (option == 2) {
                let today = new Date();
                let url = SharedPreference.CLOCK_IN_OUT_MANAGER_API + this.state.org_code + '&month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
                if (parseInt(today.getMonth() + 1) > 9) {
                    url = SharedPreference.CLOCK_IN_OUT_MANAGER_API + this.state.org_code + '&month=' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
                }
                console.log('url :', url)
                this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_CLOCK_IN_OUT))

            }

        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } },
                ], { cancelable: false }

            )
        }

    }

    APICallback(data) {
        code = data[0]
        data = data[1]
        if (code.SUCCESS == data.code) {

            console.log('employee data : ', data)
            if (option == 2) {
                
                this.props.navigation.navigate('ClockInOutSelfView', {
                    DataResponse: data,
                    employee_name: this.state.employee_name,
                    employee_position: this.state.employee_position,
                    manager: 1,
                    previous: 2,
                });

            } else if (option == 1){
                this.props.navigation.navigate('EmployeeInfoDetail', {
                    DataResponse: data.data,
                    manager: 1,
                    previous: 2,
                });

            }

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else {

            this.onLoadErrorAlertDialog(data)
        }
        this.setState({
            isscreenloading: false,
        })
    }

    onLoadErrorAlertDialog(error) {
        this.setState({

            isscreenloading: false,
        })
        if (this.state.isConnected) {
            Alert.alert(
                error.data[0].code,
                error.data[0].detail,
                [{
                    text: 'OK', onPress: () => { //console.log('OK Pressed')
                }
                }],
                { cancelable: false }
            )
        } else {
            Alert.alert(
                'MHF00500AERR',
                'Cannot connect to the internet.',
                [{
                    text: 'OK', onPress: () => {
                        //console.log("onLoadErrorAlertDialog")
                    }
                }],
                { cancelable: false }
            )
        }
        //console.log("error : ", error)
    }
    renderloadingscreen() {

        if (this.state.isscreenloading) {

            return (
                <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
                    <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>

                    </View>
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                        <ActivityIndicator />
                    </View>
                </View>
            )
        }

    }

    render() {
        return (
            <View style={{ flex: 1 ,backgroundColor:Colors.backgroundcolor}}
            collapsable={true}
            {...this.panResponder.panHandlers}
             >

                <View style={[styles.navContainer, { flexDirection: 'column' }]}>
                    <View style={styles.statusbarcontainer} />
                    <View style={{ height: 50, flexDirection: 'row', }}>
                        <View style={{ flex: 1, justifyContent: 'center', }}>
                            <TouchableOpacity
                                onPress={(this.onBack.bind(this))}>
                                <Image
                                    style={{ width: 50, height: 50 }}
                                    source={require('./../resource/images/Back.png')}
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.navTitleTextTop}allowFontScaling={SharedPreference.allowfontscale}>Employee List</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, flexDirection: 'column', }}>
                        <View style={{ height: 50, justifyContent: 'center' }}>
                            <Text style={{ marginLeft: 50, color: Colors.redTextColor, fontFamily: 'Prompt-Regular', fontSize: 15 }}
                            allowFontScaling={SharedPreference.allowfontscale}>{dataSource.org_name}
                            </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: 'lightgray', justifyContent: 'flex-end' }} />
                        <View style={{ flex: 10 }}>
                            <ScrollView>
                                {
                                    dataSource.org_emp.map((item, index) => (
                                        <View style={{ height: 50 }} key={'m' + index}

                                        >
                                            <TouchableOpacity
                                                onPress={() => { this.showDetail(item, index) }}
                                            >
                                                <View style={{ height: 49, flexDirection: 'row' }}>
                                                    <View style={{ flex: 1, justifyContent: 'center' }} >
                                                        <Text style={{ marginLeft: 50, color: Colors.blueTextColor, fontFamily: 'Prompt-Regular', fontSize: 12 }}
                                                        allowFontScaling={SharedPreference.allowfontscale}>{item.employee_name}
                                                        </Text>
                                                        <Text style={{ marginLeft: 50, color: Colors.thingrayTextColor, fontFamily: 'Prompt-Regular', fontSize: 10 }}
                                                        allowFontScaling={SharedPreference.allowfontscale}>{item.employee_position}
                                                        </Text>
                                                    </View>




                                                    {/* <Image

                                                        style={item.next_level === 'false' ? { height: 0, width: 0 } : { height: 40, width: 40 }}
                                                        source={item.expand === 0 ?
                                                            require('./../resource/images/Expand.png') :
                                                            require('./../resource/images/Collapse.png')}
                                                    // resizeMode='cover'
                                                    /> */}


                                                </View>
                                                <View style={{ height: 1, backgroundColor: 'lightgray', justifyContent: 'flex-end' }} />
                                            </TouchableOpacity>
                                        </View>

                                    ))
                                }
                            </ScrollView>
                        </View>
                    </View>
                </View>
                {this.renderloadingscreen()}
            </View >
        );
    }
}