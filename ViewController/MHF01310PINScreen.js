import React, { Component } from "react";
import { View, Image, Text, TouchableOpacity, Alert, ActivityIndicator,Platform ,PanResponder,Linking} from "react-native";
import { styles } from "./../SharedObject/MainStyles";
import Colors from "./../SharedObject/Colors"
import StringText from './../SharedObject/StringText'
import SavePIN from "../constants/SavePIN"
import SharedPreference from "../SharedObject/SharedPreference";
import RestAPI from "../constants/RestAPI"

import SaveProfile from "../constants/SaveProfile"
import LoginWithPinAPI from "../constants/LoginWithPinAPI"
import LoginResetPinAPI from "../constants/LoginResetPinAPI"
// import SaveAutoSyncCalendar from "../constants/SaveAutoSyncCalendar";
import firebase from 'react-native-firebase';
import Layout from "../SharedObject/Layout";

let scale = Layout.window.width / 320;

export default class PinActivity extends Component {

    savePIN = new SavePIN()
    saveProfile = new SaveProfile()
    // saveAutoSyncCalendar = new SaveAutoSyncCalendar()

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

        this.state = {
            pintitle: 'Enter your PIN',
            pin: '',
            failPin: 0,
            savePin: '',
            isLoading: false
        }
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_PIN)
        
    }

    onLoadLoginWithPin = async (PIN) => {

        if (SharedPreference.isConnected) {

            let data = await LoginWithPinAPI(PIN, SharedPreference.FUNCTIONID_PIN)

            code = data[0]
            data = data[1]

            // data.data.code = 'MSC29122AERR'

            console.log('onLoadLoginWithPin =>', data)

            if (data.data.code === 'MSC29134AERR') {//423
                Alert.alert(
                    StringText.ALERT_USER_LOCK_TITLE,
                    StringText.ALERT_USER_LOCK_DETAIL,
                    [
                        {
                            text: 'OK', onPress: () => {
                                this.setState({
                                    pin: '',
                                    isLoading: false
                                }, function () {
                                    this.saveProfile.setProfile(null)
                                    this.props.navigation.navigate('RegisterScreen')
                                    SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                                })

                            }
                        }
                    ],
                    { cancelable: false }
                )
            } else if (code.SUCCESS == data.code) {
                this.setState({
                    pintitle: 'Enter your PIN',
                    pin: '',
                    failPin: 0,
                    savePin: '',
                    // isLoading: false
                })
                console.log('setProfile =>', data.data)
                this.saveProfile.setProfile(data.data)
                SharedPreference.userRegisted = true;
                SharedPreference.sessionTimeoutBool = false;
                SharedPreference.lastdatetimeinterval = data.data.last_request
                // SharedPreference.calendarAutoSync = await this.saveAutoSyncCalendar.getAutoSyncCalendar()
                await this.onLoadInitialMaster()

            } else if (data.data.code === 'MSC29136AERR') {
                Alert.alert(
                    StringText.ALERT_USER_NOT_AUTHORIZED_TITLE,
                    StringText.ALERT_USER_NOT_AUTHORIZED_DETAIL,
                    [{
                        text: 'OK', onPress: () => {
                            let origin = this.state.failPin + 1
                            this.setState({
                                failPin: origin,
                                pin: ''
                            }, function () {
                                this.saveProfile.setProfile(null)
                                this.props.navigation.navigate('RegisterScreen')
                                SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                            })
                        }
                    },
                    ],
                    { cancelable: false }
                )

            } else if (code.INVALID_AUTH_TOKEN == data.code) {
                Alert.alert(
                    StringText.INVALID_AUTH_TOKEN_TITLE,
                    StringText.INVALID_AUTH_TOKEN_DESC,
                    [{
                        text: 'OK', onPress: () => {
                            this.setState({
                                pin: '',
                                isLoading: false
                            })
                            // SharedPreference.profileObject = null
                            this.saveProfile.setProfile(null)
                            this.props.navigation.navigate('RegisterScreen')
                            SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                            SharedPreference.company='tmap-em'
                        }
                    }
                    ],
                    { cancelable: false })

            } else if (code.DOES_NOT_EXISTS == data.code) {

                Alert.alert(
                    StringText.ALERT_SESSION_AUTHORIZED_TITILE,
                    StringText.ALERT_SESSION_AUTHORIZED_DESC,
                    [{
                        text: 'OK', onPress: () => {
                            this.setState({
                                pin: '',
                                isLoading: false
                                
                            })
                             SharedPreference.profileObject = null
                             this.saveProfile.setProfile(null)
                            this.props.navigation.navigate('RegisterScreen')
                        }
                    }
                    ],
                    { cancelable: false })


            } else if ((code.INTERNAL_SERVER_ERROR == data.code) || (code.ERROR == data.code)) {
                Alert.alert(
                    StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
                    StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
                    [{
                        text: 'OK', onPress: () => {
                            // SharedPreference.profileObject = null
                            this.saveProfile.setProfile(null)
                            this.props.navigation.navigate('RegisterScreen')
                            SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                        }
                    }
                    ],
                    { cancelable: false })

            } else if (code.NETWORK_ERROR == data.code) {

                Alert.alert(
                    StringText.ALERT_CANNOT_CONNECT_SERVER_TITLE,
                    StringText.ALERT_CANNOT_CONNECT_SERVER_DETAIL,
                    [{
                        text: 'OK', onPress: () => {
                            // SharedPreference.profileObject = null
                            this.saveProfile.setProfile(null)
                            this.props.navigation.navigate('RegisterScreen')
                            SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                        }
                    }
                    ],
                    { cancelable: false })
            } else if (data.data.code === 'MSC29130AERR') {
                Alert.alert(
                    StringText.ALERT_USER_NOT_AUTHORIZED_TITLE,
                    StringText.ALERT_USER_NOT_AUTHORIZED_DETAIL,
                    [
                        {
                            text: 'OK', onPress: () => {
                                this.saveProfile.setProfile(null)
                                this.props.navigation.navigate('RegisterScreen')
                                SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                            }
                        }
                    ],
                    { cancelable: false }
                )
            } else if (data.data.code === 'MSC29133AERR') {
                if (this.state.failPin == 4) {
                    this.setState({
                        isLoading: false
                    })
                    Alert.alert(
                        StringText.ALERT_PIN_TITLE_NOT_CORRECT,
                        StringText.ALERT_PIN_DESC_TOO_MANY_NOT_CORRECT,
                        [{
                            text: 'OK', onPress: () => {
                                // SharedPreference.profileObject = null
                                this.setState({
                                    failPin: 0,
                                    pin:''
                                })
                          
                                this.saveProfile.setProfile(null)
                                this.props.navigation.navigate('RegisterScreen')
                                SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                            }
                        }],
                        { cancelable: false }
                    )
                } else {
                    let origin = this.state.failPin + 1
                    this.setState({
                        isLoading: false,
                        failPin: origin,
                        pin: ''
                    })
                    Alert.alert(
                        StringText.ALERT_PIN_TITLE_NOT_CORRECT,
                        StringText.ALERT_PIN_DESC_NOT_CORRECT,
                        [{
                            text: 'OK', onPress: () => {
                                // let origin = this.state.failPin + 1
                                // this.setState({
                                //     failPin: origin,
                                //     pin: ''
                                // })
                            }
                        },
                        ],
                        { cancelable: false }
                    )
                }
            }else if (data.data.code === 'MHF00301ACRI') {
            //  }else if (data.data.code === 'MSC29122AERR') {
                
                
            } else {

                this.setState({
                    isLoading: false
                })
                Alert.alert(
                    data.data.code,
                    data.data.detail,
                    [{
                        text: 'OK', onPress: () => {
                            let origin = this.state.failPin + 1
                            this.setState({
                                failPin: origin,
                                isLoading: false,
                                pin: ''
                            })
                        }
                    },
                    ],
                    { cancelable: false }
                )

            }


        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{
                    text: 'OK', onPress: () => {
                        this.setState({
                         
                            pin: '',
                            isLoading: false
                        })

                    }
                }], { cancelable: false }
            )


        }

    }

    onLoadAppInfo = async () => {
        
        let data = await RestAPI(SharedPreference.APPLICATION_INFO_API, "1")
        code = data[0]
        data = data[1]
console.log('data.detail',data.data.detail)
        if (code.SUCCESS == data.code) {
            let appversion = '1.0.0'
            if (Platform.OS === 'android') {
                if (data.data.android.force_update === 'Y') {
                    if (data.data.android.app_version != SharedPreference.deviceInfo.appVersion) {

                        Alert.alert(
                            'New Version Available',
                            'This is a newer version available for download! Please update the app by visiting the Play Store',
                            [
                                {
                                    text: 'Update', onPress: () => {
                                        Linking.openURL("https://play.google.com/store/apps/details?id=com.tdem.stmconnectdev&hl=en");
                                        //   Linking.openURL("https://play.google.com/store/apps/details?id=com.tdem.tdemconnectdev&hl=th&ah=HZ_1qJI8z-iAdQaRwublugkbqPE");
                                       
                                    }
                                }
                            ],
                            { cancelable: false }
                        )
                    }else{
                        this.props.navigation.navigate('HomeScreen')
                    }

                }else{
                    this.props.navigation.navigate('HomeScreen')

                }
            } else {

                if (data.data.ios.force_update === 'Y') {
                    if(data.data.ios.app_version != SharedPreference.deviceInfo.appVersion){
                        Alert.alert(
                            'New Version Available',
                            'This is a newer version available for download! Please click Update',
                            [
                                {
                                    text: 'Update', onPress: () => {
                                        // Linking.openURL("https://www.technobrave.asia/tdemios/");
                                        // Linking.openURL("https://www.technobrave.asia/tdemiosdev/");
                                         Linking.openURL("https://smart.ap.toyota-asia.com/tdemconnect/");

                                       
                                        
                                    }
                                }
                            ],
                            { cancelable: false }
                        )

                    }else{
                        this.props.navigation.navigate('HomeScreen')
                    }
                    // console.log('onLoadAppInfo', ver)
                }else{
                    this.props.navigation.navigate('HomeScreen')
                }
            }
        }else{

            Alert.alert(
                'Error',
                data.data.detail,
                [
                    {
                        text: 'OK', onPress: () => {
                            // Linking.openURL("https://itunes.apple.com/us/app/pixel-starships-space-mmorpg/id1082948576?mt=12");
                            // Linking.openURL("https://play.google.com/store/apps/details?id=com.tdem.tdemconnectdev&hl=th&ah=HZ_1qJI8z-iAdQaRwublugkbqPE");

                            
                        }
                    }
                ],
                { cancelable: false }
            )

        }

        
    }

    componentWillMount() {

        SharedPreference.currentNavigator = SharedPreference.SCREEN_PIN
        
    }

    componentWillUnmount() {
        this.setState({
            isLoading: false
         })
    }

    onLoadInitialMaster = async () => {
        // console.log('onLoadInitialMaster')
        let data = await RestAPI(SharedPreference.INITIAL_MASTER_API, SharedPreference.FUNCTIONID_GENERAL_INFORMATION_SHARING)
        code = data[0]
        data = data[1]

        // console.log("onLoadInitialMaster : ", data)
        console.log("profileObject : ", SharedPreference.profileObject.location)
        if (code.SUCCESS == data.code) {
            this.setState({
                isLoading: false
             })
            array = data.data

            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                if (element.master_key == 'NOTIFICATION_CATEGORY') {
                    SharedPreference.NOTIFICATION_CATEGORY = element.master_data
                } else if (element.master_key == 'READ_TYPE') {
                    SharedPreference.READ_TYPE = element.master_data
                } else if (element.master_key == 'COMPANY_LOCATION') {
                    SharedPreference.COMPANY_LOCATION = element.master_data
               
                } else {
                    SharedPreference.TB_M_LEAVETYPE = element.TB_M_LEAVETYPE
                }
            }
            console.log("SharedPreference.NOTIFICATION_CATEGORY : ", SharedPreference.NOTIFICATION_CATEGORY)

            await this.onLoadAppInfo()

            // this.props.navigation.navigate('HomeScreen')

        } else {
            Alert.alert(
                StringText.SERVER_ERROR_TITLE,
                StringText.SERVER_ERROR_DESC,
                [
                    {
                        text: 'OK', onPress: () => {
                            //console.log('OK Pressed') },
                        }
                    }
                ],
                { cancelable: false }
            )
        }
    }

    getPINFromDevice = async () => {
        pin = await this.savePIN.getPin()
        this.state.savePin = pin
    }


    setPIN = async (num) => {
        if (this.state.savePin == '') {
            await this.getPINFromDevice()
        }

        let origin = this.state.pin

        if (num == "-") {
            origin = origin.slice(0, -1);
        } else {
            origin = origin + num
        }
        this.setState({
            pin: origin,
        })
        this.state.pin = origin

        if (this.state.pin.length == 6) {
            this.setState({
                isLoading: true
            })
            // SharedPreference.profileObject = await this.saveProfile.getProfile()
            await this.onLoadLoginWithPin(this.state.pin)
        }
    }

    renderImagePin() {
        let but1 = require('../resource/circle.png')
        let but2 = require('../resource/circle.png')
        let but3 = require('../resource/circle.png')
        let but4 = require('../resource/circle.png')
        let but5 = require('../resource/circle.png')
        let but6 = require('../resource/circle.png')

        if (this.state.pin.length >= 1) { but1 = require('../resource/circleEnable.png') }
        if (this.state.pin.length >= 2) { but2 = require('../resource/circleEnable.png') }
        if (this.state.pin.length >= 3) { but3 = require('../resource/circleEnable.png') }
        if (this.state.pin.length >= 4) { but4 = require('../resource/circleEnable.png') }
        if (this.state.pin.length >= 5) { but5 = require('../resource/circleEnable.png') }
        if (this.state.pin.length >= 6) { but6 = require('../resource/circleEnable.png') }

        return (<View style={styles.registPinImageContainer}>
            <Image style={styles.registPinImageSubContainer} source={but1} />
            <Image style={styles.registPinImageSubContainer} source={but2} />
            <Image style={styles.registPinImageSubContainer} source={but3} />
            <Image style={styles.registPinImageSubContainer} source={but4} />
            <Image style={styles.registPinImageSubContainer} source={but5} />
            <Image style={styles.registPinImageSubContainer} source={but6} />
        </View>)
    }

    renderFailPin() {
        if (this.state.failPin > 0) {
            return (<View style={styles.pinFailBoxContainer}>
                <Text style={styles.pinFailBoxText}allowFontScaling={SharedPreference.allowfontscale}>
                    {this.state.failPin} failed PIN Attempts
                </Text>
            </View>)
        }
        return (
            <View style={styles.pinFailBoxContainer}>
      
            </View>
          )
    }

    onResetPIN = async () => {
        ////console.log("onResetPIN")
        Alert.alert(
            StringText.ALERT_RESET_PIN_TITLE,
            StringText.ALERT_RESET_PIN_DESC,
            [{
                text: 'Cancel', onPress: () => {
                }
            }, {
                text: 'OK', onPress: () => {
                    this.onReset()
                }
            }
            ],
            { cancelable: false }
        )
    }

    onReset = async () => {


        // SharedPreference.profileObject = await this.saveProfile.getProfile()
        // SharedPreference.TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, '1', SharedPreference.profileObject.client_token)
        this.onLoginResetPinAPI()
    }


    onLoginResetPinAPI = async () => {
        console.log('onLoginResetPinAPI')
        let data = await LoginResetPinAPI(SharedPreference.FUNCTIONID_PIN)
        code = data[0]
        data = data[1]

        console.log("onLoginResetPinAPI : ", data)

        if (code.SUCCESS == data.code) {
            SharedPreference.profileObject = null
            this.saveProfile.setProfile(null)
            SharedPreference.sessionTimeoutBool=false;
            this.props.navigation.navigate('RegisterScreen')
            SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
        } else if (code.INVALID_AUTH_TOKEN == data.code) {
            Alert.alert(
                StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
                StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
                [{
                    text: 'OK', onPress: () => {
                        SharedPreference.profileObject = null
                        this.saveProfile.setProfile(null)
                        this.props.navigation.navigate('RegisterScreen')
                        SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                    }
                }
                ],
                { cancelable: false }
            )
        } else if (code.INVALID_SOMETHING == data.code) {
            Alert.alert(
                StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
                StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
                [{
                    text: 'OK', onPress: () => {
                        SharedPreference.profileObject = null
                        this.saveProfile.setProfile(null)
                        this.props.navigation.navigate('RegisterScreen')
                        SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                    }
                }
                ],
                { cancelable: false }
            )
        } else if (code.NETWORK_ERROR == data.code) {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [
                    {
                        text: 'OK', onPress: () => {
                            console.log('OK Pressed')
                        }
                    }
                ],
                { cancelable: false }
            )
        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_DELETE_PIN_TITLE,
                StringText.ALERT_CANNOT_DELETE_PIN_DESC,
                [{
                    text: 'OK', onPress: () => {
                        SharedPreference.profileObject = null
                        this.saveProfile.setProfile(null)
                        this.props.navigation.navigate('RegisterScreen')
                        SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                    }
                }
                ],
                { cancelable: false }
            )
        }
    }

    renderProgressView() {
        
        if (this.state.isLoading) {
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
            <View style={{flex:1,backgroundColor: Colors.redColor }}
            collapsable={true}
            {...this.panResponder.panHandlers}
            >
                {/* <View style={styles.alertDialogContainer}>
                    <View style={styles.emptyDialogContainer}> */}

                {/* <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
                    <Image
                        style={{flex:1 }}

                        source={require('../resource/regist/regist_red.png')}
                    //resizeMode="cover" 
                    />
                </View> */}

                <View style={{ height: '50%', justifyContent: 'center', alignItems: 'center', }}>
          
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ height: 50, width: '100%' }}>
                        </View>
                        <Image
                            style={{ width: 65, height: 65 }}

                            source={require('../resource/regist/regist_lock_white.png')}
                        //resizeMode="cover" 
                        />
                        <Text style={styles.registPinEnterContainer}allowFontScaling={SharedPreference.allowfontscale}>{this.state.pintitle}</Text>
                        {this.renderImagePin()}
                        <TouchableOpacity onPress={() => { this.onResetPIN() }}>
                            <Text style={styles.registPinForgotContainer}allowFontScaling={SharedPreference.allowfontscale}>Forgot your PIN?</Text>
                        </TouchableOpacity>
                        {this.renderFailPin()}
                    </View>
                    {/* </View> */}
                </View>
                {/* <View style={{ width: '100%' }} /> */}
                <View style={{ height: '50%', width: '100%' }}>

                    <View style={styles.registPinNumRowContainer}>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(1) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}allowFontScaling={SharedPreference.allowfontscale}>1</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(2) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}allowFontScaling={SharedPreference.allowfontscale}>2</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(3) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}allowFontScaling={SharedPreference.allowfontscale}>3</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.registPinNumRowContainer}>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(4) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}allowFontScaling={SharedPreference.allowfontscale}>4</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(5) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}allowFontScaling={SharedPreference.allowfontscale}>5</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(6) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}allowFontScaling={SharedPreference.allowfontscale}>6</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.registPinNumRowContainer}>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(7) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}allowFontScaling={SharedPreference.allowfontscale}>7</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(8) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}allowFontScaling={SharedPreference.allowfontscale}>8</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(9) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}allowFontScaling={SharedPreference.allowfontscale}>9</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.registPinNumRowContainer}>
                       
                        <View style={styles.emptyContainer}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={[styles.pinnumber,{color:Colors.redColor}]}allowFontScaling={SharedPreference.allowfontscale}>0</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(0) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}allowFontScaling={SharedPreference.allowfontscale}>0</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.registPinNumContainer}
                            onPress={() => { this.setPIN('-') }}>
                            <Image style={styles.pinDelete}
                                source={require('../resource/images/pin_delete_red.png')}
                                resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 50, width: '100%' }}>
                    </View>
                </View>
                {/* </View>
                 </View> */}
                {this.renderProgressView()}
            </View>)
    }

}