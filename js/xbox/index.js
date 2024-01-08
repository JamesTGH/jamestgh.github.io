import { getPackageObject } from './getPackageObject.js';

$(document).ready(function () {
	$('#fileInput').on('change', function (event) {
		const inputFile = event.target.files[0];

		if (inputFile) {
			getPackageObject(inputFile).then(packageObject => {
				$('#package-object').empty();
				for (const key in packageObject) {
					if (packageObject.hasOwnProperty(key)) {
						$('#package-object').append($('<tr>').append(`
							<th scope="row">${key}</th>
							<td class="text-break">${packageObject[key]}</td>
						`));
					}
				}
			}).catch(error => {
				console.error('Error using function getPackageObject():', error);
			});
		}
	});
});