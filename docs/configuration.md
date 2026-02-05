# Configuration

The Restify service server accepts configuration through Fable settings. Restify-specific options are passed in the `RestifyConfiguration` object.

## Configuration Lookup

The module checks for Restify configuration in this order:

1. `options.RestifyConfiguration` (service instantiation options)
2. `fable.settings.RestifyConfiguration` (Fable settings)
3. Empty object `{}` (default)

## Default Configuration

The module sets one default that Restify doesn't:

```javascript
{
	maxParamLength: Number.MAX_SAFE_INTEGER
}
```

This prevents Restify from truncating long URL parameters. Your `RestifyConfiguration` settings are merged on top of this default.

## Configuration Options

Any option accepted by `restify.createServer()` can be passed through `RestifyConfiguration`:

```javascript
const _Fable = new libFable({
	Product: 'MyAPIServer',
	ServicePort: 8080,
	RestifyConfiguration: {
		strictNext: true,
		maxParamLength: 500
	}
});
```

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `maxParamLength` | number | `Number.MAX_SAFE_INTEGER` | Maximum URL parameter length |
| `strictNext` | boolean | `false` | Require next() to be called in handlers |
| `name` | string | - | Server name (uses Restify default if not set) |
| `version` | string | - | API version string |

## Example: JSON Configuration File

```json
{
	"Product": "MyAPIServer",
	"ProductVersion": "2.0.0",
	"ServicePort": 8080,
	"RestifyConfiguration": {
		"strictNext": true
	},
	"LogStreams": [
		{ "level": "info" }
	]
}
```
