import React, { Component } from 'react';

import {
    Text,
    View,
    TouchableOpacity,
    Image, WebView,
    BackHandler
} from 'react-native';

import { styles } from "./../SharedObject/MainStyles"
import SharedPreference from "./../SharedObject/SharedPreference"
import firebase from 'react-native-firebase';

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

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.onBack()
        return true;
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
                    source={{ html: '<!DOCTYPE html><html><body><style>p{font-size:60px;}</style>' + content + '</body></html>' }}
                    style={{ marginTop: 0 }}
                />
            </View >

        );
    }
}