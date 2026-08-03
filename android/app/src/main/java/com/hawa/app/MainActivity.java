package com.hawa.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        FullScreenManager.enableEdgeToEdge(this);
        super.onCreate(savedInstanceState);
    }
}
