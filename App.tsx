import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LobbyTemplate } from './src/components/templates/LobbyTemplate';
import { CallRoomTemplate } from './src/components/templates/CallRoomTemplate';
import { IncomingCallCard } from './src/components/molecules/IncomingCallCard';
import { useCallStore } from './src/store/useCallStore';
import { useCallActions } from './src/hooks/useCallActions';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <MainAppNavigator />
    </SafeAreaProvider>
  );
}

function MainAppNavigator() {
  const status = useCallStore((s) => s.status);
  const { joinRoom } = useCallActions();

  // Simulated incoming 1-on-1 call modal state
  const [incomingCall, setIncomingCall] = useState<{
    visible: boolean;
    callerName: string;
    roomName: string;
  }>({
    visible: false,
    callerName: 'Sarah Jenkins',
    roomName: 'sarah-calling-you',
  });

  const handleAcceptIncomingCall = () => {
    const { roomName: targetRoom } = incomingCall;
    setIncomingCall((prev) => ({ ...prev, visible: false }));
    joinRoom(targetRoom, 'You');
  };

  const handleDeclineIncomingCall = () => {
    setIncomingCall((prev) => ({ ...prev, visible: false }));
  };

  return (
    <View style={styles.container}>
      {status === 'idle' ? (
        <LobbyTemplate
          onJoinRoom={(room, user, audioOnly) => {
            joinRoom(room, user, audioOnly);
          }}
          isLoading={status === 'connecting'}
        />
      ) : (
        <CallRoomTemplate />
      )}

      {/* Incoming Call Micro-Modal */}
      <IncomingCallCard
        visible={incomingCall.visible}
        callerName={incomingCall.callerName}
        roomName={incomingCall.roomName}
        onAccept={handleAcceptIncomingCall}
        onDecline={handleDeclineIncomingCall}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

export default App;
