
import { PermissionsAndroid } from 'react-native';

export default class LoadPDFFile {
    loadPDFFile = async (pdfPath, filename) => {

        //console.log("LoadPDFFile pdfPath : ", pdfPath)
        //console.log("LoadPDFFile filename : ", filename)

        if (Platform.OS === 'android') {
            if (this.state.havePermission) {
                RNFetchBlob
                    .config({
                        addAndroidDownloads: {
                            useDownloadManager: true,
                            notification: false,
                            path: RNFetchBlob.fs.dirs.DownloadDir + file,
                            mime: 'application/pdf;base64',
                            title: file,
                            description: 'shippingForm'
                        }
                    })
                    .fetch('GET', url, {
                        'Content-Type': 'application/pdf;base64'
                    })
                    .then((resp) => {
                        //console.log("Android ==> LoadPDFFile ==> Load Success  : ", resp);
                        RNFetchBlob.android.actionViewIntent(resp.data, 'application/pdf')
                    })
                    .catch((errorCode, errorMessage) => {
                        //console.log("Android ==> LoadPDFFile ==> Load errorCode  : ", errorCode);
                        Alert.alert(
                            errorCode,
                            errorMessage,
                            [
                                {
                                    text: 'Cancel', onPress: () => {
                                        //console.log("Android ==> LoadPDFFile ==> Load errorCode  : ", errorCode);

                                    }, style: 'cancel'
                                },
                                {
                                    text: 'OK', onPress: () => {
                                        this.addEventOnCalendar()
                                    }
                                },
                            ],
                            { cancelable: false }
                        )
                    })
            } else {
                //console.log('noWritePermission')
                this.requestPDFPermission()
            }
        } else {//iOS
            //console.log("loadPdf pdfPath : ", pdfPath)
            //console.log("loadPdf filename : ", filename)
            RNFetchBlob
                .config({
                    fileCache: true,
                    appendExt: 'pdf'
                })
                .fetch('GET', pdfPath)
                .then((resp) => {
                    //console.log("WorkingCalendarYear pdf1 : ", resp);
                    //console.log("WorkingCalendarYear pdf2 : ", resp.path());
                    RNFetchBlob.fs.exists(resp.path())
                        .then((exist) => {
                            //console.log(`WorkingCalendarYear ==> file ${exist ? '' : 'not'} exists`)
                        })
                        .catch(() => { 
                            //console.log('WorkingCalendarYear ==> err while checking')
                         });

                    RNFetchBlob.ios.openDocument(resp.path());
                })
                .catch((errorMessage, statusCode) => {
                    //console.log('Error: ' + errorMessage);
                    //console.log('Status code: ' + statusCode);
                });
        }
    }

    requestPDFPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    'title': "Permission",
                    'message': 'External Storage Permission'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                //console.log("You can use the WRITE_EXTERNAL_STORAGE")
                this.loadPDFFile()
            } else {
                //console.log("WRITE_EXTERNAL_STORAGE permission denied")
            }
        } catch (err) {
            console.warn(err)
        }
    }
}

