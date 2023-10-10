import React from 'react';
import { View } from 'react-native';
import {
	Layout, 
	Button, 
	Text, 
	useTheme, 
	Section,
	SectionContent,
	TopNav,
} from 'react-native-rapi-ui';

export default function Profile({ navigation }) {
	const { isDarkmode, setTheme } = useTheme();

	return (
		<Layout>
			<TopNav middleContent="Profile" />
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Section>
					<SectionContent>
						<Button
							text={isDarkmode ? "Light Mode" : "Dark Mode"}
							status={isDarkmode ? "success" : "warning"}
							onPress={() => {
								if (isDarkmode) {
									setTheme("light");
								} else {
									setTheme("dark");
								}
							}}
							style={{
								marginTop: 10,
							}}
						/>
					</SectionContent>
				</Section>
			</View>
		</Layout>
	);
}
