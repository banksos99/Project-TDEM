import React, { Component } from 'react';

import {
    Text,
    View,
    TouchableOpacity,
    Image, WebView,
    BackHandler,
    Platform,
    Alert,
    PanResponder
} from 'react-native';

import moment from 'moment'
import firebase from 'react-native-firebase';

import SharedPreference from "./../SharedObject/SharedPreference"
import StringText from '../SharedObject/StringText'
import Colors from "../SharedObject/Colors"
import Months from "./../constants/Month"
import { styles } from "./../SharedObject/MainStyles"

import RestAPI from "../constants/RestAPI"
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"

let content;
let title;
let category;
let modifly;
let createby;

export default class PaySlipActivity extends Component {
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
        
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_ANNOUCEMENT_DETAIL)
    }

    checkDataFormat(DataResponse) {
       
        if (DataResponse) {
            title = DataResponse.title
            content = DataResponse.content
            category=DataResponse.category
            modifly=DataResponse.attributes.create_date
            createby=DataResponse.attributes.create_by
        }
       
    }

    componentDidMount() {
       
        
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

    onBack() {
        
        SharedPreference.notiAnnounceMentID = 0
        this.props.navigation.goBack()
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;
    }

    render() {

        return (
            <View style={{ flex: 1 ,backgroundColor:'white'}}
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
                            <Text style={styles.navTitleTextTop} numberOfLines={1}allowFontScaling={SharedPreference.allowfontscale}>Me-Claim</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1, marginTop: 0, marginRight: 10, marginLeft: 10 }}>
                    <WebView
                        source={{ uri: 'https://youtu.be/0CYcaeRdJco' }}
                        style={{ marginTop: 20 }}
                    />
                </View >
            </View >

        );
    }
}