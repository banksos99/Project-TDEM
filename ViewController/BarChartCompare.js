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

    twodigi(date) {
        return parseInt(date * 100) / 100
    }
    
    render() {

        let current1 = this.props.datalist.request_month.avgX15;
        let current2 = this.props.datalist.request_month.avgX20;
        let current3 = this.props.datalist.request_month.avgX30;
        let current4 = this.props.datalist.request_month.avgTotal;

        let previous1 = this.props.datalist.previous_month.avgX15;
        let previous2 = this.props.datalist.previous_month.avgX20;
        let previous3 = this.props.datalist.previous_month.avgX30;
        let previous4 = this.props.datalist.previous_month.avgTotal;

        let listdata = [previous1, current1, previous2, current2, previous3, current3, previous4, current4,];
        let max = 0;
        for (let i = 0; i < listdata.length; i++) {
            if (parseFloat(listdata[i]) > max) {
                max = parseFloat(listdata[i])
            }
        }

        let tratio =  1 / 5 * max;
console.log('tratio',tratio);
console.log('tratio',Math.ceil(tratio));
max = Math.ceil(tratio)*5
        let step = Layout.window.width;
        let listDataPrev = this.props.listDataPrev;
        let listDataCurr = this.props.listDataCurr;

        let shiftdown = 50 * scale
        let shiftRight = 70 * scale
        let linecolor = Colors.redTextColor;

        let rowhight = 140 / 6 * scale;
        let ratio = 5 / max;
        console.log('max',max);
        console.log('ratio',ratio);
        let shiftTop = 25 * scale;

        let barwidth = 20 * scale;
        let gap1 = 5 * scale;
        let gap2 = 20 * scale;

        let labelbottom = 20 * scale;

        let linewidth = 350 * scale;
        let zero = 0;
        if (max > 0) {
            zero = this.twodigi(0 / 5 * max)
        }else{
            max =10
        }

        return (

            <Svg height="300" width={Layout.window.width}>

                <Line x1={shiftRight} y1={(rowhight * 0) + shiftTop} x2={linewidth} y2={(rowhight * 0) + shiftTop} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 1) + shiftTop} x2={linewidth} y2={(rowhight * 1) + shiftTop} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 2) + shiftTop} x2={linewidth} y2={(rowhight * 2) + shiftTop} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 3) + shiftTop} x2={linewidth} y2={(rowhight * 3) + shiftTop} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 4) + shiftTop} x2={linewidth} y2={(rowhight * 4) + shiftTop} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 5) + shiftTop} x2={linewidth} y2={(rowhight * 5) + shiftTop} stroke='lightgray' strokeWidth="1" />

                <Text x={shiftRight - 20} y={(rowhight * 0) + shiftTop} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>{this.twodigi(5 / 5 * max)}</Text>
                <Text x={shiftRight - 20} y={(rowhight * 1) + shiftTop} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>{this.twodigi(4 / 5 * max)}</Text>
                <Text x={shiftRight - 20} y={(rowhight * 2) + shiftTop} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>{this.twodigi(3 / 5 * max)}</Text>
                <Text x={shiftRight - 20} y={(rowhight * 3) + shiftTop} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>{this.twodigi(2 / 5 * max)}</Text>
                <Text x={shiftRight - 20} y={(rowhight * 4) + shiftTop} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>{this.twodigi(1 / 5 * max)}</Text>
                <Text x={shiftRight - 20} y={(rowhight * 5) + shiftTop} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>{zero}</Text>

                <Rect x={shiftRight} y={((rowhight * 5) + shiftTop) - ((previous1) * rowhight * ratio)} width={barwidth} height={((previous1) * rowhight * ratio)} fill="#d77c7c" />
                <Text x={shiftRight + 10} y={((rowhight * 5) + shiftTop) - ((previous1) * rowhight * ratio)-5} fill='#555555' textAnchor="middle" fontSize="10" fontFamily='Prompt-Regular' fill="#d77c7c">{listdata[0]}</Text>
                <Rect x={shiftRight + gap1 + barwidth} y={((rowhight * 5) + shiftTop) - ((current1) * rowhight * ratio)} width={barwidth} height={((current1) * rowhight * ratio)} fill="#f20909" />
                <Text x={shiftRight + gap1 + barwidth + 10} y={((rowhight * 5) + shiftTop) - ((current1) * rowhight * ratio)-5} fill='#555555' textAnchor="middle" fontSize="10" fontFamily='Prompt-Regular' fill="#f20909">{listdata[1]}</Text>
                <Text x={shiftRight + barwidth} y={(rowhight * 5) + shiftTop + labelbottom} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>OT 1.5</Text>

                <Rect x={shiftRight + gap1 + (barwidth * 2) + gap2} y={((rowhight * 5) + shiftTop) - ((previous2) * rowhight * ratio)} width={barwidth} height={((previous2) * rowhight * ratio)} fill="#d77c7c" />
                <Text x={shiftRight + gap1 + (barwidth * 2) + gap2+ 10} y={((rowhight * 5) + shiftTop) - ((previous2) * rowhight * ratio)-5} fill='#555555' textAnchor="middle" fontSize="10" ontFamily='Prompt-Regular' fill="#d77c7c">{listdata[2]}</Text>
                <Rect x={shiftRight + (gap1 * 2) + (barwidth * 3) + gap2} y={((rowhight * 5) + shiftTop) - ((current2) * rowhight * ratio)} width={barwidth} height={((current2) * rowhight * ratio)} fill="#f20909" />
                <Text x={shiftRight + (gap1 * 2) + (barwidth * 3) + gap2+ 10} y={((rowhight * 5) + shiftTop) - ((current2) * rowhight * ratio)-5} fill='#555555' textAnchor="middle" fontSize="10" fontFamily='Prompt-Regular' fill="#f20909">{listdata[3]}</Text>
                <Text x={shiftRight + gap1 + (barwidth * 3) + gap2} y={(rowhight * 5) + shiftTop + labelbottom} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>OT 2</Text>

                <Rect x={shiftRight + (gap1 * 2) + (barwidth * 4) + (gap2 * 2)} y={((rowhight * 5) + shiftTop) - ((previous3) * rowhight * ratio)} width={barwidth} height={((previous3) * rowhight * ratio)} fill="#d77c7c" />
                <Text x={shiftRight + (gap1 * 2) + (barwidth * 4) + (gap2 * 2)+ 10} y={((rowhight * 5) + shiftTop) - ((previous3) * rowhight * ratio)-5} fill='#555555' textAnchor="middle" fontSize="10" fontFamily='Prompt-Regular' fill="#d77c7c">{listdata[4]}</Text>
                <Rect x={shiftRight + (gap1 * 3) + (barwidth * 5) + (gap2 * 2)} y={((rowhight * 5) + shiftTop) - ((current3) * rowhight * ratio)} width={barwidth} height={((current3) * rowhight * ratio)} fill="#f20909" />
                <Text x={shiftRight + (gap1 * 3) + (barwidth * 5) + (gap2 * 2)+ 10} y={((rowhight * 5) + shiftTop) - ((current3) * rowhight * ratio)-5} fill='#555555' textAnchor="middle" fontSize="10" fontFamily='Prompt-Regular' fill="#f20909">{listdata[5]}</Text>
                <Text x={shiftRight + (gap1 * 2) + (barwidth * 5) + (gap2 * 2)} y={(rowhight * 5) + shiftTop + labelbottom} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>OT 3</Text>

                <Rect x={shiftRight + (gap1 * 3) + (barwidth * 6) + (gap2 * 3)} y={((rowhight * 5) + shiftTop) - ((previous4) * rowhight * ratio)} width={barwidth} height={((previous4) * rowhight * ratio)} fill="#d77c7c" />
                <Text x={shiftRight + (gap1 * 3) + (barwidth * 6) + (gap2 * 3)+ 10} y={((rowhight * 5) + shiftTop) - ((previous4) * rowhight * ratio)-5} fill='#555555' textAnchor="middle" fontSize="10" fontFamily='Prompt-Regular' fill="#d77c7c">{listdata[6]}</Text>
                <Rect x={shiftRight + (gap1 * 4) + (barwidth * 7) + (gap2 * 3)} y={((rowhight * 5) + shiftTop) - ((current4) * rowhight * ratio)} width={barwidth} height={((current4) * rowhight * ratio)} fill="#f20909" />
                <Text x={shiftRight + (gap1 * 4) + (barwidth * 7) + (gap2 * 3)+ 10} y={((rowhight * 5) + shiftTop) - ((current4) * rowhight * ratio)-5} fill='#555555' textAnchor="middle" fontSize="10" fontFamily='Prompt-Regular' fill="#f20909">{listdata[7]}</Text>
                <Text x={shiftRight + (gap1 * 3) + (barwidth * 7) + (gap2 * 3)} y={(rowhight * 5) + shiftTop + labelbottom} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>Total</Text>
                <Text x={shiftRight + (gap1 * 3) + (barwidth * 7) + (gap2 * 3)} y={(rowhight * 5) + shiftTop + labelbottom + 10} fill='#555555' textAnchor="middle" fontFamily='Prompt-Regular'>Average OT</Text>
            </Svg>
        );
    }

}