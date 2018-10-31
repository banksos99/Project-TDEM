import React, { Component } from "react";
import { View, Image, TouchableOpacity, Alert } from "react-native";

import { styles } from "./../SharedObject/MainStyles";
import Colors from "./../SharedObject/Colors"
import StringText from './../SharedObject/StringText'
import Svg, {
    Circle,
    Ellipse,
    G,
    LinearGradient,
    RadialGradient,
    Line,
    Path,
    Polygon,
    Polyline,
    Rect,
    Text,
    Symbol,
    Use,
    Defs,
    Stop
} from 'react-native-svg';

import Layout from "./../SharedObject/Layout"

let scale = Layout.window.width / 375;

export default class PinActivity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pintitle: 'Enter your PIN',
            pin: '',
            failPin: 0
        }
    }

    render() {
   
        let w = 20;
        let h = 200;
        let shiftRight = 70 * scale
        let shiftTop = 70 * scale
        let rowhight = 260 / 11 * scale;
        let bottomlabel = 20 * scale;
        let width = 375 * scale;
        let height = 140 * scale;
        // let listData = [6, 30, 20, 40];

        let previousmax = this.props.datalist.previous_month.maxIndividual;
        if (previousmax == 0) {
            previousmax = '0';
        }
        let currencemax = this.props.datalist.request_month.maxIndividual;
        if (currencemax == 0) {
            currencemax = '0';
        }
        let previouemin = this.props.datalist.previous_month.minIndividual;
        if (previouemin == 0) {
            previouemin = '0';
        }
        let currencemin = this.props.datalist.request_month.minIndividual;
        if (currencemin == 0) {
            currencemin = '0';
        }
        let listdata = [previousmax, currencemax, previouemin, currencemin]

        let max = 0;

        for (let i = 0; i < listdata.length; i++) {
            if (listdata[i] > max) {
                max = listdata[i]
            }
        }
        //console.log('max :', max)
        let ratio = 50 / max
        if(max == 0){
           ratio = 1
        }

        console.log('ratio :', ratio)
        let intratio = Math.ceil(ratio)
        let fonrsize = 12 * scale
        let barhight = 20 * scale;
        let bartop = 80 * scale;
        let gap1 = 5 * scale;
        let gap2 = 20 * scale;

        return (
            <Svg height="300" width={width}>
                <Text x={Layout.window.width / 2} y='20' fill='#555555' fontSize="15" textAnchor="middle" fontFamily='Prompt-Regular'>Overtime Individual</Text>
                <Text x={Layout.window.width / 2} y='40' fill='#555555' fontSize="15" textAnchor="middle" fontFamily='Prompt-Regular'>{this.props.org_name}</Text>

                <Line x1={(rowhight * 0) + shiftRight} y1={shiftTop} x2={(rowhight * 0) + shiftRight} y2={shiftTop + height } stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 1) + shiftRight} y1={shiftTop} x2={(rowhight * 1) + shiftRight} y2={shiftTop + height } stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 2) + shiftRight} y1={shiftTop} x2={(rowhight * 2) + shiftRight} y2={shiftTop + height } stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 3) + shiftRight} y1={shiftTop} x2={(rowhight * 3) + shiftRight} y2={shiftTop + height } stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 4) + shiftRight} y1={shiftTop} x2={(rowhight * 4) + shiftRight} y2={shiftTop + height } stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 5) + shiftRight} y1={shiftTop} x2={(rowhight * 5) + shiftRight} y2={shiftTop + height } stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 6) + shiftRight} y1={shiftTop} x2={(rowhight * 6) + shiftRight} y2={shiftTop + height } stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 7) + shiftRight} y1={shiftTop} x2={(rowhight * 7) + shiftRight} y2={shiftTop + height }  stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 8) + shiftRight} y1={shiftTop} x2={(rowhight * 8) + shiftRight} y2={shiftTop + height }  stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 9) + shiftRight} y1={shiftTop} x2={(rowhight * 9) + shiftRight} y2={shiftTop + height }  stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 10) + shiftRight} y1={shiftTop} x2={(rowhight * 10) + shiftRight}y2={shiftTop + height }  stroke='lightgray' strokeWidth="1" />
                <Line x1={(rowhight * 0) + shiftRight} y1={shiftTop + height} x2={(rowhight * 10) + shiftRight} y2={shiftTop + height} stroke='lightgray' strokeWidth="1" />

                <Text x="20" y={bartop + (barhight * 1) + gap1} fill='#555555' fontSize="14" textAnchor="start" fontFamily='Prompt-Regular'>Max</Text>
                <Text x="20" y={bartop + (barhight * 3) + (gap1 * 2) + gap2} fill='#555555' fontSize="14" textAnchor="start" fontFamily='Prompt-Regular'>Min</Text>

                <Rect x={shiftRight} y={bartop} width={previousmax * 4.7 * scale * ratio} height={barhight} fill="#d77c7c" />
                <Text x={shiftRight + (previousmax * 4.8 * scale * ratio) + 10} y={bartop + (barhight * 1)} fill='#d77c7c' fontSize="12" textAnchor="start" fontFamily='Prompt-Regular'>{previousmax}</Text>

                <Rect x={shiftRight} y={bartop + barhight + gap1} width={currencemax * 4.7 * scale * ratio} height={barhight} fill="#f20909" />
                <Text x={shiftRight + (currencemax * 4.8 * scale * ratio) + 10} y={bartop + (barhight * 2) + gap1} fill='#f20909' fontSize="12" textAnchor="start" fontFamily='Prompt-Regular'>{currencemax}</Text>

                <Rect x={shiftRight} y={bartop + (barhight * 2) + gap1 + gap2} width={previouemin * 4.7 * scale * ratio} height={barhight} fill="#d77c7c" />
                <Text x={shiftRight + (previouemin * 4.8 * scale * ratio) + 10} y={bartop + (barhight * 3) + gap1 + gap2} fill='#d77c7c' fontSize="12" textAnchor="start" fontFamily='Prompt-Regular'>{previouemin}</Text>

                <Rect x={shiftRight} y={bartop + (barhight * 3) + (gap1 * 2) + gap2} width={currencemin * 4.7 * scale * ratio} height={barhight} fill="#f20909" />
                <Text x={shiftRight + (currencemin * 4.8 * scale * ratio) + 10} y={bartop + (barhight * 4) + (gap1 * 2) + gap2} fill='#f20909' fontSize="12" textAnchor="start" fontFamily='Prompt-Regular'>{currencemin}</Text>

                <Text x={(rowhight * 0) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 0 * ratio)}</Text>

                <Text x={(rowhight * 1) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 5 / ratio)}</Text>

                <Text x={(rowhight * 2) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 10 / ratio)}</Text>

                <Text x={(rowhight * 3) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 15 / ratio)}</Text>

                <Text x={(rowhight * 4) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 20 / ratio)}</Text>

                <Text x={(rowhight * 5) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 25 / ratio)}</Text>

                <Text x={(rowhight * 6) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 30 / ratio)}</Text>

                <Text x={(rowhight * 7) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 35 / ratio)}</Text>

                <Text x={(rowhight * 8) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 40 / ratio)}</Text>

                <Text x={(rowhight * 9) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 45 / ratio)}</Text>

                <Text x={(rowhight * 10) + shiftRight} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>{Math.ceil( 50 / ratio)}</Text>

                <Text x={(rowhight * 11) + shiftRight + 15} y={shiftTop + height + bottomlabel} fill='#555555' fontSize={fonrsize} textAnchor="middle" fontFamily='Prompt-Regular'>Hour(s)</Text>

            </Svg>

        );
        
    }

}