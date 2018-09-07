import React, { Component } from 'react';

import {
    Text,
    View,
    TouchableOpacity,
    Image, WebView,
    BackHandler,
    Platform,
    Alert
} from 'react-native';

import { styles } from "./../SharedObject/MainStyles"
import SharedPreference from "./../SharedObject/SharedPreference"
import firebase from 'react-native-firebase';
import RestAPI from "../constants/RestAPI"
import StringText from '../SharedObject/StringText'

let content;
let title;
export default class PaySlipActivity extends Component {

    constructor(props) {
        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_ANNOUCEMENT_DETAIL)


    }

    checkDataFormat(DataResponse) {
       
        if (DataResponse) {
            title = DataResponse.title
            content = DataResponse.content

        }
       
    }

    componentDidMount() {
        this.settimerInAppNoti()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    // componentWillMount() {
    //     BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    // }

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

        if (SharedPreference.userRegisted == true) {
            
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

                    }
                }],
                { cancelable: false }
            )

            SharedPreference.userRegisted = false;

        }

    }

    onBack() {
        SharedPreference.notiAnnounceMentID = 0
        this.props.navigation.navigate('HomeScreen');
    }

    render() {
        // content = `<span class="price bold some-class-name">$459.00</span>`;
        
        return (
            <View style={{ flex: 1 }} >
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
                            <Text style={styles.navTitleTextTop} numberOfLines={1}>{title}</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
                {/* <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                <ActivityIndicator />
            </View> */}
                <WebView
                    //source={{ uri: 'https://github.com/facebook/react-native' }}
                    source={{ html: '<!DOCTYPE html><html><body><style>p{font-family: Prompt-Regular;}</style>' + content + '</body></html>' }}
                    scalesPageToFit={(Platform.OS === 'ios') ? false : true}
                    style={{ marginTop: 0 }}
                />
            </View >

        );
    }
}