import React, { Component } from "react";
import { View, Image, Text, TouchableOpacity, Alert,ActivityIndicator } from "react-native";
import { styles } from "./../SharedObject/MainStyles";
import Colors from "./../SharedObject/Colors"
import StringText from './../SharedObject/StringText'
import SavePIN from "../constants/SavePIN"
import SharedPreference from "../SharedObject/SharedPreference";
import RestAPI from "../constants/RestAPI"

import SaveProfile from "../constants/SaveProfile"
import LoginWithPinAPI from "../constants/LoginWithPinAPI"
import LoginResetPinAPI from "../constants/LoginResetPinAPI"
import SaveAutoSyncCalendar from "../constants/SaveAutoSyncCalendar";

let listadder = {};

export default class PinActivity extends Component {

    savePIN = new SavePIN()
    saveProfile = new SaveProfile()
    saveAutoSyncCalendar = new SaveAutoSyncCalendar()

    constructor(props) {
        super(props);
        this.state = {
            pintitle: 'Enter your PIN',
            pin: '',
            failPin: 0,
            savePin: '',
            isLoading: false
        }

       

        console.log("PinActivity", listadder)
    }

    onLoadLoginWithPin = async (PIN) => {
        console.log("login with pin ==> ", PIN)
        let data = await LoginWithPinAPI(PIN, SharedPreference.FUNCTIONID_PIN)
        code = data[0]
        data = data[1]
        console.log("onLoadLoginWithPin ==> ", data.code)

        if (code.SUCCESS == data.code) {
            this.setState({
                isLoading : false
            })
            SharedPreference.calendarAutoSync = await this.saveAutoSyncCalendar.getAutoSyncCalendar()
            await this.onLoadInitialMaster()
        } else {
            if (this.state.failPin == 4) {
                this.setState({
                    isLoading : false
                })
                Alert.alert(
                    StringText.ALERT_PIN_TITLE_NOT_CORRECT,
                    StringText.ALERT_PIN_DESC_TOO_MANY_NOT_CORRECT,
                    [{
                        text: 'OK', onPress: () => {
                            SharedPreference.profileObject = null
                            this.saveProfile.setProfile(null)
                            this.props.navigation.navigate('RegisterScreen')
                        }
                    }],
                    { cancelable: false }
                )
            } else {
                this.setState({
                    isLoading : false
                })
                Alert.alert(
                    StringText.ALERT_PIN_TITLE_NOT_CORRECT,
                    StringText.ALERT_PIN_DESC_NOT_CORRECT,
                    [{
                        text: 'OK', onPress: () => {
                            let origin = this.state.failPin + 1
                            this.setState({
                                failPin: origin,
                                pin: ''
                            })
                        }
                    },
                    ],
                    { cancelable: false }
                )
            }
        }
    }

    onLoadAppInfo = async () => {
        let data = await RestAPI(SharedPreference.APPLICATION_INFO_API,"1")
        code = data[0]
        data = data[1]
        if (code.SUCCESS == data.code) {
            console.log('app info data1 :', data)
            console.log('token :', SharedPreference.TOKEN)
            let appversion = '1.0.0'
            if (data.data.force_update === 'Y') {
                Alert.alert(
                    'New Version Available',
                    'This is a newer version available for download! Please update the app by visiting the Apple Store',
                    [
                        { text: 'Update', onPress: () => console.log('OK Pressed') },
                    ],
                    { cancelable: false }
                )

            }

        }

        this.props.navigation.navigate('HomeScreen')
    }

    onLoadInitialMaster = async () => {
        let data = await RestAPI(SharedPreference.INITIAL_MASTER_API, SharedPreference.FUNCTIONID_GENERAL_INFORMATION_SHARING)
        code = data[0]
        data = data[1]
        console.log("onLoadInitialMaster : ", data.code)
        if (code.SUCCESS == data.code) {
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
            console.log('onLoadAppInfo:')
            // await this.onLoadAppInfo()
            this.props.navigation.navigate('HomeScreen')


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
            // TODO Set Information

            this.setState({
                isLoading : true
            })
            SharedPreference.profileObject = await this.saveProfile.getProfile()
            // SharedPreference.TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, '1', SharedPreference.profileObject.client_token)
            await this.onLoadLoginWithPin(this.state.pin)
        }
    }

    renderImagePin() {
        return (<View style={styles.registPinImageContainer}>
            <Image style={[styles.registPinImageSubContainer, { tintColor: 'white' }]} source={this.state.pin.length >= 1 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
            <Image style={[styles.registPinImageSubContainer, { tintColor: 'white' }]} source={this.state.pin.length >= 2 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
            <Image style={[styles.registPinImageSubContainer, { tintColor: 'white' }]} source={this.state.pin.length >= 3 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
            <Image style={[styles.registPinImageSubContainer, { tintColor: 'white' }]} source={this.state.pin.length >= 4 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
            <Image style={[styles.registPinImageSubContainer, { tintColor: 'white' }]} source={this.state.pin.length >= 5 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
            <Image style={[styles.registPinImageSubContainer, { tintColor: 'white' }]} source={this.state.pin.length >= 6 ? require('../resource/circleEnable.png') : require('../resource/circle.png')} resizeMode="center" />
        </View>)
    }

    renderFailPin() {
        if (this.state.failPin > 0) {
            return (<View style={styles.pinFailBoxContainer}>
                <Text style={styles.pinFailBoxText}>
                    {this.state.failPin} failed PIN Attempts
                </Text>
            </View>)
        }
    }

    onResetPIN = async () => {
        console.log("onResetPIN")
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
        SharedPreference.profileObject = await this.saveProfile.getProfile()
        // SharedPreference.TOKEN = await Authorization.convert(SharedPreference.profileObject.client_id, '1', SharedPreference.profileObject.client_token)
        this.onLoginResetPinAPI()
    }


    onLoginResetPinAPI = async () => {

        let data = await LoginResetPinAPI(SharedPreference.FUNCTIONID_PIN)
        code = data[0]
        data = data[1]

        console.log("onLoginResetPinAPI : ", data.code)

        if (code.SUCCESS == data.code) {
            SharedPreference.profileObject = null
            this.saveProfile.setProfile(null)
            this.props.navigation.navigate('RegisterScreen')
        } else if (code.INVALID_AUTH_TOKEN == data.code) {
            SharedPreference.profileObject = null
            this.saveProfile.setProfile(null)
            this.props.navigation.navigate('RegisterScreen')
        } else {
            Alert.alert(
                StringText.ALERT_CANNOT_DELETE_PIN_TITLE,
                StringText.ALERT_CANNOT_DELETE_PIN_DESC,
                [{
                    text: 'OK', onPress: () => {
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
                <View style={styles.alertDialogContainer}>
                    <View style={styles.alertDialogBackgroudAlpha} />
                    {/* bg */}
                    <View style={styles.alertDialogContainer}>
                        <ActivityIndicator />
                    </View>
                </View>
            )
        }
    }



    render() {
        return (
            <View style={styles.alertDialogContainer}>
                <View style={styles.alertDialogContainer}>
                    <View style={styles.emptyDialogContainer}>
                        <View style={[styles.pinContainer, { paddingTop: 60, backgroundColor: Colors.redColor }]}>
                            <Image
                                style={styles.pinImage}
                                source={require('../resource/regist/regist_lock_white.png')}
                                resizeMode="cover" />
                            <Text style={[styles.pinText, { color: 'white' }]}>{this.state.pintitle}</Text>
                            {this.renderImagePin()}
                            <TouchableOpacity onPress={() => { this.onResetPIN() }}>
                                <Text style={styles.registPinForgotContainer}>Reset PIN ?</Text>
                            </TouchableOpacity>
                            {this.renderFailPin()}
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
                </View>
                {this.renderProgressView()}
            </View>)
    }

}