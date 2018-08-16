import React, { Component } from 'react';
import { View, Image, Alert, Platform, Text, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';

import SharedPreference from './SharedObject/SharedPreference';

import RootViewController from './ViewController/NavigationController';
import SavePIN from "./constants/SavePIN";
import SaveProfile from "./constants/SaveProfile"

import LoginResetPinAPI from "./constants/LoginResetPinAPI";

import DeviceInfo from 'react-native-device-info';

import firebase from 'react-native-firebase';
import Layout from "./SharedObject/Layout";
import Colors from "./SharedObject/Colors";
import StringText from "./SharedObject/StringText";

import UserInactivity from 'react-native-user-inactivity';

import { styles } from "./SharedObject/MainStyles"
import LoginWithPinAPI from "./constants/LoginWithPinAPI"

export default class mainview extends Component {

  savePIN = new SavePIN()
  saveProfile = new SaveProfile()

  constructor(props) {
    super(props);
    this.state = {
      inactive: false,
      showpin: false,
      notiMessage: 0,
      notipayslipID: 0,
      notiTitle: 0,
      notiBody: 0,
      timeWentInactive: false,
      pintitle: 'Enter your PIN',
      pin: '',
      failPin: 0,
      savePin: '',
      isLoading: false,
      sessionTimeoutBool: false
    }
  }

  onInactivity = (timeWentInactive) => {
    console.log("onInactivity : ", timeWentInactive)
    console.log("onInactivity ==> SessionTimeoutBool : ", SharedPreference.sessionTimeoutBool)


    if (timeWentInactive != null) {

      console.log("SharedPreference.currentNavigator 11 ==> ", SharedPreference.currentNavigator)
      if (SharedPreference.currentNavigator == SharedPreference.SCREEN_MAIN) {
        console.log("SharedPreference.currentNavigator 22 ==> ", SharedPreference.currentNavigator)

        Alert.alert(
          StringText.ALERT_SESSION_TIMEOUT_TITILE,
          StringText.ALERT_SESSION_TIMEOUT_DESC,
          [{
            text: 'OK', onPress: () => {
              this.setState({
                showpin: true,
                // sessionTimeoutBool: true
              });
            }
          }],
          { cancelable: false }
        )
      }
    }

    // if (this.state.sessionTimeoutBool == false) {

    //   // this.setState({
    //   //   sessionTimeoutBool: true
    //   // })

    //   console.log("onInactivity : show alert Dialog")



    //   Alert.alert(
    //     StringText.ALERT_SESSION_TIMEOUT_TITILE,
    //     StringText.ALERT_SESSION_TIMEOUT_DESC,
    //     [{
    //       text: 'OK', onPress: () => {
    //         this.setState({
    //           showpin: true,
    //           // sessionTimeoutBool: true
    //         });
    //       }
    //     }],
    //     { cancelable: false }
    //   )
    // }

  }


  async componentDidMount() {

    this.notificationListener();
    const enabled = await firebase.messaging().hasPermission();

    if (enabled) {
      console.log("firebase ==> user has permissions")
    } else {
      try {
        await firebase.messaging().requestPermission();
        console.log("firebase ==> User has authorised")
      } catch (error) {

      }
    }


    ////////Device Info/////////////
    const deviceModel = DeviceInfo.getModel();
    const deviceBrand = DeviceInfo.getBrand();
    const deviceOS = DeviceInfo.getSystemName();
    const deviceOSVersion = DeviceInfo.getSystemVersion();
    const appVersion = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();

    await firebase.messaging().getToken()
      .then((token) => {
        // console.log('App ==> firebase ==> message Device FCM Token: ', token);
        SharedPreference.deviceInfo = {
          "deviceModel": deviceModel,
          "deviceBrand": deviceBrand,
          "deviceOS": deviceOS,
          "deviceOSVersion": deviceOSVersion,
          "firebaseToken": token,
          "appVersion": appVersion,
          "buildNumber": buildNumber
        }
      });

    notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const notification = notificationOpen.notification;
      if (notification._data.type === 'Payroll') {
        SharedPreference.notipayslipID = notification._data.id
      } else if (notification._data.type === 'Emergency Announcement') {
        SharedPreference.notiAnnounceMentID = notification._data.id
      }
    }

    this.setState({
      inactive: true,
    });

  }

  notificationListener() {
    notificationListener = firebase
      .notifications()
      .onNotification(notification => {

        this.setState({
          notiMessage: 10,
          notiTitle: notification._title,
          notiBody: notification._body
        });

        if (notification._data.type === 'Payroll') {

          SharedPreference.notipayslipID = notification._data.id

        } else if (notification._data.type === 'Emergency Announcement') {

          SharedPreference.notiAnnounceMentID = notification._data.id

        }
      });

  }

  inactivecounting() {
    this.timer = setTimeout(() => {
      this.setState({
        inactive: true,
        modalVisible: true
      });
    }, 1000);
  }

  closelabelnoti() {
    this.timer = setTimeout(() => {
      this.setState({
        notiMessage: 0
      });
    }, 5000);
  }

  rendernotificationlabel() {
    if (this.state.notiMessage) {
      this.closelabelnoti();
      return (
        <View style={{ width: '100%', height: 120, position: 'absolute', backgroundColor: 'transparent' }}>
          <View style={{ flex: 1, borderRadius: 10, backgroundColor: 'white', justifyContent: 'center', margin: 10 }}>
            <View style={{ flexDirection: 'column', flex: 1 }}>
              <View style={{ flexDirection: 'row', flex: 2 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    style={{ height: 20, width: 20, }}
                    source={require('./resource/SplashBg.png')}
                  /></View>
                <View style={{ flex: 7, justifyContent: 'center' }}><Text>TDEM Connect</Text></View>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text>{this.state.notiTitle}</Text>
              </View>
              <View style={{ flex: 2, marginLeft: 10 }}>
                <Text>{this.state.notiBody}</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
  }

  renderImagePin() {
    let but1 = require('./resource/circle.png')
    let but2 = require('./resource/circle.png')
    let but3 = require('./resource/circle.png')
    let but4 = require('./resource/circle.png')
    let but5 = require('./resource/circle.png')
    let but6 = require('./resource/circle.png')

    if (this.state.pin.length >= 1) { but1 = require('./resource/circleEnable.png') }
    if (this.state.pin.length >= 2) { but2 = require('./resource/circleEnable.png') }
    if (this.state.pin.length >= 3) { but3 = require('./resource/circleEnable.png') }
    if (this.state.pin.length >= 4) { but4 = require('./resource/circleEnable.png') }
    if (this.state.pin.length >= 5) { but5 = require('./resource/circleEnable.png') }
    if (this.state.pin.length >= 6) { but6 = require('./resource/circleEnable.png') }

    return (<View style={styles.registPinImageContainer}>
      <Image style={styles.registPinImageSubContainer} source={but1} />
      <Image style={styles.registPinImageSubContainer} source={but2} />
      <Image style={styles.registPinImageSubContainer} source={but3} />
      <Image style={styles.registPinImageSubContainer} source={but4} />
      <Image style={styles.registPinImageSubContainer} source={but5} />
      <Image style={styles.registPinImageSubContainer} source={but6} />
    </View>)
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

  renderFailPin() {
    if (this.state.failPin > 0) {
      return (<View style={styles.pinFailBoxContainer}>
        <Text style={styles.pinFailBoxText}>
          {this.state.failPin} failed PIN Attempts
          </Text>
      </View>)
    }
  }

  getPINFromDevice = async () => {
    pin = await this.savePIN.getPin()
    this.state.savePin = pin
  }

  onResetPIN = async () => {
    //console.log("onResetPIN")
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

    //console.log("onLoginResetPinAPI : ", data.code)

    if (code.SUCCESS == data.code) {
      SharedPreference.profileObject = null
      this.saveProfile.setProfile(null)
      // this.props.navigation.navigate('RegisterScreen')
      this.setState({
        showpin: false
      })
    } else if (code.INVALID_AUTH_TOKEN == data.code) {
      Alert.alert(
        StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
        StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
        [{
          text: 'OK', onPress: () => {
            SharedPreference.profileObject = null
            this.saveProfile.setProfile(null)
            // this.props.navigation.navigate('RegisterScreen')
            this.setState({
              showpin: false
            })
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
          }
        }
        ],
        { cancelable: false }
      )
    }
  }

  renderPINScreen() {
    if (this.state.showpin) {

      console.log("SharedPreference.currentNavigator : ", SharedPreference.currentNavigator);
      // if (SharedPreference.currentNavigator == SharedPreference.SCREEN_MAIN) {
      return (
        <View style={styles.alertDialogContainer}>
          <View style={styles.alertDialogContainer}>
            <View style={styles.emptyDialogContainer}>
              <View style={[styles.pinContainer, { paddingTop: 60, backgroundColor: Colors.redColor }]}>
                <Image
                  style={styles.pinImage}
                  source={require('./resource/regist/regist_lock_white.png')}
                  resizeMode="cover" />
                <Text style={[styles.pinText, { color: 'white' }]}>{this.state.pintitle}</Text>
                {this.renderImagePin()}
                <TouchableOpacity onPress={() => { this.onResetPIN() }}>
                  <Text style={styles.registPinForgotContainer}>Forgot your PIN ?</Text>
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
                    source={require('./resource/images/pin_delete.png')}
                    resizeMode="contain" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {this.renderProgressView()}
        </View>)
      // } else {
      //   this.setState({
      //     showpin: false
      //   })
      // }
    }
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
      SharedPreference.profileObject = await this.saveProfile.getProfile()
      await this.onLoadLoginWithPin(this.state.pin)
    }
  }

  onLoadLoginWithPin = async (PIN) => {
    console.log("login with pin ==> ", PIN)
    let data = await LoginWithPinAPI(PIN, SharedPreference.FUNCTIONID_PIN)
    code = data[0]
    data = data[1]

    console.log("onLoadLoginWithPin ==> ", data.code)
    if (code.SUCCESS == data.code) {
      this.setState({
        isLoading: false,
        showpin: false,
        failPin: 0,
        pin: ''

      })
    } else if (code.INVALID_USER_PASS == data.code) {
      if (data.data.code == "MSC29132AERR") {
        Alert.alert(
          StringText.ALERT_PIN_CANNOT_FIND_TITLE,
          StringText.ALERT_PIN_CANNOT_FIND_DESC,
          [
            {
              text: 'OK', onPress: () => {
                SharedPreference.profileObject = null
                this.saveProfile.setProfile(null)
                this.props.navigation.navigate('RegisterScreen')
              }
            }
          ],
          { cancelable: false }
        )
      } else {
        Alert.alert(
          data.data.code,
          data.data.detail,
          [
            {
              text: 'OK', onPress: () => {
                SharedPreference.profileObject = null
                this.saveProfile.setProfile(null)
                this.props.navigation.navigate('RegisterScreen')
              }
            }
          ],
          { cancelable: false }
        )

      }

    } else if (code.INVALID_AUTH_TOKEN == data.code) {
      Alert.alert(
        StringText.INVALID_AUTH_TOKEN_TITLE,
        StringText.INVALID_AUTH_TOKEN_DESC,
        [{
          text: 'OK', onPress: () => {
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
            SharedPreference.profileObject = null
            this.saveProfile.setProfile(null)
            this.props.navigation.navigate('RegisterScreen')
          }
        }
        ],
        { cancelable: false })

    } else if (code.NETWORK_ERROR == data.code) {
      Alert.alert(
        StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
        StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
        [{
          text: 'OK', onPress: () => {
            SharedPreference.profileObject = null
            this.saveProfile.setProfile(null)
            this.props.navigation.navigate('RegisterScreen')
          }
        }
        ],
        { cancelable: false })
    } else {
      if (this.state.failPin == 4) {
        this.setState({
          isLoading: false
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
          isLoading: false
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


  render() {
    if (this.state.inactive) {
      return (
        <UserInactivity
          // timeForInactivity={150000}
          // checkInterval={150000}
          timeForInactivity={150000}
          checkInterval={150000}
          onInactivity={this.onInactivity} >
          <StatusBar
            barStyle="light-content"
            backgroundColor="#e60c0c"
          />
          <View style={styles.container} >
            <View style={styles.container} >
              <RootViewController />
              {/* {this.rendernotificationlabel()} */}
            </View>
            {this.renderPINScreen()}
          </View>
        </UserInactivity>
      );
    }
    return (
      <View style={{ flex: 1, }} >
        <Image
          style={{ height: Layout.window.height, width: Layout.window.width, }}
          source={require('./resource/SplashBg.png')}
          resizeMode='contain'
          style={{ flex: 1 }} />
      </View>

    );
  }
}
