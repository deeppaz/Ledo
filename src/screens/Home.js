import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { View, PermissionsAndroid, ScrollView, RefreshControl } from 'react-native';
import { Layout, RadioButton, Text, Button, TopNav, SectionContent, Section, useTheme } from 'react-native-rapi-ui';
import RNBluetoothClassic, { BTEvents, BTCharsets, BluetoothEventType, BluetoothDevice } from 'react-native-bluetooth-classic';
import { Ionicons } from '@expo/vector-icons';


export default function Home() {
	const [connectedDevice, setConnectedDevice] = useState({})
	const [deviceAddress, setDeviceAddress] = useState('');
	const [bondedDevice, setBondedDevice] = useState(false);
	const [deviceName, setDeviceName] = useState('');
	const [discovery, setDiscovery] = useState({});
	const [isDeviceBluetoothSupport, setIsDeviceBluetoothSupport] = useState(true);
	const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [isLambOn, setIsLambOn] = useState(false);
	const [isLambOff, setIsLambOff] = useState(false);
	const [loading, setLoading] = useState(false);
	const { isDarkmode, setTheme } = useTheme();

	useEffect(() => {
		currentConnectedDevices();
		startDiscovery();
		RNBluetoothClassic.isBluetoothAvailable().then((res) => {
			setIsDeviceBluetoothSupport(res)
		})
		RNBluetoothClassic.isBluetoothEnabled().then((res) => {
			setIsBluetoothEnabled(res)
		});
	}, [refreshing]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
		}, 2000)

	}, [])

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

	async function turnOnLamb() {
		try {
			(await RNBluetoothClassic.connectToDevice(deviceAddress)).write("CMD:1,1", "utf-8").then((res) => {
				setLoading(true);
				setIsLambOn(false);
				setLoading(false);
				setIsLambOff(true);
			}).catch((err) => {
				console.log(err)
			})
		} catch (error) {
			console.log(error)
		}
	}
	async function turnOffLamb() {
		try {
			(await RNBluetoothClassic.connectToDevice(deviceAddress)).write("CMD:1,0", "utf-8").then((res) => {
				setLoading(true);
				setIsLambOff(res);
				setLoading(false);
				setIsLambOn(true)
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
	return (
		<Fragment>
			{isDeviceBluetoothSupport ? <Layout>
				<ScrollView refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}>
					<TopNav middleContent="Home" rightContent={isLambOn ? "🔴" : "🟢"} rightTextStyle={{textAlign: "center"}} />
					<View style={{
						padding: 30
					}}>
						<Section>
							<SectionContent>
								<Text style={{ fontWeight: "700" }} size='h2'>Hello</Text>
								<Text>Welcome to {"\n"}<Text style={{ fontWeight: "700", fontSize: 20 }}>Wakeup Sunshine</Text></Text>
								<Text style={{ fontSize: 10, paddingTop: 10, fontStyle: "italic" }}>More information, you can go About section</Text>
							</SectionContent>
						</Section>

					</View>
					<View
						style={{
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{isBluetoothEnabled ? <Section>
							<SectionContent>
								{isLambOn ?
									<Button
										text={"Turn On"}
										onPress={turnOnLamb}
										style={{
											marginTop: 10,
											height: 290,
											borderRadius: 1000,
											minWidth: 300
										}}
										disabled={loading}
										color='#c43042'
										rightContent={
											<Ionicons name="flash" size={20} color="white" />
										}
									/> : <Button
										text={"Turn Off"}
										onPress={turnOffLamb}
										style={{
											marginTop: 10,
											height: 290,
											borderRadius: 1000,
											minWidth: 300
										}}
										disabled={loading}
										color='#c43042'
										rightContent={
											<Ionicons name="flash-off" size={20} color="white" />
										}
									/>}


							</SectionContent>
						</Section> :
							<Section>
								<SectionContent>
									<Button
										text="Enable Bluetooth"
										onPress={enableBluetooth}
										style={{
											marginTop: 10,
										}}
										color='#c43042'
										rightContent={
											<Ionicons name="power" size={20} color="white" />
										} />
								</SectionContent>
							</Section>
						}

					</View>
				</ScrollView>

			</Layout> : <Text>Your device not support bluetooth</Text>}
		</Fragment>

	);
}
