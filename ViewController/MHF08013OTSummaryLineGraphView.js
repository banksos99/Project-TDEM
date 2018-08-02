import React, { Component } from 'react';

import {
    Text,
    View,
    TouchableOpacity,
    ListView,
    Image,
    BackHandler

} from 'react-native';

import Colors from "./../SharedObject/Colors"
import Layout from "./../SharedObject/Layout"
import { styles } from "./../SharedObject/MainStyles"
import LineChartAerage from "./LineChartAerage";
import firebase from 'react-native-firebase';
import SharedPreference from "./../SharedObject/SharedPreference"

let MONTH_LIST = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default class OTSummaryLineChart extends Component {

    constructor(props) {

        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

        let ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this.state = {
            isscreenloading: false,
            dataSource: ds,
            page: 1,
            data: [],
            fetching: false,
            refreshing: false,
            url: '',
            showincome: true,
            Heightincome: 0,
            heightdeduct: 0,
            incomeBG: Colors.greenTextColor,
            incomeText: 'white',
            deductBG: Colors.pink,
            deductText: Colors.lightred,
            bordercolor: Colors.greenTextColor,

            months: [],
            tdataSource: {},
            initialyear: 0,
            initialmonth: 0,

            dateselected: 0,
            org_name: this.props.navigation.getParam("org_name", "")

        }

        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));
        firebase.analytics().setCurrentScreen(SharedPreference.FUNCTIONID_OT_SUMMARY)
        console.log('org_name : ', this.state.org_name)

    }

    checkDataFormat(DataResponse) {

        if (DataResponse) {

            let today = new Date();
            date = today.getDate() + "/" + parseInt(today.getMonth() + 1) + "/" + today.getFullYear();
            this.state.initialyear = today.getFullYear();
            this.state.initialmonth = parseInt(today.getMonth() - 1);
            this.state.announcementTypetext = MONTH_LIST[this.state.initialmonth + 1] + ' ' + this.state.initialyear;
            for (let i = this.state.initialmonth + 13; i > this.state.initialmonth; i--) {

                if (i === 11) {

                    this.state.initialyear--;
                }
                this.state.months.push(MONTH_LIST[i % 12] + ' ' + this.state.initialyear)
            }

            this.state.tdataSource = DataResponse;
            console.log('tosummary data : ', this.state.tdataSource)

        }
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.onBack()
        return true;
    }

    onBack() {
        this.props.navigation.navigate('OrganizationOTStruct');
    }

    renderloadingscreen() {

        if (this.state.isscreenloading) {

            return (
                <View style={{ height: '100%', width: '100%', position: 'absolute', }}>
                    <View style={{ backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute', opacity: 0.7 }}>

                    </View>
                    {this.renderpickerview()}
                </View>
            )
        }

    }

    onLayout = event => {
        if (this.state.dimensions) return // layout was already called
        let { width, height } = event.nativeEvent.layout
        this.setState({ dimensions: { width, height } })
        console.log('dimensions :', width);

    }

    render() {
        // this.state.datasource.map((i, index) => (
        //     <Picker.Item key={index} label={i.label} value={i.value} />
        // ))
        // //console.log(this.state.tdataSource.data.detail.items)
        let step = Layout.window.width;
        let listData = [20, 100, 5, 150, 30, 190, 30, 30, 30, 30, 100, 30, 30];
        let max = 200;
        let shiftdown = 50
        let shiftRight = 70
        let p1 = max - listData[0] + shiftdown;
        let p2 = max - listData[1] + shiftdown;
        let p3 = max - listData[2] + shiftdown;
        let p4 = max - listData[3] + shiftdown;
        let p5 = max - listData[4] + shiftdown;
        let p6 = max - listData[5] + shiftdown;
        let p7 = max - listData[6] + shiftdown;
        let p8 = max - listData[7] + shiftdown;
        let p9 = max - listData[8] + shiftdown;
        let p10 = max - listData[9] + shiftdown;
        let p11 = max - listData[10] + shiftdown;
        let p12 = max - listData[11] + shiftdown;
        let p13 = max - listData[12] + shiftdown;
        let linecolor = Colors.redTextColor;

        let sampleData = [
            { x: '-01-01', y: 30 },
            { x: '-01-02', y: 180 },
            { x: '-01-03', y: 170 },
            { x: '-01-04', y: 150 },
            { x: '-01-05', y: 10 },
            { x: '-01-05', y: 10 },
            { x: '-01-05', y: 10 },
            { x: '-01-05', y: 10 },
            { x: '-01-05', y: 10 },
            { x: '-01-05', y: 10 },
            { x: '-01-05', y: 10 },
            { x: '-01-05', y: 10 },
            { x: '-01-05', y: 10 },
        ]

        let w = 20;
        let h = 200;
        let lwidth = w.toString();
        let lheight = h.toString();
        let s1 = '#symbol2'
        let s2 = '#symbol'
        let vbox = '0 0' + lwidth + lheight;
        let l1 = 100;

        let bottomlabel = 260;
        let rowhight = max / 6;

        return (
            // this.state.dataSource.map((item, index) => (
            <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }} >
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
                        <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.navTitleTextTop}>Overtime History</Text>
                        </View>
                        <View style={{ flex: 1, }}>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1 }}>

                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#555555', fontFamily: 'Prompt-Regular' }}>Total Overtime History</Text>
                    <Text style={{ color: '#555555', fontFamily: 'Prompt-Regular' }}>{this.state.tdataSource.org_name}</Text>
                </View>
                <View style={{ flex: 8, }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        {/* <View style={{ flex: 1 }} /> */}
                        <View style={{ flex: 5 }}>

                            <LineChartAerage
                                datalist={this.state.tdataSource.items}
                            />

                        </View>

                    </View>

                </View>

                {this.renderloadingscreen()}
            </View >
            // ))
        );
    }
}