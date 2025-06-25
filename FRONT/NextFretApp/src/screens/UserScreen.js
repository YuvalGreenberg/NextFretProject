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
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../contexts/AuthContext';
import API_URL from '../config';


export default function UserScreen({ navigation }) {
    const { userId, signOut } = useContext(AuthContext);
    const [chords, setChords] = useState([]);
    const [genres, setGenres] = useState([]);
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

        // Fetch user favorite genres
        fetch(`${API_URL}/api/userManager/${userId}/genres`)
            .then(res => res.json())
            .then(data => {
                if (isActive && Array.isArray(data)) setGenres(data);
            })
            .catch(console.error);

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
                <ActivityIndicator size="small" color="#888" />
                <Text style={styles.loadingText}>Please wait...</Text>
            </View>
        );
    }

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const infoFields = [
        { label: 'Email', value: capitalize(userInfo.email), icon: 'mail-outline' },
        { label: 'First Name', value: capitalize(userInfo.firstName), icon: 'person-outline' },
        { label: 'Last Name', value: capitalize(userInfo.lastName), icon: 'person-circle-outline' },
    ];

    // Handler for deleting the user account
    const handleDeleteAccount = async () => {
        // TODO: Add API call here
        Alert.alert("Account Deleted", "This would delete the account. (API not implemented yet)");
        signOut(); // Optional: log out after deletion
    };

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
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chordsContainer}
            >
                {chords.length > 0 ? (
                    chords.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.chordItem}
                            onPress={() => navigation.navigate('ChordScreen', { chordId: item.id })}
                        >
                            <Text style={styles.chordText}>{item.name}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minWidth: '100%' }}>
                        <Text style={styles.placeholderText}>Add Chords</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>My Genres</Text>
                <TouchableOpacity
                    style={styles.arrowButton}
                    onPress={() => navigation.navigate('MyGenres')}
                >
                    <Ionicons name="add" size={20} color="#386641" />
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.genresContainer}
            >
                {genres.length > 0 ? (
                    genres.map(item => (


                        <View key={item.id} style={styles.genreItem}>
                            <Text style={styles.chordText}>{item.title}</Text>
                        </View>


                    ))
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minWidth: '100%' }}>
                        <Text style={styles.placeholderText}>Add Genres</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.infoContainer}>
                {infoFields.map((field, idx) => (
                    <View key={idx} style={{ marginBottom: 12 }}>
                        <Text style={styles.rowLabel}>{field.label}</Text>
                        <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.7}>
                            <Ionicons name={field.icon} size={20} color="#777" />
                            <View>
                                <Text style={styles.inputText}>{field.value}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ChangePasswordScreen')}>
                    <Text style={styles.actionButtonText}>Change Password</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#d9534f' }]} onPress={signOut}>
                    <Text style={styles.actionButtonText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#999' }]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.actionButtonText}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: '#fff',
        flexGrow: 1,


    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        color: '#666',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    chordList: {
        marginBottom: 24,
    },
    chordItem: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#f7f7f7',
        borderRadius: 20,
        margin: 4,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    genreItem: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#f7f7f7',
        borderRadius: 20,
        margin: 4,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start', //
    },
    chordText: {
        fontSize: 15,
        fontWeight: '600',
    },
    infoContainer: {
        marginTop: -30,
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
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    genresContainer: {
        flexDirection: 'row',

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
        marginLeft: 12,
    },
    rowValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    placeholderText: {
        flex: 1,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 20,
        fontWeight: '500',
        color: '#888',
        paddingHorizontal: 16,
         // Adjusted for better visibility
        //paddingTop: 100,
    },
    actionButton: {
        backgroundColor: '#FFA500',
        paddingVertical: 14,
        borderRadius: 24,
        marginHorizontal: 8,
        marginTop: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginHorizontal: 8,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        height: 45,
    },
    inputText: {
        paddingLeft: 8,
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        textAlignVertical: 'center',
        lineHeight: 45, // Matches height of the wrapper
    },
});
