'use strict';

const modeToString = (mode) => {
	switch(mode) {
		case 0:
			return "std";
		case 1:
			return "taiko";
		case 2:
			return "ctb";
		case 3:
			return "mania";
	}
};

module.exports = modeToString;