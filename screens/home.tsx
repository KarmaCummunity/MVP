import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

function Home() {
    const openLink = () => {
        const url = 'https://example.com'; // Replace with your URL
        Linking.openURL(url);
    };
    return (
        <div>
            <Text>fgdfgdf</Text>
            <View>
                <Text>This is a clickable link:</Text>
                <TouchableOpacity onPress={openLink}>
                    <Text style={{ color: 'blue' }}>Visit Example.com</Text>
                </TouchableOpacity>
            </View>
        </div>
    );
};

export default Home