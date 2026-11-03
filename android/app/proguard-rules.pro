# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# WebRTC / LiveKit / InCallManager ProGuard & R8 Keep Rules for Release AAB/APK
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**

-keep class livekit.org.webrtc.** { *; }
-dontwarn livekit.org.webrtc.**

-keep class com.oney.WebRTCModule.** { *; }
-dontwarn com.oney.WebRTCModule.**

-keep class io.livekit.** { *; }
-dontwarn io.livekit.**

-keep class com.livekit.reactnative.** { *; }
-dontwarn com.livekit.reactnative.**

-keep class com.zmxv.RNSound.** { *; }
-dontwarn com.zmxv.RNSound.**

-keep class com.twiliorn.library.** { *; }
-dontwarn com.twiliorn.library.**

-keepattributes InnerClasses
-keepattributes *Annotation*
-keepattributes Signature

