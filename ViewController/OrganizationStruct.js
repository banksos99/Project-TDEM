import React, { Component } from 'react';

import {
    Text,
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
    Button,
    TouchableOpacity,
    Image, Picker, WebView,
FlatList
} from 'react-native';

import Colors from "./../SharedObject/Colors"
import Layout from "./../SharedObject/Layout"
import { styles } from "./../SharedObject/MainStyles"

// import { MonoText } from '../../components/StyledText';
// import { RobotoBold } from '../../components/RobotoBold';

let dataSource = [];
let temphandbookData = [];

export default class OrganizationStruct extends Component {

    constructor(props) {
        super(props);
        this.state = {
            temparray:[],
        };
        this.checkDataFormat(this.props.navigation.getParam("DataResponse", ""));
    }
    checkDataFormat(DataResponse) {

        if(DataResponse){

            ////console.log(DataResponse[0].data)

            dataSource = DataResponse.data;

         

        }
    }


    componentDidMount() {
        ////console.log(Layout.window.width);
        // this.fetchData()
    }
    onBack() {
        this.props.navigation.navigate('HomeScreen');
        SharedPreference.currentNavigator = SharedPreference.SCREEN_MAIN;
    }
    onDetail() {
        this.props.navigation.navigate('HandbookDetail');
    }
    setrowstate() {

        this.setState({ leftside: false });
    }
    fetchData() {
        return fetch('https://randomuser.me/api/?results=5')
            .then((response) => response.json())
            .then((responseJson) => {

                this.setState({

                    isLoading: false,
                    dataSource: responseJson.results,
                    people:[]


                }, function () {

                    people = [];

                    // for (let i = 0; i < 2; i++) {

                    //     // ////console.log(this.state.dataSource[i].picture.large);

                    //     people.push({

                    //         cover1: this.state.dataSource[i].picture.large,
                    //         cover2: this.state.dataSource[(i * 2) + 1].picture.large,
                    //         name1: this.state.dataSource[i].name.first,
                    //         name2: this.state.dataSource[(i * 2) + 1].name.first,
                    //     });
                    // }
                    // ////console.log(people)

                        // tempannouncementData = [];

                        // const list = this.state.dataSource.map((item, i) => {

                        //     if (i%2) {
                        //         temp = [];

                        //         tempannouncementData.push(item)

                        //     }
                            

                        // });

                        // ////console.log(tempannouncementData)
                        tempannouncementData = [];
                        tempdata = [];
                        ////console.log( this.state.dataSource.length)

                        // for(){



                        // }
                      this.state.dataSource.map((item, i) =>{
                        
                        
                            tempdata.push(item)

                            if(i%2){
                                
                                tempannouncementData.push(tempdata)
                                tempdata = [];

                            }

                           

                        });
                        ////console.log(tempannouncementData)
                    }

                    

                );

            })
            .catch((error) => {
                console.error(error);
            });

    }

    createShelfHandbook() {

         temphandbookData = [];

        dataSource.map((item, i) => {

            this.state.temparray.push(

                this.createcomponent(i)

            )
            
            if (i % 2) {

                temphandbookData.push(

                    <View style={{ flex: 1, flexDirection: 'row' }}key={i}>
                        {this.state.temparray}
                    </View>

                )

                this.state.temparray = []

            } else if (i === dataSource.length - 1) {
                
                temphandbookData.push(

                    <View style={{ flex: 1, flexDirection: 'row' }}key={i+100}>
                        {this.state.temparray}
                    </View>

                )

                this.state.temparray = []

            }
        });
    }
    createcomponent(i) {

        return (
            <View style={styles.handbookItem} key={i}>
                <TouchableOpacity style={{ flex: 1 }}
                    onPress={(this.onDetail.bind(this))
                        
                    }>
                    <View style={{
                        flex: 5,
                    }}
                    >
                        <View style={{ flex: 1, margin: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                style={{ width: '100%', height: '100%' }}
                                // source={{ uri: dataSource[i].cover }}
                                source={{ uri: 'https://www.computeroutpost.com.au/thumbs/374.jpg' }}
                                
                                resizeMode='contain'
                            />
                        </View>
                    </View>
                <View style={{ flex: 2,justifyContent: 'center', alignItems: 'center', }}>
                <Text style={styles.payslipitemdetail}>{dataSource[i].handbook_title}</Text>
                </View>
                </TouchableOpacity>
            </View>
        )
    }
    render() {
        return (
            <View style={{flex: 1}} >
                
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
                            <Text style={styles.navTitleTextTop}>E-Book</Text>
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