import React, { Component } from "react";
import { View, Image, Text, TextInput, Keyboard, TouchableOpacity, Alert } from "react-native";
import { styles } from "./../SharedObject/MainStyles";
import Colors from './../SharedObject/Colors';
import RegisterAPI from './../constants/RegisterAPI';
import SetPinAPI from './../constants/SetPinAPI';

import SharedPreference from "../SharedObject/SharedPreference";
import StringText from "../SharedObject/StringText";
import SavePIN from "../constants/SavePIN"

export default class RegisterActivity extends Component {

    savePIN = new SavePIN()

    constructor(props) {
        super(props);
        this.state = {
            keyboardHeight: 0,
            pin: '',
            pin1: '',
            pin2: '',
            showCreatePin: false,
            showCreatePinSuccess: false,
            pintitle: 'Create Pin',
            username: '',
            password: ''
        }

       
    }

    onRegister = async () => {
        console.log("username : ", this.state.username, ", password : ", this.state.password)
        let data = await RegisterAPI(this.state.username, this.state.password)
        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {
            this.setState({
                showCreatePin: true
            })
        } else {
            Alert.alert(
                StringText.SERVER_ERROR_TITLE,
                StringText.SERVER_ERROR_DESC,
                [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false }
            )
        }
    }


    onSetPin = async () => {
        console.log("SetPin : ", this.state.pin2)
        let data = await SetPinAPI(this.state.pin2)
        code = data[0]
        data = data[1]

        if (code.SUCCESS == data.code) {

            await this.savePIN.setPin(this.state.pin2)
            const pinID = await this.savePIN.getPin()
            console.log("PIN get : ", pinID)

            this.setState({
                showCreatePinSuccess: true,
                showCreatePin: false
            })
        } else {
            Alert.alert(
                StringText.SERVER_ERROR_TITLE,
                StringText.SERVER_ERROR_DESC,
                [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false }
            )
        }
    }
    onClosePIN = () => {
        console.log("onClosePIN")
        this.setState({
            showCreatePin: false
        })
    }


    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow(e) {
        this.setState({
            keyboardHeight: e.endCoordinates.height
        })
    }

    _keyboardDidHide() {
        this.setState({
            keyboardHeight: 0
        })
    }

    setPIN(num) {
        let origin
        if (this.state.pin1.length == 6) {
            origin = this.state.pin2
        } else {
            origin = this.state.pin1
        }

        if (num == "-") {
            origin = origin.slice(0, -1);
        } else {
            origin = origin + num
        }

        if (this.state.pin1.length == 6) {
            if ((this.state.pin.length == 6)) {
                this.setState({
                    pin: origin,
                    pin2: origin,
                    pintitle: 'Confirm Pin'
                })
            } else {
                this.setState({
                    pin: origin,
                    pin2: origin
                })
                this.state.pin = origin
                this.state.pin2 = origin
                if (this.state.pin2.length == 6) {
                    //TODO When fill success 
                    console.log("========> pin1 : ", this.state.pin1)
                    console.log("========> pin2 : ", this.state.pin2)

                    if (this.state.pin1 == this.state.pin2) {
                        this.onSetPin()
                    } else {
                        console.log("========> pin1 : ", this.state.pin1)

                        //TODO Alert
                        Alert.alert(
                            StringText.REGISTER_PIN_ERROR_TITLE,
                            StringText.REGISTER_PIN_ERROR_DESC,
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        this.setState({
                                            pin: '',
                                            pin1: '',
                                            pin2: '',
                                            pintitle: 'Create Pin',
                                        })
                                    }
                                },
                            ],
                            { cancelable: false }
                        )

                    }
                }
            }
        } else {
            this.setState({
                pin: origin,
                pin1: origin
            })
            this.state.pin = origin
            this.state.pin1 = origin
        }
    }



    onBack() {
        console.log("onBack")
    }

    onOpenPinActivity() {
        console.log("PinScreen")
        this.props.navigation.navigate('PinScreen')
    }

    onResetPin() {
        console.log("Reset Pin")
    }

    renderCreatePin() {
        if (this.state.showCreatePin == true) {
            return (
                <View style={styles.alertDialogContainer}>
                    <View style={styles.emptyDialogContainer}>
                        <View style={[styles.navContainer, { backgroundColor: 'white' }]}>
                            <TouchableOpacity style={styles.navLeftContainer} onPress={() => { this.onClosePIN.bind(this) }} >
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

                            <TouchableOpacity onPress={() => { this.onResetPin.bind(this) }}>
                                <Text style={styles.registPinForgotContainer}>Reset PIN ?</Text>
                            </TouchableOpacity>
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

                            <TouchableOpacity style={styles.registPinNumContainer}
                                onPress={() => { this.setPIN(0) }}>
                                <Text style={styles.pinnumber}>0</Text>
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
                            onPress={() => { this.onOpenPinActivity() }}>
                            <View style={styles.pinButtonContainer}>
                                <Text style={styles.pinCreateSuccessButtonText}>DONE</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View >)
        }

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

    render() {
        return (
            <View style={styles.container} >
                <View style={styles.container} >

                    {/* Image Background */}
                    <Image style={styles.registBackground}
                        source={require('../resource/regist/regist_white.png')} />

                    <View style={styles.registContainer}>
                        <Image source={require('../resource/regist/regist_logo.png')} />

                        <View style={[styles.registerContainerWidth, { marginBottom: this.state.keyboardHeight }]}>
                            <View style={styles.registTextContainer}>
                                <Image style={styles.registetImageContainer}
                                    source={require('../resource/regist/regist_location.png')} />
                                <Text style={[styles.registLocationText, { color: Colors.grayTextColor }]}>TDEM</Text>
                            </View>
                            <View style={styles.registLine} />

                            <View style={styles.registTextContainer}>
                                <Image style={styles.registetImageContainer}
                                    source={require('../resource/regist/regist_user.png')} />
                                <TextInput
                                    onSubmitEditing={Keyboard.dismiss}
                                    underlineColorAndroid="transparent"
                                    selectionColor='black'
                                    // autoFocus="true"
                                    style={styles.registText}
                                    placeholder="User ID"
                                    onChangeText={(username) => this.setState({ username })} />

                            </View>
                            <View style={styles.registLine} />

                            <View style={styles.registTextContainer}>
                                <Image style={styles.registetImageContainer}
                                    source={require('../resource/regist/regist_locked.png')} />
                                <TextInput
                                    onSubmitEditing={Keyboard.dismiss}
                                    underlineColorAndroid="transparent"
                                    // autoFocus="true"
                                    selectionColor='black'
                                    style={styles.registText}
                                    placeholder="Password"
                                    onChangeText={(password) => this.setState({ password })} />
                            </View>

                            <View style={styles.registLine} />
                            <TouchableOpacity onPress={() => this.onRegister()}>
                                <View style={styles.registButton}>
                                    <Text style={styles.registTextButton}>
                                        Log In
                                </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View >

                {this.renderCreatePin()}
                {this.renderCreatePinSuccess()}
            </View >
        );
    }

}

