import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,

} from 'react-native';

import Colors from "./../SharedObject/Colors"
import { styles } from "./../SharedObject/MainStyles"
import StringText from "../SharedObject/StringText";
import Layout from "../SharedObject/Layout";

let scale = Layout.window.width / 320;
let page=0;

export default class WelcomeActivity extends Component {
    constructor(props) {
        super(props);
        this.state = {
           welcomeimage:require('./../resource/welcome/welcome1.png')
        };
    }

    onBack() {

        page = (page + 2)%3;
        this.onShowImage();
        
    }
    onNext() {

        page = (page + 4) % 3;
        this.onShowImage();
    }
    onShowImage() {

        if (page == 0) {
            this.setState({ welcomeimage: require('./../resource/welcome/welcome1.png') });
        } else if (page == 1) {
            this.setState({ welcomeimage: require('./../resource/welcome/welcome2.png') });
        } else if (page == 2) {
            this.setState({ welcomeimage: require('./../resource/welcome/welcome3.png') });
        }
    }

    render() {

        return (
            <View style={{ backgroundColor: 'red', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    style={{ backgroundColor: 'white' }}
                    source={this.state.welcomeimage}
                    resizeMode='contain'
                />
                <View style={{ height: '100%', width: '100%', flexDirection: "row", position: 'absolute' }}>
                    {/* <View style={{ backgroundColor: 'yellow', flex: 1 }}> */}
                    <TouchableOpacity onPress={(this.onBack.bind(this))} style={{flex:1 }}>
                    </TouchableOpacity>
                    {/* </View> */}
                    <View style={{ flex: 3 }}>
                    </View>
                    <View style={{  flex: 1 }}>
                    </View>
                </View>

            </View>
        );
    }
}