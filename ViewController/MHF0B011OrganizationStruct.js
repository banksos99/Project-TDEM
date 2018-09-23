import React, { Component } from 'react';

import {
    Text,
    ScrollView,
    View,
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
import StringText from '../SharedObject/StringText';
import SaveProfile from "../constants/SaveProfile"
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
let dataSource = [];
let option = 0;
let org_code = '';
let beginlebel = 0;
export default class OrganizationStruct extends Component {

    constructor(props) {
        super(props);

        this.state = {
            // isConnected: true,
            isscreenloading:false,
        }

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.checkoption(this.props.navigation.getParam("Option", ""));
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));

        
    }

    checkoption(data) {
        if (data) {
            option = data
        }
        //console.log('option :', option)
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        // NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    }

    componentDidMount() {
        this.settimerInAppNoti()
       
    }

    componentWillUnmount() {
        
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        clearTimeout(this.timer);
        // NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }
    // handleConnectivityChange = isConnected => {
    //     this.setState({ isConnected });
    // };
    
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
        
        // if (!SharedPreference.lastdatetimeinterval) {
        //     let today = new Date()
        //     const _format = 'YYYY-MM-DD hh:mm:ss'
        //     const newdate = moment(today).format(_format).valueOf();
        //     SharedPreference.lastdatetimeinterval = newdate
        // }

        // this.APIInAppCallback(await RestAPI(SharedPreference.PULL_NOTIFICATION_API + SharedPreference.lastdatetimeinterval,1))
        this.APIInAppCallback(await LoginChangePinAPI('1111', '2222', SharedPreference.FUNCTIONID_PIN))
    }

    APIInAppCallback(data) {
        
        code = data[0]
        data = data[1]

        if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else if (code.SUCCESS == data.code) {

            this.timer = setTimeout(() => {
                this.onLoadInAppNoti()
            }, SharedPreference.timeinterval);

        }else{

            this.timer = setTimeout(() => {
                this.onLoadInAppNoti()
            }, SharedPreference.timeinterval);
        }

    }

    onAutenticateErrorAlertDialog() {

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
                   // SharedPreference.profileObject = null
                    this.setState({
                        isscreenloading: false
                    })
                    this.props.navigation.navigate('RegisterScreen')
                    SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                }
            }],
            { cancelable: false }
        )
    }

    onRegisterErrorAlertDialog() {

        SharedPreference.userRegisted=false;
        timerstatus = false;
        this.setState({
            isscreenloading: false,
        })

        Alert.alert(
            StringText.ALERT_SESSION_AUTHORIZED_TITILE,
            StringText.ALERT_SESSION_AUTHORIZED_DESC,
            [{
                text: 'OK', onPress: () => {

                    page = 0
                    SharedPreference.Handbook = []
                    SharedPreference.profileObject = null
                    this.setState({
                        isscreenloading: false
                    })
                    this.props.navigation.navigate('RegisterScreen')
                    SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                }
            }],
            { cancelable: false }
        )
    }
    checkDataFormat(DataResponse) {
        if (DataResponse) {
            console.log('data.data.org_lst2 :', DataResponse)
            dataSource = [];
            ////console.log(DataResponse[0].data)
            // dataSource = DataResponse.org_lst;
            org_code = DataResponse.org_code
            //console.log('org_code :', org_code)
            //console.log('DataResponse :', DataResponse)
            for (let i = 0 ; i < DataResponse.length;i++) {
                beginlebel = parseInt(DataResponse[0].org_level) - 10;
                dataSource.push({
                    org_code: DataResponse[i].org_code,
                    org_name: DataResponse[i].org_name,
                    org_level: DataResponse[i].org_level,
                    next_level: 'true',
                    expand: 0,
                })
            }



            // DataResponse.org_emp.map((item) => (

            //     dataSource.push({

            //         org_code:0,
            //         org_name:item.employee_name,
            //         org_level:20,
            //         next_level:'false',
            //         emp_id:item.employee_id,
            //         position:item.employee_position,
            //         expand:0,
            //         }

            //     )))
            // DataResponse.org_lst.map((item) => (
            // dataSource.push({
            //     org_code:item.org_code,
            //     org_name:item.org_name,
            //     org_level:item.org_level,
            //     next_level:item.next_level,
            //     expand:0,
            //     }

            //     )))

            /*let temparr = [];
            for(let i=0 ; i<dataSource.length;i++){
                if (dataSource[i].emp_id ==  ) {
                    temparr.push({

                    
                    })
                }
                

            }*/



            //console.log('dataSource :', dataSource)
        } else {

            //console.log('orgdata : ', orgdata)

        }
    }

    // componentDidMount() {
        ////console.log(Layout.window.width);
        // this.fetchData()
    // }

    onBack() {
        this.props.navigation.navigate('HomeScreen');
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;
    }

    onClickOrgStruct(item, index) {
        
        console.log('org_code :', item.org_code)
        console.log('org_name :', item.org_name)

        if (item.org_name === 'N/A') {

            Alert.alert(
                'No Data',
                'No data found',
                [{
                    text: 'OK', onPress: () => {
                        //console.log("onLoadErrorAlertDialog")
                    }
                }],
                { cancelable: false }
            )

        } else if (parseInt(item.org_code) == 0) {

            // *** select emp info detail
            this.setState({

                isscreenloading: true,
                loadingtype: 3,
                org_code: item.emp_id,
                employee_name: item.org_name,
                employee_position: item.position

            }, function () {
                this.loadOrgStructureDetailAPI(item.org_code)
            });

        } else {
            
            console.log('item => :', item)
            console.log('level => :', item.org_level)
         if (parseInt(item.org_level) === 40){




            // *** select employee list

            this.setState({

                isscreenloading: true,
                loadingtype: 3,
                org_code: item.org_code,

            }, function () {

                let url = SharedPreference.ORGANIZ_STRUCTURE_API + this.state.org_code


 
             this.loadEmployeeListAPI(item.org_code)
            });

        }else  {

                if (item.expand === 0) {
                    // *** select expand
                    // console.log('expand :', item.expand)
                    this.setState({

                        isscreenloading: true,
                        loadingtype: 3,
                        org_code: item.org_code,
                        index_org_code: index
        
                    }, function () {
                        this.loadOrgStructureAPI(item.org_code)
                    });

                } else {
                    // *** select collapse   

                    this.setState({

                        isscreenloading: true,
                        loadingtype: 3,
                        org_code: item.org_code,
                        index_org_code: index

                    });
                    let temparr = []
                    let statuscol = 1;

                    for (let i = 0; i < dataSource.length; i++) {

                        if (statuscol == 0) {

                            if (dataSource[i].org_level <= item.org_level) {

                                statuscol = 1;

                            }

                        } if (statuscol == 1) {

                            if (dataSource[i].org_code === item.org_code) {
                                temparr.push({
                                    org_code: dataSource[i].org_code,
                                    org_name: dataSource[i].org_name,
                                    org_level: dataSource[i].org_level,
                                    next_level: dataSource[i].next_level,
                                    expand: 0

                                })
                                statuscol = 0;

                            } else {

                                temparr.push(
                                    dataSource[i]
                                )

                            }

                        }
                    }



                    //     if (statuscol == 0) {

                    //         if (parseInt(item.org_level) >= parseInt(dataSource[i].org_level)) {

                    //             statuscol = 1;
                    //         }
                    //     }

                    //     if (i === index) {
                    //         statuscol = 0;
                    //         //  org_level =  dataSource[i].org_level;
                    //         temparr.push({
                    //             org_code: dataSource[i].org_code,
                    //             org_name: dataSource[i].org_name,
                    //             org_level: dataSource[i].org_level,
                    //             next_level: dataSource[i].next_level,
                    //             expand: 0

                    //         })

                    //         i = i + dataSource[i].expand;

                    //     } else if (statuscol == 0) {

                    //     } else {

                    //         temparr.push(
                    //             dataSource[i]
                    //         )

                    //     }

                    // }
                    dataSource = temparr;

                    this.setState({
                        isscreenloading: false,
                    })
                }
            }
        }
    }


    loadOrgStructureAPI = async (org_code) => {

        if (SharedPreference.isConnected) {
            
                let url = SharedPreference.ORGANIZ_STRUCTURE_API + org_code
                this.APICallback(await RestAPI(url, SharedPreference.FUNCTIONID_ORGANIZ_STRUCTURE))
            
        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{
                    text: 'OK', onPress: () => {

                        this.setState({
                            isscreenloading: false,
                        })

                    }
                },
                ], { cancelable: false }

            )

        }

    }

    APICallback(data) {

        code = data[0]
        data = data[1]
        // console.log('APICallback data :', data)
        if (code.SUCCESS == data.code) {
            console.log('APICallback :', data.data)
            // console.log('dataSource :', dataSource.length)
            // console.log('index_org_code :', this.state.index_org_code)
            // if (data.data.org_lst) {

            // if (data.data.org_lst) {

                let temparr = []

                for (let i = 0; i < dataSource.length; i++) {

                    if (i === this.state.index_org_code) {
                        temparr.push({
                            org_code: dataSource[i].org_code,
                            org_name: dataSource[i].org_name,
                            org_level: dataSource[i].org_level,
                            next_level: dataSource[i].next_level,
                           // expand: data.data.org_lst.length,

                        })

                        for (let j = 0; j < data.data.length; j++) {

                            if (data.data[j].org_emp) {
                                data.data[j].org_emp.map((item) => (
                                    temparr.push(
                                        {
                                            org_code: 0,
                                            org_name: item.employee_name,
                                            org_level: parseInt(dataSource[i].org_level) + 10,
                                            next_level: 'false',
                                            emp_id: item.employee_id,
                                            position: item.employee_position,
                                            expand: 0,

                                        }
                                    )
                                ))
                            }
                            if (data.data[j].org_lst) {

                                for (let i = 0; i < data.data[j].org_lst.length; i++) {

                                    let Orgname = data.data[j].org_lst[i].org_name;
                                    let Orglevel = data.data[j].org_lst[i].org_level;
                                    console.log('org_code => :', data.data[j].org_lst[i].org_code)
                                    if (!data.data[j].org_lst[i].org_code) {
                                        console.log('data null')
                                        Orgname = 'N/A'
                                        Orglevel = parseInt(dataSource[i].org_level) + 10;
                                    }

                                    temparr.push({
                                        org_code: data.data[j].org_lst[i].org_code,
                                        org_name: Orgname,
                                        org_level: Orglevel,
                                        next_level: data.data[j].org_lst[i].next_level,
                                        expand: 0

                                    })

                                }
                                // data.data[j].org_lst.map((item) => (

                                //     temparr.push(
                                //         {
                                //             org_code: item.org_code,
                                //             org_name: item.org_name,
                                //             org_level: item.org_level,
                                //             next_level: item.next_level,
                                //             expand: 0

                                //         }
                                //     )

                                // ))
                            }

                        }


                    }else{

                        temparr.push(
                            dataSource[i]
                        )


                    }
                    //     for (let j = 0; j < data.data.length; j++) {
                    //         //expand org
                    //         if (data.data[j].org_emp) {
                    //             data.data[j].org_emp.map((item) => (
                    //                 temparr.push(
                    //                     {
                    //                         org_code: 0,
                    //                         org_name: item.employee_name,
                    //                         org_level: parseInt(dataSource[i].org_level) + 10,
                    //                         next_level: 'false',
                    //                         emp_id: item.employee_id,
                    //                         position: item.employee_position,
                    //                         expand: 0,

                    //                     }
                    //                 )

                    //             ))
                    //         }

                    //         if (data.data[j].org_lst) {
                    //             data.data[j].org_lst.map((item) => (
                    //                 temparr.push(
                    //                     {
                    //                         org_code: item.org_code,
                    //                         org_name: item.org_name,
                    //                         org_level: item.org_level,
                    //                         next_level: item.next_level,
                    //                         expand: 0

                    //                     }
                    //                 )

                    //             ))
                    //         }
                    //     }

                    // } else {
                    //     temparr.push(
                    //         dataSource[i]
                    //     )

                    // }

                }
                dataSource = temparr;
                // console.log('dataSource :', dataSource)

            // } else {

            //     this.props.navigation.navigate('EmployeeList', {
            //         DataResponse: data,
            //         Option: option
            //     });

            //     this.setState({ isscreenloading: false })
            // }

            // } else {
            //     Alert.alert(
            //         'No Data',
            //         'No data found',
            //         [{
            //             text: 'OK', onPress: () => {
            //                 //console.log("onLoadErrorAlertDialog")
            //             }
            //         }],
            //         { cancelable: false }
            //     )


            // }
        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else {

            this.onLoadErrorAlertDialog(data)
        }

        this.setState({
            isscreenloading: false,
        })
    }

    loadEmployeeListAPI = async () => {

        if (SharedPreference.isConnected) {

            let url = SharedPreference.ORGANIZ_STRUCTURE_API + this.state.org_code
            this.APIEmpCallback(await RestAPI(url, SharedPreference.FUNCTIONID_ORGANIZ_STRUCTURE))


        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{
                    text: 'OK', onPress: () => {
                        this.setState({
                            isscreenloading: false,
                        })

                    }
                },
                ], { cancelable: false }

            )
        }
    }

    loadOrgStructureDetailAPI = async () => {

        if (SharedPreference.isConnected) {

            let url = SharedPreference.EMP_INFO_MANAGER_API + this.state.org_code
            if (option == 2) {
                let today = new Date();
                url = SharedPreference.CLOCK_IN_OUT_MANAGER_API + this.state.org_code + '&month=0' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()
                if (parseInt(today.getMonth() + 1) > 9) {
                    url = SharedPreference.CLOCK_IN_OUT_MANAGER_API + this.state.org_code + '&month=' + parseInt(today.getMonth() + 1) + '&year=' + today.getFullYear()

                }
            }
            this.APIDetailCallback(await RestAPI(url, SharedPreference.FUNCTIONID_ORGANIZ_STRUCTURE))

        } else {

            Alert.alert(
                StringText.ALERT_CANNOT_CONNECT_NETWORK_TITLE,
                StringText.ALERT_CANNOT_CONNECT_NETWORK_DESC,
                [{ text: 'OK', onPress: () => { 
                    this.setState({
                        isscreenloading: false,
                    })

                } },
                ], { cancelable: false }

            )
        }
    }

    APIEmpCallback(data) {

        console.log('APIEmpCallback')
        code = data[0]
        data = data[1]
        if (code.SUCCESS == data.code) {
            this.props.navigation.navigate('EmployeeList', {
                DataResponse: data,
                Option: option
            });
        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else {
            this.onLoadErrorAlertDialog(data)
        }
        this.setState({

            isscreenloading: false,

        })

    }

    APIDetailCallback(data) {
        code = data[0]
        data = data[1]
        console.log('org data',data)
        if (code.SUCCESS == data.code) {
            if (option == 2) {
                this.props.navigation.navigate('ClockInOutSelfView', {
                    DataResponse: data,
                    manager: 1,
                    previous: 1,
                    employee_name: this.state.employee_name,
                    employee_position: this.state.employee_position,
                    Option: option
                });

            } else if (option == 1) {

                this.props.navigation.navigate('EmployeeInfoDetail', {
                    DataResponse: data.data,
                    manager: 1,
                    previous: 1,
                    Option: option
                });
            }
        } else if (code.INVALID_AUTH_TOKEN == data.code) {

            this.onAutenticateErrorAlertDialog()

        } else if (code.DOES_NOT_EXISTS == data.code) {

            this.onRegisterErrorAlertDialog()

        } else {
            this.onLoadErrorAlertDialog(data)
        }

        this.setState({

            isscreenloading: false,

        })

    }

    // onAutenticateErrorAlertDialog() {

    //     timerstatus = false;
    //     this.setState({
    //         isscreenloading: false,
    //     })

    //     Alert.alert(
    //         StringText.ALERT_AUTHORLIZE_ERROR_TITLE,
    //         StringText.ALERT_AUTHORLIZE_ERROR_MESSAGE,
    //         [{
    //             text: 'OK', onPress: () => {
    //                 page = 0
    //                 timerstatus = false
    //                 SharedPreference.Handbook = []
    //                 SharedPreference.profileObject = null
    //                // this.saveProfile.setProfile(null)
    //                 this.props.navigation.navigate('RegisterScreen')
    //             }
    //         }],
    //         { cancelable: false }
    //     )

    //     //console.log("error : ", error)
    // }

    onLoadErrorAlertDialog(error, resource) {

        this.setState({
            isscreenloading: false,
        })
        Alert.alert(
            error.data[0].code,
            error.data[0].detail, [{ text: 'OK', onPress: () => { } }],
            { cancelable: false }
        )

    }

    // onLoadErrorAlertDialog(error) {
    //     this.setState({
    //         isscreenloading: false,
    //     })
    //     if (this.state.isConnected) {
    //         Alert.alert(
    //             'MHF00001ACRI',
    //             'Cannot connect to server. Please contact system administrator.',
    //             [{
    //                 text: 'OK', onPress: () => //console.log('OK Pressed')
    //             }],
    //             { cancelable: false }
    //         )
    //     } else if (error.code == 404) {

    //         Alert.alert(
    //             'MSTD0059AERR',
    //             'No data found',
    //             [{
    //                 text: 'OK', onPress: () => {
    //                     //console.log("onLoadErrorAlertDialog")
    //                 }
    //             }],
    //             { cancelable: false }
    //         )

    //     } else {
    //         Alert.alert(
    //             'MHF00002ACRI',
    //             'System Error (API). Please contact system administrator.',
    //             [{
    //                 text: 'OK', onPress: () => {
    //                     //console.log("onLoadErrorAlertDialog")
    //                 }
    //             }],
    //             { cancelable: false }
    //         )
    //     }
    //     //console.log("error : ", error)
    // }


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
                            <View style={{ width: '100%', justifyContent: 'center', position: 'absolute', }}>
                                <Text style={styles.navTitleTextTop}>Organization Structure</Text>
                            </View>
                            <TouchableOpacity
                                onPress={(this.onBack.bind(this))}>
                                <Image
                                    style={{ width: 50, height: 50 }}
                                    source={require('./../resource/images/Back.png')}
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>

                        {/* <View style={{ flex: 1, }}>
                        </View> */}
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, flexDirection: 'column', }}>
                        {/* <View style={{ flex: 1 }}> </View> */}
                        <View style={{ flex: 10 }}>
                            <ScrollView>
                                {
                                    dataSource.map((item, index) => (
                                        <View style={{ height: 50 }} key={'m' + index}>
                                            <TouchableOpacity
                                                onPress={() => { this.onClickOrgStruct(item, index) }}
                                            >
                                                <View style={{ height: 49, flexDirection: 'row' }}>
                                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                                        <View style={{ flex: 1, justifyContent: 'center' }} >
                                                            <Text style={item.expand === 0 ?
                                                                { marginLeft: (parseInt(item.org_level - beginlebel)) * 2, color: Colors.grayTextColor, fontFamily: 'Prompt-Regular' } :
                                                                { marginLeft: (parseInt(item.org_level - beginlebel)) * 2, color: Colors.redTextColor, fontFamily: 'Prompt-Regular' }}>
                                                                {/* {item.org_name + ' ('+item.org_level+')'} */}
                                                                {item.org_name}
                                                            </Text>
                                                        </View>
                                                        <View style={item.org_code === 0 ? { height: 20, justifyContent: 'center' } : { height: 0, justifyContent: 'center' }} >
                                                            <Text style={{ marginLeft: (parseInt(item.org_level - beginlebel)) * 2, color: Colors.grayTextColor, fontFamily: 'Prompt-Regular', fontSize: 10 }}
                                                            >{item.position}</Text>
                                                        </View>
                                                    </View>
                                                    <Image

                                                        style={item.next_level === 'false' ? { height: 0, width: 0 } : { height: 40, width: 40 }}
                                                        source={item.expand === 0 ?
                                                            require('./../resource/images/Expand.png') :
                                                            require('./../resource/images/Collapse.png')}
                                                    // resizeMode='cover'
                                                    />


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