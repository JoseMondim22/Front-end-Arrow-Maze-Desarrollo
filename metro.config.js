// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// three.js ships separate CJS ("main": three.cjs) and ESM ("module":
// three.module.js) builds behind package.json#exports. With Metro's package
// exports resolution on (Expo SDK 50+ default), different import sites can
// resolve to different builds, producing two distinct `three` module
// instances in the same bundle ("WARNING: Multiple instances of Three.js
// being imported."). @react-three/fiber's applyProps then fails its
// constructor-identity check for Vector3/Quaternion/etc. against our own
// `three` instance and falls back to a raw property assignment, which throws
// because Object3D.position/quaternion are read-only accessors. Forcing
// Metro back to main/browser-field resolution keeps every import of `three`
// pointed at the same build.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
