import React, { Component } from 'react';

import {
    Text,
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
    Button,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    BackHandler,NetInfo
} from 'react-native';

import Colors from "./../SharedObject/Colors"
import { styles } from "./../SharedObject/MainStyles"

import orgdata from './../InAppData/OrgstructerData.json';
import SharedPreference from "./../SharedObject/SharedPreference"
import RestAPI from "../constants/RestAPI"
import firebase from 'react-native-firebase';
import StringText from '../SharedObject/StringText';
import SaveProfile from "../constants/SaveProfile"

let dataSource = [];
let option = 0;

export default class OrganizationStruct extends Component {

    constructor(props) {
        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state = {
            //employee_name,
            //employee_position,
            isConnected: true,
        };
        
        this.checkOption(this.props.navigation.getParam("Option", ""))
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_EMPLOYEE_INFORMATION_SELF)
    }

    checkOption(opt) {
        if (opt) {
            option = opt;
        }
    }

    checkDataFormat(DataResponse) {
        
        if (DataResponse) {

            dataSource = DataResponse;

            
        } else {

            console.log('orgdata : ', orgdata)

        }
    }

    componentWillMount() {
       BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
       NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    }

    componentWillUnmount() {
       BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
       NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }
    handleConnectivityChange = isConnected => {
        this.setState({ isConnected });
    };
    handleBackButtonClick() {
        this.onBack()
        return true;
    }

    onBack() {
        this.props.navigation.navigate('OrgStructure');
    }

    showDetail(item, index) {

        console.log('emp list item :', item)

        this.setState({

            isscreenloading: true,
            loadingtype: 3,
            org_code: item.employee_id,
            index_org_code: index,
            employee_name: item.employee_name,
            employee_position: item.employee_position

        }, function () {
            this.loadOrgStructureDetailAPI()
        });

    }

    loadOrgStructureDetailAPI = async () => {
        let url = SharedPreference.EMP_INFO_MANAGER_API + this.state.org_code
        this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_EMPLOYEE_INFORMATION))
    }

    APICallback(data) {
        code = data[0]
        data = data[1]
        if (code.SUCCESS == data.code) {

            console.log('option : ', option)
            if (option == 2) {
                this.props.navigation.navigate('ClockInOutSelfView', {
                    DataResponse: data.data,
                    employee_name: this.state.employee_name,
                    employee_position: this.state.employee_position,
                    manager: 1,
                    previous: 2,
                });

            } else if (option == 1){
                this.props.navigation.navigate('EmployeeInfoDetail', {
                    DataResponse: data.data,
                    manager: 1,
                    previous: 2,
                });

            }
        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog(data)

        } else {
            this.onLoadErrorAlertDialog(data)
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
                    timerstatus = false
                    SharedPreference.Handbook = []
                    SharedPreference.profileObject = null
                    this.saveProfile.setProfile(null)
                    this.props.navigation.navigate('RegisterScreen')
                }
            }],
            { cancelable: false }
        )

        console.log("error : ", error)
    }
    onLoadErrorAlertDialog(error) {
        this.setState({

            isscreenloading: false,
        })
        if (this.state.isConnected) {
            Alert.alert(
                error.data[0].code,
                error.data[0].detail,
                [{
                    text: 'OK', onPress: () => console.log('OK Pressed')
                }],
                { cancelable: false }
            )
        } else {
            Alert.alert(
                'MHF00500AERR',
                'Cannot connect to the internet.',
                [{
                    text: 'OK', onPress: () => {
                        console.log("onLoadErrorAlertDialog")
                    }
                }],
                { cancelable: false }
            )
        }
        console.log("error : ", error)
    }
    renderloadingscreen() {

        if (this.state.isscreenloading) {

            return (
                <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
                    <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>

                    </View>
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                        <ActivityIndicator />
                    </View>
                </View>
            )
        }

    }

    render() {
        return (
            <View style={{ flex: 1 }} >

                <View style={[styles.navContainer, { flexDirection: 'column' }]}>
                    <View style={styles.statusbarcontainer} />
                    <View style={{ height: 50, flexDirection: 'row', }}>
                        <View style={{ flex: 1, justifyContent: 'center', }}>
                            <TouchableOpacity
                                onPress={(this.onBack.bind(this))}>
                                <Image
                                    style={{ width: 50, height: 50 }}
                                    source={require('./../resource/images/Back.png')}
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.navTitleTextTop}>Employee List</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, flexDirection: 'column', }}>
                        <View style={{ height: 50, justifyContent: 'center' }}>
                            <Text style={{ marginLeft: 50, color: Colors.redTextColor, fontFamily: 'Prompt-Regular', fontSize: 15 }}
                            >{dataSource.data.org_name}
                            </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: 'lightgray', justifyContent: 'flex-end' }} />
                        <View style={{ flex: 10 }}>
                            <ScrollView>
                                {
                                    dataSource.data.org_emp.map((item, index) => (
                                        <View style={{ height: 50 }} key={'m' + index}

                                        >
                                            <TouchableOpacity
                                                onPress={() => { this.showDetail(item, index) }}
                                            >
                                                <View style={{ height: 49, flexDirection: 'row' }}>
                                                    <View style={{ flex: 1, justifyContent: 'center' }} >
                                                        <Text style={{ marginLeft: 50, color: Colors.grayTextColor, fontFamily: 'Prompt-Regular', fontSize: 12 }}
                                                        >{item.employee_name}
                                                        </Text>
                                                        <Text style={{ marginLeft: 50, color: Colors.grayTextColor, fontFamily: 'Prompt-Regular', fontSize: 10 }}
                                                        >{item.employee_position}
                                                        </Text>
                                                    </View>




                                                    {/* <Image

                                                        style={item.next_level === 'false' ? { height: 0, width: 0 } : { height: 40, width: 40 }}
                                                        source={item.expand === 0 ?
                                                            require('./../resource/images/Expand.png') :
                                                            require('./../resource/images/Collapse.png')}
                                                    // resizeMode='cover'
                                                    /> */}


                                                </View>
                                                <View style={{ height: 1, backgroundColor: 'lightgray', justifyContent: 'flex-end' }} />
                                            </TouchableOpacity>
                                        </View>

                                    ))
                                }
                            </ScrollView>
                        </View>
                    </View>
                </View>
                {this.renderloadingscreen()}
            </View >
        );
    }
}