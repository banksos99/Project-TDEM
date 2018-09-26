import { AppRegistry } from 'react-native';
import App from './App';
import bgMessaging from './constants/BgMessaging';
import SharedPreference from './SharedObject/SharedPreference';

AppRegistry.registerComponent('tdemconnect', () => App);

// New task registration
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging); // <-- Add this line
