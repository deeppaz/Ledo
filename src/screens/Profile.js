import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { View, PermissionsAndroid, ScrollView, RefreshControl, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Layout, RadioButton, Button, TopNav, SectionContent, Section, useTheme } from 'react-native-rapi-ui';
import RNBluetoothClassic, { BTEvents, BTCharsets, BluetoothEventType, BluetoothDevice } from 'react-native-bluetooth-classic';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const StyledView = styled(View)
const StyledText = styled(Text)
const Box = ({ className, onPress, boxColor, ...props }) => (
	<StyledText onPress={onPress} className={`flex flex-1 text-center h-14 basis-[32] justify-center items-center text-white ${boxColor} rounded ${className}`} {...props} />
)

export default function Profile() {
	const [connectedDevice, setConnectedDevice] = useState({})
	const [deviceAddress, setDeviceAddress] = useState('');
	const [bondedDevice, setBondedDevice] = useState(false);
	const [deviceName, setDeviceName] = useState('');
	const [discovery, setDiscovery] = useState({});
	const [isDeviceBluetoothSupport, setIsDeviceBluetoothSupport] = useState(true);
	const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [brightnessCount, setBrightnessCount] = useState(10);
	const [isLambOn, setIsLambOn] = useState(false);
	const [isLambOff, setIsLambOff] = useState(false);
	const [loading, setLoading] = useState(false);
	const { isDarkmode, setTheme } = useTheme();
	const [modalVisible, setModalVisible] = useState(false);
	const [date, setDate] = useState(new Date(1598051730000));
	const currentDate = new Date();

	useEffect(() => {
		currentConnectedDevices();
		startDiscovery();

		RNBluetoothClassic.isBluetoothEnabled().then((res) => {
			setIsBluetoothEnabled(res)
		});

		// setInterval(() => {
		// 	turnOnLamb();
		// }, 1000)
	}, [refreshing]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
		}, 1000)
	}, [])

	async function turnOnLamb() {
		if (currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) == date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) {
			try {
				(await RNBluetoothClassic.connectToDevice(deviceAddress)).write("CMD:1,1", "utf-8").then((res) => {
					setIsLambOn(res)
				}).catch((err) => {
					console.log(err);
				})
			} catch (error) {
				console.log(error)
			}
		} else {
			try {
				(await RNBluetoothClassic.connectToDevice(deviceAddress)).write("CMD:1,0", "utf-8").then((res) => {
					setIsLambOff(res);
				}).catch((err) => {
					console.log(err)
				})
			} catch (error) {
				console.log(error)
			}
		}
	}

	const onChange = (event, selectedDate) => {
		const currentDate = selectedDate;
		setDate(currentDate);
	};

	const showMode = (currentMode) => {
		DateTimePickerAndroid.open({
			value: date,
			onChange,
			mode: currentMode,
			is24Hour: true,
			timeZoneName: "Europe/Istanbul",
			display: "spinner"
		});
	};

	const showDatepicker = () => {
		showMode('date');
	};

	const showTimepicker = () => {
		showMode('time');
	};
	console.log(currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
	console.log(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

	async function requestAccessFineLocationPermission() {
		const granted = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
			{
				title: 'Access fine location required for discovery',
				message:
					'In order to perform discovery, you must enable/allow ' +
					'fine location access.',
				buttonNeutral: 'Ask Me Later"',
				buttonNegative: 'Cancel',
				buttonPositive: 'OK'
			}
		);
		return granted === PermissionsAndroid.RESULTS.GRANTED;
	}

	const startDiscovery = async () => {
		try {
			const granted = await requestAccessFineLocationPermission();

			if (!granted) {
				throw new Error(`Access fine location was not granted`);
			}

			setDiscovery({ discovering: true });

			try {
				const unpaired = await RNBluetoothClassic.startDiscovery();
				console.log("Found " + unpaired.length + " unpaired devices")
			} finally {
				setDiscovery({ devices, discovering: false });
			}
		} catch (err) {
			console.log(err.message)
		}
	}

	async function currentConnectedDevices() {
		try {
			await RNBluetoothClassic.getBondedDevices().then((res) => {
				res.forEach(s => setDeviceAddress(s.address))
				res.forEach(s => setDeviceName(s.name))
				res.forEach(s => setBondedDevice(s.bonded))
				setConnectedDevice(res);
			})
		} catch (err) {
			console.log("Bonded devices: " + err)
		}
	}

	async function changeColor(color) {
		try {
			(await RNBluetoothClassic.connectToDevice(deviceAddress)).write(color, "utf-8").then((res) => {
				// setLoading(true);
				// setIsLambOn(false);
				// setLoading(false);
				// setIsLambOff(true);
			}).catch((err) => {
				console.log(err)
			})
		} catch (error) {
			console.log(error)
		}
	}

	async function changeBrightness() {
		try {
			(await RNBluetoothClassic.connectToDevice(deviceAddress)).write("CMD:3," + brightnessCount, "utf-8").then((res) => {
				// setLoading(true);
				// setIsLambOn(false);
				// setLoading(false);
				// setIsLambOff(true);
			}).catch((err) => {
				console.log(err)
			})
		} catch (error) {
			console.log(error)
		}
	}

	function enableBluetooth() {
		try {
			RNBluetoothClassic.openBluetoothSettings();
		} catch (error) {
			console.log(error)
		}
	}

	const incrementBrightnessCount = () => {
		if (brightnessCount > 250) {
			alert("Max Brightness :( Watch out your eyes.")
			return;
		}
		setBrightnessCount(brightnessCount + 10);
		changeBrightness(brightnessCount)
	}

	const decrementBrightnessCount = () => {
		if (brightnessCount !== 10) {
			setBrightnessCount(brightnessCount - 10);
		}
		changeBrightness(brightnessCount)
	}

	return (
		<Fragment>
			<Layout>
				<ScrollView refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}>
					<TopNav middleContent="Profile" rightContent={isLambOn ? "🔴" : "🟢"} rightTextStyle={{ textAlign: "center" }} />
					<View style={{
						paddingLeft: 30,
						paddingRight: 30,
						paddingBottom: 20,
						paddingTop: 10
					}}>
						<Section>
							<SectionContent>
								<Text style={{ fontWeight: "700", fontSize: 20 }}>On this page</Text>
								<Text>You can adjust the colors and brightness of the light. You can run it at any time you want from the alarm mode</Text>
							</SectionContent>
						</Section>

					</View>
					<View style={{
						paddingLeft: 30,
						paddingRight: 30,
						paddingBottom: 5
					}}>
						<Section>
							<SectionContent>
								<Text style={{ fontWeight: "700", fontSize: 20, paddingBottom: 10 }}>Choice color</Text>
								<StyledView className="flex flex-row flex-wrap content-center items-center gap-2 overflow-hidden">
									<Box onPress={() => changeColor("CMD:2,200")} boxColor={"bg-blue-700"} className={"pt-4"}>Blue</Box>
									<Box onPress={() => changeColor("CMD:2,650")} boxColor={"bg-blue-300"} className={"pt-4"}>Light Blue</Box>
									<Box onPress={() => changeColor("CMD:2,100")} boxColor={"bg-green-500"} className={"pt-4"}>Green</Box>
									<Box onPress={() => changeColor("CMD:2,300")} boxColor={"bg-yellow-300"} className={"pt-4"}>Yellow</Box>
									<Box onPress={() => changeColor("CMD:2,500")} boxColor={"bg-red-500"} className={"pt-4"}>Red</Box>
									<Box onPress={() => changeColor("CMD:2,800")} boxColor={"bg-orange-500"} className={"pt-4"}>Orange</Box>
									<Box onPress={() => changeColor("CMD:2,900")} boxColor={"bg-cyan-400"} className={"pt-4"}>Cyan</Box>
								</StyledView>
							</SectionContent>
						</Section>

					</View>
					<View style={{
						paddingLeft: 30,
						paddingRight: 30,
						paddingBottom: 5
					}}>
						<Section>
							<SectionContent>
								<Text style={{ fontWeight: "700", fontSize: 20, paddingBottom: 10 }}>Set brightness</Text>
								<StyledView className="flex flex-row flex-wrap content-center items-center gap-2 overflow-hidden">
									<Box onPress={decrementBrightnessCount} boxColor={"bg-[#c43042]"} className={"pt-4"}>Decrease -</Box>
									<Box onPress={incrementBrightnessCount} boxColor={"bg-[#c43042]"} className={"pt-4"}>Increase +</Box>
								</StyledView>
							</SectionContent>
						</Section>

					</View>

					<View style={{
						paddingLeft: 30,
						paddingRight: 30,
						paddingTop: 10,
						paddingBottom: 10
					}}>
						<Section>
							<SectionContent>
								<Text style={{ fontWeight: "700", fontSize: 20, paddingBottom: 10 }}>Alarm mode</Text>
								<StyledView className="flex flex-row flex-wrap content-center items-center gap-2 overflow-hidden">
									<Box onPress={() => setModalVisible(true)} boxColor={"bg-[#c43042]"} className={"pt-4"}>Set alarm</Box>
								</StyledView>
							</SectionContent>
						</Section>

					</View>

					{/* set alarm modal */}
					<Modal
						animationType="slide"
						transparent={true}
						visible={modalVisible}
						onRequestClose={() => {
							alert('Modal has been closed.');
							setModalVisible(!modalVisible);
						}}>

						<View style={styles.centeredView}>
							<View style={styles.modalView}>
								<View style={{
									paddingLeft: 30,
									paddingRight: 30,
									paddingTop: 10,
									paddingBottom: 10
								}}>
									<Section>
										<SectionContent>
											<Text style={{ fontWeight: "700", fontSize: 20, paddingBottom: 10 }}>Alarm mode</Text>
											<StyledView className="flex flex-row flex-wrap content-center items-center gap-2 overflow-hidden">

												<Box onPress={showTimepicker} boxColor={"bg-[#c43042]"} className={"pt-4"}>Set Time</Box>
											</StyledView>
										</SectionContent>
									</Section>

								</View>
								<StyledView className="flex flex-row flex-wrap content-center items-center gap-2 overflow-hidden">
									<Box onPress={turnOnLamb} boxColor={"bg-[#c43042]"} className={"pt-4"}>Save</Box>
									<Box onPress={() => setModalVisible(!modalVisible)} boxColor={"bg-black"} className={"pt-4"}>Close</Box>
								</StyledView>
							</View>
						</View>
					</Modal>
				</ScrollView>

			</Layout>
		</Fragment>

	);
}
const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
	},
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
	},
	buttonOpen: {
		backgroundColor: '#F194FF',
	},
	buttonClose: {
		backgroundColor: '#2196F3',
	},
	textStyle: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	modalText: {
		marginBottom: 15,
		textAlign: 'center',
	},
});