import os
from upath import UPath

_PLUGINS_DIR = "plugins"
def PluginDirectory(logdir, plugin_name):
    return os.path.join(logdir, _PLUGINS_DIR, plugin_name)

def ListAssets(logdir, plugin_name):
    plugin_dir = PluginDirectory(logdir, plugin_name)
    try:
        # Strip trailing slashes, which listdir() includes for some filesystems.
        return [x.rstrip("/") for x in UPath(plugin_dir).iterdir()]
    except FileNotFoundError:
        return []
