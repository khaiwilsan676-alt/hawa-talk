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
        try {
          Window window = getWindow();
          requestWindowFeature(Window.FEATURE_NO_TITLE);
          WindowCompat.setDecorFitsSystemWindows(window, false);
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.setStatusBarColor(Color.TRANSPARENT);
            window.setNavigationBarColor(Color.TRANSPARENT);
          }
        } catch (Throwable t) {
          t.printStackTrace();
        }

        // EdgeToEdge enable
        FullScreenManager.enableEdgeToEdge(this);
        super.onCreate(savedInstanceState);
    }
}
