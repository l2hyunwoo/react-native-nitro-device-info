# Play Integrity API — keep classes referenced reflectively by the SDK so R8
# in consumer release builds does not strip them.
-keep class com.google.android.play.core.integrity.** { *; }
-keep class com.google.android.play.integrity.** { *; }
-dontwarn com.google.android.play.integrity.**
