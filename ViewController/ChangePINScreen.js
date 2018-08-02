import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Alert
} from 'react-native';

import Colors from "./../SharedObject/Colors"
import { styles } from "./../SharedObject/MainStyles"
import StringText from "../SharedObject/StringText";

import LoginChangePinAPI from './../constants/LoginChangePinAPI';

export default class NonpayrollActivity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pin: [],
            oldpin: [],
            newpin1: [],
            newpin2: [],
            pintitle: StringText.CHANGE_PIN_ENTER_CURRENT_PIN_TITLE,
            showCreatePinSuccess: false
        };
    }

    setPIN(num) {
        let origin = this.state.pin

        if (num == "-") {
            origin = origin.slice(0, -1);
        } else {
            origin = origin + num
        }

        console.log("ChangePINScreen ==> setPIN : ", origin)

        this.setState({
            pin: origin
        })
        this.state.pin = origin
        console.log("1 ==> pin ====> ", this.state.pin)
        console.log("1 ==> pin length ====> ", this.state.pin.length)

        if (this.state.pin.length == 6) {
            if (this.state.oldpin == 0) {
                this.setState({
                    oldpin: this.state.pin,
                    pin: [],
                    pintitle: StringText.CHANGE_PIN_ENTER_NEW_PIN_1_TITLE,

                })
                this.state.oldpin = this.state.pin
                this.state.pin = []
                this.state.pintitle = StringText.CHANGE_PIN_ENTER_NEW_PIN_1_TITLE
            } else if (this.state.newpin1 == 0) {
                this.setState({
                    newpin1: this.state.pin,
                    pin: [],
                    pintitle: StringText.CHANGE_PIN_ENTER_NEW_PIN_2_TITLE,
                })
                this.state.newpin1 = this.state.pin
                this.state.pin = []
                this.state.pintitle = StringText.CHANGE_PIN_ENTER_NEW_PIN_2_TITLE

            } else if (this.state.newpin2 == 0) {
                this.setState({
                    newpin2: this.state.pin,
                    pin: []
                })
                this.state.newpin2 = this.state.pin
                this.state.pin = []

                if (this.state.newpin1 == this.state.newpin2) {
                    this.onChangePINAPI()
                } else {
                    Alert.alert(
                        StringText.CHANGE_PIN_NOT_MATCH_TITLE,
                        StringText.CHANGE_PIN_NOT_MATCH_DESC,
                        [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ],
                        { cancelable: false }
                    )
                }
            }
        }

        console.log("2 ==> oldpin ====> ", this.state.oldpin)
        console.log("2 ==> pin ====> ", this.state.pin)
    }

    onChangePINAPI = async () => {

        console.log("onChangePINAPI : ", this.state.newpin2)
        let data = await LoginChangePinAPI(this.state.oldpin, this.state.newpin2)
        code = data[0]
        data = data[1]

        console.log("onChangePINAPI data : ", data.code)

        // TODO 
        if (code.SUCCESS == data.code) {
            this.setState({
                showCreatePinSuccess: true
            })
        } else {
            Alert.alert(
                StringText.CHANGE_PIN_FAIL_TITLE,
                StringText.CHANGE_PIN_FAIL_DESC,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            this.setState({
                                pin: [],
                                oldpin: [],
                                newpin1: [],
                                newpin2: [],
                                pintitle: StringText.CHANGE_PIN_ENTER_CURRENT_PIN_TITLE,
                                showCreatePinSuccess: false
                            })
                        }
                    },
                ],
                { cancelable: false }
            )
        }
    }

    renderCreatePinSuccess() {
        if (this.state.showCreatePinSuccess == true) {
            return (
                <View style={styles.alertDialogContainer}>
                    <View style={styles.emptyDialogContainer}>

                        <View style={[styles.registPinSuccessContainer]}>
                            <View style={{
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }} >
                                <Image style={{ width: 120, height: 120, marginBottom: 20 }}
                                    source={require('../resource/regist/regist_lock_green.png')}
                                    resizeMode="cover" />
                                <Text style={styles.pinCreateSuccessTitleText}>Create PIN Successfully</Text>
                                <Text style={styles.pinCreateSuccessDescText}>You've successfully changed your PIN.You can use</Text>
                                <Text style={styles.pinCreateSuccessDescText}>this new PIN to log in next time.</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => { this.onClosePIN() }}>
                            <View style={styles.pinButtonContainer}>
                                <Text style={styles.pinCreateSuccessButtonText}>DONE</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View >)
        }

    }

    onClosePIN = () => {
        console.log("onClosePIN")
        this.setState({
            pin: [],
            pin1: [],
            pin2: [],
        })
        this.props.navigation.navigate('HomeScreen');
    }

    renderImagePin() {
        return (<View style={styles.registPinImageContainer}>
            <Image style={styles.registPinImageSubContainer} source={this.state.pin.length >= 1 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
            <Image style={styles.registPinImageSubContainer} source={this.state.pin.length >= 2 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
            <Image style={styles.registPinImageSubContainer} source={this.state.pin.length >= 3 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
            <Image style={styles.registPinImageSubContainer} source={this.state.pin.length >= 4 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
            <Image style={styles.registPinImageSubContainer} source={this.state.pin.length >= 5 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
            <Image style={styles.registPinImageSubContainer} source={this.state.pin.length >= 6 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
        </View>)
    }

    renderCreatePin() {
        return (
            <View style={styles.alertDialogContainer}>
                {/* renderCreatePinSuccess() */}
                <View style={styles.emptyDialogContainer}>
                    <View style={[styles.navContainer, { backgroundColor: 'white' }]}>
                        <TouchableOpacity style={styles.navLeftContainer} onPress={() => { this.onClosePIN() }} >
                            <Image
                                style={[styles.navBackButton, { tintColor: Colors.grayColor }]}
                                source={require('../resource/images/Back.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.pinContainer, { backgroundColor: 'white' }]}>
                        <Image
                            style={styles.pinImage}
                            source={require('../resource/regist/regist_lock_gray.png')}
                            resizeMode="cover" />

                        <Text style={styles.pinText}>{this.state.pintitle}</Text>
                        {this.renderImagePin()}

                    </View>

                    <View style={styles.registPinNumRowContainer}>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(1) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}>1</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(2) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}>2</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(3) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}>3</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.registPinNumRowContainer}>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(4) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}>4</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(5) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}>5</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(6) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}>6</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.registPinNumRowContainer}>
                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(7) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}>7</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(8) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}>8</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(9) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}>9</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.registPinNumRowContainer}>
                        <View style={styles.registPinNumContainer} />

                        <TouchableOpacity style={styles.emptyContainer}
                            onPress={() => { this.setPIN(0) }}>
                            <View style={styles.registPinNumContainer}>
                                <Text style={styles.pinnumber}>0</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.registPinNumContainer}
                            onPress={() => { this.setPIN('-') }}>
                            <Image style={styles.pinDelete}
                                source={require('../resource/images/pin_delete.png')}
                                resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>)
    }

    render() {
        return (
            <View style={styles.container} >
                {this.renderCreatePin()}
                {this.renderCreatePinSuccess()}
            </View >
        );
    }
}