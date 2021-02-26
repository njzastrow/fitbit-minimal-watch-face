function Init(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Pixelish Minimal Watch Face Settings</Text>}>
        <TextInput
          label="OpenWeather API Key"
          title="OpenWeatherAPIKey"
          settingsKey="OpenWeatherAPIKey"
          placeholder="Your OpenWeather API Key"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(Init);