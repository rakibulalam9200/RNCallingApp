import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { MicroAvatar } from '../atoms/MicroAvatar';
import { MicroButton } from '../atoms/MicroButton';

interface IncomingCallCardProps {
  visible: boolean;
  callerName: string;
  roomName: string;
  isVideoCall?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallCard: React.FC<IncomingCallCardProps> = ({
  visible,
  callerName,
  roomName,
  isVideoCall = true,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.callTypeHeading}>
            {isVideoCall ? '📹 Incoming Video Call' : '📞 Incoming Audio Call'}
          </Text>

          <View style={styles.avatarWrapper}>
            <MicroAvatar name={callerName} size={84} isSpeaking />
          </View>

          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.roomSubtext}>Inviting you to {roomName}</Text>

          <View style={styles.actionsRow}>
            {/* Decline Button */}
            <View style={styles.actionCol}>
              <MicroButton
                icon="❌"
                label="Decline"
                variant="danger"
                size="large"
                onPress={onDecline}
              />
            </View>

            {/* Accept Button */}
            <View style={styles.actionCol}>
              <MicroButton
                icon="📞"
                label="Accept"
                variant="active"
                size="large"
                onPress={onAccept}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  callTypeHeading: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  avatarWrapper: {
    marginVertical: 12,
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  roomSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 32,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionCol: {
    alignItems: 'center',
  },
});

