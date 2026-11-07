"use client";

import dynamic from "next/dynamic";

/*
 * The 3D scenes, each split into its own chunk with three.js and loaded in the
 * browser only. Render them through <Stage3D>.
 */
export const HeroRobotScene = dynamic(() => import("./HeroRobot3D"), { ssr: false });
export const FooterRobotScene = dynamic(() => import("./FooterRobot3D"), { ssr: false });
export const DevAndroidScene = dynamic(() => import("./DevAndroid3D"), { ssr: false });
