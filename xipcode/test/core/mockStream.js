
function mockStream() {
	return {
		pipe() {
			return this;
		},
		on(event, callback) {
			callback();
		}
	}
}

export default {
	create: mockStream
}
