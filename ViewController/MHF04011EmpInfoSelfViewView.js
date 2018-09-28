import React, { Component } from 'react';


import {
    Text,
    ScrollView,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    BackHandler,NetInfo,Alert
} from 'react-native';

import Colors from "./../SharedObject/Colors"
import Layout from "./../SharedObject/Layout"
import { styles } from "./../SharedObject/MainStyles"
// import AnnounceTable from "../../components/TableviewCell"
import PayslipDataDetail from "./../InAppData/Payslipdatadetail2"
import SharedPreference from "./../SharedObject/SharedPreference"
//import Decryptfun from "./../SharedObject/Decryptfun"
import Decryptfun from "./../SharedObject/DecryptID"
//import Dcryptfun from "./../SharedObject/Decryptfun"
import Months from "./../constants/Month"
import firebase from 'react-native-firebase';
import RestAPI from "../constants/RestAPI"
import StringText from '../SharedObject/StringText';
import LoginChangePinAPI from "./../constants/LoginChangePinAPI"

let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let martial = ['Single ', 'Married ', 'Widow ', 'Divorced ', 'No married ', 'Separated ', 'July ', 'Unknown'];
let currentmonth = new Date().getMonth();
let currentyear = new Date().getFullYear();
let careerpathlist = [];
let empinfodetail = [];
let scale = Layout.window.width / 320;

const tabbuttonColorEna = Colors.redTextColor;

const tabbuttonColorDis = Colors.DisableGray;


export default class EmpInfoDetail extends Component {

    constructor(props) {

        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

        this.state = {
            url: '',
            showincome: true,
            Heightincome: 0,
            heightdeduct: 0,
            profileTextColor: tabbuttonColorDis,
            careerTextColor: tabbuttonColorEna,
            bordercolor: Colors.greenTextColor,
            personalexpand: true,
            currentjobexpand: false,
            educationexpand: false,
            manager: this.props.navigation.getParam("manager", ""),
            previous: this.props.navigation.getParam("previous", ""),
        }
        if (this.state.manager) {
            title = 'Employee Info Manager View'
        } else {
            title = 'Employee Info'

        }

        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_EMPLOYEE_INFORMATION_SELF)


    }

    checkDataFormat(DataResponse) {
        console.log('DataResponse :', DataResponse)

        if (DataResponse) {

            if (DataResponse.career_paths) {

                careerpathlist = DataResponse.career_paths;
            }

            empinfodetail = DataResponse;
        }

    }

    componentDidMount() {
        this.settimerInAppNoti()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        // NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        
    }
    componentWillUnmount() {
        clearTimeout(this.timer);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        // NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);

    }
    // handleConnectivityChange = isConnected => {
    //     this.setState({ isConnected });
    // };
    handleBackButtonClick() {
        this.onBack()
        return true;
    }

    onBack() {

        if (this.state.previous == 1) {

            this.props.navigation.navigate('OrgStructure');

        } else if (this.state.previous == 2) {

            this.props.navigation.navigate('EmployeeList');

        } else {

            this.props.navigation.navigate('HomeScreen');
            SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;

        }

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

    onShowCareerPathView() {

        this.setState({
            showincome: true,
            profileTextColor: tabbuttonColorDis,
            careerTextColor: tabbuttonColorEna,
            bordercolor: Colors.greenTextColor,
        });
    }
    onShowProfileView() {

        this.setState({
            showincome: false,
            profileTextColor: tabbuttonColorEna,
            careerTextColor: tabbuttonColorDis,
            bordercolor: Colors.redTextColor,
        });
    }

    onExpandPersonal() {

        this.setState({
            personalexpand: !this.state.personalexpand
        });

    }
    onExpandCurrentJob() {

        this.setState({
            currentjobexpand: !this.state.currentjobexpand
        });

    }
    onExpandEducation() {

        this.setState({
            educationexpand: !this.state.educationexpand
        });

    }

    renderdetail() {

        if (this.state.showincome) {

            return (
                <View style={{ flex: 1 }}>

                    {this.renderprofile()}

                </View>

            )

        }
        return (
            <View style={{ flex: 1 }}>

                {this.rendercareerpath()}

            </View>

        )




        // <View style={{ flex: 5, justifyContent: 'center', alignItems: 'center',marginTop: 15, marginBottom: 15, borderRadius: 5, borderWidth: 1 }}>
        // <View style={{ flex: 1, marginTop: 15, marginBottom: 15, borderRadius: 5, borderWidth: 1, borderColor: this.state.bordercolor, flexDirection: 'column', }}>
        //     <Text style={styles.payslipDetailTextCenter}>No Result</Text>
        //     </View>
        // </View>
        // );

    }

    renderprofile() {
        return (
            <ScrollView style={{ flex: 1 }}>

                {this.renderProfilePersonal()}
                {this.renderCurrentJob()}
                {this.renderEducation()}

            </ScrollView>

        )
    }

    renderProfilePersonal() {

        return (
            <View >
                <View style={{ height: 40 }}>

                    <TouchableOpacity style={{ flex: 1, marginLeft: 10, marginRight: 10, marginTop: 5, marginBottom: 5, backgroundColor: Colors.DisableGray, flexDirection: 'row' }}
                        onPress={() => { this.onExpandPersonal() }}
                    >
                        <View style={{ justifyContent: 'center', flex: 20 }}>

                            <Text style={styles.empinfoTitleText} >PERSONAL</Text>

                        </View>
                        <View style={{ width: 30, alignItems: 'flex-end' }}>
                            <Image
                                style={{ height: 30, width: 30 }}
                                source={this.state.personalexpand === false ?
                                    require('./../resource/images/Expand.png') :
                                    require('./../resource/images/Collapse.png')}
                            // resizeMode='cover'
                            />
                        </View>
                    </TouchableOpacity>

                </View>
                {this.renderProfilePersonalDetail()}
            </View>
        )
    }

    renderProfilePersonalDetail() {

        let t = Decryptfun.decrypt(empinfodetail.personal_id);
        console.log('personal_id', empinfodetail.personal_id)
        console.log('Decryptfun ==>', t)
        let cardid = '-';
        let address = '-';
        if (empinfodetail.address) address = empinfodetail.address
        let birthdate = '_';
        if (empinfodetail.birth_date) birthdate = this.convertdate(empinfodetail.birth_date.split(' ')[0]);
        if (t) {
            //cardid = t
            cardid = t[0] + '-' + t[1] + t[2] + t[3] + t[4] + '-' + t[5] + t[6] + t[7] + t[8] + t[9] + '-' + t[10] + t[11] + '-' + t[12]

        }

        let mobileno = '-'
        if (empinfodetail.mobile_number) mobileno = empinfodetail.mobile_number;

        let employee_code = '-'
        if (empinfodetail.employee_code) employee_code = empinfodetail.employee_code;

        let full_name_th = '-'
        if (empinfodetail.full_name_th) full_name_th = empinfodetail.full_name_th;

        let marital_status = '-'
        if (empinfodetail.marital_status) marital_status = empinfodetail.marital_status;

        if (this.state.personalexpand) {

            return (

                <View style={{ flexDirection: 'column', marginLeft: 10, marginRight: 10 }}>
                    <View style={{ height: 30, justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Emp Code</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{employee_code}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{  justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText}>Name (Thai)</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{full_name_th}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{  justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={[styles.empinfoDetailRedText,{alignItems:'flex-start'}]}>Address</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{address}</Text>
                        </View>
                    </View>
                    {/* <View style={{ height: 30, justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'center' }}/>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{empinfodetail.address}</Text>
                        </View>
                    </View> */}
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{ height: 30, justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Birth Date</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{birthdate}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={this.state.manager ? { height: 0, justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' } :
                        { height: 30, justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>

                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >ID</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{cardid}</Text>
                        </View>
                    </View>
                    <View style={this.state.manager ?{ height: 0, justifyContent: 'center', backgroundColor:'transparent'  }:{ height: 1, justifyContent: 'center', backgroundColor:Colors.calendarLocationBoxColor }} />
                    <View style={{ height: 30, justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Maritial Status</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{marital_status}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{ height: 30, justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Mobile No.</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{mobileno}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                </View>
            );
        }
    }

    convertdate(date) {

        let adate = date.split('-')

        return adate[2] + ' ' + month[parseInt(adate[1]) - 1] + ' ' + adate[0]

    }

    renderCurrentJob() {
        return (
            <View >
                <View style={{ height: 40 }}>

                    <TouchableOpacity style={{ flex: 1, marginLeft: 10, marginRight: 10, marginTop: 5, marginBottom: 5, backgroundColor: Colors.DisableGray, flexDirection: 'row' }}
                        onPress={() => { this.onExpandCurrentJob() }}
                    >
                        <View style={{ justifyContent: 'center', flex: 20 }}>

                            <Text style={styles.empinfoTitleText} >CURRENT JOB</Text>

                        </View>
                        <View style={{ width: 30, alignItems: 'flex-end' }}>
                            <Image
                                style={{ height: 30, width: 30 }}
                                source={this.state.currentjobexpand === false ?
                                    require('./../resource/images/Expand.png') :
                                    require('./../resource/images/Collapse.png')}
                            // resizeMode='cover'
                            />
                        </View>
                    </TouchableOpacity>

                </View>
                {this.renderCurrentJobDetail()}
            </View>
        )
    }

    renderCurrentJobDetail() {

        let hiring_date = '-'
        let position = '-'
        let org_group = '-'
        let org_division = '-'
        let org_department = '-'
        let org_section = '-'
        let org_cost_center = '-'
        let company_location = '-'
        let date_in_dept = '-'
        let period_in_dept = '-'
        let date_in_position = '-'
        let period_in_position = '-'
        if (empinfodetail.career_paths) {
            let cc = empinfodetail.career_paths[0];
            if (cc.hiring_date) hiring_date = this.convertdate(cc.hiring_date);
            if (cc.position) position = cc.position
            if (cc.org_group) org_group = cc.org_group
            if (cc.org_division) org_division = cc.org_division
            if (cc.org_department) org_department = cc.org_department
            if (cc.org_section) org_section = cc.org_section
            if (cc.org_cost_center) org_cost_center = cc.org_cost_center
            if (cc.company_location) company_location = cc.company_location
            if (cc.date_in_dept) date_in_dept = this.convertdate(cc.date_in_dept)
            if (cc.period_in_dept) period_in_dept = cc.period_in_dept
            if (cc.date_in_position) date_in_position = this.convertdate(cc.date_in_position)
            if (cc.period_in_position) period_in_position = cc.period_in_position
        }

        if (this.state.currentjobexpand) {

            return (

                <View style={{ flexDirection: 'column', marginLeft: 10, marginRight: 10 }}>
                    <View style={{ justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Hirring</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{hiring_date}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{  justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Position</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{position}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{ justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Group</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{org_group}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{ justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Division</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{org_division}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{ justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Department</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{org_department}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{ justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Section</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{org_section}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{ justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Cost Center</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{org_cost_center}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{ justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Location</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{company_location}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{ justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Latest Section</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText1line}>{date_in_dept}</Text>
                            <Text style={styles.empinfoDetailText2line}>{'(' + period_in_dept + ')'}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{ justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Latest Position</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText1line}>{date_in_position}</Text>
                            <Text style={styles.empinfoDetailText2line}>{'(' + period_in_position + ')'}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                </View>
            );
        }
    }


    renderEducation() {
        return (
            <View >
                <View style={{ height: 40 }}>

                    <TouchableOpacity style={{ flex: 1, marginLeft: 10, marginRight: 10, marginTop: 5, marginBottom: 5, backgroundColor: Colors.DisableGray, flexDirection: 'row' }}
                        onPress={() => { this.onExpandEducation() }}
                    >
                        <View style={{ justifyContent: 'center', flex: 20 }}>

                            <Text style={styles.empinfoTitleText} >EDUCATION</Text>

                        </View>
                        <View style={{ width: 30, alignItems: 'flex-end' }}>
                            <Image
                                style={{ height: 30, width: 30 }}
                                source={this.state.educationexpand === false ?
                                    require('./../resource/images/Expand.png') :
                                    require('./../resource/images/Collapse.png')}
                            // resizeMode='cover'
                            />
                        </View>
                    </TouchableOpacity>

                </View>
                {this.renderEducationDetail()}
            </View>
        )
    }

    renderEducationDetail() {

        let jlpt = '-'
        let toeic = '-'
        let graduate = '-'
        let degree = '_'
        let gpa = '-'
        let major = '-'
        let school_university = '-'

        if (empinfodetail.education) {
            if (empinfodetail.education.jlpt) {
                jlpt = empinfodetail.education.jlpt
            }
            if (empinfodetail.education.toeic) {
                toeic = empinfodetail.education.toeic
            }
            
            if (empinfodetail.education.graduate_year)
                graduate = empinfodetail.education.graduate_year
            if (empinfodetail.education.degree)
                degree = empinfodetail.education.degree
            if (empinfodetail.education.gpa)
                gpa = empinfodetail.education.gpa
            if (empinfodetail.education.major)
                major = empinfodetail.education.major
            if (empinfodetail.education.school_university)
                school_university = empinfodetail.education.school_university
        }

        if (this.state.educationexpand) {

            return (

                <View style={{ flexDirection: 'column', marginLeft: 10, marginRight: 10 }}>
                    <View style={{  justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Graduate Year</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{graduate}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{  justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Degree</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{degree}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{  justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Place</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{school_university}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{  justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >Major</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{major}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{  justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >GPA</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{gpa}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{  justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText} >TOEIC</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{toeic}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                    <View style={{  justifyContent: 'center', backgroundColor: Colors.calendarGrayBackgroundColor, flexDirection: 'row' }}>
                        <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                            <Text style={styles.empinfoDetailRedText}>JLPT</Text>
                        </View>
                        <View style={{ flex: 3, justifyContent: 'center' }}>
                            <Text style={styles.empinfoDetailText}>{jlpt}</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, justifyContent: 'center', backgroundColor: Colors.calendarLocationBoxColor }} />
                </View>
            );
        }

    }
    rendercareerpath() {
        //console.log('careerpathlist :', careerpathlist)


        if (empinfodetail.career_paths) {

            return (
                <View style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ height: 10 }} />
                        <View style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ height: 40 * scale, width: 120 * scale, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.DisableGray }}>
                                <Text style={{ color: Colors.redTextColor, fontFamily: 'Prompt-Medium' }}> PRESENT</Text>
                            </View>
                        </View>

                        <View style={{ height: 10, alignItems: 'center', }}>

                            <View style={{ height: 10, width: 3, backgroundColor: Colors.redTextColor }} />

                        </View>
                        {
                            careerpathlist.map((item, index) => (
                                <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'column', }} key={index}>
                                    <View>
                                        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.DisableGray }} key={index}>
                                            <View style={{ flex: 1.3, justifyContent: 'center', }}>
                                                <Text adjustsFontSizeToFit={true} allowFontScaling={true} style={styles.empinfocareerLeftText}> {empinfodetail.career_paths[index].position}</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center', }}>
                                                <Text style={styles.empinfocareerRightText}>{empinfodetail.career_paths[index].action_type}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View>
                                        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.DisableGray }} key={index}>
                                            <View style={{ flex: 1, justifyContent: 'center', }}>
                                                <Text style={styles.empinfocareerLeftText}> {empinfodetail.career_paths[index].org_department}</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center', }}>
                                                <Text style={styles.empinfocareerRightText}>{}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View>
                                        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.DisableGray }} key={index}>
                                            <View style={{ flex: 1.5, justifyContent: 'center', }}>
                                                <Text style={styles.empinfocareerLeftText}> {empinfodetail.career_paths[index].org_section}</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center', }}>
                                                <Text style={styles.empinfocareerRightRedText}>{this.convertdate(empinfodetail.career_paths[index].hiring_date)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ height: 10, alignItems: 'center', }}>
                                        <View style={{ height: 10, width: 3, backgroundColor: Colors.redTextColor }}>

                                        </View>
                                    </View>
                                </View>

                            ))}
                        <View style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ height: 40 * scale, width: 120 * scale, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.DisableGray }}>
                                <Text style={{ color: Colors.redTextColor, fontFamily: 'Prompt-Medium' }}> HIRRING</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>

            )
        }
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

        let position = ''

        if (empinfodetail.career_paths) {

            position = empinfodetail.career_paths[0].position
        }

        return (
            <View style={{ flex: 1 }} >

                <View style={[styles.navContainer, { flexDirection: 'column' }]}>
                    <View style={styles.statusbarcontainer} />
                    <View style={{ height: 50, flexDirection: 'row', }}>
                        <View style={{ width: '100%', height: '100%', justifyContent: 'center', position: 'absolute' }}>
                            <Text style={styles.navTitleTextTop}>{title}</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', }}>
                            <TouchableOpacity onPress={(this.onBack.bind(this))}>
                                <Image
                                    style={{ width: 50, height: 50 }}
                                    source={require('./../resource/images/Back.png')}
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 4 }} />

                    </View>
                </View>

                <View style={{ flex: 1, backgroundColor: Colors.backgroundColor, flexDirection: 'column' }}>

                    <View style={{ flex: 3, flexDirection: 'row' }}>

                        <View style={{ flex: 0.3, backgroundColor: '#F20909' }} >
                        </View>
                        <View style={{ flex: 1, backgroundColor: Colors.navColor, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            {/* <Image

                                style={{ width: 50, height: 50, borderWidth: 2, borderRadius: 25, borderColor: Colors.backgroundcolor }}
                                source={require('./../resource/images/people.png')}
                            // resizeMode="contain"
                            /> */}
                        </View>
                        <View style={{ flex: 11, backgroundColor: Colors.navColor, flexDirection: 'column', }}>
                            <View style={{ flex: 0.5 }} />
                            <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10 }}>
                                <Text style={styles.empInfoLeftText}>{empinfodetail.full_name_en}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10 }}>
                                <Text style={styles.empInfopositionLeftText}>
                                    {position}
                                </Text>
                            </View>
                            <View style={{ flex: 0.5 }} />
                        </View>

                    </View>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={(this.onShowCareerPathView.bind(this))}>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this.state.careerTextColor }}>

                                    <Text style={{ color: this.state.profileTextColor, fontFamily: 'Prompt-Medium' }}>PROFILE</Text>
                                </View>

                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={(this.onShowProfileView.bind(this))}>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this.state.profileTextColor }}>
                                    <Text style={{ color: this.state.careerTextColor, fontFamily: 'Prompt-Medium' }}>CAREER PATH</Text>
                                </View>

                            </TouchableOpacity>
                        </View>

                    </View>
                    <View style={{ flex: 20 }}>
                        {this.renderdetail()}
                    </View>
                </View >
                {this.renderloadingscreen()}
            </View >
        );
    }
}