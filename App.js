import React, { Component } from 'react';
import { View, Image, Alert, Platform, Text, TouchableOpacity, ActivityIndicator, StatusBar,NetInfo,AppState,PanResponder,ViewPropTypes } from 'react-native';

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
import moment from 'moment'
import { styles } from "./SharedObject/MainStyles"
import LoginWithPinAPI from "./constants/LoginWithPinAPI"
import PropTypes from 'prop-types';
// import registerScreen from "./ViewController/MHF01210RegisterScreen";
var BadgeAndroid = require('react-native-android-badge')
let sessionTimeoutSec = 300000;

export default class mainview extends Component {

  static propTypes = {
    timeForInactivity: PropTypes.number,
    checkInterval: PropTypes.number,
    children: PropTypes.node.isRequired,
    style: ViewPropTypes.style,
    onInactivity: PropTypes.func.isRequired,
  };

  savePIN = new SavePIN()
  saveProfile = new SaveProfile()
  panResponder = {};

  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
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
      sessionTimeoutBool: false,
      pageSelect: '',
      quitdate:new Date(),
      glass:false,
      sessionTimeOutAlert:false
    }
    console.log("this.props.navigation ==> ", this.props.navigation)
  }

  onInactivity = (timeWentInactive) => {
    console.log("onInactivity ", timeWentInactive)
    // if (timeWentInactive != null) {
    if (SharedPreference.currentNavigator == SharedPreference.SCREEN_MAIN) {

      if (this.state.sessionTimeoutBool == false) {
        
        this.state.sessionTimeoutBool = true
        this.state.quitdate = new Date()
        Alert.alert(
          StringText.ALERT_SESSION_TIMEOUT_TITILE,
          StringText.ALERT_SESSION_TIMEOUT_DESC,
          [{
            text: 'OK', onPress: () => {
              this.setState({

                showpin: true,
                failPin: 0,
                pin: '',
                isLoading: false
                //showpin: true,
              });
            }
          }],
          { cancelable: false }
        )
      }
    } else {
      this.setState({
        showpin: false,
        glass:false
      });

    }
    // }
  }


  componentDidUpdate() {
    console.log('mainApp => componentDidUpdate',AppState.currentState)

    
    // Alert.alert(
    //   'update',
    //   'update',
    //   [{
    //     text: 'OK', onPress: () => {
    //       this.setState({
    //         showpin: true,
    //       });
    //     }
    //   }],
    //   { cancelable: false }
    // )




  }

  componentWillMount() {

    // this.checkUserInActive();
    this.panResponder = PanResponder.create({

      onStartShouldSetPanResponder: () => {
          console.log('onStartShouldSetPanResponder'); 
          this.resetTimer()
          return false
        },
      onMoveShouldSetPanResponder:() => {
          console.log('onMoveShouldSetPanResponder'); 
          this.resetTimer()
          return false
        },
      onStartShouldSetPanResponderCapture: () => {
        console.log('onStartShouldSetPanResponderCapture'); 
        this.resetTimer()
        return false
      },
      // onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => false,
    });
    this.timer = setTimeout(() => this.setState({
      glass:true
    }, function () {
      this.onInactivity();
     // this.resetTimer();
    }), sessionTimeoutSec)
  }

  onStartShouldSetPanResponder() {
    this.resetTimer()
    return true
  }

  onMoveShouldSetPanResponder() {
    this.resetTimer()
    return true
  }

  componentWillUnmount() {
    console.log('mainApp => componentWillUnmount')
    AppState.removeEventListener('change', this._handleAppStateChange);
    clearTimeout(this.timer);
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    console.log('app componentWillUnmount')
  }

  async componentDidMount() {

    
    console.log('mainApp => componentDidMount')
    AppState.addEventListener('change', this._handleAppStateChange);
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    this.notificationListener();
    const enabled = await firebase.messaging().hasPermission();

    if (enabled) {
      //console.log("firebase ==> user has permissions")
    } else {
      try {
        await firebase.messaging().requestPermission();
        //console.log("firebase ==> User has authorised")
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
        console.log('App ==> firebase ==> message Device FCM Token: ', token);
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
    // Reset badge
    SharedPreference.notipayslipID = 0;
      SharedPreference.notiAnnounceMentID = 0;
    if (Platform.OS === 'android') {
      BadgeAndroid.setBadge(0)

    } else if (Platform.OS === 'ios') {
      const localNotification = new firebase.notifications.Notification()

        .ios.setBadge(0);
      firebase.notifications()
        .displayNotification(localNotification)
        .catch(err => console.error(err));
    }


    if (notificationOpen) {

      SharedPreference.notipayslipID = 0;
      SharedPreference.notiAnnounceMentID = 0;
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

  //check application active
  _handleAppStateChange = (nextAppState) => {

    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      let diff = moment(new Date()).diff(this.state.quitdate, 'seconds')
      console.log('show date before foreground =>', diff)

      // if (diff > 300) {
      //   if (SharedPreference.currentNavigator == SharedPreference.SCREEN_MAIN) {
      //     Alert.alert(
      //       StringText.ALERT_SESSION_TIMEOUT_TITILE,
      //       StringText.ALERT_SESSION_TIMEOUT_DESC,
      //       [{
      //         text: 'OK', onPress: () => {
      //           this.setState({
                  
      //             showpin: true,
      //             failPin: 0,
      //             pin: '',
      //             isLoading: false,
      //             //  showpin: true,
      //           });
      //         }
      //       }],
      //       { cancelable: false }
      //     )
      //   }
        // this.setState({
        //   isLoading: false,
        // showpin: true,
        // failPin: 0,
        // pin: ''

        // });
      // }

    } else if (nextAppState === 'inactive') {

      console.log('show date before background =>', this.state.quitdate)

    }
    this.setState({ appState: nextAppState });
  }

  handleConnectivityChange = isConnected => {
    SharedPreference.isConnected = isConnected
    console.log('handleConnectivityChange')
  };

  notificationListener() {

    notificationListener = firebase
      .notifications()
      .onNotification(notification => {

        console.log('notification => ',notification)

        // Alert.alert(
        //   'notification',
        //   'newmessage',
        //   [{
        //     text: 'OK', onPress: () => {
        //       // this.setState({
        //       //   showpin: true,
        //       // });
        //     }
        //   }],
        //   { cancelable: false }
        // )
        if (Platform.OS === 'android') {
          
          const localNotification = new firebase.notifications.Notification({
            sound: 'default',
            show_in_foreground: true,
            
          })
            .setNotificationId(notification.notificationId)
            .setTitle(notification.title)
            .setSubtitle(notification.subtitle)
            .setBody(notification.body)
            .setData(notification.data)
            .android.setChannelId('channelId') // e.g. the id you chose above
            .android.setSmallIcon('ic_stat_notification') // create this icon in Android Studio
            .android.setColor('#000000') // you can set a color here
            .android.setPriority(firebase.notifications.Android.Priority.High)
            // .android.setBadge(6)

          firebase.notifications()
            .displayNotification(localNotification)
            .catch(err => console.error(err));
        

        } else if (Platform.OS === 'ios') {
          const localNotification = new firebase.notifications.Notification()
          //   .setNotificationId(notification.notificationId)
          //   .setTitle(notification.title)
          //   .setSubtitle(notification.subtitle)
          //   .setBody(notification.body)
          //   .setData(notification.data)
            .ios.setBadge(0);
          // firebase.notifications()
          //   .displayNotification(localNotification)
          //   .catch(err => console.error(err));
        }

        this.setState({
          notiMessage: 10,
          notiTitle: notification._title,
          notiBody: notification._body
        });
      });

  }

  // inactivecounting() {
  //   this.timer = setTimeout(() => {
  //     this.setState({
  //       inactive: true,
  //       modalVisible: true
  //     });
  //   }, 1000);
  // }

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
                <Text style={{ fontSize:14}}>{this.state.notiTitle}</Text>
              </View>
              <View style={{ flex: 2, marginLeft: 10 }}>
                <Text style={{ fontSize:14}}>{this.state.notiBody}</Text>
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
      return (
        <View style={styles.pinFailBoxContainer}>
          <Text style={styles.pinFailBoxText}>
            {this.state.failPin} failed PIN Attempts
          </Text>
        </View>
      )
    }
    return (
      <View style={styles.pinFailBoxContainer}>

      </View>
    )
  }

  getPINFromDevice = async () => {
    pin = await this.savePIN.getPin()
    this.state.savePin = pin
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
    SharedPreference.profileObject = await this.saveProfile.getProfile()
    this.onLoginResetPinAPI()
  }

  onLoginResetPinAPI = async () => {

    let data = await LoginResetPinAPI(SharedPreference.FUNCTIONID_PIN)
    code = data[0]
    data = data[1]

    // console.log("onLoginResetPinAPI : ", data.code)
    if (code.SUCCESS == data.code) {

      SharedPreference.gotoRegister = true
      this.setState({
        showpin: false,
        failPin: 0,
        pin: '',
        isLoading: false,
        glass:false
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
            SharedPreference.gotoRegister = true
            // console.log("SharedPreference.gotoRegister : ", SharedPreference.gotoRegister)
            this.setState({
              showpin: false,
              isLoading: false,
              glass:false
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
            SharedPreference.gotoRegister = true
            // console.log("SharedPreference.gotoRegister : ", SharedPreference.gotoRegister)
            this.setState({
              showpin: false,
              isLoading: false,
              glass:false
            })
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
              //console.log('OK Pressed')
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
            SharedPreference.gotoRegister = true
            // console.log("SharedPreference.gotoRegister : ", SharedPreference.gotoRegister)
            this.setState({
              showpin: false,
              isLoading: false,
              glass:false
            })
          }
        }
        ],
        { cancelable: false }
      )
    }
  }

  rendertranscreen() {

    if (this.state.glass) {

      return (
        <View style={styles.alertDialogContainer}>
          <View style={{width: Layout.window.width,height: Layout.window.height, opacity: 0.8}} />
          {/* bg */}
          {/* <View style={styles.alertDialogContainer}> */}
            {/* <ActivityIndicator /> */}
          {/* </View> */}
        </View>
      )

    }

  }

  renderPINScreen() {
    if (this.state.showpin) {

      // return (
      //   <View style={{flex:1,position: 'absolute',}}>
      //       {/* <View style={styles.alertDialogContainer}>
      //           <View style={styles.emptyDialogContainer}> */}

      //       <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
      //           <Image
      //               style={{flex:1 }}

      //               source={require('./resource/regist/regist_red.png')}
      //           //resizeMode="cover" 
      //           />
      //       </View>

      //       <View style={{ height: '50%', justifyContent: 'center', alignItems: 'center', }}>
      //       {/* <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'yellow' }}> */}
      //               <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      //                   <Image
      //                       style={{ width: 65, height: 65 }}

      //                       source={require('./resource/regist/regist_lock_white.png')}
      //                   //resizeMode="cover" 
      //                   />
      //                   <Text style={styles.registPinEnterContainer}>{this.state.pintitle}</Text>
      //                   {this.renderImagePin()}
      //                   <TouchableOpacity onPress={() => { this.onResetPIN() }}>
      //                       <Text style={styles.registPinForgotContainer}>Forgot your PIN ?</Text>
      //                   </TouchableOpacity>
      //                   {this.renderFailPin()}
      //               </View>
      //           {/* </View> */}
      //       </View>
      //       {/* <View style={{ width: '100%' }} /> */}
      //       <View style={{ height: '50%', width: '100%', backgroundColor: 'white' }}>

      //           <View style={styles.registPinNumRowContainer}>
      //               <TouchableOpacity style={styles.emptyContainer}
      //                   onPress={() => { this.setPIN(1) }}>
      //                   <View style={styles.registPinNumContainer}>
      //                       <Text style={styles.pinnumber}>1</Text>
      //                   </View>
      //               </TouchableOpacity>

      //               <TouchableOpacity style={styles.emptyContainer}
      //                   onPress={() => { this.setPIN(2) }}>
      //                   <View style={styles.registPinNumContainer}>
      //                       <Text style={styles.pinnumber}>2</Text>
      //                   </View>
      //               </TouchableOpacity>
      //               <TouchableOpacity style={styles.emptyContainer}
      //                   onPress={() => { this.setPIN(3) }}>
      //                   <View style={styles.registPinNumContainer}>
      //                       <Text style={styles.pinnumber}>3</Text>
      //                   </View>
      //               </TouchableOpacity>
      //           </View>

      //           <View style={styles.registPinNumRowContainer}>
      //               <TouchableOpacity style={styles.emptyContainer}
      //                   onPress={() => { this.setPIN(4) }}>
      //                   <View style={styles.registPinNumContainer}>
      //                       <Text style={styles.pinnumber}>4</Text>
      //                   </View>
      //               </TouchableOpacity>
      //               <TouchableOpacity style={styles.emptyContainer}
      //                   onPress={() => { this.setPIN(5) }}>
      //                   <View style={styles.registPinNumContainer}>
      //                       <Text style={styles.pinnumber}>5</Text>
      //                   </View>
      //               </TouchableOpacity>
      //               <TouchableOpacity style={styles.emptyContainer}
      //                   onPress={() => { this.setPIN(6) }}>
      //                   <View style={styles.registPinNumContainer}>
      //                       <Text style={styles.pinnumber}>6</Text>
      //                   </View>
      //               </TouchableOpacity>
      //           </View>

      //           <View style={styles.registPinNumRowContainer}>
      //               <TouchableOpacity style={styles.emptyContainer}
      //                   onPress={() => { this.setPIN(7) }}>
      //                   <View style={styles.registPinNumContainer}>
      //                       <Text style={styles.pinnumber}>7</Text>
      //                   </View>
      //               </TouchableOpacity>

      //               <TouchableOpacity style={styles.emptyContainer}
      //                   onPress={() => { this.setPIN(8) }}>
      //                   <View style={styles.registPinNumContainer}>
      //                       <Text style={styles.pinnumber}>8</Text>
      //                   </View>
      //               </TouchableOpacity>

      //               <TouchableOpacity style={styles.emptyContainer}
      //                   onPress={() => { this.setPIN(9) }}>
      //                   <View style={styles.registPinNumContainer}>
      //                       <Text style={styles.pinnumber}>9</Text>
      //                   </View>
      //               </TouchableOpacity>
      //           </View>

      //           <View style={styles.registPinNumRowContainer}>
      //               <View style={styles.registPinNumContainer} />

      //               <TouchableOpacity style={styles.emptyContainer}
      //                   onPress={() => { this.setPIN(0) }}>
      //                   <View style={styles.registPinNumContainer}>
      //                       <Text style={styles.pinnumber}>0</Text>
      //                   </View>
      //               </TouchableOpacity>

      //               <TouchableOpacity style={styles.registPinNumContainer}
      //                   onPress={() => { this.setPIN('-') }}>
      //                   <Image style={styles.pinDelete}
      //                   source={require('./resource/images/pin_delete_red.png')}
      //                   resizeMode="contain" />
      //               </TouchableOpacity>
      //           </View>
      //       </View>
      //       {/* </View>
      //        </View> */}
      //       {this.renderProgressView()}
      //   </View>
      //   )

      return (
        <View style={[styles.alertDialogContainer,{backgroundColor:Colors.redColor}]}>
          {/* <View style={styles.alertDialogContainer}>
             <View style={styles.emptyDialogContainer}> */}
          <View style={{ height: '50%', justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Image
                style={{ width: 50, height: 50 }}
                source={require('./resource/regist/regist_lock_white.png')}
                resizeMode="cover" />
              <Text style={styles.registPinEnterContainer}>{this.state.pintitle}</Text>
              {this.renderImagePin()}
              <TouchableOpacity onPress={() => { this.onResetPIN() }}>
                <Text style={styles.registPinForgotContainer}>Forgot your PIN ?</Text>
              </TouchableOpacity>
              {this.renderFailPin()}
            </View>
          </View>


          <View style={{ height: '50%', width: '100%', }}>

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
                  source={require('./resource/images/pin_delete_red.png')}
                  resizeMode="contain" />
              </TouchableOpacity>
              {/* </View>
              </View> */}
            </View>
          </View>
          {this.renderProgressView()}
        </View>
      )
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

      console.log('pin == 6')
      this.setState({
        isLoading: true
      })
      // SharedPreference.profileObject = await this.saveProfile.getProfile()
      await this.onLoadLoginWithPin(this.state.pin)
    }
  }

  onLoadLoginWithPin = async (PIN) => {
    console.log("login with pin client_id ==> ", SharedPreference.profileObject)
    let data = await LoginWithPinAPI(PIN, SharedPreference.FUNCTIONID_PIN)
    code = data[0]
    data = data[1]

    console.log("onLoadLoginWithPin ==> ", data.code)
    this.state.quitdate = new Date()
    if (code.SUCCESS == data.code) {

      this.setState({
        showpin: false,
        sessionTimeoutBool:false,
        failPin: 0,
        pin: '',
        glass:false
      })
    } else if (code.INVALID_AUTH_TOKEN == data.code) {
      Alert.alert(
        StringText.INVALID_AUTH_TOKEN_TITLE,
        StringText.INVALID_AUTH_TOKEN_DESC,
        [{
          text: 'OK', onPress: () => {
            // SharedPreference.profileObject = null
            this.saveProfile.setProfile(null)
            SharedPreference.gotoRegister = true
            // console.log("SharedPreference.gotoRegister : ", SharedPreference.gotoRegister)
            this.setState({
              showpin: false,
              sessionTimeoutBool:false,
              glass:false
            })
          }
        }
        ],
        { cancelable: false })

    } else if (code.INVALID_AUTH_TOKEN == data.code) {

      this.onAutenticateErrorAlertDialog()

    } else if (code.DOES_NOT_EXISTS == data.code) {

      this.onRegisterErrorAlertDialog()


    } else if ((code.INTERNAL_SERVER_ERROR == data.code) || (code.ERROR == data.code)) {
      Alert.alert(
        StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
        StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
        [{
          text: 'OK', onPress: () => {
            // SharedPreference.profileObject = null
            this.saveProfile.setProfile(null)
            SharedPreference.gotoRegister = true
            // console.log("SharedPreference.gotoRegister : ", SharedPreference.gotoRegister)
            this.setState({
              showpin: false,
              sessionTimeoutBool:false,
              glass:false
            })
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
            // SharedPreference.profileObject = null
            this.saveProfile.setProfile(null)
            SharedPreference.gotoRegister = true
            // console.log("SharedPreference.gotoRegister : ", SharedPreference.gotoRegister)
            this.setState({
              showpin: false,
              sessionTimeoutBool:false,
              glass:false
            })
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
              // SharedPreference.profileObject = null
              this.saveProfile.setProfile(null)
              SharedPreference.gotoRegister = true
              // console.log("SharedPreference.gotoRegister : ", SharedPreference.gotoRegister)
              this.setState({
                showpin: false,
                sessionTimeoutBool:false,
                glass:false
              })
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
                sessionTimeoutBool:false,
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

  

  resetTimer() {
    console.log('resetTimer')
    clearTimeout(this.timer)
    // this.checkUserInActive();
    // if (this.state.showpin)
    //   this.setState({ showpin: false })
    this.timer = setTimeout(() => this.setState({
      glass:true

    }, function () {
      this.onInactivity();
      this.resetTimer();
    }), sessionTimeoutSec)
  }

  render() {
    if (this.state.inactive) {
const {
      style,
      children,
    } = this.props;
      return (
        <View style={{ flex: 1 }}
          collapsable={false}
          {...this.panResponder.panHandlers}

        >
     
          {/* <UserInactivity
          timeForInactivity={60000}
         checkInterval={2000}
          onInactivity={this.onInactivity}

           > */}
          <StatusBar
            barStyle="light-content"
            backgroundColor="#e60c0c"
          />
          <View style={styles.container} >
            <View style={styles.container} >
              <RootViewController pushstatus={this.state.pageSelect} />
            </View>
            {this.rendertranscreen()}
            {this.rendernotificationlabel()}
            {this.renderPINScreen()}

          </View>
        </View>
        // </UserInactivity>
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
