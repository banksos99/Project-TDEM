import React, { Component } from "react";
import { View, Text, TouchableOpacity, Image, BackHandler,PanResponder } from "react-native";

import { styles } from "./../SharedObject/MainStyles"
import Colors from "./../SharedObject/Colors"
import SharedPreference from "./../SharedObject/SharedPreference"

import moment from 'moment'
import firebase from 'react-native-firebase';

const _format = 'ddd, D MMM hh:mm A'
const _formatAllday = 'ddd, D MMM'
let codelocation;

export default class calendarMonthView extends Component {
    panResponder = {};
    constructor(props) {
        super(props);

        this.panResponder = PanResponder.create({
            
            onStartShouldSetPanResponder: () => {
                SharedPreference.Sessiontimeout = 0
                return false
            },
            onStartShouldSetPanResponderCapture: () => {
   
                SharedPreference.Sessiontimeout = 0
  
                return false
            }
        })

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state = {
            type: this.props.navigation.getParam("type", ""),
            eventObject: this.props.navigation.getParam("eventObject", ""),
            monthObject: this.props.navigation.getParam("monthObject", ""),
            monthText: this.props.navigation.getParam("monthText", ""),
            dateTime: this.props.navigation.getParam("dateTime", ""),
            date: this.props.navigation.getParam("date", ""),
            dataResponse: this.props.navigation.getParam("dataResponse", ""),
            location: this.props.navigation.getParam("location", ""),

            showLocation: this.props.navigation.getParam("showLocation", ""),
            selectLocation: this.props.navigation.getParam("selectLocation", ""),


        }
        codelocation = this.props.navigation.getParam("codelocation", "")
        firebase.analytics().setCurrentScreen(SharedPreference.SCREEN_WORKING_CALENDAR_DETAIL)

    }

    onBackPrevious() {
        this.props.navigation.goBack();
        // this.props.navigation.navigate('calendarMonthView',
        //     {
        //         month: this.state.monthText,
        //         monthObject: this.state.monthObject,
        //         dataResponse: this.state.dataResponse,
        //         location: this.state.location,
        //         showLocation: this.state.showLocation,
        //         selectLocation: this.state.selectLocation,
        //         codelocation: codelocation,
        //     });
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigation.goBack();
        return true;
    }


    getAllday() {
        let eventObject = this.state.eventObject

        if (eventObject[0].all_day == 'N') {
            return (<View style={styles.calendarEventContainer}>
                <View style={styles.calendarEventViewContainer}>
                    <View style={{ width: '40%', paddingLeft: 10 }}>
                        <Text style={styles.calendarEventTimeText}>Start</Text>
                    </View>
                    <View style={{ width: '60%' , }}>
                        <Text style={styles.calendarEventTimeDetialText}>{moment(eventObject[0].time_start).format(_format)}</Text>
                    </View>
                </View>
                <View style={styles.calendarEventViewContainer}>
                    <View style={{ width: '40%', paddingLeft: 10 }}>
                        <Text style={styles.calendarEventTimeText}>End</Text>
                    </View>
                    <View style={{ width: '60%',  }}>
                        <Text style={styles.calendarEventTimeDetialText}>{moment(eventObject[0].time_end).format(_format)}
                        </Text>
                    </View>
                </View>
            </View>)
        } else {
            return (<View style={styles.calendarEventContainer}>
                <View style={styles.calendarEventViewContainer}>
                    <View style={{ width: '40%' }}>
                        <Text style={styles.calendarEventTimeText}>All Day</Text>
                    </View>
                    <View style={{ width: '60%', }}>
                        <Text style={styles.calendarEventTimeAlldayDetialText}>{moment(this.state.date).format(_formatAllday)}</Text>
                    </View>
                </View>
            </View>)
        }
    }

    render() {
        let eventObject = this.state.eventObject
        if (eventObject == 'undefined' || eventObject == null) {
            return (<View style={styles.calendarEventItemLeftView}
                collapsable={true}
                {...this.panResponder.panHandlers}
            >
                <Text >No Data</Text>
            </View>)
        } else {
            return (
                <View style={styles.container} key={1}
                    collapsable={true}
                    {...this.panResponder.panHandlers}
                >
                    <View style={styles.navContainer}>
                        <TouchableOpacity style={styles.navLeftContainer} onPress={(this.onBackPrevious.bind(this))}>
                            <Image
                                style={styles.navBackButton}
                                source={require('../resource/images/Back.png')}
                            />
                        </TouchableOpacity>
                        <Text style={styles.navTitleText}>Event Detail</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <View style={styles.calendarEventDetailView}>
                            <Image
                                style={styles.calendarEventDetailIcon}
                                source={require('../resource/images/calendar/calendar_event.png')}
                            />
                            <Text style={styles.calendarEventHeaderText}>{eventObject[0].title}</Text>
                        </View>
                        <View style={styles.calendarEventDetailView}>
                            <Image
                                style={styles.calendarEventDetailIcon}
                                source={require('../resource/images/calendar/calendar_sticky-note.png')}
                            />
                            <Text style={[styles.calendarEventText, { color: Colors.lightGrayTextColor }]}>
                                {eventObject[0].description}
                            </Text>
                        </View>

                        <View style={styles.calendarEventDetailView}>
                            <Image
                                style={styles.calendarEventDetailIcon}
                                source={require('../resource/images/calendar/calendar_clock.png')}
                            />
                            {this.getAllday()}
                        </View>
                        <View style={styles.calendarEventDetailView}>
                            <Image
                                style={styles.calendarEventDetailIcon}
                                source={require('../resource/images/calendar/calendar_location.png')}
                            />
                            <Text style={[styles.calendarEventHeaderText, { color: 'black' }]}>{this.state.showLocation}</Text>

                        </View>
                    </View>
                </View>
            );
        }
    }
}