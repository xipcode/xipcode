
const SERVER = 'server';
const LOCAL = 'local';
const validProfiles = [SERVER, LOCAL];

function validate(profile) {
	if (profile && validProfiles.indexOf(profile) < 0) {
		throw new Error(`'${profile}' is not a valid profile. A profile must be one of [${validProfiles}]`);
	}
}

export default {
	SERVER,
	LOCAL,
	validate
}