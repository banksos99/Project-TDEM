import React, { Component } from 'react';
import RNFetchBlob from 'react-native-fetch-blob'
import {
    Text,
    StyleSheet,
    ScrollView,
    View,
    StatusBar,
    Button,
    TouchableOpacity,
    Image, Picker, WebView,
    FlatList,
    Platform,
    BackHandler
} from 'react-native';
import SharedPreference from "./../SharedObject/SharedPreference"

export default class HandBookCover extends Component {
    constructor(props) {
        super(props);
        this.terminated = false;
        this.state = {
            url: this.props.placeholderUrl
        };
    }

    componentDidMount() {
        //console.log('[BookCover] componentDidMount');
        this.refresh();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.terminated = true;
        this.task.cancel();
    }

    updateSource(newUrl) {
        //console.log("Book updateSource : " + newUrl);

        if (this.terminated) {
            return;
        }

        this.setState(previousState => {
            return { url: Platform.OS === 'android' ? 'file://' + newUrl : '' + newUrl }
        });
    }


    refresh() {
        //console.log('[BookCover] Refresh');

        let dirs = RNFetchBlob.fs.dirs
        let filename = this.props.bookName + '.jpeg'
        let targetFile = dirs.DocumentDir + '/cover/' + filename;

       // let hasFile = false;

        RNFetchBlob.fs.exists(targetFile)
            .then((exist) => {
               // hasFile = exist;
                //console.log("======================");
                //console.log("Has file : " + hasFile);
                //console.log("======================");
                //console.log("======================");

              //  hasFile = false
                //   if (hasFile) {
                //     this.updateSource(targetFile);
                //   } else {

                this.task = RNFetchBlob
                    .config({
                        fileCache: true,
                        // response data will be saved to this path if it has access right.
                        path: targetFile
                    })
                  
                    .fetch('GET', this.props.coverUrl, {
                        //some headers ..
                        'Content-Type': 'image/jpeg;base64',
                        Authorization: FUNCTION_TOKEN

                    });
                this.task.then((res) => {
                    // the path should be dirs.DocumentDir + 'path-to-file.anything'

                    console.log('load cover TOKEN ', FUNCTION_TOKEN)
                    //console.log('The file saved to ', res.path())
                    if (this.terminated) {
                        return;
                    }
                    this.updateSource(targetFile);
                }).catch((err) => {
                    // scan file error
                    //console.log('[BookCover] Catch Error', err);
                });
                //   }

            })
            .catch(() => {
                //console.log('[Error] BookCover ==> Error on DidMounted')
            });

    }

    render() {
        return (
            <Image source={{ uri: this.state.url }}
                style={{ width: '100%', height: '100%' }} />

        );
    }
}