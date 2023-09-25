import React from 'react';
import { View } from 'react-native';
import {
	Layout, 
	Button, 
	Text, 
	useTheme, 
	Section,
	SectionContent,
} from 'react-native-rapi-ui';

export default function ({ navigation }) {
	const { isDarkmode, setTheme } = useTheme();

	return (
		<Layout>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Section>
					<SectionContent>
						<Text>This is the Profile tab</Text>
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
