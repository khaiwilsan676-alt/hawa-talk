package com.hawa.app;

import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.os.Build;
import android.graphics.Color;
import androidx.core.view.WindowCompat;
import androidx.core.content.ContextCompat; 
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // EdgeToEdge enable (keep existing helper)
        FullScreenManager.enableEdgeToEdge(this);
        super.onCreate(savedInstanceState);

        try {
          // Let the WebView draw behind system bars (status bar)
          WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.TRANSPARENT);
          }
        } catch (Throwable t) {
          // ignore if any device specific issue
          t.printStackTrace();
        }
    }
}
