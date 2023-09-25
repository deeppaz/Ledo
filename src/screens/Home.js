import React from "react";
import { View, Linking } from "react-native";
import {
  Layout,
  Text,
  Section,
  SectionContent,
  Button
} from "react-native-rapi-ui";

export default function ({ navigation }) {
  return (
    <Layout>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: 20,
        }}
      >
        <Section>
          <SectionContent>
            <Text fontWeight="bold" style={{ textAlign: "center" }}>
              Welcome to the Wakeup Sunshine
            </Text>
            {/* <Button
              text="Go to second screen"
              onPress={() => {
                navigation.navigate("SecondScreen");
              }}
              style={{
                marginTop: 10,
              }}
            /> */}
             <Button
              text="Turn On"
        
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
