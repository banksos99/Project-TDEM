import React, { Component } from "react";
import { View, Image, TouchableOpacity, Alert } from "react-native";
import Layout from "./../SharedObject/Layout"
import { styles } from "./../SharedObject/MainStyles";
import Colors from "./../SharedObject/Colors"
import StringText from './../SharedObject/StringText'
import Months from "./../constants/Month"
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

let scale = Layout.window.width / 375;
//monthNameStr
//let monthstr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export default class PinActivity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pintitle: 'Enter your PIN',
            pin: '',
            failPin: 0
        }
    }

    conv(date) {
        let year = date.substring(2, 4);
        let month = parseInt(date.substring(4, 6));
        return Months.monthNameStr[month - 1] + '-' + year

    }

    render() {
        //console.log('data list :', this.props.datalist)
        let tmax = 0
        for (let i = 0; i < this.props.datalist.length; i++) {
            //console.log('datalist :', this.props.datalist[i].total_ot)
            if (parseInt(this.props.datalist[i].total_ot) > tmax) {
                tmax = this.props.datalist[i].total_ot
            }

        }
        //console.log('dmax value :', tmax)
        let max = 200;
        let shiftdown = 50 * scale
        let shiftRight = 70 * scale
        let ratio = Math.floor(200 / Math.floor(tmax));
        //console.log('ratio :', ratio)

       

        let linecolor = Colors.redTextColor;

        let w = 20 * scale;
        let h = 200;
        let lwidth = w.toString();
        let lheight = h.toString();
        let s1 = '#symbol2'
        let s2 = '#symbol'
        let vbox = '0 0' + lwidth + lheight;

        let bottomlabel = 260;
        let rowhight = (max / 6);

        let p1 = (rowhight * 6) + shiftdown;
        let ot1 = 0;
        let month1 = '-';
        if (this.props.datalist.length > 0) {
            ot1 = this.props.datalist[0].total_ot
            p1 = max - (ot1 * ratio) + shiftdown;
            month1 = this.conv(this.props.datalist[0].year_month)
        }
        let p2 = (rowhight * 6) + shiftdown;
        let ot2 = 0;
        let month2 = '-';
        if (this.props.datalist.length > 1) {
            ot2 = this.props.datalist[1].total_ot
            p2 = max - (ot2 * ratio) + shiftdown;
            month2 = this.conv(this.props.datalist[1].year_month)
        }
        let p3 = (rowhight * 6) + shiftdown;
        let ot3 = 0;
        let month3 = '-';
        if (this.props.datalist.length > 2) {
            ot3 = this.props.datalist[2].total_ot
            p3 = max - (ot3 * ratio) + shiftdown;
            month3 = this.conv(this.props.datalist[2].year_month)
        }
        let p4 = (rowhight * 6) + shiftdown;
        let ot4 = 0;
        let month4 = '-';
        if (this.props.datalist.length > 3) {
            ot4 = this.props.datalist[3].total_ot
            p4 = max - (ot4 * ratio) + shiftdown;
            month4 = this.conv(this.props.datalist[3].year_month)
        }
        let p5 = (rowhight * 6) + shiftdown;
        let ot5 = 0;
        let month5 = '-';
        if (this.props.datalist.length > 4) {
            ot5 = this.props.datalist[4].total_ot
            p5 = max - (ot5 * ratio) + shiftdown;
            month5 = this.conv(this.props.datalist[4].year_month)
        }
        let p6 = (rowhight * 6) + shiftdown;
        let ot6 = 0;
        let month6 = '-';
        if (this.props.datalist.length > 5) {
            ot6 = this.props.datalist[5].total_ot
            p6 = max - (ot6 * ratio) + shiftdown;
            month6 = this.conv(this.props.datalist[5].year_month)
        }
        let p7 = (rowhight * 6) + shiftdown;
        let ot7 = 0;
        let month7 = '-';
        if (this.props.datalist.length > 6) {
            ot7 = this.props.datalist[6].total_ot
            p7 = max - (ot7 * ratio) + shiftdown;
            month7 = this.conv(this.props.datalist[6].year_month)
        }
        let p8 = (rowhight * 6) + shiftdown;
        let ot8 = 0;
        let month8 = '-';
        if (this.props.datalist.length > 7) {
            ot8 = this.props.datalist[7].total_ot
            p8 = max - (ot8 * ratio) + shiftdown;
            month8 = this.conv(this.props.datalist[7].year_month)
        }
        let p9 = (rowhight * 6) + shiftdown;
        let ot9 = 0;
        let month9 = '-';
        if (this.props.datalist.length > 8) {
            ot9 = this.props.datalist[8].total_ot
            p9 = max - (ot9 * ratio) + shiftdown;
            month9 = this.conv(this.props.datalist[8].year_month)
        }
        let p10 = (rowhight * 6) + shiftdown;
        let ot10 = 0;
        let month10 = '-';
        if (this.props.datalist.length > 9) {
            ot10 = this.props.datalist[9].total_ot
            p10 = max - (ot10 * ratio) + shiftdown;
            month10 = this.conv(this.props.datalist[9].year_month)
        }
        let p11 = (rowhight * 6) + shiftdown;
        let ot11 = 0;
        let month11 = '-';
        if (this.props.datalist.length > 10) {
            ot11 = this.props.datalist[10].total_ot
            p11 = max - (ot11 * ratio) + shiftdown;
            month11 = this.conv(this.props.datalist[10].year_month)
        }
        let p12 = (rowhight * 6) + shiftdown;
        let ot12 = 0;
        let month12 = '-';
        if (this.props.datalist.length > 11) {
            ot12 = this.props.datalist[11].total_ot
            p12 = max - (ot12 * ratio) + shiftdown;
            month12 = this.conv(this.props.datalist[11].year_month)
        }
        let p13 = (rowhight * 6) + shiftdown;
        let ot13 = 0;
        let month13 = '-';
        if (this.props.datalist.length > 12) {
            ot13 = this.props.datalist[12].total_ot
            p13 = max - (ot13 * ratio) + shiftdown;
            month13 = this.conv(this.props.datalist[12].year_month)
        }


        return (
            <Svg height="300" width="350">

                <Line x1={shiftRight} y1={(rowhight * 0) + shiftdown} x2='350' y2={(rowhight * 0) + shiftdown} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 1) + shiftdown} x2='350' y2={(rowhight * 1) + shiftdown} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 2) + shiftdown} x2='350' y2={(rowhight * 2) + shiftdown} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 3) + shiftdown} x2='350' y2={(rowhight * 3) + shiftdown} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 4) + shiftdown} x2='350' y2={(rowhight * 4) + shiftdown} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 5) + shiftdown} x2='350' y2={(rowhight * 5) + shiftdown} stroke='lightgray' strokeWidth="1" />
                <Line x1={shiftRight} y1={(rowhight * 6) + shiftdown} x2='350' y2={(rowhight * 6) + shiftdown} stroke='lightgray' strokeWidth="1" />

                <Text x="50" y={(rowhight * 0) + 50} fill='#555555' textAnchor="end" fontFamily='Prompt-Regular'>{Math.floor(rowhight * 6 / ratio)}</Text>
                <Text x="50" y={(rowhight * 1) + 50} fill='#555555' textAnchor="end" fontFamily='Prompt-Regular'>{Math.floor(rowhight * 5 / ratio)}</Text>
                <Text x="50" y={(rowhight * 2) + 50} fill='#555555' textAnchor="end" fontFamily='Prompt-Regular'>{Math.floor(rowhight * 4 / ratio)}</Text>
                <Text x="50" y={(rowhight * 3) + 50} fill='#555555' textAnchor="end" fontFamily='Prompt-Regular'>{Math.floor(rowhight * 3 / ratio)}</Text>
                <Text x="50" y={(rowhight * 4) + 50} fill='#555555' textAnchor="end" fontFamily='Prompt-Regular'>{Math.floor(rowhight * 2 / ratio)}</Text>
                <Text x="50" y={(rowhight * 5) + 50} fill='#555555' textAnchor="end" fontFamily='Prompt-Regular'>{Math.floor(rowhight * 1 / ratio)}</Text>
                <Text x="50" y={(rowhight * 6) + 50} fill='#555555' textAnchor="end" fontFamily='Prompt-Regular'>{Math.floor(rowhight * 0)}</Text>


                <Line x1={(w * 1) + shiftRight} y1={p1} x2={(w * 2) + shiftRight} y2={p2} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 1) + shiftRight} cy={p1} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 1) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 1) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot1}</Text>
                </G>
                <Line x1={(w * 2) + shiftRight} y1={p2} x2={(w * 3) + shiftRight} y2={p3} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 2) + shiftRight} cy={p2} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 2) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 2) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot2}</Text>
                </G>
                <Line x1={(w * 3) + shiftRight} y1={p3} x2={(w * 4) + shiftRight} y2={p4} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 3) + shiftRight} cy={p3} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 3) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 3) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot3}</Text>
                </G>
                <Line x1={(w * 4) + shiftRight} y1={p4} x2={(w * 5) + shiftRight} y2={p5} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 4) + shiftRight} cy={p4} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 4) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 4) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot4}</Text>
                </G>
                <Line x1={(w * 5) + shiftRight} y1={p5} x2={(w * 6) + shiftRight} y2={p6} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 5) + shiftRight} cy={p5} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 5) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 5) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot5}</Text>
                </G>
                <Line x1={(w * 6) + shiftRight} y1={p6} x2={(w * 7) + shiftRight} y2={p7} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 6) + shiftRight} cy={p6} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 6) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 6) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot6}</Text>
                </G>
                <Line x1={(w * 7) + shiftRight} y1={p7} x2={(w * 8) + shiftRight} y2={p8} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 7) + shiftRight} cy={p7} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 7) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 7) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot7}</Text>
                </G>
                <Line x1={(w * 8) + shiftRight} y1={p8} x2={(w * 9) + shiftRight} y2={p9} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 8) + shiftRight} cy={p8} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 8) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 8) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot8}</Text>
                </G>
                <Line x1={(w * 9) + shiftRight} y1={p9} x2={(w * 10) + shiftRight} y2={p10} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 9) + shiftRight} cy={p9} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 9) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 9) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot9}</Text>
                </G>
                <Line x1={(w * 10) + shiftRight} y1={p10} x2={(w * 11) + shiftRight} y2={p11} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 10) + shiftRight} cy={p10} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 10) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 10) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot10}</Text>
                </G>
                <Line x1={(w * 11) + shiftRight} y1={p11} x2={(w * 12) + shiftRight} y2={p12} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 11) + shiftRight} cy={p11} r="2" strokeWidth="2" stroke="red" fill="red" onPress={() => alert('Press on Circle')} />
                <G rotation="315" origin={(w * 11) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 11) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot11}</Text>
                </G>
                <Line x1={(w * 12) + shiftRight} y1={p12} x2={(w * 13) + shiftRight} y2={p13} stroke={linecolor} strokeWidth="1" />
                <Circle cx={(w * 12) + shiftRight} cy={p12} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 12) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 12) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot12}</Text>
                </G>
                <Circle cx={(w * 13) + shiftRight} cy={p13} r="2" strokeWidth="2" stroke="red" fill="red" />
                <G rotation="315" origin={(w * 13) + shiftRight + ',' + rowhight}>
                    <Text x={(w * 13) + shiftRight} y={rowhight} fill="red" fontSize="10" textAnchor="start">{ot13}</Text>
                </G>

                <G rotation="315" origin={(w * 1) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 1) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month1}</Text>
                </G>
                <G rotation="315" origin={(w * 2) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 2) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month2}</Text>
                </G>
                <G rotation="315" origin={(w * 3) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 3) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month3}</Text>
                </G>
                <G rotation="315" origin={(w * 4) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 4) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month4}</Text>
                </G>
                <G rotation="315" origin={(w * 5) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 5) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month5}</Text>
                </G>
                <G rotation="315" origin={(w * 6) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 6) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month6}</Text>
                </G>
                <G rotation="315" origin={(w * 7) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 7) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month7}</Text>
                </G>
                <G rotation="315" origin={(w * 8) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 8) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month8}</Text>
                </G>
                <G rotation="315" origin={(w * 9) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 9) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month9}</Text>
                </G>
                <G rotation="315" origin={(w * 10) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 10) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month10}</Text>
                </G>
                <G rotation="315" origin={(w * 11) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 11) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month11}</Text>
                </G>
                <G rotation="315" origin={(w * 12) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 12) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                    {month12}</Text>
                </G>
                <G rotation="315" origin={(w * 13) + shiftRight + ',' + bottomlabel}>
                    <Text x={(w * 13) + shiftRight} y={bottomlabel} fill="#555555" fontSize="10" fontFamily='Prompt-Regular' textAnchor="end">
                        {month13}</Text>
                </G>

            </Svg>
        )
    }

}