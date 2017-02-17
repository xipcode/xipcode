import check from './check';

function createPromiseFromStream(stream) {
	check.definedObject('stream', stream);
	function executor(resolve, reject) {
		stream.on('end', resolve);
		stream.on('finish', resolve);
		stream.on('error', reject);
		stream.on('readable', () => {
			stream.resume();
		});
	}
	return new Promise(executor);
}

export default {
	createPromiseFromStream
}