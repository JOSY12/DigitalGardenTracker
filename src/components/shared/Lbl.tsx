import React from 'react';
import { Text } from 'react-native';
import { Theme } from '../../constants/theme';
 
export const Lbl = ({ T, children, mt = 0 }: { T: Theme; children: React.ReactNode; mt?: number }) => (
    <Text style={{ color:T.textMuted, fontSize:11, fontFamily:'Outfit-Bold', letterSpacing:0.8,
      textTransform:'uppercase', marginBottom:8, marginTop:mt }}>
      {children}
    </Text>
  );