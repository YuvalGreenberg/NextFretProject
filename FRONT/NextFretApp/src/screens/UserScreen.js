import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Button,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../contexts/AuthContext';
import API_URL from '../config';

export default function UserScreen({ navigation }) {
    const { userId, logout } = useContext(AuthContext);
    const [chords, setChords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        let isActive = true;
        // Fetch user chords
        fetch(`${API_URL}/api/userManager/${userId}/chords`)
            .then(res => res.json())
            .then(data => {
                if (isActive && Array.isArray(data)) setChords(data);
            })
            .catch(console.error)
            .finally(() => { if (isActive) setLoading(false); });

        // Fetch user details
        fetch(`${API_URL}/api/userManager/${userId}/profile`)
            .then(res => res.json())
            .then(data => {
                if (isActive) setUserInfo(data);
            })
            .catch(console.error);

        return () => { isActive = false; };
    }, [userId]);

    const renderChord = ({ item }) => (
        <TouchableOpacity
            style={styles.chordItem}
            onPress={() => navigation.navigate('MyChords')}
        >
            <Text style={styles.chordText}>{item.name}</Text>
        </TouchableOpacity>
    );

    if (loading || !userInfo) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>My Chords</Text>
                <TouchableOpacity
                    style={styles.arrowButton}
                    onPress={() => navigation.navigate('MyChords')}
                >
                    <Ionicons name="add" size={20} color="#386641" />
                </TouchableOpacity>
            </View>
            {/* גריד אקורדים שעטוף אוטומטית */}
            <View style={styles.chordsContainer}>
                {chords.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.chordItem}
                        onPress={() => navigation.navigate('ChordScreen', { chordId: item.id })}
                    >
                        <Text style={styles.chordText}>{item.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.infoContainer}>
                {[
                    { label: 'Email', value: userInfo.email },
                    { label: 'First Name', value: userInfo.firstName },
                    { label: 'Last Name', value: userInfo.lastName },
                    { label: 'Date of Birth', value: new Date(userInfo.dateOfBirth).toLocaleDateString() },
                ].map((field, idx) => (
                    <View key={idx} style={{ marginBottom: 12 }}>
                        <Text style={styles.rowLabel}>{field.label}</Text>
                        <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
                            <Text style={styles.rowValue}>{field.value}</Text>
                            <Ionicons name="chevron-forward" size={18} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.buttonContainer}>
                    <Button
                        title="Change Password"
                        onPress={() => navigation.navigate('ChangePasswordScreen')}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Logout"
                        onPress={() => {
                            logout();
                            navigation.replace('Login');
                        }}
                        color="red"
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 0,
        paddingBottom: 16,
        backgroundColor: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    chordList: {
        marginBottom: 24,
    },
    chordItem: {
        width: 52,               // רוחב העיגול
        height: 52,              // גובה העיגול
        borderRadius: 20,         // חצי מהרוחב/גובה = עיגול מושלם
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 4,                // רווח סביב כל עיגול
    },
    chordText: {
        fontSize: 15,
        fontWeight: '600',
    },
    infoContainer: {
        marginTop: 16,
    },
    label: {
        fontSize: 14,
        color: '#777',
        marginTop: 12,

    },
    value: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 4,
    },
    buttonContainer: {
        marginTop: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    arrowButton: {
        padding: 8,
        marginLeft: 4,
    },
    arrowText: {
        fontSize: 24,
        color: '#386641',
    },
    chordsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',         // מאפשר עטיפה לשורה הבאה אם לא נכנס
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    infoRow: {
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowLabel: {
        fontSize: 14,
        color: '#777',
        marginBottom: 4,
    },
    rowValue: {
        fontSize: 16,
        fontWeight: '500',
    },
});
