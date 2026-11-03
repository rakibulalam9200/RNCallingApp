import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallStore } from '../../store/useCallStore';
import { useChatStore } from '../../store/useChatStore';
import { useAIStore } from '../../store/useAIStore';
import { useCallActions } from '../../hooks/useCallActions';
import { useCallTimer } from '../../hooks/useCallTimer';

import { StatusIndicator } from '../atoms/StatusIndicator';
import { AIAssistantPill } from '../molecules/AIAssistantPill';
import { ReactionPicker } from '../molecules/ReactionPicker';
import { ControlBar } from '../molecules/ControlBar';
import { VideoGrid } from '../organisms/VideoGrid';
import { ScreenShareViewer } from '../organisms/ScreenShareViewer';
import { ChatDrawer } from '../organisms/ChatDrawer';
import { FloatingReactionsOverlay } from '../organisms/FloatingReactionsOverlay';

export const CallRoomTemplate: React.FC = () => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const insets = useSafeAreaInsets();

  // Zustand State Selectors (High-performance granular subscription)
  const roomName = useCallStore((s) => s.roomName);
  const status = useCallStore((s) => s.status);
  const participants = useCallStore((s) => s.participants);
  const activeSpeakerId = useCallStore((s) => s.activeSpeakerId);
  const screenSharer = useCallStore((s) => s.screenSharer);
  const screenShareTrack = useCallStore((s) => s.screenShareTrack);
  const isMuted = useCallStore((s) => s.isMuted);
  const isVideoEnabled = useCallStore((s) => s.isVideoEnabled);
  const isScreenSharing = useCallStore((s) => s.isScreenSharing);
  const isSpeakerOn = useCallStore((s) => s.isSpeakerOn);
  const callType = useCallStore((s) => s.callType);

  const messages = useChatStore((s) => s.messages);
  const floatingReactions = useChatStore((s) => s.floatingReactions);
  const isChatOpen = useChatStore((s) => s.isChatOpen);
  const unreadCount = useChatStore((s) => s.unreadCount);
  const setChatOpen = useChatStore((s) => s.setChatOpen);
  const removeFloatingReaction = useChatStore((s) => s.removeFloatingReaction);

  const aiStatus = useAIStore((s) => s.status);
  const isAIEnabled = useAIStore((s) => s.isEnabled);
  const toggleAIAssistant = useAIStore((s) => s.toggleAIAssistant);

  // Actions
  const {
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    flipCamera,
    toggleSpeaker,
    sendMessage,
    sendReaction,
    leaveRoom,
  } = useCallActions();

  const { formattedDuration } = useCallTimer(status === 'connected');

  const handleSelectReaction = (emoji: string) => {
    sendReaction(emoji);
    setShowReactionPicker(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Header Bar: Status Indicator + AI Assistant Pill */}
      <View
        style={[
          styles.headerBar,
          { paddingTop: Math.max(insets.top, 12) },
        ]}
      >
        <StatusIndicator
          roomName={roomName}
          duration={formattedDuration}
          participantCount={participants.length}
        />
        {callType === 'group' && (
          <AIAssistantPill
            status={aiStatus}
            isEnabled={isAIEnabled}
            onToggle={toggleAIAssistant}
          />
        )}
      </View>

      {/* Center Calling Area: Screen Share or Adaptive Video Grid */}
      <View
        style={[
          styles.contentArea,
          { marginBottom: 84 + insets.bottom },
        ]}
      >
        {screenSharer ? (
          <ScreenShareViewer
            sharer={screenSharer}
            track={screenShareTrack}
          />
        ) : (
          <VideoGrid
            participants={participants}
            activeSpeakerIdentity={activeSpeakerId}
            callType={callType}
          />
        )}
      </View>

      {/* Floating Reactions Overlay (Hearts, Claps, Thumbs up flying across screen) */}
      <FloatingReactionsOverlay
        reactions={floatingReactions}
        onAnimationComplete={removeFloatingReaction}
      />

      {/* Reaction Picker Popover */}
      {showReactionPicker && (
        <View
          style={[
            styles.reactionPickerContainer,
            { bottom: 95 + insets.bottom },
          ]}
        >
          <ReactionPicker onSelectEmoji={handleSelectReaction} />
        </View>
      )}

      {/* Reaction Trigger Button (Quick emoji launcher) */}
      <TouchableOpacity
        style={[
          styles.reactionTriggerBtn,
          { bottom: 85 + insets.bottom },
        ]}
        activeOpacity={0.8}
        onPress={() => setShowReactionPicker(!showReactionPicker)}
      >
        <Text style={styles.reactionTriggerText}>
          {showReactionPicker ? '✕' : '💖'}
        </Text>
      </TouchableOpacity>

      {/* Floating Control Action Bar */}
      <View
        style={[
          styles.bottomControls,
          { bottom: insets.bottom },
        ]}
      >
        <ControlBar
          isMuted={isMuted}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          isChatOpen={isChatOpen}
          isSpeakerOn={isSpeakerOn}
          unreadChatCount={unreadCount}
          onToggleMic={toggleMic}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onFlipCamera={flipCamera}
          onToggleSpeaker={toggleSpeaker}
          onToggleChat={() => setChatOpen(!isChatOpen)}
          onHangUp={leaveRoom}
        />
      </View>

      {/* In-Call Real-Time Chat Drawer */}
      <ChatDrawer
        visible={isChatOpen}
        messages={messages}
        onSendMessage={sendMessage}
        onClose={() => setChatOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 10,
  },
  contentArea: {
    flex: 1,
    marginVertical: 4,
  },
  reactionPickerContainer: {
    position: 'absolute',
    bottom: 95,
    alignSelf: 'center',
    zIndex: 35,
  },
  reactionTriggerBtn: {
    position: 'absolute',
    right: 16,
    bottom: 85,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 30,
    elevation: 5,
  },
  reactionTriggerText: {
    fontSize: 20,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
});
