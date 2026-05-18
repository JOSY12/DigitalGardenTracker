import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
 
// ─── XP TOAST ─────────────────────────────────────────────────────
export const XPToast = ({ amount, onDone }: { amount: number; onDone: () => void }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty      = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue:1, duration:200, useNativeDriver:true }),
        Animated.timing(ty,      { toValue:-12, duration:200, useNativeDriver:true }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(opacity, { toValue:0, duration:400, useNativeDriver:true }),
        Animated.timing(ty,      { toValue:-32, duration:400, useNativeDriver:true }),
      ]),
    ]).start(onDone);
  }, []);
  return (
    <Animated.View style={[toast.wrap, { opacity, transform:[{ translateY:ty }] }]}>
      <Text style={toast.text}>⚡ +{amount} XP</Text>
    </Animated.View>
  );
};
const toast = StyleSheet.create({
  wrap: { position:'absolute', top:76, alignSelf:'center', backgroundColor:'#7C3AED',
          paddingHorizontal:20, paddingVertical:9, borderRadius:99, zIndex:999,
          shadowColor:'#7C3AED', shadowOpacity:0.6, shadowRadius:12, elevation:10 },
  text: { color:'#fff', fontSize:15, fontFamily:'Outfit-Black' },
});