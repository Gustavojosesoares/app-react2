import { registerRootComponent } from 'expo';

import App from './App';

// Isso garante que o app funcione tanto no Expo Go quanto em builds nativas
registerRootComponent(App);
