package com.aitutor.pro;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.Settings;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "NativeAudioPermissions",
    permissions = {
        @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "microphone")
    }
)
public class NativeAudioPermissionsPlugin extends Plugin {
    @PluginMethod
    public void checkPermissions(PluginCall call) {
        call.resolve(buildPermissionResult());
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED
                || ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            call.resolve(buildPermissionResult());
            return;
        }

        requestPermissionForAlias("microphone", call, "permissionsCallback");
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.fromParts("package", getContext().getPackageName(), null));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        if (call != null) {
            call.resolve(buildPermissionResult());
        }
    }

    private JSObject buildPermissionResult() {
        JSObject result = new JSObject();
        result.put("microphone", getMicrophoneState());
        result.put("speaker", "granted");
        result.put("speakerVisibleInSystem", false);
        result.put("canOpenSettings", true);
        return result;
    }

    private String getMicrophoneState() {
        PermissionState state = getPermissionState("microphone");
        if (state == PermissionState.GRANTED) {
            return "granted";
        }
        if (state == PermissionState.DENIED) {
            return "denied";
        }
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO)
                == PackageManager.PERMISSION_GRANTED) {
            return "granted";
        }
        if (getActivity() != null && shouldShowRequestPermissionRationale("microphone")) {
            return "prompt-with-rationale";
        }
        return "prompt";
    }
}

