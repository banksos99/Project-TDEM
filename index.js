import { AppRegistry } from 'react-native';
import App from './App';
import bgMessaging from './constants/BgMessaging';


AppRegistry.registerComponent('tdemconnect', () => App);

// New task registration
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging); // <-- Add this line
