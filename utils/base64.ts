import * as FileSystem from 'expo-file-system';

const handleSignatureSaved = async (
  uri: string
) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const base64Data = `data:image/png;base64,${base64}`;
    return base64Data;
  } catch (error) {
    console.error('Error converting signature to base64:', error);
  }
};



export default handleSignatureSaved;
