import React, { Component } from 'react';

import {
    Text,
    ScrollView,
    View,
    TouchableOpacity,
    Image,
    FlatList,
    BackHandler,
    Alert
} from 'react-native';

import { styles } from "./../SharedObject/MainStyles"
import Colors from "./../SharedObject/Colors"
import SharedPreference from "./../SharedObject/SharedPreference"
const font_medium = 'Prompt-Medium';
import firebase from 'react-native-firebase';
import StringText from '../SharedObject/StringText';
import RestAPI from "../constants/RestAPI"
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"
export default class LeaveQuotaActivity extends Component {

    constructor(props) {
        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state = {
            stories: [],
            isFetching: false,
            dataSource: this.props.navigation.getParam("dataResponse", ""),
            selectYear: this.props.navigation.getParam("selectYear", new Date().getFullYear()),
        };
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_LEAVE_QUOTA_LIST)
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.settimerInAppNoti()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        clearTimeout(this.timer);
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

            this.onRegisterErrorAlertDialog(data)

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
                    SharedPreference.currentNavigator = SharedPreference.SCREEN_REGISTER
                }
            }],
            { cancelable: false }
        )
    }

    onRegisterErrorAlertDialog(data) {
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
    

    onBack() {
        this.props.navigation.navigate('HomeScreen');
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;
    }

    renderEmpty() {
        return (<View style={{
            height: 50, justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Text style={{ fontFamily: font_medium }}>No Result</Text>
        </View>)
    }

    leaveQuotaListview() {
        //console.log(" this.state.dataSource  : ", this.state.dataSource.code)
        if (this.state.dataSource.code != '200') {
            return (<View style={{
                height: 50, justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={{ fontFamily: font_medium }}>No Result</Text>
            </View>)
        }

        let dataArray = this.state.dataSource.data.years
        //console.log("dataArray : ", dataArray)
        let yearArray = []

        if (!dataArray) {
            this.renderEmpty()
        }

        if (dataArray.length == 0) {
            this.renderEmpty()
        }

        for (let index = 0; index < dataArray.length; index++) {
            const element = dataArray[index];
            if (element.year == this.state.selectYear) {
                yearArray = element.items
            }
        }

        // //console.log("yearArray : ", yearArray)

        if (yearArray.length == 0) {
            return (<View style={{
                height: 50, justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={{ fontFamily: font_medium }}>No Result</Text>
            </View>)

        }

        return (
            <ScrollView style={styles.leavequotaBackground}>
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={yearArray}
                    renderItem={({ item }) => (
                        <TouchableOpacity key={item.id} style={styles.button}
                            onPress={() => {
                                this.props.navigation.navigate('LeavequotaDetail', {
                                    item: item,
                                    dataResponse: this.state.dataSource,
                                    selectYear: this.state.selectYear
                                });
                            }}
                            keyExtractor={(item, index) => item + index}
                        >
                            <View style={styles.leavequotalistBackground}>
                                <View style={styles.leavequotaLine} />
                                <View style={styles.leavequotaContainer}>

                                    <View style={styles.leavequotaLeftContainer}>
                                        <Text numberOfLines={1} style={[styles.leavequotalisttextbold, { color: Colors.grayTextColor }]}>
                                            {item.leave_desc_en}
                                        </Text>
                                        <Text numberOfLines={1} style={[styles.leavequotalisttextbold, { color: Colors.lightgrayText }]}>
                                            {item.leave_desc_th}
                                        </Text>
                                    </View>

                                    <View style={styles.leavequotaListContainer} >
                                        <Text style={styles.leavequotalisttextred}>
                                            {item.used}
                                        </Text>
                                    </View>

                                    <View style={styles.leavequotaListContainer} >
                                        <Text style={styles.leavequotalisttextgreen}>
                                            {item.quota}
                                        </Text>
                                    </View>

                                    <View style={styles.leavequotaLastListContainer} >
                                        <Text style={styles.leavequotalisttextboldUnit}>
                                            {item.unit}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </ScrollView>
        )
    }

    onLastYear() {
        this.setState({
            selectYear: new Date().getFullYear() - 1
        })
    }

    onCurrentYear() {
        this.setState({
            selectYear: new Date().getFullYear()
        })
    }

    renderTabYearSelect() {
        let lastYear = new Date().getFullYear() - 1
        // //console.log("lastYear : ", lastYear)
        // if (this.state.dataSource.status != '200') {
        //     return (
        //         <View style={styles.selectYearContainer}>
        //             <View style={{ flex: 1, flexDirection: 'row' }}>
        //                 <TouchableOpacity
        //                     style={{ flex: 1 }} >
        //                     <View style={this.state.selectYear === (lastYear + 1) ? styles.nonpayrolltabBG_ena : styles.nonpayrolltabBG_dis}>
        //                         <Text style={this.state.selectYear === (lastYear + 1) ? styles.leaveYearButton_ena : styles.leaveYearButton_dis}>{lastYear + 1}</Text>
        //                     </View>
        //                 </TouchableOpacity>
        //             </View>
        //             <View style={{ flex: 2 }} />
        //         </View>)
        // }

        return (
            <View style={styles.selectYearContainer}>
                <View style={{ flex: 10, flexDirection: 'row' }}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={(this.onLastYear.bind(this))} >
                        <View style={this.state.selectYear === lastYear ? styles.nonpayrolltabBG_ena : styles.nonpayrolltabBG_dis}>
                            <Text style={this.state.selectYear === lastYear ? styles.leaveYearButton_ena : styles.leaveYearButton_dis}>{lastYear}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={(this.onCurrentYear.bind(this))} >
                        <View style={this.state.selectYear === (lastYear + 1) ? styles.nonpayrolltabBG_ena : styles.nonpayrolltabBG_dis}>
                            <Text style={this.state.selectYear === (lastYear + 1) ? styles.leaveYearButton_ena : styles.leaveYearButton_dis}>{lastYear + 1}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.leavequotaListContainer} >
                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.leavequotalisttextred}>Used</Text>
                </View>

                <View style={styles.leavequotaListContainer} >
                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.leavequotalisttextgreen}>Quota</Text>
                </View>
                <View style={{ flex: 2 }} />
            </View>)
    }


    render() {
        return (
            <View style={styles.container} >
                {/* <View style={styles.navContainer}>
                    <TouchableOpacity onPress={(this.onBack.bind(this))}>
                        <Image
                            source={require('./../resource/images/Back.png')}
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                    <Text style={styles.navTitleTextTop}>Leave Quota</Text>
                    <View style={styles.navRightContainer}>
                    </View>
                </View> */}

                <View style={styles.navContainer}>
                    <TouchableOpacity style={styles.navLeftContainer} onPress={(this.onBack.bind(this))}>
                        <Image
                            style={styles.navBackButton}
                            source={require('./../resource/images/Back.png')}
                        />
                    </TouchableOpacity>
                    <Text numberOfLines={1} style={styles.navTitleText}>Leave Quota</Text>
                    <View style={styles.navRightContainer}>
                    </View>
                </View>

                {/* Content */}

                <View style={styles.tabbarSelectYearContainer}>
                    {this.renderTabYearSelect()}
                </View>

                <View style={styles.nonPayRollMonthContainer}>
                    {this.leaveQuotaListview()}

                </View>
            </View >
        );
    }
}