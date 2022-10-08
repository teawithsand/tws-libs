global.___loader = {
	enqueue: jest.fn(),
}

global.crypto = require("@trust/webcrypto")
require("web-streams-polyfill")
