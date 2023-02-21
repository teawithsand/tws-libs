# tws-config

Utils that are useful when storing configs on clients.

It has:
- Management of loading process, with react hook that utilizes suspense during loading
- Pluggable storage layer
- Pluggable serialization, with template for versioning

In other words, it's like `localforage`, but does not implement key-value by itself and has more layers to make it more useful in real-world app usage.