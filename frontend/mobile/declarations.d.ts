declare module "react-native-maps" {
  import React from "react";
  import { ViewStyle, StyleProp } from "react-native";

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface MarkerProps {
    coordinate: { latitude: number; longitude: number };
    onPress?: () => void;
    children?: React.ReactNode;
    key?: string | number;
  }

  export interface MapViewProps {
    style?: StyleProp<ViewStyle>;
    provider?: string | null;
    region?: Region;
    onRegionChangeComplete?: (region: Region) => void;
    showsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    customMapStyle?: object[];
    children?: React.ReactNode;
  }

  export class MapView extends React.Component<MapViewProps> {
    animateToRegion(region: Region, duration?: number): void;
  }

  export class Marker extends React.Component<MarkerProps> {}

  export const PROVIDER_DEFAULT: null;

  export default MapView;
}
