import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob'

export const pickImage = function(cb, mediaType='photo') {
  ImagePicker.launchImageLibrary({mediaType: mediaType}, (response) => {
  	if (response.error) {
      console.log('ImagePicker Error: ', response.error);
      return cb(response.error);
  	} 

  	if (response.didCancel) {
      console.log('User cancelled image picker');
  	}

    // Checking the platform and change the uri if needed
    if (Platform.OS === 'android' && response.path) {
      response.uri = 'file://' + response.path;
    }

    if (Platform.OS === 'ios' && response.uri) {
      response.uri = response.uri.replace('file://', '');
    }

    // Sometime react-native-image-picker library doesn't give fileName
    if (!response.fileName && response.uri) {
      let paths = response.uri.split('/');
      response.fileName = paths[paths.length - 1];
    }

    /** For react-native-image-picker library doesn't return type in iOS,
     *  it is necessary to force the type to be an image/jpeg (or whatever you're intended to be).
     */
    if (!response.type && Platform.OS === 'ios') {
      response.type = 'image/jpeg';
    }

   	return cb(null, {
   	  didCancel: response.didCancel,
      uri: response.uri,
      name: response.fileName,
      type: response.type,
      path: response.path
    })
  });
}

export const uploadFile = async function(client, file, type) {
	let metaData = await client.File.__getMetaData(file, type);
	const fileData = await client.File.__requestUploadUrl({name: file.name});

	return new Promise((resolve, reject) => {
    return RNFetchBlob.fetch(
  	  'PUT',
    	fileData['uploadUrl'],
    	{'Content-Type': file.type},
  	    RNFetchBlob.wrap(file.uri)
    	).then(res => {
  	    metaData['fileUrl'] = fileData['fileUrl'];
  	    metaData['type'] = metaData['attachmentType'];
  	    return resolve(metaData);
    	}).catch(err => {
  	    console.log('err', err);
  	    return reject(err);
	  	})
 });
}