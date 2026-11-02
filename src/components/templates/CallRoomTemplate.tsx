import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { CallParticipant, ChatMessage } from '../../types/call';
import { StatusIndicator } from '../atoms/StatusIndicator';
import { ControlBar } from '../molecules/ControlBar';
import { VideoGrid } from '../organisms/VideoGrid';
import { ScreenShareViewer } from '../organisms/ScreenShareViewer';
import { ChatDrawer } from '../organisms/ChatDrawer';

interface CallRoomTemplateProps {
  roomName: string;
  duration: string;
  participants: CallParticipant[];
  activeSpeakerIdentity?: string;
  screenSharer?: CallParticipant;
  screenShareTrack?: any;
  messages: ChatMessage[];
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isSpeakerOn: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onFlipCamera: () => void;
  onToggleSpeaker: () => void;
  onSendMessage: (text: string) => void;
  onLeaveCall: () => void;
}

export const CallRoomTemplate: React.FC<CallRoomTemplateProps> = ({
  roomName,
  duration,
  participants,
  activeSpeakerIdentity,
  screenSharer,
  screenShareTrack,
  messages,
  isMuted,
  isVideoEnabled,
  isScreenSharing,
  isSpeakerOn,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onFlipCamera,
  onToggleSpeaker,
  onSendMessage,
  onLeaveCall,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastReadMessageCount, setLastReadMessageCount] = useState(0);

  const unreadCount = isChatOpen
    ? 0
    : Math.max(0, messages.length - lastReadMessageCount);

  const handleToggleChat = () => {
    if (!isChatOpen) {
      setLastReadMessageCount(messages.length);
    }
    setIsChatOpen(!isChatOpen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <StatusIndicator
            roomName={roomName}
            duration={duration}
            participantCount={participants.length}
          />
        </View>

        {/* Center Calling Area: Screen Share or Adaptive Video Grid */}
        <View style={styles.contentArea}>
          {screenSharer ? (
            <ScreenShareViewer
              sharer={screenSharer}
              track={screenShareTrack}
            />
          ) : (
            <VideoGrid
              participants={participants}
              activeSpeakerIdentity={activeSpeakerIdentity}
            />
          )}
        </View>

        {/* Floating Control Action Bar */}
        <View style={styles.bottomControls}>
          <ControlBar
            isMuted={isMuted}
            isVideoEnabled={isVideoEnabled}
            isScreenSharing={isScreenSharing}
            isChatOpen={isChatOpen}
            isSpeakerOn={isSpeakerOn}
            unreadChatCount={unreadCount}
            onToggleMic={onToggleMic}
            onToggleVideo={onToggleVideo}
            onToggleScreenShare={onToggleScreenShare}
            onFlipCamera={onFlipCamera}
            onToggleSpeaker={onToggleSpeaker}
            onToggleChat={handleToggleChat}
            onHangUp={onLeaveCall}
          />
        </View>

        {/* In-Call Real-Time Chat Drawer */}
        <ChatDrawer
          visible={isChatOpen}
          messages={messages}
          onSendMessage={onSendMessage}
          onClose={() => setIsChatOpen(false)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  headerBar: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  contentArea: {
    flex: 1,
    marginVertical: 4,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
});

