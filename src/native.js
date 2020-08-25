import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob'
import { createThumbnail as RNCreateThumbnail} from "react-native-create-thumbnail";
import ImageResizer from 'react-native-image-resizer';

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
    if (!response.type) {
      response.type = 'image/jpeg';
    }
console.log('response', response);
   	return cb(null, {
   	  didCancel: response.didCancel,
      uri: response.uri,
      name: response.fileName,
      type: response.type,
      path: response.path
    })
  });
}

export const createResizedImage = function(file, newWidth, newHeight) {
  return new Promise((resolve, reject) => {
    ImageResizer.createResizedImage(file.uri, newWidth, newHeight, 'JPEG', 100)
    .then(response => {
      return resolve({
       uri: response.uri,
       type: "image/jpeg",
       height: response.height,
       width: response.width
     });
    }).catch(err => {
      reject(err);
    });
  })
}

export const createThumbnail = function(file, timestamp = 0) {
  return new Promise((resolve, reject) => {
    RNCreateThumbnail({
      url: file.uri,
      timeStamp: timestamp,
    })
    .then(response => {
      return resolve({
       uri: response.path,
       type: "image/jpeg",
       height: response.height,
       width: response.width
     });
    }).catch(err => {
      reject(err);
    });
  })
}

export const uploadFile = async function(client, file, type, thumbnailFile = null) {
  let metaData = await client.File.__getMetaData(file, type);
  if (thumbnailFile) {
    metaData['thumbnailFile'] = thumbnailFile;
  }

  const requestUploadUrlData = client.File.__getRequestUploadUrlData(metaData);
	const fileData = await client.File.__requestUploadUrl(requestUploadUrlData);

	return new Promise((resolve, reject) => {
    return RNFetchBlob.fetch(
  	  'PUT',
    	fileData['uploadUrl'],
    	{'Content-Type': file.type},
  	    RNFetchBlob.wrap(file.uri)
    	).then(res => {
  	    metaData['fileUrl'] = fileData['fileUrl'];
        metaData['type'] = metaData['attachmentType'];
        
        // Upload thumbnail
        if (fileData['uploadThumbnailUrl']) {
          let thumbnailFile = metaData['thumbnailFile'];
          return RNFetchBlob.fetch(
            'PUT',
            fileData['uploadThumbnailUrl'],
            {'Content-Type': thumbnailFile.type},
              RNFetchBlob.wrap(thumbnailFile.uri)
            ).then(res => {
              delete metaData.thumbnailFile;
              metaData['thumbnailUrl'] = fileData['thumbnailUrl'];
              return resolve(metaData);
            })
        }
        
  	    return resolve(metaData);
    	}).catch(err => {
  	    console.log('err', err);
  	    return reject(err);
	  	})
 });
}