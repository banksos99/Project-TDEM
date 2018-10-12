import React, { Component } from 'react';
import { Button, View, Text } from 'react-native';

export default class ScreenA extends Component {

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Home Screen A</Text>
                <Button
                    title="Go to Details"
                    onPress={() => this.props.navigation.navigate('screenB')}
                />
            </View>
        );
    }
}