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
    Alert
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

import HandBookCover from "./BookCover";

let dataSource = [];
let temphandbookData = [];
let FUNCTION_TOKEN;

// class BookCover extends Component {
//     constructor(props) {
//         super(props);
//         this.terminated = false;
//         this.state = {
//             url: this.props.placeholderUrl
//         };
//     }

//     componentDidMount() {
//         //console.log('[BookCover] componentDidMount');
//         this.refresh();
//     }

//     componentWillUnmount() {
//         BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
//         this.terminated = true;
//         this.task.cancel();
//     }

//     updateSource(newUrl) {
//         //console.log("Book updateSource : " + newUrl);

//         if (this.terminated) {
//             return;
//         }

//         this.setState(previousState => {
//             return { url: Platform.OS === 'android' ? 'file://' + newUrl : '' + newUrl }
//         });
//     }


//     refresh() {
//         //console.log('[BookCover] Refresh');

//         let dirs = RNFetchBlob.fs.dirs
//         let filename = this.props.bookName + '.jpeg'
//         let targetFile = dirs.DocumentDir + '/cover/' + filename;

//        // let hasFile = false;

//         RNFetchBlob.fs.exists(targetFile)
//             .then((exist) => {
//                // hasFile = exist;
//                 //console.log("======================");
//                 //console.log("Has file : " + hasFile);
//                 //console.log("======================");
//                 //console.log("======================");

//               //  hasFile = false
//                 //   if (hasFile) {
//                 //     this.updateSource(targetFile);
//                 //   } else {

//                 this.task = RNFetchBlob
//                     .config({
//                         fileCache: true,
//                         // response data will be saved to this path if it has access right.
//                         path: targetFile
//                     })
                  
//                     .fetch('GET', this.props.coverUrl, {
//                         //some headers ..
//                         'Content-Type': 'image/jpeg;base64',
//                         Authorization: FUNCTION_TOKEN

//                     });
//                 this.task.then((res) => {
//                     // the path should be dirs.DocumentDir + 'path-to-file.anything'

//                     console.log('load cover TOKEN ', FUNCTION_TOKEN)
//                     //console.log('The file saved to ', res.path())
//                     if (this.terminated) {
//                         return;
//                     }
//                     this.updateSource(targetFile);
//                 }).catch((err) => {
//                     // scan file error
//                     //console.log('[BookCover] Catch Error', err);
//                 });
//                 //   }

//             })
//             .catch(() => {
//                 //console.log('[Error] BookCover ==> Error on DidMounted')
//             });

//     }

    

//     render() {
//         return (
//             <Image source={{ uri: this.state.url }}
//                 style={{ width: '100%', height: '100%' }} />

//         );
//     }
// }

export default class HandbookActivity extends Component {

    constructor(props) {
        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state = {
            temparray: [],
        };

        this.updateToken()
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));

        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_HANDBOOK_LIST)

    }

    componentDidMount() {
        this.settimerInAppNoti()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

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

        timerstatus = false;
        this.setState({
            isscreenloading: false,
        })

        Alert.alert(
            'MHF00600AERR',
            'MHF00600AERR: Employee ID. {0} is not authorized.'
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

    updateToken() {

        FUNCTION_TOKEN = Authorization.convert(SharedPreference.profileObject.client_id, 1, SharedPreference.profileObject.client_token)
        console.log('[Handbookctivity] FUNCTION_TOKEN :', FUNCTION_TOKEN)
    }

    checkDataFormat(DataResponse) {
        
       if (dataSource.length == 0) {

            if (DataResponse) {

                console.log('Handbookctivity DataResponse :', DataResponse)
                // dataSource = DataResponse.data;
                dataSource = DataResponse;

            } else {
          
                dataSource = inappdata.dataSource.data.detail.items;

            }

            this.createShelfHandbook();
        }
   }


    onBack() {
        dataSource=[]
        this.props.navigation.navigate('HomeScreen');
    }

    onDetail(i) {

        if (SharedPreference.isConnected) {

            this.props.navigation.navigate('HandbookDetail', {
                handbook_file: dataSource[i].handbook_file,
                handbook_title: dataSource[i].handbook_title,
                FUNCTION_TOKEN: FUNCTION_TOKEN,
            });

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

    createShelfHandbook() {

        temphandbookData = [];

        dataSource.map((item, i) => {

            this.state.temparray.push(

                this.createcomponent(i)

            )

            if (i % 2) {

                temphandbookData.push(

                    <View style={{ flex: 1, flexDirection: 'row' }} key={i}>
                        {this.state.temparray}
                    </View>

                )

                this.state.temparray = []

            } else if (i === dataSource.length - 1) {

                temphandbookData.push(

                    <View style={{ flex: 1, flexDirection: 'row' }} key={i + 100}>
                        {this.state.temparray}
                    </View>

                )

                this.state.temparray = []

            }

        });
    }


    createcomponent(i) {
        console.log('handbook_cover',dataSource[i].handbook_cover.split('=')[1])
        return (
            <View style={styles.handbookItem} key={i}>
                <TouchableOpacity style={{ flex: 1 }}
              
                    onPress={() => { this.onDetail(i) }}>
                    <View style={{ flex: 5, }}>
                        <View style={{ flex: 1, margin: 5, justifyContent: 'center', alignItems: 'center' }}>

                            <HandBookCover
                                // placeholderUrl={'https://facebook.github.io/react/logo-og.png'}
                                coverUrl={SharedPreference.HOST + dataSource[i].handbook_cover}
                                bookName={dataSource[i].handbook_cover.split('=')[1]}
                            // bookName={new Date().getUTCMilliseconds()}
                            />

                        </View>
                    </View>
                    <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={styles.epubbookname}>{dataSource[i].handbook_title}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
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
                            <Text style={[styles.navTitleTextTop, { fontFamily: "Prompt-Regular" }]}>E-Book</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, flexDirection: 'column', }}>
                        {/* <View style={{ flex: 1 }}> </View> */}
                        <View style={{ flex: 10 }}>
                            <ScrollView>
                                {
                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        {temphandbookData}
                                    </View>

                                }
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </View >
        );
    }
}