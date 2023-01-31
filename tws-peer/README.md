# tws-peer

P2P communications via WebRTC done as simply as possible.
Internally it wraps peer.js, while providing reasonable defaults.

- It implements interfaces, which make operating on peerjs more like listening to/reading/writing to a socket in go/c/rust.
- It adds some more features like automating ID generation and quick setup.