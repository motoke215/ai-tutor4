import android.Manifest;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginHandle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        registerNativeAudioPluginPermissions();
    }

    private void registerNativeAudioPluginPermissions() {
        PluginHandle pluginHandle = getBridge().getPlugin("NativeAudioPermissions");
        Plugin plugin = pluginHandle != null ? pluginHandle.getInstance() : null;
        if (plugin == null) return;
        plugin.requestPermissionForAlias("microphone", null, "bootstrapPermissionsCallback");
    }

    @com.getcapacitor.annotation.Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "microphone")
    private String microphonePermission;

    @com.getcapacitor.annotation.PermissionCallback
    private void bootstrapPermissionsCallback(com.getcapacitor.PluginCall call) {
        // no-op: only used to ensure Android registers the microphone runtime permission entry
    }
}
