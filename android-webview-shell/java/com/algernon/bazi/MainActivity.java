package com.algernon.bazi;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {
    private static final String APP_HOST = "appassets.androidplatform.net";
    private static final String APP_BASE_URL = "https://" + APP_HOST + "/index.html";

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        webView.setWebViewClient(new LocalAssetWebViewClient());

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMediaPlaybackRequiresUserGesture(false);

        setContentView(webView);
        webView.loadUrl(APP_BASE_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private class LocalAssetWebViewClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            return getAssetResponse(request.getUrl());
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            return getAssetResponse(Uri.parse(url));
        }

        private WebResourceResponse getAssetResponse(Uri uri) {
            if (!"https".equals(uri.getScheme()) || !APP_HOST.equals(uri.getHost())) {
                return null;
            }

            String path = uri.getPath();
            String assetPath = getAssetPath(path);
            if (assetPath == null) {
                return null;
            }

            if (assetPath.contains("..")) {
                return null;
            }

            try {
                InputStream inputStream = getAssets().open(assetPath);
                Map<String, String> headers = new HashMap<>();
                headers.put("Access-Control-Allow-Origin", "*");
                headers.put("Cache-Control", "no-cache");
                return new WebResourceResponse(
                        getMimeType(assetPath),
                        "UTF-8",
                        200,
                        "OK",
                        headers,
                        inputStream
                );
            } catch (IOException error) {
                return null;
            }
        }

        private String getAssetPath(String path) {
            if (path == null || "/".equals(path) || "/index.html".equals(path)) {
                return "www/index.html";
            }
            if (path.startsWith("/www/")) {
                return path.substring(1);
            }
            if (path.startsWith("/assets/")) {
                return "www" + path;
            }
            return null;
        }

        private String getMimeType(String path) {
            if (path.endsWith(".html")) {
                return "text/html";
            }
            if (path.endsWith(".js") || path.endsWith(".mjs")) {
                return "application/javascript";
            }
            if (path.endsWith(".css")) {
                return "text/css";
            }
            if (path.endsWith(".json")) {
                return "application/json";
            }
            if (path.endsWith(".svg")) {
                return "image/svg+xml";
            }
            if (path.endsWith(".png")) {
                return "image/png";
            }
            if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
                return "image/jpeg";
            }
            if (path.endsWith(".webp")) {
                return "image/webp";
            }
            if (path.endsWith(".woff")) {
                return "font/woff";
            }
            if (path.endsWith(".woff2")) {
                return "font/woff2";
            }
            return "application/octet-stream";
        }
    }
}
