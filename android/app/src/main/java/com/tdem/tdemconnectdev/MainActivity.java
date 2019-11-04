package com.tdem.tdemconnectdev;

import com.facebook.react.ReactActivity;
import com.burnweb.rnwebview.RNWebViewPackage;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */

//       @Override
//   protected List<ReactPackage> getPackages() {
//     return Arrays.<ReactPackage>asList(
//             new MainReactPackage(),
//             new RNWebViewPackage()); // <------ add this line to your MainActivity class
//   }
  
    @Override
    protected String getMainComponentName() {
        return "tdemconnect";
    }
}
