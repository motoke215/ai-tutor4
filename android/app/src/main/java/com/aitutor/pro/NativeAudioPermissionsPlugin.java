package com.aitutor.pro;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;

@CapacitorPlugin(
    name = "NativeAudioPermissions",
    permissions = {
        @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "microphone")
    }
)
public class NativeAudioPermissionsPlugin extends Plugin {
    private TextToSpeech textToSpeech;
    private SpeechRecognizer speechRecognizer;
    private boolean ttsReady = false;
    private String pendingSpeechLang = "zh-CN";

    @Override
    public void load() {
        super.load();
        initTextToSpeech();
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject result = buildPermissionResult();
        result.put("ttsSupported", ttsReady);
        result.put("sttSupported", SpeechRecognizer.isRecognitionAvailable(getContext()));
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED
                || ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            call.resolve(buildPermissionResult());
            return;
        }

        if (getActivity() == null) {
            JSObject result = buildPermissionResult();
            result.put("microphone", "prompt");
            call.resolve(result);
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

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        String lang = call.getString("lang", "zh-CN");
        float rate = (float) call.getDouble("rate", 1.0);

        if (!ttsReady || textToSpeech == null) {
            call.reject("原生语音播报暂不可用");
            return;
        }

        Locale locale = langToLocale(lang);
        int result = textToSpeech.setLanguage(locale);
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            textToSpeech.setLanguage(Locale.CHINESE);
        }
        textToSpeech.setSpeechRate(rate);
        textToSpeech.setPitch(1.0f);

        String utteranceId = UUID.randomUUID().toString();
        textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId);

        JSObject resultObj = new JSObject();
        resultObj.put("started", true);
        call.resolve(resultObj);
    }

    @PluginMethod
    public void stopSpeak(PluginCall call) {
        if (textToSpeech != null) {
            textToSpeech.stop();
        }
        call.resolve();
    }

    @PluginMethod
    public void startListening(PluginCall call) {
        String lang = call.getString("lang", "zh-CN");
        pendingSpeechLang = lang;

        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissionForAlias("microphone", call, "startListeningAfterPermissionCallback");
            return;
        }

        startSpeechRecognition(call, lang);
    }

    @PluginMethod
    public void stopListening(PluginCall call) {
        if (speechRecognizer != null) {
            speechRecognizer.stopListening();
        }
        call.resolve();
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        if (call != null) {
            call.resolve(buildPermissionResult());
        }
    }

    @PermissionCallback
    private void startListeningAfterPermissionCallback(PluginCall call) {
        if (getPermissionState("microphone") != PermissionState.GRANTED
                && ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            call.reject("需要麦克风权限");
            return;
        }
        startSpeechRecognition(call, pendingSpeechLang);
    }

    private void startSpeechRecognition(PluginCall call, String lang) {
        try {
            if (!SpeechRecognizer.isRecognitionAvailable(getContext())) {
                call.reject("当前设备不支持原生语音识别");
                return;
            }

            if (speechRecognizer != null) {
                speechRecognizer.destroy();
            }

            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override
                public void onReadyForSpeech(Bundle params) {
                    notifyListeners("speechReady", new JSObject());
                }

                @Override
                public void onBeginningOfSpeech() {
                    notifyListeners("speechStart", new JSObject());
                }

                @Override
                public void onRmsChanged(float rmsdB) {
                    JSObject payload = new JSObject();
                    payload.put("volume", Math.max(0, Math.min(100, (int) ((rmsdB + 2) * 8))));
                    notifyListeners("speechVolume", payload);
                }

                @Override
                public void onBufferReceived(byte[] buffer) {}

                @Override
                public void onEndOfSpeech() {
                    notifyListeners("speechEnd", new JSObject());
                }

                @Override
                public void onError(int error) {
                    JSObject payload = new JSObject();
                    payload.put("message", mapSpeechError(error));
                    notifyListeners("speechError", payload);
                }

                @Override
                public void onResults(Bundle results) {
                    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    JSObject payload = new JSObject();
                    payload.put("text", matches != null && !matches.isEmpty() ? matches.get(0) : "");
                    notifyListeners("speechResult", payload);
                }

                @Override
                public void onPartialResults(Bundle partialResults) {
                    ArrayList<String> partial = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    JSObject payload = new JSObject();
                    payload.put("text", partial != null && !partial.isEmpty() ? partial.get(0) : "");
                    notifyListeners("speechPartial", payload);
                }

                @Override
                public void onEvent(int eventType, Bundle params) {}
            });

            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, localeTag(lang));
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, localeTag(lang));
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
            intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 500L);
            intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);

            speechRecognizer.startListening(intent);
            JSObject result = new JSObject();
            result.put("started", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("启动原生语音识别失败: " + e.getMessage());
        }
    }

    private void initTextToSpeech() {
        textToSpeech = new TextToSpeech(getContext(), status -> {
            if (status == TextToSpeech.SUCCESS) {
                ttsReady = true;
                textToSpeech.setLanguage(Locale.CHINESE);
                textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override
                    public void onStart(String utteranceId) {
                        notifyListeners("ttsStart", new JSObject());
                    }

                    @Override
                    public void onDone(String utteranceId) {
                        notifyListeners("ttsEnd", new JSObject());
                    }

                    @Override
                    public void onError(String utteranceId) {
                        JSObject payload = new JSObject();
                        payload.put("message", "原生语音播报失败");
                        notifyListeners("ttsError", payload);
                    }
                });
            }
        });
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
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            return "granted";
        }
        if (getActivity() != null && shouldShowRequestPermissionRationale("microphone")) {
            return "prompt-with-rationale";
        }
        return "prompt";
    }

    private Locale langToLocale(String lang) {
        if (lang == null) return Locale.CHINESE;
        switch (lang) {
            case "en-US": return Locale.US;
            case "en-GB": return Locale.UK;
            case "ja-JP": return Locale.JAPAN;
            case "ko-KR": return Locale.KOREA;
            case "fr-FR": return Locale.FRANCE;
            case "de-DE": return Locale.GERMANY;
            default: return Locale.CHINESE;
        }
    }

    private String localeTag(String lang) {
        Locale locale = langToLocale(lang);
        return locale.toLanguageTag();
    }

    private String mapSpeechError(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_NO_MATCH:
                return "没有识别到语音";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                return "语音超时";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                return "需要麦克风权限";
            case SpeechRecognizer.ERROR_NETWORK:
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                return "网络错误";
            default:
                return "识别错误(" + error + ")";
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
        super.handleOnDestroy();
    }
}
