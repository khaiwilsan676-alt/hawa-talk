package com.hawa.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // Draw the web content behind the status bar so the blue home header
        // reaches the very top of the APK instead of leaving a white strip.
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        // Ensure system bars are properly managed using WindowInsetsControllerCompat (modern API).
        WindowInsetsControllerCompat insetsController =
            new WindowInsetsControllerCompat(window, window.getDecorView());

        // Ensure status bar is shown and light text is rendered if needed
        insetsController.show(WindowInsetsCompat.Type.statusBars());

        // Fallback for older Android versions: use layout stable to make sure it occupies top space
        // We remove FLAG_FULLSCREEN to keep status bar visible.

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attributes = window.getAttributes();
            attributes.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(attributes);
        }

        // Keep layout flags so content is laid out edge-to-edge. Do not include
        // SYSTEM_UI_FLAG_FULLSCREEN here because we've chosen the WindowInsets API.
        window.getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        );
    }
}
