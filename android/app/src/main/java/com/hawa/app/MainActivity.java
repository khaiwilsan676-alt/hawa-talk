package com.hawa.app;

import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.content.ContextCompat; 
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // EdgeToEdge enable
        FullScreenManager.enableEdgeToEdge(this);
        super.onCreate(savedInstanceState);
        
        // Status bar ka color #60a5fa kar do - tere CSS wala blue
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(ContextCompat.getColor(this, R.color.statusbar_blue));
    }
}
