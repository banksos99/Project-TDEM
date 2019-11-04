import React, { Component } from 'react';
import RNFetchBlob from 'react-native-fetch-blob'
import {
    Text,
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
    Button,
    TouchableOpacity,
    Image, Picker, WebView,
    FlatList,
    Platform,
    BackHandler,
    Alert,
    PanResponder,
    Linking
} from 'react-native';

import Colors from "./../SharedObject/Colors"
import Layout from "./../SharedObject/Layout"
import { styles } from "./../SharedObject/MainStyles"
import Authorization from "./../SharedObject/Authorization";
import inappdata from "./../InAppData/HandbookListData"
import SharedPreference from "./../SharedObject/SharedPreference"
import StringText from '../SharedObject/StringText';
import RestAPI from "../constants/RestAPI"
import firebase from 'react-native-firebase';
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
import HandBookCover from "./BookCover";


let temphandbookData = [];
let FUNCTION_TOKEN;
let scale = Layout.window.width / 320;

export default class HandbookActivity extends Component {
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
            temparray: [],
        };
        temphandbookData = [];
        this.updateToken()
       //this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));
       

        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_HANDBOOK_LIST)

    }

    componentDidMount() {

        
        // this.settimerInAppNoti()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.setState({
            isscreenloading: false,
        })
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

    updateToken() {

        FUNCTION_TOKEN = Authorization.convert(SharedPreference.profileObject.client_id, 1, SharedPreference.profileObject.client_token)
    
    }




    onBack() {
        
        this.props.navigation.navigate('HomeScreen');
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;
    }

    onOpenMeClaim() {

        if (SharedPreference.isConnected) {

            // this.props.navigation.navigate('meclaimdetail', {
                
            // });

            Linking.openURL("https://www.me-claim.com");

        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { } },
                ], { cancelable: false }
            )

        }
        
    }

    setrowstate() {

        this.setState({ leftside: false });
    }

    createcomponent(i) {
     
        return (
            <View style={styles.claimItem} key={i}>
                <TouchableOpacity style={{ flex: 1 }}

                    //  onPress={() => { this.onDetail(i) }}
                    disabled={true}
                >
                    <View style={{ flex: 2, backgroundColor: "blue" }}>
                        <View style={{ flex: 1, margin: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                style={{ width: (Layout.window.width / 2) - 30, height: 100, tintColor: Colors.lightGrayTextColor }}
                                source={require('./../resource/images/insuranceA.png')}
                            // resizeMode='contain'
                            />
                            {/* </View>
                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center', }}> */}
                            <Text style={styles.epubbookname}
                                numberOfLines={2}
                                allowFontScaling={SharedPreference.allowfontscale}>Insurance</Text>
                        </View>
                    </View>

                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }}

                    onPress={() => { this.onOpenMeClaim() }}>
                    <View style={{ flex: 5, backgroundColor: "white", margin: 15 }}>
                        <View style={{ flex: 1, margin: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                style={{ width: (Layout.window.width / 2) - 30 }}
                                source={require('./../resource/images/meclaim.png')}
                                resizeMode='contain'
                            />
                        </View>
                    </View>
                    <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={styles.epubbookname}
                            numberOfLines={2}
                            allowFontScaling={SharedPreference.allowfontscale}>Me-Claim</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    renderMeClaimList() {

        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={{ flex: 1,marginTop: 6,marginLeft:6,marginRight:6, backgroundColor: 'white' }}>
                    {/* <View style={{ flex: 1 }}> </View> */}
                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>

                        {/* <TouchableOpacity style={[styles.boxShadow,shadow,{ flex: 1, backgroundColor: 'white', marginBottom: 8, marginRight: 8,  borderWidth: 0 }]}
                            disabled={true}>
                            <View style={{ flex: 1, margin: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                                <Image
                                    style={{ width: (Layout.window.width / 3) - 30, height: 100, tintColor: Colors.lightGrayTextColor }}
                                    source={require('./../resource/images/insuranceA.png')}
                                resizeMode='contain'
                                />
                              
                                <Text style={styles.insurancename} allowFontScaling={SharedPreference.allowfontscale}>Medical</Text>
                                <Text style={styles.insurancename} allowFontScaling={SharedPreference.allowfontscale}>(Insurance)</Text>
                            </View>
                        </TouchableOpacity> */}
                        <TouchableOpacity style={[styles.boxShadow, shadow, { flex: 1, backgroundColor: 'white', marginBottom: 6 * scale, marginRight: 3, borderWidth: 0 }]}
                            onPress={() => { this.onOpenMeClaim() }}
                        >
                            <View style={{ flex: 1, margin: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 15, flexDirection: 'column' }}>
                                <Image
                                    style={{ width: (Layout.window.width / 3) - 30, height: 100, }}
                                    source={require('./../resource/images/meclaim.png')}
                                    resizeMode='contain'
                                />
                                {/* <Text style={styles.insurancename} allowFontScaling={SharedPreference.allowfontscale}></Text> */}


                            </View>
                            <Text style={[styles.insurancename, { fontFamily: "Prompt-Regular" }]} allowFontScaling={SharedPreference.allowfontscale}>Medical</Text>
                            <Text style={[styles.insurancename, { fontFamily: "Prompt-Regular" }]} allowFontScaling={SharedPreference.allowfontscale}>(Non Insurance)</Text>

                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, backgroundColor: 'white', marginBottom: 10 , marginLeft: 4, borderWidth: 0 }}
                           
                           >
                           {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                               <Image
                                   style={{ width: (Layout.window.width / 3) - 30, height: 100, }}
                                   source={require('./../resource/images/meclaim.png')}
                               resizeMode='contain'
                               />
                               <Text style={styles.insurancename} allowFontScaling={SharedPreference.allowfontscale}></Text>
                               <Text style={styles.insurancename}allowFontScaling={SharedPreference.allowfontscale}>Medical</Text>
                               <Text style={styles.insurancename}allowFontScaling={SharedPreference.allowfontscale}>(Non Insurance)</Text>
                           </View> */}

                       </TouchableOpacity>
   
                       <TouchableOpacity style={{ flex: 1, backgroundColor: 'white', marginBottom: 10, marginLeft: 4, borderWidth: 0 }}
                           
                           >
                       </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                        {/* <View style={{ flex: 1, backgroundColor: 'white', marginBottom: 10, marginRight: 5,borderWidth:0}}>

                        </View>
                        <View style={{ flex: 1, backgroundColor: 'white', marginBottom: 10, marginLeft: 5,borderWidth:0}}>

                        </View> */}


                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                        {/* <View style={{ flex: 1, backgroundColor: 'white', marginBottom: 10, marginRight: 5 ,borderWidth:0}}>

                        </View>
                        <View style={{ flex: 1, backgroundColor: 'white', marginBottom: 10 , marginLeft: 5,borderWidth:0}}>

                        </View> */}
      

                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                        {/* <View style={{ flex: 1, backgroundColor: 'white', marginBottom: 10, marginRight: 5 ,borderWidth:0}}>

                        </View>
                        <View style={{ flex: 1, backgroundColor: 'white', marginBottom: 10 , marginLeft: 5,borderWidth:0}}>

                        </View> */}
      

                    </View>
                </View>

            </View>
        );
        
        // return (
        //     <View style={{ flex: 1,justifyContent:'center',alignItems:'center' }}>
        //         <Text style={styles.payslipDetailTextCenter}allowFontScaling={SharedPreference.allowfontscale}>No Result</Text>
        //     </View>
        // );

    }

    render() {
        return (
            <View style={{ flex: 1 }}
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
                            <Text style={[styles.navTitleTextTop, { fontFamily: "Prompt-Regular" }]}allowFontScaling={SharedPreference.allowfontscale}>Welfare</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
               {this.renderMeClaimList()}
            </View >
        );
    }
}
const shadow = {
    shadowColor: 'black',
    shadowOpacity: 0.1,
    elevation: 2,
    shadowOffset: { width: 0, height: 3 }
}