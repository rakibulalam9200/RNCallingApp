const plugins = [];

// Safely enable React Compiler only if the package is installed in node_modules
try {
  require.resolve('babel-plugin-react-compiler');
  plugins.push(['babel-plugin-react-compiler', { target: '19' }]);
} catch (e) {
  // Plugin not installed yet; falls back to standard compilation without crashing Metro
}

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins,
};

