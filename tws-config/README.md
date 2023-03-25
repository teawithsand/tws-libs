# tws-config

Utils that are useful when storing configs on clients.

It has:

-   Management of loading process, with react hook that utilizes suspense during loading
-   Pluggable storage layer
-   Pluggable serialization, with template for versioning

In other words, it's like `localforage`, but does not implement key-value by itself and has more layers to make it more useful in real-world app usage.

# Testing

Although it's helpful, this library can't 100% correctly ensure that old-data-version deserialization will work,
which is the most annoying part when it comes to storing apps configs.

There are three main groups of tests, which should be performed on any kind of data, which is anyhow stored:

-   serialize + deserialize test, deserialized object should be equal to original one
-   freeze serialized object test, in order to make sure that any kind of old object can be properly deserialized
-   gibberish deserialization test - in general, deserializers should never crash your app, even if they are feed with invalid data

# Useful external library: `class-transformer`

[class-transformer](https://www.npmjs.com/package/class-transformer) is library, which is capable to transform
classes into plain JS objects and vice versa.

[class-transformer-validator](https://www.npmjs.com/package/class-transformer-validator) should be used along with `class-transformer`, since otherwise type mistakes may occur. This also implies that [class-validator](https://www.npmjs.com/package/class-validator) should be used as well.

Btw to use these, you have to include `reflect-metadata`. More info about it on [class-transformer git repo](https://github.com/typestack/class-transformer#browser)
