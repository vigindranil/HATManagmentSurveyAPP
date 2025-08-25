import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export async function compressImageUri(uri: string, minKB = 200, maxKB = 300): Promise<string> {
  if (!uri) throw new Error('No URI provided for compression');

  try {
    let quality = 0.8; 
    let width = 1200;  // start with higher resolution for good quality
    let resultUri = uri;
    let sizeKB = Infinity;

    while ((sizeKB > maxKB || sizeKB < minKB) && quality > 0.1 && width > 400) {
      const context = ImageManipulator.ImageManipulator.manipulate(uri);
      context.resize({ width });

      const rendered = await context.renderAsync();
      const result = await rendered.saveAsync({
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      });

      // const info = await FileSystem.getInfoAsync(result.uri, { size: true });
      // sizeKB = info.exists && info.size ? info.size / 1024 : Infinity;

      resultUri = result.uri;
      // console.log('Current sizeKB:', sizeKB, 'Quality:', quality, 'Width:', width);

     
      if (sizeKB > maxKB) {
        quality -= 0.05;  
        width -= 100;     
      } else if (sizeKB < minKB) {
        quality += 0.05;  
        width += 50;      
      }
      if (quality > 0.9) quality = 0.9;
      if (width > 1200) width = 1200;
    }

    if (!resultUri) throw new Error('Compression failed: no URI generated');
    // console.log('Final sizeKB:', sizeKB);

    return resultUri;


  } catch (error) {
    console.error(error);
    throw new Error('Image compression failed');
  }
}
