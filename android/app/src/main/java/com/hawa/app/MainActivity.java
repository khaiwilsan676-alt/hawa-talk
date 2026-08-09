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
        
    }
}
