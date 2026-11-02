import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { MicroButton } from '../atoms/MicroButton';

interface ControlBarProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  isSpeakerOn: boolean;
  unreadChatCount?: number;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onFlipCamera: () => void;
  onToggleSpeaker: () => void;
  onToggleChat: () => void;
  onHangUp: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isMuted,
  isVideoEnabled,
  isScreenSharing,
  isChatOpen,
  isSpeakerOn,
  unreadChatCount = 0,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onFlipCamera,
  onToggleSpeaker,
  onToggleChat,
  onHangUp,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Microphone Toggle */}
        <MicroButton
          icon={isMuted ? '🔇' : '🎙️'}
          label={isMuted ? 'Unmute' : 'Mute'}
          variant={isMuted ? 'danger' : 'neutral'}
          onPress={onToggleMic}
        />

        {/* Video Camera Toggle */}
        <MicroButton
          icon={isVideoEnabled ? '📹' : '🚫'}
          label={isVideoEnabled ? 'Cam On' : 'Cam Off'}
          variant={!isVideoEnabled ? 'danger' : 'neutral'}
          onPress={onToggleVideo}
        />

        {/* Screen Share (Android MediaProjection) */}
        <MicroButton
          icon={isScreenSharing ? '🛑' : '📲'}
          label={isScreenSharing ? 'Stop Share' : 'Share'}
          variant={isScreenSharing ? 'warning' : 'neutral'}
          active={isScreenSharing}
          onPress={onToggleScreenShare}
        />

        {/* Flip Camera */}
        {isVideoEnabled && (
          <MicroButton
            icon="🔄"
            label="Flip"
            variant="neutral"
            onPress={onFlipCamera}
          />
        )}

        {/* Speakerphone Toggle */}
        <MicroButton
          icon={isSpeakerOn ? '🔊' : '🔈'}
          label={isSpeakerOn ? 'Speaker' : 'Earpiece'}
          variant="neutral"
          onPress={onToggleSpeaker}
        />

        {/* In-Call Text Chat */}
        <MicroButton
          icon="💬"
          label={unreadChatCount > 0 ? `Chat (${unreadChatCount})` : 'Chat'}
          variant={isChatOpen ? 'primary' : 'neutral'}
          onPress={onToggleChat}
        />

        {/* Hang Up Button */}
        <MicroButton
          icon="📞"
          label="Leave"
          variant="danger"
          size="medium"
          onPress={onHangUp}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 30,
    marginHorizontal: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});

