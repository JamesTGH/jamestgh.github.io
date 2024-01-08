export async function getPackageObject(inputFile) {

	const fileHeaderOffsets = {
		packageMagic:					['0x0', '0x4'],
		packageCertOwnerConsoleID: 		['0x6', '0xB'],
		packageCertOwnerConsolePN: 		['0xB', '0x1F'],
		packageCertOwnerConsoleType: 	['0x1F', '0x20'],
		packageCertDateOfGeneration: 	['0x20', '0x28'],
		packagePublicExponent: 			['0x28', '0x2C'],
		packagePublicModulus: 			['0x2C', '0xAC'],
		packageCertSignature: 			['0xAC', '0x1AC'],
		packageSignature: 				['0x1AC', '0x22C']
	};

	const fileMetadataOffsets = {
		packageLicensingData: 			['0x22C', '0x32C'],
		packageContentID: 				['0x32C', '0x340'],
		packageEntryID: 				['0x340', '0x344'],
		packageContentType: 			['0x344', '0x348'],
		packageMetadataVersion: 		['0x348', '0x34C'],
		packageContentSize: 			['0x34C', '0x354'],
		packageMediaID: 				['0x354', '0x358'],
		packageVersion: 				['0x358', '0x35C'],
		packageBaseVersion: 			['0x35C', '0x360'],
		packageTitleID: 				['0x360', '0x364'],
		packagePlatform: 				['0x364', '0x365'],
		packageExecutableType: 			['0x365', '0x366'],
		packageDiscNumber: 				['0x366', '0x367'],
		packageDiscInSet: 				['0x367', '0x368'],
		packageSaveGameID: 				['0x368', '0x36C'],
		packageConsoleID: 				['0x36C', '0x371'],
		packageProfileID: 				['0x371', '0x379'],
		packageVDStructSize: 			['0x379', '0x37A'],
		packageFileSystemVD: 			['0x37A', '0x39D'],
		packageDataFileCount: 			['0x39D', '0x3A1'],
		packageDataFileCombinedSize: 	['0x3A1', '0x3A9'],
		packageDeviceID: 				['0x3FD', '0x411'],
		packageDisplayName: 			['0x411', '0xD11'],
		packageDisplayDescription: 		['0xD11', '0x1611'],
		packagePublisherName: 			['0x1611', '0x1691'],
		packageTitleName: 				['0x1691', '0x1711'],
		packageTransferFlags: 			['0x1711', '0x1712']
	};

	const fileMetadataV1Offsets = {
		packageThumbnailImageSize: 		['0x1712', '0x1716'],
		packageTitleThumbnailImageSize: ['0x1716', '0x171A'],
		packageThumbnailImage: 			['0x171A', '0x571A'],
		packageTitleThumbnailImage: 	['0x571A', '0x971A']
	};

	const fileMetadataV2Offsets = {
		packageSeriesID: 				['0x3B1', '0x3C1'],
		packageSeasonID: 				['0x3C1', '0x3D1'],
		packageSeasonNumber: 			['0x3D1', '0x3D3'],
		packageEpisodeNumber: 			['0x3D5', '0x3D7'],
		packageThumbnailImage: 			['0x171A', '0x541A'],
		packageAdditionalDisplayNames: 	['0x541A', '0x571A'],
		packageTitleThumbnailImage: 	['0x571A', '0x941A'],
		packageAdditionalDisplayDesc: 	['0x941A', '0x971A']
	};

	const fileObject = {};

	const readFileAsync = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (event) => resolve(new Uint8Array(event.target.result.slice(0, 38682)));
			reader.onerror = (error) => reject(error);
			reader.readAsArrayBuffer(file);
		});
	};

	try {
		const fileContent = await readFileAsync(inputFile);

		const packageMagic = Array.from(fileContent.slice(parseInt(fileHeaderOffsets['packageMagic'][0], 16), parseInt(fileHeaderOffsets['packageMagic'][1], 16))).map(byte => byte.toString(16).padStart(2, '0')).join('');

		fileObject['packageMagic'] = packageMagic.match(/.{1,2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');

		if (['4c495645', '50495253'].includes(packageMagic)) {
			fileObject['packageSignature'] = Array.from(fileContent.slice(parseInt('0x4', 16), parseInt('0x104', 16))).map(byte => byte.toString(16).padStart(2, '0')).join('');
		} else if (packageMagic === '434f4e20') {
			for (const headerName in fileHeaderOffsets) {
				let startOffset = parseInt(fileHeaderOffsets[headerName][0], 16);
				let endOffset = parseInt(fileHeaderOffsets[headerName][1], 16);

				const headerValue = Array.from(fileContent.slice(startOffset, endOffset)).map(byte => byte.toString(16).padStart(2, '0')).join('');

				if (['packageCertOwnerConsolePN', 'packageCertDateOfGeneration'].includes(headerName)) {
					fileObject[headerName] = headerValue.match(/.{1,2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
				} else {
					fileObject[headerName] = headerValue;
				}
			}
		}

		for (const metadataName in fileMetadataOffsets) {
			let startOffset = parseInt(fileMetadataOffsets[metadataName][0], 16);
			let endOffset = parseInt(fileMetadataOffsets[metadataName][1], 16);

			const metadataValue = Array.from(fileContent.slice(startOffset, endOffset)).map(byte => byte.toString(16).padStart(2, '0')).join('');

			if (metadataName === 'packageLicensingData') {
				fileObject[metadataName] = metadataValue.match(/.{1,32}/g);
			} else if (['packageContentType', 'packageMetadataVersion', 'packageContentSize', 'packageVersion', 'packageBaseVersion', 'packageDataFileCount', 'packageDataFileCombinedSize'].includes(metadataName)) {
				fileObject[metadataName] =  parseInt(metadataValue, 16) | 0;
			} else if (['packageEntryID', 'packageMediaID', 'packageSaveGameID'].includes(metadataName)) {
				fileObject[metadataName] =  parseInt(metadataValue, 16) >>> 0;
			} else if (metadataName === 'packageDisplayName') {
				fileObject[metadataName] = metadataValue.match(/.{1,384}/g).map((locale) => Array.from({ length: locale.length / 4 }, (_, i) => String.fromCharCode(parseInt(locale.substr(i * 4, 4), 16))).join('').replace(/\u0000/g, ''));
			} else if ([ 'packageDisplayDescription', 'packagePublisherName', 'packageTitleName'].includes(metadataName)) {
				fileObject[metadataName] = Array.from({ length: metadataValue.length / 4 }, (_, i) => String.fromCharCode(parseInt(metadataValue.substr(i * 4, 4), 16))).join('').replace(/\u0000/g, '');
			} else {
				fileObject[metadataName] = metadataValue;
			}
		}

		if (fileObject['packageMetadataVersion'] === 1) {
			for (const metadataName in fileMetadataV1Offsets) {
				const startOffset = parseInt(fileMetadataV1Offsets[metadataName][0], 16);
				const endOffset = parseInt(fileMetadataV1Offsets[metadataName][1], 16);
	
				const metadataValue = Array.from(fileContent.slice(startOffset, endOffset)).map(byte => byte.toString(16).padStart(2, '0')).join('');
	
				if (['packageThumbnailImageSize', 'packageTitleThumbnailImageSize'].includes(metadataName)) {
					fileObject[metadataName] =  parseInt(metadataValue, 16) | 0;
				} else {
					fileObject[metadataName] = metadataValue;
				}
			}
		}
		
		if (fileObject['packageMetadataVersion'] === 2) {
			for (const metadataName in fileMetadataV2Offsets) {
				const startOffset = parseInt(fileMetadataV2Offsets[metadataName][0], 16);
				const endOffset = parseInt(fileMetadataV2Offsets[metadataName][1], 16);
	
				const metadataValue = Array.from(fileContent.slice(startOffset, endOffset)).map(byte => byte.toString(16).padStart(2, '0')).join('');
	
				if (['packageSeasonNumber', 'packageEpisodeNumber'].includes(metadataName)) {
					fileObject[metadataName] =  parseInt(metadataValue, 16) | 0;
				} else if (['packageAdditionalDisplayNames', 'packageAdditionalDisplayDesc'].includes(metadataName)) {
					fileObject[metadataName] = metadataValue.match(/.{1,128}/g);
				} else {
					fileObject[metadataName] = metadataValue;
				}
			}
		}

		return fileObject;
	} catch (error) {
		console.error('Error reading file:', error);
		return null;
	}
}