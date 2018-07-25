import React, { Component } from 'react';

import {
    Text,
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
    Button,
    TouchableOpacity,
    ListView,
    RefreshControl,
    Image, Picker, WebView,
    Platform,
    ActivityIndicator,
    Alert

} from 'react-native';

import Colors from "./../SharedObject/Colors"
import Layout from "./../SharedObject/Layout"
import { styles } from "./../SharedObject/MainStyles"
// import AnnounceTable from "../../components/TableviewCell"
import SharedPreference from "./../SharedObject/SharedPreference"
import RestAPI from "../constants/RestAPI"

//monthNames
let MONTH_LIST = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default class OTSummaryDetail extends Component {

    constructor(props) {

        super(props);

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
            headerdataSource: {},
            initialyear: 0,
            initialmonth: 0,

            dateselected: 0,


        }
        
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));

        // this.state.dataSource.map((item, i) => {

        //     this.state.arr.push(item)

        // });
        // //console.log(this.state.dataSource[0].data.header.total_ot_hr)

    }

    checkDataFormat(DataResponse) {
        
        if (DataResponse) {

            this.state.tdataSource = DataResponse.detail.items;
            this.state.headerdataSource = DataResponse.header
            console.log('tosummary data : ', this.state.tdataSource)
        }

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



        
    }

    componentWillMount() {
        // this._fetchMore(this.state.page);
    }

    _onRefresh() {
        if (this.state.refreshing) {
            return;
        }

        //console.log('refreshing');

        this.setState({ refreshing: true, page: 1 });
        let promise = this._fetchMore(1);
        if (!promise) {
            return;
        }

        promise.then(() => this.setState({ refreshing: false }));
    }
    
      _fetchMore(page) {
        if (this.state.fetching) {
          return;
        }
    
        this.setState({fetching: true});
    
        let promise = this._generateRows(page);
    
        promise.then((rows) => {
          var data;
          if (this.state.refreshing) {
            data = rows;
          } else {
            data = [...this.state.data, ...rows];
          }
    
          this.setState({
            page: page + 1,
            dataSource: this.state.dataSource.cloneWithRows(data),
            data: data,
            fetching: false
          });
        });
    
        return promise;
      }

    loadOTSummarySelffromAPI= async (omonth, oyear) =>{

       this.setState({
            loadingtype: 1,
            isscreenloading: false,
        })

        let tmonth = omonth.toString();
     

        if (omonth < 10) {
            tmonth = '0' + omonth
        }

        let today = new Date();

        let url = SharedPreference.OTSUMMARY_DETAIL + 'month=0' + tmonth + '&year=' + oyear

        // this.APICallback(await RestAPI(url), 'OTSummarySelfView')
        let data = await RestAPI(url,SharedPreference.FUNCTIONID_OT_SUMMARY)
        code = data[0]
        data = data[1]

        if ((code.SUCCESS == data.code) | (code.NODATA == data.code)) {
            this.props.navigation.navigate('OTSummarySelfView', {
                dataResponse: data.data,
            });
        } else {
            this.onLoadErrorAlertDialog(data)
        }




        // return fetch(('http://192.168.2.189:8080/api/v1/ot/summary?month=' + tmonth + '&year=' + oyear), {
        //     method: 'GET',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json',
        //         Authorization: 'Bearer Mi5IRjA1MDEuZTExZGI3YjllYTY0MjNkNDVmYTYyNmNkMzI1ZDhlN2U3NmI4Mzk0NTZhMGU5ODcxYzJiMzJiYzYyZWFlOWUzZGFiMDlhN2Y2M2I1OTE5MTkzZWYwNTYzYjAxODNiYjA2M2RhODAyN2Q5OTE3ZWNhOGExMTBlNTgzYmI3NTkzMmI=',
        //     },
        // })

        //     .then((response) => response.json())
        //     .then((responseJson) => {

        //         try {
        //             this.setState({

        //                 isscreenloading: false,
        //                 // tdataSource: responseJson.data,
        //                 tdataSource: responseJson.data.detail.items,
        //                 headerdataSource: responseJson.data.header

        //             }, function () {
        //                 console.log('tosummary data : ', this.state.tdataSource)
        //                 // this.state.tdataSource = responseJson;


        //             });

        //         } catch (error) {

        //             //console.log('erreo1 :', error);

        //         }
        //     })
        //     .catch((error) => {

        //         Alert.alert(
        //             'MHF00002ACRI',
        //             'System Error (API). Please contact system administrator.',
        //             [
        //                 { text: 'OK', onPress: () => console.log('OK Pressed') },
        //             ],
        //             { cancelable: false }
        //         )

        //         //console.log(error);

        //     });


    }

    onLoadErrorAlertDialog(error) {
        this.setState({
            isscreenloading: false,
        })

        if (this.state.isConnected) {
            Alert.alert(
                'MHF00001ACRI',
                'Cannot connect to server. Please contact system administrator.',
                [{
                    text: 'OK', onPress: () => console.log('OK Pressed')
                }],
                { cancelable: false }
            )
        } else {
            Alert.alert(
                'MHF00002ACRI',
                'System Error (API). Please contact system administrator.',
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


      _generateRows(page) {
        //console.log(`loading rows for page ${page}`);
    
        var rows = [];
        for (var i = 0; i < 100; i++) {
          rows.push('Hello ' + (i + ((page - 1)*100)));
        }
    
        let promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(rows);
            //console.log(`resolved for page ${page}`);
          }, 3);
        });
    
        return promise;
      }
    
      _renderRow() {
        return (
          <Text>fdfsfsfs</Text>
        );
      }

    onBack() {

        this.props.navigation.navigate('HomeScreen');
    }
    select_month(){

        this.setState({

            loadingtype: 0,
            isscreenloading: true,

        }, function () {

            this.setState(this.renderloadingscreen())
        });
    }
    select_announce_all_type = () =>{
        
        // //console.log('select_announce_all_type')

        this.setState({
    
            // announcementType: month,
            loadingtype: 1,
            isscreenloading: true,
            // isscreenloading: false,
 
        }, function () {

            let tdate = initannouncementType.split(' ')
            let mdate = 0;
            console.log('month : ', tdate[0])
            
            for (let i = 0; i < 12; i++) {
                if (MONTH_LIST[i] === tdate[0]) {
                    console.log('month : ', i)
                    mdate = i;
                }
            }
            console.log('year : ', tdate[1])
    
            this.setState(this.renderloadingscreen())

            this.loadOTSummarySelffromAPI(mdate+1,tdate[1])
        });
    
    }
    selected_month(monthselected){
        
         //console.log('monthselected : ',monthselected)

        this.setState({
    
            announcementTypetext: this.state.months[monthselected],
            loadingtype: 1,
            isscreenloading: true,
 
        }, function () {
    
            // this.setState(this.renderloadingscreen())

        });
    
    }
    renderpickerview() {

        // if (Platform.OS === 'android') {

        //     return (
        //         <View>
        //         </View>
        //     )

        // } else 
        if (this.state.loadingtype == 0) {

            if (Platform.OS === 'android') {
                //console.log('android selectmonth')
                return (
                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                        <View style={{ width: '80%', backgroundColor: 'white' }}>
                            <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                                <Text style={{ marginLeft: 20, marginTop: 10, textAlign: 'left', color: 'black', fontSize: 18, fontWeight: 'bold' }}>Select Month</Text>
                            </View>
                            <ScrollView style={{ height: '40%' }}>
                                {
                                    this.state.months.map((item, index) => (
                                        <TouchableOpacity style={styles.button}
                                            onPress={() => { this.selected_month(index) }}
                                            key={index + 100}>
                                            <View style={{ justifyContent: 'center', height: 40, alignItems: 'center', }} key={index + 200}>
                                                <Text style={{ textAlign: 'center', fontSize: 18, width: '100%', height: 30, alignItems: 'center' }}> {item}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                            </ScrollView>
                        </View>
                    </View>
                )

            }
            return (
                <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                    <View style={{ width: '80%', backgroundColor: 'white' }}>
                        <View style={{ height: 50, width: '100%', justifyContent: 'center', }}>
                            <Text style={{ marginLeft: 20, marginTop: 10, textAlign: 'left', color: 'black', fontSize: 18, fontWeight: 'bold' }}>Select Date</Text>
                        </View>
                        <Picker
                            selectedValue={this.state.announcementType}
                            onValueChange={(itemValue, itemIndex) => this.setState({
                                announcementType: itemValue,
                                announcementTypetext: this.state.months[itemIndex],
                            }, function () {

                                initannouncementType = itemValue;
                                initannouncementTypetext = itemValue;

                            })}>{
                                this.state.months.map((item, index) => (
                                    <Picker.Item label={item} value={item} key={index} />

                                ))}
                            {/* <Picker.Item label="All" value="All" />
                            <Picker.Item label="Company Announcement" value="Company Announcement" />
                            <Picker.Item label="Emergency Announcement" value="Emergency Announcement" />
                            <Picker.Item label="Event Announcement" value="Event Announcement" />
                            <Picker.Item label="General Announcement" value="General Announcement" /> */}
                        </Picker>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', height: 50, alignItems: 'center', }}>
                            <TouchableOpacity style={styles.button} onPress={(this.select_announce_all_type)}>
                                <Text style={{  textAlign: 'center', color: Colors.redTextColor, fontSize: 18, width: 80, height: 30, alignItems: 'center' }}> OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )

        }
        return (
            <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', }} >
                <ActivityIndicator />
            </View>
        )

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
    renderdetail() {
console.log('this.state.tdataSource',this.state.tdataSource)
        if (this.state.tdataSource.length) {
            return (
                <View style={{ flex: 16, backgroundColor: Colors.calendarLocationBoxColor, }}>
                    <ScrollView>
                        {
                            this.state.tdataSource.map((item, index) => (

                                <View key={item.id} style={{ height: 50 }} key={index + 500}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', }}>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>
                                            {parseInt(item.ot_date.split('-')[2])}
                                        </Text>
                                        <Text style={[styles.otsummarybody, { flex: 2, }]}>{item.time}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>{item.x15}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>{item.x20}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>{item.x30}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>{item.total_ot}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1 }]}>{item.meal_no}</Text>
                                        <Text style={[styles.otsummarybody, { flex: 1.5 }]}>{item.shift_allw}</Text>
                                    </View>
                                    <View style={{ height: 1, backgroundColor: Colors.lightGrayTextColor, }} />
                                </View>
                            ))
                        }

                    </ScrollView>
                </View>
            );
        }
        return (

            <View style={{flex: 16 , backgroundColor:'white',alignItems:'center'}} key={1000}>
                <Text style={styles.otsummarynoresulttext}> No result</Text>
            </View>

        )

   }
    render() {
        // this.state.datasource.map((i, index) => (
        //     <Picker.Item key={index} label={i.label} value={i.value} />
        // ))
        // //console.log(this.state.tdataSource.data.detail.items)
        let total_ot = 0;
        let ot_15 = 0;
        let ot_20 = 0;
        let ot_30 = 0;
        let ot_meals = 0;

        if (this.state.headerdataSource.total_ot_hr) {

            total_ot = this.state.headerdataSource.total_ot_hr;
        }
        if (this.state.headerdataSource.ot_hr) {

            ot_15 = this.state.headerdataSource.ot_hr.ot_x15;
        }
        if (this.state.headerdataSource.ot_hr) {
            ot_20 = this.state.headerdataSource.ot_hr.ot_x20;
        }
        if (this.state.headerdataSource.ot_hr) {
            ot_30 = this.state.headerdataSource.ot_hr.ot_x30;
        }
        if (this.state.headerdataSource.ot_meals) {
            ot_meals = this.state.headerdataSource.ot_meals;
        }

        return (
            // this.state.dataSource.map((item, index) => (
            <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }} >
                <View style={[styles.navContainer,{flexDirection: 'column' }]}>
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
                        <Text style={styles.navTitleTextTop}>Overtime Summary</Text>
                    </View>
                    <View style={{ flex: 1, }}>
                    </View>
                </View>
            </View>
                <View style={{ flex: 1, flexDirection: 'column', }}>

                    <TouchableOpacity style={{ flex: 2, backgroundColor: Colors.calendarLocationBoxColor, margin: 5, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}
                    onPress={(this.select_month.bind(this))}
                    >

                        <Text style={styles.otsummarydatetext}>{this.state.announcementTypetext}</Text>

                    </TouchableOpacity>

                    <View style={{ flex: 2 }}>
                        <View style={{ flex: 1, backgroundColor: Colors.lightblue, marginLeft: 15, marginRight: 15, marginTop: 2, marginBottom: 2, borderRadius: 5, flexDirection: 'row', }}>

                            <View style={{ flex: 2, justifyContent: 'center', marginLeft: 18 }}>
                                <Text style={styles.otsummaryheadertext}>Total OT Hour</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={styles.otsummaryheaderredtext}>{total_ot}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', marginRight: 18 }}>
                                <Text style={styles.otsummaryheadertext}>Hour(s)</Text>
                            </View>

                        </View>
                    </View>

                    <View style={{ flex: 6 }}>
                        <View style={{ flex: 1, flexDirection: 'row', marginLeft: 15, marginRight: 15 }}>

                            <View style={{ flex: 3, backgroundColor: Colors.burlywood, marginRight: 3, marginTop: 5, marginBottom: 5, borderRadius: 5 }}>

                                {/* <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10, position: 'absolute',alignItems: 'center', }}>
                                    <Text style={{ color: Colors.grayTextColor, fontSize: 18, fontWeight: 'bold', textAlign: 'left' }}>OT Hour</Text>
                                </View> */}

                                <View style={{ flex: 3, }}>
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        <View style={{ flex: 1, justifyContent: 'center',marginLeft: 15,  flexDirection: 'column' }}>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailboldtext}>OT Hour</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailtext}>X 1.5</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailredtext}>{ot_15}</Text>
                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                <Text style={styles.otsummarydetailtext}>Hour(s)</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center',marginLeft: 15,  flexDirection: 'column' }}>
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            {/* <Text style={{ color: Colors.grayTextColor, fontSize: 18, fontWeight: 'bold' }}>OT Hour</Text> */}
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <Text style={styles.otsummarydetailtext}>X 2.0</Text>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <Text style={styles.otsummarydetailredtext}>{ot_20}</Text>
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <Text style={styles.otsummarydetailtext}>Hour(s)</Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'center',marginLeft: 15,  flexDirection: 'column' }}>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        {/* <Text style={{ color: Colors.grayTextColor, fontSize: 18, fontWeight: 'bold' }}>OT Hour</Text> */}
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <Text style={styles.otsummarydetailtext}>X 3.0</Text>
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <Text style={styles.otsummarydetailredtext}>{ot_30}</Text>
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <Text style={styles.otsummarydetailtext}>Hour(s)</Text>
                                    </View>
                                </View>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flex: 1, backgroundColor: Colors.pink, marginLeft: 3, marginTop: 5, marginBottom: 5, borderRadius: 5, flexDirection: 'column' }}>
                                <View style={{ flex: 1, justifyContent: 'center',marginLeft: 5 }}>
                                    <Text style={styles.otsummarydetailboldtext}>OT Meals</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center',marginLeft: 5 }}>
                                    <Text style={styles.otsummarydetailtext}>No.</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center',marginLeft: 5 }}>
                                    <Text style={styles.otsummarydetailredtext}>{ot_meals}</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center',marginLeft: 5 }}>
                                    <Text style={styles.otsummarydetailtext}>Meal(s)</Text>
                                </View>

                            </View>
                        </View>
                    </View>

                    <View style={{ flex: 16, marginLeft: 5, marginRight: 5, marginTop: 2, marginBottom: 2 }}>

                        <View style={{ flex: 1, backgroundColor: Colors.lightred, borderRadius: 5 }}>
                            <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>Date</Text>
                                <Text style={[styles.otsummarybodytitle, { flex: 2 }]}>Shift</Text>
                                <View style={{ flex: 4, flexDirection: 'column', }}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}>
                                        <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>OT Hour</Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row',  alignItems: 'flex-start' }}>
                                        <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>X1.5</Text>
                                        <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>X2</Text>
                                        <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>X3</Text>
                                        <Text style={[styles.otsummarybodytitle, { flex: 1 }]}>Total</Text>
                                    </View>
                                </View>
                                <Text style={[styles.otsummarybodytitle,{ flex: 1 }]}>OT Meal No.</Text>
                                <Text style={[styles.otsummarybodytitle,{ flex: 1.5 }]}>Shift Allowance</Text>
                            </View>
                            {this.renderdetail()}

                        </View>

                    </View>

                </View>
                {this.renderloadingscreen()}
            </View >
            // ))
        );
    }
}